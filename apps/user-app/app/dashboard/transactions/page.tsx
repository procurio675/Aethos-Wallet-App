import { getTransactionsPaginated } from "@/app/actions/transactions";
import TransactionsList from "./transactions-list";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";

export default async function TransactionsPage() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id || "";

  // Fetch initial page of transactions
  const initialData = await getTransactionsPaginated(null, 15);

  return (
    <div className="max-w-4xl mx-auto animate-fade-in space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-white">All Transactions</h1>
        <p className="text-white/50 text-sm mt-1">
          View your complete transaction history.
        </p>
      </div>

      <TransactionsList 
        initialTransactions={initialData.transactions} 
        initialNextCursor={initialData.nextCursor} 
        userId={userId} 
      />
    </div>
  );
}
