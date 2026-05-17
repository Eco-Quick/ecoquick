"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useTheme } from "@/components/ThemeProvider";

export function HeroSection() {
  const router = useRouter();
  const { theme } = useTheme();

  return (
    <section className="relative flex min-h-[640px] flex-col items-center justify-center overflow-hidden text-center md:min-h-[calc(100vh-80px)]">

      {/* Headline */}
      <div className="hero-fade relative z-10 flex-1 flex flex-col items-center justify-center px-4">
        <h1 className="max-w-5xl">
          <span className="block text-[clamp(2rem,5.5vw,4rem)] font-medium leading-[1.1] tracking-[-0.02em] text-zinc-800 dark:text-zinc-200">
            Get your parcels
          </span>
          <span className="block mt-1 text-[clamp(3rem,9vw,7rem)] font-medium leading-[0.92] tracking-[-0.04em] text-[#3f0075] dark:text-[#c084fc]">
            Delivered Instantly
          </span>
        </h1>

        <div className="mt-6 flex max-w-xl flex-col items-center gap-2.5">
          <p className="font-secondary text-[18px] font-medium leading-relaxed text-zinc-700 dark:text-zinc-300">
            <span className="font-semibold text-[#3f0075] dark:text-[#c084fc]">Hyperlocal</span>,{" "}
            <span className="font-semibold text-[#3f0075] dark:text-[#c084fc]">fast</span>, and{" "}
            <span className="font-semibold text-[#3f0075] dark:text-[#c084fc]">secure</span> deliveries for all your parcels.
          </p>
          <p className="font-secondary text-[15px] italic font-bold leading-relaxed text-zinc-600 dark:text-zinc-300">
            Just click, confirm — and it&apos;s delivered.
          </p>
        </div>

        {/* Feature chips */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-5 text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-500 dark:text-zinc-500">
          {["Live tracking", "Quick delivery", "Zero emissions"].map((label, i) => (
            <span key={label} className="contents">
              {i > 0 && <span className="text-zinc-300 dark:text-zinc-700">&bull;</span>}
              <span className="inline-flex items-center gap-1.5">
                <span className="h-1 w-1 rounded-full bg-accent" />
                {label}
              </span>
            </span>
          ))}
        </div>

        {/* CTA */}
        <button
          onClick={() => router.push("/signup")}
          className="group mt-8 flex items-center gap-3 rounded-full bg-[#3f0075] px-10 py-4 text-[12px] font-bold uppercase tracking-[0.18em] text-white shadow-[0_4px_20px_rgba(63,0,117,0.35)] transition-all duration-300 hover:shadow-[0_8px_30px_rgba(63,0,117,0.45)] hover:-translate-y-0.5 active:scale-[0.97] dark:bg-[#5b21b6] dark:shadow-[0_4px_20px_rgba(91,33,182,0.35)]"
        >
          <span>Send a Parcel</span>
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20 text-[11px] transition-transform duration-300 group-hover:translate-x-0.5">→</span>
        </button>

        {/* Scroll indicator */}
        <button
          onClick={() => window.scrollBy({ top: window.innerHeight * 0.7, behavior: "smooth" })}
          className="scroll-bounce mt-10 flex flex-col items-center gap-1 text-zinc-400 transition-colors hover:text-[#3f0075] dark:text-zinc-500 dark:hover:text-[#c084fc]"
          aria-label="Scroll down"
        >
          <span className="text-[9px] font-semibold uppercase tracking-[0.2em]">Scroll</span>
          <span className="material-symbols-outlined text-lg">keyboard_arrow_down</span>
        </button>
      </div>

      {/* ── Cityscape + Road + Bike — pinned to bottom ── */}
      <div className="relative w-full shrink-0">
        <div className="relative h-40 sm:h-48 md:h-56 w-full">
          {/* Moving cityscape SVG */}
          <div className="absolute inset-x-0 bottom-14 md:bottom-16 h-24 sm:h-32 md:h-36 overflow-hidden pointer-events-none" aria-hidden>
            <div className="animate-cityscape flex w-[200%] h-full items-end">
              {[0, 1].map((copy) => (
                <svg
                  key={copy}
                  className="w-1/2 h-full shrink-0 block"
                  viewBox="0 0 1600 200"
                  preserveAspectRatio="xMinYMax slice"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* Building 1 — medium */}
                  <rect x="0" y="80" width="40" height="120" rx="1" className="fill-zinc-200/80 dark:fill-[#252530]" />
                  <rect x="5" y="90" width="8" height="10" rx="0.5" className="fill-zinc-300/60 dark:fill-[#38383f]" />
                  <rect x="17" y="90" width="8" height="10" rx="0.5" className="fill-zinc-300/60 dark:fill-[#38383f]" />
                  <rect x="5" y="106" width="8" height="10" rx="0.5" className="fill-zinc-300/60 dark:fill-[#38383f]" />
                  <rect x="17" y="106" width="8" height="10" rx="0.5" className="fill-zinc-300/60 dark:fill-[#38383f]" />
                  <rect x="5" y="122" width="8" height="10" rx="0.5" className="fill-zinc-300/60 dark:fill-[#38383f]" />
                  <rect x="17" y="122" width="8" height="10" rx="0.5" className="fill-zinc-300/60 dark:fill-[#38383f]" />

                  {/* Building 2 — tall */}
                  <rect x="55" y="40" width="50" height="160" rx="1" className="fill-zinc-200/70 dark:fill-[#202028]" />
                  <rect x="60" y="50" width="10" height="12" rx="0.5" className="fill-zinc-300/50 dark:fill-[#303038]" />
                  <rect x="75" y="50" width="10" height="12" rx="0.5" className="fill-zinc-300/50 dark:fill-[#303038]" />
                  <rect x="90" y="50" width="10" height="12" rx="0.5" className="fill-zinc-300/50 dark:fill-[#303038]" />
                  <rect x="60" y="70" width="10" height="12" rx="0.5" className="fill-zinc-300/50 dark:fill-[#303038]" />
                  <rect x="75" y="70" width="10" height="12" rx="0.5" className="fill-zinc-300/50 dark:fill-[#303038]" />
                  <rect x="60" y="90" width="10" height="12" rx="0.5" className="fill-zinc-300/50 dark:fill-[#303038]" />
                  <rect x="75" y="90" width="10" height="12" rx="0.5" className="fill-zinc-300/50 dark:fill-[#303038]" />

                  {/* Tree 1 */}
                  <rect x="125" y="160" width="4" height="25" className="fill-zinc-300/70 dark:fill-[#38383f]" />
                  <circle cx="127" cy="145" r="18" className="fill-emerald-200/50 dark:fill-emerald-800/50" />

                  {/* Building 3 — short wide */}
                  <rect x="160" y="130" width="55" height="70" rx="1" className="fill-zinc-200/60 dark:fill-[#1b1b22]" />
                  <rect x="166" y="138" width="12" height="14" rx="0.5" className="fill-zinc-300/50 dark:fill-[#303038]" />
                  <rect x="184" y="138" width="12" height="14" rx="0.5" className="fill-zinc-300/50 dark:fill-[#303038]" />
                  <rect x="202" y="138" width="8" height="30" rx="0.5" className="fill-[#3f0075]/10 dark:fill-[#c084fc]/25" />

                  {/* Building 4 — medium slim */}
                  <rect x="230" y="70" width="35" height="130" rx="1" className="fill-zinc-200/70 dark:fill-[#202028]" />
                  <rect x="235" y="80" width="7" height="9" rx="0.5" className="fill-zinc-300/50 dark:fill-[#303038]" />
                  <rect x="246" y="80" width="7" height="9" rx="0.5" className="fill-zinc-300/50 dark:fill-[#303038]" />
                  <rect x="235" y="95" width="7" height="9" rx="0.5" className="fill-zinc-300/50 dark:fill-[#303038]" />
                  <rect x="246" y="95" width="7" height="9" rx="0.5" className="fill-zinc-300/50 dark:fill-[#303038]" />

                  {/* Tree cluster */}
                  <rect x="285" y="162" width="3" height="20" className="fill-zinc-300/70 dark:fill-[#38383f]" />
                  <circle cx="287" cy="150" r="14" className="fill-emerald-200/50 dark:fill-emerald-800/50" />
                  <rect x="308" y="165" width="3" height="18" className="fill-zinc-300/70 dark:fill-[#38383f]" />
                  <circle cx="310" cy="153" r="12" className="fill-emerald-300/40 dark:fill-emerald-700/40" />

                  {/* Building 5 — tall slim tower */}
                  <rect x="340" y="30" width="30" height="170" rx="1" className="fill-zinc-200/80 dark:fill-[#252530]" />
                  <rect x="345" y="38" width="6" height="8" rx="0.5" className="fill-zinc-300/60 dark:fill-[#38383f]" />
                  <rect x="355" y="38" width="6" height="8" rx="0.5" className="fill-zinc-300/60 dark:fill-[#38383f]" />
                  <rect x="345" y="52" width="6" height="8" rx="0.5" className="fill-zinc-300/60 dark:fill-[#38383f]" />
                  <rect x="355" y="52" width="6" height="8" rx="0.5" className="fill-zinc-300/60 dark:fill-[#38383f]" />
                  <rect x="345" y="66" width="6" height="8" rx="0.5" className="fill-zinc-300/60 dark:fill-[#38383f]" />

                  {/* Shop */}
                  <rect x="390" y="150" width="60" height="50" rx="1" className="fill-zinc-200/60 dark:fill-[#1b1b22]" />
                  <rect x="400" y="160" width="15" height="20" rx="0.5" className="fill-[#3f0075]/8 dark:fill-[#c084fc]/20" />
                  <rect x="422" y="160" width="15" height="20" rx="0.5" className="fill-[#3f0075]/8 dark:fill-[#c084fc]/20" />

                  {/* Big tree */}
                  <rect x="470" y="155" width="5" height="30" className="fill-zinc-300/70 dark:fill-[#38383f]" />
                  <circle cx="472" cy="138" r="22" className="fill-emerald-200/50 dark:fill-emerald-800/50" />
                  <circle cx="463" cy="148" r="16" className="fill-emerald-300/40 dark:fill-emerald-700/40" />

                  {/* Building 6 — wide office */}
                  <rect x="510" y="90" width="70" height="110" rx="1" className="fill-zinc-200/70 dark:fill-[#202028]" />
                  <rect x="516" y="100" width="8" height="10" rx="0.5" className="fill-zinc-300/50 dark:fill-[#303038]" />
                  <rect x="530" y="100" width="8" height="10" rx="0.5" className="fill-zinc-300/50 dark:fill-[#303038]" />
                  <rect x="544" y="100" width="8" height="10" rx="0.5" className="fill-zinc-300/50 dark:fill-[#303038]" />
                  <rect x="558" y="100" width="8" height="10" rx="0.5" className="fill-zinc-300/50 dark:fill-[#303038]" />
                  <rect x="516" y="118" width="8" height="10" rx="0.5" className="fill-zinc-300/50 dark:fill-[#303038]" />
                  <rect x="530" y="118" width="8" height="10" rx="0.5" className="fill-zinc-300/50 dark:fill-[#303038]" />

                  {/* Small tree */}
                  <rect x="600" y="168" width="3" height="15" className="fill-zinc-300/70 dark:fill-[#38383f]" />
                  <circle cx="601" cy="158" r="10" className="fill-emerald-200/50 dark:fill-emerald-800/50" />

                  {/* House with roof */}
                  <rect x="630" y="140" width="45" height="60" rx="1" className="fill-zinc-200/60 dark:fill-[#1b1b22]" />
                  <polygon points="628,140 652,120 677,140" className="fill-zinc-300/60 dark:fill-[#303038]" />
                  <rect x="640" y="155" width="10" height="14" rx="0.5" className="fill-zinc-300/50 dark:fill-[#303038]" />
                  <rect x="657" y="170" width="10" height="30" rx="0.5" className="fill-[#3f0075]/10 dark:fill-[#c084fc]/25" />

                  {/* Tree */}
                  <rect x="695" y="158" width="4" height="25" className="fill-zinc-300/70 dark:fill-[#38383f]" />
                  <circle cx="697" cy="143" r="17" className="fill-emerald-200/50 dark:fill-emerald-800/50" />

                  {/* Building 7 — apartment */}
                  <rect x="730" y="60" width="45" height="140" rx="1" className="fill-zinc-200/80 dark:fill-[#252530]" />
                  <rect x="736" y="70" width="8" height="10" rx="0.5" className="fill-zinc-300/60 dark:fill-[#38383f]" />
                  <rect x="750" y="70" width="8" height="10" rx="0.5" className="fill-zinc-300/60 dark:fill-[#38383f]" />
                  <rect x="736" y="86" width="8" height="10" rx="0.5" className="fill-zinc-300/60 dark:fill-[#38383f]" />
                  <rect x="750" y="86" width="8" height="10" rx="0.5" className="fill-zinc-300/60 dark:fill-[#38383f]" />
                  <rect x="736" y="102" width="8" height="10" rx="0.5" className="fill-zinc-300/60 dark:fill-[#38383f]" />
                  <rect x="750" y="102" width="8" height="10" rx="0.5" className="fill-zinc-300/60 dark:fill-[#38383f]" />

                  {/* Bench */}
                  <rect x="795" y="175" width="30" height="4" rx="1" className="fill-zinc-300/50 dark:fill-[#303038]" />
                  <rect x="798" y="170" width="3" height="8" className="fill-zinc-300/60 dark:fill-[#38383f]" />
                  <rect x="820" y="170" width="3" height="8" className="fill-zinc-300/60 dark:fill-[#38383f]" />

                  {/* Tree pair */}
                  <rect x="850" y="160" width="3" height="22" className="fill-zinc-300/70 dark:fill-[#38383f]" />
                  <circle cx="852" cy="147" r="15" className="fill-emerald-200/50 dark:fill-emerald-800/50" />
                  <rect x="875" y="163" width="3" height="18" className="fill-zinc-300/70 dark:fill-[#38383f]" />
                  <circle cx="877" cy="151" r="13" className="fill-emerald-300/40 dark:fill-emerald-700/40" />

                  {/* Building 8 — tall */}
                  <rect x="900" y="50" width="40" height="150" rx="1" className="fill-zinc-200/70 dark:fill-[#202028]" />
                  <rect x="906" y="60" width="7" height="9" rx="0.5" className="fill-zinc-300/50 dark:fill-[#303038]" />
                  <rect x="918" y="60" width="7" height="9" rx="0.5" className="fill-zinc-300/50 dark:fill-[#303038]" />
                  <rect x="930" y="60" width="7" height="9" rx="0.5" className="fill-zinc-300/50 dark:fill-[#303038]" />
                  <rect x="906" y="76" width="7" height="9" rx="0.5" className="fill-zinc-300/50 dark:fill-[#303038]" />
                  <rect x="918" y="76" width="7" height="9" rx="0.5" className="fill-zinc-300/50 dark:fill-[#303038]" />

                  {/* Low shops */}
                  <rect x="960" y="145" width="50" height="55" rx="1" className="fill-zinc-200/60 dark:fill-[#1b1b22]" />
                  <rect x="968" y="155" width="12" height="16" rx="0.5" className="fill-[#3f0075]/8 dark:fill-[#c084fc]/20" />
                  <rect x="988" y="155" width="12" height="16" rx="0.5" className="fill-[#3f0075]/8 dark:fill-[#c084fc]/20" />

                  {/* Tree */}
                  <rect x="1030" y="160" width="4" height="24" className="fill-zinc-300/70 dark:fill-[#38383f]" />
                  <circle cx="1032" cy="145" r="16" className="fill-emerald-200/50 dark:fill-emerald-800/50" />

                  {/* Building 9 */}
                  <rect x="1060" y="100" width="50" height="100" rx="1" className="fill-zinc-200/70 dark:fill-[#202028]" />
                  <rect x="1066" y="110" width="8" height="10" rx="0.5" className="fill-zinc-300/50 dark:fill-[#303038]" />
                  <rect x="1080" y="110" width="8" height="10" rx="0.5" className="fill-zinc-300/50 dark:fill-[#303038]" />
                  <rect x="1094" y="110" width="8" height="10" rx="0.5" className="fill-zinc-300/50 dark:fill-[#303038]" />
                  <rect x="1066" y="126" width="8" height="10" rx="0.5" className="fill-zinc-300/50 dark:fill-[#303038]" />
                  <rect x="1080" y="126" width="8" height="10" rx="0.5" className="fill-zinc-300/50 dark:fill-[#303038]" />

                  {/* Tree */}
                  <rect x="1130" y="162" width="3" height="20" className="fill-zinc-300/70 dark:fill-[#38383f]" />
                  <circle cx="1132" cy="148" r="14" className="fill-emerald-200/50 dark:fill-emerald-800/50" />

                  {/* Building 10 — fills to edge */}
                  <rect x="1160" y="80" width="45" height="120" rx="1" className="fill-zinc-200/70 dark:fill-[#202028]" />
                  <rect x="1166" y="90" width="8" height="10" rx="0.5" className="fill-zinc-300/50 dark:fill-[#303038]" />
                  <rect x="1180" y="90" width="8" height="10" rx="0.5" className="fill-zinc-300/50 dark:fill-[#303038]" />
                  <rect x="1166" y="106" width="8" height="10" rx="0.5" className="fill-zinc-300/50 dark:fill-[#303038]" />
                  <rect x="1180" y="106" width="8" height="10" rx="0.5" className="fill-zinc-300/50 dark:fill-[#303038]" />

                  {/* Building 11 — flush to right edge */}
                  <rect x="1220" y="55" width="40" height="145" rx="1" className="fill-zinc-200/60 dark:fill-[#1b1b22]" />
                  <rect x="1226" y="65" width="7" height="9" rx="0.5" className="fill-zinc-300/50 dark:fill-[#303038]" />
                  <rect x="1238" y="65" width="7" height="9" rx="0.5" className="fill-zinc-300/50 dark:fill-[#303038]" />
                  <rect x="1226" y="80" width="7" height="9" rx="0.5" className="fill-zinc-300/50 dark:fill-[#303038]" />
                  <rect x="1238" y="80" width="7" height="9" rx="0.5" className="fill-zinc-300/50 dark:fill-[#303038]" />

                  {/* Tree */}
                  <rect x="1275" y="160" width="3" height="22" className="fill-zinc-300/70 dark:fill-[#38383f]" />
                  <circle cx="1277" cy="147" r="15" className="fill-emerald-200/50 dark:fill-emerald-800/50" />

                  {/* Building 12 — short */}
                  <rect x="1305" y="140" width="50" height="60" rx="1" className="fill-zinc-200/60 dark:fill-[#1b1b22]" />
                  <rect x="1312" y="150" width="10" height="12" rx="0.5" className="fill-zinc-300/50 dark:fill-[#303038]" />
                  <rect x="1328" y="150" width="10" height="12" rx="0.5" className="fill-zinc-300/50 dark:fill-[#303038]" />

                  {/* Building 13 — tall end cap */}
                  <rect x="1370" y="45" width="48" height="155" rx="1" className="fill-zinc-200/70 dark:fill-[#202028]" />
                  <rect x="1376" y="55" width="8" height="10" rx="0.5" className="fill-zinc-300/50 dark:fill-[#303038]" />
                  <rect x="1390" y="55" width="8" height="10" rx="0.5" className="fill-zinc-300/50 dark:fill-[#303038]" />
                  <rect x="1404" y="55" width="8" height="10" rx="0.5" className="fill-zinc-300/50 dark:fill-[#303038]" />
                  <rect x="1376" y="71" width="8" height="10" rx="0.5" className="fill-zinc-300/50 dark:fill-[#303038]" />
                  <rect x="1390" y="71" width="8" height="10" rx="0.5" className="fill-zinc-300/50 dark:fill-[#303038]" />

                  {/* Building 14 — medium, flush to very end */}
                  <rect x="1430" y="110" width="55" height="90" rx="1" className="fill-zinc-200/60 dark:fill-[#1b1b22]" />
                  <rect x="1436" y="120" width="10" height="12" rx="0.5" className="fill-zinc-300/50 dark:fill-[#303038]" />
                  <rect x="1452" y="120" width="10" height="12" rx="0.5" className="fill-zinc-300/50 dark:fill-[#303038]" />
                  <rect x="1468" y="120" width="10" height="12" rx="0.5" className="fill-zinc-300/50 dark:fill-[#303038]" />

                  {/* Tree at edge */}
                  <rect x="1500" y="160" width="4" height="24" className="fill-zinc-300/70 dark:fill-[#38383f]" />
                  <circle cx="1502" cy="145" r="16" className="fill-emerald-200/50 dark:fill-emerald-800/50" />

                  {/* Building 15 — very end */}
                  <rect x="1530" y="90" width="70" height="110" rx="1" className="fill-zinc-200/70 dark:fill-[#202028]" />
                  <rect x="1536" y="100" width="8" height="10" rx="0.5" className="fill-zinc-300/50 dark:fill-[#303038]" />
                  <rect x="1550" y="100" width="8" height="10" rx="0.5" className="fill-zinc-300/50 dark:fill-[#303038]" />
                  <rect x="1564" y="100" width="8" height="10" rx="0.5" className="fill-zinc-300/50 dark:fill-[#303038]" />
                  <rect x="1578" y="100" width="8" height="10" rx="0.5" className="fill-zinc-300/50 dark:fill-[#303038]" />
                </svg>
              ))}
            </div>
          </div>

          {/* Road */}
          <div className="absolute inset-x-0 bottom-0 h-14 bg-zinc-100 dark:bg-[#1c1c22]" aria-hidden />
          <div className="absolute inset-x-0 bottom-14 h-px bg-zinc-300/50 dark:bg-[#3a3a42]/70" aria-hidden />
          <div
            className="absolute inset-x-0 bottom-7 h-[2px] dark:[background:repeating-linear-gradient(90deg,rgb(160_160_170/0.3)_0,rgb(160_160_170/0.3)_14px,transparent_14px,transparent_28px)]"
            style={{ background: "repeating-linear-gradient(90deg, rgb(161 161 170 / 0.4) 0, rgb(161 161 170 / 0.4) 14px, transparent 14px, transparent 28px)" }}
            aria-hidden
          />
          <div className="absolute inset-x-0 bottom-0 h-px bg-zinc-300/40 dark:bg-[#3a3a42]/50" aria-hidden />

          {/* Bike */}
          <div className="absolute bottom-0 left-0 flex items-end">
            <Image
              src={theme === "dark" ? "/dark/bike.webp" : "/light/bike.webp"}
              alt=""
              width={400}
              height={192}
              className="animate-bike-ride block h-20 w-auto object-contain object-bottom sm:h-24 md:h-48"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
}
