import type { Metadata } from "next";
import { Inter } from "next/font/google";
import GlobalVFX from "@/components/GlobalVFX";
import MagneticCursor from "@/components/MagneticCursor";
import CommandNav from "@/components/CommandNav";
import SystemBoot from "@/components/SystemBoot";
import Spotlight from "@/components/Spotlight";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "RISE",
  description: "A holistic self-improvement platform.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <Spotlight />
        {children}
        <SystemBoot />
        <GlobalVFX />
        <CommandNav />
        <MagneticCursor />
      </body>
    </html>
  );
}
