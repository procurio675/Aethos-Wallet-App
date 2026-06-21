"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { prisma } from "@repo/db";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

export async function initiateWithdrawMoney(amount: number, bankAccountId: string, password: string) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  const userId = session.user.id;

  // 0. Verify password before proceeding with any financial operation
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { passwordHash: true }
  });

  if (!user) {
    return { success: false, error: "User not found" };
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
  if (!isPasswordValid) {
    return { success: false, error: "Incorrect password. Please try again." };
  }
  
  // 1. Validate bank account belongs to user
  const bankAccount = await prisma.bankAccount.findFirst({
    where: {
      id: bankAccountId,
      userId: userId
    }
  });

  if (!bankAccount) {
    return { success: false, error: "Invalid bank account" };
  }

  const amountInPaise = amount * 100;
  let txToken = "";

  try {
    await prisma.$transaction(async (tx) => {
      // 1. LOCK 1 (The Wallet Lock): Pessimistic Row Lock on the User
      // If 50 simultaneous withdrawal requests come in, the database physically
      // freezes 49 of them here until this transaction commits or rolls back.
      const userRows = await tx.$queryRaw<any[]>`
        SELECT * FROM "User"
        WHERE id = ${userId}
        FOR UPDATE
      `;

      if (userRows.length === 0) {
        throw new Error("User not found");
      }

      const lockedUser = userRows[0];

      // 2. Balance Check: Verify sufficient funds under the lock
      if (lockedUser.walletBalance < amountInPaise) {
        throw new Error("Insufficient wallet balance");
      }

      // 3. The Instant Deduction: Money is now locked and safe from double-spending.
      // The balance drops immediately — the user cannot spend these funds again.
      await tx.$executeRaw`
        UPDATE "User"
        SET "walletBalance" = "walletBalance" - ${amountInPaise}
        WHERE id = ${userId}
      `;

      // 4. The Ledger Entry: Create a PENDING transaction with a unique token
      // that will act as our Outbound Idempotency Key for the sweeper → bank call.
      // If the sweeper accidentally sends 2 requests to the bank, the bank can 
      // identify and reject the duplicate using this token.
      const newTx = await tx.transaction.create({
        data: {
          type: "WITHDRAWAL",
          amount: amountInPaise,
          status: "PENDING",
          senderId: userId, // Money leaves the user's wallet
          bankAccountId: bankAccount.id,
        }
      });

      // Generate unique idempotency token from the transaction ID
      txToken = `tx_withdrawal_${newTx.id}`;

      await tx.transaction.update({
        where: { id: newTx.id },
        data: { token: txToken }
      });
    });

    // Revalidate paths so the UI updates instantly:
    // - Dashboard shows updated balance + pending transaction in recent list
    // - Withdraw page shows the new lower balance
    // - Transactions page shows the new pending entry
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/withdraw");
    revalidatePath("/dashboard/transactions");

    return { success: true, message: "Withdrawal initiated successfully", token: txToken };
  } catch (error: any) {
    console.error("Failed to initiate withdrawal:", error);
    return { success: false, error: error.message || "Internal server error" };
  }
}
