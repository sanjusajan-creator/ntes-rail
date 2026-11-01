from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from ntes import NTESClient
from ntes.exceptions import NTESError
import logging
import os

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Config from environment variables
NTES_TIMEOUT = int(os.getenv("NTES_TIMEOUT", "30"))
NTES_RETRIES = int(os.getenv("NTES_RETRIES", "3"))

app = FastAPI(
    title="Indian Railways NTES API",
    description="Vercel-deployable API wrapper for ntes-client library",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create client with extended timeout for Vercel
client = NTESClient(timeout=NTES_TIMEOUT, retries=NTES_RETRIES)


def handle_ntes_error(e: Exception, operation: str) -> HTTPException:
    """Convert NTES errors to appropriate HTTP responses."""
    error_msg = str(e)
    logger.error(f"{operation} error: {error_msg}")
    
    if "timeout" in error_msg.lower() or "timed out" in error_msg.lower():
        return HTTPException(
            status_code=504,
            detail={
                "error": "NTES API timeout",
                "message": "The Indian Railways NTES server did not respond in time. This may be due to network restrictions on Vercel.",
                "suggestion": "Try again, or deploy to a VPS/Cloud Run for better connectivity.",
                "operation": operation
            }
        )
    elif "connect" in error_msg.lower() or "connection" in error_msg.lower():
        return HTTPException(
            status_code=502,
            detail={
                "error": "NTES API connection failed",
                "message": "Could not connect to Indian Railways NTES server. Vercel's IP ranges may be blocked.",
                "suggestion": "Deploy to a VPS (DigitalOcean, Railway, Render) or use a proxy.",
                "operation": operation
            }
        )
    elif "captcha" in error_msg.lower():
        return HTTPException(
            status_code=503,
            detail={
                "error": "Captcha required",
                "message": "PNR endpoint requires captcha solving which failed.",
                "suggestion": "Try again in a few moments.",
                "operation": operation
            }
        )
    else:
        return HTTPException(
            status_code=500,
            detail={
                "error": "NTES API error",
                "message": error_msg,
                "operation": operation
            }
        )


@app.get("/")
async def root():
    return {
        "name": "Indian Railways NTES API",
        "version": "1.0.0",
        "description": "Vercel-deployable API for Indian Railways train data",
        "note": "NTES API may timeout on Vercel due to IP restrictions. For production, deploy to a VPS.",
        "endpoints": {
            "search": "/api/search?q=rajdhani",
            "train_info": "/api/train/12301",
            "schedule": "/api/train/12301/schedule",
            "live_status": "/api/train/12301/live?date=2025-06-15",
            "arrivals": "/api/station/NDLS/arrivals",
            "departures": "/api/station/NDLS/departures",
            "pnr": "/api/pnr/1234567890",
            "reservation_chart": "/api/train/12301/chart?date=2025-06-15&from=NDLS&to=BCT",
            "trains_between": "/api/trains/between?from=NDLS&to=BCT",
            "health": "/health",
        },
    }


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "ok",
        "service": "ntes-api",
        "ntes_timeout": NTES_TIMEOUT,
        "ntes_retries": NTES_RETRIES,
    }


@app.get("/api/search")
async def search_trains(q: str = Query(..., description="Train number, name, or keyword")):
    """Search for trains by number, name, or keyword."""
    try:
        result = client.search(q)
        trains = result.get("Trains", [])
        return {"query": q, "count": len(trains), "trains": trains}
    except Exception as e:
        raise handle_ntes_error(e, "search")


@app.get("/api/train/{train_no}")
async def get_train_info(train_no: str):
    """Get detailed train information including schedule and running days."""
    try:
        result = client.train_info(train_no)
        return result
    except Exception as e:
        raise handle_ntes_error(e, f"train_info({train_no})")


@app.get("/api/train/{train_no}/schedule")
async def get_train_schedule(train_no: str):
    """Get train schedule with all stations, timings, and distances."""
    try:
        result = client.schedule(train_no)
        return result
    except Exception as e:
        raise handle_ntes_error(e, f"schedule({train_no})")


@app.get("/api/train/{train_no}/live")
async def get_live_status(
    train_no: str,
    date: str = Query(..., description="Date in YYYY-MM-DD format"),
):
    """Get live running status of a train for a specific date."""
    try:
        result = client.live_status(train_no, date)
        return result
    except Exception as e:
        raise handle_ntes_error(e, f"live_status({train_no}, {date})")


@app.get("/api/station/{station_code}/arrivals")
async def get_arrivals(station_code: str):
    """Get all trains arriving at a station."""
    try:
        result = client.get_arrivals(station_code.upper())
        return {"station": station_code.upper(), "trains": result}
    except Exception as e:
        raise handle_ntes_error(e, f"arrivals({station_code})")


@app.get("/api/station/{station_code}/departures")
async def get_departures(station_code: str):
    """Get all trains departing from a station."""
    try:
        result = client.get_departures(station_code.upper())
        return {"station": station_code.upper(), "trains": result}
    except Exception as e:
        raise handle_ntes_error(e, f"departures({station_code})")


@app.get("/api/pnr/{pnr}")
async def get_pnr_status(pnr: str):
    """Check PNR status with automatic captcha solving."""
    try:
        result = client.pnr_status(pnr)
        return result
    except Exception as e:
        raise handle_ntes_error(e, f"pnr_status({pnr})")


@app.get("/api/train/{train_no}/chart")
async def get_reservation_chart(
    train_no: str,
    date: str = Query(..., description="Date in YYYY-MM-DD format"),
    from_station: str = Query(..., alias="from", description="Boarding station code"),
    to_station: str = Query(..., alias="to", description="Destination station code"),
):
    """Get IRCTC reservation chart (coach composition, vacant berths)."""
    try:
        from ntes import reservation_chart
        result = reservation_chart(train_no, date, from_station.upper(), to_station.upper())
        return result
    except Exception as e:
        raise handle_ntes_error(e, f"reservation_chart({train_no}, {date}, {from_station}, {to_station})")


@app.get("/api/trains/between")
async def get_trains_between(
    from_station: str = Query(..., alias="from", description="Source station code (e.g., NDLS)"),
    to_station: str = Query(..., alias="to", description="Destination station code (e.g., BCT)"),
    train_type: str = Query("XXX", description="Train type filter: XXX=all, SUF=superfast, RAJ=rajdhani, etc."),
):
    """Find all trains between two stations."""
    try:
        result = client.trains_between(from_station.upper(), to_station.upper(), train_type)
        return {"from": from_station.upper(), "to": to_station.upper(), "train_type": train_type, "trains": result}
    except Exception as e:
        raise handle_ntes_error(e, f"trains_between({from_station}, {to_station}, {train_type})")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)