"use client"
import React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Upload, Image as ImageIcon, Plus, User, Sun, Moon, Menu, X } from "lucide-react"
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
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)

  return (
    <>
      <header className="sticky top-0 z-50 w-full bg-background border-b border-hairline">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between h-16 px-6">
          <div className="flex items-center gap-10">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="text-ink font-bold tracking-tight text-lg font-display">
                tryit
              </div>
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`relative flex items-center gap-2 px-4 py-2 text-sm font-semibold transition-all duration-300 ${
                      isActive ? "text-ink" : "text-muted-foreground hover:text-ink"
                    }`}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.name}
                    {isActive && (
                      <div className="absolute inset-x-4 bottom-0 h-0.5 bg-ink rounded-full" />
                    )}
                  </Link>
                )
              })}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="h-10 w-10 rounded-full flex items-center justify-center hover:bg-muted transition-all duration-300"
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
                    <Moon className="h-[18px] w-[18px] text-muted-foreground group-hover:text-ink transition-colors" />
                  ) : (
                    <Sun className="h-[18px] w-[18px] text-muted-foreground group-hover:text-ink transition-colors" />
                  )}
                </motion.div>
              </AnimatePresence>
            </button>

            <Link
              href="/upload"
              className="hidden sm:flex items-center gap-2 bg-primary text-primary-foreground hover:opacity-90 px-5 py-2.5 rounded-full text-sm font-semibold transition-all active:scale-95"
            >
              <Plus className="h-4 w-4" />
              New Project
            </Link>

            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden h-10 w-10 rounded-full flex items-center justify-center hover:bg-muted transition-all"
            >
              <Menu className="h-5 w-5 text-muted-foreground" />
            </button>

            <div className="hidden sm:flex h-10 w-10 rounded-full bg-muted items-center justify-center cursor-pointer hover:bg-muted/80 transition-all duration-300">
              <User className="h-5 w-5 text-muted-foreground" />
            </div>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              // @ts-expect-error framer-motion type
              className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm md:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              // @ts-expect-error framer-motion type
              className="fixed top-0 right-0 bottom-0 z-[110] w-[280px] bg-background border-l border-hairline shadow-2xl md:hidden flex flex-col"
            >
              <div className="flex items-center justify-between px-6 py-5 border-b border-hairline">
                <span className="text-sm font-bold tracking-tight font-display">tryit</span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="h-9 w-9 rounded-full flex items-center justify-center hover:bg-muted transition-colors"
                >
                  <X className="h-5 w-5 text-muted-foreground" />
                </button>
              </div>
              <nav className="flex-1 px-4 py-6 space-y-1">
                {navItems.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3.5 px-5 py-4 rounded-lg text-sm font-semibold transition-all ${
                        isActive
                          ? "bg-ink text-background"
                          : "text-muted-foreground hover:bg-muted hover:text-ink"
                      }`}
                    >
                      <item.icon className={`h-5 w-5 ${isActive ? "text-background" : ""}`} />
                      {item.name}
                    </Link>
                  )
                })}
              </nav>
              <div className="px-4 pb-8 border-t border-hairline pt-6">
                <Link
                  href="/upload"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground px-5 py-3.5 rounded-full text-sm font-semibold transition-all active:scale-95"
                >
                  <Plus className="h-4 w-4" />
                  New Project
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
