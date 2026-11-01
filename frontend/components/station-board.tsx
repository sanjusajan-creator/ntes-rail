"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, Clock3, Filter, Radio, Search, TrainFront } from "lucide-react";
import type { StationBoardTrain } from "@/lib/types";
import { cn, delayClasses, delayTone, formatDelay } from "@/lib/utils";

export function StationBoard({
  trains,
  stationCode,
}: {
  trains: StationBoardTrain[];
  stationCode: string;
}) {
  const [query, setQuery] = useState("");
  const [onlyDelayed, setOnlyDelayed] = useState(false);
  const [onlyCancelled, setOnlyCancelled] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return trains.filter((train) => {
      if (onlyDelayed) {
        const delay = Math.max(train.delayArrival ?? 0, train.delayDeparture ?? 0);
        if (delay <= 0) return false;
      }
      if (onlyCancelled && !train.cancelled) return false;
      if (!q) return true;
      return (
        train.number.toLowerCase().includes(q) ||
        train.name.toLowerCase().includes(q) ||
        train.source.code.toLowerCase().includes(q) ||
        train.destination.code.toLowerCase().includes(q)
      );
    });
  }, [trains, query, onlyDelayed, onlyCancelled]);

  return (
    <div className="glass overflow-hidden rounded-2xl">
      <div className="flex flex-col gap-3 border-b border-white/[0.06] px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div>
          <h3 className="font-display text-sm font-semibold text-white">
            Trains at {stationCode}
          </h3>
          <p className="mt-0.5 text-[11px] text-white/35">
            {filtered.length} of {trains.length} trains
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/30" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Filter train…"
              className="h-9 w-44 rounded-lg border border-white/10 bg-white/[0.04] pl-8 pr-3 text-xs text-white placeholder:text-white/30 outline-none transition focus:border-saffron/50"
            />
          </div>
          <button
            type="button"
            onClick={() => setOnlyDelayed((value) => !value)}
            className={cn(
              "h-9 rounded-lg border px-3 text-[11px] font-medium transition",
              onlyDelayed
                ? "border-saffron/40 bg-saffron/10 text-saffron-soft"
                : "border-white/10 bg-white/[0.03] text-white/45 hover:text-white/75",
            )}
          >
            Delayed only
          </button>
          <button
            type="button"
            onClick={() => setOnlyCancelled((value) => !value)}
            className={cn(
              "h-9 rounded-lg border px-3 text-[11px] font-medium transition",
              onlyCancelled
                ? "border-danger/40 bg-danger/10 text-danger"
                : "border-white/10 bg-white/[0.03] text-white/45 hover:text-white/75",
            )}
          >
            Cancelled
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-2 px-6 py-14 text-center">
          <Filter className="h-5 w-5 text-white/25" />
          <p className="text-sm font-medium text-white/70">No trains match these filters</p>
          <p className="text-xs text-white/35">Clear the filter or widen the time window.</p>
        </div>
      ) : (
        <ul className="divide-y divide-white/[0.055]">
          {filtered.map((train) => {
            const delay = Math.max(train.delayArrival ?? 0, train.delayDeparture ?? 0);
            const tone = delayTone(delay);
            return (
              <li
                key={`${train.number}-${train.startDate ?? ""}-${train.scheduledArrival ?? ""}-${train.scheduledDeparture ?? ""}`}
                className="group px-4 py-3.5 transition-colors hover:bg-white/[0.025] sm:px-5"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex min-w-0 items-start gap-4">
                    <div className="w-[92px] shrink-0">
                      {train.scheduledArrival ? (
                        <div className="flex items-baseline justify-between gap-1">
                          <span className="text-[8.5px] font-semibold uppercase tracking-wider text-white/25">
                            Arr
                          </span>
                          <span className="font-mono text-[12.5px] font-semibold text-white">
                            {train.scheduledArrival.split(" ")[0]}
                          </span>
                        </div>
                      ) : null}
                      {train.scheduledDeparture ? (
                        <div className="mt-0.5 flex items-baseline justify-between gap-1">
                          <span className="text-[8.5px] font-semibold uppercase tracking-wider text-white/25">
                            Dep
                          </span>
                          <span className="font-mono text-[12.5px] font-semibold text-white/75">
                            {train.scheduledDeparture.split(" ")[0]}
                          </span>
                        </div>
                      ) : null}
                      {train.expectedArrival &&
                      train.scheduledArrival &&
                      train.expectedArrival !== train.scheduledArrival ? (
                        <div className="mt-1 flex items-baseline justify-between gap-1">
                          <span className="text-[8.5px] uppercase tracking-wider text-saffron-soft/60">
                            Eta
                          </span>
                          <span className="font-mono text-[10px] font-semibold text-saffron-soft">
                            {train.expectedArrival.split(" ")[0]}
                          </span>
                        </div>
                      ) : null}
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <TrainFront className="h-3.5 w-3.5 shrink-0 text-saffron/70" />
                        <span className="font-mono text-[11px] text-white/40">{train.number}</span>
                        <span className="truncate text-[13px] font-semibold text-white/90">
                          {train.name}
                        </span>
                        <span className="chip !px-2 !py-0.5 !text-[9px]">{train.typeLabel}</span>
                        {train.cancelled && (
                          <span className="rounded-full border border-danger/30 bg-danger/10 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-danger">
                            Cancelled
                          </span>
                        )}
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-white/35">
                        <span className="font-mono">{train.source.code}</span>
                        <ArrowRight className="h-2.5 w-2.5" />
                        <span className="font-mono">{train.destination.code}</span>
                        <span className="text-white/20">·</span>
                        <span className="truncate">{train.source.name}</span>
                        <ArrowRight className="h-2.5 w-2.5" />
                        <span className="truncate">{train.destination.name}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-2 pl-[108px] sm:pl-0">
                    {train.platform ? (
                      <span className="chip font-mono">PF {train.platform}</span>
                    ) : null}
                    {delay > 0 ? (
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold",
                          delayClasses(tone),
                        )}
                      >
                        <Clock3 className="h-2.5 w-2.5" />
                        {formatDelay(delay)}
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full border border-mint/25 bg-mint/[0.08] px-2 py-0.5 text-[10px] font-semibold text-mint">
                        On time
                      </span>
                    )}
                    <Link
                      href={`/live?train=${train.number}`}
                      className="btn-ghost !px-2.5 !py-1.5 !text-[11px]"
                      aria-label={`Live status of ${train.number}`}
                    >
                      <Radio className="h-3 w-3 text-mint" />
                    </Link>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
