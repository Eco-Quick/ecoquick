"use client";

import { useState, useRef } from "react";
import { LandingHeader } from "@/components/layout/LandingHeader";
import { LandingFooter } from "@/components/layout/LandingFooter";

const faqs = [
  {
    q: "How do I change my delivery address after booking?",
    a: "You can change the delivery address within the first 15 minutes of booking directly through the app. After this grace period, please contact our support team immediately. Additional fees may apply based on the new distance.",
  },
  {
    q: "What items are prohibited from shipping?",
    a: "We strictly prohibit the transport of hazardous materials, illegal substances, firearms, and live animals. Please refer to our complete Terms of Service for a detailed list of restricted items to ensure compliance and safety.",
  },
  {
    q: "How does the eco-friendly delivery option work?",
    a: 'Our "Eco-Saver" option utilises electric vehicles and optimised batch routing to minimise carbon emissions. While delivery times may be slightly longer, this option reduces the carbon footprint of your shipment by up to 45%.',
  },
  {
    q: "Can I schedule a recurring pickup for my business?",
    a: "Yes! Business accounts have access to the Recurring Routes feature. You can set weekly, daily, or monthly pickup schedules. Contact our sales team to set up a business account with volume discounts.",
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
    <div className="landing-shell bg-white text-[#3e0074] antialiased">
      <div className="landing-grid-layer" />

      {/* Full-width header */}
      <div className="landing-content px-6 lg:px-8">
        <LandingHeader />
      </div>

      <main className="landing-content min-h-screen pt-6">
        {/* Hero */}
        <section className="relative flex flex-col items-center justify-center overflow-hidden bg-white px-4 py-20 sm:px-6 lg:px-8">
          <div className="absolute inset-0 z-0 opacity-5">
            <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-[#3e0074] blur-3xl" />
            <div className="absolute top-1/2 -left-24 h-64 w-64 rounded-full bg-[#3e0074] blur-3xl" />
          </div>
          <div className="relative z-10 w-full max-w-3xl text-center">
            <h1 className="mb-4 font-display text-5xl font-black tracking-tight text-[#3e0074] md:text-6xl">
              Help center
            </h1>
            <p className="mb-10 text-lg font-medium text-[#3e0074]/60">
              How can we help you today?
            </p>
            <div className="relative w-full overflow-hidden rounded-xl border border-gray-100 bg-white shadow-xl">
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
                placeholder="Search for articles, topics, or keywords..."
                className="block w-full border-0 bg-white py-4 pl-12 pr-24 text-lg text-[#3e0074] placeholder:text-[#3e0074]/30 transition-all focus:border-0 focus:outline-none focus:ring-1 focus:ring-[#3e0074]"
              />
              <button
                onClick={runSearch}
                className="absolute inset-y-0 right-0 bg-[#3e0074] px-6 text-sm font-bold text-white transition-colors hover:bg-[#2f005a]"
              >
                Search
              </button>
            </div>
          </div>
          {query.trim() && (
            <div className="mt-4 text-sm text-[#3e0074]/70">
              {filteredFaqs.length > 0 ? (
                <>
                  Found <strong>{filteredFaqs.length}</strong> result{filteredFaqs.length !== 1 ? "s" : ""} for &ldquo;{query}&rdquo;
                  <button
                    onClick={runSearch}
                    className="ml-3 font-bold text-[#3e0074] underline underline-offset-2"
                  >
                    Jump to answers ↓
                  </button>
                </>
              ) : (
                <>
                  No results for &ldquo;{query}&rdquo; —{" "}
                  <a href="mailto:hello@ecoquick.delivery" className="font-bold text-[#3e0074] underline underline-offset-2">
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
                title: "Live chat",
                body: "Chat with our support team — send us an email and we'll respond within the hour during business hours.",
                cta: "Start chat",
                href: "mailto:hello@ecoquick.delivery?subject=Live Chat Request",
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
                    <path d="M4 5h16v9H7l-3 3z" />
                  </svg>
                ),
              },
              {
                title: "Call support",
                body: "Speak directly with a representative. Available Mon–Fri, 9am–6pm GMT.",
                cta: "Call now",
                href: "tel:+442079460000",
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
                className="group flex flex-col items-start gap-4 border border-[#3e0074]/10 bg-[#3e0074]/[0.03] p-8 transition-all hover:border-[#3e0074]/30 hover:bg-[#3e0074]/[0.05]"
              >
                <div className="flex h-12 w-12 items-center justify-center border border-gray-100 bg-white text-xl text-accent shadow-sm">
                  {card.icon}
                </div>
                <div>
                  <h3 className="mb-1 font-display text-xl font-bold text-[#3e0074]">
                    {card.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-[#3e0074]/60">
                    {card.body}
                  </p>
                </div>
                <div className="mt-auto flex items-center pt-4 text-sm font-bold text-[#3e0074] group-hover:underline">
                  {card.cta} <span className="ml-1 text-sm">→</span>
                </div>
              </a>
            ))}
          </div>
        </section>

        {/* Topics grid */}
        <section className="mx-auto max-w-7xl border-t border-gray-100 px-6 py-12 lg:px-8">
          <div className="mb-10">
            <h2 className="font-display text-3xl font-bold text-[#3e0074]">
              Browse topics
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-px overflow-hidden border border-gray-200 bg-gray-200 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: "Booking",
                icon: (
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
                    <rect x="3" y="4" width="18" height="18" rx="2" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                ),
                items: [
                  "How to schedule a pickup",
                  "Modifying a booking",
                  "Cancel a reservation",
                ],
              },
              {
                title: "Tracking",
                icon: (
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
                    <rect x="3" y="7" width="10" height="10" rx="2" />
                    <path d="M13 9h3l3 3v5h-6Z" />
                    <circle cx="7.5" cy="18" r="1.5" />
                    <circle cx="17.5" cy="18" r="1.5" />
                  </svg>
                ),
                items: [
                  "Where is my package?",
                  "Tracking status explained",
                  "Report missing items",
                ],
              },
              {
                title: "Payments",
                icon: (
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
                    <line x1="3" y1="9" x2="21" y2="9" />
                    <line x1="8" y1="15" x2="12" y2="15" />
                  </svg>
                ),
                items: [
                  "Payment methods",
                  "Request a refund",
                  "Invoice help",
                ],
              },
              {
                title: "Safety",
                icon: (
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
                    <path d="M12 3 5 5v6c0 4.3 2.7 7.4 7 9 4.3-1.6 7-4.7 7-9V5Z" />
                    <path d="m9.5 12.5 1.5 1.5 3.5-3.5" />
                  </svg>
                ),
                items: [
                  "Package insurance",
                  "Driver verification",
                  "Contactless delivery",
                ],
              },
              {
                title: "Areas",
                icon: (
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
                    <path d="M3 6 9 4l6 2 6-2v14l-6 2-6-2-6 2Z" />
                    <path d="M9 4v14" />
                    <path d="M15 6v14" />
                  </svg>
                ),
                items: [
                  "Service coverage map",
                  "International shipping",
                  "Local zone rates",
                ],
              },
              {
                title: "Account",
                icon: (
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
                    <circle cx="12" cy="8" r="3.5" />
                    <path d="M5 20c1.5-3 3.8-4.5 7-4.5s5.5 1.5 7 4.5" />
                  </svg>
                ),
                items: [
                  "Reset password",
                  "Update profile",
                  "Business accounts",
                ],
              },
            ].map((topic) => (
              <div
                key={topic.title}
                className="bg-white p-8 transition-colors hover:bg-gray-50"
              >
                <div className="mb-6 flex items-center gap-3">
                  <span className="text-3xl text-accent">{topic.icon}</span>
                  <h3 className="font-display text-lg font-bold text-[#3e0074]">
                    {topic.title}
                  </h3>
                </div>
                <ul className="space-y-3">
                  {topic.items.map((item) => (
                    <li key={item}>
                      <a
                        href={`mailto:hello@ecoquick.delivery?subject=Help: ${encodeURIComponent(item)}`}
                        className="flex items-center text-sm text-[#3e0074]/60 transition-colors hover:text-[#3e0074]"
                      >
                        <span className="mr-3 h-1.5 w-1.5 rounded-full bg-[#3e0074]/30" />
                        {item}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" ref={faqRef} className="mx-auto max-w-4xl px-6 py-16 lg:px-8">
          <h2 className="mb-10 text-center font-display text-3xl font-bold text-[#3e0074]">
            Frequently asked questions
          </h2>
          {filteredFaqs.length === 0 ? (
            <p className="text-center text-[#3e0074]/50">
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
                  className="group cursor-pointer border-b border-gray-100 pb-6 open:pb-6"
                >
                  <summary className="flex list-none items-start justify-between gap-4 text-[#3e0074] transition-colors group-hover:text-[#3e0074]/70">
                    <span className="font-display text-xl font-bold leading-tight md:text-2xl">
                      {item.q}
                    </span>
                    <span className="transition-transform duration-300 group-open:rotate-180">
                      ▼
                    </span>
                  </summary>
                  <div className="mt-4 max-w-2xl leading-relaxed text-[#3e0074]/70">
                    {item.a}
                  </div>
                </details>
              ))}
            </div>
          )}
        </section>

        {/* Emergency banner */}
        <section className="mt-12 bg-[#3e0074] px-6 py-12 text-white lg:px-8">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-8 md:flex-row">
            <div className="text-center md:text-left">
              <h2 className="mb-2 font-display text-3xl font-black tracking-tight">
                Need immediate help?
              </h2>
              <p className="text-lg text-white/70">
                Our support team is available 24/7 for urgent delivery issues.
              </p>
            </div>
            <a
              href="mailto:hello@ecoquick.delivery?subject=Urgent Support Request"
              className="flex items-center gap-4 border border-white/10 bg-white/10 px-8 py-4 backdrop-blur-sm transition-colors hover:bg-white/20"
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
      </main>

      <div className="landing-content mx-auto w-full max-w-6xl px-6 lg:px-8">
        <LandingFooter />
      </div>
    </div>
  );
}
