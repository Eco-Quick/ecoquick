import type { Metadata } from "next";
import { Raleway, Inter } from "next/font/google";
import "./globals.css";

import { ThemeProvider } from "@/components/ThemeProvider";
import { PageTransition } from "@/components/PageTransition";
import { WhatsAppButton } from "@/components/WhatsAppButton";

const raleway = Raleway({
  subsets: ["latin"],
  variable: "--font-raleway",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.ecoquickdelivery.co.uk"),
  title: {
    default: "EcoQuick — Hyperlocal carbon-neutral delivery",
    template: "%s · EcoQuick",
  },
  description:
    "Fast, eco-friendly parcel delivery across Kingston and surrounding London boroughs. Carbon-neutral by default, powered by electric vehicles.",
  applicationName: "EcoQuick",
  keywords: [
    "parcel delivery",
    "same day delivery",
    "Kingston upon Thames",
    "London delivery",
    "electric vehicle delivery",
    "carbon neutral courier",
    "eco delivery",
  ],
  authors: [{ name: "EcoQuick" }],
  creator: "EcoQuick",
  publisher: "EcoQuick",
  formatDetection: { email: false, telephone: false, address: false },
  openGraph: {
    type: "website",
    locale: "en_GB",
    url: "https://www.ecoquickdelivery.co.uk",
    siteName: "EcoQuick",
    title: "EcoQuick — Hyperlocal carbon-neutral delivery",
    description:
      "Fast, eco-friendly parcel delivery across Kingston and surrounding London boroughs. Carbon-neutral by default, powered by electric vehicles.",
    images: [
      {
        url: "/ecoquick-hero-overlay.png",
        width: 1200,
        height: 630,
        alt: "EcoQuick — carbon-neutral delivery across London",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "EcoQuick — Hyperlocal carbon-neutral delivery",
    description:
      "Fast, eco-friendly parcel delivery across Kingston and surrounding London boroughs.",
    images: ["/ecoquick-hero-overlay.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
        />
        {/* Anti-flicker: set theme class before first paint */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('eq-theme');var d=window.matchMedia('(prefers-color-scheme: dark)').matches;if(t==='dark'||(t===null&&d)){document.documentElement.classList.add('dark')}}catch(e){}})()`,
          }}
        />
      </head>
      <body className={`${raleway.variable} ${inter.variable} font-sans antialiased`}>
        <ThemeProvider>
          <PageTransition>
            {children}
          </PageTransition>
          <WhatsAppButton />
        </ThemeProvider>
      </body>
    </html>
  );
}
