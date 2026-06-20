import { ArrowUpRight, ArrowDownLeft, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

// Mock data
const mockTransactions = [
  {
    id: "tx_1",
    type: "RECEIVED",
    amount: 5000,
    status: "SUCCESS",
    counterparty: "Alice (9876543210)",
    date: "Today, 10:42 AM",
  },
  {
    id: "tx_2",
    type: "SENT",
    amount: 1500,
    status: "SUCCESS",
    counterparty: "Bob (8765432109)",
    date: "Yesterday, 6:15 PM",
  },
  {
    id: "tx_3",
    type: "ADDED",
    amount: 10000,
    status: "PENDING",
    counterparty: "HDFC Bank (ending in 0001)",
    date: "Yesterday, 9:00 AM",
  },
  {
    id: "tx_4",
    type: "WITHDRAWAL",
    amount: 2000,
    status: "FAILED",
    counterparty: "SBI (ending in 0002)",
    date: "Jun 18, 4:30 PM",
  },
];

export default function RecentTransactions() {
  return (
    <Card className="bg-[#0a0a16]/80 border-white/5 backdrop-blur-xl col-span-1 md:col-span-2">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-white">Recent Transactions</CardTitle>
      </CardHeader>
      <CardContent className="px-0">
        <div className="flex flex-col">
          {mockTransactions.map((tx, i) => (
            <div key={tx.id}>
              <div className="flex items-center justify-between px-6 py-4 hover:bg-white/[0.02] transition-colors">
                <div className="flex items-center gap-4">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      tx.type === "RECEIVED" || tx.type === "ADDED"
                        ? "bg-emerald-500/10 text-emerald-400"
                        : "bg-white/5 text-white/70"
                    }`}
                  >
                    {tx.type === "RECEIVED" || tx.type === "ADDED" ? (
                      <ArrowDownLeft className="w-5 h-5" />
                    ) : (
                      <ArrowUpRight className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">
                      {tx.type === "RECEIVED" ? "Received from " : tx.type === "SENT" ? "Sent to " : tx.type === "ADDED" ? "Added from " : "Withdrawn to "}
                      {tx.counterparty}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-white/40">{tx.date}</span>
                      <span className="w-1 h-1 rounded-full bg-white/20" />
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-sm uppercase tracking-wider ${
                          tx.status === "SUCCESS"
                            ? "bg-emerald-500/10 text-emerald-400"
                            : tx.status === "PENDING"
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
                    tx.type === "RECEIVED" || tx.type === "ADDED" ? "text-emerald-400" : "text-white"
                  }`}
                >
                  {tx.type === "RECEIVED" || tx.type === "ADDED" ? "+" : "-"}₹{tx.amount.toLocaleString("en-IN")}
                </div>
              </div>
              {i < mockTransactions.length - 1 && <Separator className="bg-white/5 mx-6" />}
            </div>
          ))}
        </div>
        <div className="px-6 pt-4 mt-2 border-t border-white/5 text-center">
          <button className="text-sm font-medium text-violet-400 hover:text-violet-300 transition-colors">
            View all transactions →
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
