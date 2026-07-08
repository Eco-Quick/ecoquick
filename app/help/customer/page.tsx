"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { CustomerTopBar } from "@/components/layout/CustomerTopBar";
import { CustomerMobileNav } from "@/components/layout/CustomerMobileNav";
import { useCustomerAuth } from "@/hooks/useCustomerAuth";

const BOOKING_STEPS = [
  {
    step: "01",
    title: "Choose delivery type",
    body: "Select Instant (arrives within the hour) or Scheduled (pick a time slot). Instant costs £4 more but gets your parcel moving immediately.",
    icon: "schedule",
    href: "/book/type",
    cta: "Start booking",
  },
  {
    step: "02",
    title: "Set pickup & dropoff",
    body: "Enter the pickup address and the recipient's dropoff address. Add sender and recipient names and phone numbers so the driver can reach them.",
    icon: "pin_drop",
    href: "/book/route",
    cta: "Set route",
  },
  {
    step: "03",
    title: "Describe your parcel",
    body: "Choose the package category (envelope, small, medium, large) and enter the weight. Add any special handling instructions for fragile items.",
    icon: "inventory_2",
    href: "/book/parcel",
    cta: "Describe parcel",
  },
  {
    step: "04",
    title: "Review & confirm",
    body: "Check your order summary, see the final price, and confirm. Your order is placed instantly and a driver is assigned automatically.",
    icon: "check_circle",
    href: "/book/confirm",
    cta: "Review order",
  },
];

const FAQS = [
  {
    q: "How do I track my delivery in real time?",
    a: "Go to Orders → find your order → click Track. The map updates live as your driver moves. You'll also receive SMS updates at each status change.",
  },
  {
    q: "Can I cancel after booking?",
    a: "Yes, within 5 minutes of placing the order you can cancel from the Orders page at no charge. After that, a £2 cancellation fee applies if the driver hasn't been assigned yet. Once a driver is en route, cancellation is not available.",
  },
  {
    q: "What's the difference between Instant and Scheduled?",
    a: "Instant dispatch starts immediately — a driver is assigned within minutes and delivery typically happens within 60–90 minutes. Scheduled lets you pick a future time slot and costs £4 less (no surge fee).",
  },
  {
    q: "What sizes can I send?",
    a: "Envelope (up to 0.5kg), Small box (up to 5kg), Medium box (up to 15kg), Large box (up to 30kg). Items must fit on a cargo bike. Oversized or irregularly shaped items should be discussed with support first.",
  },
  {
    q: "How is the price calculated?",
    a: "Base fee £8 + size fee (Envelope £0, Small £3.50, Medium £6.50, Large £12) + instant fee if applicable (£4) − eco discount (£1.50). The total is always shown on the confirm page before you pay.",
  },
  {
    q: "What if my parcel is damaged or lost?",
    a: "All deliveries include basic cover up to £50. Contact support within 24 hours of the estimated delivery time with photos. We'll investigate and process eligible claims within 3–5 business days.",
  },
  {
    q: "Can I send multiple parcels at once?",
    a: "Each booking covers one parcel. To send multiple items, place separate bookings. If you need bulk or recurring deliveries, contact our business team for a volume account.",
  },
  {
    q: "How do I update my account details?",
    a: "Go to Account → Settings. You can update your name, phone number, and password there. Email changes require contacting support for security verification.",
  },
];

export default function CustomerHelpPage() {
  const router = useRouter();
  const user = useCustomerAuth();
  const [query, setQuery] = useState("");
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const faqRef = useRef<HTMLElement>(null);

  if (!user) return null;

  const filteredFaqs = query.trim()
    ? FAQS.filter(
        (f) =>
          f.q.toLowerCase().includes(query.toLowerCase()) ||
          f.a.toLowerCase().includes(query.toLowerCase())
      )
    : FAQS;

  function runSearch() {
    faqRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div className="page-fade min-h-screen bg-white dark:bg-[#050507] dark:text-[#ede9f8]">
      <CustomerTopBar />

      <main className="mx-auto max-w-4xl px-5 pb-24 pt-10 sm:px-6 lg:pb-16 lg:pt-14">

        {/* Header */}
        <div className="mb-10">
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-primary/40 dark:text-zinc-500">
            Customer help
          </p>
          <h1 className="mt-3 text-3xl font-black uppercase tracking-tight text-primary dark:text-[#c084fc] sm:text-4xl">
            How can we help?
          </h1>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            Booking guides, FAQs, and support — all in one place.
          </p>
        </div>

        {/* Quick action — book now */}
        <div className="mb-12 flex items-center justify-between gap-4 border border-primary/10 bg-primary/[0.03] p-5 dark:border-[#4c1d95]/30 dark:bg-[#3f0075]/10">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/50 dark:text-zinc-400">
              Ready to send?
            </p>
            <p className="mt-1 text-sm font-semibold text-primary dark:text-[#c084fc]">
              Book a new delivery in under 2 minutes
            </p>
          </div>
          <button
            onClick={() => router.push("/book/type")}
            className="flex shrink-0 items-center gap-2 bg-primary px-5 py-2.5 text-[10px] font-bold uppercase tracking-[0.22em] text-white hover:bg-[#340062] transition-colors"
          >
            <span className="material-symbols-outlined text-sm text-accent">add</span>
            New delivery
          </button>
        </div>

        {/* Booking walkthrough */}
        <section className="mb-14">
          <h2 className="mb-6 text-[10px] font-bold uppercase tracking-[0.25em] text-zinc-400 dark:text-zinc-500">
            How to book a delivery
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {BOOKING_STEPS.map((s) => (
              <div
                key={s.step}
                className="group relative border border-zinc-200 bg-white p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-[0_4px_16px_rgba(63,0,117,0.08)] dark:border-zinc-800 dark:bg-[#0c0b14] dark:hover:border-[#c084fc]/20"
              >
                <div className="mb-4 flex items-center gap-3">
                  <span className="material-symbols-outlined text-xl text-accent">{s.icon}</span>
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-600">
                    Step {s.step}
                  </span>
                </div>
                <h3 className="mb-2 text-sm font-extrabold uppercase tracking-[0.14em] text-primary dark:text-[#c084fc]">
                  {s.title}
                </h3>
                <p className="text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
                  {s.body}
                </p>
                <button
                  onClick={() => router.push(s.href)}
                  className="mt-4 text-[10px] font-bold uppercase tracking-[0.18em] text-primary opacity-0 transition-opacity duration-200 group-hover:opacity-100 dark:text-[#c084fc]"
                >
                  {s.cta} →
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Search */}
        <div className="mb-3">
          <div className="flex overflow-hidden border border-zinc-200 dark:border-zinc-700">
            <span className="flex items-center pl-4 text-zinc-400">
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <circle cx="11" cy="11" r="6" />
                <line x1="16" y1="16" x2="21" y2="21" />
              </svg>
            </span>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && runSearch()}
              placeholder="Search help articles…"
              className="flex-1 bg-white py-3 pl-3 pr-4 text-sm text-primary placeholder:text-zinc-400 focus:outline-none dark:bg-[#0c0b14] dark:text-[#ede9f8] dark:placeholder:text-zinc-600"
            />
            {query.trim() && (
              <button
                onClick={runSearch}
                className="bg-primary px-5 text-[10px] font-bold uppercase tracking-[0.2em] text-white transition-colors hover:bg-[#340062]"
              >
                Jump
              </button>
            )}
          </div>
          {query.trim() && (
            <p className="mt-2 text-xs text-zinc-400 dark:text-zinc-500">
              {filteredFaqs.length > 0
                ? `${filteredFaqs.length} result${filteredFaqs.length !== 1 ? "s" : ""} for "${query}"`
                : `No results — `}
              {filteredFaqs.length === 0 && (
                <a href="mailto:hello@ecoquick.delivery" className="font-bold text-primary underline-offset-2 hover:underline dark:text-[#c084fc]">
                  contact support
                </a>
              )}
            </p>
          )}
        </div>

        {/* FAQ */}
        <section ref={faqRef} className="mb-14">
          <h2 className="mb-6 text-[10px] font-bold uppercase tracking-[0.25em] text-zinc-400 dark:text-zinc-500">
            Frequently asked questions
          </h2>
          <div className="divide-y divide-zinc-100 border border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800">
            {filteredFaqs.length === 0 ? (
              <p className="px-5 py-8 text-sm text-zinc-400 dark:text-zinc-500">
                No results for &ldquo;{query}&rdquo;.
              </p>
            ) : (
              filteredFaqs.map((faq, i) => (
                <div key={faq.q}>
                  <button
                    className="flex w-full items-center justify-between gap-4 bg-white px-5 py-4 text-left transition-colors hover:bg-zinc-50 dark:bg-[#0c0b14] dark:hover:bg-[#1e1538]"
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  >
                    <span className="text-sm font-semibold text-primary dark:text-[#c084fc]">
                      {faq.q}
                    </span>
                    <span className={`material-symbols-outlined flex-shrink-0 text-lg text-accent transition-transform duration-200 ${openFaq === i ? "rotate-180" : ""}`}>
                      expand_more
                    </span>
                  </button>
                  {openFaq === i && (
                    <div className="bg-white px-5 pb-5 text-sm leading-relaxed text-zinc-600 dark:bg-[#0c0b14] dark:text-zinc-400">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </section>

        {/* Contact strip */}
        <section className="grid gap-3 sm:grid-cols-3">
          {[
            { icon: "chat", label: "WhatsApp", sub: "Chat with us instantly", href: "https://wa.me/448944840002?text=Hi%20EcoQuick!%20I%20need%20help." },
            { icon: "call", label: "Call support", sub: "Mon–Fri, 9am–6pm GMT", href: "tel:+448944840002" },
            { icon: "mail", label: "Email us", sub: "Reply within 24 hours", href: "mailto:hello@ecoquick.delivery?subject=Support Request" },
          ].map((c) => (
            <a
              key={c.label}
              href={c.href}
              className="flex items-center gap-3 border border-zinc-200 bg-white p-4 transition-all hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-[0_4px_12px_rgba(63,0,117,0.08)] dark:border-zinc-800 dark:bg-[#0c0b14] dark:hover:border-[#c084fc]/20"
            >
              <span className="material-symbols-outlined text-xl text-accent">{c.icon}</span>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-primary dark:text-[#c084fc]">{c.label}</p>
                <p className="text-[10px] text-zinc-400 dark:text-zinc-500">{c.sub}</p>
              </div>
            </a>
          ))}
        </section>
      </main>

      <CustomerMobileNav />
    </div>
  );
}
