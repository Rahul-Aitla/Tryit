"use client"
import React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Upload, Image as ImageIcon, Plus, User } from "lucide-react"
import { motion } from "framer-motion"

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Upload", href: "/upload", icon: Upload },
  { name: "Gallery", href: "/gallery", icon: ImageIcon },
]

export default function Header() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-[1400px] mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-sky-500 shadow-[0_0_20px_rgba(124,58,237,0.3)] flex items-center justify-center text-white font-extrabold tracking-tighter text-base transition-all duration-300 group-hover:scale-105 group-hover:shadow-[0_0_25px_rgba(124,58,237,0.5)]">
              DC
            </div>
            <div className="hidden sm:block">
              <div className="text-sm font-extrabold tracking-wider text-foreground font-display uppercase">DIGICHEFS</div>
              <div className="text-[9px] uppercase tracking-[0.25em] text-violet-400 font-bold">Outfit Studio</div>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors hover:text-foreground ${
                    isActive ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.name}
                  {isActive && (
                    <motion.div
                      layoutId="active-nav"
                      className="absolute inset-0 bg-secondary/50 rounded-lg -z-10"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </Link>
              )
            })}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <button className="hidden sm:flex items-center gap-2 bg-foreground text-background hover:bg-foreground/90 px-4 py-2 rounded-full text-sm font-medium transition-all hover:shadow-lg active:scale-95">
            <Plus className="h-4 w-4" />
            New Project
          </button>
          <div className="h-9 w-9 rounded-full bg-secondary flex items-center justify-center border border-border cursor-pointer hover:bg-secondary/80 transition-colors">
            <User className="h-5 w-5 text-muted-foreground" />
          </div>
        </div>
      </div>
    </header>
  )
}
