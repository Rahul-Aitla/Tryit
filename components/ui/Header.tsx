"use client"
import React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Upload, Image as ImageIcon, Plus, User, Sun, Moon } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useTheme } from "@/components/ThemeProvider"

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Upload", href: "/upload", icon: Upload },
  { name: "Gallery", href: "/gallery", icon: ImageIcon },
]

export default function Header() {
  const pathname = usePathname()
  const { theme, toggleTheme } = useTheme()

  return (
    <header className="sticky top-6 z-50 w-full px-6 flex justify-center pointer-events-none">
      <div className="max-w-[1400px] w-full mx-auto flex items-center justify-between px-6 py-3 rounded-full border border-black/5 dark:border-white/5 bg-white/70 dark:bg-black/70 backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,0.04)] pointer-events-auto transition-all duration-500">
        <div className="flex items-center gap-10">
          <Link href="/" className="flex items-center gap-3 group">
            <div 
              className="h-9 w-9 rounded-xl shadow-glow-primary flex items-center justify-center text-white font-bold tracking-tighter text-sm transition-all duration-500 group-hover:scale-105 group-hover:rotate-3"
              style={{ background: 'var(--primary-gradient)' }}
            >
              DC
            </div>
            <div className="hidden sm:block">
              <div className="text-[15px] font-bold tracking-tight text-foreground font-display">DigiChefs</div>
              <div className="text-[10px] tracking-widest text-primary font-medium uppercase opacity-80">Creative Ops Platform</div>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative flex items-center gap-2.5 px-4 py-2 text-[13.5px] font-medium transition-all duration-300 hover:text-foreground ${
                    isActive ? "text-foreground" : "text-muted-foreground/70"
                  }`}
                >
                  <item.icon className={`h-4 w-4 transition-transform duration-300 ${isActive ? "scale-110" : "group-hover:scale-110"}`} />
                  {item.name}
                  {isActive && (
                    <motion.div
                      layoutId="active-nav"
                      className="absolute inset-0 bg-primary/5 border border-primary/10 rounded-full -z-10 shadow-sm"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </Link>
              )
            })}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={toggleTheme}
            className="h-10 w-10 rounded-full flex items-center justify-center border border-black/5 dark:border-white/10 hover:bg-black/[0.03] dark:hover:bg-white/[0.03] transition-all duration-300 group overflow-hidden relative"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={theme}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {theme === "light" ? (
                  <Moon className="h-[18px] w-[18px] text-muted-foreground group-hover:text-primary transition-colors" />
                ) : (
                  <Sun className="h-[18px] w-[18px] text-muted-foreground group-hover:text-primary transition-colors" />
                )}
              </motion.div>
            </AnimatePresence>
          </button>

          <button className="hidden sm:flex items-center gap-2 bg-primary text-primary-foreground hover:opacity-90 px-5 py-2.5 rounded-full text-[13.5px] font-semibold transition-all hover:shadow-glow-primary active:scale-95">
            <Plus className="h-4 w-4" />
            New Project
          </button>
          
          <div className="h-10 w-10 rounded-full bg-black/[0.03] dark:bg-white/[0.03] flex items-center justify-center border border-black/5 dark:border-white/10 cursor-pointer hover:bg-black/[0.08] dark:hover:bg-white/[0.08] transition-all duration-300">
            <User className="h-5 w-5 text-muted-foreground" />
          </div>
        </div>
      </div>
    </header>
  )
}
