"""NTES service layer: client wrapper, caching and response normalization."""
from __future__ import annotations

import os
import time
import threading
from datetime import datetime, timedelta, timezone
from typing import Any, Callable, Optional

from ntes import NTESClient
from ntes.exceptions import NTESError

NTES_TIMEOUT = int(os.getenv("NTES_TIMEOUT", "30"))
NTES_RETRIES = int(os.getenv("NTES_RETRIES", "3"))

_client: Optional[NTESClient] = None
_client_lock = threading.Lock()


def get_client() -> NTESClient:
    """Return a process-wide NTES client (safe to share across requests)."""
    global _client
    if _client is None:
        with _client_lock:
            if _client is None:
                _client = NTESClient(timeout=NTES_TIMEOUT, retries=NTES_RETRIES)
    return _client


# --------------------------------------------------------------------------
# Tiny TTL cache (per process). Cuts duplicate upstream calls and keeps the
# free backend fast for repeated lookups.
# --------------------------------------------------------------------------

class TTLCache:
    def __init__(self, maxsize: int = 512):
        self._data: dict[str, tuple[float, Any]] = {}
        self._lock = threading.Lock()
        self._maxsize = maxsize

    def get(self, key: str) -> Optional[Any]:
        with self._lock:
            item = self._data.get(key)
            if not item:
                return None
            expires_at, value = item
            if time.time() > expires_at:
                self._data.pop(key, None)
                return None
            return value

    def set(self, key: str, value: Any, ttl: float) -> None:
        with self._lock:
            if len(self._data) >= self._maxsize:
                # Drop expired entries first, then the oldest one.
                now = time.time()
                expired = [k for k, (exp, _) in self._data.items() if now > exp]
                for k in expired:
                    self._data.pop(k, None)
                if len(self._data) >= self._maxsize:
                    oldest = min(self._data.items(), key=lambda kv: kv[1][0])[0]
                    self._data.pop(oldest, None)
            self._data[key] = (time.time() + ttl, value)


cache = TTLCache()


def cached(key: str, ttl: float, producer: Callable[[], Any]) -> tuple[Any, bool]:
    """Return (value, was_cached)."""
    hit = cache.get(key)
    if hit is not None:
        return hit, True
    value = producer()
    cache.set(key, value, ttl)
    return value, False


# --------------------------------------------------------------------------
# Helpers
# --------------------------------------------------------------------------

def iso_to_ntes(iso_date: str) -> str:
    """'2026-11-02' -> '02-Nov-2026' (NTES display format)."""
    return datetime.strptime(iso_date, "%Y-%m-%d").strftime("%d-%b-%Y")


def ntes_to_iso(ntes_date: str) -> str:
    """'02-Nov-2026' -> '2026-11-02'. Returns '' when unparseable."""
    try:
        return datetime.strptime(ntes_date.strip(), "%d-%b-%Y").strftime("%Y-%m-%d")
    except (ValueError, AttributeError):
        return ""


def today_iso() -> str:
    """Today's date in IST (railways run on IST)."""
    ist = timezone(timedelta(hours=5, minutes=30))
    return datetime.now(ist).strftime("%Y-%m-%d")


def tomorrow_iso() -> str:
    ist = timezone(timedelta(hours=5, minutes=30))
    return (datetime.now(ist) + timedelta(days=1)).strftime("%Y-%m-%d")


def to_int(value: Any, default: int = 0) -> int:
    try:
        return int(str(value).strip())
    except (TypeError, ValueError):
        return default


def delay_minutes(text: Any) -> Optional[int]:
    """Parse delay strings: '00:11' -> 11, 'On Time' -> 0, '' -> None."""
    if text is None:
        return None
    raw = str(text).strip()
    if not raw:
        return None
    low = raw.lower()
    if "on time" in low:
        return 0
    if ":" in raw:
        parts = raw.split(":")
        try:
            if len(parts) == 2:
                return int(parts[0]) * 60 + int(parts[1])
            if len(parts) == 3:
                return int(parts[0]) * 3600 + int(parts[1]) * 60 + int(parts[2])
        except ValueError:
            return None
    try:
        return int(raw)
    except ValueError:
        return None


def human_delay(minutes: Optional[int]) -> str:
    if minutes is None:
        return "—"
    if minutes <= 0:
        return "On time"
    hours, mins = divmod(minutes, 60)
    if hours and mins:
        return f"{hours}h {mins}m late"
    if hours:
        return f"{hours}h late"
    return f"{mins}m late"


def clean_time(value: Any) -> Optional[str]:
    if value is None:
        return None
    raw = str(value).strip()
    if not raw or raw.lower() in {
        "source",
        "destination",
        "src",
        "dstn",
        "dest",
        "origin",
        "terminus",
        "terminal",
    }:
        return None
    return raw


def train_type_label(code: str) -> str:
    return {
        "RAJ": "Rajdhani",
        "SHT": "Shatabdi",
        "DUR": "Duronto",
        "VAN": "Vande Bharat",
        "SUF": "Superfast",
        "EXP": "Express",
        "PAS": "Passenger",
        "EMU": "EMU",
        "MEMU": "MEMU",
        "TOD": "Train on Demand",
        "SF": "Superfast",
        "JSHT": "Jan Shatabdi",
        "GAR": "Garib Rath",
        "HUM": "Humsafar",
        "ANT": "Antyodaya",
        "TEJ": "Tejas",
        "DDN": "Deendayalu",
    }.get((code or "").upper(), (code or "Train").title())


# --------------------------------------------------------------------------
# Normalizers
# --------------------------------------------------------------------------

def normalize_search_item(item: dict) -> dict:
    return {
        "number": item.get("TrainNumber", ""),
        "name": item.get("TrainName", ""),
        "nameHindi": item.get("TrainHindiName") or None,
        "type": item.get("Type", ""),
        "typeLabel": train_type_label(item.get("Type", "")),
        "source": {
            "code": item.get("Source", ""),
            "name": item.get("SourceName", ""),
            "nameHindi": item.get("SourceHindi") or None,
        },
        "destination": {
            "code": item.get("Destination", ""),
            "name": item.get("DestinationName", ""),
            "nameHindi": item.get("DestinationHindi") or None,
        },
    }


def normalize_search(raw: dict) -> dict:
    trains = [normalize_search_item(t) for t in (raw.get("Trains") or [])]
    return {"query": None, "count": len(trains), "trains": trains}


def normalize_schedule(raw: dict) -> dict:
    stations = []
    for s in raw.get("stations") or []:
        stations.append({
            "seq": to_int(s.get("Sr")),
            "code": s.get("StationCode", ""),
            "name": s.get("StationName", ""),
            "nameHindi": s.get("StationHindiName") or None,
            "arrival": clean_time(s.get("STA")),
            "departure": clean_time(s.get("STD")),
            "halt": to_int(s.get("Halt")),
            "day": to_int(s.get("Day"), 1),
            "distance": to_int(s.get("Distance")),
            "platform": clean_time(s.get("Platform")),
            "dayOfRun": s.get("DayOfRun") or None,
            "isSource": to_int(s.get("Sr")) == 1,
        })
    return {
        "train": {
            "number": raw.get("TrainNumber", ""),
            "name": raw.get("TrainName", ""),
            "nameHindi": raw.get("TrainHindiName") or None,
            "type": raw.get("TrainType", ""),
            "typeLabel": train_type_label(raw.get("TrainType", "")),
            "source": {
                "code": raw.get("Source", ""),
                "name": raw.get("SourceName", ""),
                "nameHindi": raw.get("SourceHindiName") or None,
            },
            "destination": {
                "code": raw.get("Destination", ""),
                "name": raw.get("DestinationName", ""),
                "nameHindi": raw.get("DestinationHindiName") or None,
            },
            "daysOfRun": raw.get("DaysOfRun") or "",
            "classes": raw.get("ClassOfTravel") or "",
            "travelTime": raw.get("TravelTime") or "",
            "validFrom": ntes_to_iso(raw.get("ValidFrom") or "") or None,
            "runningDates": [
                ntes_to_iso(d) for d in (raw.get("vStartDateList") or []) if ntes_to_iso(d)
            ],
        },
        "stations": stations,
    }


def normalize_live(raw: dict) -> dict:
    last_code = (raw.get("LSTN") or "").upper()
    arrived = bool(raw.get("isArrDSTN"))
    stations = []

    for s in raw.get("STNS") or []:
        code = (s.get("SC") or "").upper()
        if bool(s.get("ISD")):
            state = "passed"
        elif bool(s.get("ISA")):
            state = "current"
        else:
            state = "upcoming"

        # The last reported station is the best "you are here" marker, even if
        # NTES already flagged it as departed (train is between stations).
        if last_code and code == last_code:
            state = "current"

        stations.append({
            "seq": to_int(s.get("Sr")),
            "code": s.get("SC", ""),
            "name": s.get("SN", ""),
            "nameHindi": s.get("SHN") or None,
            "scheduledArrival": clean_time(s.get("STA")),
            "scheduledDeparture": clean_time(s.get("STD")),
            "expectedArrival": clean_time(s.get("ETA")),
            "expectedDeparture": clean_time(s.get("ETD")),
            "actualArrival": clean_time(s.get("DARR")),
            "actualDeparture": clean_time(s.get("DDEP")),
            "delayArrival": delay_minutes(s.get("DARR")),
            "delayDeparture": delay_minutes(s.get("DDEP")),
            "platform": clean_time(s.get("PF")),
            "distance": to_int(s.get("DIST")),
            "state": state,
        })

    total = len(stations)
    distance_total = to_int(raw.get("TTLDIST"))
    distance_done = to_int(raw.get("LDSRC"))
    delay = delay_minutes(raw.get("LDEL"))

    current_index = 0
    for index, station in enumerate(stations, start=1):
        if station["state"] == "current":
            current_index = index
    if current_index == 0:
        passed_indices = [
            index for index, station in enumerate(stations, start=1)
            if station["state"] == "passed"
        ]
        current_index = passed_indices[-1] if passed_indices else 0

    last_station = next(
        (st for st in stations if st["code"].upper() == last_code), None
    ) or next((st for st in stations if st["seq"] == current_index), None)
    next_station = next(
        (st for st in stations if st["seq"] == current_index + 1), None
    )

    if distance_total > 0:
        progress = min(100.0, round((distance_done / distance_total) * 100, 1))
    elif total > 0:
        progress = round((current_index / total) * 100, 1)
    else:
        progress = 0.0

    return {
        "train": {
            "number": raw.get("TN", ""),
            "name": raw.get("TNM", ""),
            "nameHindi": raw.get("TNH") or None,
            "source": {
                "code": raw.get("SRC", ""),
                "name": raw.get("SRCN", ""),
                "nameHindi": raw.get("SRCHN") or None,
            },
            "destination": {
                "code": raw.get("DSTN", ""),
                "name": raw.get("DSTNN", ""),
                "nameHindi": raw.get("DSTNHN") or None,
            },
        },
        "run": {
            "startDate": ntes_to_iso(raw.get("STD") or "") or None,
            "delayMinutes": delay,
            "delayText": human_delay(delay),
            "statusText": raw.get("CPOS") or raw.get("LASTUPD") or "",
            "lastUpdate": raw.get("LUPDT") or raw.get("LTIME") or "",
            "lastUpdateFull": raw.get("LUPDFULL") or raw.get("LASTUPD") or "",
            "lastStation": {
                "code": last_station["code"],
                "name": last_station["name"],
            } if last_station else None,
            "nextStation": {
                "code": next_station["code"],
                "name": next_station["name"],
            } if next_station else None,
            "currentSeq": current_index,
            "nextSeq": current_index + 1 if current_index < total else 0,
            "totalStations": total,
            "arrivedAtDestination": arrived,
            "progressPercent": progress,
            "distanceDone": distance_done,
            "distanceTotal": distance_total,
            "alert": raw.get("AlertMsg") or None,
        },
        "stations": stations,
    }


def normalize_train_info(raw: dict) -> dict:
    instances = []
    for inst in raw.get("vInstanceList") or []:
        instances.append({
            "startDate": inst.get("startDate", ""),
            "startDateISO": ntes_to_iso(inst.get("startDate") or ""),
            "status": inst.get("trainStatus"),
            "position": inst.get("trainPosition") or "",
            "exception": inst.get("excpMsg") or None,
        })
    return {
        "number": raw.get("TrainNo", ""),
        "name": raw.get("TrainName", ""),
        "nameHindi": raw.get("TrainNameHindi") or None,
        "source": {
            "code": raw.get("Src", ""),
            "name": raw.get("SrcName", ""),
            "nameHindi": raw.get("SrcNameHindi") or None,
        },
        "destination": {
            "code": raw.get("Dstn", ""),
            "name": raw.get("DstnName", ""),
            "nameHindi": raw.get("DstnNameHindi") or None,
        },
        "instances": instances,
    }


def normalize_station_board(raw: dict) -> dict:
    trains = []
    for t in raw.get("TrainsAtStation") or []:
        cancelled = to_int(t.get("Cancel")) == 1 or to_int(t.get("ArrCancelFlag")) == 1
        trains.append({
            "number": t.get("TrainNumber", ""),
            "name": t.get("TrainName", ""),
            "nameHindi": t.get("TrainHindiName") or None,
            "type": t.get("TrainType", ""),
            "typeLabel": t.get("TrainTypeDesc") or train_type_label(t.get("TrainType", "")),
            "source": {
                "code": t.get("Source", ""),
                "name": t.get("SourceName", ""),
            },
            "destination": {
                "code": t.get("Destination", ""),
                "name": t.get("DestinationName", ""),
            },
            "scheduledArrival": clean_time(t.get("STA")),
            "scheduledDeparture": clean_time(t.get("STD")),
            "expectedArrival": clean_time(t.get("ETA")),
            "expectedDeparture": clean_time(t.get("ETD")),
            "delayArrival": delay_minutes(t.get("DelayArr")),
            "delayDeparture": delay_minutes(t.get("DelayDep")),
            "platform": clean_time(t.get("Platform")),
            "startDate": ntes_to_iso(t.get("StartDate") or "") or None,
            "cancelled": cancelled,
        })
    return {
        "station": {
            "code": raw.get("Station", ""),
            "name": raw.get("StationName", ""),
        },
        "trains": trains,
    }


def normalize_trains_between(raw: dict) -> dict:
    trains = []
    for t in raw.get("Trains") or []:
        trains.append({
            "number": t.get("TrainNumber", ""),
            "name": t.get("TrainName", ""),
            "nameHindi": t.get("TrainHindiName") or None,
            "type": t.get("TrainType", ""),
            "typeLabel": t.get("TrainTypeDesc") or train_type_label(t.get("TrainType", "")),
            "source": {
                "code": t.get("Source", ""),
                "name": t.get("SourceName", ""),
            },
            "destination": {
                "code": t.get("Destination", ""),
                "name": t.get("DestinationName", ""),
            },
            "boarding": {
                "code": t.get("FromStation", ""),
                "name": t.get("FromStationName", ""),
            },
            "alighting": {
                "code": t.get("toStation", ""),
                "name": t.get("ToStationName", ""),
            },
            "departureTime": clean_time(t.get("DepTimeFrom")),
            "arrivalTime": clean_time(t.get("ArrTimeTo")),
            "travelTime": t.get("TravelTime") or "",
            "daysOfRun": t.get("DayOfRun") or "",
            "classes": t.get("ClassOfTravel") or "",
        })
    return {
        "from": {
            "code": raw.get("StationFromCode", ""),
            "name": raw.get("StationFrom", ""),
            "nameHindi": raw.get("StationFromHindi") or None,
        },
        "to": {
            "code": raw.get("StationToCode", ""),
            "name": raw.get("StationTo", ""),
            "nameHindi": raw.get("StationToHindi") or None,
        },
        "trainType": raw.get("TrainType") or "XXX",
        "trainTypeLabel": raw.get("TrainTypeDesc") or "All Types",
        "count": len(trains),
        "trains": trains,
    }


def normalize_pnr(raw: Any, pnr: str) -> dict:
    """Best-effort normalization of the indianrail.gov.in PNR payload.

    The upstream schema varies; we expose common fields plus the raw payload
    so the UI can degrade gracefully.
    """
    if not isinstance(raw, dict):
        return {"pnr": pnr, "found": False, "error": "Unexpected response", "raw": raw}

    error_message = raw.get("errorMessage") or raw.get("error") or ""
    if error_message:
        return {"pnr": pnr, "found": False, "error": error_message, "raw": raw}

    def pick(*keys: str) -> Any:
        for key in keys:
            value = raw.get(key)
            if value not in (None, "", [], {}):
                return value
        return None

    passengers_raw = (
        pick("passengerList", "PassengerList", "passengers", "PnrPassengerList") or []
    )
    passengers = []
    for index, p in enumerate(passengers_raw, start=1):
        if not isinstance(p, dict):
            continue
        passengers.append({
            "number": to_int(p.get("passengerSerialNumber") or p.get("PassengerSerialNumber"), index),
            "bookingStatus": p.get("bookingStatus") or p.get("BookingStatus") or "",
            "bookingBerth": p.get("bookingBerthNo") or p.get("BookingBerthNo") or "",
            "bookingCoach": p.get("bookingCoachId") or p.get("BookingCoachId") or "",
            "currentStatus": p.get("currentStatus") or p.get("CurrentStatus") or "",
            "currentStatusDetails": p.get("currentStatusDetails") or p.get("CurrentStatusDetails") or "",
            "currentCoach": p.get("currentCoachId") or p.get("CurrentCoachId") or "",
            "currentBerth": p.get("currentBerthNo") or p.get("CurrentBerthNo") or "",
            "coachPosition": p.get("currentCoachPosition") or None,
        })

    return {
        "pnr": pick("pnrNumber", "PnrNumber", "pnr") or pnr,
        "found": True,
        "trainNumber": pick("trainNumber", "TrainNumber"),
        "trainName": pick("trainName", "TrainName"),
        "journeyDate": pick("journeyDate", "JourneyDate"),
        "boardingStation": pick("boardingStation", "BoardingStation", "fromStation"),
        "reservationUpto": pick("reservationUpto", "ReservationUpto", "toStation"),
        "chartPrepared": pick("chartPrepared", "ChartPrepared"),
        "class": pick("class", "Class", "travelClass"),
        "quota": pick("quota", "Quota"),
        "passengers": passengers,
        "raw": raw,
    }


def upcoming_instance_start_date(instances: list[dict]) -> Optional[str]:
    """Pick the most relevant instance: first not-yet-arrived, else latest."""
    for inst in instances:
        if inst.get("status") != 2:
            return inst.get("startDate")
    if instances:
        return instances[0].get("startDate")
    return None
