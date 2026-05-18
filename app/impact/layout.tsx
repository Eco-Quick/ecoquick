import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Your Impact",
  description:
    "Track the carbon you've saved by choosing EcoQuick over traditional courier services. Every delivery is electric, carbon-neutral, and measured.",
  robots: { index: false, follow: false },
};

export default function ImpactLayout({ children }: { children: ReactNode }) {
  return children;
}
