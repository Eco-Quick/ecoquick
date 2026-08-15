import type { Metadata } from "next";
import Link from "next/link";
import { LandingHeader } from "@/components/layout/LandingHeader";
import { LandingFooter } from "@/components/layout/LandingFooter";

export const metadata: Metadata = {
  title: "Cookie Policy",
  description:
    "What cookies EcoQuick uses, why we use them, and how to manage your preferences.",
  openGraph: {
    title: "Cookie Policy — EcoQuick",
    description:
      "What cookies EcoQuick uses, why we use them, and how to manage your preferences.",
    url: "/cookies",
  },
  alternates: { canonical: "/cookies" },
};

type Section = {
  title: string;
  paragraphs?: string[];
  bullets?: string[];
};

const COOKIE_TABLE: { name: string; purpose: string; provider: string; expires: string; category: string }[] = [
  { name: "sb-auth-token", purpose: "Manages your authenticated session so you stay logged in securely", provider: "Supabase", expires: "Session", category: "Strictly necessary" },
  { name: "sb-refresh-token", purpose: "Refreshes your login session automatically", provider: "Supabase", expires: "30 days", category: "Strictly necessary" },
  { name: "__stripe_mid", purpose: "Fraud prevention during payment processing", provider: "Stripe", expires: "1 year", category: "Strictly necessary" },
  { name: "__stripe_sid", purpose: "Fraud prevention during active payment session", provider: "Stripe", expires: "30 minutes", category: "Strictly necessary" },
];

const SECTIONS: Section[] = [
  {
    title: "1. What Are Cookies?",
    paragraphs: [
      "Cookies are small text files placed on your device when you visit a website or use a web application. They allow the Platform to recognise your device, remember your preferences, keep your session secure, and understand how you use the service so we can improve it.",
      "We also use similar technologies such as local storage and session tokens where appropriate. References to “cookies” in this policy include these technologies unless we say otherwise.",
    ],
  },
  {
    title: "2. Who We Are",
    paragraphs: [
      "EcoQuick is the controller responsible for cookies placed by our own Platform.",
    ],
    bullets: [
      "Company name and registration number: EcoQuick Parcel Delivery Services Limited, Company No. 16192069",
      "Registered office: 24 Park Road House, Park Road, Kingston Upon Thames, England, KT2 6DF",
      "Contact for cookie enquiries: support@ecoquickdelivery.co.uk",
    ],
  },
];

const SECTIONS_2: Section[] = [
  {
    title: "3.1 Strictly Necessary Cookies",
    paragraphs: [
      "These cookies are essential for the Platform to function. They enable core features such as account login, session security, and payment processing. Without them, the Platform cannot work as intended.",
      "Strictly necessary cookies do not require your consent under UK law, but we include them here for full transparency.",
    ],
  },
  {
    title: "3.2 Functional Cookies",
    paragraphs: [
      "Functional cookies remember choices you make on the Platform to provide a more convenient experience. EcoQuick does not currently set any functional cookies of its own — preferences such as your display theme are stored locally in your browser rather than in a cookie. If this changes, we will update this policy.",
    ],
  },
  {
    title: "3.3 Analytics Cookies",
    paragraphs: [
      "These cookies would help us understand how visitors interact with the Platform, such as which pages are visited most often and whether any errors occur. EcoQuick does not currently use analytics cookies. If we introduce them in a future phase, we will update this policy and, where required, seek your consent before setting them.",
    ],
  },
  {
    title: "3.4 Marketing Cookies",
    paragraphs: [
      "EcoQuick does not currently use marketing or advertising cookies. If we introduce these in a future phase, we will update this policy and seek your consent before setting them.",
    ],
  },
];

const SECTIONS_3: Section[] = [
  {
    title: "5. Third-Party Cookies",
    paragraphs: ["Some cookies on the Platform are set by third-party services that we use to operate EcoQuick. These include:"],
    bullets: [
      "Stripe — payment processing and fraud prevention. Stripe’s cookie policy is available at stripe.com/privacy.",
      "Supabase — authentication and session management. Supabase’s privacy information is available at supabase.com/privacy.",
      "Mapbox / Ordnance Survey — used to power mapping and routing features within the Platform. These providers may set cookies or use similar technologies when their services are loaded.",
    ],
  },
];

export default function CookiesPage() {
  return (
    <div className="landing-shell min-h-screen bg-white text-zinc-900 dark:bg-[#050507] dark:text-[#ede9f8]">
      <div className="landing-grid-layer" />

      <div className="landing-content px-6 lg:px-8">
        <LandingHeader />
      </div>

      <main className="landing-content">
        {/* Hero */}
        <section className="border-b border-zinc-100 px-6 pb-8 pt-8 dark:border-zinc-800 md:px-10 md:pb-16 md:pt-16">
          <div className="mx-auto max-w-3xl text-center">
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.25em] text-[#3e0074]/50 dark:text-zinc-400 md:mb-5">
              Privacy · Cookies
            </p>
            <h1 className="text-[clamp(1.75rem,6vw,4rem)] font-bold leading-[1.08] tracking-[-0.03em] text-zinc-900 dark:text-[#ede9f8]">
              Cookie <span className="text-[#3e0074] dark:text-[#c084fc]">Policy</span>
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-[15px] font-medium leading-[1.6] text-zinc-700 dark:text-zinc-300 md:text-lg">
              What cookies we use, why we use them, and how you can manage your preferences.
            </p>
            <p className="mt-4 text-[13px] text-zinc-400 dark:text-zinc-500">
              Last updated: 12 July 2026
            </p>
          </div>
        </section>

        {/* Sections */}
        <section className="px-6 py-10 md:px-10 md:py-16">
          <div className="mx-auto max-w-3xl space-y-8">
            {SECTIONS.map((section) => (
              <div key={section.title}>
                <h2 className="mb-2 text-lg font-bold text-zinc-900 dark:text-[#ede9f8] md:text-xl">
                  {section.title}
                </h2>
                {section.paragraphs?.map((p, i) => (
                  <p key={i} className="mb-3 font-secondary text-[15px] leading-[1.7] text-zinc-600 dark:text-zinc-400 last:mb-0">
                    {p}
                  </p>
                ))}
                {section.bullets && (
                  <ul className="mt-3 space-y-2">
                    {section.bullets.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 font-secondary text-[15px] leading-[1.6] text-zinc-600 dark:text-zinc-400">
                        <span className="material-symbols-outlined mt-0.5 text-base text-[#3e0074] dark:text-[#c084fc]">check_circle</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
            <p className="font-secondary text-[15px] leading-[1.7] text-zinc-600 dark:text-zinc-400">
              Some cookies on the Platform are set by third-party providers (such as Stripe and Supabase) and are subject to those providers&apos; own privacy and cookie policies.
            </p>

            {/* 3. Categories */}
            <div>
              <h2 className="mb-2 text-lg font-bold text-zinc-900 dark:text-[#ede9f8] md:text-xl">
                3. Categories of Cookies We Use
              </h2>
            </div>
            {SECTIONS_2.map((section) => (
              <div key={section.title}>
                <h2 className="mb-2 text-lg font-bold text-zinc-900 dark:text-[#ede9f8] md:text-xl">
                  {section.title}
                </h2>
                {section.paragraphs?.map((p, i) => (
                  <p key={i} className="mb-3 font-secondary text-[15px] leading-[1.7] text-zinc-600 dark:text-zinc-400 last:mb-0">
                    {p}
                  </p>
                ))}
              </div>
            ))}

            {/* 4. Cookie table */}
            <div>
              <h2 className="mb-2 text-lg font-bold text-zinc-900 dark:text-[#ede9f8] md:text-xl">
                4. Cookies We Use
              </h2>
              <p className="mb-4 font-secondary text-[15px] leading-[1.7] text-zinc-600 dark:text-zinc-400">
                The table below lists the cookies currently set on the EcoQuick Platform:
              </p>
              <div className="space-y-3">
                {COOKIE_TABLE.map((row) => (
                  <div key={row.name} className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
                    <p className="font-mono text-[13px] font-bold text-zinc-900 dark:text-[#ede9f8]">{row.name}</p>
                    <p className="mt-1 font-secondary text-[13px] text-zinc-500 dark:text-zinc-400">Purpose: {row.purpose}</p>
                    <p className="mt-0.5 font-secondary text-[13px] text-zinc-500 dark:text-zinc-400">Provider: {row.provider} · Expires: {row.expires} · Category: {row.category}</p>
                  </div>
                ))}
              </div>
            </div>

            {SECTIONS_3.map((section) => (
              <div key={section.title}>
                <h2 className="mb-2 text-lg font-bold text-zinc-900 dark:text-[#ede9f8] md:text-xl">
                  {section.title}
                </h2>
                {section.paragraphs?.map((p, i) => (
                  <p key={i} className="mb-3 font-secondary text-[15px] leading-[1.7] text-zinc-600 dark:text-zinc-400 last:mb-0">
                    {p}
                  </p>
                ))}
                {section.bullets && (
                  <ul className="mt-3 space-y-2">
                    {section.bullets.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 font-secondary text-[15px] leading-[1.6] text-zinc-600 dark:text-zinc-400">
                        <span className="material-symbols-outlined mt-0.5 text-base text-[#3e0074] dark:text-[#c084fc]">check_circle</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                )}
                <p className="mt-3 font-secondary text-[15px] leading-[1.7] text-zinc-600 dark:text-zinc-400">
                  We do not control third-party cookies, and you should review each provider&apos;s own cookie or privacy policy for details of how they handle your data.
                </p>
              </div>
            ))}

            {/* 6. Your Cookie Choices */}
            <div>
              <h2 className="mb-2 text-lg font-bold text-zinc-900 dark:text-[#ede9f8] md:text-xl">
                6.1 Consent
              </h2>
              <p className="font-secondary text-[15px] leading-[1.7] text-zinc-600 dark:text-zinc-400">
                Every cookie EcoQuick currently sets is strictly necessary to operate the Platform — signing in, keeping your session secure, and processing payments — so under UK law we do not need to ask for your consent to use them. We do not currently use functional, analytics, or marketing cookies. If we introduce any non-essential cookies in future, we will add a consent banner or cookie preference centre and ask for your consent before setting them.
              </p>
            </div>

            <div>
              <h2 className="mb-2 text-lg font-bold text-zinc-900 dark:text-[#ede9f8] md:text-xl">
                6.2 Managing Cookies Through Your Browser
              </h2>
              <p className="mb-3 font-secondary text-[15px] leading-[1.7] text-zinc-600 dark:text-zinc-400">
                You can control and delete cookies through your browser settings. Most browsers allow you to:
              </p>
              <ul className="space-y-2">
                {[
                  "See what cookies have been set and delete them individually or in bulk",
                  "Block cookies from specific websites",
                  "Block all cookies from being set",
                  "Be notified when a cookie is being set",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 font-secondary text-[15px] leading-[1.6] text-zinc-600 dark:text-zinc-400">
                    <span className="material-symbols-outlined mt-0.5 text-base text-[#3e0074] dark:text-[#c084fc]">check_circle</span>
                    {item}
                  </li>
                ))}
              </ul>
              <p className="mt-3 font-secondary text-[15px] leading-[1.7] text-zinc-600 dark:text-zinc-400">
                Please note that blocking strictly necessary cookies will affect your ability to use the Platform, including logging in and completing bookings. Browser-level controls do not distinguish between cookie categories.
              </p>
              <p className="mt-3 font-secondary text-[15px] leading-[1.7] text-zinc-600 dark:text-zinc-400">
                Guidance on managing cookies in common browsers can be found at:
              </p>
              <ul className="mt-3 space-y-2">
                {[
                  ["Google Chrome", "support.google.com/chrome/answer/95647"],
                  ["Mozilla Firefox", "support.mozilla.org/kb/cookies-information-websites-store-on-your-computer"],
                  ["Safari", "support.apple.com/guide/safari/manage-cookies-sfri11471"],
                  ["Microsoft Edge", "support.microsoft.com/microsoft-edge/delete-cookies-in-microsoft-edge"],
                ].map(([label, url]) => (
                  <li key={label} className="font-secondary text-[15px] leading-[1.6] text-zinc-600 dark:text-zinc-400">
                    <span className="font-bold text-zinc-800 dark:text-zinc-200">{label}:</span>{" "}
                    <a href={`https://${url}`} target="_blank" rel="noopener noreferrer" className="font-semibold text-[#3e0074] hover:underline dark:text-[#c084fc]">
                      {url}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="mb-2 text-lg font-bold text-zinc-900 dark:text-[#ede9f8] md:text-xl">
                7. Retention
              </h2>
              <p className="font-secondary text-[15px] leading-[1.7] text-zinc-600 dark:text-zinc-400">
                Session cookies are deleted automatically when you close your browser. Persistent cookies remain on your device for the period shown in the cookie table above, unless you delete them earlier through your browser settings.
              </p>
            </div>

            <div>
              <h2 className="mb-2 text-lg font-bold text-zinc-900 dark:text-[#ede9f8] md:text-xl">
                8. Changes to This Cookie Policy
              </h2>
              <p className="font-secondary text-[15px] leading-[1.7] text-zinc-600 dark:text-zinc-400">
                We may update this Cookie Policy from time to time, for example when we add new features, change providers, or when the law requires it. The “last updated” date at the top of this policy will always reflect the most recent version. Where changes are material, we will notify you through the Platform or by email.
              </p>
            </div>

            {/* Contact */}
            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-6 dark:border-zinc-800 dark:bg-[#0c0b14] md:p-8">
              <h2 className="mb-2 text-lg font-bold text-zinc-900 dark:text-[#ede9f8] md:text-xl">
                9. Contact Us
              </h2>
              <p className="font-secondary text-[15px] leading-[1.7] text-zinc-600 dark:text-zinc-400">
                EcoQuick
                <br />
                Address: 24 Park Road House, Park Road, Kingston Upon Thames, England, KT2 6DF
                <br />
                Email:{" "}
                <a
                  href="mailto:support@ecoquickdelivery.co.uk"
                  className="font-semibold text-[#3e0074] hover:underline dark:text-[#c084fc]"
                >
                  support@ecoquickdelivery.co.uk
                </a>
              </p>
              <p className="mt-3 font-secondary text-[13px] text-zinc-500 dark:text-zinc-500">
                See also our <Link href="/privacy" className="font-semibold text-[#3e0074] hover:underline dark:text-[#c084fc]">Privacy Policy</Link> and{" "}
                <Link href="/terms" className="font-semibold text-[#3e0074] hover:underline dark:text-[#c084fc]">Terms of Service</Link>.
              </p>
            </div>
          </div>
        </section>

        <div className="landing-content px-6 lg:px-8">
          <LandingFooter />
        </div>
      </main>
    </div>
  );
}
