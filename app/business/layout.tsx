import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Business",
  description:
    "Bulk and recurring delivery for businesses across London. Volume pricing, dedicated support, consolidated invoicing — carbon-neutral by default.",
  openGraph: {
    title: "EcoQuick for Business",
    description:
      "Bulk and recurring delivery for businesses across London. Volume pricing, dedicated support, carbon-neutral by default.",
    url: "/business",
  },
  alternates: { canonical: "/business" },
};

export default function BusinessLayout({ children }: { children: ReactNode }) {
  return children;
}
