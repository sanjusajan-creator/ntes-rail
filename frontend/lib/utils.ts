import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Current date in Indian Standard Time as YYYY-MM-DD. */
export function todayISO(): string {
  const now = new Date();
  const ist = new Date(now.getTime() + (330 + now.getTimezoneOffset()) * 60000);
  return ist.toISOString().slice(0, 10);
}

export function addDaysISO(iso: string, days: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export function formatDateHuman(iso?: string | null): string {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  const date = new Date(Date.UTC(y, m - 1, d));
  return date.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    timeZone: "UTC",
  });
}

export function formatDelay(minutes?: number | null): string {
  if (minutes === null || minutes === undefined) return "—";
  if (minutes <= 0) return "On time";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h && m) return `${h}h ${m}m late`;
  if (h) return `${h}h late`;
  return `${m}m late`;
}

export function delayTone(minutes?: number | null): "ontime" | "slight" | "late" | "unknown" {
  if (minutes === null || minutes === undefined) return "unknown";
  if (minutes <= 0) return "ontime";
  if (minutes <= 15) return "slight";
  return "late";
}

export function delayClasses(tone: ReturnType<typeof delayTone>): string {
  switch (tone) {
    case "ontime":
      return "border-mint/30 bg-mint/10 text-mint";
    case "slight":
      return "border-saffron-soft/30 bg-saffron-soft/10 text-saffron-soft";
    case "late":
      return "border-danger/30 bg-danger/10 text-danger";
    default:
      return "border-white/10 bg-white/[0.04] text-white/60";
  }
}

export function isCNF(status?: string | null): boolean {
  if (!status) return false;
  const normalized = status.trim().toUpperCase();
  return normalized.startsWith("CNF") || normalized.startsWith("CONFIRM");
}

export function statusTone(status?: string | null): string {
  const normalized = (status || "").trim().toUpperCase();
  if (normalized.startsWith("CNF") || normalized.startsWith("CONFIRM")) {
    return "border-mint/30 bg-mint/10 text-mint";
  }
  if (normalized.startsWith("WL") || normalized.includes("WAIT")) {
    return "border-saffron-soft/30 bg-saffron-soft/10 text-saffron-soft";
  }
  if (normalized.startsWith("RAC")) {
    return "border-electric/30 bg-electric/10 text-electric-soft";
  }
  if (normalized.startsWith("CAN") || normalized.includes("CANCEL")) {
    return "border-danger/30 bg-danger/10 text-danger";
  }
  return "border-white/10 bg-white/[0.04] text-white/60";
}

export function titleCase(value?: string | null): string {
  if (!value) return "—";
  return value
    .toLowerCase()
    .split(" ")
    .map((word) => (word ? word[0].toUpperCase() + word.slice(1) : word))
    .join(" ");
}
