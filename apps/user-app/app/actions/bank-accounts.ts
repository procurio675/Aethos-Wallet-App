"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { prisma } from "@repo/db";

export async function addBankAccount(bankName: string, accountNo: string, ifsc: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  const userId = session.user.id;

  // Validate inputs
  if (!bankName || bankName.trim().length < 2) {
    return { success: false, error: "Please enter a valid bank name" };
  }
  if (!accountNo || accountNo.length < 8 || accountNo.length > 18) {
    return { success: false, error: "Account number must be 8-18 digits" };
  }
  if (!/^\d+$/.test(accountNo)) {
    return { success: false, error: "Account number must contain only digits" };
  }

  // Check if this account number is already linked
  const existing = await prisma.bankAccount.findUnique({
    where: { accountNo },
  });
  if (existing) {
    return { success: false, error: "This account number is already linked" };
  }

  // Check how many bank accounts the user has (limit to 5)
  const count = await prisma.bankAccount.count({ where: { userId } });
  if (count >= 5) {
    return { success: false, error: "You can link a maximum of 5 bank accounts" };
  }

  const last4 = accountNo.slice(-4);
  const isFirst = count === 0; // First account becomes primary

  await prisma.bankAccount.create({
    data: {
      userId,
      bankName: bankName.trim(),
      accountNo,
      last4,
      ifsc: ifsc.trim() || null,
      isPrimary: isFirst,
    },
  });

  return { success: true };
}

export async function deleteBankAccount(bankAccountId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  const userId = session.user.id;

  // Verify ownership
  const account = await prisma.bankAccount.findFirst({
    where: { id: bankAccountId, userId },
  });

  if (!account) {
    return { success: false, error: "Bank account not found" };
  }

  // Check if there are any active (PENDING/PROCESSING) transactions using this account
  const activeTransactions = await prisma.transaction.count({
    where: {
      bankAccountId,
      status: { in: ["PENDING", "PROCESSING"] },
    },
  });

  if (activeTransactions > 0) {
    return { success: false, error: "Cannot remove this account while transactions are in progress" };
  }

  await prisma.bankAccount.delete({ where: { id: bankAccountId } });

  // If we deleted the primary, promote the next one
  if (account.isPrimary) {
    const nextAccount = await prisma.bankAccount.findFirst({
      where: { userId },
      orderBy: { createdAt: "asc" },
    });
    if (nextAccount) {
      await prisma.bankAccount.update({
        where: { id: nextAccount.id },
        data: { isPrimary: true },
      });
    }
  }

  return { success: true };
}

export async function setPrimaryBankAccount(bankAccountId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  const userId = session.user.id;

  // Verify ownership
  const account = await prisma.bankAccount.findFirst({
    where: { id: bankAccountId, userId },
  });

  if (!account) {
    return { success: false, error: "Bank account not found" };
  }

  // Unset all other primaries, then set this one
  await prisma.$transaction([
    prisma.bankAccount.updateMany({
      where: { userId },
      data: { isPrimary: false },
    }),
    prisma.bankAccount.update({
      where: { id: bankAccountId },
      data: { isPrimary: true },
    }),
  ]);

  return { success: true };
}
