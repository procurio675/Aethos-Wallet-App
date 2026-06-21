import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@repo/db";
import crypto from "crypto";

// The Chaos Engine: 3 outcomes
type ChaosOutcome = "SUCCESS" | "BANK_REJECTED" | "NETWORK_CRASH";

function rollChaos(): ChaosOutcome {
  const roll = Math.random();
  if (roll < 0.5) return "SUCCESS";         // 50% happy path
  if (roll < 0.75) return "BANK_REJECTED";  // 25% clean failure
  return "NETWORK_CRASH";                   // 25% ambiguous timeout/crash
}

export async function POST(req: NextRequest) {
  try {
    // 1. HMAC Verification (Anti-Hijack)
    // We read the raw text exactly as it was sent over the wire to guarantee identical hashes.
    const bodyText = await req.text();
    const secret = process.env.BANK_WEBHOOK_SECRET;

    if (!secret) {
      return NextResponse.json({ error: "Bank configuration error" }, { status: 500 });
    }

    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(bodyText)
      .digest("hex");

    const headerSignature = req.headers.get("x-sweeper-signature");
    if (!headerSignature || headerSignature !== expectedSignature) {
      console.error(`[Mock Bank Payout] ❌ HMAC mismatch. Expected: ${expectedSignature}, Got: ${headerSignature}`);
      return NextResponse.json({ error: "Unauthorized: Invalid signature" }, { status: 401 });
    }

    // Parse the validated JSON payload
    const body = JSON.parse(bodyText);
    const { token, amount, accountNumber } = body;

    if (!token || !amount || !accountNumber) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 2. Idempotency Check
    const idempotencyKey = req.headers.get("idempotency-key");
    if (!idempotencyKey) {
      return NextResponse.json({ error: "Missing Idempotency-Key header" }, { status: 400 });
    }

    const existingRecord = await prisma.idempotencyKey.findUnique({
      where: { key: idempotencyKey }
    });

    if (existingRecord) {
      console.log(`[Mock Bank Payout] 🔁 Idempotency match: returning cached response for key ${idempotencyKey}`);
      const cachedResponse = existingRecord.responsePayload as { status: number; body: any };
      return NextResponse.json(cachedResponse.body, { status: cachedResponse.status });
    }

    // 3. Roll Chaos Engine
    const outcome = rollChaos();
    console.log(`[Mock Bank Payout] Chaos Engine rolled: ${outcome} for token ${token}`);

    if (outcome === "BANK_REJECTED") {
      // Outcome B: The Clean Bank Rejection
      // Account might be "frozen" or "invalid". No money is added.
      // We don't need to log this in the idempotency table because the Sweeper 
      // will instantly mark the transaction as FAILED and never retry it.
      return NextResponse.json(
        { error: "Bank rejected the request" }, 
        { status: 400 }
      );
    }

    // For SUCCESS and NETWORK_CRASH, money is successfully deposited into the bank account
    let resultPayload: { status: number; body: any };

    try {
      await prisma.$transaction(async (tx) => {
        // LOCK 3 (The Bank Ledger Lock): Pessimistic Row Lock
        const ledgerRows = await tx.$queryRaw<any[]>`
          SELECT * FROM "MockBankLedger"
          WHERE "accountNumber" = ${accountNumber}
          FOR UPDATE
        `;

        if (ledgerRows.length === 0) {
          throw new Error("ACCOUNT_NOT_FOUND");
        }

        // Add funds to the MockBankLedger
        await tx.$executeRaw`
          UPDATE "MockBankLedger"
          SET "bankBalance" = "bankBalance" + ${amount}
          WHERE "accountNumber" = ${accountNumber}
        `;

        // Determine the cached response
        // Note: Even if we crash (Outcome C), a subsequent retry will receive a SUCCESS response!
        resultPayload = {
          status: 200,
          body: { message: "Payout successful" }
        };

        // Log to idempotency table
        await tx.idempotencyKey.create({
          data: {
            key: idempotencyKey,
            responsePayload: resultPayload
          }
        });
      });
    } catch (err: any) {
      if (err.message === "ACCOUNT_NOT_FOUND") {
        return NextResponse.json({ error: "Bank account not found" }, { status: 404 });
      }
      throw err;
    }

    // 4. Return Output based on Chaos Outcome
    if (outcome === "SUCCESS") {
      // Outcome A: Happy Path
      return NextResponse.json(resultPayload!.body, { status: resultPayload!.status });
    } else {
      // Outcome C: The Ambiguous Timeout
      // Money was added, idempotency logged, but connection abruptly drops/crashes
      console.log(`[Mock Bank Payout] 💥 NETWORK CRASH simulated for token ${token}. Throwing 500 server error.`);
      return NextResponse.json({ error: "Internal bank error" }, { status: 500 });
    }

  } catch (error: any) {
    console.error("[Mock Bank Payout] Error processing payout:", error.message);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
