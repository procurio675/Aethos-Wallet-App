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
    <aside
      className="w-64 fixed inset-y-0 left-0 z-40 backdrop-blur-2xl border-r pt-20 pb-8 flex-col hidden md:flex transition-colors duration-300"
      style={{ backgroundColor: "color-mix(in srgb, var(--surface-base) 80%, transparent)", borderColor: "var(--border-subtle)" }}
    >
      {/* Glow Effect */}
      <div className="absolute top-1/4 -left-12 w-48 h-48 rounded-full pointer-events-none" style={{ backgroundColor: "var(--glow-violet)", filter: "blur(80px)" }} />

      <div className="flex-1 overflow-y-auto py-6 flex flex-col gap-2 px-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group overflow-hidden`}
              style={{
                color: isActive ? "var(--text-primary)" : "var(--text-secondary)",
                backgroundColor: isActive ? "var(--surface-active)" : "transparent",
                border: isActive ? "1px solid var(--border-default)" : "1px solid transparent",
              }}
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
