"use client";

import { ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
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

export default function RecentTransactions({ transactions, userId }: { transactions: TransactionProp[], userId: string }) {
  if (!transactions || transactions.length === 0) {
    return (
      <Card
        className="backdrop-blur-xl col-span-1 md:col-span-2 transition-colors duration-300"
        style={{ backgroundColor: "var(--surface-raised)", borderColor: "var(--border-subtle)" }}
      >
        <CardHeader>
          <CardTitle className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent className="px-6 pb-6 text-center" style={{ color: "var(--text-secondary)" }}>
          No transactions found.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className="backdrop-blur-xl col-span-1 md:col-span-2 transition-colors duration-300"
      style={{ backgroundColor: "var(--surface-raised)", borderColor: "var(--border-subtle)" }}
    >
      <CardHeader>
        <CardTitle className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>Recent Transactions</CardTitle>
      </CardHeader>
      <CardContent className="px-0">
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
                <div
                  className="flex items-center justify-between px-6 py-4 transition-colors group cursor-default"
                  style={{ borderColor: "var(--border-subtle)" }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "var(--surface-hover)"}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                        isReceived
                          ? "bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500/20"
                          : "text-current group-hover:opacity-80"
                      }`}
                      style={!isReceived ? { backgroundColor: "var(--surface-active)", color: "var(--text-secondary)" } : undefined}
                    >
                      {isReceived ? (
                        <ArrowDownLeft className="w-5 h-5" />
                      ) : (
                        <ArrowUpRight className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                        {actionText}{counterparty}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                          {formatDistanceToNow(new Date(tx.createdAt), { addSuffix: true })}
                        </span>
                        <span className="w-1 h-1 rounded-full" style={{ backgroundColor: "var(--text-faint)" }} />
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-sm uppercase tracking-wider ${
                            tx.status === "SUCCESS"
                              ? "bg-emerald-500/10 text-emerald-400"
                              : tx.status === "PENDING" || tx.status === "PROCESSING"
                              ? "bg-amber-500/10 text-amber-400"
                              : "bg-destructive/10 text-destructive"
                          }`}
                        >
                          {tx.status === "PENDING" || tx.status === "PROCESSING" ? "Processing..." : tx.status}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div
                    className={`text-base font-semibold ${
                      isReceived ? "text-emerald-400" : ""
                    }`}
                    style={!isReceived ? { color: "var(--text-primary)" } : undefined}
                  >
                    {isReceived ? "+" : "-"}₹{(tx.amount / 100).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>
                {i < transactions.length - 1 && <Separator className="mx-6" style={{ backgroundColor: "var(--border-subtle)" }} />}
              </div>
            );
          })}
        </div>
        <div className="px-6 pt-4 mt-2 text-center" style={{ borderTop: "1px solid var(--border-subtle)" }}>
          <Link href="/dashboard/transactions" className="text-sm font-medium text-violet-400 hover:text-violet-300 transition-colors inline-block">
            View all transactions →
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
