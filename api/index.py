from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
from ntes import NTESClient
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

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

client = NTESClient(timeout=20, retries=3)


class TrainSearchResult(BaseModel):
    TrainNumber: str
    TrainName: str
    Source: str
    Destination: str
    Days: Optional[str] = None


class StationInfo(BaseModel):
    StationCode: str
    StationName: str
    Arrival: Optional[str] = None
    Departure: Optional[str] = None
    Day: Optional[int] = None
    Distance: Optional[int] = None
    Platform: Optional[str] = None


class LiveStatus(BaseModel):
    TrainNumber: str
    TrainName: str
    CurrentStation: Optional[str] = None
    CurrentStatus: Optional[str] = None
    Delay: Optional[str] = None
    LastUpdated: Optional[str] = None
    Stations: List[StationInfo] = []


class PNRStatus(BaseModel):
    PNR: str
    TrainNumber: Optional[str] = None
    TrainName: Optional[str] = None
    JourneyDate: Optional[str] = None
    BoardingStation: Optional[str] = None
    ReservationUpto: Optional[str] = None
    Status: Optional[str] = None
    Passengers: List[dict] = []


@app.get("/")
async def root():
    return {
        "name": "Indian Railways NTES API",
        "version": "1.0.0",
        "description": "Vercel-deployable API for Indian Railways train data",
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
        },
    }


@app.get("/api/search")
async def search_trains(q: str = Query(..., description="Train number, name, or keyword")):
    """Search for trains by number, name, or keyword."""
    try:
        result = client.search(q)
        trains = result.get("Trains", [])
        return {"query": q, "count": len(trains), "trains": trains}
    except Exception as e:
        logger.error(f"Search error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/train/{train_no}")
async def get_train_info(train_no: str):
    """Get detailed train information including schedule and running days."""
    try:
        result = client.train_info(train_no)
        return result
    except Exception as e:
        logger.error(f"Train info error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/train/{train_no}/schedule")
async def get_train_schedule(train_no: str):
    """Get train schedule with all stations, timings, and distances."""
    try:
        result = client.schedule(train_no)
        return result
    except Exception as e:
        logger.error(f"Schedule error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


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
        logger.error(f"Live status error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/station/{station_code}/arrivals")
async def get_arrivals(station_code: str):
    """Get all trains arriving at a station."""
    try:
        result = client.get_arrivals(station_code.upper())
        return {"station": station_code.upper(), "trains": result}
    except Exception as e:
        logger.error(f"Arrivals error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/station/{station_code}/departures")
async def get_departures(station_code: str):
    """Get all trains departing from a station."""
    try:
        result = client.get_departures(station_code.upper())
        return {"station": station_code.upper(), "trains": result}
    except Exception as e:
        logger.error(f"Departures error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/pnr/{pnr}")
async def get_pnr_status(pnr: str):
    """Check PNR status with automatic captcha solving."""
    try:
        result = client.pnr_status(pnr)
        return result
    except Exception as e:
        logger.error(f"PNR error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


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
        logger.error(f"Reservation chart error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


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
        logger.error(f"Trains between error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)