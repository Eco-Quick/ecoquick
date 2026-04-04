 "use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function HeroSection() {
  const router = useRouter();
  const [deliveredText, setDeliveredText] = useState("");
  const [instantlyText, setInstantlyText] = useState("");
  const deliveredComplete = deliveredText === "Delivered";
  const [kicked, setKicked] = useState<"driver" | "customer" | null>(null);

  function handleClick(target: "customer" | "driver") {
    const kickSide = target === "customer" ? "driver" : "customer";
    setKicked(kickSide);
    setTimeout(() => {
      router.push(target === "customer" ? "/signup?profile=customer" : "/signup?profile=driver");
    }, 300);
  }

  useEffect(() => {
    const fullDelivered = "Delivered";
    const fullInstantly = "Instantly";
    let deliveredIndex = 0;
    let instantlyIndex = 0;

    const interval = setInterval(() => {
      if (deliveredIndex < fullDelivered.length) {
        setDeliveredText(fullDelivered.slice(0, deliveredIndex + 1));
        deliveredIndex += 1;
      } else if (instantlyIndex < fullInstantly.length) {
        setInstantlyText(fullInstantly.slice(0, instantlyIndex + 1));
        instantlyIndex += 1;
      } else {
        clearInterval(interval);
      }
    }, 120);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="hero-fade relative flex flex-col items-center text-center">
      <div className="hero-chip-fade mt-4 sm:mt-6 flex flex-wrap items-center justify-center gap-3 text-[10px] font-semibold uppercase tracking-[0.25em] text-zinc-500">
        {["Live tracking", "Quick delivery", "Zero emissions"].map((label, i) => (
          <span key={label} className="contents">
            {i > 0 && <span className="text-zinc-300">•</span>}
            <span className="inline-flex cursor-default items-center gap-2 rounded-full border border-transparent px-3 py-1 transition-all duration-200 hover:scale-105 hover:border-[#3f0075]/30 hover:bg-[#3f0075]/5 hover:text-[#3f0075]">
              <span className="h-1 w-1 rounded-full bg-accent transition-colors duration-200" />
              {label}
            </span>
          </span>
        ))}
      </div>

      <h1 className="mt-6 sm:mt-8 md:mt-10 text-balance text-4xl uppercase leading-[0.9] tracking-tight text-[#3f0075] sm:text-5xl md:text-6xl lg:text-7xl">
        <span className="block">Why wait?</span>
        <span className="block">Get your parcels</span>
        <span className="block font-black text-[#3f0075]">
          {deliveredText || "Delivered"}
        </span>
        <span className="block font-black text-[#3f0075]">
          {deliveredComplete ? instantlyText || "Instantly" : ""}
        </span>
      </h1>

      <p className="mt-4 sm:mt-5 max-w-2xl text-xs font-semibold uppercase tracking-[0.22em] text-zinc-500">
        Hyperlocal, fast, and secure deliveries for all your parcels.
      </p>

      <div
        id="get-started"
        className="hero-buttons-fade mt-10 sm:mt-12 flex flex-col sm:flex-row items-center justify-center gap-4"
      >
        {/* Primary CTA */}
        <button
          onClick={() => handleClick("customer")}
          className={[
            "group relative overflow-hidden flex items-center gap-4 bg-[#3f0075] px-12 py-5 text-[11px] font-bold uppercase tracking-[0.26em] text-white",
            "shadow-[0_6px_28px_rgba(63,0,117,0.38),0_2px_8px_rgba(63,0,117,0.22)] hover:shadow-[0_12px_40px_rgba(63,0,117,0.55),0_4px_12px_rgba(63,0,117,0.3)] hover:-translate-y-0.5 hover:bg-[#360069]",
            kicked === "customer" ? "btn-kick-left" : "transition-all duration-300",
            kicked === "driver" ? "btn-launch" : "",
          ].join(" ")}
        >
          {/* top-edge highlight for depth */}
          <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white/20" aria-hidden />
          <span className="relative z-10">Deliver a parcel</span>
          <span className="relative z-10 flex h-7 w-7 items-center justify-center rounded-full bg-[#ff9b16] text-[13px] text-white transition-transform duration-300 group-hover:scale-110 group-hover:translate-x-0.5">
            →
          </span>
        </button>

        {/* Secondary CTA */}
        <button
          onClick={() => handleClick("driver")}
          className={[
            "group flex items-center gap-4 border border-zinc-300 bg-white px-12 py-5 text-[11px] font-bold uppercase tracking-[0.26em] text-zinc-600",
            "hover:-translate-y-0.5 hover:border-zinc-400 hover:text-zinc-900 hover:shadow-[0_6px_20px_rgba(0,0,0,0.08)]",
            kicked === "driver" ? "btn-kick-right" : "transition-all duration-300",
            kicked === "customer" ? "btn-launch" : "",
          ].join(" ")}
        >
          <span>Become a driver</span>
          <span className="text-zinc-300 transition-all duration-300 group-hover:translate-x-0.5 group-hover:text-zinc-700">→</span>
        </button>
      </div>

      {/* Bike animation – full-width lined road */}
      <div
        className="relative mt-1 w-screen overflow-hidden"
        style={{ marginLeft: "calc(-50vw + 50%)", marginRight: "calc(-50vw + 50%)" }}
      >
        {/* Road surface */}
        <div className="absolute inset-x-0 bottom-0 h-16 bg-zinc-200/60" aria-hidden />
        {/* Center dashed line */}
        <div
          className="absolute inset-x-0 bottom-8 h-0.5 w-full"
          style={{
            background: "repeating-linear-gradient(90deg, rgb(161 161 170 / 0.6) 0, rgb(161 161 170 / 0.6) 12px, transparent 12px, transparent 24px)",
          }}
          aria-hidden
        />
        <div
          className="absolute inset-x-0 bottom-0 h-px bg-zinc-400/60"
          aria-hidden
        />
        <div className="relative h-24 w-full md:h-40">
          <div className="absolute bottom-0 left-0 flex items-end">
            <img
              src="/bike.png"
              alt=""
              className="animate-bike-ride block h-24 w-auto object-contain object-bottom md:h-36"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

