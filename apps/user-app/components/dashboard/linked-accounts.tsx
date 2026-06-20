import { Building2, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const mockAccounts = [
  {
    id: "acc_1",
    bankName: "HDFC Bank",
    last4: "0001",
    isPrimary: true,
  },
  {
    id: "acc_2",
    bankName: "State Bank of India",
    last4: "0002",
    isPrimary: false,
  },
];

export default function LinkedAccounts() {
  return (
    <Card className="bg-[#0a0a16]/80 border-white/5 backdrop-blur-xl h-fit">
      <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-white/5">
        <CardTitle className="text-lg font-semibold text-white">Bank Accounts</CardTitle>
        <button className="text-white/50 hover:text-white transition-colors">
          <Plus className="w-5 h-5" />
        </button>
      </CardHeader>
      <CardContent className="p-0">
        <div className="flex flex-col">
          {mockAccounts.map((acc, i) => (
            <div
              key={acc.id}
              className={`flex items-center gap-4 p-4 hover:bg-white/[0.02] transition-colors cursor-pointer ${
                i !== mockAccounts.length - 1 ? "border-b border-white/5" : ""
              }`}
            >
              <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                <Building2 className="w-5 h-5 text-white/50" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{acc.bankName}</p>
                <p className="text-xs text-white/40">•••• {acc.last4}</p>
              </div>
              {acc.isPrimary && (
                <Badge variant="outline" className="bg-violet-500/10 text-violet-400 border-violet-500/20 text-[10px] uppercase">
                  Primary
                </Badge>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
