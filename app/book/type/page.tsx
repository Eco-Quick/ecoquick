"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BookingStepper } from "../../../components/book/BookingStepper";
import { BookingTopBar } from "@/components/layout/BookingTopBar";
import { useBookingAuth } from "@/hooks/useBookingAuth";
import { BookingAuthError } from "@/components/book/BookingAuthError";

export default function BookTypePage() {
  const { user, error: authError } = useBookingAuth();
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

  function handleContinue() {
    const type = selected ?? "instant";
    try {
      const saved = sessionStorage.getItem("deliveryRequest");
      const data = saved ? JSON.parse(saved) : {};
      sessionStorage.setItem("deliveryRequest", JSON.stringify({ ...data, deliveryType: type }));
    } catch {}
    router.push("/book/route");
  }

  if (authError) return <BookingAuthError message={authError} />;
  if (!user || !hydrated) return null;

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-[#050507] dark:text-[#ede9f8]">
      <BookingTopBar isAnonymous={!!user?.isAnonymous} />

      <main className="flex flex-1 flex-col items-center px-4 py-6 md:py-10">
        <div className="w-full max-w-2xl">
          <div className="mb-8">
            <BookingStepper currentStep={1} />
          </div>

          <h1 className="mb-2 text-center text-2xl font-bold text-zinc-900 dark:text-[#ede9f8] md:text-3xl">
            Delivery type
          </h1>
          <p className="mb-8 text-center font-secondary text-sm text-zinc-500 dark:text-zinc-400">
            How urgently do you need your parcel delivered?
          </p>

          <div className="grid gap-4 sm:grid-cols-2">
            {/* Instant */}
            <button
              onClick={() => setSelected("instant")}
              className={`group relative flex flex-col rounded-2xl border-2 p-6 text-left transition-all duration-200 active:scale-[0.98] ${
                selected === "instant"
                  ? "border-[#3e0074] bg-[#3e0074]/[0.04] shadow-[0_0_0_1px_rgba(62,0,117,0.1)] dark:border-[#c084fc] dark:bg-[#c084fc]/[0.06]"
                  : "border-zinc-200 bg-white hover:border-zinc-300 hover:shadow-md dark:border-zinc-800 dark:bg-[#0c0b14] dark:hover:border-zinc-700"
              }`}
            >
              {selected === "instant" && (
                <div className="absolute right-4 top-4 flex h-6 w-6 items-center justify-center rounded-full bg-[#3e0074] text-white dark:bg-[#c084fc] dark:text-[#050507]">
                  <span className="material-symbols-outlined text-sm">check</span>
                </div>
              )}
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-900/20">
                <span className="material-symbols-outlined text-2xl text-amber-600">bolt</span>
              </div>
              <h3 className="mb-1 text-lg font-bold text-zinc-900 dark:text-[#ede9f8]">
                Instant
              </h3>
              <p className="mb-4 font-secondary text-[13px] leading-relaxed text-zinc-500 dark:text-zinc-400">
                Electric courier dispatched immediately. Direct point-to-point within 60 minutes.
              </p>
              <div className="mt-auto flex items-center gap-2 text-[12px] font-semibold text-emerald-600">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </span>
                Couriers available now
              </div>
            </button>

            {/* Scheduled */}
            <button
              onClick={() => setSelected("scheduled")}
              className={`group relative flex flex-col rounded-2xl border-2 p-6 text-left transition-all duration-200 active:scale-[0.98] ${
                selected === "scheduled"
                  ? "border-[#3e0074] bg-[#3e0074]/[0.04] shadow-[0_0_0_1px_rgba(62,0,117,0.1)] dark:border-[#c084fc] dark:bg-[#c084fc]/[0.06]"
                  : "border-zinc-200 bg-white hover:border-zinc-300 hover:shadow-md dark:border-zinc-800 dark:bg-[#0c0b14] dark:hover:border-zinc-700"
              }`}
            >
              {selected === "scheduled" && (
                <div className="absolute right-4 top-4 flex h-6 w-6 items-center justify-center rounded-full bg-[#3e0074] text-white dark:bg-[#c084fc] dark:text-[#050507]">
                  <span className="material-symbols-outlined text-sm">check</span>
                </div>
              )}
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-900/20">
                <span className="material-symbols-outlined text-2xl text-blue-600">calendar_month</span>
              </div>
              <h3 className="mb-1 text-lg font-bold text-zinc-900 dark:text-[#ede9f8]">
                Scheduled
              </h3>
              <p className="mb-4 font-secondary text-[13px] leading-relaxed text-zinc-500 dark:text-zinc-400">
                Pick a time window up to 2 weeks ahead. Ideal for planned or recurring deliveries.
              </p>
              <div className="mt-auto text-[12px] font-semibold text-zinc-400 dark:text-zinc-500">
                Book up to 14 days ahead
              </div>
            </button>
          </div>

          {/* Actions */}
          <div className="mt-8 flex items-center justify-between">
            <Link
              href="/"
              className="flex items-center gap-2 text-[13px] font-semibold text-zinc-400 transition-colors hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300"
            >
              <span className="material-symbols-outlined text-base">arrow_back</span>
              Back
            </Link>
            <button
              onClick={handleContinue}
              className="rounded-xl bg-[#3e0074] px-10 py-4 text-[13px] font-bold text-white shadow-[0_4px_16px_rgba(63,0,117,0.3)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(63,0,117,0.4)] active:scale-[0.98] dark:bg-[#5b21b6]"
            >
              Continue
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
