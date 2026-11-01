"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, ChevronUp, MapPin, TrainFront } from "lucide-react";
import type { LiveStation, ScheduleStation } from "@/lib/types";
import { cn } from "@/lib/utils";

type AnyStation = ScheduleStation | LiveStation;

function isLive(station: AnyStation): station is LiveStation {
  return "state" in station;
}

function splitTime(value?: string | null): { time: string; date: string } {
  if (!value) return { time: "—", date: "" };
  const [time, date] = value.split(" ");
  return { time: time || "—", date: date || "" };
}

function DelayBadge({ minutes }: { minutes?: number | null }) {
  if (minutes === null || minutes === undefined) return null;
  if (minutes <= 0) {
    return <span className="text-[11px] font-medium text-mint">On time</span>;
  }
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-1.5 py-0.5 text-[10px] font-semibold",
        minutes > 15
          ? "border-danger/30 bg-danger/10 text-danger"
          : "border-saffron-soft/30 bg-saffron-soft/10 text-saffron-soft",
      )}
    >
      +{minutes}m
    </span>
  );
}

function TimeCell({
  arrival,
  departure,
  delayArrival,
  delayDeparture,
  isLiveRow,
}: {
  arrival?: string | null;
  departure?: string | null;
  delayArrival?: number | null;
  delayDeparture?: number | null;
  isLiveRow: boolean;
}) {
  const arr = splitTime(arrival);
  const dep = splitTime(departure);

  return (
    <div className="w-[74px] shrink-0 text-right font-mono sm:w-[92px]">
      <div className="text-[13px] font-semibold leading-tight text-white/85 sm:text-sm">
        {arr.time}
        {isLiveRow && (delayArrival ?? 0) > 0 && (
          <span className="ml-1 inline-block align-middle">
            <DelayBadge minutes={delayArrival} />
          </span>
        )}
      </div>
      <div className="text-[10px] text-white/25">{arr.date || "\u00A0"}</div>
      <div className="mt-1.5 text-[13px] font-semibold leading-tight text-white/55 sm:text-sm">
        {dep.time}
        {isLiveRow && (delayDeparture ?? 0) > 0 && (
          <span className="ml-1 inline-block align-middle">
            <DelayBadge minutes={delayDeparture} />
          </span>
        )}
      </div>
      <div className="text-[10px] text-white/25">{dep.date || "\u00A0"}</div>
    </div>
  );
}

export function RouteTimeline({
  stations,
  mode = "schedule",
  compact = false,
}: {
  stations: AnyStation[];
  mode?: "schedule" | "live";
  compact?: boolean;
}) {
  const [expanded, setExpanded] = useState(mode === "live");
  const listRef = useRef<HTMLOListElement>(null);
  const currentRef = useRef<HTMLLIElement>(null);

  // Keep the "you are here" row in view when the live route loads or refreshes.
  useEffect(() => {
    if (mode !== "live" || !expanded) return;
    const list = listRef.current;
    const active = currentRef.current;
    if (!list || !active) return;
    const listBox = list.getBoundingClientRect();
    const activeBox = active.getBoundingClientRect();
    const top = activeBox.top - listBox.top + list.scrollTop;
    list.scrollTop = Math.max(0, top - list.clientHeight / 2 + activeBox.height / 2);
  }, [mode, expanded, stations]);

  const total = stations.length;
  const collapsible = total > 14 && !compact && mode !== "live";
  const head = collapsible && !expanded ? stations.slice(0, 9) : stations;
  const tail = collapsible && !expanded ? stations.slice(-2) : [];
  const hiddenCount = total - head.length - tail.length;

  // Prefer a station NTES flags as current. Between stops there is none, so
  // anchor the timeline to the last reported station instead.
  const currentIndex = mode === "live"
    ? stations.findIndex((station) => isLive(station) && station.state === "current")
    : -1;
  const anchorIndex = currentIndex >= 0
    ? currentIndex
    : mode === "live"
      ? stations.reduce(
          (acc, station, index) =>
            isLive(station) && station.state === "passed" ? index : acc,
          -1,
        )
      : -1;

  const renderRow = (station: AnyStation, index: number, absoluteIndex: number) => {
    const live = isLive(station);
    const arrival = live ? station.scheduledArrival : station.arrival;
    const departure = live ? station.scheduledDeparture : station.departure;
    const day = station.day ?? 1;
    const halt = station.halt ?? 0;
    const state = live ? station.state : "upcoming";
    const isAnchor = absoluteIndex >= 0 && absoluteIndex === anchorIndex;
    const isCurrent = state === "current" || isAnchor;
    const isPassed = state === "passed";
    const isFirst = absoluteIndex === 0;
    const isLast = absoluteIndex === total - 1;

    return (
      <li
        key={`${station.code}-${station.seq}-${index}`}
        ref={isCurrent ? currentRef : undefined}
        className={cn(
          "relative flex items-start gap-4 rounded-xl px-2 py-3 transition-colors sm:gap-5",
          isCurrent && "bg-saffron/[0.055] ring-1 ring-inset ring-saffron/20",
        )}
      >
        <TimeCell
          arrival={arrival}
          departure={departure}
          delayArrival={live ? station.delayArrival : null}
          delayDeparture={live ? station.delayDeparture : null}
          isLiveRow={live}
        />

        <div className="relative flex w-4 shrink-0 flex-col items-center self-stretch">
          <span
            className={cn(
              "relative z-10 mt-1 h-3 w-3 rounded-full border-2 transition",
              isCurrent
                ? "border-saffron bg-saffron shadow-[0_0_0_4px_rgba(255,122,26,0.18)]"
                : isPassed
                  ? "border-mint/70 bg-mint/80"
                  : isFirst || isLast
                    ? "border-white/50 bg-ink-950"
                    : "border-white/25 bg-ink-950",
            )}
          >
            {isCurrent && (
              <span className="absolute inset-0 -z-10 animate-pulse-ring rounded-full bg-saffron/50" />
            )}
          </span>
          {!isLast && (
            <span
              className={cn(
                "absolute top-4 h-[calc(100%-8px)] w-px",
                isPassed ? "bg-mint/30" : "bg-white/[0.12]",
              )}
            />
          )}
        </div>

        <div className="min-w-0 flex-1 pb-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span
              className={cn(
                "truncate text-[13.5px] font-semibold sm:text-sm",
                isCurrent ? "text-white" : isPassed ? "text-white/45" : "text-white/85",
              )}
            >
              {station.name}
            </span>
            <span className="rounded border border-white/10 bg-white/[0.04] px-1.5 py-0.5 font-mono text-[9.5px] tracking-wide text-white/40">
              {station.code}
            </span>
            {day > 1 && (
              <span className="chip !px-1.5 !py-0.5 !text-[9.5px]">Day {day}</span>
            )}
            {isCurrent && (
              <span className="inline-flex items-center gap-1 rounded-full border border-saffron/30 bg-saffron/10 px-1.5 py-0.5 text-[9.5px] font-semibold uppercase tracking-wider text-saffron">
                <TrainFront className="h-2.5 w-2.5" /> {state === "current" ? "Here" : "Last seen"}
              </span>
            )}
          </div>

          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-white/35">
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {station.distance} km
            </span>
            {station.platform ? <span>PF {station.platform}</span> : null}
            {halt > 0 ? <span>{halt} min halt</span> : null}
            {live ? (
              <span className="text-white/25">
                {state === "current"
                  ? "At station"
                  : isPassed
                    ? isAnchor
                      ? "Last reported"
                      : "Departed"
                    : "Upcoming"}
              </span>
            ) : null}
          </div>
        </div>
      </li>
    );
  };

  return (
    <div className="glass overflow-hidden rounded-2xl">
      <div className="flex items-center justify-between gap-4 border-b border-white/[0.06] px-5 py-4">
        <div>
          <h3 className="font-display text-sm font-semibold text-white">
            {mode === "live" ? "Live route" : "Full route"}
          </h3>
          <p className="mt-0.5 text-[11px] text-white/35">
            {total} stations · arrival / departure
          </p>
        </div>
        {collapsible && (
          <span className="chip">{expanded ? "Showing all" : `First ${head.length}`}</span>
        )}
      </div>

      <ol ref={listRef} className="max-h-[640px] overflow-y-auto px-2 py-3 sm:px-3">
        {head.map((station, index) => renderRow(station, index, index))}

        {collapsible && !expanded && hiddenCount > 0 && (
          <li className="px-2 py-2">
            <button
              type="button"
              onClick={() => setExpanded(true)}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-white/10 bg-white/[0.02] py-3 text-xs font-medium text-white/45 transition hover:border-white/20 hover:text-white/80"
            >
              <ChevronDown className="h-3.5 w-3.5" />
              Show {hiddenCount} more station{hiddenCount === 1 ? "" : "s"}
            </button>
          </li>
        )}

        {tail.map((station, index) => renderRow(station, index, total - tail.length + index))}

        {expanded && collapsible && (
          <li className="px-2 py-2">
            <button
              type="button"
              onClick={() => setExpanded(false)}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-white/10 bg-white/[0.02] py-3 text-xs font-medium text-white/45 transition hover:border-white/20 hover:text-white/80"
            >
              <ChevronUp className="h-3.5 w-3.5" />
              Collapse route
            </button>
          </li>
        )}
      </ol>

      {mode === "live" && (
        <div className="border-t border-white/[0.06] px-5 py-3 text-[10px] uppercase tracking-[0.14em] text-white/25">
          Green = departed · Saffron = current position · Grey = upcoming
        </div>
      )}
    </div>
  );
}
