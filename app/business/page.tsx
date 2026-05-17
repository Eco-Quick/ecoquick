"use client";

import { useState } from "react";
import Link from "next/link";
import { LandingHeader } from "@/components/layout/LandingHeader";
import { LandingFooter } from "@/components/layout/LandingFooter";

export default function BusinessPage() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    companySize: "1–50 employees",
    monthlyVolume: "< 1,000 pkgs",
  });
  const [submitted, setSubmitted] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/business-enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Something went wrong.");
      }

      // Also open mailto as a direct email fallback
      const subject = encodeURIComponent("EcoQuick Business Partnership Enquiry");
      const mailBody = encodeURIComponent(
        `Name: ${form.firstName} ${form.lastName}\nEmail: ${form.email}\nCompany size: ${form.companySize}\nMonthly volume: ${form.monthlyVolume}`
      );
      window.open(`mailto:hello@ecoquick.delivery?subject=${subject}&body=${mailBody}`, "_blank");

      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit.");
    } finally {
      setSubmitting(false);
    }
  }

  const inputClass =
    "w-full rounded-xl border border-zinc-200 bg-white px-4 py-3.5 text-sm text-zinc-900 placeholder:text-zinc-400 transition-all duration-200 focus:border-[#3e0074] focus:outline-none focus:ring-2 focus:ring-[#3e0074]/10 dark:border-zinc-700 dark:bg-[#0c0b14] dark:text-[#ede9f8] dark:placeholder:text-zinc-600 dark:focus:border-[#c084fc] dark:focus:ring-[#c084fc]/10";

  const selectClass =
    "w-full rounded-xl border border-zinc-200 bg-white px-4 py-3.5 text-sm text-zinc-900 transition-all duration-200 focus:border-[#3e0074] focus:outline-none focus:ring-2 focus:ring-[#3e0074]/10 dark:border-zinc-700 dark:bg-[#0c0b14] dark:text-[#ede9f8] dark:focus:border-[#c084fc] dark:focus:ring-[#c084fc]/10";

  return (
    <div className="landing-shell min-h-screen bg-white text-zinc-900 dark:bg-[#050507] dark:text-[#ede9f8]">
      <div className="landing-grid-layer" />

      <div className="landing-content px-6 lg:px-8">
        <LandingHeader />
      </div>

      <main className="landing-content">
        {/* Hero */}
        <section className="border-b border-zinc-100 px-6 pb-14 pt-12 dark:border-zinc-800 md:px-10 md:pb-20 md:pt-20">
          <div className="mx-auto max-w-5xl text-center">
            <p className="hero-fade mb-5 text-[11px] font-semibold uppercase tracking-[0.25em] text-[#3e0074]/50 dark:text-zinc-400">
              For Business
            </p>
            <h1 className="hero-heading-reveal text-[clamp(2rem,6vw,5rem)] font-bold leading-[1.08] tracking-[-0.03em] text-zinc-900 dark:text-[#ede9f8]">
              Scale smarter, <span className="text-[#3e0074] dark:text-[#c084fc]">grow faster</span> with EcoQuick.
            </h1>
            <p className="hero-buttons-fade mx-auto mt-8 max-w-2xl text-[15px] leading-relaxed text-zinc-600 dark:text-zinc-400">
              Deliver faster, serve better, and build lasting customer relationships
              with a seamless, hyperlocal delivery network.
            </p>
            <div className="hero-buttons-fade mt-8 flex flex-wrap justify-center gap-4">
              <Link
                href="/signup"
                className="rounded-full bg-[#3e0074] px-10 py-4 text-[12px] font-bold uppercase tracking-[0.18em] text-white shadow-[0_4px_16px_rgba(63,0,117,0.3)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(63,0,117,0.4)] active:scale-[0.97] dark:bg-[#5b21b6]"
              >
                Get started
              </Link>
              <a
                href="#solutions"
                className="rounded-full border border-zinc-200 bg-white px-10 py-4 text-[12px] font-bold uppercase tracking-[0.18em] text-zinc-700 transition-all duration-300 hover:-translate-y-0.5 hover:border-[#3e0074]/30 hover:text-[#3e0074] active:scale-[0.97] dark:border-zinc-700 dark:bg-[#0c0b14] dark:text-zinc-300 dark:hover:border-[#c084fc]/40 dark:hover:text-[#c084fc]"
              >
                View solutions
              </a>
            </div>

          </div>
        </section>

        {/* Why EcoQuick — benefits + solutions, no symbols */}
        <section id="solutions" className="px-6 py-12 md:px-10 md:py-16">
          <div className="mx-auto max-w-5xl">
            <div className="mb-10 text-center md:mb-12">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.3em] text-[#3e0074]/60 dark:text-[#c084fc]/70">
                Why us
              </p>
              <h2 className="text-3xl font-bold text-zinc-900 dark:text-[#ede9f8] md:text-5xl">
                Why EcoQuick for{" "}
                <span className="text-[#3e0074] dark:text-[#c084fc]">your business</span>
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-[15px] leading-relaxed text-zinc-600 dark:text-zinc-400">
                Everything your local business needs to grow — and the features that make it happen.
              </p>
            </div>

            {/* Benefits — 2x2 grid */}
            <div className="grid gap-4 sm:grid-cols-2 md:gap-6">
              {[
                { k: "01", title: "Go beyond walk-in customers", body: "Turn your local presence into a wider reach with instant delivery." },
                { k: "02", title: "Pay as you grow", body: "Flexible pricing that scales with your business—no unnecessary costs." },
                { k: "03", title: "Support that has your back", body: "Dedicated assistance to keep your deliveries running smoothly." },
                { k: "04", title: "Deliver an experience, not just parcels", body: "Reliable, seamless delivery that keeps your customers coming back." },
              ].map((item) => (
                <div
                  key={item.k}
                  className="group relative overflow-hidden rounded-2xl border border-zinc-200 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[#3e0074]/25 hover:shadow-[0_12px_40px_rgba(62,0,116,0.12)] md:p-7 dark:border-[#3d3455] dark:bg-[#0e0c16] dark:hover:border-[#c084fc]/30"
                >
                  <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-[#3e0074]/[0.04] blur-2xl transition-opacity duration-300 group-hover:bg-[#3e0074]/[0.08] dark:bg-[#c084fc]/[0.08] dark:group-hover:bg-[#c084fc]/[0.15]" />

                  <span className="font-secondary text-2xl font-bold text-zinc-300 transition-colors duration-300 group-hover:text-[#3e0074] dark:text-zinc-700 dark:group-hover:text-[#c084fc]">
                    {item.k}
                  </span>
                  <h3 className="relative mt-3 text-lg font-bold leading-snug text-zinc-900 dark:text-white">
                    {item.title}
                  </h3>
                  <p className="relative mt-2 text-[14px] leading-relaxed text-zinc-600 dark:text-zinc-400">
                    {item.body}
                  </p>
                </div>
              ))}
            </div>

            {/* Divider with label */}
            <div className="mx-auto mt-12 mb-6 flex max-w-xs items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.3em] text-zinc-400 dark:text-zinc-500 md:mt-16">
              <span className="h-px flex-1 bg-zinc-200 dark:bg-zinc-700" />
              <span>What we offer</span>
              <span className="h-px flex-1 bg-zinc-200 dark:bg-zinc-700" />
            </div>

            {/* Solutions — 1x3 grid, simpler styling */}
            <div className="grid gap-4 sm:grid-cols-3 md:gap-5">
              {[
                { title: "Bulk Deliveries", body: "Handle high order volumes without the stress." },
                { title: "Dedicated Support", body: "Your own account manager to keep everything running smoothly." },
                { title: "On-Demand or Scheduled", body: "Deliver instantly or plan ahead—flexibility built around your business." },
              ].map((item) => (
                <div
                  key={item.title}
                  className="group rounded-2xl border border-dashed border-zinc-300 bg-zinc-50/50 p-5 transition-all duration-300 hover:border-solid hover:border-[#3e0074]/30 hover:bg-white dark:border-zinc-700 dark:bg-[#0a0712]/50 dark:hover:border-[#c084fc]/30 dark:hover:bg-[#0e0c16]"
                >
                  <h4 className="text-[13px] font-bold uppercase tracking-[0.12em] text-[#3e0074] dark:text-[#c084fc]">
                    {item.title}
                  </h4>
                  <p className="mt-2 text-[14px] leading-relaxed text-zinc-600 dark:text-zinc-400">
                    {item.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Plans */}
        <section id="pricing" className="bg-zinc-50 px-6 py-12 md:px-10 md:py-16 dark:bg-[#050507]">
          <div className="mx-auto max-w-5xl">
            <div className="mb-10 text-center md:mb-12">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.3em] text-[#3e0074]/60 dark:text-[#c084fc]/70">
                Plans
              </p>
              <h2 className="text-3xl font-bold text-zinc-900 dark:text-[#ede9f8] md:text-5xl">
                Pick the plan that fits
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-[15px] leading-relaxed text-zinc-600 dark:text-zinc-400">
                Three ways to work with EcoQuick — start small, scale up, or go all in.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {[
                {
                  title: "Starter",
                  tagline: "For small businesses just getting started.",
                  features: ["Pay-as-you-go deliveries", "Standard support", "Basic analytics"],
                  cta: "Start free",
                  featured: false,
                },
                {
                  title: "Professional",
                  tagline: "For growing businesses with regular delivery needs.",
                  features: ["Priority 24/7 support", "Advanced analytics", "Multiple team seats"],
                  cta: "Get in touch",
                  featured: true,
                  badge: "Popular",
                },
                {
                  title: "Enterprise",
                  tagline: "For high-volume operations that need it all.",
                  features: ["Volume discounts", "Dedicated account manager", "Custom API & SLA"],
                  cta: "Contact sales",
                  featured: false,
                },
              ].map((plan) => (
                <div
                  key={plan.title}
                  className={`relative rounded-2xl border p-7 transition-all duration-300 hover:-translate-y-1 md:p-8 ${
                    plan.featured
                      ? "border-[#3e0074]/30 bg-gradient-to-br from-white to-zinc-50 shadow-[0_4px_12px_rgba(0,0,0,0.08),0_12px_32px_rgba(62,0,116,0.1)] dark:border-[#c084fc]/30 dark:from-[#15121f] dark:to-[#0e0c16] dark:shadow-[0_4px_16px_rgba(0,0,0,0.6),0_12px_32px_rgba(192,132,252,0.08),inset_0_1px_0_rgba(192,132,252,0.1)]"
                      : "border-zinc-200 bg-gradient-to-br from-white to-zinc-50 shadow-[0_4px_12px_rgba(0,0,0,0.06),0_8px_24px_rgba(0,0,0,0.04)] dark:border-[#3d3455] dark:from-[#15121f] dark:to-[#0e0c16] dark:shadow-[0_4px_16px_rgba(0,0,0,0.6),0_12px_32px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(192,132,252,0.06)]"
                  }`}
                >
                  {plan.badge && (
                    <span className="absolute -top-3 right-6 rounded-full bg-accent px-3 py-1 text-[10px] font-bold text-white">
                      {plan.badge}
                    </span>
                  )}
                  <h4 className="text-xl font-bold text-zinc-900 dark:text-[#ede9f8]">{plan.title}</h4>
                  <p className="mt-2 mb-6 text-[14px] leading-relaxed text-zinc-600 dark:text-zinc-400">
                    {plan.tagline}
                  </p>
                  <ul className="mb-8 space-y-3 border-t border-zinc-200 pt-6 dark:border-zinc-700">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-3 text-[14px] text-zinc-700 dark:text-zinc-300">
                        <span className="material-symbols-outlined mt-0.5 text-base text-emerald-500">check_circle</span>
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={plan.cta === "Contact sales" ? "#contact" : "/signup"}
                    className={`block w-full rounded-xl py-3.5 text-center text-[12px] font-bold uppercase tracking-[0.18em] transition-all duration-300 hover:-translate-y-0.5 active:scale-[0.98] ${
                      plan.featured
                        ? "bg-[#3e0074] text-white shadow-[0_4px_16px_rgba(63,0,117,0.3)] hover:shadow-[0_8px_24px_rgba(63,0,117,0.4)] dark:bg-[#5b21b6]"
                        : "border border-zinc-200 text-zinc-700 hover:border-[#3e0074]/30 hover:text-[#3e0074] dark:border-[#3d3455] dark:text-zinc-300 dark:hover:border-[#c084fc]/40 dark:hover:text-[#c084fc]"
                    }`}
                  >
                    {plan.cta}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Partnership form */}
        <section id="contact" className="px-6 py-12 md:px-10 md:py-16">
          <div className="mx-auto max-w-5xl">
            <div className="grid gap-12 lg:grid-cols-2">
              <div>
                <h2 className="text-3xl font-bold text-zinc-900 dark:text-[#ede9f8] md:text-5xl">
                  Partnership
                </h2>
                <p className="mt-4 max-w-md text-[15px] leading-relaxed text-zinc-600 dark:text-zinc-400">
                  Join enterprise partners scaling their logistics with EcoQuick.
                  Request a personalized demo.
                </p>
                <div className="mt-6 flex items-center gap-2 text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">
                  <span className="material-symbols-outlined text-sm">verified_user</span>
                  GDPR compliant & secure
                </div>
              </div>

              <div className="rounded-2xl border border-zinc-200 bg-white p-8 dark:border-[#3d3455] dark:bg-gradient-to-br dark:from-[#15121f] dark:to-[#0e0c16]">
                {submitted ? (
                  <div className="flex flex-col items-center gap-4 py-8 text-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-900/20">
                      <span className="material-symbols-outlined text-2xl text-emerald-600">check_circle</span>
                    </div>
                    <p className="text-lg font-bold text-zinc-900 dark:text-[#ede9f8]">Request sent</p>
                    <p className="text-[15px] text-zinc-600 dark:text-zinc-400">We&apos;ll be in touch within 1 business day.</p>
                    <button
                      onClick={() => setSubmitted(false)}
                      className="mt-2 text-[12px] font-semibold text-[#3e0074] hover:underline dark:text-[#c084fc]"
                    >
                      Submit another
                    </button>
                  </div>
                ) : (
                  <form className="space-y-5" onSubmit={handleSubmit}>
                    <div className="grid gap-5 sm:grid-cols-2">
                      <div>
                        <label className="mb-1.5 block text-[13px] font-semibold text-zinc-500 dark:text-zinc-400">First name</label>
                        <input
                          type="text"
                          required
                          placeholder="Jane"
                          value={form.firstName}
                          onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className="mb-1.5 block text-[13px] font-semibold text-zinc-500 dark:text-zinc-400">Last name</label>
                        <input
                          type="text"
                          required
                          placeholder="Doe"
                          value={form.lastName}
                          onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
                          className={inputClass}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="mb-1.5 block text-[13px] font-semibold text-zinc-500 dark:text-zinc-400">Work email</label>
                      <input
                        type="email"
                        required
                        placeholder="jane@company.com"
                        value={form.email}
                        onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                        className={inputClass}
                      />
                    </div>
                    <div className="grid gap-5 sm:grid-cols-2">
                      <div>
                        <label className="mb-1.5 block text-[13px] font-semibold text-zinc-500 dark:text-zinc-400">Company size</label>
                        <select
                          value={form.companySize}
                          onChange={(e) => setForm((f) => ({ ...f, companySize: e.target.value }))}
                          className={selectClass}
                        >
                          <option>1–50 employees</option>
                          <option>51–200 employees</option>
                          <option>201–1000 employees</option>
                          <option>1000+ employees</option>
                        </select>
                      </div>
                      <div>
                        <label className="mb-1.5 block text-[13px] font-semibold text-zinc-500 dark:text-zinc-400">Monthly volume</label>
                        <select
                          value={form.monthlyVolume}
                          onChange={(e) => setForm((f) => ({ ...f, monthlyVolume: e.target.value }))}
                          className={selectClass}
                        >
                          <option>&lt; 1,000 pkgs</option>
                          <option>1k – 10k pkgs</option>
                          <option>10k – 50k pkgs</option>
                          <option>50k+ pkgs</option>
                        </select>
                      </div>
                    </div>
                    {error && (
                      <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-800/40 dark:bg-red-950/20 dark:text-red-400">
                        <span className="material-symbols-outlined text-base">error</span>
                        {error}
                      </div>
                    )}
                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full rounded-xl bg-[#3e0074] py-4 text-base font-bold text-white shadow-[0_4px_16px_rgba(63,0,117,0.3)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(63,0,117,0.4)] active:scale-[0.98] disabled:opacity-60 disabled:hover:translate-y-0 dark:bg-[#5b21b6]"
                    >
                      {submitting ? "Submitting…" : "Submit request"}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="px-6 py-12 md:px-10 md:py-16">
          <div className="mx-auto max-w-5xl rounded-3xl bg-[#3e0074] px-8 py-12 text-center text-white md:px-16 md:py-16 dark:bg-[#5b21b6]">
            <h2 className="text-3xl font-bold md:text-5xl">Ready to transform?</h2>
            <p className="mx-auto mt-4 max-w-md text-[15px] leading-relaxed text-white/70">
              Onboarding deploys your fleet within 24 hours.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/signup"
                className="rounded-full bg-white px-10 py-4 text-[12px] font-bold uppercase tracking-[0.18em] text-[#3e0074] dark:bg-[#0c0b14] dark:text-[#c084fc] dark:border dark:border-[#302555] shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl active:scale-[0.97]"
              >
                Get started
              </Link>
              <a
                href="tel:+447393080529"
                className="rounded-full border border-white/30 px-10 py-4 text-[12px] font-bold uppercase tracking-[0.18em] text-white transition-all duration-300 hover:-translate-y-0.5 hover:border-white/60 hover:bg-white/10 active:scale-[0.97]"
              >
                +44 7393 080529
              </a>
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
