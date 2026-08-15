import type { Metadata } from "next";
import Link from "next/link";
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

type Section = {
  title: string;
  paragraphs?: string[];
  bullets?: string[];
};

const LEGAL_BASIS_TABLE: { purpose: string; data: string; basis: string }[] = [
  { purpose: "Creating and managing your customer or rider account", data: "Name, email address, phone number", basis: "Performance of a contract" },
  { purpose: "Processing and fulfilling delivery bookings", data: "Pickup/drop-off addresses, parcel details, location data", basis: "Performance of a contract" },
  { purpose: "Processing payments and refunds", data: "Payment tokens and transaction data via Stripe", basis: "Performance of a contract" },
  { purpose: "Verifying rider identity, licence, and insurance", data: "Driving licence, vehicle details, insurance proof, ID documents", basis: "Legal obligation / Legitimate interests" },
  { purpose: "Preventing fraud and protecting platform security", data: "Account activity, device and technical data", basis: "Legitimate interests" },
  { purpose: "Handling customer support enquiries and disputes", data: "Booking records, communications", basis: "Legitimate interests / Performance of a contract" },
  { purpose: "Improving our services, routing, and reliability", data: "Usage and location data, where possible in aggregated form", basis: "Legitimate interests" },
  { purpose: "Meeting our tax, accounting, and legal obligations", data: "Financial and transaction records", basis: "Legal obligation" },
  { purpose: "Sending service updates (e.g. delivery status)", data: "Contact details", basis: "Performance of a contract" },
  { purpose: "Sending marketing communications, where you have opted in", data: "Contact details", basis: "Consent" },
];

const SECTIONS: Section[] = [
  {
    title: "1. Introduction",
    paragraphs: [
      "This Privacy Policy explains how EcoQuick (“EcoQuick”, “we”, “us”, or “our”) collects, uses, shares, and protects personal data when you use our website, mobile application, and related services (together, the “Platform”) to send or receive hyper-local same-day parcel deliveries in the United Kingdom.",
      "We handle personal data in accordance with the UK General Data Protection Regulation (UK GDPR) and the Data Protection Act 2018.",
      "This policy applies to:",
    ],
    bullets: [
      "Customers who browse the Platform, request quotes, or book deliveries — you can review services without an account, but must register to complete checkout",
      "Independent riders who register to perform deliveries via the Platform",
      "Visitors to our website",
    ],
  },
  {
    title: "2. Who We Are",
    paragraphs: [
      "EcoQuick is the data controller responsible for the personal data described in this policy.",
    ],
    bullets: [
      "Company name and registration number: EcoQuick Parcel Delivery Services Limited, Company No. 16192069",
      "Registered office address: 24 Park Road House, Park Road, Kingston Upon Thames, England, KT2 6DF",
      "Contact for privacy matters: support@ecoquickdelivery.co.uk or call +44 7417 366028",
    ],
  },
  {
    title: "3.1 Data We Collect — Customers",
    paragraphs: [
      "You can browse the Platform and review orders or pricing without creating an account. However, to complete checkout and place a booking, you must register for an account. When you register and make a booking, we may collect:",
    ],
    bullets: [
      "Full name, email address, and phone number",
      "Pickup and drop-off addresses",
      "Parcel description and, where applicable, declared value",
      "Payment details, processed by our payment provider, Stripe (we do not store full card numbers)",
      "Account login credentials",
      "Records of your communications with our customer support team",
    ],
  },
  {
    title: "3.2 Data We Collect — Independent Riders",
    paragraphs: [
      "To onboard as a rider, our current process (carried out manually while our rider portal is being built) collects the following:",
      "For motorbike riders:",
    ],
    bullets: [
      "Full name, address, phone number, and email address",
      "Driving licence details",
      "Vehicle details",
      "Proof of courier insurance",
      "Emergency contact information",
    ],
  },
  {
    title: "For bicycle riders",
    bullets: [
      "Identity verification documents",
      "Emergency contact details",
      "A signed rider agreement",
    ],
  },
  {
    title: "3.3 Technical and Location Data",
    paragraphs: ["When you use our website or app, we automatically collect:"],
    bullets: [
      "Device and browser information",
      "IP address",
      "Location data used to plan and track deliveries, via our mapping providers (Mapbox and Ordnance Survey)",
      "App usage and diagnostic data",
      "Cookies and similar technologies (see our separate Cookie Policy for details)",
    ],
  },
  {
    title: "5. Cookies",
    paragraphs: [
      "Our website and app use cookies and similar technologies to operate core functionality, remember your preferences, and understand how the Platform is used. Full details, including how to manage your preferences, are set out in our separate Cookie Policy.",
    ],
  },
  {
    title: "6. Who We Share Your Data With",
    paragraphs: ["We only share personal data where necessary, and currently share it with:"],
    bullets: [
      "Independent riders, limited strictly to the information needed to complete a specific delivery (such as names, addresses, contact numbers, and parcel details). Riders are independent contractors, not EcoQuick employees, and must use this information solely to complete that delivery.",
      "Service providers who process data on our behalf, including Stripe (payments), Supabase (database, authentication, and storage), Vercel (application hosting), Hostinger (domain management), and Mapbox and Ordnance Survey (mapping and routing)",
      "Professional advisers, including insurers, accountants, and legal advisors, where relevant to operating our business",
      "Regulators and law enforcement agencies, where we are required to do so by law",
      "A buyer or successor business, in the event of a merger, acquisition, or restructuring",
    ],
  },
  {
    title: "7. International Data Transfers",
    paragraphs: [
      "Some of our service providers are based or host data outside the UK. Where personal data is transferred outside the UK, we ensure an appropriate safeguard is in place to protect it.",
      "Our primary database and authentication provider, Supabase, hosts EcoQuick’s data in the West EU (Ireland) region. Ireland is an EU member state and is covered by the UK’s adequacy regulations, meaning the UK government has determined that the EU provides an equivalent level of data protection to the UK. No additional transfer mechanism is therefore required for data held by Supabase.",
      "Our hosting provider, Vercel, operates a globally distributed content delivery network. Application traffic may be routed through servers outside the UK as part of normal CDN operation; however, no personal data is stored persistently by Vercel beyond access logs, which are subject to appropriate safeguards under Vercel’s data processing terms.",
      "Our payment provider, Stripe, and mapping providers, Mapbox and Ordnance Survey, may also process data outside the UK. Each provider operates under appropriate contractual safeguards including standard contractual clauses or applicable adequacy decisions.",
    ],
  },
  {
    title: "8. Data Retention",
    paragraphs: [
      "We keep personal data only for as long as necessary for the purposes described in this policy, including to meet legal, accounting, or reporting requirements. Our retention periods are as follows:",
    ],
    bullets: [
      "Customer account data: retained for the duration of your account, plus 12 months after closure to allow resolution of any post-closure disputes or queries",
      "Booking and delivery records: retained for 3 years from the date of the delivery, covering the standard limitation period for contractual disputes",
      "Proof of delivery records: retained for 24 months from the date of delivery for dispute resolution and audit purposes",
      "Rider verification documents (driving licence, insurance, identity documents): retained for the duration of the rider’s active account, plus 12 months after departure",
      "Financial and payment records: retained for 6 years, as required by HMRC",
      "Customer support communications: retained for 2 years from the date of the communication",
      "Technical and diagnostic logs: retained for 12 months for security monitoring purposes",
      "Marketing consent records: retained for the duration of consent, plus 3 years after withdrawal, as required under PECR",
    ],
  },
  {
    title: "9. How We Protect Your Data",
    paragraphs: ["We take the security of your personal data seriously. Measures we currently use include:"],
    bullets: [
      "HTTPS and TLS encryption of data in transit",
      "AES-256 encryption of data at rest",
      "Role-based access controls and row-level security within our database",
      "Secure authentication managed through Supabase Auth",
    ],
  },
  {
    title: "10. Your Rights",
    paragraphs: ["Under UK GDPR, you have the right to:"],
    bullets: [
      "Access the personal data we hold about you",
      "Request correction of inaccurate data",
      "Request erasure of your data, in certain circumstances",
      "Restrict or object to certain types of processing",
      "Request portability of your data",
      "Withdraw consent, where processing is based on consent",
    ],
  },
  {
    title: "11. Children’s Privacy",
    paragraphs: [
      "Our Platform is intended for use by individuals aged 18 and over. We do not knowingly collect personal data from children.",
    ],
  },
  {
    title: "12. Changes to This Policy",
    paragraphs: [
      "We may update this Privacy Policy from time to time, for example to reflect changes to our services or to the law. Where changes are material, we will notify active users by email or in-app notice. The “last updated” date at the top of this policy shows when it was last revised.",
    ],
  },
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
              Privacy · UK GDPR
            </p>
            <h1 className="text-[clamp(1.75rem,6vw,4rem)] font-bold leading-[1.08] tracking-[-0.03em] text-zinc-900 dark:text-[#ede9f8]">
              Privacy <span className="text-[#3e0074] dark:text-[#c084fc]">Policy</span>
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-[15px] font-medium leading-[1.6] text-zinc-700 dark:text-zinc-300 md:text-lg">
              Your privacy matters to us. Learn how we collect, use, and protect your personal information.
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

            {/* 4. Legal basis table */}
            <div>
              <h2 className="mb-2 text-lg font-bold text-zinc-900 dark:text-[#ede9f8] md:text-xl">
                4. How We Use Your Data, and Our Legal Basis
              </h2>
              <p className="mb-4 font-secondary text-[15px] leading-[1.7] text-zinc-600 dark:text-zinc-400">
                We rely on different legal bases depending on the purpose of processing, as summarised below.
              </p>
              <div className="space-y-3">
                {LEGAL_BASIS_TABLE.map((row) => (
                  <div key={row.purpose} className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
                    <p className="text-[13px] font-bold text-zinc-900 dark:text-[#ede9f8]">{row.purpose}</p>
                    <p className="mt-1 font-secondary text-[13px] text-zinc-500 dark:text-zinc-400">Data used: {row.data}</p>
                    <p className="mt-0.5 font-secondary text-[13px] text-zinc-500 dark:text-zinc-400">Legal basis: {row.basis}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Your rights: contact + ICO */}
            <div>
              <p className="font-secondary text-[15px] leading-[1.7] text-zinc-600 dark:text-zinc-400">
                To exercise your rights, contact us at{" "}
                <a href="mailto:support@ecoquickdelivery.co.uk" className="font-semibold text-[#3e0074] hover:underline dark:text-[#c084fc]">
                  support@ecoquickdelivery.co.uk
                </a>
                . We will respond to your request within one month, as required by law.
              </p>
              <p className="mt-3 font-secondary text-[15px] leading-[1.7] text-zinc-600 dark:text-zinc-400">
                If you are unhappy with how we have handled your personal data, you also have the right to complain to the Information Commissioner&apos;s Office (ICO) at{" "}
                <a href="https://ico.org.uk" target="_blank" rel="noopener noreferrer" className="font-semibold text-[#3e0074] hover:underline dark:text-[#c084fc]">
                  ico.org.uk
                </a>
                .
              </p>
            </div>

            {/* Contact */}
            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-6 dark:border-zinc-800 dark:bg-[#0c0b14] md:p-8">
              <h2 className="mb-2 text-lg font-bold text-zinc-900 dark:text-[#ede9f8] md:text-xl">
                13. Contact Us
              </h2>
              <p className="font-secondary text-[15px] leading-[1.7] text-zinc-600 dark:text-zinc-400">
                EcoQuick Parcel Delivery Services Limited
                <br />
                24 Park Road House, Park Road, Kingston Upon Thames, England, KT2 6DF
                <br />
                <a
                  href="mailto:support@ecoquickdelivery.co.uk"
                  className="font-semibold text-[#3e0074] hover:underline dark:text-[#c084fc]"
                >
                  support@ecoquickdelivery.co.uk
                </a>
              </p>
              <p className="mt-3 font-secondary text-[13px] text-zinc-500 dark:text-zinc-500">
                See also our <Link href="/terms" className="font-semibold text-[#3e0074] hover:underline dark:text-[#c084fc]">Terms of Service</Link> and{" "}
                <Link href="/cookies" className="font-semibold text-[#3e0074] hover:underline dark:text-[#c084fc]">Cookie Policy</Link>.
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
