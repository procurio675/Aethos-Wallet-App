import BalanceCard from "@/components/dashboard/balance-card";
import QuickActions from "@/components/dashboard/quick-actions";
import RecentTransactions from "@/components/dashboard/recent-transactions";
import LinkedAccounts from "@/components/dashboard/linked-accounts";

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-8 animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column (Primary Balance & Actions) */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <BalanceCard balance={24500.50} />
          <QuickActions />
        </div>

        {/* Right Column (Linked Accounts) */}
        <div className="lg:col-span-1">
          <LinkedAccounts />
        </div>

      </div>

      {/* Full width bottom row for Transactions */}
      <div className="grid grid-cols-1">
        <RecentTransactions />
      </div>
    </div>
  );
}
