import { prisma } from "@repo/db";
import "dotenv/config";
import crypto from "crypto";

const POLL_INTERVAL = parseInt(process.env.POLL_INTERVAL_MS || "5000", 10);
const MOCK_BANK_URL = process.env.MOCK_BANK_URL || "http://localhost:3001";

async function processWithdrawalQueue() {
  try {
    let transactionData: any = null;
    let bankAccountNo: string = "";

    // STEP 1: Fast, locked DB transaction to grab the row and mark it PROCESSING
    await prisma.$transaction(async (tx) => {
      // LOCK 2 (The Queue Lock): SELECT ... FOR UPDATE SKIP LOCKED
      // This guarantees that if you scale to 5 Sweeper servers,
      // two servers will never grab the same payout job.
      // Also safely re-claims "zombie" rows stuck in PROCESSING for >2 minutes.
      const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);
      const rows = await tx.$queryRaw<any[]>`
        SELECT t.*, ba."accountNo" AS "bankAccountNo"
        FROM "Transaction" t
        LEFT JOIN "BankAccount" ba ON t."bankAccountId" = ba.id
        WHERE t.type = 'WITHDRAWAL'::"TransactionType"
        AND t.token IS NOT NULL
        AND (
          t.status = 'PENDING'::"TransactionStatus"
          OR (t.status = 'PROCESSING'::"TransactionStatus" AND t."lastAttemptAt" < ${twoMinutesAgo}::timestamp)
        )
        ORDER BY t."createdAt" ASC
        LIMIT 1
        FOR UPDATE OF t SKIP LOCKED
      `;

      if (rows.length === 0) return;

      const transaction = rows[0];
      transactionData = transaction;
      bankAccountNo = transaction.bankAccountNo || "";

      console.log(`[Sweeper] Found withdrawal: ${transaction.id} (Status: ${transaction.status}, Token: ${transaction.token})`);

      // State Shift: Mark as PROCESSING immediately so other sweepers ignore it
      // while we make the slow network call
      await tx.transaction.update({
        where: { id: transaction.id },
        data: {
          status: 'PROCESSING',
          lastAttemptAt: new Date(),
          attemptCount: { increment: 1 }
        }
      });
    });

    // If no row found, exit
    if (!transactionData) return;

    // STEP 2: The HMAC Signature & Dispatch — happens OUTSIDE the DB transaction.
    // No database locks are held during this slow network call!
    const secret = process.env.BANK_WEBHOOK_SECRET;
    if (!secret) {
      console.error("[Sweeper] BANK_WEBHOOK_SECRET is not configured. Cannot sign payout request.");
      return;
    }

    if (!bankAccountNo) {
      console.error(`[Sweeper] No bank account number found for transaction ${transactionData.id}`);
      return;
    }

    // Build the payout payload
    const payload = {
      token: transactionData.token,
      amount: Number(transactionData.amount),
      accountNumber: bankAccountNo,
    };

    const payloadString = JSON.stringify(payload);

    // The HMAC Signature: Proves the sweeper's identity to the bank,
    // just like the webhook signature proves the bank's identity to us.
    const signature = crypto
      .createHmac("sha256", secret)
      .update(payloadString)
      .digest("hex");

    // The Dispatch: Fire HTTP POST to the Mock Bank's /api/payout endpoint
    let bankSuccess = false;
    try {
      console.log(`[Sweeper] Dispatching payout for ${transactionData.token} to ${MOCK_BANK_URL}/api/payout`);
      const response = await fetch(`${MOCK_BANK_URL}/api/payout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": transactionData.token,   // Prevents duplicate payouts if sweeper retries
          "x-sweeper-signature": signature,            // HMAC proof of identity
        },
        body: payloadString,
      });
      bankSuccess = response.ok;

      if (!bankSuccess) {
        const errorBody = await response.text();
        console.error(`[Sweeper] Bank returned ${response.status} for ${transactionData.token}: ${errorBody}`);

        // Phase 3: Chaos Engine handling (Outcome C)
        // If it's a 500 server crash, throw an error to hit the catch block below.
        // This keeps the transaction in PROCESSING and avoids refunding the user.
        if (response.status >= 500) {
          throw new Error(`Bank returned server crash status ${response.status}`);
        }
      }
    } catch (e) {
      console.error(`[Sweeper] External bank call failed for ${transactionData.id}`, e);
      // Timeout/Network error. Leave status as PROCESSING.
      // The zombie check query will pick it up again in 2 minutes.
      return;
    }

    // STEP 3: Second fast DB transaction to apply the final state
    await prisma.$transaction(async (tx) => {
      if (bankSuccess) {
        await tx.$executeRaw`
          UPDATE "Transaction"
          SET status = 'SUCCESS', "updatedAt" = NOW()
          WHERE id = ${transactionData.id}
        `;
        console.log(`[Sweeper] ✅ Withdrawal ${transactionData.id} succeeded.`);
      } else {
        // Explicit bank rejection → Fail transaction & refund user
        await tx.$executeRaw`
          UPDATE "Transaction"
          SET status = 'FAILED', "failureReason" = 'Bank rejected withdrawal', "updatedAt" = NOW()
          WHERE id = ${transactionData.id}
        `;

        await tx.$executeRaw`
          UPDATE "User"
          SET "walletBalance" = "walletBalance" + ${transactionData.amount}
          WHERE id = ${transactionData.senderId}
        `;
        console.log(`[Sweeper] ❌ Withdrawal ${transactionData.id} failed. Refunded ₹${Number(transactionData.amount) / 100} to user.`);
      }
    });

  } catch (error: any) {
    console.error("[Sweeper] Error processing withdrawal:", error.message);
  }
}

async function reconcileOrphanedDeposits() {
  try {
    let transactionData: any = null;

    console.log(`[Sweeper Debug] Searching for stuck DEPOSIT transactions...`);
    // STEP 1: Fast DB transaction to lock, extract data, and mark PROCESSING
    await prisma.$transaction(async (tx) => {
      // LOCK 2: The Transaction Lock
      console.log(`[Sweeper Debug] Executing SKIP LOCKED query...`);
      const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);
      const rows = await tx.$queryRaw<any[]>`
        SELECT * FROM "Transaction"
        WHERE type = 'DEPOSIT'::"TransactionType"
        AND token IS NOT NULL
        AND (
          (status = 'PENDING'::"TransactionStatus" AND "createdAt" < ${twoMinutesAgo}::timestamp)
          OR (status = 'PROCESSING'::"TransactionStatus" AND "lastAttemptAt" < ${twoMinutesAgo}::timestamp)
        )
        ORDER BY "createdAt" ASC
        LIMIT 1
        FOR UPDATE SKIP LOCKED
      `;

      console.log(`[Sweeper Debug] Found ${rows.length} rows. ID: ${rows[0]?.id}, Token: ${rows[0]?.token}`);
      if (rows.length === 0) return;
      const transaction = rows[0];

      if (!transaction.token) {
        console.log(`[Sweeper Debug] No token for transaction ${transaction.id}, returning.`);
        return;
      }

      transactionData = transaction;

      console.log(`[Sweeper] Reconciling stuck deposit: ${transaction.id} (Token: ${transaction.token})`);

      // Mark as processing so other sweeps ignore it
      await tx.transaction.update({
        where: { id: transaction.id },
        data: {
          status: 'PROCESSING',
          lastAttemptAt: new Date(),
          attemptCount: { increment: 1 }
        }
      });
    });

    if (!transactionData) return;

    // STEP 2: Slow network call happens entirely OUTSIDE the DB transaction!
    console.log(`[Sweeper Debug] Preparing to fetch bank status for ${transactionData.token}...`);
    const secret = process.env.SWEEPER_SECRET;
    if (!secret) {
      console.error("[Sweeper] SWEEPER_SECRET is not configured");
      return;
    }

    let bankStatusResponse = null;
    try {
      const response = await fetch(`${MOCK_BANK_URL}/api/transaction-status/${transactionData.token}`, {
        headers: {
          "Authorization": `Bearer ${secret}`
        }
      });

      console.log(`[Sweeper Debug] Bank responded with HTTP ${response.status}`);

      if (response.status === 404) {
        bankStatusResponse = 'NOT_FOUND';
      } else if (response.ok) {
        const data = await response.json();
        bankStatusResponse = data.status; // 'SUCCESS'
      } else {
        console.error(`[Sweeper] Mock bank returned ${response.status}. Retrying later.`);
        return;
      }
    } catch (e) {
      console.error(`[Sweeper] Failed to reach bank for reconciliation ${transactionData.id}`);
      return;
    }

    // STEP 3: Second fast DB transaction to apply the resolution
    console.log(`[Sweeper Debug] Bank status is ${bankStatusResponse}. Entering final DB transaction...`);
    await prisma.$transaction(async (tx) => {
      // We must re-verify it's still PROCESSING just in case a rogue webhook came in while we were fetching
      const checkTx = await tx.transaction.findUnique({ where: { id: transactionData.id } });
      console.log(`[Sweeper Debug] Pre-check status: ${checkTx?.status}`);
      if (checkTx?.status === 'SUCCESS') return;

      // Resolution B: Fixing User Abandonment
      if (bankStatusResponse === 'NOT_FOUND') {
        console.log(`[Sweeper] Deposit ${transactionData.id} abandoned by user. Marking FAILED.`);
        await tx.transaction.update({
          where: { id: transactionData.id },
          data: {
            status: 'FAILED',
            failureReason: 'User abandoned payment timeout'
          }
        });
        return;
      }

      // Resolution A: Fixing the Network Crash
      if (bankStatusResponse === 'SUCCESS') {
        console.log(`[Sweeper] Deposit ${transactionData.id} recovered from Network Crash. Crediting user.`);

        // State Update
        await tx.transaction.update({
          where: { id: transactionData.id },
          data: { status: 'SUCCESS' }
        });

        // LOCK 3: The Wallet Increment natively via Prisma update
        await tx.user.update({
          where: { id: transactionData.receiverId },
          data: {
            walletBalance: { increment: Number(transactionData.amount) }
          }
        });
      }
    });
  } catch (error: any) {
    console.error("[Sweeper] Error reconciling deposit:", error.message);
  }
}

function startSweeper() {
  console.log(`🚀 Sweeper started, polling every ${POLL_INTERVAL}ms`);

  // Continuous polling loop
  setInterval(async () => {
    console.log(`\n--- [Sweeper Tick] ${new Date().toISOString()} ---`);
    await processWithdrawalQueue();
    await reconcileOrphanedDeposits();
  }, POLL_INTERVAL);
}

startSweeper();
