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

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const subject = encodeURIComponent("EcoQuick Business Partnership Enquiry");
    const body = encodeURIComponent(
      `Name: ${form.firstName} ${form.lastName}\nEmail: ${form.email}\nCompany size: ${form.companySize}\nMonthly volume: ${form.monthlyVolume}`
    );
    window.location.href = `mailto:hello@ecoquick.delivery?subject=${subject}&body=${body}`;
    setSubmitted(true);
  }

  const inputClass =
    "w-full rounded-xl border border-zinc-200 bg-white px-4 py-3.5 text-sm text-zinc-900 placeholder:text-zinc-400 transition-all duration-200 focus:border-[#3e0074] focus:outline-none focus:ring-2 focus:ring-[#3e0074]/10 dark:border-zinc-700 dark:bg-[#161027] dark:text-[#ede9f8] dark:placeholder:text-zinc-600 dark:focus:border-[#c084fc] dark:focus:ring-[#c084fc]/10";

  const selectClass =
    "w-full rounded-xl border border-zinc-200 bg-white px-4 py-3.5 text-sm text-zinc-900 transition-all duration-200 focus:border-[#3e0074] focus:outline-none focus:ring-2 focus:ring-[#3e0074]/10 dark:border-zinc-700 dark:bg-[#161027] dark:text-[#ede9f8] dark:focus:border-[#c084fc] dark:focus:ring-[#c084fc]/10";

  return (
    <div className="min-h-screen bg-white text-zinc-900 dark:bg-[#0d0916] dark:text-[#ede9f8]">
      <div className="px-6 lg:px-8">
        <LandingHeader />
      </div>

      <main>
        {/* Hero */}
        <section className="px-6 pt-8 pb-12 md:px-10 md:pt-10 md:pb-16">
          <div className="mx-auto max-w-5xl">
            <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#3e0074]/50 dark:text-[#c084fc]/50">
              For Business
            </p>
            <h1 className="text-4xl font-bold leading-tight tracking-[-0.02em] text-zinc-900 dark:text-[#ede9f8] md:text-6xl lg:text-7xl">
              Scale with
              <br />
              <span className="text-[#3e0074] dark:text-[#c084fc]">eco-friendly delivery</span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-zinc-500 dark:text-zinc-400 md:text-lg">
              Comprehensive delivery infrastructure for enterprise. Reduce your
              carbon footprint without sacrificing speed or reliability.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/signup"
                className="rounded-full bg-[#3e0074] px-10 py-4 text-[12px] font-bold uppercase tracking-[0.18em] text-white shadow-[0_4px_16px_rgba(63,0,117,0.3)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(63,0,117,0.4)] active:scale-[0.97] dark:bg-[#5b21b6]"
              >
                Get started
              </Link>
              <a
                href="#solutions"
                className="rounded-full border border-zinc-200 bg-white px-10 py-4 text-[12px] font-bold uppercase tracking-[0.18em] text-zinc-700 transition-all duration-300 hover:-translate-y-0.5 hover:border-[#3e0074]/30 hover:text-[#3e0074] active:scale-[0.97] dark:border-zinc-700 dark:bg-[#161027] dark:text-zinc-300 dark:hover:border-[#c084fc]/40 dark:hover:text-[#c084fc]"
              >
                View solutions
              </a>
            </div>

            {/* Stats */}
            <div className="mt-12 grid gap-6 rounded-2xl border border-zinc-100 bg-zinc-50 p-8 sm:grid-cols-3 dark:border-zinc-800 dark:bg-[#161027]">
              {[
                { value: "99.8%", label: "On-time delivery" },
                { value: "45min", label: "Average delivery time" },
                { value: "24/7", label: "Availability" },
              ].map((stat) => (
                <div key={stat.label}>
                  <p className="text-3xl font-bold text-[#3e0074] dark:text-[#c084fc]">{stat.value}</p>
                  <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Why EcoQuick */}
        <section id="solutions" className="border-y border-zinc-100 bg-zinc-50 px-6 py-12 md:px-10 md:py-16 dark:border-zinc-800 dark:bg-[#0d0916]">
          <div className="mx-auto max-w-5xl">
            <h2 className="mb-4 text-3xl font-bold text-zinc-900 dark:text-[#ede9f8] md:text-5xl">
              Why EcoQuick
            </h2>
            <p className="mb-8 text-sm text-zinc-400 dark:text-zinc-500">
              Enterprise-grade infrastructure, carbon-neutral.
            </p>
            <div className="grid gap-8 sm:grid-cols-3">
              {[
                { k: "01", title: "Cost Optimization", body: "AI-driven routing cuts operational overhead by up to 40%." },
                { k: "02", title: "Seamless Integration", body: "Plug-and-play architecture. 99.9% uptime for mission-critical logistics." },
                { k: "03", title: "Enterprise Support", body: "24/7 access to specialized logistics experts for immediate resolution." },
              ].map((item) => (
                <div key={item.k} className="group rounded-2xl border border-zinc-100 bg-white p-8 transition-all duration-200 hover:border-[#3e0074]/20 hover:shadow-lg dark:border-zinc-800 dark:bg-[#161027] dark:hover:border-[#c084fc]/20">
                  <span className="text-4xl font-bold text-zinc-200 transition-colors group-hover:text-[#3e0074] dark:text-zinc-700 dark:group-hover:text-[#c084fc]">
                    {item.k}
                  </span>
                  <h3 className="mt-4 mb-2 text-base font-bold text-zinc-900 dark:text-[#ede9f8]">{item.title}</h3>
                  <p className="text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Solutions */}
        <section className="px-6 py-12 md:px-10 md:py-16">
          <div className="mx-auto max-w-5xl">
            <h2 className="mb-4 text-3xl font-bold text-zinc-900 dark:text-[#ede9f8] md:text-5xl">Solutions</h2>
            <p className="mb-8 text-sm text-zinc-400 dark:text-zinc-500">Tailored for scale and complexity.</p>
            <div className="grid grid-cols-1 overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800 sm:grid-cols-2">
              {[
                { title: "Bulk Delivery", body: "High-volume orders with consolidated pickup and drop-off points designed for scale.", variant: "white" },
                { title: "Account Management", body: "Dedicated account managers to optimize your logistics strategy quarterly.", variant: "purple" },
                { title: "API Automation", body: "Full webhook support and RESTful API to automate your entire logistics workflow.", variant: "purple" },
                { title: "White-Label", body: "Custom branding for tracking pages and notifications. Enterprise-grade.", variant: "white" },
              ].map((item) => (
                <div
                  key={item.title}
                  className={`p-10 md:p-12 ${
                    item.variant === "purple"
                      ? "bg-[#3e0074]/[0.06] dark:bg-[#c084fc]/[0.08]"
                      : "bg-white dark:bg-[#161027]"
                  }`}
                >
                  <h4 className="mb-3 text-lg font-bold text-zinc-900 dark:text-[#ede9f8]">{item.title}</h4>
                  <p className="text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="bg-zinc-50 px-6 py-12 md:px-10 md:py-16 dark:bg-[#0d0916]">
          <div className="mx-auto max-w-5xl">
            <h2 className="mb-4 text-3xl font-bold text-zinc-900 dark:text-[#ede9f8] md:text-5xl">Pricing</h2>
            <p className="mb-8 text-sm text-zinc-400 dark:text-zinc-500">Choose the plan that fits your scale.</p>
            <div className="grid gap-6 md:grid-cols-3">
              {[
                {
                  title: "Starter",
                  price: "£0",
                  period: "/ month",
                  features: ["Pay-as-you-go rates", "Standard 9–5 support", "Basic analytics"],
                  cta: "Start free",
                  featured: false,
                },
                {
                  title: "Professional",
                  price: "£499",
                  period: "/ month",
                  features: ["Priority 24/7 support", "Advanced analytics", "5 team seats"],
                  cta: "Upgrade now",
                  featured: true,
                  badge: "Popular",
                },
                {
                  title: "Enterprise",
                  price: "Custom",
                  period: "",
                  features: ["30%+ shipping discount", "Dedicated account manager", "Custom API & SLA"],
                  cta: "Contact sales",
                  featured: false,
                },
              ].map((plan) => (
                <div
                  key={plan.title}
                  className={`relative rounded-2xl border p-8 transition-all md:p-10 ${
                    plan.featured
                      ? "border-[#3e0074]/30 bg-white shadow-lg dark:border-[#c084fc]/30 dark:bg-[#161027]"
                      : "border-zinc-100 bg-white dark:border-zinc-800 dark:bg-[#161027]"
                  }`}
                >
                  {plan.badge && (
                    <span className="absolute -top-3 right-6 rounded-full bg-accent px-3 py-1 text-[10px] font-bold text-white">
                      {plan.badge}
                    </span>
                  )}
                  <h4 className="text-lg font-bold text-zinc-900 dark:text-[#ede9f8]">{plan.title}</h4>
                  <div className="mt-4 mb-6 flex items-baseline">
                    <span className="text-4xl font-bold text-[#3e0074] dark:text-[#c084fc]">{plan.price}</span>
                    <span className="ml-1 text-sm text-zinc-400">{plan.period}</span>
                  </div>
                  <ul className="mb-8 space-y-3">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-3 text-sm text-zinc-500 dark:text-zinc-400">
                        <span className="material-symbols-outlined text-sm text-emerald-500">check</span>
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={plan.cta === "Contact sales" ? "#contact" : "/signup"}
                    className={`block w-full rounded-xl py-3.5 text-center text-[12px] font-bold transition-all duration-300 hover:-translate-y-0.5 active:scale-[0.98] ${
                      plan.featured
                        ? "bg-[#3e0074] text-white shadow-[0_4px_16px_rgba(63,0,117,0.3)] hover:shadow-[0_8px_24px_rgba(63,0,117,0.4)] dark:bg-[#5b21b6]"
                        : "border border-zinc-200 text-zinc-700 hover:border-[#3e0074]/30 hover:text-[#3e0074] dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-[#c084fc]/40 dark:hover:text-[#c084fc]"
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
                <p className="mt-4 max-w-md text-base leading-relaxed text-zinc-500 dark:text-zinc-400">
                  Join enterprise partners scaling their logistics with EcoQuick.
                  Request a personalized demo.
                </p>
                <div className="mt-6 flex items-center gap-2 text-[11px] font-semibold text-zinc-400 dark:text-zinc-500">
                  <span className="material-symbols-outlined text-sm">verified_user</span>
                  GDPR compliant & secure
                </div>
              </div>

              <div className="rounded-2xl border border-zinc-200 bg-white p-8 dark:border-zinc-800 dark:bg-[#161027]">
                {submitted ? (
                  <div className="flex flex-col items-center gap-4 py-8 text-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-900/20">
                      <span className="material-symbols-outlined text-2xl text-emerald-600">check_circle</span>
                    </div>
                    <p className="text-lg font-bold text-zinc-900 dark:text-[#ede9f8]">Request sent</p>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">We&apos;ll be in touch within 1 business day.</p>
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
                        <label className="mb-1.5 block text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">First name</label>
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
                        <label className="mb-1.5 block text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">Last name</label>
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
                      <label className="mb-1.5 block text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">Work email</label>
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
                        <label className="mb-1.5 block text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">Company size</label>
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
                        <label className="mb-1.5 block text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">Monthly volume</label>
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
                    <button
                      type="submit"
                      className="w-full rounded-xl bg-[#3e0074] py-4 text-[13px] font-bold text-white shadow-[0_4px_16px_rgba(63,0,117,0.3)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(63,0,117,0.4)] active:scale-[0.98] dark:bg-[#5b21b6]"
                    >
                      Submit request
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
            <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-white/70">
              Onboarding deploys your fleet within 24 hours.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/signup"
                className="rounded-full bg-white px-10 py-4 text-[12px] font-bold uppercase tracking-[0.18em] text-[#3e0074] shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl active:scale-[0.97]"
              >
                Get started
              </Link>
              <a
                href="tel:+442012345678"
                className="rounded-full border border-white/30 px-10 py-4 text-[12px] font-bold uppercase tracking-[0.18em] text-white transition-all duration-300 hover:-translate-y-0.5 hover:border-white/60 hover:bg-white/10 active:scale-[0.97]"
              >
                +44 20 1234 5678
              </a>
            </div>
          </div>
        </section>
      </main>

      <div className="mx-auto w-full max-w-6xl px-6 lg:px-8">
        <LandingFooter />
      </div>
    </div>
  );
}
