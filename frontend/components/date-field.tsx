"use client";

import { CalendarDays } from "lucide-react";
import { addDaysISO, cn, formatDateHuman, todayISO } from "@/lib/utils";

interface DateFieldProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  hint?: string;
  className?: string;
  /** Hide the Today/Yesterday/Tomorrow quick chips */
  compact?: boolean;
}

export function DateField({
  value,
  onChange,
  label,
  hint,
  className,
  compact = false,
}: DateFieldProps) {
  const today = todayISO();
  const quickOptions = [
    { label: "Yesterday", value: addDaysISO(today, -1) },
    { label: "Today", value: today },
    { label: "Tomorrow", value: addDaysISO(today, 1) },
  ];

  return (
    <div className={cn("w-full", className)}>
      {label ? (
        <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.16em] text-white/40">
          {label}
        </label>
      ) : null}

      <div className="relative">
        <CalendarDays className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
        <input
          type="date"
          value={value}
          max={addDaysISO(today, 30)}
          min={addDaysISO(today, -7)}
          onChange={(event) => onChange(event.target.value)}
          className="input-base pl-10 [color-scheme:dark]"
        />
      </div>

      {!compact && (
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          {quickOptions.map((option) => {
            const active = value === option.value;
            return (
              <button
                key={option.label}
                type="button"
                onClick={() => onChange(option.value)}
                className={cn(
                  "rounded-full border px-2.5 py-1 text-[11px] font-medium transition",
                  active
                    ? "border-saffron/40 bg-saffron/10 text-saffron-soft"
                    : "border-white/10 bg-white/[0.03] text-white/45 hover:border-white/20 hover:text-white/75",
                )}
              >
                {option.label}
              </button>
            );
          })}
          {value && value !== today && (
            <span className="ml-1 text-[11px] text-white/35">{formatDateHuman(value)}</span>
          )}
        </div>
      )}

      {hint ? <p className="mt-2 text-[11px] leading-relaxed text-white/35">{hint}</p> : null}
    </div>
  );
}
