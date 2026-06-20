import { Wallet, IndianRupee } from "lucide-react";
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
    <Card className="bg-gradient-to-br from-[#0f0f1d] to-[#0a0a16] border-white/5 shadow-2xl relative overflow-hidden group">
      {/* Glow effect */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-violet-600/20 blur-[60px] rounded-full group-hover:bg-violet-500/30 transition-colors duration-500 pointer-events-none" />
      
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-white/50 flex items-center gap-2">
          <Wallet className="w-4 h-4 text-violet-400" />
          Primary Wallet Balance
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="flex items-baseline gap-1 mt-2">
          <span className="text-5xl font-bold tracking-tight text-white animate-fade-in">
            {formattedBalance.split('.')[0]}
          </span>
          <span className="text-2xl font-semibold text-white/40">
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
