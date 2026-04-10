"use client";

import { Reveal } from "@/components/Reveal";

export function CoverageSection() {
  return (
    <section id="coverage" className="mt-16 border-t border-zinc-200 pt-12 dark:border-zinc-800">
      <Reveal animation="up">
        <div className="grid gap-10 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <div>
            <h2 className="text-2xl font-extrabold uppercase leading-tight tracking-tight text-[#3f0075] dark:text-[#c084fc] sm:text-3xl">
              London
              <br />
              coverage
            </h2>
          </div>
          <p className="font-secondary text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            Operating at the core of Kingston upon Thames and expanding through
            Richmond, Twickenham, and the surrounding London territories.
          </p>
        </div>
      </Reveal>

      <Reveal animation="scale" className="mt-8 overflow-hidden border border-zinc-300 dark:border-zinc-700">
        <div className="grid grid-cols-2 md:grid-cols-4">
          {[
            "Kingston",
            "Richmond",
            "Twickenham",
            "Wimbledon",
            "Surbiton",
            "Teddington",
            "Putney",
            "Hampton",
          ].map((area, idx) => (
            <div
              key={area}
              className={[
                "group flex items-center justify-center gap-2 px-4 py-5 text-xs font-semibold uppercase tracking-[0.22em]",
                "border-zinc-200",
                idx % 2 === 0 ? "bg-white dark:bg-[#050507]" : "bg-zinc-50 dark:bg-[#0c0b14]",
                "border-b md:border-b-0",
                "transition-all duration-200 hover:scale-[1.03] hover:bg-[#3f0075]/8 hover:border-[#3f0075]/30 hover:text-[#3f0075] cursor-default",
              ].join(" ")}
            >
              {area}
              <span className="opacity-0 transition-opacity duration-200 group-hover:opacity-100 text-accent">
                →
              </span>
            </div>
          ))}
        </div>
      </Reveal>
    </section>
  );
}

