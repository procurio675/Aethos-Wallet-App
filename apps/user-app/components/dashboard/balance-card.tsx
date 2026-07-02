import { Wallet } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface BalanceCardProps {
  balance: number; // in rupees
}

export default function BalanceCard({ balance }: BalanceCardProps) {
  // Format as Indian Currency
  const formattedBalance = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  }).format(balance);

  return (
    <Card
      className="shadow-2xl relative overflow-hidden group transition-colors duration-300"
      style={{ backgroundColor: "var(--surface-raised)", borderColor: "var(--border-subtle)" }}
    >
      {/* Glow effect */}
      <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full group-hover:opacity-100 opacity-80 transition-opacity duration-500 pointer-events-none" style={{ backgroundColor: "var(--glow-violet)", filter: "blur(60px)" }} />

      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2" style={{ color: "var(--text-secondary)" }}>
          <Wallet className="w-4 h-4 text-violet-400" />
          Primary Wallet Balance
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className="flex items-baseline gap-1 mt-2">
          <span className="text-5xl font-bold tracking-tight animate-fade-in" style={{ color: "var(--text-primary)" }}>
            {formattedBalance.split('.')[0]}
          </span>
          <span className="text-2xl font-semibold" style={{ color: "var(--text-muted)" }}>
            .{formattedBalance.split('.')[1]}
          </span>
        </div>
        <p className="text-xs text-emerald-400 mt-4 flex items-center gap-1 font-medium bg-emerald-500/10 w-fit px-2 py-1 rounded-md">
          <span className="relative flex h-2 w-2 mr-1">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          Wallet is active and secure
        </p>
      </CardContent>
    </Card>
  );
}
