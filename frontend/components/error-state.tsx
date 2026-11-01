"use client";

import { AlertTriangle, RefreshCw, ServerCrash, WifiOff } from "lucide-react";
import { ApiError } from "@/lib/api";

export function ErrorState({
  error,
  onRetry,
  title,
}: {
  error: unknown;
  onRetry?: () => void;
  title?: string;
}) {
  const apiError = error instanceof ApiError ? error : null;
  const code = apiError?.code ?? "unknown";
  const message =
    apiError?.message ??
    (error instanceof Error ? error.message : "Something went wrong. Please try again.");

  const notFound = code === "no_run" || code === "not_found";
  const Icon =
    notFound
      ? AlertTriangle
      : code === "upstream_timeout" || code === "timeout"
        ? ServerCrash
        : code === "network_error"
          ? WifiOff
          : AlertTriangle;

  const coldStart = ["timeout", "upstream_timeout", "network_error", "upstream_unreachable"].includes(code);

  return (
    <div className="glass rounded-2xl border-danger/20 p-6 sm:p-8">
      <div className="flex items-start gap-4">
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-danger/25 bg-danger/10 text-danger">
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-display text-base font-semibold text-white">
            {title ?? (notFound ? "No matching data" : coldStart ? "The free server is waking up" : "That didn't work")}
          </h3>
          <p className="mt-1.5 text-sm leading-relaxed text-white/55">{message}</p>

          {coldStart && (
            <p className="mt-2 rounded-lg border border-saffron/20 bg-saffron/[0.06] px-3 py-2 text-xs leading-relaxed text-saffron-soft/90">
              On the free tier the API sleeps when idle. The first request after a pause can take
              up to 60 seconds - tap retry and it should respond.
            </p>
          )}

          {apiError?.detail && (
            <details className="mt-3 text-xs text-white/35">
              <summary className="cursor-pointer select-none">Technical detail</summary>
              <p className="mt-1 break-words font-mono text-[11px] leading-relaxed">
                {apiError.detail}
              </p>
            </details>
          )}

          <div className="mt-4 flex flex-wrap items-center gap-2">
            {onRetry && (
              <button type="button" onClick={onRetry} className="btn-primary !px-4 !py-2 !text-xs">
                <RefreshCw className="h-3.5 w-3.5" />
                Retry
              </button>
            )}
            <span className="chip font-mono uppercase tracking-wider">{code}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
