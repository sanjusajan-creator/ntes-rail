import type {
  ApiEnvelope,
  BetweenResponse,
  CoachCompositionResponse,
  FareResponse,
  LiveResponse,
  PlatformsResponse,
  PnrResponse,
  SearchResponse,
  StationBoardResponse,
  StationRef,
  TrainRef,
  TrainRoute,
  TrainSchedule,
} from "./types";

const RAIL_ENGINE_BASE = "https://railway-engine.apkscope.workers.dev/v1";
const API_KEY = process.env.NEXT_PUBLIC_RAIL_ENGINE_KEY;

if (!API_KEY) {
  console.warn("[raillens] NEXT_PUBLIC_RAIL_ENGINE_KEY not set - API calls will fail");
}

export class ApiError extends Error {
  code: string;
  status: number;
  detail?: string;

  constructor(message: string, code = "unknown", status = 0, detail?: string) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.status = status;
    this.detail = detail;
  }
}

interface RequestOptions {
  timeoutMs?: number;
  retries?: number;
  signal?: AbortSignal;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function mapStatus(status: string): "SUCCESS" | "STALE_DATA" | "ERROR" | "RATE_LIMITED" {
  switch (status) {
    case "SUCCESS":
    case "STALE_DATA":
    case "RATE_LIMITED":
      return status;
    default:
      return "ERROR";
  }
}

async function request<T>(path: string, params?: Record<string, string>, options: RequestOptions = {}): Promise<ApiEnvelope<T>> {
  const { timeoutMs = 30000, retries = 1, signal } = options;
  let lastError: unknown = null;

  const url = new URL(`${RAIL_ENGINE_BASE}${path}`);
  if (params) Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    const abortHandler = () => controller.abort();
    if (signal) signal.addEventListener("abort", abortHandler);
    const startedAt = Date.now();

    try {
      const response = await fetch(url.toString(), {
        headers: {
          Accept: "application/json",
          "x-api-key": API_KEY || "",
        },
        signal: controller.signal,
        cache: "no-store",
      });

      const elapsed = Date.now() - startedAt;
      let body: unknown = null;
      try {
        body = await response.json();
      } catch {
        body = null;
      }

      const envelope = body as ApiEnvelope<T> | null;

      if (!response.ok || !envelope || (envelope.status !== "SUCCESS" && envelope.status !== "STALE_DATA")) {
        const errorCode = envelope?.error?.code || "http_error";
        const errorMessage = envelope?.error?.message || `Request failed (HTTP ${response.status})`;
        throw new ApiError(
          errorMessage,
          errorCode,
          response.status,
          envelope?.error?.message,
        );
      }

      if (elapsed > 8000) {
        console.info(`[raillens] slow response (${elapsed}ms) for ${path}`);
      }

      return envelope as ApiEnvelope<T>;
    } catch (error) {
      lastError = error;
      const isAbort = error instanceof DOMException && error.name === "AbortError";
      const isApiError = error instanceof ApiError;

      if (isApiError && error.status >= 400 && error.status < 500) {
        throw error;
      }
      if (attempt < retries && !signal?.aborted) {
        await sleep(isAbort ? 800 : 1200);
        continue;
      }
      break;
    } finally {
      clearTimeout(timer);
      if (signal) signal.removeEventListener("abort", abortHandler);
    }
  }

  if (lastError instanceof ApiError) throw lastError;
  if (lastError instanceof DOMException && lastError.name === "AbortError") {
    throw new ApiError("The request timed out.", "timeout", 0);
  }
  throw new ApiError("Could not reach the API. Check your connection.", "network_error", 0);
}

export interface SearchOptions {
  signal?: AbortSignal;
  retries?: number;
}

export async function searchTrains(query: string, options: SearchOptions = {}): Promise<SearchResponse> {
  const data = await request<SearchResponse>(`/trains/search`, { q: query }, {
    retries: 0,
    timeoutMs: 20000,
    signal: options.signal,
  });
  return data.data;
}

export async function getTrainInfo(trainNo: string, options: SearchOptions = {}): Promise<TrainSchedule> {
  const data = await request<TrainSchedule>(`/train/${encodeURIComponent(trainNo)}/schedule`, {}, {
    signal: options.signal,
    retries: options.retries ?? 1,
  });
  return data.data;
}

export async function getSchedule(trainNo: string, date?: string, options: SearchOptions = {}): Promise<TrainSchedule> {
  const params: Record<string, string> = {};
  if (date) params.date = date;
  const data = await request<TrainSchedule>(`/train/${encodeURIComponent(trainNo)}/schedule`, params, {
    signal: options.signal,
    retries: options.retries ?? 1,
  });
  return data.data;
}

export async function getRoute(trainNo: string, date?: string, options: SearchOptions = {}): Promise<TrainRoute> {
  const params: Record<string, string> = {};
  if (date) params.date = date;
  const data = await request<TrainRoute>(`/train/${encodeURIComponent(trainNo)}/route`, params, {
    signal: options.signal,
    retries: options.retries ?? 1,
  });
  return data.data;
}

export async function getLiveStatus(
  trainNo: string,
  date?: string,
  options: SearchOptions = {},
): Promise<LiveResponse> {
  const params: Record<string, string> = {};
  if (date) params.date = date;
  const data = await request<LiveResponse>(`/train/${encodeURIComponent(trainNo)}/status`, params, {
    signal: options.signal,
    retries: options.retries ?? 1,
  });
  return data.data;
}

export async function getCoaches(trainNo: string, options: SearchOptions = {}): Promise<CoachCompositionResponse> {
  const data = await request<CoachCompositionResponse>(`/train/${encodeURIComponent(trainNo)}/coaches`, {}, {
    signal: options.signal,
    retries: options.retries ?? 1,
  });
  return data.data;
}

export async function getFare(
  trainNo: string,
  date: string,
  class_: string,
  quota: string,
  options: SearchOptions = {},
): Promise<FareResponse> {
  const data = await request<FareResponse>(`/train/${encodeURIComponent(trainNo)}/fare`, {
    date,
    class: class_,
    quota,
  }, { signal: options.signal, retries: options.retries ?? 1 });
  return data.data;
}

export async function getPlatforms(trainNo: string, options: SearchOptions = {}): Promise<PlatformsResponse> {
  const data = await request<PlatformsResponse>(`/train/${encodeURIComponent(trainNo)}/platforms`, {}, {
    signal: options.signal,
    retries: options.retries ?? 1,
  });
  return data.data;
}

export async function getStationByCode(stationCode: string, options: SearchOptions = {}): Promise<StationRef> {
  const data = await request<StationRef>(`/station/${encodeURIComponent(stationCode)}`, {}, {
    signal: options.signal,
    retries: options.retries ?? 1,
  });
  return data.data;
}

export async function searchStations(query: string, options: SearchOptions = {}): Promise<{ count: number; stations: StationRef[] }> {
  const data = await request<{ count: number; stations: StationRef[] }>(`/stations/search`, { q: query }, {
    retries: 0,
    timeoutMs: 20000,
    signal: options.signal,
  });
  return data.data;
}

export async function getStationBoard(
  stationCode: string,
  hours = 2,
  options: SearchOptions = {},
): Promise<StationBoardResponse> {
  const data = await request<StationBoardResponse>(`/station/${encodeURIComponent(stationCode)}/live`, {
    hours: String(hours),
  }, { signal: options.signal, retries: options.retries ?? 1 });
  return data.data;
}

export async function getTrainsBetween(
  from: string,
  to: string,
  trainType = "XXX",
  options: SearchOptions = {},
): Promise<BetweenResponse> {
  const data = await request<BetweenResponse>(`/trains/between`, {
    from,
    to,
    type: trainType,
  }, { signal: options.signal, retries: options.retries ?? 1 });
  return data.data;
}

export async function getPnrStatus(pnr: string, options: SearchOptions = {}): Promise<PnrResponse> {
  const data = await request<PnrResponse>(`/pnr/${encodeURIComponent(pnr)}`, {}, {
    signal: options.signal,
    retries: options.retries ?? 2,
    timeoutMs: 60000,
  });
  return data.data;
}