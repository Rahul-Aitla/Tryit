import type { Metadata } from "next";
import { Inter, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/ui/Header";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Tryit — AI Outfit Studio",
  description:
    "Transform flat-lay and mannequin shots into professional editorial photography with AI. Upload garments, set references, generate in seconds.",
  keywords: ["AI fashion", "outfit generation", "editorial photography", "AI model"],
  openGraph: {
    title: "Tryit — AI Outfit Studio",
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
      className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body
        className="min-h-full flex flex-col bg-background selection:bg-ink/10 transition-colors duration-500"
        suppressHydrationWarning
      >
        <ThemeProvider>
          <div className="fixed inset-0 -z-10 bg-background" />
          <Header />
          <main className="flex-1">{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}
