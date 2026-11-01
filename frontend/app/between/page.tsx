"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowLeftRight, ArrowRight, RefreshCw, Search, Waypoints } from "lucide-react";
import { PageHeader } from "@/components/section-heading";
import { StationAutocomplete } from "@/components/station-autocomplete";
import { TrainList } from "@/components/train-list";
import { ErrorState } from "@/components/error-state";
import { EmptyState } from "@/components/empty-state";
import { ListSkeleton } from "@/components/skeleton";
import { getTrainsBetween } from "@/lib/api";
import type { BetweenResponse } from "@/lib/types";

const TYPES = [
  { value: "XXX", label: "All trains" },
  { value: "RAJ", label: "Rajdhani" },
  { value: "SHT", label: "Shatabdi" },
  { value: "DUR", label: "Duronto" },
  { value: "SUF", label: "Superfast" },
  { value: "EXP", label: "Express" },
  { value: "VAN", label: "Vande Bharat" },
];

function BetweenContent() {
  const params = useSearchParams();
  const initialFrom = params.get("from")?.toUpperCase() ?? "";
  const initialTo = params.get("to")?.toUpperCase() ?? "";
  const initialType = params.get("type")?.toUpperCase() ?? "XXX";

  const [from, setFrom] = useState(initialFrom);
  const [to, setTo] = useState(initialTo);
  const [type, setType] = useState(TYPES.some((item) => item.value === initialType) ? initialType : "XXX");
  const [data, setData] = useState<BetweenResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const requestRef = useRef(0);
  const bootstrapped = useRef(false);

  const load = useCallback(async (origin: string, target: string, trainType: string) => {
    if (!/^[A-Za-z]{2,5}$/.test(origin) || !/^[A-Za-z]{2,5}$/.test(target)) return;
    const requestId = ++requestRef.current;
    setLoading(true);
    setError(null);
    try {
      const response = await getTrainsBetween(origin.toUpperCase(), target.toUpperCase(), trainType);
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
    if (bootstrapped.current || !initialFrom || !initialTo) return;
    bootstrapped.current = true;
    void load(initialFrom, initialTo, type);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!/^[A-Za-z]{2,5}$/.test(from) || !/^[A-Za-z]{2,5}$/.test(to)) {
      setError(new Error("Pick both a boarding and destination station."));
      return;
    }
    if (from.toUpperCase() === to.toUpperCase()) {
      setError(new Error("Boarding and destination stations must be different."));
      return;
    }
    void load(from, to, type);
  };

  const swap = () => {
    setFrom(to);
    setTo(from);
  };

  return (
    <div className="pb-20">
      <PageHeader
        eyebrow="Route finder"
        title="Every direct train between two stations."
        description="Pick where you're boarding and where you're headed — we'll list every direct train with timings, duration, running days and classes."
      >
        <form onSubmit={handleSubmit} className="mt-8">
          <div className="glass rounded-2xl p-4 sm:p-5">
            <div className="grid gap-4 lg:grid-cols-[1fr_auto_1fr_0.8fr_auto] lg:items-end">
              <StationAutocomplete
                value={from}
                onChange={setFrom}
                label="From"
                placeholder="Boarding — NDLS"
              />
              <button
                type="button"
                onClick={swap}
                aria-label="Swap stations"
                className="hidden h-[46px] w-[46px] place-items-center rounded-xl border border-white/10 bg-white/[0.03] text-white/40 transition hover:border-saffron/30 hover:text-saffron-soft lg:grid"
              >
                <ArrowLeftRight className="h-4 w-4" />
              </button>
              <StationAutocomplete
                value={to}
                onChange={setTo}
                label="To"
                placeholder="Destination — MMCT"
              />
              <div>
                <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.16em] text-white/40">
                  Train type
                </span>
                <select
                  value={type}
                  onChange={(event) => setType(event.target.value)}
                  className="input-base h-[46px] cursor-pointer appearance-none bg-ink-900/60 pr-8"
                >
                  {TYPES.map((option) => (
                    <option key={option.value} value={option.value} className="bg-ink-900">
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <button type="submit" className="btn-primary h-[46px] w-full lg:w-auto" disabled={loading}>
                {loading ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" /> Searching
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4" /> Find trains
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </PageHeader>

      <section className="mx-auto mt-8 max-w-7xl px-5 sm:px-8">
        {loading ? (
          <ListSkeleton rows={6} />
        ) : error ? (
          <ErrorState error={error} onRetry={() => void load(from, to, type)} />
        ) : data ? (
          <div className="space-y-4">
            <div className="glass flex flex-wrap items-center justify-between gap-3 rounded-2xl px-5 py-4">
              <div>
                <h2 className="flex flex-wrap items-center gap-2 font-display text-base font-semibold text-white">
                  <span className="max-w-[200px] truncate">
                    {data.from.name || data.from.code}
                  </span>
                  <ArrowRight className="h-4 w-4 text-saffron/70" />
                  <span className="max-w-[200px] truncate">{data.to.name || data.to.code}</span>
                </h2>
                <p className="mt-1 text-[11px] text-white/35">
                  <span className="font-mono">{data.from.code}</span> →{" "}
                  <span className="font-mono">{data.to.code}</span> · {data.trainTypeLabel} ·{" "}
                  {data.count} train{data.count === 1 ? "" : "s"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => void load(from, to, type)}
                className="btn-ghost !px-3 !py-2 !text-[11px]"
              >
                <RefreshCw className="h-3 w-3" /> Refresh
              </button>
            </div>

            {data.trains.length > 0 ? (
              <TrainList trains={data.trains} />
            ) : (
              <EmptyState
                icon={Waypoints}
                title="No direct trains found"
                description="NTES only lists direct trains. Try a different train type, a nearby major station, or split the journey into two legs."
              />
            )}
          </div>
        ) : (
          <EmptyState
            icon={Waypoints}
            title="Choose two stations to begin"
            description="Try NDLS → MMCT for the Delhi–Mumbai corridor, or HWH → NDLS for Howrah–New Delhi."
          />
        )}
      </section>
    </div>
  );
}

export default function BetweenPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-7xl px-5 pt-32 sm:px-8">
          <ListSkeleton rows={5} />
        </div>
      }
    >
      <BetweenContent />
    </Suspense>
  );
}
