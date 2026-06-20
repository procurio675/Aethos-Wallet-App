"use client";

import { useState } from "react";
import { ArrowUpRight, ArrowDownLeft, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { getTransactionsPaginated } from "@/app/actions/transactions";
import { formatDistanceToNow } from "date-fns";

type TransactionProp = {
  id: string;
  type: "DEPOSIT" | "WITHDRAWAL" | "TRANSFER";
  amount: number;
  status: "SUCCESS" | "FAILED" | "PENDING" | "PROCESSING";
  createdAt: Date;
  senderId: string | null;
  receiverId: string | null;
  sender: { name: string } | null;
  receiver: { name: string } | null;
  bankAccount: { bankName: string; last4: string } | null;
};

export default function TransactionsList({ 
  initialTransactions, 
  initialNextCursor,
  userId 
}: { 
  initialTransactions: TransactionProp[];
  initialNextCursor: string | null;
  userId: string;
}) {
  const [transactions, setTransactions] = useState<TransactionProp[]>(initialTransactions);
  const [nextCursor, setNextCursor] = useState<string | null>(initialNextCursor);
  const [isLoading, setIsLoading] = useState(false);

  const loadMore = async () => {
    if (!nextCursor || isLoading) return;
    
    setIsLoading(true);
    try {
      const result = await getTransactionsPaginated(nextCursor, 15);
      setTransactions((prev) => [...prev, ...result.transactions]);
      setNextCursor(result.nextCursor);
    } catch (error) {
      console.error("Failed to fetch transactions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (transactions.length === 0) {
    return (
      <Card className="bg-[#0a0a16]/80 border-white/5 backdrop-blur-xl">
        <CardContent className="p-12 text-center text-white/50">
          No transactions found.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-[#0a0a16]/80 border-white/5 backdrop-blur-xl relative overflow-hidden">
      {/* Vengeance UI Glow */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-violet-500/5 blur-[100px] rounded-full pointer-events-none" />
      
      <CardContent className="p-0 relative z-10">
        <div className="flex flex-col">
          {transactions.map((tx, i) => {
            const isReceived = tx.receiverId === userId || tx.type === "DEPOSIT";
            
            let counterparty = "Unknown";
            if (tx.type === "TRANSFER") {
              counterparty = isReceived ? tx.sender?.name || "Someone" : tx.receiver?.name || "Someone";
            } else if (tx.type === "DEPOSIT" || tx.type === "WITHDRAWAL") {
              counterparty = tx.bankAccount ? `${tx.bankAccount.bankName} (ending in ${tx.bankAccount.last4})` : "Bank Account";
            }

            const actionText = tx.type === "TRANSFER" 
              ? (isReceived ? "Received from " : "Sent to ")
              : tx.type === "DEPOSIT" ? "Added from " : "Withdrawn to ";

            return (
              <div key={tx.id}>
                <div className="flex items-center justify-between px-6 py-4 hover:bg-white/[0.02] transition-colors group cursor-default">
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                        isReceived
                          ? "bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500/20"
                          : "bg-white/5 text-white/70 group-hover:bg-white/10"
                      }`}
                    >
                      {isReceived ? (
                        <ArrowDownLeft className="w-5 h-5" />
                      ) : (
                        <ArrowUpRight className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">
                        {actionText}{counterparty}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-white/40">
                          {formatDistanceToNow(new Date(tx.createdAt), { addSuffix: true })}
                        </span>
                        <span className="w-1 h-1 rounded-full bg-white/20" />
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-sm uppercase tracking-wider ${
                            tx.status === "SUCCESS"
                              ? "bg-emerald-500/10 text-emerald-400"
                              : tx.status === "PENDING" || tx.status === "PROCESSING"
                              ? "bg-amber-500/10 text-amber-400"
                              : "bg-destructive/10 text-destructive"
                          }`}
                        >
                          {tx.status}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div
                    className={`text-base font-semibold ${
                      isReceived ? "text-emerald-400" : "text-white"
                    }`}
                  >
                    {isReceived ? "+" : "-"}₹{(tx.amount / 100).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>
                {i < transactions.length - 1 && <Separator className="bg-white/5 mx-6" />}
              </div>
            );
          })}
        </div>
        
        {nextCursor && (
          <div className="px-6 py-6 border-t border-white/5 flex justify-center">
            <Button 
              variant="outline" 
              className="bg-white/5 border-white/10 text-white hover:bg-white/10 min-w-[140px]"
              onClick={loadMore}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Loading...
                </>
              ) : (
                "Show More"
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
