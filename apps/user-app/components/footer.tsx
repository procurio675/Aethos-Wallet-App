export default function Footer() {
  return (
    <footer className="border-t border-white/[0.05] py-10 px-6">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-md bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
            <svg width="11" height="11" viewBox="0 0 14 14" fill="none">
              <path d="M2 4h10M2 7h6M2 10h8" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          <span className="text-sm font-semibold text-white/80">PayFlow</span>
        </div>

        <p className="text-xs text-white/25 text-center">
          © {new Date().getFullYear()} PayFlow. Built with Next.js · Secured with Postgres row-level locks.
        </p>

        <div className="flex gap-5">
          {["Privacy", "Terms", "Security"].map((item) => (
            <a
              key={item}
              href="#"
              className="text-xs text-white/30 hover:text-white/60 transition-colors"
            >
              {item}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
