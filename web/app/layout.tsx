import type { Metadata } from "next";
import { Fraunces, Inter_Tight, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { AppStateProvider } from "@/lib/state";

const display = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500"],
});

const body = Inter_Tight({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const mono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "NestNear — Find your London student home",
  description:
    "Aggregated student accommodation, scored by commute, cost, and amenities to your campus.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${body.variable} ${mono.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <AppStateProvider>{children}</AppStateProvider>
      </body>
    </html>
  );
}
