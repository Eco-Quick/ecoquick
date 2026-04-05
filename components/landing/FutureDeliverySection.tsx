"use client";

import { Reveal } from "@/components/Reveal";

export function FutureDeliverySection() {
  return (
    <section id="delivery" className="mt-20 border-t border-zinc-400 pt-12 dark:border-zinc-700">
      <Reveal animation="fade">
        <div className="flex items-end justify-between gap-6">
          <div className="space-y-2">
            <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-zinc-500">
              02 / The future of delivery
            </p>
          </div>
        </div>
      </Reveal>

      <Reveal animation="up" stagger className="mt-8 grid gap-4 md:grid-cols-3">
        {[
          {
            title: "Instant delivery",
            body: "Minutes, not hours. Predictive routing starts moving your parcel immediately.",
            icon: (
              <svg
                viewBox="0 0 24 24"
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8Z" />
              </svg>
            ),
          },
          {
            title: "Eco‑friendly",
            body: "100% carbon-neutral operations using a fully electric fleet for cleaner cities.",
            icon: (
              <svg
                viewBox="0 0 24 24"
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 22c4.97 0 9-4.03 9-9 0-3.87-2.46-7.13-5.9-8.35C14.6 7.2 13 9.5 9.9 11.2 6.6 13 5 15 5 18c0 2.21 1.79 4 4 4Z" />
              </svg>
            ),
          },
          {
            title: "Secure & tracked",
            body: "Real-time GPS tracking with secure digital handover and proof of delivery.",
            icon: (
              <svg
                viewBox="0 0 24 24"
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 1l8 4v6c0 5-3.4 9.4-8 11-4.6-1.6-8-6-8-11V5l8-4Z" />
                <path d="M9 12l2 2 4-4" />
              </svg>
            ),
          },
        ].map((card) => (
          <div
            key={card.title}
            className="reveal-up group rounded-none border border-zinc-200 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[#3f0075]/20 hover:shadow-lg dark:border-zinc-700 dark:bg-[#161027] dark:hover:border-[#c084fc]/20"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent/10 text-accent transition-all duration-300 group-hover:scale-110 group-hover:rotate-12 group-hover:bg-accent group-hover:text-white">
                {card.icon}
              </div>
              <h3 className="text-sm font-extrabold uppercase tracking-[0.18em] text-zinc-900 dark:text-zinc-100">
                {card.title}
              </h3>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
              {card.body}
            </p>
          </div>
        ))}
      </Reveal>

      <Reveal animation="scale" className="mt-12 -mx-5 bg-[#3f0075] px-5 py-10 text-white sm:-mx-6 sm:px-6">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 md:grid-cols-4 md:gap-10">
          {[
            { top: "99.8%", bottom: "On-time delivery" },
            { top: "LEAD", bottom: "Industry speed" },
            { top: "500K+", bottom: "Happy customers" },
            { top: "24/7", bottom: "Availability" },
          ].map((m) => (
            <div
              key={m.top}
              className="stat-hover-line group cursor-default text-center transition-transform duration-200 hover:-translate-y-1"
            >
              <p className="text-3xl font-extrabold tracking-tight transition-colors duration-200 group-hover:text-accent md:text-4xl">
                {m.top}
              </p>
              <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.25em] text-white/80">
                {m.bottom}
              </p>
            </div>
          ))}
        </div>
      </Reveal>
    </section>
  );
}

