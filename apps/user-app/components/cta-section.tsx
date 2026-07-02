"use client";

import Link from "next/link";

const steps = [
  {
    step: "01",
    title: "Create your account",
    desc: "Sign up with your email in under 60 seconds. No paperwork.",
  },
  {
    step: "02",
    title: "Link your bank",
    desc: "Connect your savings or current account. Add funds instantly.",
  },
  {
    step: "03",
    title: "Send & receive",
    desc: "Transfer to anyone on Aethos — or withdraw back to your bank anytime.",
  },
];

export default function CtaSection() {
  return (
    <section id="security" className="relative py-32 px-6">
      {/* How it works */}
      <div className="max-w-5xl mx-auto mb-32">
        <div className="text-center mb-14">
          <div className="inline-block text-xs font-semibold uppercase tracking-widest text-violet-400/70 mb-4">
            How it works
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
            Up and running in 3 steps
          </h2>
        </div>

        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Connecting line */}
          <div className="absolute top-5 left-[calc(16.6%+1rem)] right-[calc(16.6%+1rem)] h-px bg-gradient-to-r from-violet-500/20 via-violet-500/40 to-violet-500/20 hidden md:block" />

          {steps.map(({ step, title, desc }) => (
            <div key={step} className="relative flex flex-col items-center text-center group">
              {/* Step number bubble */}
              <div className="w-10 h-10 rounded-full border border-violet-500/30 bg-violet-500/10 flex items-center justify-center text-xs font-bold text-violet-300 mb-5 shrink-0 z-10 group-hover:border-violet-400/50 transition-colors">
                {step}
              </div>
              <h3 className="text-sm font-semibold text-white mb-2">{title}</h3>
              <p className="text-sm text-white/40 leading-relaxed max-w-[200px]">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Final CTA banner */}
      <div className="max-w-4xl mx-auto">
        <div className="relative rounded-3xl border border-white/[0.06] bg-gradient-to-b from-white/[0.04] to-transparent overflow-hidden p-12 text-center">
          {/* Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[200px] bg-violet-600/15 blur-[80px] rounded-full pointer-events-none" />

          <div className="relative">
            <p className="text-xs font-semibold uppercase tracking-widest text-violet-400/70 mb-4">
              Get started today
            </p>
            <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight mb-5">
              Your wallet.
              <br />
              <span className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
                Your control.
              </span>
            </h2>
            <p className="text-white/40 text-base mb-10 max-w-md mx-auto leading-relaxed">
              Join thousands of users who trust Aethos for their everyday payments.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/auth/signup">
                <button
                  id="cta-signup-btn"
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-white text-black text-sm font-semibold hover:bg-white/90 transition-all duration-200 shadow-[0_0_40px_-4px_rgba(139,92,246,0.4)]"
                >
                  Create free account
                </button>
              </Link>
              <Link href="/auth/signin">
                <button
                  id="cta-signin-btn"
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full border border-white/10 text-white/70 text-sm font-medium hover:text-white hover:border-white/20 transition-all duration-200"
                >
                  Sign in
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
