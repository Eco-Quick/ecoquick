"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const SESSION_KEY = "ecoquickVisitorId";

function getVisitorId(): string {
  try {
    let id = localStorage.getItem(SESSION_KEY);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(SESSION_KEY, id);
    }
    return id;
  } catch {
    // localStorage unavailable (private browsing, etc.) — one-off id, fine
    // for a single page view's worth of tracking.
    return crypto.randomUUID();
  }
}

// Fires a lightweight beacon on every route change so /admin/system can show
// a live visitor count and recent page-view feed. Never blocks rendering —
// fire-and-forget, silently ignores failures.
export function PageViewTracker() {
  const pathname = usePathname();

  useEffect(() => {
    // Skip the admin's own navigation — the live visitor count should
    // reflect real site traffic, not the admin refreshing their own dashboard.
    if (!pathname || pathname.startsWith("/admin")) return;
    const sessionId = getVisitorId();
    fetch("/api/track/pageview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: pathname, sessionId }),
    }).catch(() => {});
  }, [pathname]);

  return null;
}
