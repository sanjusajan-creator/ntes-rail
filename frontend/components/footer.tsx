import Link from "next/link";
import { ArrowUpRight, Heart } from "lucide-react";
import { Logo } from "./logo";

const COLUMNS = [
  {
    title: "Tools",
    links: [
      { href: "/live", label: "Live running status" },
      { href: "/schedule", label: "Train schedule" },
      { href: "/between", label: "Trains between stations" },
      { href: "/station", label: "Station live board" },
      { href: "/pnr", label: "PNR status" },
      { href: "/api-docs", label: "API reference" },
    ],
  },
  {
    title: "Data",
    links: [
      { href: "https://enquiry.indianrail.gov.in/ntes/", label: "NTES (official)", external: true },
      { href: "https://github.com/x64vbhv/ntes-client", label: "ntes-client", external: true },
      { href: "https://www.indianrailways.gov.in/", label: "Indian Railways", external: true },
    ],
  },
];

export function Footer() {
  return (
    <footer className="relative mt-24 border-t border-white/[0.06]">
      <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <Logo />
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/45">
              A fast, free window into India&apos;s railway network. Live running status,
              schedules, station boards and PNR - powered by public NTES data.
            </p>
            <div className="mt-5 flex items-center gap-2 text-xs text-white/35">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-pulse-ring rounded-full bg-mint/60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-mint" />
              </span>
              Unofficial project · not affiliated with Indian Railways
            </div>
          </div>

          {COLUMNS.map((column) => (
            <div key={column.title}>
              <h3 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/35">
                {column.title}
              </h3>
              <ul className="mt-4 space-y-2.5">
                {column.links.map((link) => (
                  <li key={link.href}>
                    {"external" in link && link.external ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noreferrer"
                        className="group inline-flex items-center gap-1 text-sm text-white/55 transition hover:text-white"
                      >
                        {link.label}
                        <ArrowUpRight className="h-3.5 w-3.5 opacity-50 transition group-hover:opacity-100" />
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        className="text-sm text-white/55 transition hover:text-white"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="divider my-8" />

        <div className="flex flex-col items-start justify-between gap-3 text-xs text-white/35 sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} RailLens. Built for travellers, not for resale.</p>
          <p className="inline-flex items-center gap-1.5">
            Made with <Heart className="h-3.5 w-3.5 text-saffron" /> for Indian Railways
          </p>
        </div>
      </div>
    </footer>
  );
}
