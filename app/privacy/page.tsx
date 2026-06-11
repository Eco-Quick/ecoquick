import type { Metadata } from "next";
import { LandingHeader } from "@/components/layout/LandingHeader";
import { LandingFooter } from "@/components/layout/LandingFooter";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How EcoQuick collects, uses, and protects your personal information, and your rights under UK data protection law.",
  openGraph: {
    title: "Privacy Policy — EcoQuick",
    description:
      "How EcoQuick collects, uses, and protects your personal information, and your rights under UK data protection law.",
    url: "/privacy",
  },
  alternates: { canonical: "/privacy" },
};

const RIGHTS = [
  "Access your personal data",
  "Correct inaccurate information",
  "Delete your account and data",
  "Export your data (portability)",
  "Object to processing",
];

const SECURITY = [
  "256-bit SSL encryption for all data transmission",
  "PCI DSS compliant payment processing via Stripe",
  "Regular security testing and monitoring",
  "Role-based access controls",
];

export default function PrivacyPage() {
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
              Privacy · GDPR Compliant
            </p>
            <h1 className="text-[clamp(1.75rem,6vw,4rem)] font-bold leading-[1.08] tracking-[-0.03em] text-zinc-900 dark:text-[#ede9f8]">
              Privacy <span className="text-[#3e0074] dark:text-[#c084fc]">Policy</span>
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-[15px] font-medium leading-[1.6] text-zinc-700 dark:text-zinc-300 md:text-lg">
              Your privacy matters to us. Learn how we collect, use, and protect your personal information.
            </p>
            <p className="mt-4 text-[13px] text-zinc-400 dark:text-zinc-500">
              Last updated: 1 July 2025
            </p>
          </div>
        </section>

        {/* Sections */}
        <section className="px-6 py-10 md:px-10 md:py-16">
          <div className="mx-auto max-w-3xl space-y-8">
            <div>
              <h2 className="mb-2 text-lg font-bold text-zinc-900 dark:text-[#ede9f8] md:text-xl">
                Information We Collect
              </h2>
              <p className="font-secondary text-[15px] leading-[1.7] text-zinc-600 dark:text-zinc-400">
                We collect the personal information you provide — your name, email address, phone number, and
                pickup and delivery addresses — along with payment information (processed securely via Stripe) and
                usage data such as delivery history and device information. We collect location data only during
                active deliveries to provide real-time tracking; location tracking stops once your delivery is complete.
              </p>
            </div>

            <div>
              <h2 className="mb-2 text-lg font-bold text-zinc-900 dark:text-[#ede9f8] md:text-xl">
                How We Use Your Information
              </h2>
              <p className="font-secondary text-[15px] leading-[1.7] text-zinc-600 dark:text-zinc-400">
                We use your information to process orders, coordinate pickups and manage deliveries, provide customer
                support, and improve our platform. We do not sell your personal information, and we do not share it with
                third parties except as needed to provide our service (for example, payment processing) or where required by law.
              </p>
            </div>

            <div>
              <h2 className="mb-2 text-lg font-bold text-zinc-900 dark:text-[#ede9f8] md:text-xl">
                Data Security
              </h2>
              <p className="mb-4 font-secondary text-[15px] leading-[1.7] text-zinc-600 dark:text-zinc-400">
                We use advanced encryption, secure servers, and regular security audits to protect your data. Payment
                information is processed securely through Stripe and never stored on our servers.
              </p>
              <ul className="space-y-2">
                {SECURITY.map((item) => (
                  <li key={item} className="flex items-start gap-2 font-secondary text-[15px] leading-[1.6] text-zinc-600 dark:text-zinc-400">
                    <span className="material-symbols-outlined mt-0.5 text-base text-[#3e0074] dark:text-[#c084fc]">lock</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="mb-2 text-lg font-bold text-zinc-900 dark:text-[#ede9f8] md:text-xl">
                Your Rights
              </h2>
              <p className="mb-4 font-secondary text-[15px] leading-[1.7] text-zinc-600 dark:text-zinc-400">
                Under UK data protection law you have the right to access, correct, delete, export, or object to the
                processing of your personal information. To exercise any of these rights, contact us and we will respond
                within the statutory timeframe.
              </p>
              <ul className="space-y-2">
                {RIGHTS.map((item) => (
                  <li key={item} className="flex items-start gap-2 font-secondary text-[15px] leading-[1.6] text-zinc-600 dark:text-zinc-400">
                    <span className="material-symbols-outlined mt-0.5 text-base text-[#3e0074] dark:text-[#c084fc]">check_circle</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-6 dark:border-zinc-800 dark:bg-[#0c0b14] md:p-8">
              <h2 className="mb-2 text-lg font-bold text-zinc-900 dark:text-[#ede9f8] md:text-xl">
                Contact Us
              </h2>
              <p className="font-secondary text-[15px] leading-[1.7] text-zinc-600 dark:text-zinc-400">
                For data requests or any questions about this policy, contact us at{" "}
                <a
                  href="mailto:support@ecoquickdelivery.co.uk"
                  className="font-semibold text-[#3e0074] hover:underline dark:text-[#c084fc]"
                >
                  support@ecoquickdelivery.co.uk
                </a>
                .
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
