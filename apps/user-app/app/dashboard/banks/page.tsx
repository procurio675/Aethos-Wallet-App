import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import BankAccountsClient from "./bank-accounts-client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { prisma } from "@repo/db";
import { redirect } from "next/navigation";

// Force dynamic rendering — no caching. Ensures fresh data on every request.
export const dynamic = "force-dynamic";

export default async function BankAccountsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  const userId = session.user.id;

  const bankAccounts = await prisma.bankAccount.findMany({
    where: { userId },
    orderBy: [{ isPrimary: "desc" }, { createdAt: "asc" }],
    include: {
      _count: {
        select: { transactions: true },
      },
    },
  });

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </Link>

      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-white">Bank Accounts</h1>
          <p className="text-white/50 text-sm mt-1">
            Manage your linked bank accounts for deposits and withdrawals.
          </p>
        </div>

        <BankAccountsClient accounts={bankAccounts} />
      </div>
    </div>
  );
}
