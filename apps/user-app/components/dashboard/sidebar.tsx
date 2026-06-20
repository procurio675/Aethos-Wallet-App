"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Plus, Send, ArrowDownToLine, History, Building2 } from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: <LayoutDashboard className="w-5 h-5" /> },
    { name: "Add Money", href: "/dashboard/add-money", icon: <Plus className="w-5 h-5" /> },
    { name: "Send Money", href: "/dashboard/send-money", icon: <Send className="w-5 h-5" /> },
    { name: "Withdraw", href: "/dashboard/withdraw", icon: <ArrowDownToLine className="w-5 h-5" /> },
    { name: "All Transactions", href: "/dashboard/transactions", icon: <History className="w-5 h-5" /> },
    { name: "Bank Accounts", href: "/dashboard/banks", icon: <Building2 className="w-5 h-5" /> },
  ];

  return (
    <aside className="w-64 fixed inset-y-0 left-0 z-40 bg-[#080810]/80 backdrop-blur-2xl border-r border-white/5 pt-20 pb-8 flex flex-col hidden md:flex">
      {/* Glow Effect */}
      <div className="absolute top-1/4 -left-12 w-48 h-48 bg-violet-600/10 blur-[80px] rounded-full pointer-events-none" />

      <div className="flex-1 overflow-y-auto py-6 flex flex-col gap-2 px-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group overflow-hidden ${
                isActive
                  ? "text-white bg-white/5 shadow-[0_0_20px_rgba(139,92,246,0.1)] border border-white/10"
                  : "text-white/50 hover:text-white hover:bg-white/[0.02]"
              }`}
            >
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-violet-500 rounded-r-full shadow-[0_0_10px_rgba(139,92,246,0.8)]" />
              )}
              <div className={`transition-colors ${isActive ? "text-violet-400" : "group-hover:text-violet-400/70"}`}>
                {item.icon}
              </div>
              <span className="font-medium text-sm tracking-wide">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
