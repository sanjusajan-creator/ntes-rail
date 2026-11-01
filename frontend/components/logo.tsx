import Link from "next/link";
import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "relative grid h-9 w-9 place-items-center overflow-hidden rounded-xl",
        "bg-gradient-to-br from-saffron-soft via-saffron to-saffron-deep",
        "shadow-[0_8px_24px_-8px_rgba(255,122,26,0.8)]",
        className,
      )}
      aria-hidden
    >
      <span className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.45),transparent_60%)]" />
      <svg viewBox="0 0 24 24" className="relative h-5 w-5 text-ink-950" fill="none">
        <path
          d="M7 3.75h10a2.25 2.25 0 0 1 2.25 2.25v8.25A3.75 3.75 0 0 1 15.5 18h-7a3.75 3.75 0 0 1-3.75-3.75V6A2.25 2.25 0 0 1 7 3.75Z"
          fill="currentColor"
          fillOpacity="0.92"
        />
        <path
          d="M8.5 7.5h7v3h-7zM8.25 14.25h.01M15.75 14.25h.01M6.5 21l1.5-3M17.5 21 16 18"
          stroke="#05070D"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn("group flex items-center gap-2.5", className)} aria-label="RailLens home">
      <LogoMark className="transition-transform duration-500 group-hover:-rotate-6" />
      <span className="flex items-baseline gap-1.5">
        <span className="font-display text-[19px] font-semibold tracking-tight text-white">
          Rail<span className="text-saffron">Lens</span>
        </span>
        <span className="rounded-full border border-white/10 bg-white/[0.04] px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-white/45">
          beta
        </span>
      </span>
    </Link>
  );
}
