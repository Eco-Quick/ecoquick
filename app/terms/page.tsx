import type { Metadata } from "next";
import Link from "next/link";
import { LandingHeader } from "@/components/layout/LandingHeader";
import { LandingFooter } from "@/components/layout/LandingFooter";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "The terms and conditions governing your use of EcoQuick's hyper-local same-day parcel delivery platform.",
  openGraph: {
    title: "Terms of Service — EcoQuick",
    description:
      "The terms and conditions governing your use of EcoQuick's hyper-local same-day parcel delivery platform.",
    url: "/terms",
  },
  alternates: { canonical: "/terms" },
};

type Section = {
  title: string;
  paragraphs?: string[];
  bullets?: string[];
};

const DEFINITIONS: { term: string; definition: string }[] = [
  { term: "“EcoQuick”, “we”, “us”, “our”", definition: "EcoQuick Parcel Delivery Services Limited, a company registered in England and Wales (Company No. 16192069), with registered office at 24 Park Road House, Park Road, Kingston Upon Thames, England, KT2 6DF." },
  { term: "“Platform”", definition: "the EcoQuick website, mobile application, and related digital services." },
  { term: "“Customer”", definition: "any individual or business that registers and uses the Platform to request a Delivery." },
  { term: "“Independent Rider” or “Rider”", definition: "a self-employed individual who registers with EcoQuick to accept and perform Deliveries using their own vehicle." },
  { term: "“Booking”", definition: "a Delivery request submitted by a Customer through the Platform." },
  { term: "“Parcel” or “Goods”", definition: "any item submitted for Delivery via the Platform." },
  { term: "“Delivery”", definition: "the collection of a Parcel from a pickup address and its transport to a drop-off address by a Rider." },
];

const SECTIONS: Section[] = [
  {
    title: "2. Acceptance and Changes to These Terms",
    paragraphs: [
      "By using the Platform, you agree to these Terms. We may update these Terms from time to time to reflect changes to our services, legal or regulatory requirements, or our operational practices. Where changes are material, we will notify you by email or in-app notice; continued use of the Platform after the changes take effect constitutes your acceptance of the updated Terms.",
      "Certain operational practices — such as pricing logic, rider matching, or support workflows — may be adjusted by EcoQuick without amounting to a formal change to these Terms.",
    ],
  },
  {
    title: "3. Browsing, Accounts, and Eligibility",
    paragraphs: [
      "You may browse the Platform and review indicative pricing without creating an account.",
      "To place a Booking and complete checkout, you must register for an account. You must be at least 18 years old and have legal capacity to enter into contracts under the laws of England and Wales.",
      "You must provide accurate, complete, and up-to-date information when registering and when submitting a Booking, and you are responsible for keeping your account credentials secure and for all activity under your account.",
      "We may suspend or close accounts involved in fraud, misuse, or breach of these Terms.",
    ],
  },
  {
    title: "4. The EcoQuick Platform and Our Role",
    paragraphs: [
      "EcoQuick operates a hyper-local, on-demand delivery marketplace. We do not own or operate a delivery fleet; Deliveries are performed by Independent Riders using their own vehicles.",
      "EcoQuick acts as a digital intermediary connecting Customers and Riders, and as a payment collection agent. We do not take physical possession of Parcels at any point and are not a carrier, freight forwarder, or postal operator.",
      "The Platform currently supports Customer-to-Customer (C2C), Customer-to-Business (C2B), Business-to-Customer (B2C), and Business-to-Business (B2B) Deliveries.",
    ],
  },
  {
    title: "5. Service Area and Delivery Promise",
    paragraphs: [
      "EcoQuick currently operates within approximately an 8-mile radius of Kingston upon Thames, including Kingston, Surbiton, and New Malden. Our coverage area may change as we expand.",
      "Estimated delivery times are approximately 180–210 minutes from Booking confirmation, depending on rider availability, distance, traffic, and weather conditions. EcoQuick is positioned as a same-day local delivery service — delivery times shown in the Platform are estimates, not guarantees.",
    ],
  },
  {
    title: "6. Items We Deliver",
    paragraphs: [
      "EcoQuick currently delivers general parcels only, including documents, gifts, forgotten items, retail purchases, small business deliveries, and e-commerce parcels.",
      "We do not currently accept the following items for Delivery:",
    ],
    bullets: [
      "Alcohol",
      "Vapes and tobacco",
      "Prescription medicines",
      "Weapons",
      "Dangerous goods",
      "Illegal items",
      "Live animals",
      "Cash or precious materials",
    ],
  },
  {
    title: "7. Booking, Packaging, and Customer Responsibilities",
    paragraphs: [
      "When submitting a Booking, you must provide accurate pickup and drop-off addresses, contact details, and a description of the Parcel.",
      "You are responsible for packaging Parcels securely enough to withstand ordinary handling, and for ensuring a recipient is available at the drop-off address during the delivery window.",
      "Parcels must comply with the size and weight limits shown in the Platform at the time of Booking. These limits vary by vehicle type and are displayed clearly before you confirm your Booking.",
      "If a Parcel materially differs from the information provided at Booking, the assigned Rider may decline or cancel the Delivery, or request a fee adjustment through the Platform.",
    ],
  },
  {
    title: "8. Formation of Contract",
    paragraphs: [
      "Submitting a Booking is an offer to purchase a Delivery service. A contract is formed once the Platform confirms that a Rider has accepted the Booking.",
      "At that point, a contract for carriage exists directly between the Customer and the Rider performing the Delivery. EcoQuick is not a party to that contract and acts solely as the intermediary that enabled it.",
      "Prices shown in the Platform are calculated automatically based on factors including distance, parcel size, and demand, and are confirmed before a Booking is placed.",
    ],
  },
  {
    title: "9. Independent Riders",
    paragraphs: [
      "Riders are self-employed independent contractors, not employees, workers, or agents of EcoQuick. Riders use their own vehicles, bear their own costs, and are free to choose when and whether to accept Deliveries.",
      "Riders are solely responsible for maintaining any insurance required by law for their vehicle and activity, complying with traffic laws and safety requirements, and declaring their income and paying applicable tax and National Insurance to HMRC.",
      "Before activation, motorbike Riders must provide their full name, address, phone number, email address, driving licence, vehicle details, proof of courier insurance, and emergency contact information. Bicycle Riders must complete identity verification, provide emergency contact details, and sign a Rider agreement.",
      "EcoQuick may suspend or deactivate a Rider's account for failure to maintain required documentation, repeated complaints, or breach of these Terms.",
    ],
  },
  {
    title: "10. Payments, Cancellations, and Refunds",
    paragraphs: [
      "Delivery charges are displayed in the Platform before a Booking is confirmed and are processed through our payment provider, Stripe. EcoQuick does not store full card details.",
    ],
  },
  {
    title: "10.1 Cancellation Policy",
    bullets: [
      "Before a Rider accepts your Booking: you may cancel at no charge and receive a full refund.",
      "After a Rider has accepted but before collection is confirmed: a cancellation fee of £2.50 applies to compensate the Rider for time and travel already committed. The remainder of your payment will be refunded.",
      "After the Rider has confirmed collection of your Parcel: cancellation is not permitted. The Delivery is in progress and the full charge applies.",
    ],
  },
  {
    title: "10.2 Refund Policy",
    bullets: [
      "Full refund: if EcoQuick is unable to find a Rider to fulfil your Booking within a reasonable time, you will receive a full refund with no deduction.",
      "Full refund: if a Delivery fails due to Rider error or a fault on EcoQuick's side, you will receive a full refund.",
      "No refund: if a Delivery cannot be completed because the recipient was unavailable and no alternative arrangement was made, the delivery fee remains payable.",
      "No refund: for delays caused by traffic, weather, or other circumstances outside the Rider's reasonable control, where the Rider acted with due care.",
      "Goodwill credit: where service fell below expectations but no clear fault can be established, EcoQuick may, at its discretion, issue a goodwill credit to your account in lieu of a cash refund.",
    ],
  },
  {
    title: "10.3 Failed Payments",
    bullets: [
      "If your payment fails, EcoQuick will automatically retry the transaction once.",
      "If the retry fails, your Booking will be cancelled and you will be notified to update your payment details.",
      "No Delivery will be dispatched until payment has been successfully processed.",
    ],
  },
  {
    title: "11. Insurance and Risk",
    paragraphs: [
      "EcoQuick does not currently provide insurance or compensation for Parcels transported through the Platform. We are not a carrier, and we do not insure Goods carried by Independent Riders.",
      "You may be asked to declare an approximate value for your Parcel when making a Booking. This declared value is used only to help Riders assess whether they are able and willing to carry the Parcel — it does not entitle you to compensation and is not a form of insurance cover.",
      "Deliveries are made entirely at the Customer's own risk. EcoQuick does not accept liability for loss, theft, or damage to Parcels, except where this results from a Rider's proven fraud or wilful misconduct.",
      "Risk in a Parcel passes from the Customer to the Rider once the Rider confirms collection in the Platform, and from the Rider to the recipient once the Delivery is confirmed as complete.",
      "Independent Riders are solely responsible for maintaining valid motor insurance (including hire-and-reward cover where legally required for their vehicle category), public liability insurance, and any other insurance required by law for their activity. EcoQuick does not insure Riders' vehicles, equipment, or personal property, and may request proof of valid insurance from a Rider at any time.",
      "EcoQuick intends to introduce its own insurance arrangements as the business grows; this section will be updated accordingly when that happens.",
    ],
  },
  {
    title: "12. Delivery Completion, Delays, and Failed Deliveries",
    paragraphs: [
      "A Delivery is confirmed using a verification PIN: a unique code is generated for each Booking and shown to the Customer. The Customer shares this PIN with the Rider at the point of drop-off, and the Delivery is treated as complete once confirmed in the Platform.",
      "If a recipient is unavailable, the Rider will attempt reasonable contact. If a Delivery cannot be completed, EcoQuick or the Rider may attempt a return or reschedule; additional charges may apply.",
      "Estimated delivery times are not guaranteed. EcoQuick is not liable for delays caused by traffic, weather, or other factors outside a Rider's reasonable control, provided the Rider acted with due care.",
    ],
  },
  {
    title: "13. Complaints and Dispute Resolution",
    paragraphs: [
      "If you have a complaint about a Delivery, please contact us at support@ecoquickdelivery.co.uk within 14 calendar days of the issue, including your Booking reference and a description of the problem, or call +44 7417 366028.",
      "For claims involving loss of or damage to a Parcel, you must notify us within 24 hours of the scheduled or actual delivery time. Claims submitted outside this window may not be investigated.",
      "We will review the information available to us, such as booking records and communications, and aim to facilitate a fair resolution between the Customer and Rider.",
      "If a complaint cannot be resolved internally, either party may seek independent mediation through a UK-accredited alternative dispute resolution (ADR) provider before pursuing court action.",
    ],
  },
  {
    title: "14. Account Suspension and Termination",
    paragraphs: [
      "You may close your account at any time, provided there are no active Bookings or unresolved disputes.",
      "We may suspend or terminate an account immediately where necessary to prevent fraud, protect the security of the Platform, comply with legal obligations, or enforce these Terms.",
    ],
  },
  {
    title: "15. Service Availability and Changes to the Platform",
    paragraphs: [
      "We aim to keep the Platform available at all times, but we do not guarantee uninterrupted access. The Platform may be temporarily unavailable due to maintenance, security updates, or issues affecting third-party providers such as Supabase, Vercel, Stripe, or Mapbox.",
      "We may update, add, or remove features at any time to improve performance, security, or functionality.",
    ],
  },
  {
    title: "16. Intellectual Property",
    paragraphs: [
      "All intellectual property in the Platform, including its software, design, and branding, belongs to EcoQuick or its licensors. These Terms do not transfer any ownership rights to Customers or Riders.",
      "You are granted a limited, non-exclusive, non-transferable licence to use the Platform solely to request or perform Deliveries. You must not reverse-engineer, scrape, or use the Platform's content to train other systems without our written consent.",
    ],
  },
  {
    title: "17. Data Protection",
    paragraphs: [
      "We process personal data in accordance with our Privacy Policy, which forms part of these Terms.",
    ],
  },
  {
    title: "18. Confidentiality",
    paragraphs: [
      "Each party agrees to keep confidential any non-public information obtained through the Platform, including customer details, delivery instructions, and platform architecture, except where disclosure is required by law.",
    ],
  },
  {
    title: "19. Force Majeure",
    paragraphs: [
      "Neither EcoQuick, Customers, nor Riders are liable for delays or failures caused by events beyond reasonable control, including severe weather, natural disasters, strikes, or government restrictions.",
    ],
  },
  {
    title: "20. Limitation of Liability",
    paragraphs: [
      "The Platform is provided on an “as is” and “as available” basis. To the extent permitted by law, EcoQuick is not liable for indirect or consequential losses, including loss of profit or opportunity.",
      "Nothing in these Terms excludes liability that cannot lawfully be excluded, including for death, personal injury, or fraud.",
    ],
  },
  {
    title: "21. No Employment Relationship",
    paragraphs: [
      "Nothing in these Terms creates an employment, partnership, agency, or joint venture relationship between EcoQuick and any Customer or Rider.",
    ],
  },
  {
    title: "22. Assignment",
    paragraphs: [
      "EcoQuick may transfer its rights and obligations under these Terms in connection with a merger, acquisition, or restructuring. Customers and Riders may not transfer their rights without our prior written consent.",
    ],
  },
  {
    title: "23. Third-Party Rights",
    paragraphs: [
      "No person other than EcoQuick, the Customer, and the Rider involved in a particular Delivery has any right to enforce these Terms under the Contracts (Rights of Third Parties) Act 1999.",
    ],
  },
  {
    title: "24. General",
    bullets: [
      "Severability: if any provision of these Terms is found invalid or unenforceable, the remaining provisions continue in full force.",
      "Entire agreement: these Terms, together with our Privacy Policy and any other policies we reference, form the entire agreement between the parties.",
      "No waiver: a failure by EcoQuick to enforce any right or provision is not a waiver of that right.",
    ],
  },
  {
    title: "25. Governing Law and Jurisdiction",
    paragraphs: [
      "These Terms are governed by the laws of England and Wales. The courts of England and Wales have exclusive jurisdiction over disputes arising from these Terms, subject to any applicable consumer protection rights.",
    ],
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
              Last updated: 12 July 2026
            </p>
          </div>
        </section>

        {/* Sections */}
        <section className="px-6 py-10 md:px-10 md:py-16">
          <div className="mx-auto max-w-3xl space-y-8">
            <p className="font-secondary text-[15px] leading-[1.7] text-zinc-600 dark:text-zinc-400">
              These Terms of Service (“Terms”) govern access to and use of the EcoQuick website, mobile application, and related services (together, the “Platform”) for hyper-local same-day parcel delivery. They form a binding agreement between EcoQuick, Customers requesting Deliveries, and Independent Riders performing those Deliveries.
            </p>
            <p className="font-secondary text-[15px] leading-[1.7] text-zinc-600 dark:text-zinc-400">
              EcoQuick operates as a technology platform connecting Customers with Independent Riders. EcoQuick does not itself transport, store, or take possession of parcels; each Delivery is performed by an Independent Rider, with EcoQuick facilitating the booking and payment process.
            </p>
            <p className="font-secondary text-[15px] leading-[1.7] text-zinc-600 dark:text-zinc-400">
              By creating an account, placing a Booking, or otherwise using the Platform, you confirm that you have read, understood, and agree to be bound by these Terms, together with our{" "}
              <Link href="/privacy" className="font-semibold text-[#3e0074] hover:underline dark:text-[#c084fc]">Privacy Policy</Link>.
            </p>

            {/* Definitions */}
            <div>
              <h2 className="mb-2 text-lg font-bold text-zinc-900 dark:text-[#ede9f8] md:text-xl">
                1. Definitions
              </h2>
              <ul className="space-y-2">
                {DEFINITIONS.map((d) => (
                  <li key={d.term} className="font-secondary text-[15px] leading-[1.6] text-zinc-600 dark:text-zinc-400">
                    <span className="font-bold text-zinc-800 dark:text-zinc-200">{d.term}:</span> {d.definition}
                  </li>
                ))}
              </ul>
            </div>

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

            {/* Contact */}
            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-6 dark:border-zinc-800 dark:bg-[#0c0b14] md:p-8">
              <h2 className="mb-2 text-lg font-bold text-zinc-900 dark:text-[#ede9f8] md:text-xl">
                26. Contact Us
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
                See also our <Link href="/privacy" className="font-semibold text-[#3e0074] hover:underline dark:text-[#c084fc]">Privacy Policy</Link> and{" "}
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
