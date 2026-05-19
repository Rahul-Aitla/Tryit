import type { Metadata } from "next";
import { Inter, Syne } from "next/font/google";
import "./globals.css";
import Header from "@/components/ui/Header";

// Inter — body / UI copy
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

// Syne — display headings (bold, editorial feel)
const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  display: "swap",
  weight: ["700", "800"],
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

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${syne.variable} h-full antialiased dark`}
    >
      <body
        className="min-h-full flex flex-col bg-background selection:bg-violet-500/30"
        suppressHydrationWarning
      >
        {/* Ambient background — layered */}
        <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(124,58,237,0.18),transparent)]" />
        <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_40%_40%_at_80%_80%,rgba(79,70,229,0.10),transparent)]" />
        <div className="fixed inset-0 -z-10 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.15] brightness-100 contrast-150" />

        <Header />
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
