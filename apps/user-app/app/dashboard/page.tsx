import BalanceCard from "@/components/dashboard/balance-card";
import RecentTransactions from "@/components/dashboard/recent-transactions";
import { getRecentTransactions } from "@/app/actions/transactions";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { prisma } from "@repo/db";

// Force dynamic rendering — no caching. Ensures fresh data on every redirect.
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id || "";
  
  // Fetch the real wallet balance from DB
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { walletBalance: true },
  });
  
  const balanceInRupees = (user?.walletBalance ?? 0) / 100; // paise to rupees

  // Fetch the 5 most recent transactions
  const recentTransactions = await getRecentTransactions(5);

  return (
    <div className="flex flex-col gap-8 animate-fade-in max-w-4xl mx-auto">
      {/* Primary Balance */}
      <div className="grid grid-cols-1">
        <BalanceCard balance={balanceInRupees} />
      </div>

      {/* Recent Transactions */}
      <div className="grid grid-cols-1">
        <RecentTransactions transactions={recentTransactions} userId={userId} />
      </div>
    </div>
  );
}
