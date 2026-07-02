"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { prisma } from "@repo/db";
import crypto from "crypto";

export async function initiateAddMoney(amount: number, bankAccountId: string) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const userId = session.user.id;
  const secret = process.env.BANK_WEBHOOK_SECRET;

  if (!secret) {
    throw new Error("BANK_WEBHOOK_SECRET is not configured");
  }

  // 1. Validate bank account belongs to user
  const bankAccount = await prisma.bankAccount.findFirst({
    where: {
      id: bankAccountId,
      userId: userId
    }
  });

  if (!bankAccount) {
    throw new Error("Invalid bank account");
  }

  // 2. Generate secure transaction token
  const txToken = `tx_${crypto.randomBytes(16).toString('hex')}`;
  const amountInPaise = amount * 100;
  
  // 3. Generate HMAC signature (token + amount in paise)
  const payload = `${txToken}:${amountInPaise}`;
  const signature = crypto.createHmac('sha256', secret)
                          .update(payload)
                          .digest('hex');

  // 4. Insert PENDING transaction into DB
  await prisma.transaction.create({
    data: {
      type: "DEPOSIT",
      amount: amountInPaise,
      status: "PENDING",
      token: txToken,
      receiverId: userId,
      bankAccountId: bankAccount.id,
    }
  });

  // 5. Return redirect URL to Mock Bank (amount in paise)
  const mockBankUrl = process.env.MOCK_BANK_URL || "http://localhost:3001";
  const userAppUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
  const callbackUrl = encodeURIComponent(`${userAppUrl}/dashboard`);
  const redirectUrl = `${mockBankUrl}/pay?token=${txToken}&amount=${amountInPaise}&signature=${signature}&callbackUrl=${callbackUrl}`;

  return { success: true, redirectUrl };
}
