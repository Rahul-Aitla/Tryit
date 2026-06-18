"use client"

import React from "react"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { ArrowRight, Upload, Sparkles, Download, Check, Cpu, Layers, Zap, BarChart3, Shuffle, Shield } from "lucide-react"
import HeroSection from "@/components/ui/HeroSection"

const features = [
  {
    icon: Cpu,
    title: "AI Consistency Engine",
    desc: "Structured three-block prompting preserves garment structure, texture, and proportions while applying creative direction.",
  },
  {
    icon: Layers,
    title: "Batch Processing",
    desc: "Queue up multiple generations with BullMQ. Process jobs in parallel with real-time status tracking.",
  },
  {
    icon: Shuffle,
    title: "Before / After Comparator",
    desc: "Drag-to-reveal slider and fidelity checklist for pixel-level validation against the source garment.",
  },
  {
    icon: Zap,
    title: "Real-Time Queue",
    desc: "Live dashboard with generation status, render speed metrics, and automatic retry on failure.",
  },
  {
    icon: BarChart3,
    title: "Analytics & Insights",
    desc: "Track fidelity scores, render throughput, and creative consistency across campaigns.",
  },
  {
    icon: Shield,
    title: "Cloud-Native Storage",
    desc: "Assets persisted in Google Cloud Storage with organized folder structure per project.",
  },
]

const steps = [
  {
    number: "01",
    title: "Upload Garment",
    desc: "Drop flat-lay or mannequin shots. ZIP batch upload supported.",
    icon: Upload,
  },
  {
    number: "02",
    title: "Set Direction",
    desc: "Add creative brief and optional reference images for styling guidance.",
    icon: Sparkles,
  },
  {
    number: "03",
    title: "Generate & Export",
    desc: "AI produces photorealistic editorial variations in seconds. Download or publish.",
    icon: Download,
  },
]

const stats = [
  { value: "240+", label: "Assets Generated" },
  { value: "96.8%", label: "Avg Fidelity Score" },
  { value: "<60s", label: "Generation Time" },
  { value: "99.9%", label: "Uptime SLA" },
]

export default function Home() {
  return (
    <div className="min-h-full">
      <HeroSection />

      {/* ─── Social Proof ─── */}
      <section className="border-b border-hairline">
        <div className="max-w-[1280px] mx-auto px-6 py-10">
          <p className="micro-caps text-center text-muted-foreground mb-6">Trusted by leading fashion brands</p>
          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6 opacity-40">
            {["ARCTIC", "NORDICA", "VELVET", "STUDIO 51", "MAISON", "ATELIER"].map((name) => (
              <span key={name} className="text-lg font-display font-semibold tracking-tight text-ink">
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ─── How It Works ─── */}
      <section className="border-b border-hairline">
        <div className="max-w-[1280px] mx-auto px-6 py-24 sm:py-32">
          <div className="max-w-xl mb-16">
            <p className="eyebrow text-muted-foreground mb-4">Workflow</p>
            <h2 className="text-ink">From upload to editorial in three steps</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
            {steps.map((step, i) => (
                <motion.div
                  key={step.number}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.12 }}
                  // @ts-expect-error framer-motion type
                  className="relative"
              >
                <div className="flex items-center gap-4 mb-6">
                  <span className="text-5xl font-display font-normal text-hairline leading-none">{step.number}</span>
                  <div className="h-px flex-1 bg-hairline" />
                </div>
                <step.icon className="h-8 w-8 text-ink mb-6" />
                <h4 className="text-ink mb-3 text-[24px] font-display">{step.title}</h4>
                <p className="text-graphite">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Features ─── */}
      <section className="border-b border-hairline">
        <div className="max-w-[1280px] mx-auto px-6 py-24 sm:py-32">
          <div className="max-w-xl mb-16">
            <p className="eyebrow text-muted-foreground mb-4">Capabilities</p>
            <h2 className="text-ink">Everything you need for creative production</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-hairline">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                // @ts-expect-error framer-motion type
                className="bg-background p-8 sm:p-10"
              >
                <feature.icon className="h-6 w-6 text-ink mb-6" />
                <h4 className="text-ink mb-3 text-[24px] font-display">{feature.title}</h4>
                <p className="text-graphite text-sm">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Showcase ─── */}
      <section className="border-b border-hairline">
        <div className="max-w-[1280px] mx-auto px-6 py-24 sm:py-32">
          <div className="max-w-xl mb-16">
            <p className="eyebrow text-muted-foreground mb-4">Showcase</p>
            <h2 className="text-ink">See the transformation</h2>
          </div>
          <div className="relative overflow-hidden rounded-lg bg-scrim">
            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="relative aspect-[3/4]">
                <Image
                  src="https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&q=80"
                  alt="Original garment"
                  fill
                  className="object-cover"
                />
                <div className="absolute bottom-4 left-4">
                  <span className="micro-caps bg-scrim/80 text-white/70 px-3 py-1.5 rounded-full">
                    Source Garment
                  </span>
                </div>
              </div>
              <div className="relative aspect-[3/4]">
                <Image
                  src="https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=800&q=80"
                  alt="AI generated"
                  fill
                  className="object-cover"
                />
                <div className="absolute bottom-4 left-4">
                  <span className="micro-caps bg-white/20 text-white px-3 py-1.5 rounded-full backdrop-blur-sm">
                    AI Synthesis
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-8 grid grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="relative aspect-[4/5] rounded-md overflow-hidden bg-muted">
                <Image
                  src={`https://images.unsplash.com/photo-${i === 1 ? "1496747611176-378222de51fc" : i === 2 ? "1551028719-00167b79e3c6" : "1599643478518-a784e5dc4c8f"}?w=400&q=80`}
                  alt={`Variation ${i}`}
                  fill
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Stats ─── */}
      <section className="border-b border-hairline">
        <div className="max-w-[1280px] mx-auto px-6 py-20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
            {stats.map((stat) => (
              <div key={stat.label}>
                <div className="text-4xl sm:text-5xl font-display font-normal text-ink tracking-[-1.5px] mb-2">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA Band ─── */}
      <section className="relative overflow-hidden bg-scrim">
        <div className="max-w-[1280px] mx-auto px-6 py-24 sm:py-32 text-center">
          <p className="eyebrow text-white/50 mb-6">Get Started</p>
          <h2 className="text-white text-[40px] sm:text-[56px] leading-[1] tracking-[-1.5px] font-display font-normal max-w-2xl mx-auto mb-8">
            Ready to transform your creative pipeline?
          </h2>
          <Link
            href="/upload"
            className="inline-flex items-center gap-2 bg-white text-ink px-8 py-3.5 rounded-full text-sm font-semibold hover:opacity-90 transition-all"
          >
            Start Building
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="bg-footer text-white">
        <div className="max-w-[1280px] mx-auto px-6 py-16 sm:py-20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
            <div>
              <p className="micro-caps text-stone mb-6">Product</p>
              <ul className="space-y-3">
                {["Upload", "Gallery", "Dashboard", "Pricing"].map((item) => (
                  <li key={item}>
                    <Link href={`/${item.toLowerCase()}`} className="text-sm text-white/70 hover:text-white transition-colors">
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="micro-caps text-stone mb-6">Company</p>
              <ul className="space-y-3">
                {["About", "Blog", "Careers", "Contact"].map((item) => (
                  <li key={item}>
                    <span className="text-sm text-white/70 hover:text-white transition-colors cursor-default">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="micro-caps text-stone mb-6">Resources</p>
              <ul className="space-y-3">
                {["Documentation", "API Reference", "Status", "Changelog"].map((item) => (
                  <li key={item}>
                    <span className="text-sm text-white/70 hover:text-white transition-colors cursor-default">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="micro-caps text-stone mb-6">Legal</p>
              <ul className="space-y-3">
                {["Privacy", "Terms", "Security", "Cookies"].map((item) => (
                  <li key={item}>
                    <span className="text-sm text-white/70 hover:text-white transition-colors cursor-default">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-lg font-display font-semibold tracking-tight">tryit</div>
            <p className="text-sm text-white/40">
              &copy; {new Date().getFullYear()} Tryit. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
