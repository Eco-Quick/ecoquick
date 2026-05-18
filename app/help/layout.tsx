import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Help & Support",
  description:
    "Answers to common questions about EcoQuick delivery — pricing, coverage areas, tracking, insurance, payments, and how to contact support.",
  openGraph: {
    title: "EcoQuick Help Center",
    description:
      "Answers to common questions about EcoQuick delivery — pricing, coverage areas, tracking, insurance, payments, and support.",
    url: "/help",
  },
  alternates: { canonical: "/help" },
};

export default function HelpLayout({ children }: { children: ReactNode }) {
  return children;
}
