import type { Metadata } from "next";
import { LandingHeader } from "@/components/layout/LandingHeader";
import { LandingFooter } from "@/components/layout/LandingFooter";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "The terms and conditions governing your use of EcoQuick's hyperlocal, eco-friendly parcel delivery service.",
  openGraph: {
    title: "Terms of Service — EcoQuick",
    description:
      "The terms and conditions governing your use of EcoQuick's hyperlocal, eco-friendly parcel delivery service.",
    url: "/terms",
  },
  alternates: { canonical: "/terms" },
};

const SECTIONS = [
  {
    title: "1. Service Description",
    body: "EcoQuick is an instant hyperlocal, eco-friendly parcel delivery service. Our services include instant/live/real-time delivery and scheduled parcel deliveries using electric motorbikes, live tracking, safe and secure handling, and optional eco-friendly packaging. We cater to individuals, retailers, and e-commerce platforms who require fast, reliable, and sustainable deliveries.",
  },
  {
    title: "2. Coverage Area",
    body: "Our delivery services are currently available in selected hyperlocal zones. Users can check delivery availability through the EcoQuick platform. Deliveries outside the defined service areas are not supported at this time.",
  },
  {
    title: "3. Service Availability",
    body: "EcoQuick operates 7 days a week with varying operational hours depending on the location. Delivery slots are subject to availability and may change due to demand, weather, or unforeseen circumstances.",
  },
  {
    title: "4. Booking and Confirmation",
    body: "Users can book deliveries via the EcoQuick website or app. A booking is confirmed once payment is processed and a delivery partner is assigned. Users will receive real-time updates on the status of their parcel.",
  },
  {
    title: "5. Driver Training & Certification",
    body: "All delivery partners must complete a mandatory certification covering EV safety, UK driving regulations, and safe parcel handling. EcoQuick ensures each driver is trained to uphold our quality and safety standards.",
  },
  {
    title: "6. Parcel Restrictions",
    body: "We do not transport illegal, hazardous, flammable, or prohibited items. Parcel size and weight must comply with the limits specified during booking. Non-compliant parcels may be rejected.",
  },
  {
    title: "7. Packaging and Liability",
    body: "Senders are responsible for proper packaging unless opting for EcoQuick's eco-packaging service. We are not liable for damage due to inadequate packaging. All parcels are handled with care, but EcoQuick is not responsible for pre-existing damages.",
  },
  {
    title: "8. Delivery Times & Delays",
    body: "Estimated delivery times are provided during booking but are not guaranteed. Delivery times may vary depending on weather conditions, traffic congestion, road closures, driver availability, vehicle breakdowns, and other external factors beyond EcoQuick's control. We will make reasonable efforts to notify customers of significant delays, but cannot guarantee specific delivery timeframes. By using our service, customers acknowledge that delivery times are estimates only and may be subject to delays.",
  },
  {
    title: "9. Insurance & Claims",
    body: "Parcels are not automatically insured. Users may opt for additional insurance during booking. Claims for lost or damaged parcels must be submitted within 48 hours of delivery with supporting evidence.",
  },
  {
    title: "10. Fees and Payment",
    body: "Users agree to pay the applicable delivery fee at the time of booking. Additional charges may apply for services like eco-packaging, wait time, or peak hour surcharges. All payments are processed securely.",
  },
  {
    title: "11. Cancellations & Refunds",
    body: "Users may cancel their delivery before the driver is assigned and 30 minutes before scheduled pickup time for a full refund. Cancellations after this period may not be eligible for a refund. Refunds are processed within 7 business days.",
  },
  {
    title: "12. Privacy & Data Protection",
    body: "EcoQuick values your privacy. Personal information collected is used only for service provision, order tracking, and communication. We do not sell or share your data with third parties without consent. See our Privacy Policy for full details.",
  },
  {
    title: "13. Customer Support",
    body: "For questions, complaints, or feedback, users can contact our support team via the website chat, email, or phone. We aim to resolve all issues promptly and transparently.",
  },
  {
    title: "14. Amendments",
    body: "EcoQuick reserves the right to modify these terms at any time. Updates will be posted on our website and take effect immediately. Continued use of our service implies agreement to the revised terms.",
  },
];

export default function TermsPage() {
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
              Legal · User Agreement
            </p>
            <h1 className="text-[clamp(1.75rem,6vw,4rem)] font-bold leading-[1.08] tracking-[-0.03em] text-zinc-900 dark:text-[#ede9f8]">
              Terms of <span className="text-[#3e0074] dark:text-[#c084fc]">Service</span>
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-[15px] font-medium leading-[1.6] text-zinc-700 dark:text-zinc-300 md:text-lg">
              Please read these terms carefully. By using EcoQuick services, you agree to these terms and conditions.
            </p>
            <p className="mt-4 text-[13px] text-zinc-400 dark:text-zinc-500">
              Effective date: 1 July 2025
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
                <p className="font-secondary text-[15px] leading-[1.7] text-zinc-600 dark:text-zinc-400">
                  {section.body}
                </p>
              </div>
            ))}

            {/* Contact */}
            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-6 dark:border-zinc-800 dark:bg-[#0c0b14] md:p-8">
              <h2 className="mb-2 text-lg font-bold text-zinc-900 dark:text-[#ede9f8] md:text-xl">
                Contact Information
              </h2>
              <p className="font-secondary text-[15px] leading-[1.7] text-zinc-600 dark:text-zinc-400">
                For any questions about these terms, please contact us at{" "}
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
