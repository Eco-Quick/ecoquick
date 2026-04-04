import type { Metadata } from "next";
import { Raleway } from "next/font/google";
import "./globals.css";
import { NavProgress } from "@/components/layout/NavProgress";
import { ThemeProvider } from "@/components/ThemeProvider";

const raleway = Raleway({
  subsets: ["latin"],
  variable: "--font-raleway",
});

export const metadata: Metadata = {
  title: "EcoQuick",
  description: "Eco-friendly urban delivery",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
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
      <body className={`${raleway.className} antialiased`}>
        <ThemeProvider>
          <NavProgress />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
