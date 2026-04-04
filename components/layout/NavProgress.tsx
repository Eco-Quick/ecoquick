"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

export function NavProgress() {
  const pathname = usePathname();
  const [width, setWidth] = useState(0);
  const [opacity, setOpacity] = useState(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];

    setOpacity(1);
    setWidth(0);

    const t1 = setTimeout(() => setWidth(55), 30);
    const t2 = setTimeout(() => setWidth(80), 250);
    const t3 = setTimeout(() => setWidth(95), 500);
    const t4 = setTimeout(() => setWidth(100), 700);
    const t5 = setTimeout(() => setOpacity(0), 820);
    const t6 = setTimeout(() => setWidth(0), 1020);

    timers.current = [t1, t2, t3, t4, t5, t6];
    return () => timers.current.forEach(clearTimeout);
  }, [pathname]);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[9999] h-[3px] bg-accent"
      style={{
        width: `${width}%`,
        opacity,
        transition:
          width === 0
            ? "none"
            : width === 100
            ? "width 180ms ease-in"
            : "width 380ms cubic-bezier(0.22, 1, 0.36, 1)",
        boxShadow: "0 0 10px 1px rgba(255,155,22,0.6)",
      }}
    />
  );
}
