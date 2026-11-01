"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { RefreshCw, ShieldCheck, Ticket } from "lucide-react";
import { PageHeader } from "@/components/section-heading";
import { PnrView } from "@/components/pnr-view";
import { ErrorState } from "@/components/error-state";
import { EmptyState } from "@/components/empty-state";
import { CardSkeleton } from "@/components/skeleton";
import { getPnrStatus } from "@/lib/api";
import type { PnrResponse } from "@/lib/types";

function PnrContent() {
  const params = useSearchParams();
  const initialPnr = params.get("pnr")?.replace(/\D/g, "").slice(0, 10) ?? "";

  const [pnr, setPnr] = useState(initialPnr);
  const [data, setData] = useState<PnrResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const requestRef = useRef(0);
  const bootstrapped = useRef(false);

  const load = useCallback(async (value: string) => {
    if (!/^\d{10}$/.test(value)) return;
    const requestId = ++requestRef.current;
    setLoading(true);
    setError(null);
    try {
      const response = await getPnrStatus(value);
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
    if (bootstrapped.current || !initialPnr) return;
    bootstrapped.current = true;
    void load(initialPnr);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!/^\d{10}$/.test(pnr)) {
      setError(new Error("PNR must be exactly 10 digits."));
      return;
    }
    void load(pnr);
  };

  return (
    <div className="pb-20">
      <PageHeader
        eyebrow="Ticket status"
        title="Your PNR, decoded."
        description="Confirmation, RAC, waitlist, coach and berth for every passenger. The railway captcha is solved automatically — no forms, no redirects."
      >
        <form onSubmit={handleSubmit} className="mt-8">
          <div className="glass rounded-2xl p-4 sm:p-5">
            <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
              <div>
                <label
                  htmlFor="pnr-input"
                  className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.16em] text-white/40"
                >
                  PNR number
                </label>
                <div className="relative">
                  <Ticket className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
                  <input
                    id="pnr-input"
                    value={pnr}
                    onChange={(event) => setPnr(event.target.value.replace(/\D/g, "").slice(0, 10))}
                    placeholder="e.g. 6410603220"
                    inputMode="numeric"
                    autoComplete="off"
                    className="input-base pl-10 font-mono text-[15px] tracking-[0.22em]"
                  />
                </div>
                <div className="mt-2 flex items-center gap-1.5 text-[11px] text-white/35">
                  <ShieldCheck className="h-3 w-3 text-mint" />
                  Captcha handled automatically · {pnr.length}/10 digits
                </div>
              </div>
              <button type="submit" className="btn-primary h-[46px] w-full sm:w-auto" disabled={loading}>
                {loading ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" /> Checking
                  </>
                ) : (
                  <>
                    <Ticket className="h-4 w-4" /> Check PNR
                  </>
                )}
              </button>
            </div>

            <div className="mt-4 flex flex-wrap gap-1.5 border-t border-white/[0.06] pt-4">
              <span className="chip">PNR is private — never share it publicly</span>
              <span className="chip">Data is fetched live and not stored</span>
            </div>
          </div>
        </form>
      </PageHeader>

      <section className="mx-auto mt-8 max-w-7xl px-5 sm:px-8">
        {loading ? (
          <div className="space-y-4">
            <CardSkeleton />
            <p className="text-center text-[11px] text-white/30">
              Solving the captcha and fetching your booking… usually 3–8 seconds.
            </p>
          </div>
        ) : error ? (
          <ErrorState error={error} onRetry={() => void load(pnr)} />
        ) : data ? (
          <PnrView data={data} />
        ) : (
          <EmptyState
            icon={Ticket}
            title="Enter your 10-digit PNR"
            description="You'll find the PNR on your ticket, in the IRCTC app, or in the booking confirmation SMS."
          />
        )}
      </section>
    </div>
  );
}

export default function PnrPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-7xl px-5 pt-32 sm:px-8">
          <CardSkeleton />
        </div>
      }
    >
      <PnrContent />
    </Suspense>
  );
}
