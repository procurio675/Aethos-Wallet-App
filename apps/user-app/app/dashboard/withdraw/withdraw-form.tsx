"use client";

import { useState } from "react";
import { Building2, Plus, Loader2, AlertCircle, ShieldCheck, CheckCircle2, Eye, EyeOff, Lock, Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { initiateWithdrawMoney } from "@/app/actions/withdraw-money";
import { useRouter } from "next/navigation";

type BankAccountProps = {
  id: string;
  bankName: string;
  last4: string;
  isPrimary: boolean;
};

const presetAmounts = [500, 1000, 5000, 10000];

export default function WithdrawForm({ accounts, currentBalance }: { accounts: BankAccountProps[], currentBalance: number }) {
  const router = useRouter();
  const [amount, setAmount] = useState("");
  const primaryAccount = accounts.find((acc) => acc.isPrimary);
  const [selectedBank, setSelectedBank] = useState(primaryAccount?.id || accounts[0]?.id || "");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Password confirmation dialog state
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // Success state
  const [successData, setSuccessData] = useState<{ amount: number; bankName: string; last4: string; token: string } | null>(null);

  const parsedAmount = Number(amount);
  const isOverBalance = parsedAmount > currentBalance;

  // Step 1: User clicks "Proceed to Withdraw" → show password confirmation dialog
  const handleProceed = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !selectedBank || isOverBalance) return;
    
    setError(null);
    setPassword("");
    setPasswordError(null);
    setShowPassword(false);
    setShowPasswordDialog(true);
  };

  // Step 2: User confirms with their password → call server action
  const handleConfirmWithdrawal = async () => {
    if (!password) {
      setPasswordError("Please enter your password");
      return;
    }

    setIsLoading(true);
    setPasswordError(null);
    
    try {
      const selectedBankAccount = accounts.find(acc => acc.id === selectedBank);
      const result = await initiateWithdrawMoney(parsedAmount, selectedBank, password);
      
      if (result.success) {
        setShowPasswordDialog(false);
        setSuccessData({
          amount: parsedAmount,
          bankName: selectedBankAccount?.bankName || "Bank Account",
          last4: selectedBankAccount?.last4 || "****",
          token: result.token || "",
        });
        setAmount("");
        // Trigger a router refresh so the page re-fetches server data (balance, etc.)
        router.refresh();
      } else {
        // If password was wrong, show error inside the dialog
        if (result.error?.toLowerCase().includes("password")) {
          setPasswordError(result.error);
        } else {
          // Other errors (insufficient balance, etc.) — close dialog and show on form
          setShowPasswordDialog(false);
          setError(result.error || "An unknown error occurred");
        }
      }
    } catch (error) {
      console.error("Failed to submit withdrawal", error);
      setShowPasswordDialog(false);
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Success view — shown after a successful withdrawal initiation
  if (successData) {
    return (
      <Card className="bg-[#0a0a16]/80 border-white/5 backdrop-blur-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-[80px] rounded-full pointer-events-none" />
        
        <CardContent className="py-12 px-6 text-center relative z-10">
          {/* Animated success icon */}
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-6 animate-fade-in">
            <CheckCircle2 className="w-8 h-8 text-emerald-400" />
          </div>
          
          <h2 className="text-xl font-semibold text-white mb-2 animate-fade-in">
            Withdrawal Initiated
          </h2>
          <p className="text-white/50 text-sm mb-6 max-w-sm mx-auto animate-fade-in">
            ₹{successData.amount.toLocaleString("en-IN")} is being transferred to {successData.bankName} (•••• {successData.last4}).
          </p>

          {/* Pending status badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 mb-8 animate-fade-in">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
            <span className="text-sm font-medium text-amber-400">Processing...</span>
          </div>

          <p className="text-xs text-white/30 mb-6">
            Your wallet balance has been updated. The funds will arrive in your bank account shortly.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={() => setSuccessData(null)}
              variant="outline"
              className="bg-white/5 border-white/10 text-white hover:bg-white/10"
            >
              Withdraw More
            </Button>
            <Button
              onClick={() => router.push("/dashboard")}
              className="bg-white text-black hover:bg-white/90"
            >
              Go to Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="bg-[#0a0a16]/80 border-white/5 backdrop-blur-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/10 blur-[80px] rounded-full pointer-events-none" />
        
        <form onSubmit={handleProceed}>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-lg text-white">Amount</CardTitle>
                <CardDescription className="text-white/50">
                  Enter the amount you wish to withdraw to your bank.
                </CardDescription>
              </div>
              <div className="text-right">
                <span className="text-xs text-white/50 uppercase tracking-wider font-semibold">Available Balance</span>
                <p className="text-lg font-semibold text-white mt-1">₹{currentBalance.toLocaleString("en-IN")}</p>
              </div>
            </div>
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
                  className={`pl-10 text-2xl h-16 bg-white/[0.02] border-white/10 text-white placeholder:text-white/20 transition-all font-semibold ${isOverBalance ? "border-red-500/50 focus-visible:ring-red-500/50" : "focus-visible:ring-emerald-500/50"}`}
                  required
                  min="1"
                  disabled={isLoading}
                />
                {isOverBalance && (
                  <div className="absolute -bottom-6 left-0 flex items-center gap-1.5 text-red-400 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    Amount exceeds available balance
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                {presetAmounts.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setAmount(preset.toString())}
                    disabled={isLoading || preset > currentBalance}
                    className="px-4 py-2 rounded-full text-sm font-medium bg-white/5 text-white/70 hover:bg-white/10 hover:text-white border border-white/5 transition-colors disabled:opacity-30 disabled:pointer-events-none"
                  >
                    ₹{preset.toLocaleString("en-IN")}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setAmount(currentBalance.toString())}
                  disabled={isLoading || currentBalance <= 0}
                  className="px-4 py-2 rounded-full text-sm font-medium bg-white/5 text-emerald-400 hover:bg-white/10 hover:text-emerald-300 border border-white/5 transition-colors disabled:opacity-30 disabled:pointer-events-none"
                >
                  Max
                </button>
              </div>
            </div>

            {/* Bank Selection */}
            <div className="space-y-3">
              <Label className="text-white/80">To Bank Account</Label>
              <div className="grid gap-3">
                {accounts.map((acc) => (
                  <label
                    key={acc.id}
                    className={`relative flex items-center justify-between p-4 rounded-xl cursor-pointer border transition-all ${
                      selectedBank === acc.id
                        ? "bg-white/10 border-white/20"
                        : "bg-white/[0.02] border-white/5 hover:border-white/10 hover:bg-white/[0.04]"
                    } ${isLoading ? "opacity-50 pointer-events-none" : ""}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                        selectedBank === acc.id ? "bg-white/10" : "bg-white/5"
                      }`}>
                        <Building2 className={`w-5 h-5 ${selectedBank === acc.id ? "text-white" : "text-white/50"}`} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className={`text-sm font-medium ${selectedBank === acc.id ? "text-white" : "text-white"}`}>
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
                      selectedBank === acc.id ? "border-white" : "border-white/20"
                    }`}>
                      {selectedBank === acc.id && <div className="w-2.5 h-2.5 rounded-full bg-white" />}
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
                    Please link a bank account before withdrawing money.
                  </div>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="space-y-4">
              {error && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-start gap-2 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <p>{error}</p>
                </div>
              )}
              
              <Button
                type="submit"
                className="w-full h-12 text-base font-semibold bg-white text-black hover:bg-white/90"
                disabled={!amount || parsedAmount <= 0 || accounts.length === 0 || isLoading || isOverBalance}
              >
                Proceed to Withdraw
              </Button>
            </div>

          </CardContent>
        </form>
      </Card>

      {/* Password Confirmation Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={(open) => {
        if (!isLoading) {
          setShowPasswordDialog(open);
          if (!open) {
            setPassword("");
            setPasswordError(null);
          }
        }
      }}>
        <DialogContent className="bg-[#12121e] border border-white/10 sm:max-w-md" showCloseButton={!isLoading}>
          <DialogHeader>
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center mb-2">
              <ShieldCheck className="w-6 h-6 text-amber-400" />
            </div>
            <DialogTitle className="text-white text-lg">Confirm Withdrawal</DialogTitle>
            <DialogDescription className="text-white/50">
              Enter your account password to authorize withdrawing{" "}
              <span className="text-white font-semibold">₹{parsedAmount.toLocaleString("en-IN")}</span>{" "}
              to your bank account.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Transaction Summary */}
            <div className="rounded-xl bg-white/[0.03] border border-white/5 p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-white/50">Amount</span>
                <span className="text-white font-medium">₹{parsedAmount.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/50">To</span>
                <span className="text-white font-medium">
                  {accounts.find(a => a.id === selectedBank)?.bankName} (•••• {accounts.find(a => a.id === selectedBank)?.last4})
                </span>
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <Label className="text-white/80 text-sm">Password</Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="w-4 h-4 text-white/30" />
                </div>
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setPasswordError(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleConfirmWithdrawal();
                    }
                  }}
                  placeholder="Enter your password"
                  className={`pl-9 pr-10 bg-white/[0.02] border-white/10 text-white placeholder:text-white/20 focus-visible:ring-amber-500/50 ${
                    passwordError ? "border-red-500/50" : ""
                  }`}
                  disabled={isLoading}
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-white/30 hover:text-white/60 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {passwordError && (
                <p className="text-red-400 text-sm flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {passwordError}
                </p>
              )}
            </div>
          </div>

          <DialogFooter className="bg-transparent border-white/5">
            <Button
              variant="outline"
              onClick={() => {
                setShowPasswordDialog(false);
                setPassword("");
                setPasswordError(null);
              }}
              disabled={isLoading}
              className="bg-white/5 border-white/10 text-white hover:bg-white/10"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmWithdrawal}
              disabled={!password || isLoading}
              className="bg-white text-black hover:bg-white/90"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Authorizing...
                </>
              ) : (
                "Confirm Withdrawal"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
