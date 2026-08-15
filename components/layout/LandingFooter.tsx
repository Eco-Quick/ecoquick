"use client";

import Link from "next/link";
import { Reveal } from "@/components/Reveal";

export function LandingFooter() {
  return (
    <footer
      id="contact"
      className="mt-20 border-t border-zinc-200 pb-10 pt-12 dark:border-zinc-800"
    >
      <Reveal animation="up" className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
        <div className="space-y-3">
          <p className="text-sm font-extrabold uppercase tracking-[0.22em] text-zinc-950 dark:text-zinc-100">
            ECOQUICK DELIVERY
          </p>
          <div className="space-y-1 font-secondary text-sm text-zinc-600 dark:text-zinc-400">
            <p>Kingston upon Thames, London</p>
            <a
              href="mailto:info@ecoquickdelivery.co.uk"
              className="hover:text-zinc-900 transition-colors dark:hover:text-zinc-200"
            >
              info@ecoquickdelivery.co.uk
            </a>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-5 font-secondary text-xs font-semibold uppercase tracking-[0.22em] text-zinc-500">
          <a
            className="hover:text-zinc-900 dark:hover:text-zinc-200"
            href="https://www.instagram.com/ecoquick_deliveries/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Instagram
          </a>
          <a
            className="hover:text-zinc-900 dark:hover:text-zinc-200"
            href="https://www.linkedin.com/company/ecoquick-delivery/"
            target="_blank"
            rel="noopener noreferrer"
          >
            LinkedIn
          </a>
          <a
            className="hover:text-zinc-900 dark:hover:text-zinc-200"
            href="https://www.tiktok.com/@ecoquick.delivery?_r=1&_t=ZN-97mXcHW4uYw"
            target="_blank"
            rel="noopener noreferrer"
          >
            TikTok
          </a>
          <a
            className="hover:text-zinc-900 dark:hover:text-zinc-200"
            href="https://wa.me/447417366028"
            target="_blank"
            rel="noopener noreferrer"
          >
            WhatsApp
          </a>
        </div>
      </Reveal>

      <div className="mt-10 flex flex-col gap-4 border-t border-zinc-200 pt-6 dark:border-zinc-800 sm:flex-row sm:items-center sm:justify-between">
        <p className="font-secondary text-xs font-semibold uppercase tracking-[0.22em] text-zinc-500">
          © {new Date().getFullYear()} EcoQuick
        </p>
        <div className="flex flex-wrap items-center gap-4 font-secondary text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
          <Link className="hover:text-zinc-900 dark:hover:text-zinc-200" href="/privacy">
            Privacy Policy
          </Link>
          <Link className="hover:text-zinc-900 dark:hover:text-zinc-200" href="/terms">
            Terms of Service
          </Link>
          <Link className="hover:text-zinc-900 dark:hover:text-zinc-200" href="/cookies">
            Cookie Policy
          </Link>
        </div>
      </div>
    </footer>
  );
}
