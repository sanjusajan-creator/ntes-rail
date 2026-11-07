export interface ApiEnvelope<T> {
  ok: boolean;
  cached?: boolean;
  data: T;
}

export interface ApiErrorBody {
  ok: false;
  error: {
    code: string;
    message: string;
    detail?: string;
  };
}

// Freshness and confidence from RailEngine
export type Freshness = "LIVE" | "RECENT" | "STALE";
export type Confidence = "HIGH" | "MEDIUM" | "LOW";

export interface FreshnessMeta {
  freshness: Freshness;
  confidence: Confidence;
  observedAt?: string;
  source?: string;
}

export interface StationRef {
  code: string;
  name: string;
  aliases?: string[];
  lat?: number;
  lon?: number;
  state?: string;
  zone?: string;
  division?: string;
}

export interface TrainRef {
  number: string;
  name: string;
  source: StationRef;
  destination: StationRef;
}

export interface SearchResult extends TrainRef {
  type?: string;
  typeLabel?: string;
}

export interface SearchResponse {
  query: string;
  count: number;
  trains: SearchResult[];
}

// Train Info / Schedule
export interface ScheduleStation {
  seq: number;
  code: string;
  name: string;
  arrival?: string | null;
  departure?: string | null;
  halt?: number;
  day?: number;
  distance?: number;
  platform?: string | null;
  lat?: number;
  lon?: number;
}

export interface TrainSchedule {
  train: TrainRef & {
    type?: string;
    typeLabel?: string;
    daysOfRun?: string;
    classes?: string;
    travelTime?: string;
    validFrom?: string | null;
    runningDates?: string[];
  };
  stations: ScheduleStation[];
}

// Route (with actual times)
export interface RouteStation {
  seq: number;
  code: string;
  name: string;
  scheduledArrival?: string | null;
  scheduledDeparture?: string | null;
  actualArrival?: string | null;
  actualDeparture?: string | null;
  halt?: boolean;
  day?: number;
  distance?: number;
  platform?: string | null;
  lat?: number;
  lon?: number;
}

export interface TrainRoute {
  train: TrainRef;
  stations: RouteStation[];
}

// Live Status
export type StationState = "passed" | "current" | "upcoming" | "at-station" | "departed" | "scheduled";

export interface LiveStation {
  seq: number;
  code: string;
  name: string;
  scheduledArrival?: string | null;
  scheduledDeparture?: string | null;
  expectedArrival?: string | null;
  expectedDeparture?: string | null;
  actualArrival?: string | null;
  actualDeparture?: string | null;
  delayArrival?: number | null;
  delayDeparture?: number | null;
  platform?: string | null;
  distance?: number;
  state: StationState;
  day?: number | null;
  halt?: number | null;
}

export interface LiveRun {
  startDate?: string | null;
  delayMinutes?: number | null;
  delayText?: string;
  statusText?: string;
  lastUpdate?: string;
  lastStation?: StationRef | null;
  nextStation?: StationRef | null;
  currentSeq?: number;
  nextSeq?: number;
  totalStations?: number;
  arrivedAtDestination?: boolean;
  progressPercent?: number;
  distanceDone?: number;
  distanceTotal?: number;
  alert?: string | null;
  gps?: {
    lat: number;
    lon: number;
    speed?: number;
    observedAt: string;
  };
  freshness?: Freshness;
  confidence?: Confidence;
}

export interface LiveResponse {
  train: TrainRef;
  run: LiveRun;
  stations: LiveStation[];
  meta?: FreshnessMeta;
}

// Station Board
export interface StationBoardTrain {
  number: string;
  name: string;
  type?: string;
  typeLabel?: string;
  source: StationRef;
  destination: StationRef;
  scheduledArrival?: string | null;
  scheduledDeparture?: string | null;
  expectedArrival?: string | null;
  expectedDeparture?: string | null;
  delayArrival?: number | null;
  delayDeparture?: number | null;
  platform?: string | null;
  state?: StationState;
  cancelled?: boolean;
  freshness?: Freshness;
  confidence?: Confidence;
}

export interface StationBoardResponse {
  station: StationRef;
  hours: number;
  trains: StationBoardTrain[];
}

// Between
export interface BetweenTrain {
  number: string;
  name: string;
  type?: string;
  typeLabel?: string;
  source: StationRef;
  destination: StationRef;
  boarding: StationRef;
  alighting: StationRef;
  departureTime?: string | null;
  arrivalTime?: string | null;
  travelTime?: string;
  daysOfRun?: string;
  classes?: string;
}

export interface BetweenResponse {
  from: StationRef;
  to: StationRef;
  trainType?: string;
  trainTypeLabel?: string;
  count: number;
  trains: BetweenTrain[];
}

// PNR
export interface PnrPassenger {
  number: number;
  bookingStatus: string;
  bookingBerth: string;
  bookingCoach: string;
  currentStatus: string;
  currentStatusDetails: string;
  currentCoach: string;
  currentBerth: string;
  coachPosition?: string | null;
}

export interface PnrResponse {
  pnr: string;
  found: boolean;
  error?: string;
  trainNumber?: string | null;
  trainName?: string | null;
  journeyDate?: string | null;
  boardingStation?: string | null;
  reservationUpto?: string | null;
  chartPrepared?: boolean | string | null;
  class?: string | null;
  quota?: string | null;
  farePaid?: number | null;
  passengers?: PnrPassenger[];
}

// Coach Composition
export interface CoachInfo {
  position: number;
  coachNumber: string;
  type: string;
  class: string;
  berthLayout?: string;
}

export interface CoachCompositionResponse {
  train: TrainRef;
  coaches: CoachInfo[];
  formation?: string;
  reversals?: Array<{
    stationCode: string;
    stationName: string;
    directionChange: boolean;
  }>;
  legs?: Array<{
    from: string;
    to: string;
    coaches: CoachInfo[];
  }>;
}

// Fare
export interface FareBreakdown {
  baseFare: number;
  reservationCharge: number;
  superfastCharge: number;
  gst: number;
  tatkalCharge?: number;
  dynamicFare?: number;
  total: number;
  distance?: number;
}

export interface FareResponse {
  train: TrainRef;
  date: string;
  class: string;
  quota: string;
  breakdown: FareBreakdown;
}

// Platforms
export interface PlatformInfo {
  stationCode: string;
  stationName: string;
  platform: string;
  confidence?: string;
  feedbackCount?: number;
}

export interface PlatformsResponse {
  train: TrainRef;
  platforms: PlatformInfo[];
}

// Coverage
export interface CoverageResponse {
  capabilities: Record<string, {
    available: boolean;
    verified: string;
    source?: string;
  }>;
  stations: {
    count: number;
    verified: string;
  };
  trains: {
    count: number;
    verified: string;
  };
}

// Provider Health
export interface ProviderHealthItem {
  name: string;
  state: string;
  latencyMs?: number;
  lastSuccess?: string | null;
  lastFailure?: string | null;
  errorCount?: number;
  capabilities?: string[];
  note?: string;
}

export interface ProviderHealthResponse {
  providers: ProviderHealthItem[];
}