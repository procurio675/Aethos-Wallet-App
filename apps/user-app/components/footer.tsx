import Image from "next/image";

export default function Footer() {
  return (
    <footer className="border-t border-white/[0.05] py-10 px-6">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <Image
            src="/aethos-logo.png"
            alt="Aethos Logo"
            width={40}
            height={40}
            className="object-contain"
          />
          <span className="text-base font-bold text-white/90">Aethos</span>
        </div>

        <p className="text-xs text-white/25 text-center">
          © {new Date().getFullYear()} Aethos. Built with Next.js · Secured with Postgres row-level locks.
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
