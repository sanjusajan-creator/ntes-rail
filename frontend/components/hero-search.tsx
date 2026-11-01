"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  ArrowRight,
  MapPin,
  Radar,
  Ticket,
  TrainFront,
  Waypoints,
} from "lucide-react";
import { TrainAutocomplete } from "@/components/train-autocomplete";
import { StationAutocomplete } from "@/components/station-autocomplete";
import { cn } from "@/lib/utils";

const TABS = [
  { id: "train", label: "Train", icon: TrainFront },
  { id: "station", label: "Station", icon: MapPin },
  { id: "between", label: "Between", icon: Waypoints },
  { id: "pnr", label: "PNR", icon: Ticket },
] as const;

type TabId = (typeof TABS)[number]["id"];

export function HeroSearch() {
  const router = useRouter();
  const [tab, setTab] = useState<TabId>("train");
  const [trainNo, setTrainNo] = useState("");
  const [stationCode, setStationCode] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [pnr, setPnr] = useState("");
  const [error, setError] = useState<string | null>(null);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (tab === "train") {
      if (!/^\d{4,6}$/.test(trainNo)) {
        setError("Enter a train number (4-6 digits) or pick one from the list.");
        return;
      }
      router.push(`/live?train=${trainNo}`);
      return;
    }

    if (tab === "station") {
      if (!/^[A-Za-z]{2,5}$/.test(stationCode)) {
        setError("Pick a station to see its live board.");
        return;
      }
      router.push(`/station?code=${stationCode.toUpperCase()}`);
      return;
    }

    if (tab === "between") {
      if (!/^[A-Za-z]{2,5}$/.test(from) || !/^[A-Za-z]{2,5}$/.test(to)) {
        setError("Pick both a boarding and a destination station.");
        return;
      }
      if (from.toUpperCase() === to.toUpperCase()) {
        setError("Boarding and destination stations must be different.");
        return;
      }
      router.push(`/between?from=${from.toUpperCase()}&to=${to.toUpperCase()}`);
      return;
    }

    if (!/^\d{10}$/.test(pnr)) {
      setError("PNR is a 10-digit number.");
      return;
    }
    router.push(`/pnr?pnr=${pnr}`);
  };

  return (
    <div className="relative">
      <div className="absolute -inset-px rounded-[22px] bg-gradient-to-r from-saffron/40 via-white/10 to-electric/40 opacity-60 blur-[6px]" />
      <form
        onSubmit={submit}
        className="glass-strong relative rounded-[20px] p-2 shadow-[0_30px_80px_-40px_rgba(0,0,0,0.9)]"
      >
        <div className="flex items-center gap-1 rounded-xl bg-white/[0.02] p-1">
          {TABS.map((item) => {
            const Icon = item.icon;
            const active = tab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setTab(item.id);
                  setError(null);
                }}
                className={cn(
                  "flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-[12px] font-semibold transition sm:text-[13px]",
                  active
                    ? "bg-white/[0.08] text-white shadow-sm"
                    : "text-white/45 hover:text-white/75",
                )}
                aria-pressed={active}
              >
                <Icon className={cn("h-3.5 w-3.5", active && "text-saffron")} />
                {item.label}
              </button>
            );
          })}
        </div>

        <div className="grid gap-3 p-3 sm:p-4">
          {tab === "train" && (
            <div className="animate-[slide-up_0.35s_cubic-bezier(0.16,1,0.3,1)]">
              <TrainAutocomplete
                value={trainNo}
                onChange={setTrainNo}
                placeholder="Train number or name — 12301, Rajdhani…"
              />
              <p className="mt-2.5 text-[11px] text-white/35">
                We&apos;ll show the live running position and today&apos;s latest update.
              </p>
            </div>
          )}

          {tab === "station" && (
            <div className="animate-[slide-up_0.35s_cubic-bezier(0.16,1,0.3,1)]">
              <StationAutocomplete
                value={stationCode}
                onChange={setStationCode}
                placeholder="Station code or city — NDLS, Howrah…"
                autoFocus
              />
              <p className="mt-2.5 text-[11px] text-white/35">
                Arrivals and departures for the next two hours, live.
              </p>
            </div>
          )}

          {tab === "between" && (
            <div className="grid animate-[slide-up_0.35s_cubic-bezier(0.16,1,0.3,1)] gap-3 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
              <StationAutocomplete
                value={from}
                onChange={setFrom}
                placeholder="From — NDLS"
                autoFocus
              />
              <div className="hidden h-9 w-9 place-items-center rounded-full border border-white/10 bg-white/[0.03] text-white/40 sm:grid">
                <ArrowRight className="h-4 w-4" />
              </div>
              <StationAutocomplete value={to} onChange={setTo} placeholder="To — MMCT" />
            </div>
          )}

          {tab === "pnr" && (
            <div className="animate-[slide-up_0.35s_cubic-bezier(0.16,1,0.3,1)]">
              <div className="relative">
                <Ticket className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
                <input
                  value={pnr}
                  onChange={(event) => setPnr(event.target.value.replace(/\D/g, "").slice(0, 10))}
                  placeholder="10-digit PNR number"
                  inputMode="numeric"
                  autoComplete="off"
                  className="input-base pl-10 font-mono tracking-[0.18em]"
                  aria-label="PNR number"
                />
              </div>
              <p className="mt-2.5 text-[11px] text-white/35">
                The captcha is solved automatically — this can take a few seconds.
              </p>
            </div>
          )}

          {error ? (
            <p className="rounded-lg border border-danger/25 bg-danger/[0.07] px-3 py-2 text-xs text-danger">
              {error}
            </p>
          ) : null}

          <button type="submit" className="btn-primary w-full sm:w-auto sm:justify-self-end">
            <Radar className="h-4 w-4" />
            Track now
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
