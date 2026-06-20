import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@repo/db";

export async function GET(req: NextRequest, { params }: { params: Promise<{ tx_token: string }> }) {
  const { tx_token } = await params;
  
  // 1. Verify Authorization Header
  const authHeader = req.headers.get("authorization");
  const secret = process.env.SWEEPER_SECRET;
  
  if (!secret || authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized: Invalid Sweeper Token" }, { status: 401 });
  }

  // 2. Check the Mock Bank's internal Idempotency logs
  // The bank ONLY creates an idempotency log if money was successfully deducted 
  // from the MockBankLedger (Chaos Outcomes A and C). 
  // User Abandonment and Outcome B leave no log here.
  const log = await prisma.idempotencyKey.findUnique({
    where: { key: tx_token },
  });

  if (!log) {
    // Resolution B: Fixing User Abandonment
    // The bank has no record of this transaction ever reaching the PIN confirmation stage
    return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
  }

  // Resolution A: Fixing the Network Crash
  // If the log exists, money WAS deducted from the bank ledger. 
  // Even if the webhook crashed, from the Bank's perspective, it's a SUCCESS.
  return NextResponse.json({
    token: tx_token,
    status: "SUCCESS",
  });
}
