"use client";

import Link from "next/link";
import { ArrowRight, Clock3, Radio, TrainFront } from "lucide-react";
import type { BetweenTrain } from "@/lib/types";

function daysShort(days?: string): string {
  if (!days) return "—";
  const normalized = days.trim();
  if (/daily/i.test(normalized)) return "Daily";
  return normalized
    .split(",")
    .map((day) => day.trim().slice(0, 3))
    .filter(Boolean)
    .join(" · ");
}

export function TrainList({ trains }: { trains: BetweenTrain[] }) {
  return (
    <div className="space-y-3">
      {trains.map((train) => (
        <article
          key={train.number}
          className="group glass relative overflow-hidden rounded-2xl p-4 transition-colors hover:border-white/20 sm:p-5"
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex min-w-0 flex-1 items-center gap-4 sm:gap-6">
              <div className="flex items-center gap-3 sm:gap-5">
                <div className="text-left">
                  <div className="font-mono text-lg font-semibold text-white sm:text-xl">
                    {train.departureTime || "—"}
                  </div>
                  <div className="mt-0.5 font-mono text-[10px] uppercase tracking-wider text-white/35">
                    {train.boarding.code}
                  </div>
                </div>

                <div className="flex w-16 flex-col items-center sm:w-24">
                  <span className="text-[10px] font-medium text-white/35">
                    {train.travelTime || ""}
                  </span>
                  <div className="my-1 flex w-full items-center gap-1">
                    <span className="h-1 w-1 rounded-full bg-white/30" />
                    <span className="h-px flex-1 bg-white/15" />
                    <ArrowRight className="h-3 w-3 text-saffron/70" />
                  </div>
                  <span className="text-[9px] uppercase tracking-wider text-white/25">dur</span>
                </div>

                <div className="text-left">
                  <div className="font-mono text-lg font-semibold text-white sm:text-xl">
                    {train.arrivalTime || "—"}
                  </div>
                  <div className="mt-0.5 font-mono text-[10px] uppercase tracking-wider text-white/35">
                    {train.alighting.code}
                  </div>
                </div>
              </div>

              <div className="hidden h-14 w-px bg-white/[0.07] sm:block" />

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="grid h-7 w-7 place-items-center rounded-lg border border-saffron/25 bg-saffron/[0.08] text-saffron">
                    <TrainFront className="h-3.5 w-3.5" />
                  </span>
                  <span className="font-mono text-xs text-white/40">{train.number}</span>
                  <h3 className="truncate text-sm font-semibold text-white">{train.name}</h3>
                  <span className="chip !px-2 !py-0.5 !text-[9.5px]">{train.typeLabel}</span>
                </div>
                <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-white/35">
                  <span className="inline-flex items-center gap-1">
                    <Clock3 className="h-3 w-3" /> {daysShort(train.daysOfRun)}
                  </span>
                  {train.classes ? <span>Classes: {train.classes}</span> : null}
                  <span className="hidden sm:inline">
                    {train.source.code} → {train.destination.code}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <Link
                href={`/live?train=${train.number}`}
                className="btn-ghost !py-2 !text-xs"
                aria-label={`Check live status for ${train.number}`}
              >
                <Radio className="h-3.5 w-3.5 text-mint" />
                Live status
              </Link>
              <Link
                href={`/schedule?train=${train.number}`}
                className="btn-ghost !py-2 !text-xs"
              >
                Schedule
              </Link>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
