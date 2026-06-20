"use client";

import { useRef, useEffect } from "react";

const features = [
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M10 2L2 6v8l8 4 8-4V6l-8-4z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
        <path d="M2 6l8 4 8-4" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M10 10v8" stroke="currentColor" strokeWidth="1.5"/>
      </svg>
    ),
    title: "Instant Transfers",
    description:
      "Move money between wallets and bank accounts in under 2 seconds — 24/7, no waiting.",
    accent: "from-violet-500/20 to-violet-500/0",
    iconColor: "text-violet-400",
    border: "border-violet-500/10",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <rect x="2" y="4" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M2 8h16" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M6 12h2M10 12h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
    title: "Linked Bank Accounts",
    description:
      "Connect multiple bank accounts. Add funds directly — we handle the rest securely.",
    accent: "from-indigo-500/20 to-indigo-500/0",
    iconColor: "text-indigo-400",
    border: "border-indigo-500/10",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M7 10l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: "P2P Payments",
    description:
      "Split bills, pay friends, or reimburse colleagues instantly using just their email.",
    accent: "from-purple-500/20 to-purple-500/0",
    iconColor: "text-purple-400",
    border: "border-purple-500/10",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M10 2v4M10 14v4M4.22 4.22l2.83 2.83M12.95 12.95l2.83 2.83M2 10h4M14 10h4M4.22 15.78l2.83-2.83M12.95 7.05l2.83-2.83" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
    title: "Real-time Receipts",
    description:
      "Every transaction is tracked with a full audit trail and instant notifications.",
    accent: "from-blue-500/20 to-blue-500/0",
    iconColor: "text-blue-400",
    border: "border-blue-500/10",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M3 7h14M3 10h14M3 13h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
    title: "Transaction History",
    description:
      "Filterable, searchable transaction log so you always know where your money went.",
    accent: "from-cyan-500/20 to-cyan-500/0",
    iconColor: "text-cyan-400",
    border: "border-cyan-500/10",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <rect x="4" y="2" width="12" height="16" rx="2" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M7 7h6M7 10h4M7 13h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
    title: "Bank-Grade Security",
    description:
      "End-to-end encryption, idempotent transactions, and server-side double-spend prevention.",
    accent: "from-emerald-500/20 to-emerald-500/0",
    iconColor: "text-emerald-400",
    border: "border-emerald-500/10",
  },
];

export default function FeaturesSection() {
  return (
    <section id="features" className="relative py-32 px-6">
      {/* subtle background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-violet-600/5 blur-[100px] rounded-full pointer-events-none" />

      <div className="max-w-6xl mx-auto relative">
        {/* Section header */}
        <div className="text-center mb-16">
          <div className="inline-block text-xs font-semibold uppercase tracking-widest text-violet-400/70 mb-4">
            Everything you need
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-4">
            Built for how money actually moves
          </h2>
          <p className="text-white/40 text-lg max-w-xl mx-auto leading-relaxed font-light">
            Every feature is designed around real-world payment flows — reliable, fast, and transparent.
          </p>
        </div>

        {/* Feature grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-white/[0.04] rounded-2xl overflow-hidden border border-white/[0.04]">
          {features.map((f, i) => (
            <div
              key={f.title}
              className={`relative group p-7 bg-[#080810] hover:bg-white/[0.02] transition-colors duration-300 cursor-default`}
            >
              {/* Gradient accent on hover */}
              <div className={`absolute inset-0 bg-gradient-to-b ${f.accent} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

              <div className="relative">
                <div className={`w-9 h-9 rounded-xl border ${f.border} bg-white/[0.03] flex items-center justify-center mb-4 ${f.iconColor}`}>
                  {f.icon}
                </div>
                <h3 className="text-sm font-semibold text-white mb-2">{f.title}</h3>
                <p className="text-sm text-white/40 leading-relaxed">{f.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
