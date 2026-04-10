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
            className="inline-flex h-9 w-9 items-center justify-center border border-zinc-200 text-zinc-700 transition hover:border-zinc-400 hover:bg-zinc-50 hover:text-zinc-900 dark:border-zinc-700 dark:bg-[#0c0b14] dark:text-zinc-400 dark:hover:border-zinc-600 dark:hover:text-zinc-100 md:hidden"
            aria-label="Toggle navigation"
            onClick={() => setIsOpen((prev) => !prev)}
          >
            <span className="material-symbols-outlined text-[20px] leading-none">
              menu
            </span>
          </button>
        </div>
      </div>

      {isOpen && (
        <nav className="mt-3 flex flex-col gap-2 text-[11px] font-medium tracking-[0.05em] text-zinc-600 dark:text-zinc-400 md:hidden">
          <Link href="/" className="py-0.5 transition hover:text-zinc-900 dark:hover:text-zinc-200">
            Home
          </Link>
          <Link href="/about" className="py-0.5 transition hover:text-zinc-900 dark:hover:text-zinc-200">
            About
          </Link>
          <Link
            href="/business"
            className="py-0.5 transition hover:text-zinc-900 dark:hover:text-zinc-200"
          >
            Business
          </Link>
          <Link href="/help" className="py-0.5 transition hover:text-zinc-900 dark:hover:text-zinc-200">
            Help
          </Link>
          <Link
            href="/login"
            className="py-0.5 transition hover:text-zinc-900 dark:hover:text-zinc-200"
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="py-0.5 text-[#3f0075] dark:text-[#c084fc] transition hover:text-zinc-900 dark:hover:text-zinc-200"
          >
            Get started
          </Link>
        </nav>
      )}
    </header>
  );
}

