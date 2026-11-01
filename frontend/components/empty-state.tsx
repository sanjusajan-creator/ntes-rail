import type { LucideIcon } from "lucide-react";

export function EmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon?: LucideIcon;
  title: string;
  description?: string;
}) {
  return (
    <div className="glass flex flex-col items-center rounded-2xl px-6 py-14 text-center">
      {Icon ? (
        <div className="mb-4 grid h-12 w-12 place-items-center rounded-2xl border border-white/10 bg-white/[0.03] text-white/40">
          <Icon className="h-5 w-5" />
        </div>
      ) : null}
      <h3 className="font-display text-base font-semibold text-white">{title}</h3>
      {description ? (
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-white/45">{description}</p>
      ) : null}
    </div>
  );
}

export function Spinner({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={`animate-spin ${className}`} viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
      <path
        className="opacity-90"
        d="M22 12a10 10 0 0 0-10-10"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}
