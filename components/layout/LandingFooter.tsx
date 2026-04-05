"use client";

import Link from "next/link";
import { Reveal } from "@/components/Reveal";

export function LandingFooter() {
  return (
    <footer
      id="contact"
      className="mt-20 border-t border-zinc-200 pb-14 pt-12 dark:border-zinc-800"
    >
      <Reveal animation="up" className="grid gap-10 md:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <div className="space-y-4">
          <p className="text-sm font-extrabold uppercase tracking-[0.22em] text-zinc-950 dark:text-zinc-100">
            ECOQUICK DELIVERY
          </p>
          <div className="space-y-1 text-sm text-zinc-600 dark:text-zinc-400">
            <p>Kingston upon Thames, London</p>
            <a href="mailto:hello@ecoquick.delivery" className="hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors">hello@ecoquick.delivery</a>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8">
          <div className="space-y-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-zinc-400 dark:text-zinc-500">
              Product
            </p>
            <div className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
              <Link
                className="block hover:text-zinc-900 dark:hover:text-zinc-200"
                href="/#delivery"
              >
                Services
              </Link>
              <Link
                className="block hover:text-zinc-900 dark:hover:text-zinc-200"
                href="/#workflow"
              >
                Workflow
              </Link>
              <Link
                className="block hover:text-zinc-900 dark:hover:text-zinc-200"
                href="/#coverage"
              >
                Coverage
              </Link>
            </div>
          </div>
          <div className="space-y-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-zinc-400 dark:text-zinc-500">
              Company
            </p>
            <div className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
              <Link className="block hover:text-zinc-900 dark:hover:text-zinc-200" href="/">
                Home
              </Link>
              <Link
                className="block hover:text-zinc-900 dark:hover:text-zinc-200"
                href="/login"
              >
                Log in
              </Link>
              <Link
                className="block hover:text-zinc-900 dark:hover:text-zinc-200"
                href="/signup"
              >
                Get started
              </Link>
            </div>
          </div>
        </div>
      </Reveal>

      <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-zinc-200 dark:border-zinc-800 pt-6 text-xs text-zinc-500">
        <p className="font-semibold uppercase tracking-[0.22em]">
          © {new Date().getFullYear()} EcoQuick
        </p>
        <div className="flex items-center gap-5 font-semibold uppercase tracking-[0.22em]">
          <a className="hover:text-zinc-900 dark:hover:text-zinc-200" href="https://instagram.com/ecoquickdelivery" target="_blank" rel="noopener noreferrer">
            Instagram
          </a>
          <a className="hover:text-zinc-900 dark:hover:text-zinc-200" href="https://twitter.com/ecoquickdelivery" target="_blank" rel="noopener noreferrer">
            Twitter
          </a>
          <a className="hover:text-zinc-900 dark:hover:text-zinc-200" href="mailto:hello@ecoquick.delivery">
            Email
          </a>
        </div>
      </div>
    </footer>
  );
}

