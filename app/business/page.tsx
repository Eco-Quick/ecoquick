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
  return (
    <div className="landing-shell min-h-screen bg-white text-[#3e0074] antialiased dark:bg-[#0d0916] dark:text-[#c084fc]">
      <div className="landing-grid-layer" />

      <div className="landing-content px-6 lg:px-8">
        <LandingHeader />
      </div>

      <main className="pt-16 md:pt-24">
        {/* Hero */}
        <section className="pb-10 px-6 md:px-10 md:pb-18">
          <div className="mx-auto max-w-6xl">
            <div className="grid gap-6 md:grid-cols-12">
              <div className="col-span-12 lg:col-span-10">
                <h1 className="satoshi-thin mb-8 text-[12vw] leading-[0.9] uppercase md:mb-12 md:text-[8vw]">
                  Scale With
                  <br />
                  <span className="sm:whitespace-normal whitespace-nowrap">
                    Eco-Friendly
                  </span>
                  <br />
                  Delivery
                </h1>
              </div>
              <div className="col-span-12 lg:col-span-5 lg:col-start-8">
                <p className="max-w-xl text-lg font-light leading-relaxed text-[#3e0074]/80 dark:text-[#c084fc]/80 md:text-xl">
                  Comprehensive delivery infrastructure for enterprise. Reduce
                  your carbon footprint without sacrificing speed or reliability.
                </p>
                <div className="mt-8 flex flex-wrap gap-4">
                  <Link
                    href="/signup"
                    className="sharp-corners border border-[#3e0074] bg-[#3e0074] px-8 py-4 text-[10px] font-bold uppercase tracking-[0.25em] text-white transition-all hover:bg-black dark:border-[#c084fc] dark:bg-[#c084fc] dark:text-[#0d0916] dark:hover:bg-white"
                  >
                    Get started
                  </Link>
                  <a
                    href="#solutions"
                    className="sharp-corners border border-[#3e0074] px-8 py-4 text-[10px] font-bold uppercase tracking-[0.25em] text-[#3e0074] transition-all hover:bg-[#3e0074] hover:text-white dark:border-[#c084fc] dark:text-[#c084fc] dark:hover:bg-[#c084fc] dark:hover:text-[#0d0916]"
                  >
                    View solutions
                  </a>
                </div>
              </div>
            </div>

            {/* Highlights row to avoid empty whitespace */}
            <div className="mt-10 rounded-lg border border-[#3e0074]/10 bg-[rgba(62,0,116,0.04)] p-6 md:mt-12 md:p-8 dark:border-[#4c1d95]/20 dark:bg-[rgba(192,132,252,0.05)]">
              <div className="grid gap-8 md:grid-cols-3">
                <div className="space-y-2">
                  <p className="satoshi-thin text-4xl text-[#3e0074] dark:text-[#c084fc]">99.8%</p>
                  <p className="text-[11px] font-medium leading-relaxed text-[#3e0074]/70 dark:text-[#c084fc]/70">
                    On-time delivery
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="satoshi-thin text-4xl text-[#3e0074] dark:text-[#c084fc]">LEAD</p>
                  <p className="text-[11px] font-medium leading-relaxed text-[#3e0074]/70 dark:text-[#c084fc]/70">
                    Industry speed
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="satoshi-thin text-4xl text-[#3e0074] dark:text-[#c084fc]">24/7</p>
                  <p className="text-[11px] font-medium leading-relaxed text-[#3e0074]/70 dark:text-[#c084fc]/70">
                    Availability
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section
          id="solutions"
          className="border-y border-[#3e0074]/5 bg-[rgba(62,0,116,0.05)] py-16 px-6 md:px-10 md:py-24 dark:border-[#4c1d95]/20 dark:bg-[rgba(192,132,252,0.05)]"
        >
          <div className="mx-auto max-w-6xl">
            <div className="mb-12 flex flex-col items-start justify-between border-b border-[#3e0074]/10 pb-8 md:mb-16 md:flex-row md:items-end dark:border-[#4c1d95]/20">
              <h2 className="satoshi-thin mb-4 text-5xl uppercase md:mb-0 md:text-7xl">
                Why EcoQuick
              </h2>
              <p className="max-w-[200px] text-[10px] font-bold uppercase tracking-[0.2em] opacity-40 md:text-right">
                Enterprise-grade infrastructure, carbon-neutral.
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-12">
              {[
                {
                  k: "01",
                  title: "Cost Optimization",
                  body: "AI-driven routing cuts operational overhead by up to 40%.",
                },
                {
                  k: "02",
                  title: "Seamless Integration",
                  body: "Plug-and-play architecture. 99.9% uptime for mission-critical logistics.",
                },
                {
                  k: "03",
                  title: "Enterprise Support",
                  body: "24/7 access to specialized logistics experts for immediate resolution.",
                },
              ].map((item) => (
                <div
                  key={item.k}
                  className="group col-span-12 border-l border-[#3e0074]/10 py-8 pl-6 sm:col-span-6 lg:col-span-4 dark:border-[#4c1d95]/20"
                >
                  <span className="satoshi-thin text-3xl opacity-20 transition-opacity group-hover:opacity-100">
                    {item.k}
                  </span>
                  <h3 className="satoshi-bold mt-6 mb-3 text-base uppercase">
                    {item.title}
                  </h3>
                  <p className="text-[10px] font-medium uppercase leading-relaxed tracking-[0.2em] opacity-60">
                    {item.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Solutions */}
        <section id="api" className="py-16 px-6 md:px-10 md:py-24">
          <div className="mx-auto max-w-6xl">
            <div className="mb-12 flex flex-col items-start justify-between border-b border-[#3e0074]/10 pb-8 md:mb-16 md:flex-row md:items-end dark:border-[#4c1d95]/20">
              <h2 className="satoshi-thin mb-4 text-5xl uppercase md:mb-0 md:text-7xl">
                Solutions
              </h2>
              <p className="max-w-[200px] text-[10px] font-bold uppercase tracking-[0.2em] opacity-40 md:text-right">
                Tailored for scale and complexity.
              </p>
            </div>
            <div className="grid border border-[#3e0074]/10 bg-[#3e0074]/10 md:grid-cols-2 gap-px dark:border-[#4c1d95]/20 dark:bg-[#4c1d95]/10">
              {[
                {
                  title: "Bulk Delivery",
                  body: "High-volume orders with consolidated pickup and drop-off points designed for scale.",
                  variant: "white",
                },
                {
                  title: "Account Management",
                  body: "Dedicated account managers to optimize your logistics strategy quarterly.",
                  variant: "subtle",
                },
                {
                  title: "API Automation",
                  body: "Full webhook support and RESTful API to automate your entire logistics workflow.",
                  variant: "subtle",
                },
                {
                  title: "White-Label",
                  body: "Custom branding for tracking pages and notifications. Enterprise-grade.",
                  variant: "white",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className={`space-y-4 p-10 md:p-12 ${
                    item.variant === "subtle"
                      ? "bg-[rgba(62,0,116,0.05)] dark:bg-[rgba(192,132,252,0.05)]"
                      : "bg-white dark:bg-[#161027]"
                  }`}
                >
                  <h4 className="satoshi-bold text-xl uppercase">
                    {item.title}
                  </h4>
                  <p className="text-[11px] font-medium uppercase leading-relaxed tracking-[0.2em] opacity-60">
                    {item.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="bg-[#fafafa] py-16 px-6 md:px-10 md:py-24 dark:bg-[#0d0916]">
          <div className="mx-auto max-w-6xl">
            <div className="mb-12 flex flex-col items-start justify-between border-b border-[#3e0074]/10 pb-8 md:mb-16 md:flex-row md:items-end dark:border-[#4c1d95]/20">
              <h2 className="satoshi-thin mb-4 text-5xl uppercase md:mb-0 md:text-7xl">
                Pricing
              </h2>
              <p className="max-w-[200px] text-[10px] font-bold uppercase tracking-[0.2em] opacity-40 md:text-right">
                Choose the plan that fits your scale.
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {[
                {
                  title: "Starter",
                  price: "£0",
                  period: "/ month",
                  features: ["Pay-as-you-go rates", "Standard 9–5 support", "Basic analytics"],
                  cta: "Start free",
                  variant: "outline",
                },
                {
                  title: "Professional",
                  price: "£499",
                  period: "/ month",
                  features: ["Priority 24/7 support", "Advanced analytics", "5 team seats"],
                  cta: "Upgrade now",
                  variant: "primary",
                  badge: "Popular",
                },
                {
                  title: "Enterprise",
                  price: "Custom",
                  period: "",
                  features: ["30%+ shipping discount", "Dedicated account manager", "Custom API & SLA"],
                  cta: "Contact sales",
                  variant: "outline",
                },
              ].map((plan) => (
                <div
                  key={plan.title}
                  className={`border p-10 md:p-12 ${
                    plan.variant === "primary"
                      ? "border-[#3e0074]/20 bg-white dark:border-[#4c1d95]/30 dark:bg-[#161027]"
                      : "border-[#3e0074]/10 bg-white dark:border-[#4c1d95]/20 dark:bg-[#161027]"
                  }`}
                >
                  <div className="mb-6 flex items-start justify-between">
                    <h4 className="satoshi-bold text-xl uppercase">
                      {plan.title}
                    </h4>
                    {plan.badge && (
                      <span className="border border-[#ff9b16]/20 bg-[#ff9b16]/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#ff9b16]">
                        {plan.badge}
                      </span>
                    )}
                  </div>
                  <div className="mb-8 flex items-baseline">
                    <span className="satoshi-thin text-4xl text-[#3e0074] dark:text-[#c084fc]">
                      {plan.price}
                    </span>
                    <span className="ml-2 text-[10px] font-bold uppercase tracking-[0.2em] opacity-60">
                      {plan.period}
                    </span>
                  </div>
                  <ul className="mb-10 space-y-3">
                    {plan.features.map((f) => (
                      <li
                        key={f}
                        className="flex items-center gap-3 text-[11px] font-medium uppercase tracking-[0.2em] opacity-60"
                      >
                        <span className="h-px w-3 bg-[#3e0074] opacity-40 dark:bg-[#c084fc]" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={plan.cta === "Contact sales" ? "#contact" : "/signup"}
                    className={`sharp-corners block w-full border px-8 py-4 text-center text-[10px] font-bold uppercase tracking-[0.25em] transition-all ${
                      plan.variant === "primary"
                        ? "border-[#3e0074] bg-[#3e0074] text-white hover:bg-black dark:border-[#c084fc] dark:bg-[#c084fc] dark:text-[#0d0916] dark:hover:bg-white"
                        : "border-[#3e0074] text-[#3e0074] hover:bg-[#3e0074] hover:text-white dark:border-[#c084fc] dark:text-[#c084fc] dark:hover:bg-[#c084fc] dark:hover:text-[#0d0916]"
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
        <section id="contact" className="py-16 px-6 md:px-10 md:py-24">
          <div className="mx-auto max-w-6xl">
            <div className="grid gap-12 lg:grid-cols-12">
              <div className="lg:col-span-5">
                <h2 className="satoshi-thin mb-6 text-5xl uppercase md:text-7xl">
                  Partnership
                </h2>
                <div className="h-px w-16 bg-[#3e0074]/20 dark:bg-[#c084fc]/20" />
                <p className="mt-8 max-w-md text-base font-light leading-relaxed text-[#3e0074]/70 dark:text-[#c084fc]/70">
                  Join enterprise partners scaling their logistics with EcoQuick.
                  Request a personalized demo.
                </p>
                <p className="mt-6 flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.2em] opacity-60">
                  <span className="h-px w-4 bg-[#3e0074] dark:bg-[#c084fc]" />
                  GDPR compliant &amp; secure
                </p>
              </div>
              <div className="lg:col-span-7">
                {submitted ? (
                  <div className="flex flex-col gap-4 py-12">
                    <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#3e0074]/60 dark:text-[#c084fc]/60">
                      Request sent
                    </p>
                    <p className="text-2xl font-light text-[#3e0074] dark:text-[#ede9f8]">
                      Thank you! We&apos;ll be in touch within 1 business day.
                    </p>
                    <button
                      onClick={() => setSubmitted(false)}
                      className="mt-4 self-start text-[10px] font-bold uppercase tracking-[0.2em] opacity-50 hover:opacity-100"
                    >
                      Submit another
                    </button>
                  </div>
                ) : (
                  <form className="space-y-8" onSubmit={handleSubmit}>
                    <div className="grid gap-8 sm:grid-cols-2">
                      <div className="group flex flex-col gap-2">
                        <label className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-60 transition-opacity group-focus-within:opacity-100">
                          First name
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Jane"
                          value={form.firstName}
                          onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
                          className="border-b border-[#3e0074]/20 bg-transparent px-0 py-3 text-[#3e0074] placeholder:opacity-40 focus:border-[#3e0074] focus:outline-none dark:border-[#4c1d95]/30 dark:text-[#ede9f8] dark:placeholder:text-[#c084fc]/40 dark:focus:border-[#c084fc]"
                        />
                      </div>
                      <div className="group flex flex-col gap-2">
                        <label className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-60 transition-opacity group-focus-within:opacity-100">
                          Last name
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Doe"
                          value={form.lastName}
                          onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
                          className="border-b border-[#3e0074]/20 bg-transparent px-0 py-3 text-[#3e0074] placeholder:opacity-40 focus:border-[#3e0074] focus:outline-none dark:border-[#4c1d95]/30 dark:text-[#ede9f8] dark:placeholder:text-[#c084fc]/40 dark:focus:border-[#c084fc]"
                        />
                      </div>
                    </div>
                    <div className="group flex flex-col gap-2">
                      <label className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-60 transition-opacity group-focus-within:opacity-100">
                        Work email
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="jane@company.com"
                        value={form.email}
                        onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                        className="border-b border-[#3e0074]/20 bg-transparent px-0 py-3 text-[#3e0074] placeholder:opacity-40 focus:border-[#3e0074] focus:outline-none dark:border-[#4c1d95]/30 dark:text-[#ede9f8] dark:placeholder:text-[#c084fc]/40 dark:focus:border-[#c084fc]"
                      />
                    </div>
                    <div className="grid gap-8 sm:grid-cols-2">
                      <div className="group flex flex-col gap-2">
                        <label className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-60">
                          Company size
                        </label>
                        <select
                          value={form.companySize}
                          onChange={(e) => setForm((f) => ({ ...f, companySize: e.target.value }))}
                          className="border-b border-[#3e0074]/20 bg-transparent px-0 py-3 text-[#3e0074] focus:border-[#3e0074] focus:outline-none dark:border-[#4c1d95]/30 dark:text-[#ede9f8] dark:focus:border-[#c084fc]"
                        >
                          <option className="dark:bg-[#161027] dark:text-[#ede9f8]">1–50 employees</option>
                          <option className="dark:bg-[#161027] dark:text-[#ede9f8]">51–200 employees</option>
                          <option className="dark:bg-[#161027] dark:text-[#ede9f8]">201–1000 employees</option>
                          <option className="dark:bg-[#161027] dark:text-[#ede9f8]">1000+ employees</option>
                        </select>
                      </div>
                      <div className="group flex flex-col gap-2">
                        <label className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-60">
                          Monthly volume
                        </label>
                        <select
                          value={form.monthlyVolume}
                          onChange={(e) => setForm((f) => ({ ...f, monthlyVolume: e.target.value }))}
                          className="border-b border-[#3e0074]/20 bg-transparent px-0 py-3 text-[#3e0074] focus:border-[#3e0074] focus:outline-none dark:border-[#4c1d95]/30 dark:text-[#ede9f8] dark:focus:border-[#c084fc]"
                        >
                          <option className="dark:bg-[#161027] dark:text-[#ede9f8]">&lt; 1,000 pkgs</option>
                          <option className="dark:bg-[#161027] dark:text-[#ede9f8]">1k – 10k pkgs</option>
                          <option className="dark:bg-[#161027] dark:text-[#ede9f8]">10k – 50k pkgs</option>
                          <option className="dark:bg-[#161027] dark:text-[#ede9f8]">50k+ pkgs</option>
                        </select>
                      </div>
                    </div>
                    <button
                      type="submit"
                      className="sharp-corners border border-[#3e0074] bg-[#3e0074] px-8 py-4 text-[10px] font-bold uppercase tracking-[0.25em] text-white transition-all hover:bg-black dark:border-[#c084fc] dark:bg-[#c084fc] dark:text-[#0d0916] dark:hover:bg-white"
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
        <section className="px-6 py-16 md:px-10 md:py-24">
          <div className="mx-auto min-h-[40vh] max-w-6xl border border-[#3e0074]/5 bg-[rgba(62,0,116,0.05)] p-12 md:p-24 lg:p-32 dark:border-[#4c1d95]/20 dark:bg-[rgba(192,132,252,0.05)]">
            <div className="grid items-center gap-10 md:grid-cols-12">
              <div className="col-span-12 lg:col-span-7">
                <h2 className="satoshi-thin mb-6 text-5xl uppercase leading-[0.9] md:text-7xl lg:text-8xl">
                  Ready to
                  <br />
                  Transform?
                </h2>
                <p className="text-xs font-light uppercase tracking-[0.2em] opacity-60 md:text-sm">
                  Onboarding deploys your fleet within 24 hours.
                </p>
              </div>
              <div className="col-span-12 flex flex-col gap-4 sm:flex-row lg:col-span-5 lg:flex-col">
                <Link
                  href="/signup"
                  className="sharp-corners flex-1 border border-[#3e0074] bg-[#3e0074] px-8 py-5 text-[10px] font-bold uppercase tracking-[0.25em] text-white transition-all hover:bg-black dark:border-[#c084fc] dark:bg-[#c084fc] dark:text-[#0d0916] dark:hover:bg-white"
                >
                  Get started
                </Link>
                <a
                  href="tel:+442012345678"
                  className="sharp-corners flex-1 border border-[#3e0074] px-8 py-5 text-[10px] font-bold uppercase tracking-[0.25em] text-[#3e0074] transition-all hover:bg-[#3e0074] hover:text-white dark:border-[#c084fc] dark:text-[#c084fc] dark:hover:bg-[#c084fc] dark:hover:text-[#0d0916]"
                >
                  +44 20 1234 5678
                </a>
              </div>
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

