"use client";

import { LandingHeader } from "@/components/layout/LandingHeader";
import { LandingFooter } from "@/components/layout/LandingFooter";
import { HeroSection } from "@/components/landing/Hero";
import { FutureDeliverySection } from "@/components/landing/FutureDeliverySection";
import { WorkflowSection } from "@/components/landing/WorkflowSection";
import { CoverageSection } from "@/components/landing/CoverageSection";

export default function Home() {
  return (
    <div className="landing-shell page-fade min-h-screen bg-white text-zinc-950 dark:bg-[#0d0916] dark:text-[#ede9f8]">

      {/* Full-width header */}
      <div className="landing-content px-6 lg:px-8">
        <LandingHeader />
      </div>

      {/* Constrained main content */}
      <div className="landing-content mx-auto max-w-6xl px-6 lg:px-8">
        <main id="top" className="py-10 sm:py-16 lg:py-20">
          <HeroSection />
          <WorkflowSection />
          <FutureDeliverySection />
          <CoverageSection />

          <LandingFooter />
        </main>
      </div>
    </div>
  );
}
