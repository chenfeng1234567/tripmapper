# TripMapper

AI-powered travel itinerary planner with an interactive map. Enter a destination and trip length, and TripMapper generates a day-by-day itinerary, plots each place on a map, and lets you refine the plan through a chat interface.

## Features

- **AI itinerary generation** — Claude generates 4-5 places per day in logical geographic order
- **Interactive map** — Leaflet map with numbered markers, route polylines, and day filtering
- **Travel time estimates** — haversine distance + mode heuristics (walk / transit / car) between stops
- **Chat refinement** — ask the AI to add, remove, or swap places and the map updates live
- **Day & sort controls** — filter by day, sort by AI order, popularity, or nearest-first distance

## Project Structure

```
travel_map_design/
├── backend/
│   ├── server.js          # Express API server
│   ├── package.json
│   └── .env               # API keys (not committed — see setup below)
├── frontend/
│   ├── src/
│   │   ├── App.jsx        # Root component & state management
│   │   ├── components/
│   │   │   ├── SearchForm.jsx      # Destination / days / preferences form
│   │   │   ├── MapView.jsx         # Leaflet map with markers & polylines
│   │   │   ├── ItineraryPanel.jsx  # Scrollable place list with day tabs
│   │   │   ├── OverviewPanel.jsx   # City overview & highlights
│   │   │   └── ChatPanel.jsx       # Chat UI for itinerary edits
│   │   ├── App.css
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── .env.example           # Template — copy to backend/.env and fill in
└── .gitignore
```

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18, Vite, react-leaflet / Leaflet |
| Backend | Node.js, Express |
| AI | Anthropic Claude API (`claude-opus-4-6`) |
| Geocoding | Nominatim (OpenStreetMap) — free, no key needed |

## Setup

### Prerequisites

- Node.js 18+
- An [Anthropic API key](https://console.anthropic.com/)

### 1. Clone the repo

```bash
git clone <your-repo-url>
cd travel_map_design
```

### 2. Configure environment

```bash
cp .env.example backend/.env
```

Open `backend/.env` and replace `your_api_key_here` with your Anthropic API key:

```
ANTHROPIC_API_KEY=sk-ant-...
PORT=3001
```

### 3. Install dependencies

```bash
cd backend && npm install
cd ../frontend && npm install
```

### 4. Run locally

In one terminal start the backend:

```bash
cd backend
npm run dev
```

In another terminal start the frontend:

```bash
cd frontend
npm run dev
```

Open [http://localhost:5173](http://localhost:5173). The Vite dev server proxies `/api/*` requests to the backend on port 3001.

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/itinerary` | Generate itinerary for a destination |
| POST | `/api/chat` | Refine the current itinerary via chat |

### POST /api/itinerary

Request body:
```json
{
  "destination": "Tokyo",
  "days": 3,
  "preferences": "food, temples, local neighborhoods"
}
```

### POST /api/chat

Request body:
```json
{
  "message": "Replace day 2 lunch with a ramen spot",
  "history": [...],
  "currentItinerary": { ... }
}
```

## Notes

- Geocoding uses Nominatim at 1 request/second to respect the rate limit. Itinerary generation takes a few seconds per place.
- The `.env` file is excluded from version control. Never commit real API keys.
