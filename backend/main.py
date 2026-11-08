"""RailLens API - FastAPI proxy for RailEngine with caching and key protection.

Deploy targets:
  * Render.com  (free web service)
  * Fly.io      (free allowance)
  * Koyeb       (free instance)
  * Any VPS     (Dockerfile included)
"""
from __future__ import annotations

import logging
import os
from datetime import datetime, timezone
from typing import Any

import httpx
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
logger = logging.getLogger("raillens")

APP_VERSION = "4.0.0"

# Upstream RailEngine API
UPSTREAM_BASE = "https://railway-engine.apkscope.workers.dev/v1"
RAIL_ENGINE_API_KEY = os.getenv("RAIL_ENGINE_API_KEY", "")

# Cache TTLs (seconds)
CACHE_TTLS = {
    "search": 3600,
    "train_info": 21600,
    "schedule": 21600,
    "route": 21600,
    "live": 45,
    "coaches": 21600,
    "fare": 3600,
    "platforms": 21600,
    "station_by_code": 86400,
    "station_search": 3600,
    "station_board": 60,
    "between": 21600,
    "pnr": 0,
    "health": 60,
    "version": 3600,
    "coverage": 86400,
    "provider_health": 300,
}

app = FastAPI(
    title="RailLens API",
    description="FastAPI proxy for RailEngine Indian Railways API with caching and key protection.",
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

# Simple in-memory TTL cache
_cache: dict[str, tuple[float, Any]] = {}
_cache_lock = __import__("threading").Lock()


def cache_get(key: str) -> Any | None:
    with _cache_lock:
        entry = _cache.get(key)
        if entry and entry[0] > __import__("time").time():
            return entry[1]
        if entry:
            del _cache[key]
    return None


def cache_set(key: str, value: Any, ttl: int) -> None:
    with _cache_lock:
        _cache[key] = (__import__("time").time() + ttl, value)


async def upstream_get(path: str, params: dict | None = None) -> dict:
    """Fetch from RailEngine API with API key."""
    headers = {"Accept": "application/json"}
    if RAIL_ENGINE_API_KEY:
        headers["x-api-key"] = RAIL_ENGINE_API_KEY

    url = f"{UPSTREAM_BASE}{path}"
    async with httpx.AsyncClient(timeout=30.0) as client:
        resp = await client.get(url, params=params, headers=headers)
        if resp.status_code >= 400:
            raise HTTPException(status_code=resp.status_code, detail=f"Upstream error: {resp.text}")
        data = resp.json()
        # RailEngine wraps responses in {status, data, error, meta}
        # Normalize to our envelope
        if isinstance(data, dict) and "status" in data:
            if data.get("status") in ("SUCCESS", "STALE_DATA"):
                return {"ok": True, "data": data.get("data"), "meta": data.get("meta")}
            else:
                raise HTTPException(
                    status_code=resp.status_code,
                    detail=data.get("error", {}).get("message", "Upstream error"),
                )
        return {"ok": True, "data": data}


def cached(key: str, ttl: int, fetcher):
    """Execute fetcher with TTL caching."""
    cached_val = cache_get(key)
    if cached_val is not None:
        return cached_val, True
    val = fetcher()
    if ttl > 0:
        cache_set(key, val, ttl)
    return val, False


def ok(data: Any, cached_hit: bool = False) -> dict:
    return {"ok": True, "cached": cached_hit, "data": data}


def fail(status: int, code: str, message: str, detail: str | None = None) -> JSONResponse:
    body = {"ok": False, "error": {"code": code, "message": message}}
    if detail:
        body["error"]["detail"] = detail
    return JSONResponse(status_code=status, content=body)


def validate_train_no(train_no: str) -> str:
    cleaned = train_no.strip()
    if not cleaned.isdigit() or len(cleaned) < 4 or len(cleaned) > 6:
        raise HTTPException(status_code=422, detail="Train number must be 4-6 digits.")
    return cleaned


def validate_station_code(code: str) -> str:
    cleaned = code.strip().upper()
    if not cleaned.isalpha() or len(cleaned) < 2 or len(cleaned) > 5:
        raise HTTPException(status_code=422, detail="Station code must be 2-5 letters (e.g. NDLS, HWH, MAS).")
    return cleaned


def validate_pnr(pnr: str) -> str:
    cleaned = pnr.strip()
    if not cleaned.isdigit() or len(cleaned) != 10:
        raise HTTPException(status_code=422, detail="PNR must be exactly 10 digits.")
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
            "GET /api/train/{number}/schedule?date=YYYY-MM-DD",
            "GET /api/train/{number}/route?date=YYYY-MM-DD",
            "GET /api/train/{number}/live?date=YYYY-MM-DD",
            "GET /api/train/{number}/coaches",
            "GET /api/train/{number}/fare?date=YYYY-MM-DD&class=3A&quota=GN",
            "GET /api/train/{number}/platforms",
            "GET /api/station/{code}",
            "GET /api/station/{code}/live?hours=2",
            "GET /api/stations/search?q=delhi",
            "GET /api/between?from=NDLS&to=MMCT",
            "GET /api/pnr/{pnr}",
            "GET /api/coverage",
            "GET /api/provider/health",
        ],
    }


@app.get("/health")
def health():
    payload, cached_hit = cache_get("health") or ({}, False)
    if not payload:
        payload = {
            "status": "ok",
            "service": "raillens-api",
            "version": APP_VERSION,
            "upstream": UPSTREAM_BASE,
            "time": datetime.now(timezone.utc).isoformat(),
        }
        cache_set("health", payload, CACHE_TTLS["health"])
        cached_hit = False
    return ok(payload, cached_hit)


@app.get("/api/version")
def version():
    return ok({"service": "raillens-api", "version": APP_VERSION})


@app.get("/api/coverage")
async def coverage():
    key = "coverage"
    cached_val = cache_get(key)
    if cached_val:
        return ok(cached_val, True)
    data = await upstream_get("/coverage")
    cache_set(key, data, CACHE_TTLS["coverage"])
    return ok(data, False)


@app.get("/api/provider/health")
async def provider_health():
    key = "provider_health"
    cached_val = cache_get(key)
    if cached_val:
        return ok(cached_val, True)
    data = await upstream_get("/provider/health")
    cache_set(key, data, CACHE_TTLS["provider_health"])
    return ok(data, False)


@app.get("/api/search")
async def search(q: str = Query(..., min_length=1, max_length=64, description="Train number, name or keyword")):
    query = q.strip()
    if not query:
        raise HTTPException(status_code=422, detail="Query cannot be empty.")

    key = f"search:{query.lower()}"
    cached_val = cache_get(key)
    if cached_val:
        return ok({"query": query, **cached_val}, True)

    try:
        data = await upstream_get("/trains/search", {"q": query})
        cache_set(key, data, CACHE_TTLS["search"])
        return ok({"query": query, **data}, False)
    except HTTPException:
        raise
    except Exception as exc:
        logger.warning("search(%s) failed: %s", query, exc)
        raise HTTPException(status_code=502, detail="Search request failed.")


@app.get("/api/train/{train_no}")
async def train_info(train_no: str):
    number = validate_train_no(train_no)

    key = f"train_info:{number}"
    cached_val = cache_get(key)
    if cached_val:
        return ok(cached_val, True)

    try:
        data = await upstream_get(f"/train/{number}/schedule")
        cache_set(key, data, CACHE_TTLS["train_info"])
        return ok(data, False)
    except HTTPException:
        raise
    except Exception as exc:
        logger.warning("train_info(%s) failed: %s", number, exc)
        raise HTTPException(status_code=502, detail="Train info request failed.")


@app.get("/api/train/{train_no}/schedule")
async def schedule(
    train_no: str,
    date: str | None = Query(None, description="Journey date (YYYY-MM-DD). Optional."),
):
    number = validate_train_no(train_no)

    cache_key = f"schedule:{number}:{date or 'default'}"
    cached_val = cache_get(cache_key)
    if cached_val:
        return ok(cached_val, True)

    try:
        params = {"date": date} if date else {}
        data = await upstream_get(f"/train/{number}/schedule", params)
        cache_set(cache_key, data, CACHE_TTLS["schedule"])
        return ok(data, False)
    except HTTPException:
        raise
    except Exception as exc:
        logger.warning("schedule(%s, %s) failed: %s", number, date, exc)
        raise HTTPException(status_code=502, detail="Schedule request failed.")


@app.get("/api/train/{train_no}/route")
async def route(
    train_no: str,
    date: str | None = Query(None, description="Journey date (YYYY-MM-DD). Optional."),
):
    number = validate_train_no(train_no)

    cache_key = f"route:{number}:{date or 'default'}"
    cached_val = cache_get(cache_key)
    if cached_val:
        return ok(cached_val, True)

    try:
        params = {"date": date} if date else {}
        data = await upstream_get(f"/train/{number}/route", params)
        cache_set(cache_key, data, CACHE_TTLS["route"])
        return ok(data, False)
    except HTTPException:
        raise
    except Exception as exc:
        logger.warning("route(%s, %s) failed: %s", number, date, exc)
        raise HTTPException(status_code=502, detail="Route request failed.")


@app.get("/api/train/{train_no}/live")
async def live_status(
    train_no: str,
    date: str | None = Query(None, description="Train START date from its origin (YYYY-MM-DD). Optional."),
):
    number = validate_train_no(train_no)

    cache_key = f"live:{number}:{date or 'default'}"
    cached_val = cache_get(cache_key)
    if cached_val:
        return ok(cached_val, True)

    try:
        params = {"date": date} if date else {}
        data = await upstream_get(f"/train/{number}/status", params)
        cache_set(cache_key, data, CACHE_TTLS["live"])
        return ok(data, False)
    except HTTPException:
        raise
    except Exception as exc:
        logger.warning("live_status(%s, %s) failed: %s", number, date, exc)
        raise HTTPException(status_code=502, detail="Live status request failed.")


@app.get("/api/train/{train_no}/coaches")
async def coaches(train_no: str):
    number = validate_train_no(train_no)

    cache_key = f"coach:{number}"
    cached_val = cache_get(cache_key)
    if cached_val:
        return ok(cached_val, True)

    try:
        data = await upstream_get(f"/train/{number}/coaches")
        cache_set(cache_key, data, CACHE_TTLS["coach"])
        return ok(data, False)
    except HTTPException:
        raise
    except Exception as exc:
        logger.warning("coaches(%s) failed: %s", number, exc)
        raise HTTPException(status_code=502, detail="Coach composition request failed.")


@app.get("/api/train/{train_no}/fare")
async def fare(
    train_no: str,
    date: str = Query(..., description="Journey date (YYYY-MM-DD)"),
    class_: str = Query("3A", alias="class", description="Travel class: SL, 3A, 2A, 1A, CC, EC, 2S"),
    quota: str = Query("GN", description="Quota: GN, TQ, PT, LD, SS"),
):
    number = validate_train_no(train_no)

    cache_key = f"fare:{number}:{date}:{class_}:{quota}"
    cached_val = cache_get(cache_key)
    if cached_val:
        return ok(cached_val, True)

    try:
        data = await upstream_get(f"/train/{number}/fare", {"date": date, "class": class_, "quota": quota})
        cache_set(cache_key, data, CACHE_TTLS["fare"])
        return ok(data, False)
    except HTTPException:
        raise
    except Exception as exc:
        logger.warning("fare(%s) failed: %s", number, exc)
        raise HTTPException(status_code=502, detail="Fare request failed.")


@app.get("/api/train/{train_no}/platforms")
async def platforms(train_no: str):
    number = validate_train_no(train_no)

    cache_key = f"platforms:{number}"
    cached_val = cache_get(cache_key)
    if cached_val:
        return ok(cached_val, True)

    try:
        data = await upstream_get(f"/train/{number}/platforms")
        cache_set(cache_key, data, CACHE_TTLS["platforms"])
        return ok(data, False)
    except HTTPException:
        raise
    except Exception as exc:
        logger.warning("platforms(%s) failed: %s", number, exc)
        raise HTTPException(status_code=502, detail="Platforms request failed.")


@app.get("/api/station/{station_code}")
async def station_by_code(station_code: str):
    code = validate_station_code(station_code)

    cache_key = f"station_by_code:{code}"
    cached_val = cache_get(cache_key)
    if cached_val:
        return ok(cached_val, True)

    try:
        data = await upstream_get(f"/station/{code}")
        cache_set(cache_key, data, CACHE_TTLS["station_by_code"])
        return ok(data, False)
    except HTTPException:
        raise
    except Exception as exc:
        logger.warning("station_by_code(%s) failed: %s", code, exc)
        raise HTTPException(status_code=502, detail="Station lookup failed.")


@app.get("/api/stations/search")
async def station_search(q: str = Query(..., min_length=1, max_length=64, description="Station name or code")):
    query = q.strip()
    if not query:
        raise HTTPException(status_code=422, detail="Query cannot be empty.")

    key = f"station_search:{query.lower()}"
    cached_val = cache_get(key)
    if cached_val:
        return ok(cached_val, True)

    try:
        data = await upstream_get("/stations/search", {"q": query})
        cache_set(key, data, CACHE_TTLS["station_search"])
        return ok(data, False)
    except HTTPException:
        raise
    except Exception as exc:
        logger.warning("station_search(%s) failed: %s", query, exc)
        raise HTTPException(status_code=502, detail="Station search failed.")


@app.get("/api/station/{station_code}/live")
async def station_board(
    station_code: str,
    hours: int = Query(2, ge=1, le=8, description="Look-ahead window in hours (1-8)."),
):
    code = validate_station_code(station_code)

    cache_key = f"station_board:{code}:{hours}"
    cached_val = cache_get(cache_key)
    if cached_val:
        return ok({"hours": hours, **cached_val}, True)

    try:
        data = await upstream_get(f"/station/{code}/live", {"hours": hours})
        data["hours"] = hours
        cache_set(cache_key, data, CACHE_TTLS["station_board"])
        return ok(data, False)
    except HTTPException:
        raise
    except Exception as exc:
        logger.warning("station_board(%s, %s) failed: %s", code, hours, exc)
        raise HTTPException(status_code=502, detail="Station board request failed.")


@app.get("/api/between")
async def trains_between(
    from_station: str = Query(..., alias="from", description="Boarding station code"),
    to_station: str = Query(..., alias="to", description="Destination station code"),
    train_type: str = Query("XXX", description="XXX=all, RAJ, SHT, DUR, SUF, EXP, VAN"),
):
    origin = validate_station_code(from_station)
    target = validate_station_code(to_station)
    if origin == target:
        raise HTTPException(status_code=422, detail="From and to stations must differ.")

    cache_key = f"between:{origin}:{target}:{train_type.upper()}"
    cached_val = cache_get(cache_key)
    if cached_val:
        return ok(cached_val, True)

    try:
        data = await upstream_get("/trains/between", {"from": origin, "to": target, "type": train_type.upper()})
        cache_set(cache_key, data, CACHE_TTLS["between"])
        return ok(data, False)
    except HTTPException:
        raise
    except Exception as exc:
        logger.warning("trains_between(%s, %s) failed: %s", origin, target, exc)
        raise HTTPException(status_code=502, detail="Trains between request failed.")


@app.get("/api/pnr/{pnr}")
async def pnr_status(pnr: str):
    pnr_clean = validate_pnr(pnr)

    try:
        data = await upstream_get(f"/pnr/{pnr_clean}")
        return ok(data, False)
    except HTTPException:
        raise
    except Exception as exc:
        logger.warning("pnr_status(%s) failed: %s", pnr_clean, exc)
        raise HTTPException(status_code=502, detail="PNR request failed.")


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=int(os.getenv("PORT", "8000")), reload=True)