"use client";

import { Armchair, CalendarDays, Info, Ticket, TrainFront, User } from "lucide-react";
import type { PnrPassenger, PnrResponse } from "@/lib/types";
import { cn, statusTone, titleCase } from "@/lib/utils";

function statusLabel(value?: string | null): string {
  if (!value) return "—";
  return value.replace(/\s+/g, " ").trim();
}

function PassengerCard({ passenger }: { passenger: PnrPassenger }) {
  const current = statusLabel(
    passenger.currentStatusDetails || passenger.currentStatus || passenger.bookingStatus,
  );
  const booking = statusLabel(
    [passenger.bookingStatus, passenger.bookingCoach, passenger.bookingBerth]
      .filter(Boolean)
      .join(" / "),
  );
  const coach = passenger.currentCoach || passenger.bookingCoach;
  const berth = passenger.currentBerth || passenger.bookingBerth;

  return (
    <div className="rounded-xl border border-white/[0.07] bg-white/[0.025] p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="grid h-8 w-8 place-items-center rounded-lg border border-white/10 bg-white/[0.04] text-[11px] font-semibold text-white/60">
            P{passenger.number}
          </span>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/30">
              Passenger {passenger.number}
            </p>
            <p
              className={cn(
                "mt-0.5 inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold",
                statusTone(current),
              )}
            >
              {titleCase(current)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-right">
          {coach ? (
            <span className="chip">
              <Armchair className="h-3 w-3" /> {coach}
              {berth ? `/${berth}` : ""}
            </span>
          ) : null}
        </div>
      </div>

      {booking ? (
        <p className="mt-3 border-t border-white/[0.05] pt-2.5 text-[11px] text-white/35">
          Booked as <span className="font-mono text-white/55">{booking}</span>
        </p>
      ) : null}
    </div>
  );
}

export function PnrView({ data }: { data: PnrResponse }) {
  if (!data.found) {
    return (
      <div className="glass rounded-2xl p-6 sm:p-8">
        <div className="flex items-start gap-4">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-saffron/25 bg-saffron/10 text-saffron">
            <Info className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-display text-base font-semibold text-white">
              No details found for {data.pnr}
            </h3>
            <p className="mt-1.5 text-sm leading-relaxed text-white/55">
              {data.error || "The PNR may be invalid, flushed, or not yet generated."}
            </p>
            <p className="mt-2 text-[11px] text-white/35">
              PNR details are only available a few hours after booking and until the chart is
              prepared.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const chartPrepared =
    data.chartPrepared === true || data.chartPrepared === "Yes" || data.chartPrepared === "true";

  return (
    <div className="space-y-4">
      <div className="glass overflow-hidden rounded-2xl">
        <div className="border-b border-white/[0.06] p-5 sm:p-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.05] px-2 py-1 font-mono text-xs font-semibold text-white/70">
              <Ticket className="h-3.5 w-3.5" /> {data.pnr}
            </span>
            <span
              className={cn(
                "rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
                chartPrepared
                  ? "border-mint/30 bg-mint/10 text-mint"
                  : "border-saffron-soft/30 bg-saffron-soft/10 text-saffron-soft",
              )}
            >
              {chartPrepared ? "Chart prepared" : "Chart not prepared"}
            </span>
            {data.class ? <span className="chip">{data.class}</span> : null}
            {data.quota ? <span className="chip">{data.quota}</span> : null}
          </div>

          <h2 className="mt-3 font-display text-xl font-semibold tracking-tight text-white sm:text-2xl">
            {data.trainName || "Train details unavailable"}
          </h2>

          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-[12.5px] text-white/60">
            {data.trainNumber ? (
              <span className="inline-flex items-center gap-1.5">
                <TrainFront className="h-3.5 w-3.5 text-saffron/80" />
                <span className="font-mono">{data.trainNumber}</span>
              </span>
            ) : null}
            {data.journeyDate ? (
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays className="h-3.5 w-3.5 text-electric-soft/80" />
                {data.journeyDate}
              </span>
            ) : null}
            {data.boardingStation ? (
              <span className="inline-flex items-center gap-1.5">
                <span className="text-white/30">From</span>
                <span className="font-mono">{data.boardingStation}</span>
              </span>
            ) : null}
            {data.reservationUpto ? (
              <span className="inline-flex items-center gap-1.5">
                <span className="text-white/30">To</span>
                <span className="font-mono">{data.reservationUpto}</span>
              </span>
            ) : null}
          </div>
        </div>

        <div className="p-5 sm:p-6">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/35">
              Passengers
            </h3>
            <span className="chip">
              <User className="h-3 w-3" /> {data.passengers?.length ?? 0}
            </span>
          </div>

          {data.passengers && data.passengers.length > 0 ? (
            <div className="grid gap-2.5 sm:grid-cols-2">
              {data.passengers.map((passenger) => (
                <PassengerCard key={passenger.number} passenger={passenger} />
              ))}
            </div>
          ) : (
            <p className="rounded-xl border border-dashed border-white/10 px-4 py-8 text-center text-xs text-white/35">
              Passenger details are not available for this PNR.
            </p>
          )}

          <p className="mt-5 flex items-start gap-2 text-[10.5px] leading-relaxed text-white/25">
            <Info className="mt-0.5 h-3 w-3 shrink-0" />
            Status is fetched live from indianrail.gov.in and may lag behind the official chart.
            Always verify with the railway helpline 139.
          </p>
        </div>
      </div>
    </div>
  );
}
