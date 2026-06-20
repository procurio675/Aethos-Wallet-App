import { NextResponse } from "next/server";

export async function GET(req: Request, { params }: { params: Promise<{ tx_token: string }> }) {
  const { tx_token } = await params;
  
  // In a real system, the mock bank would look up the bank reference token in its own DB.
  // For our simulation, we randomly return SUCCESS 80% of the time, simulating a completed transaction.
  const rand = Math.random();
  let status = "SUCCESS";
  
  if (rand > 0.9) {
    status = "FAILED";
  } else if (rand > 0.8) {
    status = "PENDING";
  }

  return NextResponse.json({
    token: tx_token,
    status,
  });
}
