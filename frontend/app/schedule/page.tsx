"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowRight, CalendarDays, Clock3, RefreshCw, Route, TrainFront } from "lucide-react";
import { PageHeader } from "@/components/section-heading";
import { TrainAutocomplete } from "@/components/train-autocomplete";
import { DateField } from "@/components/date-field";
import { RouteTimeline } from "@/components/route-timeline";
import { ErrorState } from "@/components/error-state";
import { EmptyState } from "@/components/empty-state";
import { CardSkeleton, TimelineSkeleton } from "@/components/skeleton";
import { getSchedule } from "@/lib/api";
import type { TrainSchedule } from "@/lib/types";
import { cn } from "@/lib/utils";

function ScheduleHeader({ data }: { data: TrainSchedule }) {
  const { train, stations } = data;
  const first = stations[0];
  const last = stations[stations.length - 1];

  return (
    <div className="glass relative overflow-hidden rounded-2xl">
      <div
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          background:
            "radial-gradient(600px 220px at 10% 0%, rgba(91,140,255,0.14), transparent 70%), radial-gradient(500px 200px at 90% 10%, rgba(255,122,26,0.12), transparent 70%)",
        }}
      />
      <div className="relative p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-lg border border-white/10 bg-white/[0.05] px-2 py-1 font-mono text-xs font-semibold text-white/70">
                {train.number}
              </span>
              <span className="chip">{train.typeLabel}</span>
              {train.travelTime ? (
                <span className="inline-flex items-center gap-1 text-[11px] text-white/40">
                  <Clock3 className="h-3 w-3" /> {train.travelTime}
                </span>
              ) : null}
            </div>
            <h2 className="mt-2.5 font-display text-xl font-semibold tracking-tight text-white sm:text-2xl">
              {train.name}
            </h2>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-[13px]">
              <span className="inline-flex items-center gap-1.5 text-white/75">
                <span className="font-mono text-[11px] text-white/40">{train.source.code}</span>
                <span className="max-w-[170px] truncate">{train.source.name}</span>
              </span>
              <ArrowRight className="h-3.5 w-3.5 text-saffron/70" />
              <span className="inline-flex items-center gap-1.5 text-white/75">
                <span className="font-mono text-[11px] text-white/40">
                  {train.destination.code}
                </span>
                <span className="max-w-[170px] truncate">{train.destination.name}</span>
              </span>
            </div>
          </div>

          <div className="grid gap-2 text-right">
            <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-3.5 py-2">
              <p className="text-[9.5px] uppercase tracking-[0.16em] text-white/30">Departure</p>
              <p className="mt-0.5 font-mono text-lg font-semibold text-white">
                {first?.departure ?? "—"}
              </p>
            </div>
            <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-3.5 py-2">
              <p className="text-[9.5px] uppercase tracking-[0.16em] text-white/30">Arrival</p>
              <p className="mt-0.5 font-mono text-lg font-semibold text-white">
                {last?.arrival ?? "—"}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-white/[0.06] pt-4 text-[11px] text-white/40">
          {train.daysOfRun ? (
            <span className="chip">
              <CalendarDays className="h-3 w-3" /> {train.daysOfRun}
            </span>
          ) : null}
          {train.classes ? <span className="chip">Classes: {train.classes}</span> : null}
          {train.validFrom ? <span className="chip">Valid from {train.validFrom}</span> : null}
          <span className="chip">
            <Route className="h-3 w-3" /> {stations.length} stops
          </span>
        </div>
      </div>
    </div>
  );
}

function ScheduleContent() {
  const params = useSearchParams();
  const initialTrain = params.get("train")?.trim() ?? "";
  const initialDate = params.get("date")?.trim() ?? "";

  const [trainNo, setTrainNo] = useState(initialTrain);
  const [date, setDate] = useState(initialDate);
  const [data, setData] = useState<TrainSchedule | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const requestRef = useRef(0);
  const bootstrapped = useRef(false);

  const load = useCallback(async (train: string, runDate: string) => {
    if (!/^\d{4,6}$/.test(train)) return;
    const requestId = ++requestRef.current;
    setLoading(true);
    setError(null);
    try {
      const response = await getSchedule(train, runDate || undefined);
      if (requestRef.current === requestId) setData(response);
    } catch (err) {
      if (requestRef.current === requestId) {
        setError(err);
        setData(null);
      }
    } finally {
      if (requestRef.current === requestId) setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (bootstrapped.current || !initialTrain) return;
    bootstrapped.current = true;
    void load(initialTrain, initialDate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!/^\d{4,6}$/.test(trainNo)) {
      setError(new Error("Enter a valid 4-6 digit train number."));
      return;
    }
    void load(trainNo, date);
  };

  return (
    <div className="pb-20">
      <PageHeader
        eyebrow="Timetable"
        title="The full route, stop by stop."
        description="Every halt with scheduled arrival, departure, day number, distance and halt time. Pick a run date to see the timetable for that journey."
      >
        <form onSubmit={handleSubmit} className="mt-8">
          <div className="glass rounded-2xl p-4 sm:p-5">
            <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr_auto] lg:items-end">
              <TrainAutocomplete
                value={trainNo}
                onChange={setTrainNo}
                onSelectTrain={(train) => setTrainNo(train.number)}
                label="Train"
                placeholder="Train number or name — 12301, Rajdhani…"
              />
              <DateField
                value={date}
                onChange={setDate}
                label="Run date (optional)"
                hint="Leave empty for the current timetable."
                compact
              />
              <button type="submit" className="btn-primary h-[46px] w-full lg:w-auto" disabled={loading}>
                {loading ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" /> Loading
                  </>
                ) : (
                  <>
                    <Route className="h-4 w-4" /> Show route
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </PageHeader>

      <section className="mx-auto mt-8 max-w-7xl px-5 sm:px-8">
        {loading ? (
          <div className="space-y-4">
            <CardSkeleton />
            <TimelineSkeleton rows={9} />
          </div>
        ) : error ? (
          <ErrorState error={error} onRetry={() => void load(trainNo, date)} />
        ) : data ? (
          <div className="space-y-4">
            <ScheduleHeader data={data} />
            <RouteTimeline stations={data.stations} mode="schedule" />
            {(data.train.runningDates?.length ?? 0) > 0 ? (
              <div className="glass rounded-2xl p-4 sm:p-5">
                <h3 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/35">
                  Upcoming runs
                </h3>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {data.train.runningDates?.slice(0, 14).map((runDate) => (
                    <button
                      key={runDate}
                      type="button"
                      onClick={() => {
                        setDate(runDate);
                        void load(trainNo, runDate);
                      }}
                      className={cn(
                        "rounded-full border px-2.5 py-1 font-mono text-[10.5px] transition",
                        date === runDate
                          ? "border-saffron/40 bg-saffron/10 text-saffron-soft"
                          : "border-white/10 bg-white/[0.03] text-white/45 hover:text-white/80",
                      )}
                    >
                      {runDate.slice(5)}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        ) : (
          <EmptyState
            icon={TrainFront}
            title="Search a train to see its route"
            description="Type a train number or name above. We'll list every station on the route with times and distances."
          />
        )}
      </section>
    </div>
  );
}

export default function SchedulePage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-7xl px-5 pt-32 sm:px-8">
          <CardSkeleton />
        </div>
      }
    >
      <ScheduleContent />
    </Suspense>
  );
}
