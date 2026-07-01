"use client";

import { useState, useRef } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import { LandingHeader } from "@/components/layout/LandingHeader";
import { LandingFooter } from "@/components/layout/LandingFooter";

function highlight(text: string, query: string): ReactNode {
  const q = query.trim();
  if (!q) return text;
  const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const parts = text.split(new RegExp(`(${escaped})`, "ig"));
  return parts.map((part, i) =>
    part.toLowerCase() === q.toLowerCase() ? (
      <mark
        key={i}
        className="bg-[#c084fc]/30 text-[#3e0074] dark:bg-[#c084fc]/40 dark:text-white"
      >
        {part}
      </mark>
    ) : (
      <span key={i}>{part}</span>
    )
  );
}

const faqs = [
  {
    q: "How quickly can you deliver my package?",
    a: "Our instant delivery service aims to dispatch a driver as soon as possible within our service area. Actual delivery times depend on driver availability, distance, traffic and weather. If you need certainty, you can also book a scheduled delivery for a specific time window.",
  },
  {
    q: "What areas do you cover?",
    a: "We currently serve Kingston upon Thames and the surrounding boroughs — including Richmond upon Thames, Twickenham, Teddington, Hampton, Surbiton, New Malden and Wimbledon. We're expanding to new areas regularly. If your postcode is outside our zone you'll see a clear message at booking.",
  },
  {
    q: "How much does delivery cost?",
    a: "Pricing is distance-banded and shown upfront before you pay: 0–1 mile £3.20, 1–3 miles £4.90, 3–6 miles £7.10, 6–8 miles £9.60. We measure the straight-line distance from your pickup to your drop-off. There are no hidden charges — what you see in the quote is what you pay.",
  },
  {
    q: "Are my packages insured?",
    a: "Yes — every delivery is insured, but coverage depends on the product category and delivery type you select at booking. High-value or fragile items may require additional declarations. For full terms please refer to our policy or contact support before booking.",
  },
  {
    q: "Can I track my delivery in real time?",
    a: "Yes. Once a driver is assigned, you'll get a live tracking page showing the driver's location on a map plus a status timeline (Confirmed → Driver assigned → Picked up → On the way → Delivered). Each status change pushes a notification to your account, and the map updates as the driver moves — no refresh required.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept all major credit and debit cards (Visa, Mastercard, American Express) through our secure Stripe payment gateway. Where available, Apple Pay and Google Pay are supported at checkout. Payment is taken at the time of booking and you'll receive a receipt by email.",
  },
  {
    q: "What if my package is lost or damaged?",
    a: "Report any issues within 24 hours of delivery through your customer dashboard or by contacting support directly. We'll investigate with the driver, review the case under our insurance policy, and provide compensation accordingly. Keep any photos of the package and packaging — they help us resolve cases faster.",
  },
  {
    q: "Can I schedule a delivery for later?",
    a: "Yes — you can schedule deliveries up to 7 days in advance. Choose from morning (8 AM – 12 PM), afternoon (12 PM – 6 PM), or evening (6 PM – 10 PM) windows. A small £2.50 scheduling fee applies to lock in your preferred time slot.",
  },
  {
    q: "What items can I send (and what's prohibited)?",
    a: "We deliver most everyday parcels — documents, gifts, groceries, retail goods, and age-restricted items where the driver verifies ID at handover. We do not transport hazardous materials, illegal substances, firearms, live animals, or items above our published weight/size limits. The booking flow will warn you if your item category needs special handling.",
  },
  {
    q: "How do I change my delivery address after booking?",
    a: "If the driver hasn't picked up the package yet, contact support via WhatsApp or phone and we'll do our best to update the drop-off — fees may apply depending on the new distance. Once a parcel is in transit, address changes aren't possible for the driver's safety and route integrity.",
  },
  {
    q: "Do you offer business or recurring delivery accounts?",
    a: "Yes — business accounts include recurring pickup schedules, volume pricing, dedicated support and consolidated invoicing. Visit our business page or email hello@ecoquick.delivery and our team will set you up.",
  },
];

export default function HelpPage() {
  const [query, setQuery] = useState("");
  const faqRef = useRef<HTMLElement>(null);

  const filteredFaqs = query.trim()
    ? faqs.filter(
        (f) =>
          f.q.toLowerCase().includes(query.toLowerCase()) ||
          f.a.toLowerCase().includes(query.toLowerCase())
      )
    : faqs;

  function runSearch() {
    faqRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div className="landing-shell bg-white text-[#3e0074] dark:bg-[#050507] dark:text-white antialiased">
      <div className="landing-grid-layer" />

      {/* Full-width header */}
      <div className="landing-content px-6 lg:px-8">
        <LandingHeader />
      </div>

      <main className="landing-content min-h-screen pt-6">
        {/* Hero */}
        <section className="relative flex flex-col items-center justify-center overflow-hidden bg-white dark:bg-[#050507] px-4 py-20 sm:px-6 lg:px-8">
          <div className="absolute inset-0 z-0 opacity-5">
            <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-[#3e0074] dark:bg-[#c084fc] blur-3xl" />
            <div className="absolute top-1/2 -left-24 h-64 w-64 rounded-full bg-[#3e0074] dark:bg-[#c084fc] blur-3xl" />
          </div>
          <div className="relative z-10 w-full max-w-3xl text-center">
            <h1 className="mb-4 font-display text-5xl font-black tracking-tight text-[#3e0074] dark:text-[#c084fc] md:text-6xl">
              Help center
            </h1>
            <p className="mb-10 text-lg font-medium text-[#3e0074]/60 dark:text-[#d8d0f0]">
              How can we help you today?
            </p>
            <div className="relative w-full overflow-hidden rounded-xl border border-gray-100 dark:border-[#1a1525] bg-white dark:bg-[#0c0b14] shadow-xl">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                <span className="text-accent">
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="11" cy="11" r="6" />
                    <line x1="16" y1="16" x2="21" y2="21" />
                  </svg>
                </span>
              </div>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && runSearch()}
                placeholder="Search by keyword: tracking, payment, insurance…"
                className="block w-full border-0 bg-white dark:bg-[#0c0b14] py-4 pl-12 pr-32 text-lg text-[#3e0074] dark:text-[#ede9f8] placeholder:text-[#3e0074]/30 dark:placeholder:text-[#8b7aaa] transition-all focus:border-0 focus:outline-none focus:ring-1 focus:ring-[#3e0074] dark:focus:ring-[#c084fc]"
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  aria-label="Clear search"
                  className="absolute inset-y-0 right-24 flex items-center pr-3 text-[#3e0074]/40 hover:text-[#3e0074] dark:text-[#c4b5d8]/60 dark:hover:text-white"
                >
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              )}
              <button
                onClick={runSearch}
                className="absolute inset-y-0 right-0 bg-[#3e0074] dark:bg-[#c084fc] px-6 text-sm font-bold text-white dark:text-[#050507] transition-colors hover:bg-[#2f005a] dark:hover:bg-[#d8b4fe]"
              >
                Search
              </button>
            </div>
          </div>
          {query.trim() && (
            <div className="mt-4 text-sm text-[#3e0074]/70 dark:text-[#c4b5d8]">
              {filteredFaqs.length > 0 ? (
                <>
                  Found <strong>{filteredFaqs.length}</strong> result{filteredFaqs.length !== 1 ? "s" : ""} for &ldquo;{query}&rdquo;
                  <button
                    onClick={runSearch}
                    className="ml-3 font-bold text-[#3e0074] dark:text-[#c084fc] underline underline-offset-2"
                  >
                    Jump to answers ↓
                  </button>
                </>
              ) : (
                <>
                  No results for &ldquo;{query}&rdquo; —{" "}
                  <a href="mailto:hello@ecoquick.delivery" className="font-bold text-[#3e0074] dark:text-[#c084fc] underline underline-offset-2">
                    contact support
                  </a>
                </>
              )}
            </div>
          )}
        </section>

        {/* Instant support cards */}
        <section className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {[
              {
                title: "WhatsApp Chat",
                body: "Chat instantly with our support team on WhatsApp. Available during business hours.",
                cta: "Chat on WhatsApp",
                href: "https://wa.me/447393080529?text=Hi%20EcoQuick!%20I%20need%20help.",
                icon: (
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    className="h-5 w-5"
                    fill="currentColor"
                  >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                ),
              },
              {
                title: "Call support",
                body: "Speak directly with a representative. Available Mon–Fri, 9am–6pm GMT.",
                cta: "Call now",
                href: "tel:+447393080529",
                icon: (
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M5 4a2 2 0 0 1 2.2-2l2.3.4a2 2 0 0 1 1.5 1.5l.4 2.3a2 2 0 0 1-.6 1.9l-1.2 1.2a12 12 0 0 0 5.4 5.4l1.2-1.2a2 2 0 0 1 1.9-.6l2.3.4a2 2 0 0 1 1.5 1.5l.4 2.3A2 2 0 0 1 20 22h-1C11.7 21.6 4.4 14.3 4 6V5Z" />
                  </svg>
                ),
              },
              {
                title: "Email support",
                body: "Send us a detailed inquiry and we'll respond within 24 hours.",
                cta: "Send email",
                href: "mailto:hello@ecoquick.delivery?subject=Support Request",
                icon: (
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="3" y="5" width="18" height="14" rx="2" />
                    <path d="M3 7l9 6 9-6" />
                  </svg>
                ),
              },
            ].map((card) => (
              <a
                key={card.title}
                href={card.href}
                className="group flex flex-col items-start gap-4 border border-[#3e0074]/10 dark:border-[#c084fc]/10 bg-[#3e0074]/[0.03] dark:bg-[#c084fc]/[0.03] p-8 transition-all hover:border-[#3e0074]/30 dark:hover:border-[#c084fc]/30 hover:bg-[#3e0074]/[0.05] dark:hover:bg-[#c084fc]/[0.05]"
              >
                <div className="flex h-12 w-12 items-center justify-center border border-gray-100 dark:border-[#1a1525] bg-white dark:bg-[#0c0b14] text-xl text-accent shadow-sm">
                  {card.icon}
                </div>
                <div>
                  <h3 className="mb-1 font-display text-xl font-bold text-[#3e0074] dark:text-white">
                    {card.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-[#3e0074]/60 dark:text-[#d8d0f0]">
                    {card.body}
                  </p>
                </div>
                <div className="mt-auto flex items-center pt-4 text-sm font-bold text-[#3e0074] dark:text-[#c084fc] group-hover:underline">
                  {card.cta} <span className="ml-1 text-sm">→</span>
                </div>
              </a>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" ref={faqRef} className="mx-auto max-w-4xl px-6 py-16 lg:px-8">
          <h2 className="mb-10 text-center font-display text-3xl font-bold text-[#3e0074] dark:text-white">
            Frequently asked questions
          </h2>
          {filteredFaqs.length === 0 ? (
            <p className="text-center text-[#3e0074]/50 dark:text-[#9d8ab8]">
              No results for &ldquo;{query}&rdquo;. Try a different search or{" "}
              <a href="mailto:hello@ecoquick.delivery" className="underline">
                contact support
              </a>
              .
            </p>
          ) : (
            <div className="space-y-6">
              {filteredFaqs.map((item) => (
                <details
                  key={item.q}
                  open={!!query.trim()}
                  className="group cursor-pointer border-b border-gray-100 dark:border-[#1a1525] pb-6 open:pb-6"
                >
                  <summary className="flex list-none items-start justify-between gap-4 text-[#3e0074] dark:text-white transition-colors group-hover:text-[#3e0074]/70 dark:group-hover:text-white/70">
                    <span className="font-display text-xl font-bold leading-tight md:text-2xl">
                      {highlight(item.q, query)}
                    </span>
                    <span className="transition-transform duration-300 group-open:rotate-180">
                      ▼
                    </span>
                  </summary>
                  <div className="mt-4 max-w-2xl leading-relaxed text-[#3e0074]/70 dark:text-[#c4b5d8]">
                    {highlight(item.a, query)}
                  </div>
                </details>
              ))}
            </div>
          )}
        </section>

        {/* Emergency banner */}
        <section className="mt-12 bg-[#3e0074] dark:bg-[#0c0b14] px-6 py-12 text-white dark:text-[#ede9f8] lg:px-8">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-8 md:flex-row">
            <div className="text-center md:text-left">
              <h2 className="mb-2 font-display text-3xl font-black tracking-tight">
                Need immediate help?
              </h2>
              <p className="text-lg text-white/70 dark:text-[#ede9f8]/70">
                Our support team is available 24/7 for urgent delivery issues.
              </p>
            </div>
            <a
              href="mailto:hello@ecoquick.delivery?subject=Urgent Support Request"
              className="flex items-center gap-4 border border-white/10 dark:border-[#c084fc]/20 bg-white/10 dark:bg-[#c084fc]/10 px-8 py-4 backdrop-blur-sm transition-colors hover:bg-white/20 dark:hover:bg-[#c084fc]/20"
            >
              <span className="text-accent">
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="5" width="18" height="14" rx="2" />
                  <path d="M3 7l9 6 9-6" />
                </svg>
              </span>
              <div className="flex flex-col">
                <span className="text-xs font-bold uppercase tracking-[0.2em] opacity-70">
                  Emergency support
                </span>
                <span className="font-display text-xl font-bold tracking-tight">
                  hello@ecoquick.delivery
                </span>
              </div>
            </a>
          </div>
        </section>

        {/* CTA */}
        <section className="px-6 py-12 md:px-10 md:py-16">
          <div className="mx-auto max-w-5xl rounded-3xl bg-[#3e0074] px-8 py-12 text-center text-white md:px-16 md:py-16 dark:bg-[#5b21b6]">
            <h2 className="text-3xl font-bold md:text-5xl">Ready to send something?</h2>
            <p className="mx-auto mt-4 max-w-md text-[15px] leading-relaxed text-white/70">
              Skip the queue — book a carbon-neutral delivery in under two minutes.
            </p>
            <div className="mt-10 flex justify-center">
              <Link
                href="/book/type"
                className="rounded-full bg-white px-10 py-4 text-[12px] font-bold uppercase tracking-[0.18em] text-[#3e0074] shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl active:scale-[0.97] dark:bg-[#0c0b14] dark:text-[#c084fc] dark:border dark:border-[#302555]"
              >
                Send a Parcel
              </Link>
            </div>
          </div>
        </section>
      </main>

      <div className="landing-content mx-auto w-full max-w-6xl px-6 lg:px-8">
        <LandingFooter />
      </div>
    </div>
  );
}
