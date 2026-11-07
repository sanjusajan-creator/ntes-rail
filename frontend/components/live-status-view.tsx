"use client";

import {
  ArrowRight,
  Clock3,
  Gauge,
  Navigation,
  Radio,
  Route,
  TriangleAlert,
} from "lucide-react";
import type { LiveResponse } from "@/lib/types";
import { cn, delayClasses, delayTone, formatDelay } from "@/lib/utils";

function Stat({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: typeof Clock3;
  label: string;
  value: string;
  accent?: "saffron" | "mint" | "electric";
}) {
  const tone =
    accent === "saffron"
      ? "text-saffron"
      : accent === "mint"
        ? "text-mint"
        : accent === "electric"
          ? "text-electric-soft"
          : "text-white/60";
  return (
    <div className="rounded-xl border border-white/[0.07] bg-white/[0.025] px-3.5 py-3">
      <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/30">
        <Icon className={cn("h-3 w-3", tone)} />
        {label}
      </div>
      <div className="mt-1.5 truncate text-[13px] font-semibold text-white/85">{value}</div>
    </div>
  );
}

export function LiveStatusView({ data }: { data: LiveResponse }) {
  const { train, run } = data;
  const tone = delayTone(run.delayMinutes ?? 0);
  const progress = Math.min(100, Math.max(0, run.progressPercent ?? 0));

  return (
    <div className="space-y-4">
      <div className="glass relative overflow-hidden rounded-2xl">
        <div
          className="pointer-events-none absolute inset-0 opacity-60"
          style={{
            background:
              "radial-gradient(600px 200px at 8% 0%, rgba(255,122,26,0.12), transparent 70%), radial-gradient(500px 200px at 92% 20%, rgba(91,140,255,0.12), transparent 70%)",
          }}
        />

        <div className="relative border-b border-white/[0.06] p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-lg border border-white/10 bg-white/[0.05] px-2 py-1 font-mono text-xs font-semibold text-white/70">
                  {train.number}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-mint/25 bg-mint/[0.08] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-mint">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full animate-pulse-ring rounded-full bg-mint/70" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-mint" />
                  </span>
                  Live
                </span>
                {run.arrivedAtDestination && (
                  <span className="chip !text-[10px]">Journey complete</span>
                )}
              </div>

              <h2 className="mt-2.5 font-display text-xl font-semibold tracking-tight text-white sm:text-2xl">
                {train.name}
              </h2>

              <div className="mt-3 flex flex-wrap items-center gap-2 text-[13px]">
                <span className="inline-flex items-center gap-1.5 text-white/75">
                  <span className="font-mono text-[11px] text-white/40">{train.source.code}</span>
                  <span className="max-w-[160px] truncate">{train.source.name}</span>
                </span>
                <ArrowRight className="h-3.5 w-3.5 text-saffron/70" />
                <span className="inline-flex items-center gap-1.5 text-white/75">
                  <span className="font-mono text-[11px] text-white/40">
                    {train.destination.code}
                  </span>
                  <span className="max-w-[160px] truncate">{train.destination.name}</span>
                </span>
              </div>
            </div>

            <div className="flex flex-col items-start gap-2 sm:items-end">
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-sm font-semibold",
                  delayClasses(tone),
                )}
              >
                <Clock3 className="h-4 w-4" />
                {run.delayMinutes === null || run.delayMinutes === undefined
                  ? "Delay unknown"
                  : formatDelay(run.delayMinutes)}
              </span>
              <span className="text-[11px] text-white/35">
                Updated {run.lastUpdate || "—"}
              </span>
            </div>
          </div>

          {run.statusText ? (
            <p className="mt-4 rounded-xl border border-white/[0.07] bg-ink-950/40 px-3.5 py-2.5 text-[12.5px] leading-relaxed text-white/60">
              <Radio className="mr-1.5 inline h-3.5 w-3.5 text-saffron/80" />
              {run.statusText}
            </p>
          ) : null}

          {run.alert ? (
            <p className="mt-3 flex items-start gap-2 rounded-xl border border-saffron/25 bg-saffron/[0.07] px-3.5 py-2.5 text-[12.5px] leading-relaxed text-saffron-soft">
              <TriangleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              {run.alert}
            </p>
          ) : null}
        </div>

        {/* Progress */}
        <div className="relative px-5 py-5 sm:px-6">
          <div className="mb-2 flex items-center justify-between text-[10px] uppercase tracking-[0.14em] text-white/30">
            <span>{train.source.code}</span>
            <span>{progress.toFixed(0)}% of route</span>
            <span>{train.destination.code}</span>
          </div>
          <div className="relative h-2.5 overflow-hidden rounded-full bg-white/[0.06]">
            <div
              className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-saffron-soft via-saffron to-danger transition-[width] duration-700"
              style={{ width: `${progress}%` }}
            />
            <div
              className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 transition-[left] duration-700"
              style={{ left: `clamp(10px, ${progress}%, calc(100% - 10px))` }}
            >
              <span className="grid h-6 w-6 place-items-center rounded-full border border-saffron/40 bg-ink-950 text-saffron shadow-[0_0_18px_rgba(255,122,26,0.55)]">
                <Navigation className="h-3 w-3" />
              </span>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            <Stat
              icon={Gauge}
              label="Distance"
              value={`${run.distanceDone} / ${run.distanceTotal} km`}
              accent="electric"
            />
            <Stat
              icon={Route}
              label="Stations"
              value={`${Math.max(run.currentSeq ?? 0, 0)} of ${run.totalStations ?? 0}`}
              accent="mint"
            />
            <Stat
              icon={Navigation}
              label="Last station"
              value={run.lastStation ? `${run.lastStation.name}` : "—"}
              accent="saffron"
            />
            <Stat
              icon={Clock3}
              label="Next halt"
              value={run.arrivedAtDestination ? "Arrived" : run.nextStation?.name || "—"}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
