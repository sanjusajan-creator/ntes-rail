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

export interface StationRef {
  code: string;
  name: string;
  nameHindi?: string | null;
}

export interface TrainRef {
  number: string;
  name: string;
  nameHindi?: string | null;
  type?: string;
  typeLabel?: string;
  source: StationRef;
  destination: StationRef;
}

export interface SearchResult extends TrainRef {
  type: string;
  typeLabel: string;
}

export interface SearchResponse {
  query: string;
  count: number;
  trains: SearchResult[];
}

export interface TrainInstance {
  startDate: string;
  startDateISO: string;
  status?: number;
  position: string;
  exception?: string | null;
}

export interface TrainInfo extends TrainRef {
  instances: TrainInstance[];
}

export interface TrainInstancesResponse {
  number: string;
  name: string;
  source: StationRef;
  destination: StationRef;
  instances: Array<{
    startDate: string;
    startDateISO: string;
    status?: number;
    position: string;
    exception?: string | null;
  }>;
  suggestedDate?: string | null;
}

export interface ScheduleStation {
  seq: number;
  code: string;
  name: string;
  nameHindi?: string | null;
  arrival?: string | null;
  departure?: string | null;
  halt: number;
  day: number;
  distance: number;
  platform?: string | null;
  dayOfRun?: string | null;
  isSource: boolean;
}

export interface ScheduleResponse {
  train: TrainRef & {
    daysOfRun: string;
    classes: string;
    travelTime: string;
    validFrom?: string | null;
    runningDates: string[];
  };
  stations: ScheduleStation[];
}

export type StationState = "passed" | "current" | "upcoming";

export interface LiveStation {
  seq: number;
  code: string;
  name: string;
  nameHindi?: string | null;
  scheduledArrival?: string | null;
  scheduledDeparture?: string | null;
  expectedArrival?: string | null;
  expectedDeparture?: string | null;
  actualArrival?: string | null;
  actualDeparture?: string | null;
  delayArrival?: number | null;
  delayDeparture?: number | null;
  platform?: string | null;
  distance: number;
  state: StationState;
  day?: number | null;
  halt?: number | null;
}

export interface LiveRun {
  startDate?: string | null;
  delayMinutes?: number | null;
  delayText: string;
  statusText: string;
  lastUpdate: string;
  lastUpdateFull: string;
  lastStation?: StationRef | null;
  nextStation?: StationRef | null;
  currentSeq: number;
  nextSeq: number;
  totalStations: number;
  arrivedAtDestination: boolean;
  progressPercent: number;
  distanceDone: number;
  distanceTotal: number;
  alert?: string | null;
}

export interface LiveResponse {
  train: TrainRef;
  run: LiveRun;
  stations: LiveStation[];
}

export interface StationBoardTrain {
  number: string;
  name: string;
  nameHindi?: string | null;
  type: string;
  typeLabel: string;
  source: StationRef;
  destination: StationRef;
  scheduledArrival?: string | null;
  scheduledDeparture?: string | null;
  expectedArrival?: string | null;
  expectedDeparture?: string | null;
  delayArrival?: number | null;
  delayDeparture?: number | null;
  platform?: string | null;
  startDate?: string | null;
  cancelled: boolean;
}

export interface StationBoardResponse {
  station: StationRef;
  hours: number;
  trains: StationBoardTrain[];
}

export interface BetweenTrain {
  number: string;
  name: string;
  nameHindi?: string | null;
  type: string;
  typeLabel: string;
  source: StationRef;
  destination: StationRef;
  boarding: StationRef;
  alighting: StationRef;
  departureTime?: string | null;
  arrivalTime?: string | null;
  travelTime: string;
  daysOfRun: string;
  classes: string;
}

export interface BetweenResponse {
  from: StationRef;
  to: StationRef;
  trainType: string;
  trainTypeLabel: string;
  count: number;
  trains: BetweenTrain[];
}

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
  passengers?: PnrPassenger[];
  raw?: unknown;
}
