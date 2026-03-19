"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { FileText } from "lucide-react"
import { usePathname } from "next/navigation"
import clsx from "clsx"

export default function Header() {
  const pathname = usePathname()

  const navItems = [
    { name: "Pricing", href: "/pricing" },
    { name: "About", href: "/about" },
    { name: "Privacy", href: "/privacy" },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">

          {/* LEFT */}
          <div className="flex items-center gap-10">
            {/* LOGO */}
            <Link
              href="/"
              className="flex items-center gap-2 font-semibold text-foreground group"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary transition-transform group-hover:scale-105">
                <FileText className="h-4 w-4 text-white" />
              </div>
              <span className="tracking-tight text-base">Formyxa</span>
            </Link>

            {/* NAV */}
            <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={clsx(
                    "relative transition-colors",
                    pathname === item.href
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {item.name}

                  {/* underline animation */}
                  <span
                    className={clsx(
                      "absolute left-0 -bottom-1 h-[2px] w-full bg-primary transition-transform duration-300 origin-left",
                      pathname === item.href
                        ? "scale-x-100"
                        : "scale-x-0 group-hover:scale-x-100"
                    )}
                  />
                </Link>
              ))}
            </nav>
          </div>

          {/* RIGHT */}
          <div className="flex items-center gap-5">
            {/* Secondary CTA */}
            <Link
              href="/login"
              className="hidden sm:block text-sm text-muted-foreground hover:text-foreground transition"
            >
              Login
            </Link>

            {/* Primary CTA */}
            <Button
              size="sm"
              className="h-9 px-5 text-sm font-semibold shadow-sm hover:shadow-md transition-all"
              asChild
            >
              <Link href="/handwritten-to-doc/upload">
                Get Started →
              </Link>
            </Button>
          </div>

        </div>
      </div>
    </header>
  )
}