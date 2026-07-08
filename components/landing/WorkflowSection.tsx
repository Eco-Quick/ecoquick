"use client";

import Image from "next/image";
import { Reveal } from "@/components/Reveal";
import { useTheme } from "@/components/ThemeProvider";

const WORKFLOW_STEPS = [
  {
    k: "01",
    title: "Book instantly",
    body: "Simple interface for immediate dispatch.",
    image: "ordered.webp",
  },
  {
    k: "02",
    title: "Track live",
    body: "Watch your delivery move across the city in real-time.",
    image: "livetracking.webp",
  },
  {
    k: "03",
    title: "Delivered",
    body: "Instant Confirmation",
    image: "delivered.webp",
  },
] as const;

export function WorkflowSection() {
  const { theme } = useTheme();
  const imgDir = theme === "dark" ? "/dark" : "/light";

  return (
    <section id="workflow" className="mt-10 border-t border-zinc-400 pt-8 md:mt-16 md:pt-12 dark:border-zinc-700">
      <Reveal animation="fade">
        <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-zinc-600 dark:text-zinc-400">
          01 / Workflow
        </p>
      </Reveal>

      <Reveal animation="up" stagger className="mt-6 grid gap-4 md:mt-8 md:gap-6 md:grid-cols-3">
        {WORKFLOW_STEPS.map((step) => (
          <div
            key={step.k}
            className="reveal-up group space-y-3 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg md:space-y-4 dark:hover:shadow-[0_8px_24px_rgba(192,132,252,0.1)]"
          >
            <div className="mx-auto max-w-[220px] overflow-hidden border border-zinc-300 bg-white transition-colors duration-300 group-hover:border-[#3f0075]/30 md:max-w-none dark:border-zinc-700 dark:bg-[#0c0b14] dark:group-hover:border-[#c084fc]/30">
              <div className="relative aspect-[16/10] bg-white md:aspect-[4/3]">
                <Image
                  src={`${imgDir}/${step.image}`}
                  alt={step.title}
                  fill
                  priority={step.k === "01"}
                  className="object-cover transition-all duration-300 group-hover:brightness-105 group-hover:scale-[1.02]"
                  sizes="(min-width: 1024px) 320px, (min-width: 768px) 33vw, 100vw"
                />
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.15),transparent_55%),radial-gradient(circle_at_70%_70%,rgba(255,255,255,0.12),transparent_60%)] mix-blend-screen" />
                <div className="absolute bottom-4 right-4 rounded-full border border-zinc-300 bg-white/70 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.25em] text-zinc-600 backdrop-blur transition-all duration-200 group-hover:scale-110 group-hover:border-[#3f0075]/40 group-hover:text-[#3f0075] dark:border-zinc-600 dark:bg-[#0c0b14]/70 dark:text-zinc-400 dark:group-hover:border-[#c084fc]/40 dark:group-hover:text-[#c084fc]">
                  {step.k}
                </div>
              </div>
            </div>
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-zinc-900 dark:text-zinc-100">
                {step.k}. {step.title}
              </p>
              <p className="mt-1 font-secondary text-sm text-zinc-600 dark:text-zinc-400">{step.body}</p>
            </div>
          </div>
        ))}
      </Reveal>
    </section>
  );
}

