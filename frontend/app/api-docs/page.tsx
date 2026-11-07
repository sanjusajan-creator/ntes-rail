"use client";

import { ArrowUpRight, Braces, TerminalSquare } from "lucide-react";
import { PageHeader } from "@/components/section-heading";

const RAIL_ENGINE_BASE = "https://railway-engine.apkscope.workers.dev/v1";

const ENDPOINTS = [
  {
    method: "GET",
    path: "/trains/search?q=rajdhani",
    description: "Find trains by number, name or keyword.",
  },
  {
    method: "GET",
    path: "/train/{number}/schedule?date=2026-11-02",
    description: "Full timetable: stops, times, distance, halt, platform.",
  },
  {
    method: "GET",
    path: "/train/{number}/route?date=2026-11-02",
    description: "Station-by-station route with scheduled/actual times.",
  },
  {
    method: "GET",
    path: "/train/{number}/status?date=2026-11-02",
    description: "Live position, delay, GPS, freshness, confidence, timeline.",
  },
  {
    method: "GET",
    path: "/train/{number}/coaches",
    description: "Coach composition with position, type, class, berth layout.",
  },
  {
    method: "GET",
    path: "/train/{number}/fare?date=2026-11-02&class=3A&quota=GN",
    description: "Itemised fare breakdown (base, reservation, superfast, GST, tatkal).",
  },
  {
    method: "GET",
    path: "/train/{number}/platforms",
    description: "Platform numbers per station with confidence scores.",
  },
  {
    method: "GET",
    path: "/station/{code}",
    description: "Station details: name, aliases, coordinates, state, zone, division.",
  },
  {
    method: "GET",
    path: "/station/{code}/live?hours=2",
    description: "Station board: arrivals/departures with expected times & delays.",
  },
  {
    method: "GET",
    path: "/stations/search?q=delhi",
    description: "Search stations by name or code prefix.",
  },
  {
    method: "GET",
    path: "/trains/between?from=NDLS&to=MMCT&type=XXX",
    description: "Direct trains between two stations with times, classes, days.",
  },
  {
    method: "GET",
    path: "/pnr/{10-digit-pnr}",
    description: "PNR status with passenger details, coach, berth, chart status.",
  },
];

const ENVELOPE_EXAMPLE = `{
  "status": "SUCCESS" | "STALE_DATA",
  "data": { ... },
  "meta": { "freshness": { "state": "LIVE", "confidence": "HIGH" } }
}`;

export default function ApiDocsPage() {
  return (
    <div className="pb-20">
      <PageHeader
        eyebrow="Developers"
        title="The API behind RailLens."
        description="Every screen in this app is powered by RailEngine — a free, developer-first Indian Railways API with honest freshness metadata."
      >
        <div className="mt-7 flex flex-wrap gap-2">
          <a
            href={`https://railengine.vercel.app/docs`}
            target="_blank"
            rel="noreferrer"
            className="btn-primary !px-4 !py-2.5 !text-xs"
          >
            <TerminalSquare className="h-4 w-4" /> Open RailEngine Docs
          </a>
          <a
            href={`https://railengine.vercel.app/docs/live-status`}
            target="_blank"
            rel="noreferrer"
            className="btn-ghost !py-2.5 !text-xs"
          >
            <Braces className="h-3.5 w-3.5" /> Live Status Reference
          </a>
        </div>
      </PageHeader>

      <section className="mx-auto mt-8 max-w-7xl px-5 sm:px-8">
        <div className="glass overflow-hidden rounded-2xl">
          <div className="border-b border-white/[0.06] px-5 py-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-display text-sm font-semibold text-white">RailEngine Endpoints</h2>
              <span className="font-mono text-[11px] text-white/35">{RAIL_ENGINE_BASE}</span>
            </div>
          </div>
          <ul className="divide-y divide-white/[0.055]">
            {ENDPOINTS.map((endpoint) => (
              <li key={endpoint.path} className="px-5 py-3.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded border border-mint/25 bg-mint/10 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-mint">
                    {endpoint.method}
                  </span>
                  <code className="break-all font-mono text-[12px] text-white/75">
                    {endpoint.path}
                  </code>
                </div>
                <p className="mt-1.5 text-[12px] leading-relaxed text-white/40">
                  {endpoint.description}
                </p>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5">
            <h3 className="text-[13px] font-semibold text-white">Response envelope</h3>
            <pre className="mt-3 overflow-x-auto rounded-xl bg-ink-950/70 p-4 font-mono text-[11px] leading-relaxed text-white/60">
              {ENVELOPE_EXAMPLE}
            </pre>
            <p className="mt-3 text-[11px] leading-relaxed text-white/40">
              Errors return <code className="font-mono">status: "ERROR"</code> with an
              <code className="font-mono">error.code</code> you can branch on.
            </p>
          </div>

          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5">
            <h3 className="text-[13px] font-semibold text-white">Notes</h3>
            <ul className="mt-3 space-y-2 text-[11.5px] leading-relaxed text-white/40">
              <li>• Live endpoint takes the train&apos;s origin start date, not today.</li>
              <li>• All endpoints require <code className="font-mono">x-api-key</code> header.</li>
              <li>• Freshness metadata: LIVE/RECENT/STALE + HIGH/MEDIUM/LOW confidence.</li>
              <li>• Rate limit: 60 req/min. Cache responses client-side.</li>
              <li>• Unofficial upstream; no SLA, no commercial use.</li>
            </ul>
            <a
              href="https://github.com/sanjusajan-creator/ntes-rail"
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex items-center gap-1 text-[11px] font-semibold text-saffron-soft hover:text-saffron"
            >
              Source on GitHub <ArrowUpRight className="h-3 w-3" />
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
