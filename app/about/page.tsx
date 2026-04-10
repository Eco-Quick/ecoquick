import Link from "next/link";
import { LandingHeader } from "@/components/layout/LandingHeader";
import { LandingFooter } from "@/components/layout/LandingFooter";

export default function AboutPage() {
  return (
    <div className="landing-shell min-h-screen bg-white text-zinc-900 dark:bg-[#050507] dark:text-[#ede9f8]">
      <div className="landing-grid-layer" />

      <div className="landing-content px-6 lg:px-8">
        <LandingHeader />
      </div>

      <main className="landing-content">
        {/* Hero + Mission — single immersive block */}
        <section className="border-b border-zinc-100 px-6 pb-14 pt-12 dark:border-zinc-800 md:px-10 md:pb-20 md:pt-20">
          <div className="mx-auto max-w-5xl text-center">
            <p className="hero-fade mb-5 text-[11px] font-semibold uppercase tracking-[0.25em] text-[#3e0074]/50 dark:text-zinc-400">
              About EcoQuick
            </p>
            <h1 className="hero-heading-reveal text-[clamp(2rem,6vw,5rem)] font-bold leading-[1.08] tracking-[-0.03em] text-zinc-900 dark:text-[#ede9f8]">
            Just Click, Confirm <span className="text-[#3e0074] dark:text-[#c084fc]">and it's Delivered</span>
            </h1>
            <p className="hero-buttons-fade mx-auto mt-8 max-w-2xl text-[15px] leading-relaxed text-zinc-600 dark:text-zinc-400">
              At EcoQuick, our mission is to make local deliveries fast, simple and sustainable.
              We aim to eliminate long wait times and unreliable services by providing instant,
              hyperlocal parcel delivery powered by eco-friendly solutions. Whether for individuals
              or businesses, we focus on speed, convenience and reducing environmental impact.
            </p>
            
          </div>
        </section>

        {/* Process */}
        <section className="px-6 py-12 md:px-10 md:py-16">
          <div className="mx-auto max-w-5xl">
            <div className="mb-8 md:mb-10">
              <h2 className="text-3xl font-bold text-zinc-900 dark:text-[#ede9f8] md:text-5xl">
                How it works
              </h2>
              <p className="mt-3 text-[15px] text-zinc-600 dark:text-zinc-400">
                Four stages of seamless, carbon-neutral logistics.
              </p>
            </div>

            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { k: "01", title: "Order Placed", body: "Automated ingestion into our high-speed dispatch architecture." },
                { k: "02", title: "Instant Dispatch", body: "Predictive routing assigns the nearest eco-rider in sub-seconds." },
                { k: "03", title: "Eco-Delivery", body: "Zero-emission transit via our electric fleet." },
                { k: "04", title: "Verification", body: "Proof of delivery verified with end-to-end encryption." },
              ].map((step) => (
                <div key={step.k} className="group rounded-2xl border border-zinc-200/80 bg-gradient-to-br from-white to-zinc-50 p-8 shadow-[0_4px_12px_rgba(0,0,0,0.08),0_12px_32px_rgba(0,0,0,0.06),inset_0_1px_0_rgba(255,255,255,0.8)] transition-all duration-300 hover:-translate-y-1.5 hover:border-[#3e0074]/25 hover:shadow-[0_12px_40px_rgba(62,0,116,0.14),0_4px_12px_rgba(0,0,0,0.08)] dark:border-[#4d4270] dark:from-[#15121f] dark:to-[#0e0c16] dark:shadow-[0_4px_16px_rgba(0,0,0,0.6),0_12px_32px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(192,132,252,0.1)] dark:hover:border-[#c084fc]/40 dark:hover:shadow-[0_12px_40px_rgba(192,132,252,0.15),0_4px_16px_rgba(0,0,0,0.6)]">
                  <span className="text-4xl font-bold text-zinc-300 transition-colors group-hover:text-[#3e0074] dark:text-[white] dark:group-hover:text-[#c084fc]">
                    {step.k}
                  </span>
                  <h3 className="mt-4 mb-2 text-base font-bold text-zinc-900 dark:text-white">
                    {step.title}
                  </h3>
                  <p className="text-[15px] leading-relaxed text-zinc-600 dark:text-zinc-300">
                    {step.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="bg-zinc-50 px-6 py-12 md:px-10 md:py-16 dark:bg-[#050507]">
          <div className="mx-auto max-w-5xl">
            <h2 className="mb-8 text-3xl font-bold text-zinc-900 dark:text-[#ede9f8] md:text-5xl">
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
                  className={`p-10 md:p-12 ${
                    value.variant === "purple"
                      ? "bg-[#3e0074]/[0.06] dark:bg-[#2a1650]"
                      : "bg-white dark:bg-[#0e0c16]"
                  }`}
                >
                  <h4 className="mb-3 text-lg font-bold text-zinc-900 dark:text-white">{value.title}</h4>
                  <p className="text-[15px] leading-relaxed text-zinc-600 dark:text-zinc-300">{value.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Story */}
        <section className="px-6 py-12 md:px-10 md:py-16">
          <div className="mx-auto max-w-5xl">
            <h2 className="mb-8 text-3xl font-bold text-zinc-900 dark:text-[#ede9f8] md:text-5xl">
              Our story
            </h2>

            <div className="space-y-10 border-l-2 border-zinc-200 pl-8 dark:border-zinc-800 md:pl-12">
              {[
                {
                  year: "2023",
                  title: "Born from a simple idea",
                  body: "EcoQuick was born from a simple idea: Why wait longer than necessary for a parcel and why should delivery harm the environment? We started with a single bicycle and a vision.",
                },
                {
                  year: "Today",
                  title: "Serving our community",
                  body: "Today, we operate a fleet of electric vehicles, serving hundreds of customers across London. Our dedicated drivers are committed to eco-friendly practices.",
                },
                {
                  year: "Future",
                  title: "Part of the solution",
                  body: "EcoQuick isn't just a delivery company \u2013 it's part of the solution to creating a cleaner, faster and more sustainable future for our planet.",
                },
              ].map((item) => (
                <div key={item.year} className="relative">
                  <div className="absolute -left-[calc(2rem+5px)] top-1.5 h-2.5 w-2.5 rounded-full bg-[#3e0074] dark:bg-[#c084fc] md:-left-[calc(3rem+5px)]" />
                  <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.15em] text-zinc-500 dark:text-zinc-400">{item.year}</p>
                  <h4 className="mb-3 text-xl font-bold text-zinc-900 dark:text-[#ede9f8]">{item.title}</h4>
                  <p className="max-w-lg text-[15px] leading-relaxed text-zinc-600 dark:text-zinc-400">{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="px-6 py-12 md:px-10 md:py-16">
          <div className="mx-auto max-w-5xl rounded-3xl bg-[#3e0074] px-8 py-12 text-center text-white md:px-16 md:py-16 dark:bg-[#5b21b6]">
            <h2 className="text-3xl font-bold md:text-5xl">Join the revolution</h2>
            <p className="mx-auto mt-4 max-w-md text-[15px] leading-relaxed text-white/70">
              Building the future of urban movement together.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/signup"
                className="rounded-full bg-white px-10 py-4 text-[12px] font-bold uppercase tracking-[0.18em] text-[#3e0074] dark:bg-[#0c0b14] dark:text-[#c084fc] dark:border dark:border-[#302555] shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl active:scale-[0.97]"
              >
                Book your first delivery
              </Link>
              <Link
                href="/signup?profile=driver"
                className="rounded-full border border-white/30 px-10 py-4 text-[12px] font-bold uppercase tracking-[0.18em] text-white transition-all duration-300 hover:-translate-y-0.5 hover:border-white/60 hover:bg-white/10 active:scale-[0.97]"
              >
                Become an eco driver
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
