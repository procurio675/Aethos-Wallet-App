"use client";

import { useState } from "react";
import { Building2, Plus, Loader2, Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { initiateAddMoney } from "@/app/actions/add-money";

type BankAccountProps = {
  id: string;
  bankName: string;
  last4: string;
  isPrimary: boolean;
};

const presetAmounts = [500, 1000, 5000, 10000];

export default function AddMoneyForm({ accounts }: { accounts: BankAccountProps[] }) {
  const [amount, setAmount] = useState("");
  const primaryAccount = accounts.find((acc) => acc.isPrimary);
  const [selectedBank, setSelectedBank] = useState(primaryAccount?.id || accounts[0]?.id || "");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !selectedBank) return;

    setIsLoading(true);
    try {
      const result = await initiateAddMoney(Number(amount), selectedBank);
      if (result.success && result.redirectUrl) {
        window.location.href = result.redirectUrl;
      }
    } catch (error) {
      console.error("Failed to initiate add money:", error);
      setIsLoading(false);
    }
  };

  return (
    <Card className="bg-[#0a0a16]/80 border-white/5 backdrop-blur-xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-[80px] rounded-full pointer-events-none" />
      
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle className="text-lg text-white">Amount</CardTitle>
          <CardDescription className="text-white/50">
            Enter the amount you wish to add to your wallet.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          
          {/* Amount Input */}
          <div className="space-y-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <span className="text-white/50 text-xl font-medium">₹</span>
              </div>
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                className="pl-10 text-2xl h-16 bg-white/[0.02] border-white/10 text-white placeholder:text-white/20 focus-visible:ring-emerald-500/50 transition-all font-semibold"
                required
                min="1"
                disabled={isLoading}
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {presetAmounts.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setAmount(preset.toString())}
                  disabled={isLoading}
                  className="px-4 py-2 rounded-full text-sm font-medium bg-white/5 text-white/70 hover:bg-white/10 hover:text-white border border-white/5 transition-colors disabled:opacity-50"
                >
                  +₹{preset.toLocaleString("en-IN")}
                </button>
              ))}
            </div>
          </div>

          {/* Bank Selection */}
          <div className="space-y-3">
            <Label className="text-white/80">From Bank Account</Label>
            <div className="grid gap-3">
              {accounts.map((acc) => (
                <label
                  key={acc.id}
                  className={`relative flex items-center justify-between p-4 rounded-xl cursor-pointer border transition-all ${
                    selectedBank === acc.id
                      ? "bg-emerald-500/10 border-emerald-500/30"
                      : "bg-white/[0.02] border-white/5 hover:border-white/10 hover:bg-white/[0.04]"
                  } ${isLoading ? "opacity-50 pointer-events-none" : ""}`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                      selectedBank === acc.id ? "bg-emerald-500/20" : "bg-white/5"
                    }`}>
                      <Building2 className={`w-5 h-5 ${selectedBank === acc.id ? "text-emerald-400" : "text-white/50"}`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className={`text-sm font-medium ${selectedBank === acc.id ? "text-emerald-400" : "text-white"}`}>
                          {acc.bankName}
                        </p>
                        {acc.isPrimary && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            <Star className="w-2.5 h-2.5" />
                            Primary
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-white/40">•••• {acc.last4}</p>
                    </div>
                  </div>
                  
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                    selectedBank === acc.id ? "border-emerald-500" : "border-white/20"
                  }`}>
                    {selectedBank === acc.id && <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />}
                  </div>
                  
                  <input
                    type="radio"
                    name="bankAccount"
                    value={acc.id}
                    checked={selectedBank === acc.id}
                    onChange={(e) => setSelectedBank(e.target.value)}
                    className="sr-only"
                    disabled={isLoading}
                  />
                </label>
              ))}

              {accounts.length === 0 && (
                <div className="text-sm text-amber-400 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                  Please link a bank account before adding money.
                </div>
              )}

              <button type="button" disabled={isLoading} className="flex items-center gap-3 p-4 rounded-xl border border-dashed border-white/10 text-white/50 hover:text-white hover:border-white/20 hover:bg-white/[0.02] transition-all disabled:opacity-50">
                <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                  <Plus className="w-5 h-5" />
                </div>
                <span className="text-sm font-medium">Link new bank account</span>
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full h-12 text-base font-semibold bg-white text-black hover:bg-white/90"
            disabled={!amount || Number(amount) <= 0 || accounts.length === 0 || isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              "Proceed to Add Money"
            )}
          </Button>

        </CardContent>
      </form>
    </Card>
  );
}
