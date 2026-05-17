"use client";

import Link from "next/link";
import { Reveal } from "@/components/Reveal";

export function CoverageSection() {
  return (
    <section id="cta" className="mt-20 pb-16 pt-16">
      <Reveal animation="up">
        <div className="relative mx-auto max-w-3xl text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#3e0074]/60 dark:text-[#c084fc]/70">
            Get started
          </p>

          <h2 className="mt-4 text-[clamp(2rem,5vw,3.5rem)] font-bold leading-[1.05] tracking-[-0.02em] text-zinc-900 dark:text-[#ede9f8]">
            Send it.{" "}
            <span className="italic text-[#3e0074] dark:text-[#c084fc]">We&apos;ll deliver it.</span>
          </h2>

          <p className="mx-auto mt-5 max-w-lg font-secondary text-[15px] leading-relaxed text-zinc-600 dark:text-zinc-400">
            From doorstep to doorstep in minutes — your parcel, handled by a trusted local rider.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
            <Link
              href="/signup"
              className="group inline-flex items-center gap-3 rounded-full bg-[#3e0074] px-10 py-4 text-[12px] font-bold uppercase tracking-[0.18em] text-white shadow-[0_4px_20px_rgba(62,0,116,0.3)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(62,0,116,0.4)] active:scale-[0.97] dark:bg-[#5b21b6] dark:shadow-[0_4px_20px_rgba(91,33,182,0.35)]"
            >
              <span>Book your first delivery</span>
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20 text-[10px] transition-transform duration-300 group-hover:translate-x-0.5">
                →
              </span>
            </Link>
            <Link
              href="/signup?profile=driver"
              className="inline-flex items-center gap-2 rounded-full border border-zinc-300 bg-transparent px-10 py-4 text-[12px] font-bold uppercase tracking-[0.18em] text-zinc-800 transition-all duration-300 hover:-translate-y-0.5 hover:border-[#3e0074] hover:text-[#3e0074] active:scale-[0.97] dark:border-zinc-700 dark:text-zinc-200 dark:hover:border-[#c084fc] dark:hover:text-[#c084fc]"
            >
              Become an eco driver
            </Link>
          </div>

          <div className="mt-10 flex items-center justify-center gap-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-400 dark:text-zinc-500">
            <span className="h-px w-8 bg-zinc-300 dark:bg-zinc-700" />
            <span>No credit card · Free to book</span>
            <span className="h-px w-8 bg-zinc-300 dark:bg-zinc-700" />
          </div>
        </div>
      </Reveal>
    </section>
  );
}
