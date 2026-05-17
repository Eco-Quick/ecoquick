"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { BrandLogo } from "./BrandLogo";
import { ThemeToggle } from "@/components/ThemeToggle";

export function LandingHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [sweeping, setSweeping] = useState<"login" | "signup" | null>(null);

  function handleNav(target: "login" | "signup") {
    if (sweeping) return;
    const href = target === "login" ? "/login" : "/signup";
    // Already on this page — no-op
    if (pathname === href) return;
    setSweeping(target);
    setTimeout(() => {
      router.push(href);
      setSweeping(null);
    }, 360);
  }

  const linkBase =
    "nav-tab text-[11px] sm:text-sm font-semibold tracking-[0.08em] transition-colors dark:text-zinc-400 dark:hover:text-[#c084fc]";

  const NavItem = ({ href, label }: { href: string; label: string }) => {
    const isActive =
      (href === "/" && pathname === "/") ||
      (href !== "/" && pathname.startsWith(href));

    const className = `${linkBase} ${
      isActive
        ? "nav-tab-active text-primary"
        : "text-zinc-600 hover:text-primary dark:text-zinc-400 dark:hover:text-[#c084fc]"
    }`;

    if (isActive) {
      return (
        <span className={className} aria-current="page">
          {label}
        </span>
      );
    }

    return (
      <Link href={href} className={className}>
        {label}
      </Link>
    );
  };

  return (
    <header className="border-b border-zinc-200 bg-white/80 py-3 backdrop-blur dark:border-zinc-800 dark:bg-[#050507]/85 md:py-4">
      <div className="relative flex items-center gap-4">
        {/* Left: logo */}
        <div className="flex items-center">
          <BrandLogo size="md" />
        </div>

        {/* Center: nav – fixed centered */}
        <nav className="pointer-events-auto absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 items-center gap-6 md:flex">
          <NavItem href="/" label="Home" />
          <NavItem href="/about" label="About" />
          <NavItem href="/business" label="Business" />
          <NavItem href="/help" label="Help" />
        </nav>

        {/* Right: auth actions */}
        <div className="ml-auto flex items-center gap-2.5">
          <ThemeToggle />

          {/* Log in — outline swipe */}
          <button
            onClick={() => handleNav("login")}
            className="relative hidden overflow-hidden border border-zinc-200 px-6 py-[10px] text-[10px] font-bold uppercase tracking-[0.24em] text-zinc-600 transition-colors duration-200 hover:border-zinc-400 hover:text-zinc-900 dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-zinc-500 dark:hover:text-zinc-100 md:inline-flex items-center"
          >
            <span
              className="absolute inset-0 origin-left bg-zinc-900 transition-transform duration-[360ms] ease-in-out dark:bg-[#c084fc]"
              style={{ transform: sweeping === "login" ? "scaleX(1)" : "scaleX(0)" }}
              aria-hidden
            />
            <span className={`relative z-10 transition-colors duration-150 ${sweeping === "login" ? "text-white" : ""}`}>
              Log in
            </span>
          </button>

          {/* Get started — filled swipe */}
          <button
            onClick={() => handleNav("signup")}
            className="relative hidden overflow-hidden bg-[#3f0075] px-7 py-[10px] text-[10px] font-bold uppercase tracking-[0.24em] text-white transition-colors duration-200 hover:bg-[#360069] md:inline-flex items-center"
          >
            <span
              className="absolute inset-0 origin-left bg-[#ff9b16] transition-transform duration-[360ms] ease-in-out"
              style={{ transform: sweeping === "signup" ? "scaleX(1)" : "scaleX(0)" }}
              aria-hidden
            />
            <span className="relative z-10">Get started</span>
          </button>

          <button
            type="button"
            className="inline-flex h-9 items-center gap-1.5 border border-zinc-300 bg-white px-3 text-[10px] font-bold uppercase tracking-[0.22em] text-zinc-800 transition hover:border-zinc-500 hover:bg-zinc-50 dark:border-zinc-600 dark:bg-[#0c0b14] dark:text-zinc-100 dark:hover:border-zinc-400 md:hidden"
            aria-label="Toggle navigation"
            aria-expanded={isOpen}
            onClick={() => setIsOpen((prev) => !prev)}
          >
            <span className="material-symbols-outlined text-[18px] leading-none">
              {isOpen ? "close" : "menu"}
            </span>
            <span>{isOpen ? "Close" : "Menu"}</span>
          </button>
        </div>
      </div>

      {isOpen && (
        <nav className="mt-4 md:hidden">
          <div className="divide-y divide-zinc-200 border-y border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800">
            {[
              { href: "/", label: "Home", icon: "home" },
              { href: "/about", label: "About", icon: "info" },
              { href: "/business", label: "Business", icon: "business_center" },
              { href: "/help", label: "Help", icon: "help_outline" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className="group flex items-center justify-between py-3.5 text-sm font-semibold text-zinc-800 transition hover:text-[#3f0075] dark:text-zinc-200 dark:hover:text-[#c084fc]"
              >
                <span className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[20px] text-zinc-500 transition group-hover:text-[#3f0075] dark:text-zinc-500 dark:group-hover:text-[#c084fc]">
                    {item.icon}
                  </span>
                  {item.label}
                </span>
                <span className="material-symbols-outlined text-[18px] text-zinc-300 transition group-hover:translate-x-1 group-hover:text-[#3f0075] dark:text-zinc-700 dark:group-hover:text-[#c084fc]">
                  arrow_forward
                </span>
              </Link>
            ))}
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <Link
              href="/login"
              onClick={() => setIsOpen(false)}
              className="rounded-full border border-zinc-300 py-3 text-center text-[11px] font-bold uppercase tracking-[0.22em] text-zinc-800 transition hover:border-zinc-500 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:border-zinc-500 dark:hover:bg-zinc-900"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-center gap-2 rounded-full bg-[#3f0075] py-3 text-[11px] font-bold uppercase tracking-[0.22em] text-white shadow-[0_4px_12px_rgba(63,0,117,0.25)] transition hover:bg-[#360069] hover:shadow-[0_6px_18px_rgba(63,0,117,0.35)] dark:bg-[#5b21b6]"
            >
              Get started
              <span className="text-[14px]">→</span>
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}

