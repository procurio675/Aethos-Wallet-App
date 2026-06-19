/**
 * GET /api/transaction-status/:tx_token
 * Returns the status of a transaction by its token.
 * Used by the sweeper for deposit reconciliation.
 */
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ tx_token: string }> }
) {
  const { tx_token } = await params;

  // TODO: Look up token in the mock bank's idempotency/transaction log (via @repo/db)
  // For now, return a stub response.
  return NextResponse.json({
    token: tx_token,
    status: "PENDING",
    message: "Transaction status endpoint — implement with DB lookup",
  });
}
