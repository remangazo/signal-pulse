"use client"

import { Menu, X } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"

const navLinks = [
  { label: "How it works", href: "#how-it-works" },
  { label: "Features", href: "#features" },
  { label: "Pricing", href: "#pricing" },
]

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { token, logout } = useAuth()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <>
      <nav
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
          scrolled
            ? "border-b border-border bg-deep/95 backdrop-blur-md"
            : "bg-transparent"
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
              <div className="w-8 h-8 rounded-lg bg-signal/20 border border-signal/30 flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="oklch(68% 0.18 75)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                </svg>
              </div>
              <span className="text-lg font-semibold tracking-tight">SignalPulse</span>
            </Link>

            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="px-3 py-2 text-sm text-muted hover:text-foreground rounded-md transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </div>

            <div className="hidden md:flex items-center gap-3">
              {token ? (
                <>
                  <Link href="/dashboard" className="text-sm text-muted hover:text-foreground transition-colors px-3 py-2">
                    Dashboard
                  </Link>
                  <Button variant="ghost" size="sm" onClick={logout}>Log out</Button>
                </>
              ) : (
                <>
                  <Link href="/auth/login">
                    <Button variant="secondary" size="sm">Sign In</Button>
                  </Link>
                  <Link href="/auth/register">
                    <Button variant="primary" size="sm">Get Started</Button>
                  </Link>
                </>
              )}
            </div>

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 text-muted hover:text-foreground"
            >
              {mobileOpen ? <X size="20" /> : <Menu size="20" />}
            </button>
          </div>
        </div>
      </nav>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-deep/80 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="relative mt-16 mx-4 rounded-xl border border-border bg-surface p-6 shadow-2xl">
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="px-4 py-3 text-muted hover:text-foreground rounded-md hover:bg-surface-hover transition-colors"
                >
                  {link.label}
                </a>
              ))}
              <hr className="my-3 border-border" />
              {token ? (
                <>
                  <Link href="/dashboard" onClick={() => setMobileOpen(false)} className="px-4 py-3 text-muted hover:text-foreground rounded-md hover:bg-surface-hover transition-colors">
                    Dashboard
                  </Link>
                  <Button variant="ghost" size="md" className="w-full" onClick={() => { logout(); setMobileOpen(false) }}>Log out</Button>
                </>
              ) : (
                <>
                  <Link href="/auth/login" onClick={() => setMobileOpen(false)} className="w-full">
                    <Button variant="secondary" size="md" className="w-full">Sign In</Button>
                  </Link>
                  <Link href="/auth/register" onClick={() => setMobileOpen(false)} className="w-full">
                    <Button variant="primary" size="md" className="w-full">Get Started</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
