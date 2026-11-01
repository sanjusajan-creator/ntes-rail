"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Clock3, MapPin, RefreshCw } from "lucide-react";
import { PageHeader } from "@/components/section-heading";
import { StationAutocomplete } from "@/components/station-autocomplete";
import { StationBoard } from "@/components/station-board";
import { ErrorState } from "@/components/error-state";
import { EmptyState } from "@/components/empty-state";
import { ListSkeleton } from "@/components/skeleton";
import { getStationBoard } from "@/lib/api";
import type { StationBoardResponse } from "@/lib/types";
import { cn } from "@/lib/utils";

const WINDOWS = [2, 4, 6, 8];

function StationContent() {
  const params = useSearchParams();
  const initialCode = params.get("code")?.toUpperCase() ?? "";
  const initialHours = Number(params.get("hours") ?? "2");
  const safeInitialHours = WINDOWS.includes(initialHours) ? initialHours : 2;

  const [code, setCode] = useState(initialCode);
  const [hours, setHours] = useState(safeInitialHours);
  const [data, setData] = useState<StationBoardResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const requestRef = useRef(0);
  const bootstrapped = useRef(false);

  const load = useCallback(async (station: string, windowHours: number) => {
    if (!/^[A-Za-z]{2,5}$/.test(station)) return;
    const requestId = ++requestRef.current;
    setLoading(true);
    setError(null);
    try {
      const response = await getStationBoard(station.toUpperCase(), windowHours);
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
    if (bootstrapped.current || !initialCode) return;
    bootstrapped.current = true;
    void load(initialCode, safeInitialHours);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!/^[A-Za-z]{2,5}$/.test(code)) {
      setError(new Error("Pick a station from the suggestions."));
      return;
    }
    void load(code, hours);
  };

  return (
    <div className="pb-20">
      <PageHeader
        eyebrow="Station board"
        title="What's moving through this station?"
        description="Arrivals and departures for the next few hours — expected times, platforms and delays, sorted the way the display board at the station would show them."
      >
        <form onSubmit={handleSubmit} className="mt-8">
          <div className="glass rounded-2xl p-4 sm:p-5">
            <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr_auto] lg:items-end">
              <StationAutocomplete
                value={code}
                onChange={setCode}
                label="Station"
                placeholder="Station code or city — NDLS, Howrah…"
              />
              <div>
                <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.16em] text-white/40">
                  Time window
                </span>
                <div className="flex h-[46px] items-center gap-1 rounded-xl border border-white/10 bg-white/[0.04] p-1">
                  {WINDOWS.map((windowHours) => (
                    <button
                      key={windowHours}
                      type="button"
                      onClick={() => setHours(windowHours)}
                      className={cn(
                        "flex-1 rounded-lg px-2 py-1.5 text-xs font-semibold transition",
                        hours === windowHours
                          ? "bg-white/[0.09] text-white"
                          : "text-white/40 hover:text-white/75",
                      )}
                    >
                      {windowHours}h
                    </button>
                  ))}
                </div>
              </div>
              <button type="submit" className="btn-primary h-[46px] w-full lg:w-auto" disabled={loading}>
                {loading ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" /> Loading
                  </>
                ) : (
                  <>
                    <MapPin className="h-4 w-4" /> Show board
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </PageHeader>

      <section className="mx-auto mt-8 max-w-7xl px-5 sm:px-8">
        {loading ? (
          <ListSkeleton rows={7} />
        ) : error ? (
          <ErrorState error={error} onRetry={() => void load(code, hours)} />
        ) : data ? (
          <div className="space-y-4">
            <div className="glass flex flex-wrap items-center justify-between gap-3 rounded-2xl px-5 py-4">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-xl border border-electric/25 bg-electric/10 text-electric-soft">
                  <MapPin className="h-4 w-4" />
                </span>
                <div>
                  <h2 className="font-display text-base font-semibold text-white">
                    {data.station.name || data.station.code}
                  </h2>
                  <p className="mt-0.5 flex items-center gap-2 text-[11px] text-white/35">
                    <span className="font-mono">{data.station.code}</span>
                    <span className="text-white/20">·</span>
                    <Clock3 className="h-3 w-3" /> next {data.hours} hours
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => void load(code, hours)}
                className="btn-ghost !px-3 !py-2 !text-[11px]"
              >
                <RefreshCw className="h-3 w-3" /> Refresh
              </button>
            </div>

            {data.trains.length > 0 ? (
              <StationBoard trains={data.trains} stationCode={data.station.code} />
            ) : (
              <EmptyState
                icon={Clock3}
                title="No trains in this window"
                description="Try widening the time window or check the station code. Some smaller stations only see a few trains a day."
              />
            )}
          </div>
        ) : (
          <EmptyState
            icon={MapPin}
            title="Pick a station to open its board"
            description="Search a station above to see live arrivals and departures. Try NDLS, HWH or MAS to start."
          />
        )}
      </section>
    </div>
  );
}

export default function StationPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-7xl px-5 pt-32 sm:px-8">
          <ListSkeleton rows={6} />
        </div>
      }
    >
      <StationContent />
    </Suspense>
  );
}
