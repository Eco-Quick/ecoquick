"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BookingStepper } from "../../../components/book/BookingStepper";
import { CustomerTopBar } from "@/components/layout/CustomerTopBar";
import { useCustomerAuth } from "@/hooks/useCustomerAuth";

const BoltIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="shrink-0" aria-hidden>
    <path d="M13 2L4 14h7l-2 8 9-12h-7l2-8z" />
  </svg>
);

const CalendarIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="shrink-0" aria-hidden>
    <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" />
    <path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const ArrowWestIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="shrink-0" aria-hidden>
    <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ArrowEastIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="shrink-0" aria-hidden>
    <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default function BookTypePage() {
  const user = useCustomerAuth();
  const router = useRouter();
  const [selected, setSelected] = useState<"instant" | "scheduled" | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem("deliveryRequest");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.deliveryType) setSelected(parsed.deliveryType);
      }
    } catch {}
    setHydrated(true);
  }, []);

  function selectType(type: "instant" | "scheduled") {
    setSelected(type);
  }

  function handleContinue() {
    const type = selected ?? "instant";
    try {
      const saved = sessionStorage.getItem("deliveryRequest");
      const data = saved ? JSON.parse(saved) : {};
      sessionStorage.setItem("deliveryRequest", JSON.stringify({ ...data, deliveryType: type }));
    } catch {}
    router.push("/book/route");
  }

  if (!user || !hydrated) return null;
  return (
    <div className="page-fade flex min-h-screen flex-col bg-slate-50 text-slate-900">
      <CustomerTopBar />

      <main className="flex flex-1 flex-col items-center py-8 px-4 md:px-6">
        <div className="w-full max-w-5xl bg-white shadow-[0_20px_50px_-12px_rgba(62,0,116,0.15)]">
          {/* Stepper */}
          <div className="border-b border-slate-100 bg-white px-6 pb-12 pt-10 md:px-8">
            <BookingStepper currentStep={1} />

            <div className="mt-10 text-center">
              <h1 className="text-3xl uppercase tracking-tight text-primary sm:text-4xl">
                Delivery Type
              </h1>
              <p className="mx-auto mt-3 max-w-lg text-sm font-medium text-slate-500">
                Select the urgency and service level required for your
                shipment.
              </p>
            </div>
          </div>

          {/* Content */}
          <div className="bg-white px-6 py-10 md:px-10 md:py-12">
            <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-2">
              <button
                onClick={() => selectType("instant")}
                className={[
                  "card-hover group flex h-full flex-col border-2 p-8 text-left transition-all active:scale-[0.98]",
                  selected === "instant"
                    ? "border-primary bg-primary/5"
                    : "border-slate-100 bg-slate-50 hover:border-slate-300",
                ].join(" ")}
              >
                <div className="mb-6 flex w-full justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded border-2 border-accent/40 bg-white text-accent transition-colors group-hover:bg-accent group-hover:text-white">
                    <BoltIcon />
                  </div>
                </div>
                <h3 className="mb-3 text-xl font-black uppercase tracking-tight text-primary">
                  Instant delivery
                </h3>
                <p className="mb-6 flex-grow text-sm leading-relaxed text-slate-600">
                  Best for urgent needs. An electric courier is dispatched
                  immediately for direct point-to-point delivery within 60
                  minutes.
                </p>
                <div className="mt-auto flex items-center gap-2 border-t border-slate-100 pt-4">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
                    Couriers available now
                  </span>
                </div>
              </button>

              <button
                onClick={() => selectType("scheduled")}
                className={[
                  "card-hover group flex h-full flex-col border-2 p-8 text-left transition-all active:scale-[0.98]",
                  selected === "scheduled"
                    ? "border-primary bg-primary/5"
                    : "border-slate-100 bg-slate-50 hover:border-slate-300",
                ].join(" ")}
              >
                <div className="mb-6 flex w-full justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded border-2 border-accent/40 bg-white text-accent transition-colors group-hover:bg-accent group-hover:text-white">
                    <CalendarIcon />
                  </div>
                </div>
                <h3 className="mb-3 text-xl font-black uppercase tracking-tight text-slate-900">
                  Scheduled
                </h3>
                <p className="mb-6 flex-grow text-sm leading-relaxed text-slate-600">
                  Plan ahead. Select a specific pickup window up to 2 weeks in
                  advance. Ideal for recurring business logistics.
                </p>
                <div className="mt-auto border-t border-slate-100 pt-4">
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                    Book up to 14 days ahead
                  </span>
                </div>
              </button>
            </div>

            <div className="mx-auto mt-12 flex max-w-4xl items-center justify-between border-t border-slate-100 pt-6">
              <Link
                href="/dashboard"
                className="flex items-center gap-2 pl-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 transition-colors hover:text-primary"
              >
                <span className="text-accent">
                  <ArrowWestIcon />
                </span>
                Back
              </Link>

              <button
                onClick={handleContinue}
                className="btn-press btn-sweep flex items-center gap-3 bg-primary px-8 py-3 text-xs font-black uppercase tracking-[0.2em] text-white transition-all hover:bg-black"
              >
                Continue
                <span className="text-accent">
                  <ArrowEastIcon />
                </span>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
