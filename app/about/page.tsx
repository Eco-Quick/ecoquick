import Link from "next/link";
import { LandingHeader } from "@/components/layout/LandingHeader";
import { LandingFooter } from "@/components/layout/LandingFooter";

export default function AboutPage() {
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
              About EcoQuick
            </p>
            <h1 className="text-4xl font-bold leading-tight tracking-[-0.02em] text-zinc-900 dark:text-[#ede9f8] md:text-6xl lg:text-7xl">
              Redefining the pulse
              <br />
              <span className="text-[#3e0074] dark:text-[#c084fc]">of the city</span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-zinc-500 dark:text-zinc-400 md:text-lg">
              We are building the framework for zero-emission urban logistics.
              Born from a necessity for speed and a commitment to the planet.
            </p>
          </div>
        </section>

        {/* Mission */}
        <section className="border-y border-zinc-100 bg-zinc-50 px-6 py-12 md:px-10 md:py-16 dark:border-zinc-800 dark:bg-[#161027]">
          <div className="mx-auto max-w-3xl text-center">
            <p className="mb-6 text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500">
              Our Mission
            </p>
            <h2 className="text-2xl font-medium leading-relaxed text-zinc-700 italic dark:text-zinc-300 md:text-3xl">
              &ldquo;To accelerate the transition to sustainable urban distribution
              by optimizing every meter, ensuring speed never costs the Earth.&rdquo;
            </h2>
          </div>
        </section>

        {/* Process */}
        <section className="px-6 py-12 md:px-10 md:py-16">
          <div className="mx-auto max-w-5xl">
            <div className="mb-8 md:mb-10">
              <h2 className="text-3xl font-bold text-zinc-900 dark:text-[#ede9f8] md:text-5xl">
                How it works
              </h2>
              <p className="mt-3 text-sm text-zinc-400 dark:text-zinc-500">
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
                <div key={step.k} className="group rounded-2xl border border-zinc-100 bg-white p-8 transition-all duration-200 hover:border-[#3e0074]/20 hover:shadow-lg dark:border-zinc-800 dark:bg-[#161027] dark:hover:border-[#c084fc]/20">
                  <span className="text-4xl font-bold text-zinc-200 transition-colors group-hover:text-[#3e0074] dark:text-zinc-700 dark:group-hover:text-[#c084fc]">
                    {step.k}
                  </span>
                  <h3 className="mt-4 mb-2 text-base font-bold text-zinc-900 dark:text-[#ede9f8]">
                    {step.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
                    {step.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="bg-zinc-50 px-6 py-12 md:px-10 md:py-16 dark:bg-[#0d0916]">
          <div className="mx-auto max-w-5xl">
            <h2 className="mb-8 text-3xl font-bold text-zinc-900 dark:text-[#ede9f8] md:text-5xl">
              Our values
            </h2>

            <div className="grid grid-cols-1 overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800 sm:grid-cols-2">
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
                      ? "bg-[#3e0074]/[0.06] dark:bg-[#c084fc]/[0.08]"
                      : "bg-white dark:bg-[#161027]"
                  }`}
                >
                  <h4 className="mb-3 text-lg font-bold text-zinc-900 dark:text-[#ede9f8]">{value.title}</h4>
                  <p className="text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">{value.body}</p>
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
                  <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.15em] text-zinc-400 dark:text-zinc-500">{item.year}</p>
                  <h4 className="mb-3 text-xl font-bold text-zinc-900 dark:text-[#ede9f8]">{item.title}</h4>
                  <p className="max-w-lg text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="px-6 py-12 md:px-10 md:py-16">
          <div className="mx-auto max-w-5xl rounded-3xl bg-[#3e0074] px-8 py-12 text-center text-white md:px-16 md:py-16 dark:bg-[#5b21b6]">
            <h2 className="text-3xl font-bold md:text-5xl">Join the revolution</h2>
            <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-white/70">
              Building the future of urban movement together.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/signup"
                className="rounded-full bg-white px-10 py-4 text-[12px] font-bold uppercase tracking-[0.18em] text-[#3e0074] shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl active:scale-[0.97]"
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

      <div className="mx-auto w-full max-w-6xl px-6 lg:px-8">
        <LandingFooter />
      </div>
    </div>
  );
}
