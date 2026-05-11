<<<<<<< HEAD
# TripMapper

An interactive map-based view of a multi-day trip. Open an Excel file
describing your stops, then explore them by day, by category, or by route —
edit, add, or remove stops as you go, and export the result back to Excel.

Built for **CSE 512 (Spring 2026), Assignment 3**.

> **Live demo:** _<add your GitLab Pages URL here>_
> **Write-up:** [writeup.html](static/writeup.html) — also linked from the
> "Write-up" button in the app's top bar.

---

## Run it locally

You'll need [Node.js 18+](https://nodejs.org/) installed.

```bash
npm install      # one time
npm run dev      # opens at http://localhost:5173
```

That's it. The app loads a bundled Seattle sample on first open. Drop in
your own `.xlsx` with the **Open Excel** button to see your own trip.

## Other commands

```bash
npm run build            # builds the static site to ./public
npm run preview          # serves the production build locally
npm run generate-sample  # rebuilds static/seattle_trip.xlsx from the script
```

## Excel file format

Only the first sheet is read. Column names are case-insensitive. Required
columns: `day`, `name`, `lat`, `lng`. The bundled
[`scripts/generate_sample_xlsx.cjs`](scripts/generate_sample_xlsx.cjs) is the
easiest reference — it lists every column the app understands.

| Column | Required | Notes |
|---|---|---|
| `day` | ✓ | 1, 2, 3 … |
| `order` |  | order within the day; auto-assigned if missing |
| `name` | ✓ | stop name |
| `category` |  | Landmark, Museum, Food, Park, Nature, Shopping, Entertainment, Neighborhood |
| `lat`, `lng` | ✓ | coordinates |
| `address` |  | free text |
| `duration_minutes` |  | time spent at the stop |
| `popularity` |  | 1–10 |
| `transport_from_prev` |  | walk / transit / car |
| `travel_minutes_from_prev` |  | minutes from the previous stop |
| `opening_hours` |  | free text, e.g. `9:00–18:00` |
| `notes` |  | free text |

## Project layout

```
tripmapper/
├── index.html
├── package.json
├── vite.config.js
├── .gitlab-ci.yml          # auto-deploys ./public to GitLab Pages
├── scripts/
│   └── generate_sample_xlsx.cjs
├── static/                 # served as-is; copied into the build
│   ├── seattle_trip.xlsx   # bundled sample trip
│   └── writeup.html        # standalone write-up page
└── src/
    ├── main.jsx, App.jsx, App.css, index.css
    ├── lib/
    │   ├── tripData.js     # parse & export xlsx
    │   ├── tripOps.js      # pure add / update / delete / reorder
    │   └── colors.js       # day & category palettes
    └── components/
        ├── TripToolbar.jsx
        ├── OverviewPanel.jsx
        ├── Filters.jsx
        ├── ItineraryPanel.jsx
        ├── MapView.jsx
        └── EditPlaceModal.jsx
```

## Deploy to GitLab Pages

The included `.gitlab-ci.yml` runs `npm install && npm run build` on every
push to the default branch and publishes the `public/` artifact. No manual
steps once the repo is on GitLab.

## Tech stack

React · Vite · Leaflet (via react-leaflet) · SheetJS (`xlsx`) · OpenStreetMap tiles.

---

Read the [write-up](static/writeup.html) for the question this visualization
answers, the design rationale behind the visual encodings and interaction
techniques, references, and the team's development process.
=======
