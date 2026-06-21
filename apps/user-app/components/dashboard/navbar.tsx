"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { LogOut, User, Bell, CheckCircle2 } from "lucide-react";
import { signOut } from "next-auth/react";
import { markNotificationsAsRead } from "@/app/actions/notifications";

type Notification = {
  id: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
};

export default function DashboardNavbar({ 
  userName, 
  notifications = [] 
}: { 
  userName: string;
  notifications?: Notification[];
}) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const unreadCount = notifications.filter(n => !n.isRead).length;

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleOpenDropdown = async () => {
    setIsDropdownOpen(!isDropdownOpen);
    if (!isDropdownOpen && unreadCount > 0) {
      // Mark as read in the background
      await markNotificationsAsRead();
    }
  };

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
          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={handleOpenDropdown}
              className={`relative p-2 transition-colors rounded-full ${isDropdownOpen ? 'bg-white/10 text-white' : 'text-white/50 hover:text-white hover:bg-white/5'}`}
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-violet-500 rounded-full border-2 border-[#080810]" />
              )}
            </button>

            {/* Notifications Dropdown */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-[#12121e] border border-white/10 rounded-xl shadow-2xl shadow-black overflow-hidden z-50 animate-fade-in">
                <div className="p-4 border-b border-white/5 bg-white/[0.02]">
                  <h3 className="font-semibold text-white">Notifications</h3>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-sm text-white/40">
                      No notifications yet.
                    </div>
                  ) : (
                    <div className="flex flex-col">
                      {notifications.map((notif) => (
                        <div 
                          key={notif.id} 
                          className={`p-4 border-b border-white/5 last:border-0 flex gap-3 ${notif.isRead ? 'opacity-60' : 'bg-white/[0.02]'}`}
                        >
                          <div className="shrink-0 mt-0.5">
                            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                          </div>
                          <div>
                            <p className="text-sm text-white">{notif.message}</p>
                            <p className="text-xs text-white/40 mt-1">
                              {new Date(notif.createdAt).toLocaleString('en-IN', {
                                month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                              })}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          
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
