import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import WithdrawForm from "./withdraw-form";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { prisma } from "@repo/db";
import { redirect } from "next/navigation";

export default async function WithdrawPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  const userId = session.user.id;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { walletBalance: true }
  });

  const balanceInRupees = (user?.walletBalance ?? 0) / 100;

  const bankAccounts = await prisma.bankAccount.findMany({
    where: { userId },
    select: {
      id: true,
      bankName: true,
      last4: true,
      isPrimary: true
    }
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
          <h1 className="text-2xl font-semibold tracking-tight text-white">Withdraw Money</h1>
          <p className="text-white/50 text-sm mt-1">
            Transfer funds from your wallet back to your linked bank account.
          </p>
        </div>

        <WithdrawForm accounts={bankAccounts} currentBalance={balanceInRupees} />
      </div>
    </div>
  );
}
