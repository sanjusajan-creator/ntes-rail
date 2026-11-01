"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Github, Menu, X } from "lucide-react";
import { Logo } from "./logo";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/live", label: "Live status" },
  { href: "/schedule", label: "Schedule" },
  { href: "/between", label: "Trains between" },
  { href: "/station", label: "Station board" },
  { href: "/pnr", label: "PNR" },
];

export function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div
        className={cn(
          "mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-5 transition-all duration-300 sm:px-8",
          scrolled
            ? "mt-2 w-[calc(100%-1.5rem)] rounded-2xl border border-white/10 bg-ink-950/80 px-4 shadow-card backdrop-blur-xl sm:w-[calc(100%-3rem)] sm:px-6"
            : "bg-transparent",
        )}
      >
        <Logo />

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
          {LINKS.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "relative rounded-lg px-3 py-2 text-[13px] font-medium transition",
                  active ? "text-white" : "text-white/55 hover:text-white",
                )}
              >
                {active && (
                  <span className="absolute inset-0 rounded-lg border border-white/10 bg-white/[0.06]" />
                )}
                <span className="relative">{link.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <a
            href="https://github.com/x64vbhv/ntes-client"
            target="_blank"
            rel="noreferrer"
            className="btn-ghost hidden !px-3 !py-2 sm:inline-flex"
            aria-label="Data source on GitHub"
          >
            <Github className="h-4 w-4" />
            <span className="text-xs">Data source</span>
          </a>

          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            className="btn-ghost !p-2.5 lg:hidden"
            aria-expanded={open}
            aria-label="Toggle navigation"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="mx-4 mt-2 rounded-2xl border border-white/10 bg-ink-900/95 p-2 shadow-card backdrop-blur-xl lg:hidden">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "block rounded-xl px-4 py-3 text-sm font-medium",
                pathname === link.href
                  ? "bg-white/[0.06] text-white"
                  : "text-white/60 hover:bg-white/[0.04] hover:text-white",
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
