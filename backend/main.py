"""RailLens API - a free, self-hostable REST layer over India's NTES data.

Deploy targets:
  * Render.com  (free web service)
  * Fly.io      (free allowance)
  * Koyeb       (free instance)
  * Any VPS     (Dockerfile included)

The NTES upstream blocks many cloud IP ranges (notably Vercel's), so this
service must run on a host with a clean, dedicated IP.
"""
from __future__ import annotations

import logging
import os
from datetime import datetime, timezone

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from ntes_service import (
    NTES_RETRIES,
    NTES_TIMEOUT,
    cached,
    get_client,
    iso_to_ntes,
    normalize_live,
    normalize_pnr,
    normalize_schedule,
    normalize_search,
    normalize_station_board,
    normalize_train_info,
    normalize_trains_between,
    today_iso,
)

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
logger = logging.getLogger("raillens")

APP_VERSION = "2.0.0"

app = FastAPI(
    title="RailLens API",
    description="REST API for Indian Railways live running status, schedules, PNR and more.",
    version=APP_VERSION,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("CORS_ORIGINS", "*").split(","),
    allow_credentials=False,
    allow_methods=["GET", "OPTIONS"],
    allow_headers=["*"],
    max_age=86400,
)

HEALTH_CACHE_TTL = 60


def ok(data, cached_hit: bool = False):
    return {"ok": True, "cached": cached_hit, "data": data}


def fail(status: int, code: str, message: str, detail: str | None = None):
    body = {"ok": False, "error": {"code": code, "message": message}}
    if detail:
        body["error"]["detail"] = detail
    return JSONResponse(status_code=status, content=body)


def upstream_error(exc: Exception, operation: str):
    message = str(exc)
    logger.warning("%s failed: %s", operation, message)
    lowered = message.lower()

    if "timed out" in lowered or "timeout" in lowered:
        return fail(
            504,
            "upstream_timeout",
            "NTES did not respond in time. The free backend may be waking up - try again in a few seconds.",
            message,
        )
    if "connection" in lowered or "connect" in lowered:
        return fail(
            502,
            "upstream_unreachable",
            "Could not reach the Indian Railways NTES servers from this host.",
            message,
        )
    if "captcha" in lowered:
        return fail(
            503,
            "captcha_failed",
            "The PNR captcha could not be solved. Please retry.",
            message,
        )
    if "minimum 3 characters" in lowered or "enter minimum" in lowered:
        return fail(
            422,
            "query_too_short",
            "Enter at least 3 characters of a train number or name.",
            message,
        )
    if "not found" in lowered or "no train" in lowered or "invalid" in lowered:
        return fail(404, "not_found", "No matching data was found for that query.", message)

    return fail(502, "upstream_error", "The NTES request failed.", message)


def validate_iso_date(value: str, field: str = "date") -> str:
    try:
        datetime.strptime(value, "%Y-%m-%d")
    except ValueError:
        raise HTTPException(
            status_code=422,
            detail=f"{field} must be an ISO date (YYYY-MM-DD), got '{value}'",
        )
    return value


def validate_train_no(train_no: str) -> str:
    cleaned = train_no.strip()
    if not cleaned.isdigit() or len(cleaned) < 4 or len(cleaned) > 6:
        raise HTTPException(status_code=422, detail="Train number must be 4-6 digits.")
    return cleaned


def validate_station_code(code: str) -> str:
    cleaned = code.strip().upper()
    if not cleaned.isalpha() or len(cleaned) < 2 or len(cleaned) > 5:
        raise HTTPException(
            status_code=422,
            detail="Station code must be 2-5 letters (e.g. NDLS, HWH, MAS).",
        )
    return cleaned


@app.get("/", include_in_schema=False)
def root():
    return {
        "name": "RailLens API",
        "version": APP_VERSION,
        "docs": "/docs",
        "health": "/health",
        "endpoints": [
            "GET /api/search?q=rajdhani",
            "GET /api/train/{number}",
            "GET /api/train/{number}/instances",
            "GET /api/train/{number}/schedule?date=YYYY-MM-DD",
            "GET /api/train/{number}/live?date=YYYY-MM-DD",
            "GET /api/station/{code}?hours=2",
            "GET /api/between?from=NDLS&to=MMCT",
            "GET /api/pnr/{pnr}",
        ],
    }


@app.get("/health")
def health():
    payload, cached_hit = cached(
        "health",
        HEALTH_CACHE_TTL,
        lambda: {
            "status": "ok",
            "service": "raillens-api",
            "version": APP_VERSION,
            "ntes": {"timeout": NTES_TIMEOUT, "retries": NTES_RETRIES},
            "time": datetime.now(timezone.utc).isoformat(),
        },
    )
    return ok(payload, cached_hit)


@app.get("/api/search")
def search(q: str = Query(..., min_length=1, max_length=64, description="Train number, name or keyword")):
    query = q.strip()
    if not query:
        raise HTTPException(status_code=422, detail="Query cannot be empty.")
    try:
        data, cached_hit = cached(
            f"search:{query.lower()}", 3600, lambda: normalize_search(get_client().search(query))
        )
        data["query"] = query
        return ok(data, cached_hit)
    except Exception as exc:  # noqa: BLE001
        return upstream_error(exc, f"search({query})")


@app.get("/api/train/{train_no}")
def train_info(train_no: str):
    number = validate_train_no(train_no)
    try:
        data, cached_hit = cached(
            f"train:{number}", 21600, lambda: normalize_train_info(get_client().train_info(number))
        )
        return ok(data, cached_hit)
    except Exception as exc:  # noqa: BLE001
        return upstream_error(exc, f"train_info({number})")


@app.get("/api/train/{train_no}/instances")
def train_instances(train_no: str):
    """Recent and upcoming runs of a train (with ready-to-use start dates)."""
    number = validate_train_no(train_no)
    try:
        data, cached_hit = cached(
            f"train:{number}", 21600, lambda: normalize_train_info(get_client().train_info(number))
        )
        return ok(
            {
                "number": data["number"],
                "name": data["name"],
                "source": data["source"],
                "destination": data["destination"],
                "instances": data["instances"],
                "suggestedDate": next(
                    (i["startDateISO"] for i in data["instances"] if i["startDateISO"] == today_iso()),
                    next(
                        (i["startDateISO"] for i in data["instances"] if i["status"] != 2),
                        data["instances"][0]["startDateISO"] if data["instances"] else None,
                    ),
                ),
            },
            cached_hit,
        )
    except Exception as exc:  # noqa: BLE001
        return upstream_error(exc, f"train_instances({number})")


@app.get("/api/train/{train_no}/schedule")
def schedule(
    train_no: str,
    date: str | None = Query(None, description="Journey/run date (YYYY-MM-DD). Optional."),
):
    number = validate_train_no(train_no)
    ntes_date = ""
    if date:
        validate_iso_date(date)
        ntes_date = iso_to_ntes(date)
    try:
        data, cached_hit = cached(
            f"schedule:{number}:{ntes_date}", 21600,
            lambda: normalize_schedule(get_client().schedule(number, ntes_date)),
        )
        return ok(data, cached_hit)
    except Exception as exc:  # noqa: BLE001
        return upstream_error(exc, f"schedule({number}, {date})")


@app.get("/api/train/{train_no}/live")
def live_status(
    train_no: str,
    date: str | None = Query(
        None,
        description="Train START date from its origin (YYYY-MM-DD). Defaults to today (IST).",
    ),
):
    number = validate_train_no(train_no)
    run_date = validate_iso_date(date) if date else today_iso()
    ntes_date = iso_to_ntes(run_date)
    try:
        data, cached_hit = cached(
            f"live:{number}:{ntes_date}", 45,
            lambda: normalize_live(get_client().live_status(number, ntes_date)),
        )
        if not data.get("train", {}).get("number") or not data.get("stations"):
            return fail(
                404,
                "no_run",
                "No run found for this train on that start date. Try another date, or pick one of the recent runs.",
            )
        return ok(data, cached_hit)
    except Exception as exc:  # noqa: BLE001
        return upstream_error(exc, f"live_status({number}, {run_date})")


@app.get("/api/station/{station_code}")
def station_board(
    station_code: str,
    hours: int = Query(2, ge=1, le=8, description="Look-ahead window in hours (1-8)."),
):
    code = validate_station_code(station_code)
    try:
        data, cached_hit = cached(
            f"station:{code}:{hours}", 60,
            lambda: normalize_station_board(get_client().station_live(code, hours)),
        )
        data["hours"] = hours
        return ok(data, cached_hit)
    except Exception as exc:  # noqa: BLE001
        return upstream_error(exc, f"station_board({code}, {hours})")


@app.get("/api/between")
def trains_between(
    from_station: str = Query(..., alias="from", description="Boarding station code"),
    to_station: str = Query(..., alias="to", description="Destination station code"),
    train_type: str = Query("XXX", description="XXX=all, SUF, RAJ, SHT, DUR, VAN, ..."),
):
    origin = validate_station_code(from_station)
    target = validate_station_code(to_station)
    if origin == target:
        raise HTTPException(status_code=422, detail="From and to stations must differ.")
    try:
        data, cached_hit = cached(
            f"between:{origin}:{target}:{train_type.upper()}", 21600,
            lambda: normalize_trains_between(
                get_client().trains_between(origin, target, train_type.upper())
            ),
        )
        return ok(data, cached_hit)
    except Exception as exc:  # noqa: BLE001
        return upstream_error(exc, f"trains_between({origin}, {target})")


@app.get("/api/pnr/{pnr}")
def pnr_status(pnr: str):
    cleaned = pnr.strip()
    if not cleaned.isdigit() or len(cleaned) != 10:
        raise HTTPException(status_code=422, detail="PNR must be exactly 10 digits.")
    try:
        raw = get_client().pnr_status(cleaned)
        return ok(normalize_pnr(raw, cleaned))
    except Exception as exc:  # noqa: BLE001
        return upstream_error(exc, f"pnr_status({cleaned})")


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=int(os.getenv("PORT", "8000")), reload=True)
