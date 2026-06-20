"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-background/80 backdrop-blur-xl border-b border-white/5"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2 4h10M2 7h6M2 10h8" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          <span className="text-sm font-semibold tracking-tight text-white">PayFlow</span>
        </Link>

        {/* Nav links */}
        <nav className="hidden md:flex items-center gap-8">
          {["Features", "Security", "Pricing"].map((item) => (
            <Link
              key={item}
              href={`#${item.toLowerCase()}`}
              className="text-sm text-white/50 hover:text-white transition-colors duration-200"
            >
              {item}
            </Link>
          ))}
        </nav>

        {/* CTA */}
        <div className="flex items-center gap-3">
          <Link
            href="/auth/signin"
            className="text-sm text-white/60 hover:text-white transition-colors"
          >
            Sign in
          </Link>
          <Link
            href="/auth/signup"
            className="relative inline-flex items-center justify-center px-4 py-1.5 text-sm font-medium rounded-full bg-white text-black hover:bg-white/90 transition-colors duration-200"
          >
            Get started
          </Link>
        </div>
      </div>
    </header>
  );
}
