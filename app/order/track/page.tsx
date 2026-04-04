"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { BrandLogo } from "@/components/layout/BrandLogo";
import { useCustomerAuth } from "@/hooks/useCustomerAuth";

export default function OrderTrackPage() {
  const router = useRouter();
  const user = useCustomerAuth();
  if (!user) return null;

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-white text-primary">
      {/* Header */}
      <header className="z-50 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6">
        <BrandLogo size="sm" />
        <div className="flex items-center gap-6">
          <div className="hidden items-center gap-6 text-xs font-bold uppercase tracking-[0.22em] text-slate-400 md:flex">
            <Link
              href="/help"
              className="transition-colors hover:text-accent"
            >
              Live Support
            </Link>
            <span className="transition-colors hover:text-accent">
              Order #EQ-8821
            </span>
          </div>
          <button
            className="flex h-10 w-10 items-center justify-center border border-slate-200 sharp-corners transition-colors hover:bg-slate-50"
            onClick={() => router.push("/dashboard")}
            aria-label="Close tracking"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>
      </header>

      {/* Main layout */}
      <main className="relative flex flex-1 flex-col overflow-hidden md:flex-row">
        {/* Left panel */}
        <aside className="z-20 flex w-full flex-col border-r border-slate-200 bg-white md:w-[420px]">
          <div className="border-b border-slate-200 p-8">
            <div className="mb-4 inline-flex items-center gap-2 bg-primary px-2 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-white">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
              Live Tracking
            </div>
            <h2 className="mb-1 text-xs font-bold uppercase tracking-[0.22em] text-slate-400">
              Estimated Arrival
            </h2>
            <div className="mb-2 text-6xl font-black leading-none tracking-tighter sm:text-7xl">
              12
              <span className="ml-2 align-top text-2xl">MINS</span>
            </div>
            <p className="text-sm font-medium text-slate-500">
              Rider is currently picking up your order from{" "}
              <span className="font-bold text-primary">Green Bites Kitchen</span>
              .
            </p>
          </div>

          <div className="border-b border-slate-200 bg-slate-50 p-8">
            <h3 className="mb-4 text-xs font-bold uppercase tracking-[0.22em] text-slate-400">
              Your Rider
            </h3>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center overflow-hidden border border-slate-200 bg-white sharp-corners">
                  <img
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDCGeNJyNsfib0T8D7JQdnNfYlNuZ7TnwD19TomCkEnG7JUCF-66w_ZeBHyHXJqwVLH4Wrmu9bSxNukAmIHWdmmy5EDnEqqVZ0kqKspxoWrxMCcX3LUJp-OLrda6hJUg98XQ5xLCeg5sGnk92wN2cKw_jb4Nk1XZLLyFIgNUC5CAx8ekJyjGMTbSvFG94jRN_kjYRFH2WlgRqVDZcogtXWi_Afy5xayU4f6LqZcewd_qLxFXqvKErwKjXJ9glABcgMSOMqQvnWuzis"
                    alt="Rider"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div>
                  <div className="text-lg font-bold leading-none text-slate-900">
                    Marcus Sterling
                  </div>
                  <div className="mt-1 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-xs text-accent">
                      electric_bolt
                    </span>
                    <span className="text-xs font-bold uppercase tracking-tight text-slate-500">
                      Electric Bike • 4.9 ★
                    </span>
                  </div>
                </div>
              </div>
              <button className="flex h-12 w-12 items-center justify-center bg-primary text-white sharp-corners transition-colors hover:bg-primary/90">
                <span className="material-symbols-outlined">chat_bubble</span>
              </button>
            </div>
          </div>

          <div className="flex-1 p-8">
            <h3 className="mb-8 text-xs font-bold uppercase tracking-[0.22em] text-slate-400">
              Order Journey
            </h3>
            <div className="space-y-10">
              <div className="relative flex gap-6">
                <div className="timeline-line" />
                <div className="timeline-dot active">
                  <span className="material-symbols-outlined text-xs">
                    check
                  </span>
                </div>
                <div>
                  <div className="mb-1 text-xs font-bold uppercase tracking-[0.22em] text-slate-400">
                    11:42 AM
                  </div>
                  <div className="font-bold text-primary">Order Confirmed</div>
                  <div className="mt-1 text-xs uppercase text-slate-500">
                    Payment verified successfully
                  </div>
                </div>
              </div>

              <div className="relative flex gap-6">
                <div className="timeline-line bg-slate-200" />
                <div className="timeline-dot active border-primary">
                  <span className="material-symbols-outlined text-xs">
                    local_mall
                  </span>
                </div>
                <div>
                  <div className="mb-1 text-xs font-bold uppercase tracking-[0.22em] text-slate-400">
                    11:55 AM
                  </div>
                  <div className="font-bold text-primary">
                    Picking up Order
                  </div>
                  <div className="mt-1 text-xs uppercase text-slate-500">
                    Rider has arrived at restaurant
                  </div>
                </div>
              </div>

              <div className="relative flex gap-6">
                <div className="timeline-line bg-slate-200" />
                <div className="timeline-dot pending" />
                <div>
                  <div className="mb-1 text-xs font-bold uppercase tracking-[0.22em] text-slate-300">
                    ETA 12:08 PM
                  </div>
                  <div className="font-bold text-slate-400">
                    Out for Delivery
                  </div>
                  <div className="mt-1 text-xs uppercase text-slate-400">
                    Direct carbon-neutral route
                  </div>
                </div>
              </div>

              <div className="relative flex gap-6">
                <div className="timeline-dot pending" />
                <div>
                  <div className="mb-1 text-xs font-bold uppercase tracking-[0.22em] text-slate-300">
                    ETA 12:15 PM
                  </div>
                  <div className="font-bold text-slate-400">Delivered</div>
                  <div className="mt-1 text-xs uppercase text-slate-400">
                    Handed to customer
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 border-t border-slate-200 p-6">
            <div className="sharp-corners border border-slate-100 p-4">
              <div className="mb-1 text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">
                Distance
              </div>
              <div className="text-xl font-black">
                2.4<span className="ml-1 text-xs">KM</span>
              </div>
            </div>
            <div className="sharp-corners border border-slate-100 p-4">
              <div className="mb-1 text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">
                CO2 Saved
              </div>
              <div className="text-xl font-black text-emerald-600">
                0.8<span className="ml-1 text-xs">KG</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Map section */}
        <section className="relative flex flex-1 overflow-hidden map-bg">
          <svg
            className="pointer-events-none absolute inset-0 h-full w-full opacity-10"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M0 100 L1200 100 M0 300 L1200 300 M0 500 L1200 500 M0 700 L1200 700"
              stroke="#000"
              strokeWidth="1"
            />
            <path
              d="M100 0 L100 800 M400 0 L400 800 M700 0 L700 800 M1000 0 L1000 800"
              stroke="#000"
              strokeWidth="1"
            />
          </svg>
          <svg
            className="pointer-events-none absolute inset-0 h-full w-full"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M300 450 L500 450 L500 250 L850 250"
              fill="none"
              stroke="#3e0074"
              strokeWidth="6"
              strokeLinecap="square"
              strokeLinejoin="miter"
            />
          </svg>

          {/* Rider marker */}
          <div className="absolute left-[400px] top-[450px] z-30 -translate-x-1/2 -translate-y-1/2">
            <div className="relative">
              <div className="sharp-corners absolute inset-0 animate-ping bg-accent opacity-25" />
              <div className="relative flex h-10 w-10 items-center justify-center bg-accent text-white shadow-xl sharp-corners">
                <span className="material-symbols-outlined">pedal_bike</span>
              </div>
            </div>
            <div className="sharp-corners absolute left-1/2 top-full mt-2 -translate-x-1/2 bg-primary px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-white">
              Rider: Marcus
            </div>
          </div>

          {/* Destination marker */}
          <div className="absolute left-[850px] top-[250px] z-30 -translate-x-1/2 -translate-y-1/2">
            <div className="flex h-10 w-10 items-center justify-center border-4 border-primary bg-white text-primary shadow-xl sharp-corners">
              <span className="material-symbols-outlined">home</span>
            </div>
            <div className="sharp-corners absolute left-1/2 top-full mt-2 -translate-x-1/2 border border-slate-200 bg-white px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-primary">
              Your Location
            </div>
          </div>

          {/* Restaurant marker */}
          <div className="absolute left-[300px] top-[450px] z-30 -translate-x-1/2 -translate-y-1/2">
            <div className="flex h-10 w-10 items-center justify-center border-2 border-slate-300 bg-slate-100 text-slate-400 sharp-corners">
              <span className="material-symbols-outlined">restaurant</span>
            </div>
          </div>

          {/* Map controls */}
          <div className="absolute bottom-8 right-8 flex flex-col gap-2">
            <button className="flex h-12 w-12 items-center justify-center border border-slate-200 bg-white text-primary shadow-sm sharp-corners transition-colors hover:bg-slate-50">
              <span className="material-symbols-outlined">add</span>
            </button>
            <button className="flex h-12 w-12 items-center justify-center border border-slate-200 bg-white text-primary shadow-sm sharp-corners transition-colors hover:bg-slate-50">
              <span className="material-symbols-outlined">remove</span>
            </button>
            <button className="mt-4 flex h-12 w-12 items-center justify-center border border-slate-200 bg-white text-primary shadow-sm sharp-corners transition-colors hover:bg-slate-50">
              <span className="material-symbols-outlined">my_location</span>
            </button>
          </div>

          {/* Fleet data card */}
          <div className="sharp-corners absolute right-8 top-8 hidden w-48 border border-slate-200 bg-white p-4 shadow-sm lg:block">
            <h4 className="mb-3 text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">
              Live Fleet Data
            </h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium">Network Load</span>
                <span className="text-[11px] font-bold">OPTIMAL</span>
              </div>
              <div className="h-1 w-full bg-slate-100 sharp-corners">
                <div className="h-full w-2/3 bg-primary" />
              </div>
              <div className="flex items-center justify-between border-t border-slate-100 pt-2">
                <span className="text-[11px] font-medium">Traffic Impact</span>
                <span className="text-[11px] font-bold text-emerald-600">
                  MINIMAL
                </span>
              </div>
            </div>
          </div>

          {/* Mobile slide-up ETA */}
          <div className="sharp-corners fixed bottom-0 left-0 right-0 z-50 transform border-t-4 border-primary bg-white md:hidden transition-transform duration-500 hover:translate-y-0 translate-y-[60%]">
            <div className="mx-auto my-4 h-1 w-12 rounded-full bg-slate-200" />
            <div className="px-6 pb-12">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <div className="text-4xl font-black">12 MINS</div>
                  <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">
                    Estimated Arrival
                  </div>
                </div>
                <button className="sharp-corners bg-primary px-6 py-3 text-xs font-bold uppercase tracking-[0.22em] text-white">
                  Details
                </button>
              </div>
              <div className="flex items-center gap-4 border border-slate-100 bg-slate-50 p-4 sharp-corners">
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDn4K4kgBcgCE0sJInj6Nb_N2SwPySGh-LYb5hDgJSkB8mcsc2Lkh8BQaRd4yAIQe8LGxVzMFo1f9Dy07KBiY2AgjzQNrzEXBW_2mwivskyfh6_cAwTlLQyvUMP1OYJCi2q8IxFotqH4qLPUkEiHM9hMMrqulFJvlAD-YwVha_wl7s4CgnTLDVNUHH2wrrx5CMI-6XtHiC6x2dOvDvBaVlhd9Ydo0ETfAwLTz3fJxYJsumnpj_-FWY-3DnfHu-KTogZlYBzfzqSUUM"
                  alt="Rider"
                  className="h-12 w-12 object-cover sharp-corners grayscale"
                />
                <div className="flex-grow">
                  <div className="font-bold text-slate-900">
                    Marcus Sterling
                  </div>
                  <div className="text-[10px] font-bold uppercase text-slate-500">
                    Electric Bike
                  </div>
                </div>
                <span className="material-symbols-outlined text-primary">
                  call
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Mobile support FAB */}
        <button
          className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center bg-accent text-white shadow-2xl sharp-corners md:hidden"
          onClick={() => router.push("/help")}
          aria-label="Support"
        >
          <span className="material-symbols-outlined">support_agent</span>
        </button>
      </main>
    </div>
  );
}

