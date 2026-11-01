# RailLens

A fast, free, open-source window into Indian Railways — live running status, full
schedules, station boards, trains between stations and PNR status, wrapped in a
modern dark interface.

Built on public **NTES** data via the
[`ntes-client`](https://github.com/x64vbhv/ntes-client) Python library.

> Unofficial project. Not affiliated with Indian Railways, CRIS or IRCTC.

---

## Features

- **Live running status** — current position, delay, last reported station, next
  halt, distance covered and a colour-coded route timeline.
- **Complete schedules** — every stop with arrival, departure, halt, day,
  distance, platform and running days.
- **Station live board** — arrivals and departures for the next 1–8 hours with
  expected times, platforms and delays. Filter by delay or cancellation.
- **Trains between stations** — every direct train for a pair of stations with
  timings, duration, classes and running days.
- **PNR status** — passenger-level confirmation/RAC/waitlist with coach and
  berth. The NTES captcha is solved server-side.
- **Developer API** — a documented FastAPI service powers every screen.
  `/docs` gives you a live Swagger UI.

All data comes from Indian Railways' public NTES endpoints. Nothing is stored
about users, there are no accounts and no ads.

## Architecture

```
Browser
   │
   ├── Next.js 15 app (Vercel)              frontend/
   │      └── fetch → NEXT_PUBLIC_API_URL
   │
   └── FastAPI service (Render / Fly.io)    backend/
          ├── ntes-client  →  NTES public endpoints
          └── in-process TTL cache
```

**Why not host the backend on Vercel?** NTES silently blocks requests from many
cloud/serverless IP ranges — including Vercel's — so the upstream connection
times out. The API needs a host with a clean, dedicated egress IP (Render,
Fly.io, Koyeb, a VPS…). The frontend is static/SSR-friendly and deploys
perfectly on Vercel.

## Repository layout

```
.
├── backend/
│   ├── main.py             # FastAPI routes, validation, error mapping
│   ├── ntes_service.py     # client wrapper, TTL cache, normalizers
│   ├── requirements.txt
│   ├── Dockerfile
│   ├── Procfile
│   └── runtime.txt
├── frontend/
│   ├── app/                # Next.js App Router pages
│   ├── components/         # UI components
│   ├── lib/                # API client, types, station list, helpers
│   ├── tailwind.config.ts
│   └── package.json
├── render.yaml             # one-click Render blueprint for the API
└── README.md
```

## Local development

### 1. Backend (FastAPI)

```bash
cd backend
python -m venv .venv
# Windows:
.venv\Scripts\activate
# macOS / Linux:
# source .venv/bin/activate

pip install -r requirements.txt
uvicorn main:app --reload --port 8001
```

- API: <http://127.0.0.1:8001>
- Swagger UI: <http://127.0.0.1:8001/docs>
- Health check: <http://127.0.0.1:8001/health>

### 2. Frontend (Next.js)

```bash
cd frontend
npm install
```

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8001
```

```bash
npm run dev
```

Open <http://localhost:3000>.

Production build:

```bash
npm run build
npm start
```

## Deployment (100% free)

### Backend → Render

The repo ships a [`render.yaml`](./render.yaml) blueprint:

1. Push this repository to GitHub.
2. In the [Render dashboard](https://dashboard.render.com/), choose
   **New → Blueprint** and select the repo.
3. Render creates the `raillens-api` web service (free plan, Singapore region,
   `backend/` root directory, health check `/health`).
4. Copy the service URL, e.g. `https://raillens-api.onrender.com`.

Manual setup without the blueprint: create a **Web Service**, root directory
`backend`, build command `pip install -r requirements.txt`, start command
`uvicorn main:app --host 0.0.0.0 --port $PORT`, health check `/health`.

Optional environment variables:

| Variable       | Default | Description                        |
| -------------- | ------- | ---------------------------------- |
| `NTES_TIMEOUT` | `30`    | Upstream request timeout (seconds) |
| `NTES_RETRIES` | `3`     | Upstream retry attempts            |
| `CORS_ORIGINS` | `*`     | Comma-separated allowed origins    |

> Free Render services sleep after 15 minutes of inactivity. The first request
> afterwards can take up to a minute; the UI handles this with a clear
> "server is waking up" state.

### Frontend → Vercel

1. Import the same repository in [Vercel](https://vercel.com/new).
2. Set **Root Directory** to `frontend`.
3. Framework preset: **Next.js** (auto-detected).
4. Add an environment variable:
   - `NEXT_PUBLIC_API_URL` = your Render backend URL.
5. Deploy.

`NEXT_PUBLIC_API_URL` is inlined at build time, so redeploy after changing it.

### Alternative backend hosts

`backend/Dockerfile` works on Fly.io, Koyeb, Railway (paid), a VPS or any
container runtime. `backend/Procfile` covers buildpack-style platforms.

## API reference

Base URL: your backend host. Every response uses an envelope:

```json
{ "ok": true, "cached": false, "data": { } }
```

Errors:

```json
{
  "ok": false,
  "error": { "code": "upstream_timeout", "message": "…", "detail": "…" }
}
```

| Method | Endpoint                                       | Description                                    |
| ------ | ---------------------------------------------- | ---------------------------------------------- |
| GET    | `/api/search?q=rajdhani`                       | Find trains by number, name or keyword         |
| GET    | `/api/train/{number}`                          | Train details + recent/upcoming runs           |
| GET    | `/api/train/{number}/instances`                | Runs with ready-to-use origin start dates      |
| GET    | `/api/train/{number}/schedule?date=YYYY-MM-DD` | Full timetable (date optional)                 |
| GET    | `/api/train/{number}/live?date=YYYY-MM-DD`     | Live position, delay and station timeline      |
| GET    | `/api/station/{code}?hours=2`                  | Station arrivals/departures (1–8 hour window)  |
| GET    | `/api/between?from=NDLS&to=MMCT`               | Direct trains between two stations             |
| GET    | `/api/pnr/{10-digit-pnr}`                      | PNR status with captcha solved server-side     |
| GET    | `/health`                                      | Service and configuration health               |

**Date semantics:** live status and schedule take the train's **origin start
date**, not the current date. For overnight trains that is often yesterday. The
`/instances` endpoint returns the correct dates to use.

### Caching

Cached in-process to keep the free host fast and reduce upstream load:

| Resource      | TTL  |
| ------------- | ---- |
| Search        | 1 h  |
| Train info    | 6 h  |
| Schedule      | 6 h  |
| Live status   | 45 s |
| Station board | 60 s |
| Trains between| 6 h  |

## Notes & limitations

- NTES is an unofficial, undocumented upstream. It can change or rate-limit at
  any time; there is no SLA.
- PNR lookup depends on solving the upstream captcha; occasional failures are
  normal. Status may lag the official chart — verify with railway helpline 139.
- Cloud IP ranges are sometimes blocked by NTES. If your host cannot connect,
  try another region or provider.
- This project is for personal, educational and non-commercial use. Please be
  respectful to the upstream service.

## Tech stack

- **Frontend:** Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS,
  lucide-react, Space Grotesk + Inter.
- **Backend:** FastAPI, Uvicorn, `ntes-client`, Pillow (captcha solving via the
  client).
- **Hosting:** Vercel (frontend) + Render free tier (backend).

## Credits

- [`ntes-client`](https://github.com/x64vbhv/ntes-client) by Vaibhav Chandra —
  the unofficial Python client for NTES.
- Indian Railways / CRIS for the public NTES data.

## License

MIT
