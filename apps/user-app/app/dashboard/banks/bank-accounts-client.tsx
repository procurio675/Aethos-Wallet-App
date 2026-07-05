"use client";

import {
  Building2,
  Star,
  CreditCard,
  Shield,
  Plus,
  Trash2,
  Loader2,
  X,
  ChevronDown,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { addBankAccount, deleteBankAccount, setPrimaryBankAccount } from "@/app/actions/bank-accounts";

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

const POPULAR_BANKS = [
  "HDFC Bank",
  "SBI Bank",
  "ICICI Bank",
  "Axis Bank",
  "Kotak Mahindra Bank",
  "PNB Bank",
  "Yes Bank",
  "IndusInd Bank",
];

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
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Add modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState("");
  const [addSuccess, setAddSuccess] = useState(false);

  // Form fields
  const [bankName, setBankName] = useState("");
  const [customBankName, setCustomBankName] = useState("");
  const [accountNo, setAccountNo] = useState("");
  const [ifsc, setIfsc] = useState("");
  const [showBankDropdown, setShowBankDropdown] = useState(false);

  const effectiveBankName = bankName === "__other__" ? customBankName : bankName;

  const resetForm = () => {
    setBankName("");
    setCustomBankName("");
    setAccountNo("");
    setIfsc("");
    setAddError("");
    setAddSuccess(false);
  };

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

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const res = await deleteBankAccount(id);
      if (res.success) {
        setConfirmDeleteId(null);
        router.refresh();
      } else {
        setAddError(res.error || "Failed to remove account");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setDeletingId(null);
    }
  };

  const handleAddBank = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddError("");

    if (!effectiveBankName || effectiveBankName.trim().length < 2) {
      setAddError("Please select or enter a bank name");
      return;
    }
    if (!accountNo || accountNo.length < 8 || accountNo.length > 18) {
      setAddError("Account number must be 8-18 digits");
      return;
    }

    setAddLoading(true);
    try {
      const res = await addBankAccount(effectiveBankName, accountNo, ifsc);
      if (res.success) {
        setAddSuccess(true);
        setTimeout(() => {
          setShowAddModal(false);
          resetForm();
          router.refresh();
        }, 1200);
      } else {
        setAddError(res.error || "Something went wrong");
      }
    } catch {
      setAddError("Network error. Please try again.");
    } finally {
      setAddLoading(false);
    }
  };

  return (
    <>
      <Card className="bg-[#0a0a16]/80 border-white/5 backdrop-blur-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-violet-500/5 blur-[100px] rounded-full pointer-events-none" />
        <CardHeader className="relative z-10 border-b border-white/5 pb-6 mb-6">
          <div className="flex items-center justify-between">
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
            {accounts.length < 5 && (
              <button
                onClick={() => { resetForm(); setShowAddModal(true); }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-300 text-sm font-medium hover:bg-violet-500/20 hover:border-violet-500/30 transition-all duration-200"
              >
                <Plus className="w-4 h-4" />
                Link Account
              </button>
            )}
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
                Link a bank account to start adding money to your wallet and making transfers.
              </p>
              <button
                onClick={() => { resetForm(); setShowAddModal(true); }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-300 text-sm font-medium hover:bg-violet-500/20 hover:border-violet-500/30 transition-all duration-200"
              >
                <Plus className="w-4 h-4" />
                Link Your First Bank Account
              </button>
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
                      <div className="flex flex-col items-end justify-center gap-2">
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

                        {/* Delete */}
                        {confirmDeleteId === account.id ? (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleDelete(account.id)}
                              disabled={deletingId !== null}
                              className="text-xs font-medium text-red-400 hover:text-red-300 flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-all disabled:opacity-50"
                            >
                              {deletingId === account.id ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                "Confirm"
                              )}
                            </button>
                            <button
                              onClick={() => setConfirmDeleteId(null)}
                              className="text-xs text-white/40 hover:text-white/60 px-2 py-1.5 rounded-lg hover:bg-white/5 transition-all"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmDeleteId(account.id)}
                            className="text-xs font-medium text-white/30 hover:text-red-400 transition-colors flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-red-500/10"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Remove
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
                Your bank account details are encrypted and stored securely. Account numbers are masked — only the last 4 digits are displayed. You can link up to 5 bank accounts.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add Bank Account Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 backdrop-blur-sm"
            style={{ backgroundColor: "rgba(0,0,0,0.7)" }}
            onClick={() => { if (!addLoading) { setShowAddModal(false); resetForm(); } }}
          />
          <div className="relative w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-slide-up bg-[#0e0e1a] border border-white/10">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-violet-500/10 flex items-center justify-center">
                  <Building2 className="w-4 h-4 text-violet-400" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-white">Link Bank Account</h2>
                  <p className="text-xs text-white/40">Connect your bank to start transacting</p>
                </div>
              </div>
              <button
                onClick={() => { if (!addLoading) { setShowAddModal(false); resetForm(); } }}
                className="p-1.5 rounded-lg text-white/40 hover:text-white/60 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleAddBank} className="p-6 flex flex-col gap-4">
              {/* Bank Name */}
              <div>
                <label className="block text-xs font-medium text-white/60 mb-1.5">Bank Name</label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowBankDropdown(!showBankDropdown)}
                    className="w-full rounded-xl px-4 py-2.5 text-sm text-left flex items-center justify-between bg-white/[0.03] border border-white/10 text-white focus:outline-none focus:border-violet-500/40 transition-colors"
                  >
                    <span className={effectiveBankName ? "text-white" : "text-white/30"}>
                      {effectiveBankName || "Select a bank"}
                    </span>
                    <ChevronDown className={`w-4 h-4 text-white/30 transition-transform ${showBankDropdown ? "rotate-180" : ""}`} />
                  </button>

                  {showBankDropdown && (
                    <div className="absolute z-50 mt-1 w-full rounded-xl bg-[#12121e] border border-white/10 shadow-2xl overflow-hidden max-h-52 overflow-y-auto">
                      {POPULAR_BANKS.map((bank) => (
                        <button
                          key={bank}
                          type="button"
                          onClick={() => { setBankName(bank); setShowBankDropdown(false); }}
                          className={`w-full text-left px-4 py-2.5 text-sm hover:bg-white/5 transition-colors ${
                            bankName === bank ? "text-violet-400 bg-violet-500/5" : "text-white/70"
                          }`}
                        >
                          {bank}
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => { setBankName("__other__"); setShowBankDropdown(false); }}
                        className={`w-full text-left px-4 py-2.5 text-sm hover:bg-white/5 transition-colors border-t border-white/5 ${
                          bankName === "__other__" ? "text-violet-400 bg-violet-500/5" : "text-white/50"
                        }`}
                      >
                        Other (type manually)
                      </button>
                    </div>
                  )}
                </div>

                {bankName === "__other__" && (
                  <input
                    type="text"
                    value={customBankName}
                    onChange={(e) => setCustomBankName(e.target.value)}
                    placeholder="Enter bank name"
                    className="mt-2 w-full rounded-xl px-4 py-2.5 text-sm bg-white/[0.03] border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-violet-500/40 transition-colors"
                  />
                )}
              </div>

              {/* Account Number */}
              <div>
                <label className="block text-xs font-medium text-white/60 mb-1.5">Account Number</label>
                <input
                  type="text"
                  value={accountNo}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "");
                    if (val.length <= 18) setAccountNo(val);
                  }}
                  placeholder="Enter 8-18 digit account number"
                  required
                  className="w-full rounded-xl px-4 py-2.5 text-sm bg-white/[0.03] border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-violet-500/40 transition-colors font-mono tracking-wider"
                />
                {accountNo.length > 0 && accountNo.length < 8 && (
                  <p className="text-[11px] text-amber-400/70 mt-1">Minimum 8 digits required</p>
                )}
              </div>

              {/* IFSC Code */}
              <div>
                <label className="block text-xs font-medium text-white/60 mb-1.5">
                  IFSC Code <span className="text-white/25">(optional)</span>
                </label>
                <input
                  type="text"
                  value={ifsc}
                  onChange={(e) => setIfsc(e.target.value.toUpperCase().slice(0, 11))}
                  placeholder="e.g. HDFC0001234"
                  className="w-full rounded-xl px-4 py-2.5 text-sm bg-white/[0.03] border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-violet-500/40 transition-colors font-mono tracking-wider"
                />
              </div>

              {/* Error */}
              {addError && (
                <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                  {addError}
                </p>
              )}

              {/* Success */}
              {addSuccess && (
                <p className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2 flex items-center gap-2">
                  ✓ Bank account linked successfully!
                </p>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={addLoading || addSuccess}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm font-semibold hover:from-violet-500 hover:to-indigo-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-violet-500/20"
              >
                {addLoading ? "Linking..." : addSuccess ? "Linked!" : "Link Bank Account"}
              </button>

              <p className="text-[11px] text-white/25 text-center">
                This is a demo app. Use PIN <span className="font-mono text-white/40">1234</span> when authorizing deposits.
              </p>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
