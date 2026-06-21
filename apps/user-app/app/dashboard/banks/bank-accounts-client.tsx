"use client";

import {
  Building2,
  Star,
  CreditCard,
  Shield,
  Phone,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { setPrimaryBankAccount } from "@/app/actions/bank-accounts";

type BankAccountProp = {
  id: string;
  bankName: string;
  accountNo: string;
  last4: string;
  ifsc: string | null;
  isPrimary: boolean;
  createdAt: Date;
  _count: { transactions: number };
};

const BANK_GRADIENTS: Record<string, string> = {
  "hdfc":    "from-blue-600/20 to-blue-800/10 border-blue-500/10",
  "sbi":     "from-blue-500/20 to-indigo-800/10 border-indigo-500/10",
  "icici":   "from-orange-500/20 to-orange-800/10 border-orange-500/10",
  "axis":    "from-pink-500/20 to-pink-800/10 border-pink-500/10",
  "kotak":   "from-red-500/20 to-red-800/10 border-red-500/10",
  "pnb":     "from-amber-500/20 to-amber-800/10 border-amber-500/10",
  "yes":     "from-cyan-500/20 to-cyan-800/10 border-cyan-500/10",
  "indusind":"from-teal-500/20 to-teal-800/10 border-teal-500/10",
};

function getBankStyle(bankName: string): string {
  const lower = bankName.toLowerCase();
  for (const [key, style] of Object.entries(BANK_GRADIENTS)) {
    if (lower.includes(key)) return style;
  }
  return "from-violet-500/20 to-violet-800/10 border-violet-500/10";
}

export default function BankAccountsClient({ accounts }: { accounts: BankAccountProp[] }) {
  const router = useRouter();
  const [isSettingPrimary, setIsSettingPrimary] = useState<string | null>(null);

  const handleSetPrimary = async (id: string) => {
    setIsSettingPrimary(id);
    try {
      const res = await setPrimaryBankAccount(id);
      if (res.success) {
        router.refresh();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSettingPrimary(null);
    }
  };

  return (
    <Card className="bg-[#0a0a16]/80 border-white/5 backdrop-blur-xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-violet-500/5 blur-[100px] rounded-full pointer-events-none" />
      <CardHeader className="relative z-10 border-b border-white/5 pb-6 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-violet-500/10 flex items-center justify-center">
            <Building2 className="w-6 h-6 text-violet-400" />
          </div>
          <div>
            <CardTitle className="text-lg text-white">Linked Bank Accounts</CardTitle>
            <CardDescription className="text-white/50 mt-1">
              {accounts.length === 0
                ? "No bank accounts linked yet"
                : `${accounts.length} account${accounts.length > 1 ? "s" : ""} linked to your wallet`}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="relative z-10 space-y-8">
        {/* Empty State */}
        {accounts.length === 0 ? (
          <div className="py-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-5">
              <CreditCard className="w-8 h-8 text-white/20" />
            </div>
            <h3 className="text-white font-medium text-lg mb-2">No Bank Accounts</h3>
            <p className="text-white/40 text-sm max-w-sm mx-auto mb-6">
              You don&apos;t have any bank accounts linked to your wallet yet.
            </p>
            <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/50 text-sm">
              <Phone className="w-4 h-4" />
              Contact support to link a bank account
            </div>
          </div>
        ) : (
          /* Bank Account Cards */
          <div className="grid gap-4">
            {accounts.map((account) => {
              const style = getBankStyle(account.bankName);
              return (
                <div
                  key={account.id}
                  className={`relative overflow-hidden backdrop-blur-xl rounded-xl border bg-gradient-to-br ${style} transition-all duration-300 hover:brightness-110 p-6`}
                >
                  <div className="relative z-10 flex items-start justify-between">
                    {/* Left: Info */}
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                        <Building2 className="w-6 h-6 text-white/70" />
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex items-center gap-3 flex-wrap">
                          <h3 className="text-white font-semibold text-base">{account.bankName}</h3>
                          {account.isPrimary && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20">
                              <Star className="w-3 h-3" />
                              Primary
                            </span>
                          )}
                        </div>

                        <p className="text-white/50 text-sm font-mono tracking-[0.2em]">
                          •••• •••• •••• {account.last4}
                        </p>

                        {account.ifsc && (
                          <p className="text-white/30 text-xs">IFSC: {account.ifsc}</p>
                        )}

                        <p className="text-white/25 text-xs pt-0.5">
                          {account._count.transactions} transaction{account._count.transactions !== 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex flex-col items-end justify-center gap-4">
                      
                      {!account.isPrimary && (
                        <button
                          onClick={() => handleSetPrimary(account.id)}
                          disabled={isSettingPrimary !== null}
                          className="text-xs font-medium text-white/50 hover:text-white transition-colors flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-white/10 disabled:opacity-50"
                        >
                          {isSettingPrimary === account.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Star className="w-3.5 h-3.5" />
                          )}
                          Make Primary
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Security Note */}
        <div className="flex items-start gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/5 mt-4">
          <Shield className="w-5 h-5 text-white/20 shrink-0 mt-0.5" />
          <div>
            <p className="text-white/40 text-xs leading-relaxed">
              Your bank account details are encrypted and stored securely. Account numbers are masked — only the last 4 digits are displayed. To add or remove a linked bank account, please contact support.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
