"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CalendarClock, History, Radio, RefreshCw, TrainFront } from "lucide-react";
import { PageHeader } from "@/components/section-heading";
import { TrainAutocomplete } from "@/components/train-autocomplete";
import { DateField } from "@/components/date-field";
import { LiveStatusView } from "@/components/live-status-view";
import { RouteTimeline } from "@/components/route-timeline";
import { ErrorState } from "@/components/error-state";
import { EmptyState } from "@/components/empty-state";
import { CardSkeleton, TimelineSkeleton } from "@/components/skeleton";
import { getLiveStatus, getSchedule } from "@/lib/api";
import type { LiveResponse, TrainSchedule } from "@/lib/types";
import { cn, todayISO } from "@/lib/utils";

function RunChips({
  runningDates,
  activeDate,
  onPick,
  disabled,
}: {
  runningDates: string[];
  activeDate: string;
  onPick: (date: string) => void;
  disabled?: boolean;
}) {
  if (runningDates.length === 0) return null;
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.14em] text-white/30">
        <History className="h-3 w-3" /> Run starts
      </span>
      {runningDates.slice(0, 6).map((d) => {
        const active = activeDate === d;
        return (
          <button
            key={d}
            type="button"
            disabled={disabled}
            onClick={() => onPick(d)}
            className={cn(
              "max-w-[260px] truncate rounded-full border px-2.5 py-1 text-[11px] font-medium transition",
              active
                ? "border-saffron/40 bg-saffron/10 text-saffron-soft"
                : "border-white/10 bg-white/[0.03] text-white/45 hover:border-white/20 hover:text-white/75",
            )}
          >
            {d}
          </button>
        );
      })}
    </div>
  );
}

function LiveContent() {
  const params = useSearchParams();
  const initialTrain = params.get("train")?.trim() ?? "";
  const initialDate = params.get("date")?.trim() ?? "";

  const [trainNo, setTrainNo] = useState(initialTrain);
  const [date, setDate] = useState(initialDate || todayISO());
  const [schedule, setSchedule] = useState<TrainSchedule | null>(null);
  const [data, setData] = useState<LiveResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingSchedule, setLoadingSchedule] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const requestRef = useRef(0);
  const bootstrapped = useRef(false);

  const loadLive = useCallback(async (train: string, runDate: string) => {
    if (!/^\d{4,6}$/.test(train)) return;
    const requestId = ++requestRef.current;
    setLoading(true);
    setError(null);
    try {
      const response = await getLiveStatus(train, runDate);
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

  const loadSchedule = useCallback(async (train: string) => {
    if (!/^\d{4,6}$/.test(train)) return null;
    setLoadingSchedule(true);
    try {
      const response = await getSchedule(train);
      setSchedule(response);
      return response;
    } catch {
      setSchedule(null);
      return null;
    } finally {
      setLoadingSchedule(false);
    }
  }, []);

  // Deep-link bootstrap
  useEffect(() => {
    if (bootstrapped.current || !initialTrain) return;
    bootstrapped.current = true;
    let cancelled = false;
    (async () => {
      setLoadingSchedule(true);
      try {
        const response = await getSchedule(initialTrain);
        if (cancelled) return;
        setSchedule(response);
        const runningDates = response.train.runningDates || [];
        const runDate = initialDate || runningDates[0] || todayISO();
        setDate(runDate);
        setLoadingSchedule(false);
        await loadLive(initialTrain, runDate);
      } catch {
        if (!cancelled) setLoadingSchedule(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSelectTrain = async (train: { number: string }) => {
    setTrainNo(train.number);
    const response = await loadSchedule(train.number);
    const runningDates = response?.train.runningDates || [];
    const runDate = runningDates[0] || date || todayISO();
    setDate(runDate);
    await loadLive(train.number, runDate);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!/^\d{4,6}$/.test(trainNo)) {
      setError(new Error("Enter a valid 4-6 digit train number."));
      return;
    }
    const response = await loadSchedule(trainNo);
    const runningDates = response?.train.runningDates || [];
    const hasRun = runningDates.some((d: string) => d === date);
    const runDate = hasRun ? date : runningDates[0] || date;
    if (runDate !== date) setDate(runDate);
    await loadLive(trainNo, runDate);
  };

  const handlePickRun = async (runDate: string) => {
    setDate(runDate);
    await loadLive(trainNo, runDate);
  };

  return (
    <div className="pb-20">
      <PageHeader
        eyebrow="Live radar"
        title="Where is my train, right now?"
        description="Enter a train number and pick the run start date. RailLens shows the last reported station, delay, distance covered and the full timeline ahead."
      >
        <form onSubmit={handleSubmit} className="mt-8">
          <div className="glass rounded-2xl p-4 sm:p-5">
            <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr_auto] lg:items-end">
              <TrainAutocomplete
                value={trainNo}
                onChange={setTrainNo}
                onSelectTrain={(train) => void handleSelectTrain(train)}
                label="Train"
                placeholder="Train number or name — 12301, Rajdhani…"
              />
              <DateField
                value={date}
                onChange={setDate}
                label="Run start date"
                hint="The date the train left its origin. For overnight trains this is often yesterday."
              />
              <button type="submit" className="btn-primary h-[46px] w-full lg:w-auto" disabled={loading}>
                {loading ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" /> Tracking
                  </>
                ) : (
                  <>
                    <Radio className="h-4 w-4" /> Track live
                  </>
                )}
              </button>
            </div>

            {schedule ? (
              <div className="mt-4 border-t border-white/[0.06] pt-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-[11px] text-white/35">
                    <span className="font-semibold text-white/60">{schedule.train.name}</span> ·{" "}
                    {schedule.train.source.code} → {schedule.train.destination.code}
                  </p>
                  {loadingSchedule ? (
                    <span className="text-[11px] text-white/30">Loading runs…</span>
                  ) : null}
                </div>
                <div className="mt-2.5">
                  <RunChips
                    runningDates={schedule.train.runningDates || []}
                    activeDate={date}
                    onPick={(value) => void handlePickRun(value)}
                    disabled={loading}
                  />
                </div>
              </div>
            ) : null}
          </div>
        </form>
      </PageHeader>

      <section className="mx-auto mt-8 max-w-7xl px-5 sm:px-8">
        {loading ? (
          <div className="space-y-4">
            <CardSkeleton />
            <TimelineSkeleton rows={7} />
          </div>
        ) : error ? (
          <ErrorState error={error} onRetry={() => void loadLive(trainNo, date)} />
        ) : data ? (
          <div className="space-y-4">
            <LiveStatusView data={data} />
            <RouteTimeline stations={data.stations} mode="live" />
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-[11px] text-white/35">
              <span className="inline-flex items-center gap-1.5">
                <CalendarClock className="h-3.5 w-3.5" />
                Run started {data.run.startDate ?? "—"} · updated {data.run.lastUpdate || "—"}
              </span>
              <button
                type="button"
                onClick={() => void loadLive(trainNo, date)}
                className="btn-ghost !px-2.5 !py-1.5 !text-[11px]"
              >
                <RefreshCw className="h-3 w-3" /> Refresh
              </button>
            </div>
          </div>
        ) : (
          <EmptyState
            icon={TrainFront}
            title="Nothing tracked yet"
            description="Search for a train above and hit Track live. Tip: you can also open a train from the Trains Between or Station board screens."
          />
        )}
      </section>
    </div>
  );
}

export default function LivePage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-7xl px-5 pt-32 sm:px-8">
          <CardSkeleton />
        </div>
      }
    >
      <LiveContent />
    </Suspense>
  );
}
