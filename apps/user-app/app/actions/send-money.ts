"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { prisma } from "@repo/db";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

/**
 * P2P Transfer — Phase 1 & 2: Initiation + Pre-Flight Checks + Atomic Double-Lock Transfer
 * 
 * Phase 2 Pre-Flight:
 *   1. Self-Send Check: senderId === receiverId → abort
 *   2. Receiver Lookup: Find by phone number → 404 if not found
 *   3. Mathematical Sort: Lock IDs in alphabetical order to prevent deadlocks
 * 
 * Phase 3 (inside the same $transaction):
 *   4. Lock both users with FOR UPDATE in sorted order
 *   5. Debit sender, credit receiver atomically
 *   6. Create a SUCCESS transaction record
 */
export async function initiateSendMoney(
  amount: number,
  receiverPhone: string,
  password: string
) {
  // ── Auth ──────────────────────────────────────────────────────────
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  const senderId = session.user.id;

  // ── 0. Verify Password ───────────────────────────────────────────
  const sender = await prisma.user.findUnique({
    where: { id: senderId },
    select: { passwordHash: true, phone: true, name: true },
  });

  if (!sender) {
    return { success: false, error: "User not found" };
  }

  const isPasswordValid = await bcrypt.compare(password, sender.passwordHash);
  if (!isPasswordValid) {
    return { success: false, error: "Incorrect password. Please try again." };
  }

  // ── 1. Validate Input ────────────────────────────────────────────
  if (!amount || amount <= 0) {
    return { success: false, error: "Please enter a valid amount" };
  }

  const cleanPhone = receiverPhone.trim();
  if (!cleanPhone) {
    return { success: false, error: "Please enter the recipient's phone number" };
  }

  // ── Phase 2: Pre-Flight & Identity Checks ────────────────────────

  // 2a. Self-Send Check (by phone)
  if (sender.phone === cleanPhone) {
    return { success: false, error: "You cannot send money to yourself" };
  }

  // 2b. Receiver Lookup
  const receiver = await prisma.user.findUnique({
    where: { phone: cleanPhone },
    select: { id: true, name: true, phone: true },
  });

  if (!receiver) {
    return { success: false, error: "No user found with this phone number" };
  }

  // 2c. Double-check self-send by ID (belt + suspenders)
  if (senderId === receiver.id) {
    return { success: false, error: "You cannot send money to yourself" };
  }

  // 2d. The Mathematical Sort — prevents deadlocks when two users
  // send money to each other simultaneously.
  // By ALWAYS locking the alphabetically-first ID before the second,
  // two concurrent A→B and B→A transfers will try to acquire locks
  // in the same order, preventing a circular wait.
  const [firstLockId, secondLockId] = [senderId, receiver.id].sort();

  const amountInPaise = amount * 100;

  // ── Phase 3: The Atomic Double-Lock Transfer ─────────────────────
  try {
    await prisma.$transaction(async (tx) => {
      // Lock both users in sorted order to prevent deadlocks
      // Lock #1: The alphabetically-first user
      await tx.$queryRaw`
        SELECT id FROM "User"
        WHERE id = ${firstLockId}
        FOR UPDATE
      `;

      // Lock #2: The alphabetically-second user
      await tx.$queryRaw`
        SELECT id FROM "User"
        WHERE id = ${secondLockId}
        FOR UPDATE
      `;

      // Now both rows are locked. Re-read the sender's balance under the lock.
      const senderRows = await tx.$queryRaw<any[]>`
        SELECT "walletBalance" FROM "User"
        WHERE id = ${senderId}
      `;

      if (senderRows.length === 0) {
        throw new Error("Sender not found");
      }

      const senderBalance = senderRows[0].walletBalance;

      if (senderBalance < amountInPaise) {
        throw new Error("Insufficient wallet balance");
      }

      // Debit sender
      await tx.$executeRaw`
        UPDATE "User"
        SET "walletBalance" = "walletBalance" - ${amountInPaise}
        WHERE id = ${senderId}
      `;

      // Credit receiver
      await tx.$executeRaw`
        UPDATE "User"
        SET "walletBalance" = "walletBalance" + ${amountInPaise}
        WHERE id = ${receiver.id}
      `;

      // Create the transaction record — immediately SUCCESS
      // P2P transfers are instant (no sweeper needed, no bank involved)
      await tx.transaction.create({
        data: {
          type: "TRANSFER",
          amount: amountInPaise,
          status: "SUCCESS",
          senderId: senderId,
          receiverId: receiver.id,
        },
      });

      // Create a notification for the recipient
      await tx.notification.create({
        data: {
          userId: receiver.id,
          message: `You received ₹${amount} from ${sender.name}.`,
        },
      });
    });

    // Revalidate all relevant paths
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/send-money");
    revalidatePath("/dashboard/transactions");

    return {
      success: true,
      message: "Transfer completed successfully",
      receiverName: receiver.name,
    };
  } catch (error: any) {
    console.error("P2P Transfer failed:", error);
    return {
      success: false,
      error: error.message || "Transfer failed. Please try again.",
    };
  }
}
