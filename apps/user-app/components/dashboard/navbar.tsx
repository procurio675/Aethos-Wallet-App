"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { LogOut, Bell, CheckCircle2, ChevronDown, Lock, Check, X, Eye, EyeOff } from "lucide-react";
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
  userId,
  userEmail,
  notifications = [],
}: {
  userName: string;
  userId: string;
  userEmail: string;
  notifications?: Notification[];
}) {
  // Notification dropdown
  const [isBellOpen, setIsBellOpen] = useState(false);
  const bellRef = useRef<HTMLDivElement>(null);
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // User settings dropdown
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);



  // Change password modal
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) setIsBellOpen(false);
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) setIsUserMenuOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleBellOpen = async () => {
    setIsBellOpen(!isBellOpen);
    if (!isBellOpen && unreadCount > 0) await markNotificationsAsRead();
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters.");
      return;
    }
    setPasswordLoading(true);
    try {
      const res = await fetch("/api/user/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setPasswordError(data.error ?? "Something went wrong.");
      } else {
        setPasswordSuccess(true);
        setTimeout(() => {
          setShowPasswordModal(false);
          setPasswordSuccess(false);
          setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
        }, 1800);
      }
    } catch {
      setPasswordError("Network error. Please try again.");
    } finally {
      setPasswordLoading(false);
    }
  };

  const initials = userName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <>
      <header
        className="sticky top-0 inset-x-0 z-50 backdrop-blur-xl border-b transition-colors duration-300"
        style={{ backgroundColor: "color-mix(in srgb, var(--surface-base) 80%, transparent)", borderColor: "var(--border-subtle)" }}
      >
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-3 group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/aethos-logo.png"
              alt="Aethos"
              style={{ width: 56, height: 56, objectFit: "contain" }}
            />
            <span className="text-xl font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>Aethos</span>
          </Link>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* Bell */}
            <div className="relative" ref={bellRef}>
              <button
                onClick={handleBellOpen}
                className="relative p-2 rounded-full transition-colors"
                style={{ color: isBellOpen ? "var(--text-primary)" : "var(--text-secondary)" }}
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-violet-500 rounded-full" style={{ borderWidth: 2, borderColor: "var(--surface-base)" }} />
                )}
              </button>

              {isBellOpen && (
                <div
                  className="absolute right-0 mt-2 w-80 rounded-xl shadow-2xl overflow-hidden z-50 animate-fade-in"
                  style={{ backgroundColor: "var(--surface-overlay)", border: "1px solid var(--border-default)" }}
                >
                  <div className="p-4 border-b" style={{ borderColor: "var(--border-subtle)" }}>
                    <h3 className="font-semibold" style={{ color: "var(--text-primary)" }}>Notifications</h3>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-sm" style={{ color: "var(--text-muted)" }}>No notifications yet.</div>
                    ) : (
                      <div className="flex flex-col">
                        {notifications.map((notif) => (
                          <div
                            key={notif.id}
                            className="p-4 flex gap-3"
                            style={{
                              borderBottom: "1px solid var(--border-subtle)",
                              opacity: notif.isRead ? 0.6 : 1,
                            }}
                          >
                            <div className="shrink-0 mt-0.5">
                              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                            </div>
                            <div>
                              <p className="text-sm" style={{ color: "var(--text-primary)" }}>{notif.message}</p>
                              <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                                {new Date(notif.createdAt).toLocaleString("en-IN", {
                                  month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
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

            <div className="h-6 w-px" style={{ backgroundColor: "var(--border-default)" }} />

            {/* User menu */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2.5 px-3 py-1.5 rounded-full transition-colors group"
                style={{ color: "var(--text-primary)" }}
              >
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-violet-500/20">
                  {initials}
                </div>
                <div className="hidden sm:flex flex-col items-start">
                  <span className="text-sm font-semibold leading-tight" style={{ color: "var(--text-primary)" }}>{userName}</span>
                  <span className="text-[11px] text-violet-400 leading-tight">Verified Account</span>
                </div>
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-200 ${isUserMenuOpen ? "rotate-180" : ""}`}
                  style={{ color: "var(--text-muted)" }}
                />
              </button>

              {/* Dropdown */}
              {isUserMenuOpen && (
                <div
                  className="absolute right-0 mt-2 w-72 rounded-2xl shadow-2xl overflow-hidden z-50 animate-fade-in"
                  style={{ backgroundColor: "var(--surface-overlay)", border: "1px solid var(--border-default)" }}
                >
                  {/* Profile header */}
                  <div className="p-4 bg-gradient-to-br from-violet-500/10 to-indigo-600/5" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white text-lg font-bold shadow-lg shadow-violet-500/30 shrink-0">
                        {initials}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold truncate" style={{ color: "var(--text-primary)" }}>{userName}</p>
                        <p className="text-xs truncate" style={{ color: "var(--text-secondary)" }}>{userEmail}</p>
                        <div className="flex items-center gap-1 mt-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          <span className="text-[11px] text-emerald-400 font-medium">Verified</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Menu items */}
                  <div className="p-2">
                    {/* Change Password */}
                    <button
                      onClick={() => { setIsUserMenuOpen(false); setShowPasswordModal(true); }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-150 group"
                      style={{ color: "var(--text-secondary)" }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "var(--surface-hover)"}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                    >
                      <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0 group-hover:bg-amber-500/20 transition-colors">
                        <Lock className="w-4 h-4 text-amber-400" />
                      </div>
                      <div className="text-left">
                        <p className="font-medium" style={{ color: "var(--text-primary)" }}>Change Password</p>
                        <p className="text-[11px]" style={{ color: "var(--text-faint)" }}>Update your account password</p>
                      </div>
                    </button>

                    <div className="my-1.5" style={{ borderTop: "1px solid var(--border-subtle)" }} />

                    {/* Sign Out */}
                    <button
                      onClick={() => signOut({ callbackUrl: "/" })}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm hover:bg-red-500/10 transition-all duration-150 group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center shrink-0 group-hover:bg-red-500/20 transition-colors">
                        <LogOut className="w-4 h-4 text-red-400" />
                      </div>
                      <div className="text-left">
                        <p className="font-medium text-red-400">Sign Out</p>
                        <p className="text-[11px]" style={{ color: "var(--text-faint)" }}>End your current session</p>
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 backdrop-blur-sm"
            style={{ backgroundColor: "rgba(0,0,0,0.7)" }}
            onClick={() => setShowPasswordModal(false)}
          />
          <div
            className="relative w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-slide-up"
            style={{ backgroundColor: "var(--surface-overlay)", border: "1px solid var(--border-default)" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center">
                  <Lock className="w-4 h-4 text-amber-400" />
                </div>
                <div>
                  <h2 className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>Change Password</h2>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>Update your account password</p>
                </div>
              </div>
              <button
                onClick={() => setShowPasswordModal(false)}
                className="p-1.5 rounded-lg transition-colors"
                style={{ color: "var(--text-muted)" }}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleChangePassword} className="p-6 flex flex-col gap-4">
              {/* Current password */}
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>Current Password</label>
                <div className="relative">
                  <input
                    type={showCurrent ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                    placeholder="Enter current password"
                    className="w-full rounded-xl px-4 py-2.5 text-sm focus:outline-none pr-10 transition-colors"
                    style={{
                      backgroundColor: "var(--surface-hover)",
                      border: "1px solid var(--border-default)",
                      color: "var(--text-primary)",
                    }}
                  />
                  <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }}>
                    {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* New password */}
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>New Password</label>
                <div className="relative">
                  <input
                    type={showNew ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    placeholder="Min. 6 characters"
                    className="w-full rounded-xl px-4 py-2.5 text-sm focus:outline-none pr-10 transition-colors"
                    style={{
                      backgroundColor: "var(--surface-hover)",
                      border: "1px solid var(--border-default)",
                      color: "var(--text-primary)",
                    }}
                  />
                  <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }}>
                    {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm password */}
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>Confirm New Password</label>
                <div className="relative">
                  <input
                    type={showConfirm ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    placeholder="Repeat new password"
                    className="w-full rounded-xl px-4 py-2.5 text-sm focus:outline-none pr-10 transition-colors"
                    style={{
                      backgroundColor: "var(--surface-hover)",
                      border: "1px solid var(--border-default)",
                      color: "var(--text-primary)",
                    }}
                  />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }}>
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {passwordError && (
                <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{passwordError}</p>
              )}

              {passwordSuccess && (
                <p className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2 flex items-center gap-2">
                  <Check className="w-3.5 h-3.5" /> Password updated successfully!
                </p>
              )}

              <button
                type="submit"
                disabled={passwordLoading || passwordSuccess}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm font-semibold hover:from-violet-500 hover:to-indigo-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-violet-500/20"
              >
                {passwordLoading ? "Updating…" : passwordSuccess ? "Updated!" : "Update Password"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
