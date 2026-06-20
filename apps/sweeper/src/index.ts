import { prisma } from "@repo/db";
import "dotenv/config";

const POLL_INTERVAL = parseInt(process.env.POLL_INTERVAL_MS || "5000", 10);
const MOCK_BANK_URL = process.env.MOCK_BANK_URL || "http://localhost:3001";

async function processWithdrawalQueue() {
  try {
    await prisma.$transaction(async (tx) => {
      // 1. Safe re-claiming of zombie rows
      // Locks exactly one row using FOR UPDATE SKIP LOCKED
      const rows = await tx.$queryRaw<any[]>`
        SELECT * FROM "Transaction"
        WHERE type = 'WITHDRAWAL' 
        AND (
          status = 'PENDING' 
          OR (status = 'PROCESSING' AND "lastAttemptAt" < NOW() - INTERVAL '2 minutes')
        )
        ORDER BY "createdAt" ASC
        LIMIT 1
        FOR UPDATE SKIP LOCKED
      `;

      if (rows.length === 0) return;
      const transaction = rows[0];

      console.log(`[Sweeper] Found withdrawal: ${transaction.id} (Status: ${transaction.status})`);

      // 2. Mark as PROCESSING immediately
      await tx.$executeRaw`
        UPDATE "Transaction"
        SET status = 'PROCESSING', "lastAttemptAt" = NOW(), "attemptCount" = "attemptCount" + 1
        WHERE id = ${transaction.id}
      `;

      // 3. Make outbound API call to Mock Bank
      let bankSuccess = false;
      try {
        const response = await fetch(`${MOCK_BANK_URL}/api/bank/withdraw`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: transaction.amount,
            // Normally we'd look up the BankAccount details here
            accountNumber: transaction.bankAccountId || "dummy", 
          }),
        });
        bankSuccess = response.ok;
      } catch (e) {
        console.error(`[Sweeper] External bank call failed for ${transaction.id}`, e);
        // Timeout/Network error. Leave status as PROCESSING. 
        // The zombie check query will pick it up again in 2 minutes!
        return; 
      }

      // 4. Handle definite terminal response
      if (bankSuccess) {
        await tx.$executeRaw`
          UPDATE "Transaction"
          SET status = 'SUCCESS', "updatedAt" = NOW()
          WHERE id = ${transaction.id}
        `;
        console.log(`[Sweeper] Withdrawal ${transaction.id} succeeded.`);
      } else {
        // Explicit bank rejection -> Fail transaction & refund user
        await tx.$executeRaw`
          UPDATE "Transaction"
          SET status = 'FAILED', "failureReason" = 'Bank rejected withdrawal', "updatedAt" = NOW()
          WHERE id = ${transaction.id}
        `;
        
        await tx.$executeRaw`
          UPDATE "User"
          SET "walletBalance" = "walletBalance" + ${transaction.amount}
          WHERE id = ${transaction.senderId}
        `;
        console.log(`[Sweeper] Withdrawal ${transaction.id} failed. Refunded user.`);
      }
    });
  } catch (error: any) {
    console.error("[Sweeper] Error processing withdrawal:", error.message);
  }
}

async function reconcileOrphanedDeposits() {
  try {
    // Finds deposits stuck in PENDING or PROCESSING (if the webhook was never called)
    await prisma.$transaction(async (tx) => {
      const rows = await tx.$queryRaw<any[]>`
        SELECT * FROM "Transaction"
        WHERE type = 'DEPOSIT' 
        AND (
          status = 'PENDING' 
          OR (status = 'PROCESSING' AND "lastAttemptAt" < NOW() - INTERVAL '2 minutes')
        )
        ORDER BY "createdAt" ASC
        LIMIT 1
        FOR UPDATE SKIP LOCKED
      `;

      if (rows.length === 0) return;
      const transaction = rows[0];
      
      if (!transaction.token) return; // Cannot reconcile without a bank token

      console.log(`[Sweeper] Reconciling deposit: ${transaction.id} (Token: ${transaction.token})`);

      // Mark processing to avoid other workers picking it up
      await tx.$executeRaw`
        UPDATE "Transaction"
        SET status = 'PROCESSING', "lastAttemptAt" = NOW(), "attemptCount" = "attemptCount" + 1
        WHERE id = ${transaction.id}
      `;

      // Check status from mock bank
      try {
        const response = await fetch(`${MOCK_BANK_URL}/api/transaction-status/${transaction.token}`);
        if (!response.ok) return; // Network error, try again later
        
        const data = await response.json();
        
        if (data.status === 'SUCCESS') {
          // Bank processed it, but webhook was lost. Credit the user!
          await tx.$executeRaw`
            UPDATE "User"
            SET "walletBalance" = "walletBalance" + ${transaction.amount}
            WHERE id = ${transaction.receiverId}
          `;
          await tx.$executeRaw`
            UPDATE "Transaction"
            SET status = 'SUCCESS', "updatedAt" = NOW()
            WHERE id = ${transaction.id}
          `;
          console.log(`[Sweeper] Deposit ${transaction.id} reconciled successfully.`);
        } else if (data.status === 'FAILED') {
          await tx.$executeRaw`
            UPDATE "Transaction"
            SET status = 'FAILED', "updatedAt" = NOW()
            WHERE id = ${transaction.id}
          `;
          console.log(`[Sweeper] Deposit ${transaction.id} reconciliation confirmed failure.`);
        }
        // If bank says PENDING, do nothing, it will be checked again later.
      } catch (e) {
        console.error(`[Sweeper] Failed to reach bank for reconciliation ${transaction.id}`);
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
    await processWithdrawalQueue();
    await reconcileOrphanedDeposits();
  }, POLL_INTERVAL);
}

startSweeper();
