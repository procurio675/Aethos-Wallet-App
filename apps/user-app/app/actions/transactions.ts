"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { prisma } from "@repo/db";

export async function getRecentTransactions(limit: number = 5) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const userId = session.user.id;

  const transactions = await prisma.transaction.findMany({
    where: {
      OR: [
        { senderId: userId },
        { receiverId: userId }
      ]
    },
    orderBy: {
      createdAt: 'desc'
    },
    take: limit,
    include: {
      sender: {
        select: { name: true }
      },
      receiver: {
        select: { name: true }
      },
      bankAccount: {
        select: { bankName: true, last4: true }
      }
    }
  });

  return transactions;
}

export async function getTransactionsPaginated(cursor: string | null = null, limit: number = 15) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const userId = session.user.id;

  const queryArgs: any = {
    where: {
      OR: [
        { senderId: userId },
        { receiverId: userId }
      ]
    },
    orderBy: {
      createdAt: 'desc'
    },
    take: limit + 1, // Fetch one extra to determine if there's a next page
    include: {
      sender: { select: { name: true } },
      receiver: { select: { name: true } },
      bankAccount: { select: { bankName: true, last4: true } }
    }
  };

  if (cursor) {
    queryArgs.cursor = { id: cursor };
    queryArgs.skip = 1; // skip the cursor itself
  }

  const transactions = await prisma.transaction.findMany(queryArgs);
  
  let nextCursor: string | null = null;
  if (transactions.length > limit) {
    const nextItem = transactions.pop();
    nextCursor = nextItem!.id;
  }

  return {
    transactions,
    nextCursor
  };
}
