import type {
  ApiErrorBody,
  ApiEnvelope,
  BetweenResponse,
  LiveResponse,
  PnrResponse,
  ScheduleResponse,
  SearchResponse,
  StationBoardResponse,
  TrainInstancesResponse,
} from "./types";

const RAW_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8001";
export const API_BASE = RAW_BASE.replace(/\/+$/, "");

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

async function request<T>(path: string, options: RequestOptions = {}): Promise<ApiEnvelope<T>> {
  const { timeoutMs = 55000, retries = 1, signal } = options;
  let lastError: unknown = null;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    const abortHandler = () => controller.abort();
    if (signal) signal.addEventListener("abort", abortHandler);
    const startedAt = Date.now();

    try {
      const response = await fetch(`${API_BASE}${path}`, {
        headers: { Accept: "application/json" },
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

      if (!response.ok || (body && typeof body === "object" && "ok" in body && !(body as { ok: boolean }).ok)) {
        const errorBody = body as ApiErrorBody | null;
        throw new ApiError(
          errorBody?.error?.message || `Request failed (HTTP ${response.status})`,
          errorBody?.error?.code || "http_error",
          response.status,
          errorBody?.error?.detail,
        );
      }

      // A slow first response usually means a waking free instance. Keep it.
      if (elapsed > 8000) {
        // eslint-disable-next-line no-console
        console.info(`[raillens] slow response (${elapsed}ms) for ${path}`);
      }

      return body as ApiEnvelope<T>;
    } catch (error) {
      lastError = error;
      const isAbort =
        error instanceof DOMException && error.name === "AbortError";
      const isApiError = error instanceof ApiError;

      // Do not retry client-side validation or 4xx errors.
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
    throw new ApiError(
      "The request timed out. On the free tier the API sleeps after 15 minutes of inactivity - the first request can take up to a minute while it wakes up.",
      "timeout",
      0,
    );
  }
  throw new ApiError(
    "Could not reach the API. Check your connection or that the backend is running.",
    "network_error",
    0,
  );
}

export interface SearchOptions {
  signal?: AbortSignal;
  retries?: number;
}

export async function searchTrains(query: string, options: SearchOptions = {}) {
  const data = await request<SearchResponse>(
    `/api/search?q=${encodeURIComponent(query)}`,
    { retries: 0, timeoutMs: 30000, signal: options.signal },
  );
  return data.data;
}

export async function getTrainInstances(trainNo: string, options: SearchOptions = {}) {
  const data = await request<TrainInstancesResponse>(
    `/api/train/${encodeURIComponent(trainNo)}/instances`,
    { signal: options.signal, retries: options.retries ?? 1 },
  );
  return data.data;
}

export async function getLiveStatus(
  trainNo: string,
  date?: string,
  options: SearchOptions = {},
) {
  const query = date ? `?date=${encodeURIComponent(date)}` : "";
  const data = await request<LiveResponse>(
    `/api/train/${encodeURIComponent(trainNo)}/live${query}`,
    { signal: options.signal, retries: options.retries ?? 1 },
  );
  return data.data;
}

export async function getSchedule(
  trainNo: string,
  date?: string,
  options: SearchOptions = {},
) {
  const query = date ? `?date=${encodeURIComponent(date)}` : "";
  const data = await request<ScheduleResponse>(
    `/api/train/${encodeURIComponent(trainNo)}/schedule${query}`,
    { signal: options.signal, retries: options.retries ?? 1 },
  );
  return data.data;
}

export async function getStationBoard(
  stationCode: string,
  hours = 2,
  options: SearchOptions = {},
) {
  const data = await request<StationBoardResponse>(
    `/api/station/${encodeURIComponent(stationCode)}?hours=${hours}`,
    { signal: options.signal, retries: options.retries ?? 1 },
  );
  return data.data;
}

export async function getTrainsBetween(
  from: string,
  to: string,
  trainType = "XXX",
  options: SearchOptions = {},
) {
  const params = new URLSearchParams({ from, to, train_type: trainType });
  const data = await request<BetweenResponse>(`/api/between?${params.toString()}`, {
    signal: options.signal,
    retries: options.retries ?? 1,
  });
  return data.data;
}

export async function getPnrStatus(pnr: string, options: SearchOptions = {}) {
  const data = await request<PnrResponse>(`/api/pnr/${encodeURIComponent(pnr)}`, {
    signal: options.signal,
    retries: options.retries ?? 2,
    timeoutMs: 60000,
  });
  return data.data;
}
