import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@repo/db";
import crypto from "crypto";

// The Chaos Engine: 3 outcomes
type ChaosOutcome = "SUCCESS" | "BANK_REJECTED" | "NETWORK_CRASH";

function rollChaos(): ChaosOutcome {
  const roll = Math.random();
  if (roll < 0.5) return "SUCCESS";         // 50% happy path
  if (roll < 0.75) return "BANK_REJECTED";  // 25% clean failure
  return "NETWORK_CRASH";                    // 25% network crash
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { token, amount, pin, signature } = body;

    if (!token || !amount || !pin || !signature) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // 0. Re-verify HMAC Signature (defense against Postman/curl attacks)
    // In real life, the bank does NOT share a DB with the wallet.
    // The signature is the ONLY proof that (token, amount) came from the wallet app.
    const secret = process.env.BANK_WEBHOOK_SECRET;
    if (!secret) {
      return NextResponse.json(
        { error: "Bank configuration error" },
        { status: 500 }
      );
    }

    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(`${token}:${amount}`)
      .digest("hex");

    if (signature !== expectedSignature) {
      console.error(`[Mock Bank] ❌ HMAC mismatch on /api/authorize for token ${token}`);
      return NextResponse.json(
        { error: "Invalid signature — request rejected" },
        { status: 403 }
      );
    }

    // 1. Find the PENDING transaction by token
    const transaction = await prisma.transaction.findUnique({
      where: { token },
      include: { bankAccount: true },
    });

    if (!transaction || transaction.status !== "PENDING") {
      return NextResponse.json(
        { error: "Invalid or already processed transaction" },
        { status: 400 }
      );
    }

    if (!transaction.bankAccount) {
      return NextResponse.json(
        { error: "No bank account linked to this transaction" },
        { status: 400 }
      );
    }

    const accountNumber = transaction.bankAccount.accountNo;
    const amountInPaise = transaction.amount; // Already stored in paise

    // 2. Verify PIN against MockBankLedger
    const ledger = await prisma.mockBankLedger.findUnique({
      where: { accountNumber },
    });

    if (!ledger) {
      return NextResponse.json(
        { error: "Bank account not found in bank ledger" },
        { status: 404 }
      );
    }

    // Simple PIN check (in real life this would be bcrypt)
    // Our seed uses "1234-hash" as pinHash, so PIN is "1234"
    if (pin !== "1234") {
      return NextResponse.json(
        { error: "Incorrect PIN. Please try again." },
        { status: 401 }
      );
    }

    // 3. Roll the chaos engine
    const outcome = rollChaos();
    console.log(`[Mock Bank] Chaos Engine rolled: ${outcome} for token ${token}`);

    if (outcome === "BANK_REJECTED") {
      // Outcome B: Clean Failure - No money moves
      await prisma.transaction.update({
        where: { id: transaction.id },
        data: {
          status: "FAILED",
          failureReason: "Bank rejected: Risk flag triggered",
          updatedAt: new Date(),
        },
      });

      return NextResponse.json({
        outcome: "BANK_REJECTED",
        message: "Transaction rejected by bank due to a risk flag.",
      });
    }

    // Outcomes A & C both require deducting money and locking the ledger
    // Use a raw transaction with pessimistic locking
    const result = await prisma.$transaction(async (tx) => {
      // LOCK 1: Pessimistic Row Lock on MockBankLedger
      const lockedRows = await tx.$queryRaw<any[]>`
        SELECT * FROM "MockBankLedger"
        WHERE "accountNumber" = ${accountNumber}
        FOR UPDATE
      `;

      if (lockedRows.length === 0) {
        throw new Error("Bank account not found");
      }

      const lockedLedger = lockedRows[0];

      // Balance Check
      if (lockedLedger.bankBalance < amountInPaise) {
        // Insufficient funds - fail the transaction
        await tx.$executeRaw`
          UPDATE "Transaction"
          SET status = 'FAILED', "failureReason" = 'Insufficient bank balance', "updatedAt" = NOW()
          WHERE id = ${transaction.id}
        `;
        return { insufficientFunds: true };
      }

      // Deduct from MockBankLedger
      await tx.$executeRaw`
        UPDATE "MockBankLedger"
        SET "bankBalance" = "bankBalance" - ${amountInPaise}
        WHERE "accountNumber" = ${accountNumber}
      `;

      // Log in idempotency table
      await tx.$executeRaw`
        INSERT INTO "IdempotencyKey" (id, key, "responsePayload", "createdAt")
        VALUES (gen_random_uuid(), ${token}, ${JSON.stringify({ outcome, amount: amountInPaise })}::jsonb, NOW())
        ON CONFLICT (key) DO NOTHING
      `;

      return { insufficientFunds: false };
    });

    if (result.insufficientFunds) {
      return NextResponse.json({
        outcome: "INSUFFICIENT_FUNDS",
        message: "Insufficient balance in your bank account.",
      });
    }

    // At this point money is deducted from bank. Now handle outcomes A vs C.
    if (outcome === "SUCCESS") {
      // Outcome A: Happy Path - Send webhook to wallet-app
      const secret = process.env.BANK_WEBHOOK_SECRET;
      if (!secret) {
        console.error("[Mock Bank] BANK_WEBHOOK_SECRET not configured");
        // Money deducted but can't sign webhook. Treat as network crash.
        return NextResponse.json({
          outcome: "NETWORK_CRASH",
          message: "Payment processed but bank encountered an internal error.",
        });
      }

      // Generate HMAC signature for the webhook payload
      const webhookPayload = {
        token: transaction.token,
        status: "SUCCESS",
      };

      const webhookSignature = crypto
        .createHmac("sha256", secret)
        .update(JSON.stringify(webhookPayload))
        .digest("hex");

      // Dispatch webhook to webhook-handler
      const webhookUrl = process.env.WEBHOOK_HANDLER_URL || "http://localhost:3002/webhook";
      
      try {
        const webhookResponse = await fetch(webhookUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-bank-signature": webhookSignature,
          },
          body: JSON.stringify(webhookPayload),
        });

        if (webhookResponse.ok) {
          console.log(`[Mock Bank] ✅ Webhook delivered for token ${token}`);
        } else {
          console.error(`[Mock Bank] ⚠️ Webhook returned non-OK: ${webhookResponse.status}`);
        }
      } catch (err) {
        console.error(`[Mock Bank] ❌ Webhook delivery failed:`, err);
      }

      return NextResponse.json({
        outcome: "SUCCESS",
        message: "Payment authorized successfully!",
      });
    }

    // Outcome C: Network Crash - Money deducted, webhook NOT sent
    console.log(`[Mock Bank] 💥 NETWORK CRASH simulated for token ${token}. Webhook skipped.`);
    
    // Mark transaction as PROCESSING (money left bank but webhook never arrived)
    await prisma.transaction.update({
      where: { id: transaction.id },
      data: {
        status: "PROCESSING",
        lastAttemptAt: new Date(),
        attemptCount: { increment: 1 },
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      outcome: "NETWORK_CRASH",
      message: "Payment processed but bank encountered a network error.",
    });
  } catch (error: any) {
    console.error("[Mock Bank] Authorization error:", error.message);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
