import axios from "axios";

const MOCK_BANK_URL = process.env.MOCK_BANK_URL ?? "http://localhost:3001";
const POLL_INTERVAL_MS = 5_000; // 5 seconds between each sweep

/**
 * SWEEPER — The Asynchronous Safety Net
 *
 * Dual responsibility:
 *
 * 1. WITHDRAWAL QUEUE (Workflow 3)
 *    - Locks PENDING withdrawal rows using SKIP LOCKED (multi-instance safe)
 *    - Sends funds to the mock bank with an Idempotency-Key header
 *    - On timeout/network error → keeps row as PENDING (safe retry on next tick)
 *    - On explicit bank error (e.g. 422) → marks FAILED, refunds the wallet balance
 *    - On success → marks SUCCESS
 *
 * 2. DEPOSIT RECONCILIATION (Workflow 2)
 *    - Finds stale PENDING on-ramp transactions (older than X minutes)
 *    - Queries mock-bank's /api/transaction-status/:token endpoint
 *    - If bank confirms SUCCESS → applies row lock, credits wallet, marks SUCCESS
 *    - Guards against late-arriving webhook race with the same lock
 */

async function processWithdrawalQueue(): Promise<void> {
  // TODO: Implement with @repo/db
  // Steps:
  //   1. prisma.$transaction with SELECT ... FOR UPDATE SKIP LOCKED on pending withdrawals
  //   2. For each locked row:
  //      a. POST to bank with axios, header: { 'Idempotency-Key': row.id }
  //      b. On AxiosError (timeout/network) → catch, log, leave PENDING
  //      c. On HTTP 4xx (explicit error) → mark FAILED, refund walletBalance
  //      d. On HTTP 2xx → mark SUCCESS
  console.log("[sweeper] Withdrawal queue sweep — TODO: implement with DB");
}

async function reconcileOrphanedDeposits(): Promise<void> {
  // TODO: Implement with @repo/db
  // Steps:
  //   1. Query stale PENDING on-ramp transactions (e.g. older than 2 minutes)
  //   2. For each:
  //      a. GET mock-bank /api/transaction-status/:tx_token
  //      b. If SUCCESS → open prisma.$transaction, SELECT FOR UPDATE on row,
  //         verify still PENDING, credit wallet, mark SUCCESS
  //      c. If FAILURE → mark FAILED (no refund needed — user's bank was never debited from wallet)
  //      d. If still PENDING on bank side → leave, retry next cycle
  console.log("[sweeper] Deposit reconciliation sweep — TODO: implement with DB");
}

async function sweep(): Promise<void> {
  console.log(`[sweeper] Sweep started at ${new Date().toISOString()}`);
  try {
    await Promise.allSettled([
      processWithdrawalQueue(),
      reconcileOrphanedDeposits(),
    ]);
  } catch (error) {
    // Top-level catch — sweeper must NEVER crash; log and continue
    console.error("[sweeper] Unexpected error in sweep cycle:", error);
  }
}

console.log(`[sweeper] Starting. Poll interval: ${POLL_INTERVAL_MS}ms. Bank URL: ${MOCK_BANK_URL}`);

// Run immediately on startup, then on every interval
sweep();
setInterval(sweep, POLL_INTERVAL_MS);
