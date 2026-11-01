# Indian Railways NTES API - Vercel Deployable

A FastAPI wrapper around the [ntes-client](https://github.com/x64vbhv/ntes-client) library, deployable on Vercel as serverless functions.

## Features

- **Train Search** - Search by number, name, or keyword
- **Train Info** - Detailed train information including running days
- **Schedule** - Complete schedule with stations, timings, distances
- **Live Status** - Real-time running status with delay info
- **Station Boards** - Arrivals & departures for any station
- **PNR Status** - Check PNR with automatic captcha solving
- **Reservation Chart** - Coach composition & vacant berths (IRCTC)
- **Journey Planner** - Find trains between two stations on a date

## API Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /api/search?q=rajdhani` | Search trains |
| `GET /api/train/{train_no}` | Train details |
| `GET /api/train/{train_no}/schedule` | Full schedule |
| `GET /api/train/{train_no}/live?date=2025-06-15` | Live status |
| `GET /api/station/{code}/arrivals` | Station arrivals |
| `GET /api/station/{code}/departures` | Station departures |
| `GET /api/pnr/{pnr}` | PNR status |
| `GET /api/train/{train_no}/chart?date=2025-06-15&from=NDLS&to=BCT` | Reservation chart |
| `GET /api/plan?from=NDLS&to=BCT&date=2025-06-15` | Journey planner |

## Deploy to Vercel

### Option 1: Vercel CLI (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

### Option 2: GitHub Integration

1. Push this repo to GitHub
2. Go to [Vercel Dashboard](https://vercel.com/dashboard)
3. Click "Add New..." → "Project"
4. Import your GitHub repo
5. Vercel auto-detects Python + `vercel.json`
6. Click Deploy

### Option 3: One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/ntes-api)

## Local Development

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run locally
uvicorn api.index:app --reload --port 8000
```

Visit `http://localhost:8000` for API docs (Swagger UI).

## Project Structure

```
ntes-api/
├── api/
│   └── index.py          # FastAPI app (entry point)
├── requirements.txt      # Python dependencies
├── vercel.json          # Vercel configuration
└── .gitignore
```

## Configuration

The `vercel.json` configures:
- Python runtime via `@vercel/python`
- Routes all requests to `api/index.py`
- 30-second max function duration (NTES API can be slow)

## Rate Limits & Caveats

- **Unofficial API** - No SLA, may break without notice
- **NTES endpoints** - Public, no auth required
- **PNR endpoint** - Uses captcha, higher failure rate
- **Rate limiting** - Be respectful; don't hammer the API
- **Vercel limits** - 30s max execution, 1024MB memory

## Environment Variables (Optional)

| Variable | Description | Default |
|----------|-------------|---------|
| `NTES_TIMEOUT` | Request timeout (seconds) | 20 |
| `NTES_RETRIES` | Retry attempts | 3 |

Set in Vercel Dashboard → Project → Settings → Environment Variables.

## License

MIT - Based on [ntes-client](https://github.com/x64vbhv/ntes-client) by Vaibhav Chandra.

## Disclaimer

Not affiliated with Indian Railways, CRIS, or IRCTC. For educational and personal use only. Use responsibly.