"use client"

import Link from "next/link"
import { LayoutGroup, motion } from "framer-motion"
import { ArrowRight } from "lucide-react"

import Floating, { FloatingElement } from "@/components/ui/parallax-floating"
import { TextRotate } from "@/components/ui/text-rotate"

const heroImages = [
  {
    url: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&q=80",
    title: "Original Garment",
  },
  {
    url: "https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=600&q=80",
    title: "On Model",
  },
  {
    url: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=600&q=80",
    title: "Editorial",
  },
  {
    url: "https://images.unsplash.com/photo-1496747611176-378222de51fc?w=600&q=80",
    title: "Lifestyle",
  },
  {
    url: "https://images.unsplash.com/photo-1551028719-00167b79e3c6?w=600&q=80",
    title: "Detail",
  },
  {
    url: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&q=80",
    title: "Collection",
  },
]

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-scrim min-h-screen flex items-center">
      <Floating sensitivity={-1} className="overflow-hidden">
        <FloatingElement depth={0.5} className="top-[12%] left-[4%] md:top-[18%] md:left-[6%]">
          <img
            src={heroImages[0].url}
            alt={heroImages[0].title}
            className="w-20 h-28 md:w-28 md:h-36 object-cover hover:scale-105 duration-200 cursor-pointer transition-transform -rotate-6 shadow-2xl rounded-xl"
          />
        </FloatingElement>

        <FloatingElement depth={1} className="top-[4%] left-[22%] md:top-[8%] md:left-[28%]">
          <img
            src={heroImages[1].url}
            alt={heroImages[1].title}
            className="w-28 h-36 md:w-36 md:h-48 object-cover hover:scale-105 duration-200 cursor-pointer transition-transform -rotate-3 shadow-2xl rounded-xl"
          />
        </FloatingElement>

        <FloatingElement depth={1} className="top-[2%] left-[70%] md:top-[4%] md:left-[72%]">
          <img
            src={heroImages[2].url}
            alt={heroImages[2].title}
            className="w-24 h-20 md:w-32 md:h-28 object-cover hover:scale-105 duration-200 cursor-pointer transition-transform rotate-2 shadow-2xl rounded-xl"
          />
        </FloatingElement>

        <FloatingElement depth={0.5} className="top-[6%] left-[88%] md:top-[10%] md:left-[86%]">
          <img
            src={heroImages[3].url}
            alt={heroImages[3].title}
            className="w-20 h-28 md:w-24 md:h-36 object-cover hover:scale-105 duration-200 cursor-pointer transition-transform rotate-6 shadow-2xl rounded-xl"
          />
        </FloatingElement>

        <FloatingElement depth={2} className="top-[70%] left-[4%] md:top-[72%] md:left-[6%]">
          <img
            src={heroImages[4].url}
            alt={heroImages[4].title}
            className="w-28 h-28 md:w-36 md:h-36 object-cover hover:scale-105 duration-200 cursor-pointer transition-transform -rotate-8 shadow-2xl rounded-xl"
          />
        </FloatingElement>

        <FloatingElement depth={1.5} className="top-[75%] left-[78%] md:top-[74%] md:left-[80%]">
          <img
            src={heroImages[5].url}
            alt={heroImages[5].title}
            className="w-32 h-44 md:w-40 md:h-56 object-cover hover:scale-105 duration-200 cursor-pointer transition-transform rotate-4 shadow-2xl rounded-xl"
          />
        </FloatingElement>
      </Floating>

      <div className="absolute inset-0 bg-gradient-to-t from-scrim via-scrim/40 to-transparent pointer-events-none" />

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className="relative z-10 max-w-[1280px] mx-auto px-6 w-full">
        <div className="max-w-3xl mx-auto text-center">
          <p
            className="eyebrow text-white/70 mb-6"
            style={{ animation: "fadeInUp 0.4s ease-out 0.2s both" }}
          >
            E-Commerce Catalog Production
          </p>

          <h1
            className="text-white text-[40px] sm:text-[56px] md:text-[72px] leading-[1] tracking-[-2px] font-display font-normal mb-6"
            style={{ animation: "fadeInUp 0.4s ease-out 0.3s both" }}
          >
            <span>Turn garments into </span>
            <LayoutGroup>
              <motion.span
                layout
                {...({ className: "inline-flex" } as any)}
              >
                <TextRotate
                  texts={[
                    "photorealistic",
                    "on-model",
                    "catalog-ready",
                    "studio-quality",
                    "editorial",
                    "consistent",
                  ]}
                  mainClassName="overflow-hidden text-white"
                  staggerDuration={0.03}
                  staggerFrom="last"
                  rotationInterval={3000}
                  transition={{ type: "spring", damping: 30, stiffness: 400 }}
                />
              </motion.span>
            </LayoutGroup>
          </h1>

          <p
            className="text-white/60 text-lg sm:text-xl max-w-xl mx-auto leading-relaxed mb-10"
            style={{ animation: "fadeInUp 0.4s ease-out 0.4s both" }}
          >
            Upload flat-lay or mannequin shots. AI generates professional
            e-commerce imagery at scale with consistent brand styling.
          </p>

          <div
            className="flex items-center justify-center gap-4"
            style={{ animation: "fadeInUp 0.4s ease-out 0.5s both" }}
          >
            <Link
              href="/upload"
              className="inline-flex items-center gap-2 bg-white text-ink px-7 py-3 rounded-full text-sm font-semibold hover:opacity-90 transition-all"
            >
              Start Creating
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/gallery"
              className="inline-flex items-center gap-2 border border-white/30 text-white px-7 py-3 rounded-full text-sm font-semibold hover:bg-white/10 transition-all"
            >
              View Gallery
            </Link>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent pointer-events-none" />
    </section>
  )
}
