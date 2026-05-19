import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans, Outfit, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/ui/Header";

// Inter — UI / Body
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

// Plus Jakarta Sans — Hero headings (modern, clean)
const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  display: "swap",
  weight: ["600", "700", "800"],
});

// Outfit — Dashboard headings / Satoshi alternative
const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
  weight: ["500", "600"],
});

// JetBrains Mono — Numeric stats
const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "DigiChefs — AI Outfit Studio",
  description:
    "Transform flat-lay and mannequin shots into professional editorial photography with AI. Upload garments, set references, generate in seconds.",
  keywords: ["AI fashion", "outfit generation", "editorial photography", "AI model"],
  openGraph: {
    title: "DigiChefs — AI Outfit Studio",
    description: "AI-powered fashion image generation for e-commerce brands.",
    type: "website",
  },
};

import { ThemeProvider } from "@/components/ThemeProvider";

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${plusJakartaSans.variable} ${outfit.variable} ${jetbrainsMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body
        className="min-h-full flex flex-col bg-background selection:bg-violet-500/30 transition-colors duration-500"
        suppressHydrationWarning
      >
        <ThemeProvider>
          {/* Ambient background — 2026 Premium Layered */}
          <div className="fixed inset-0 -z-10 bg-background" />
          
          {/* Light Theme Gradients */}
          <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_50%_-20%,rgba(109,94,245,0.05),transparent_70%)] dark:hidden" />
          <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_80%_80%,rgba(79,140,255,0.03),transparent_50%)] dark:hidden" />
          
          {/* Dark Theme Gradients */}
          <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_50%_-20%,rgba(124,92,255,0.08),transparent_70%)] hidden dark:block" />
          <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_80%_80%,rgba(56,189,248,0.05),transparent_50%)] hidden dark:block" />
          
          {/* Noise overlay */}
          <div className="fixed inset-0 -z-10 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.02] dark:opacity-[0.03] mix-blend-overlay pointer-events-none" />

          <Header />
          <main className="flex-1">{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}
