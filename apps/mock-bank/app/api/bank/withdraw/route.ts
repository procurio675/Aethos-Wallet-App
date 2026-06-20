import { NextResponse } from "next/server";
import { prisma } from "@repo/db";

export async function POST(req: Request) {
  try {
    const { amount, accountNumber } = await req.json();

    if (!amount || !accountNumber) {
      return NextResponse.json({ error: "Missing amount or account" }, { status: 400 });
    }

    // Attempt to deduct the balance from the Mock Bank Ledger
    // The CHECK constraint ("bank_balance_non_negative") automatically protects us!
    await prisma.$executeRaw`
      UPDATE "MockBankLedger"
      SET "bankBalance" = "bankBalance" - ${amount}
      WHERE "accountNumber" = ${accountNumber}
    `;

    // Optionally we could call the Webhook Handler here too, but for withdrawals, 
    // the sweeper is driving the operation synchronously.
    
    return NextResponse.json({ message: "Withdrawal successful" });
  } catch (error: any) {
    if (error.message && error.message.includes("bank_balance_non_negative")) {
      return NextResponse.json({ error: "Insufficient bank funds" }, { status: 400 });
    }
    
    console.error("Mock Bank error:", error);
    return NextResponse.json({ error: "Internal bank error" }, { status: 500 });
  }
}
