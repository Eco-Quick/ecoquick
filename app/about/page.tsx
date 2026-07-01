import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { LandingHeader } from "@/components/layout/LandingHeader";
import { LandingFooter } from "@/components/layout/LandingFooter";
import CoverageMap from "@/components/about/CoverageMap";

export const metadata: Metadata = {
  title: "About",
  description:
    "Meet the team behind EcoQuick — a hyperlocal, carbon-neutral delivery service for Kingston and surrounding London boroughs, founded by Preeti Misal.",
  openGraph: {
    title: "About EcoQuick",
    description:
      "Meet the team behind EcoQuick — a hyperlocal, carbon-neutral delivery service for Kingston and surrounding London boroughs.",
    url: "/about",
  },
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <div className="landing-shell min-h-screen bg-white text-zinc-900 dark:bg-[#050507] dark:text-[#ede9f8]">
      <div className="landing-grid-layer" />

      <div className="landing-content px-6 lg:px-8">
        <LandingHeader />
      </div>

      <main className="landing-content">
        {/* Hero + Mission — single immersive block */}
        <section className="border-b border-zinc-100 px-6 pb-8 pt-8 dark:border-zinc-800 md:px-10 md:pb-20 md:pt-20">
          <div className="mx-auto max-w-5xl text-center">
            <p className="hero-fade mb-3 text-[11px] font-semibold uppercase tracking-[0.25em] text-[#3e0074]/50 dark:text-zinc-400 md:mb-5">
              About EcoQuick
            </p>
            <h1 className="hero-heading-reveal text-[clamp(1.75rem,6vw,5rem)] font-bold leading-[1.08] tracking-[-0.03em] text-zinc-900 dark:text-[#ede9f8]">
            Just Click, Confirm <span className="text-[#3e0074] dark:text-[#c084fc]">and it&apos;s Delivered</span>
            </h1>
            <p className="hero-buttons-fade mx-auto mt-5 max-w-3xl text-[15px] font-medium leading-[1.6] text-zinc-700 dark:text-zinc-300 md:mt-8 md:text-[21px] md:leading-[1.7]">
              EcoQuick makes parcel delivery{" "}
              <span className="font-bold text-[#3e0074] dark:text-[#c084fc]">instant</span>,{" "}
              <span className="font-bold text-[#3e0074] dark:text-[#c084fc]">simple</span>, and{" "}
              <span className="font-bold text-[#3e0074] dark:text-[#c084fc]">reliable</span> —
              just like ordering food, you can send anything from point A to point B in minutes,
              with no delays and no complexity. Built for both individuals and businesses,
              we connect you to a real-time, hyperlocal delivery network that moves at your speed.
            </p>

          </div>
        </section>

        {/* Values */}
        <section className="bg-zinc-50 px-6 py-8 md:px-10 md:py-16 dark:bg-[#050507]">
          <div className="mx-auto max-w-5xl">
            <h2 className="mb-5 text-2xl font-bold text-zinc-900 dark:text-[#ede9f8] md:mb-8 md:text-5xl">
              Our values
            </h2>

            <div className="grid grid-cols-1 overflow-hidden rounded-2xl border border-zinc-200 dark:border-[#3d3455] sm:grid-cols-2">
              {[
                { title: "Customer Focus", body: "Your satisfaction is our priority. We go above and beyond to ensure every delivery exceeds expectations.", variant: "white" },
                { title: "Speed & Reliability", body: "Precision is the heartbeat of our operation, measured in milliseconds.", variant: "purple" },
                { title: "Sustainability", body: "Committed to a 100% carbon-neutral future, without compromise.", variant: "purple" },
                { title: "Community", body: "Empowering local commerce and providing dignified driver roles.", variant: "white" },
              ].map((value) => (
                <div
                  key={value.title}
                  className={`p-5 md:p-12 ${
                    value.variant === "purple"
                      ? "bg-[#3e0074]/[0.06] dark:bg-[#2a1650]"
                      : "bg-white dark:bg-[#0e0c16]"
                  }`}
                >
                  <h4 className="mb-2 text-base font-bold text-zinc-900 dark:text-white md:mb-3 md:text-lg">{value.title}</h4>
                  <p className="text-[14px] leading-relaxed text-zinc-600 dark:text-zinc-300 md:text-[15px]">{value.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Story (with photos + founder reveal) */}
        <section className="relative overflow-hidden px-6 py-8 md:px-10 md:py-14">
          <div className="absolute inset-0 -z-10 bg-gradient-to-b from-white via-zinc-50/40 to-white dark:from-[#050507] dark:via-[#0a0712] dark:to-[#050507]" />
          <div className="absolute left-1/2 top-0 -z-10 h-64 w-[80%] -translate-x-1/2 rounded-full bg-[#3e0074]/[0.04] blur-3xl dark:bg-[#c084fc]/[0.06]" />

          <div className="mx-auto max-w-3xl">
            <p className="mb-2 text-center text-[11px] font-semibold uppercase tracking-[0.3em] text-[#3e0074]/60 dark:text-[#c084fc]/70">
              The journey
            </p>
            <h2 className="mb-5 text-center text-2xl font-bold text-zinc-900 dark:text-[#ede9f8] md:mb-6 md:text-5xl">
              Our story
            </h2>

            {/* Opening line */}
            <p className="text-center text-[16px] leading-[1.6] text-zinc-700 dark:text-zinc-300 md:text-[20px] md:leading-[1.7]">
              EcoQuick didn&apos;t start as a business idea—
              <span className="font-semibold text-zinc-900 dark:text-white">it started with a question.</span>
            </p>

            {/* Pull quote 1 */}
            <figure className="my-6 text-center md:my-7">
              <blockquote className="text-[22px] font-bold italic leading-tight tracking-tight text-[#3e0074] dark:text-[#c084fc] md:text-[34px]">
                &ldquo;Why are deliveries still so frustrating?&rdquo;
              </blockquote>
            </figure>

            {/* Body 1 — Kingston */}
            <div className="space-y-4 text-[16px] leading-[1.7] text-zinc-700 dark:text-zinc-300 md:text-[17px]">
              <p>
                While at university, we kept hearing the same thing—late parcels, unclear updates, and a lot of unnecessary stress.
                What seemed like a small inconvenience was actually a shared experience.
              </p>
            </div>

            {/* Body 2 — surveys */}
            <div className="space-y-4 text-[16px] leading-[1.7] text-zinc-700 dark:text-zinc-300 md:text-[17px]">
              <p>
                So instead of jumping straight into building a company, we focused on understanding the problem.
                Through research, conversations, and{" "}
                <span className="font-secondary font-bold text-zinc-900 dark:text-white">500+</span> surveys{" "}
                with individuals and local businesses, one thing became clear:
              </p>
            </div>

            {/* Pull quote 2 */}
            <figure className="my-7 border-l-4 border-[#3e0074] pl-6 dark:border-[#c084fc]">
              <blockquote className="text-[20px] font-semibold italic leading-snug text-zinc-800 dark:text-zinc-100 md:text-[22px]">
                People weren&apos;t happy with how deliveries worked.
              </blockquote>
            </figure>

            {/* Body 3 — birth + Kingston model */}
            <div className="space-y-4 text-[16px] leading-[1.7] text-zinc-700 dark:text-zinc-300 md:text-[17px]">
              <p>
                That&apos;s how EcoQuick was born—out of a need to{" "}
                <span className="font-semibold text-zinc-900 dark:text-white">simplify, not complicate</span>.
                Starting in Kingston, we built a hyperlocal model designed to make deliveries smoother, faster,
                and more reliable for both customers and businesses.
              </p>
            </div>

            {/* Photo pair: real-world delivery testing */}
            <div className="mx-auto my-7 grid max-w-lg grid-cols-2 gap-3 sm:gap-5">
              <figure>
                <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-100 shadow-[0_8px_30px_rgba(0,0,0,0.08)] dark:border-[#3d3455] dark:bg-[#0e0c16]">
                  <Image
                    src="/preeti/delivery-doorstep.jpeg"
                    alt="Real-world doorstep delivery test in Kingston"
                    fill
                    sizes="(max-width: 640px) 90vw, 360px"
                    className="object-cover"
                  />
                </div>
                <figcaption className="mt-3 flex items-center justify-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">
                  <span className="h-1 w-1 rounded-full bg-[#3e0074] dark:bg-[#c084fc]" />
                  Field testing · Kingston
                </figcaption>
              </figure>
              <figure>
                <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-100 shadow-[0_8px_30px_rgba(0,0,0,0.08)] dark:border-[#3d3455] dark:bg-[#0e0c16]">
                  <Image
                    src="/preeti/delivery-outside.jpeg"
                    alt="On-foot deliveries in the local Kingston area"
                    fill
                    sizes="(max-width: 640px) 90vw, 360px"
                    className="object-cover"
                  />
                </div>
                <figcaption className="mt-3 flex items-center justify-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">
                  <span className="h-1 w-1 rounded-full bg-[#3e0074] dark:bg-[#c084fc]" />
                  On-the-ground · validating
                </figcaption>
              </figure>
            </div>

            {/* Body 4 — competitions + Mayor's London */}
            <div className="space-y-4 text-[16px] leading-[1.7] text-zinc-700 dark:text-zinc-300 md:text-[17px]">
              <p>
                What began as a university idea has grown through competitions, real-world validation,
                and programmes like the{" "}
                <span className="font-semibold text-[#3e0074] dark:text-[#c084fc]">Mayor&apos;s London initiative</span>.
              </p>
            </div>

            {/* Photo pair: competitions */}
            <div className="mx-auto my-7 grid max-w-lg grid-cols-2 gap-3 sm:gap-5">
              <figure>
                <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-100 shadow-[0_8px_30px_rgba(0,0,0,0.08)] dark:border-[#3d3455] dark:bg-[#0e0c16]">
                  <Image
                    src="/preeti/london-assembly.jpeg"
                    alt="Preeti at the London Assembly"
                    fill
                    sizes="(max-width: 640px) 90vw, 360px"
                    className="object-cover"
                  />
                </div>
                <figcaption className="mt-3 flex items-center justify-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">
                  <span className="h-1 w-1 rounded-full bg-[#3e0074] dark:bg-[#c084fc]" />
                  London Assembly
                </figcaption>
              </figure>
              <figure>
                <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-100 shadow-[0_8px_30px_rgba(0,0,0,0.08)] dark:border-[#3d3455] dark:bg-[#0e0c16]">
                  <Image
                    src="/preeti/pitch-presentation.jpeg"
                    alt="Preeti pitching EcoQuick at a competition"
                    fill
                    sizes="(max-width: 640px) 90vw, 360px"
                    className="object-cover"
                  />
                </div>
                <figcaption className="mt-3 flex items-center justify-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">
                  <span className="h-1 w-1 rounded-full bg-[#3e0074] dark:bg-[#c084fc]" />
                  Pitch competition
                </figcaption>
              </figure>
            </div>

            {/* Closing impact line */}
            <div className="mt-10 border-t border-zinc-200 pt-7 text-center dark:border-zinc-800">
              <p className="text-[24px] font-bold tracking-tight text-zinc-900 dark:text-white md:text-[32px]">
                And we&apos;re just{" "}
                <span className="text-[#3e0074] dark:text-[#c084fc]">getting started.</span>
              </p>
            </div>
          </div>

          {/* Founder reveal — the payoff to "we" throughout the story */}
          <div className="mx-auto mt-10 max-w-5xl md:mt-14">
            <div className="mb-5 text-center md:mb-6">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.3em] text-[#3e0074]/60 dark:text-[#c084fc]/70">
                The person behind it
              </p>
              <h3 className="text-xl font-bold text-zinc-900 dark:text-[#ede9f8] md:text-4xl">
                Meet Preeti
              </h3>
            </div>

            <div className="grid items-start gap-6 rounded-3xl border border-zinc-200 bg-white p-5 shadow-[0_4px_24px_rgba(0,0,0,0.04)] dark:border-[#3d3455] dark:bg-[#0e0c16] md:grid-cols-[300px_1fr] md:gap-14 md:p-12">
              {/* Portrait + identity */}
              <div className="flex flex-col items-center text-center md:items-start md:text-left">
                <div className="relative w-full max-w-[180px] md:max-w-[260px]">
                  <div className="absolute -inset-2 rounded-2xl bg-gradient-to-br from-[#3e0074] to-[#c084fc] opacity-20 blur-md" />
                  <div className="relative aspect-[3/4] overflow-hidden rounded-2xl border border-zinc-200 shadow-xl dark:border-[#3d3455]">
                    <Image
                      src="/preeti/poster-pitch.jpeg"
                      alt="Preeti Misal, Founder of EcoQuick"
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
                <h4 className="mt-4 text-xl font-bold text-zinc-900 dark:text-white md:mt-6 md:text-2xl">Preeti Misal</h4>
                <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#3e0074] dark:text-[#c084fc] md:text-[12px]">
                  Founder &amp; CEO
                </p>
              </div>

              {/* Bio */}
              <div className="space-y-4 text-[14px] leading-[1.7] text-zinc-700 dark:text-zinc-300 md:space-y-5 md:text-[16px] md:leading-[1.8]">
                <p>
                  EcoQuick was founded by{" "}
                  <span className="font-semibold text-zinc-900 dark:text-white">Preeti Misal</span>, whose academic
                  and professional background sits right at the intersection of logistics and innovation.
                </p>
                <p>
                  With an MBA in Supply Chain and Logistics, and a second Master&apos;s in Innovation Management
                  and Entrepreneurship, Preeti brings both operational expertise and forward-thinking strategy
                  to the table.
                </p>
                <p>
                  Her approach to EcoQuick is simple—
                  <span className="font-semibold text-zinc-900 dark:text-white">build solutions that actually solve everyday problems</span>.
                  Instead of overcomplicating deliveries, her focus has been on making them convenient, faster,
                  and more reliable for both customers and businesses.
                </p>

                <blockquote className="mt-6 border-l-4 border-[#3e0074] pl-5 text-[17px] italic leading-relaxed text-zinc-800 dark:border-[#c084fc] dark:text-zinc-100">
                  EcoQuick reflects that mindset: practical, efficient, and built with real users in mind.
                </blockquote>
              </div>
            </div>
          </div>
        </section>

        {/* Coverage map — where we deliver */}
        <section className="bg-zinc-50 px-6 py-8 md:px-10 md:py-14 dark:bg-[#0a0712]">
          <div className="mx-auto max-w-5xl">
            <div className="mb-5 text-center md:mb-8">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.3em] text-[#3e0074]/60 dark:text-[#c084fc]/70">
                Coverage area
              </p>
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-[#ede9f8] md:text-5xl">
                Where we deliver
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-[14px] leading-relaxed text-zinc-600 dark:text-zinc-400 md:mt-4 md:text-[15px]">
                Hyperlocal by design. We deliver across an{" "}
                <span className="font-semibold text-[#3e0074] dark:text-[#c084fc]">8-mile radius</span>{" "}
                from Kingston upon Thames — covering Wimbledon, Richmond, Twickenham, and beyond.
              </p>
            </div>

            <CoverageMap />

            <div className="mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">
              <span className="inline-flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#3e0074] dark:bg-[#c084fc]" />
                Kingston · base
              </span>
              <span className="text-zinc-300 dark:text-zinc-700">·</span>
              <span className="inline-flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#9a3412]" />
                0–3 mi
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#ea580c]" />
                3–5 mi
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#fb923c]" />
                5–8 mi
              </span>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="px-6 py-12 md:px-10 md:py-16">
          <div className="mx-auto max-w-5xl rounded-3xl bg-[#3e0074] px-8 py-12 text-center text-white md:px-16 md:py-16 dark:bg-[#5b21b6]">
            <h2 className="text-3xl font-bold md:text-5xl">Send a parcel today</h2>
            <p className="mx-auto mt-4 max-w-md text-[15px] leading-relaxed text-white/70">
              Fast, carbon-neutral delivery across Kingston and South West London. Book in under two minutes.
            </p>
            <div className="mt-10 flex justify-center">
              <Link
                href="/book/type"
                className="rounded-full bg-white px-10 py-4 text-[12px] font-bold uppercase tracking-[0.18em] text-[#3e0074] shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl active:scale-[0.97] dark:bg-[#0c0b14] dark:text-[#c084fc] dark:border dark:border-[#302555]"
              >
                Send a Parcel
              </Link>
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
