"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function AutoRefresh({ intervalMs = 20000 }: { intervalMs?: number }) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // We only want to poll actively when the user is inside the dashboard
    if (!pathname.startsWith("/dashboard")) return;

    const interval = setInterval(() => {
      // Next.js router.refresh() invalidates the server component cache and re-fetches
      // the latest data (balance, transactions) seamlessly without losing client state!
      router.refresh();
    }, intervalMs);

    return () => clearInterval(interval);
  }, [router, pathname, intervalMs]);

  return null; // This is a logic-only component that renders nothing
}
