"use client";

import Link from "next/link";
import { LogOut, User, Bell } from "lucide-react";
import { signOut } from "next-auth/react";

export default function DashboardNavbar({ userName }: { userName: string }) {
  return (
    <header className="sticky top-0 inset-x-0 z-50 bg-background/80 backdrop-blur-xl border-b border-white/5">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2.5 group">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2 4h10M2 7h6M2 10h8" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          <span className="text-sm font-semibold tracking-tight text-white">PayFlow</span>
        </Link>

        {/* Right Nav */}
        <div className="flex items-center gap-4">
          <button className="relative p-2 text-white/50 hover:text-white transition-colors rounded-full hover:bg-white/5">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-violet-500 rounded-full border-2 border-[#080810]" />
          </button>
          
          <div className="h-6 w-px bg-white/10" />

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-sm font-medium text-white">{userName}</span>
              <span className="text-xs text-white/40">Verified Account</span>
            </div>
            <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white/70 border border-white/10">
              <User className="w-4 h-4" />
            </div>
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="p-2 text-white/50 hover:text-destructive transition-colors rounded-full hover:bg-white/5 ml-1"
              title="Sign out"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
