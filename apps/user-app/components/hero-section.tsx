"use client";

import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="relative flex items-center justify-center overflow-hidden py-4">
      {/* Radial glow background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[#080810]" />
        {/* Primary violet glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[600px] rounded-full bg-violet-600/10 blur-[120px]" />
        {/* Secondary indigo */}
        <div className="absolute top-1/3 left-1/3 w-[400px] h-[400px] rounded-full bg-indigo-500/8 blur-[100px]" />
        {/* Grid lines */}
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)
            `,
            backgroundSize: "80px 80px",
          }}
        />
        {/* Vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,#080810_100%)]" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center pt-28 pb-16">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-violet-500/20 bg-violet-500/5 text-violet-300 text-xs font-medium mb-8 animate-fade-in">
          <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
          Instant bank-to-wallet settlements
        </div>

        {/* Headline */}
        <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight leading-[1.08] mb-6 animate-slide-up">
          <span className="text-white">Send money</span>
          <br />
          <span className="bg-gradient-to-r from-violet-400 via-indigo-300 to-violet-400 bg-clip-text text-transparent">
            at the speed of thought
          </span>
        </h1>

        {/* Subheading */}
        <p className="text-lg md:text-xl text-white/40 max-w-2xl mx-auto leading-relaxed mb-10 font-light animate-slide-up-delay">
          Aethos is a secure digital wallet built for India.
          Transfer funds instantly, track every rupee, and stay in control.
        </p>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center animate-slide-up-delay-2">
          <Link href="/auth/signup">
            <button
              id="hero-signup-btn"
              className="group relative inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white text-black text-sm font-semibold hover:bg-white/90 transition-all duration-200 shadow-[0_0_40px_-4px_rgba(139,92,246,0.5)] hover:shadow-[0_0_60px_-4px_rgba(139,92,246,0.7)]"
            >
              Create free account
              <svg
                className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5"
                viewBox="0 0 14 14"
                fill="none"
              >
                <path d="M1 7h12M8 2l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </Link>
          <Link href="/auth/signin">
            <button
              id="hero-signin-btn"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-white/10 text-white/70 text-sm font-medium hover:border-white/20 hover:text-white transition-all duration-200 bg-white/[0.03]"
            >
              Sign in to wallet
            </button>
          </Link>
        </div>

      </div>
    </section>
  );
}
