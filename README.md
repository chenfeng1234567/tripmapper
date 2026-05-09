# TripMapper

An interactive trip-itinerary visualization built for **CSE 512 — Assignment 3**.
Upload (or use the bundled sample) an Excel file describing a multi-day trip and
explore your stops on a map: filter by day or category, sort by route, edit /
add / remove stops, and export the modified plan back to Excel.

> **Live demo:** _<add your GitLab Pages URL here>_

---

## What this answers

> _Given a trip plan (a list of places spread across days, with travel time and
> mode between them), how can a traveler quickly see the **shape** of the trip
> — where the day clusters are, how time splits between sights and transit,
> what the stops are like — and then refine it on the spot?_

A spreadsheet of stops is easy to write but hard to read; a static map shows
geography but loses the schedule. TripMapper joins both views and adds a small
set of interactive techniques so the same data answers questions like:

- "Which day is the most travel-heavy?"  → day bars in the overview panel.
- "Show only the food stops."  → category multi-filter.
- "What's the quickest route through Day 2?"  → "Nearest route" sort mode.
- "Move the museum from Day 1 to Day 2 and see how it looks."  → edit modal.
- "What's the address again?"  → click a marker → details popup.

---

## Interactions

| Technique | Where |
|---|---|
| Pan / zoom | Map (Leaflet built-in) |
| Dynamic query — single-select | Day filter (chips) |
| Dynamic query — multi-toggle | Category filter (chips). Empty selection = show all. |
| Selecting a different measure | Sort: plan order / nearest route / popularity |
| Linked highlighting | Selecting a stop in the list pans + opens its popup; clicking a marker selects the card. |
| Details on demand | Marker popup + expanded list card with notes, hours, address |
| Direct manipulation | Edit / add / delete a stop, reorder within a day |
| Import / export | Open any `.xlsx`/`.csv`; export the current state back to `.xlsx` |
| Brushing-by-encoding | Selecting one stop dims all other markers so you can isolate it visually |

---

## Design rationale

**Color coding by day, not by category.** A trip is a sequence; the eye should
trace day-routes first. Category is communicated by an emoji glyph inside each
marker — secondary information that's available at a glance without competing
with the route encoding.

**Two layers in the day-stat bars.** A solid block shows time spent _at_
stops; a hatched block shows time _in transit_. This makes "Day 3 is mostly
driving" visible without reading numbers.

**Travel-time pills sit at segment midpoints**, not on the markers, so the
schedule is part of the route line itself. Pills are non-interactive so they
never block marker clicks.

**The sidebar mirrors the map.** Filters, sort, day/category chips, and the
list all reflect the same data subset. Selecting a stop in either view updates
the other — multi-view coordination without a separate "details" pane.

**Edits live entirely in client state.** No backend, no auth. Loading the
sample, editing it, and exporting your version back to `.xlsx` is the full
loop — keeping deployment simple (static GitLab Pages) and making the data
format readable in any spreadsheet tool.

### Alternatives considered

- **Marker color = category, line color = day.** Tried first; harder to scan
  because the marker is the more salient mark. Reversed.
- **Tabs per day instead of an "All days" view.** Cleaner but lost the
  cross-day overview. Kept tabs *and* an "All" mode with day dividers.
- **A drag-and-drop reorder list.** Would be nicer than up/down buttons, but
  scope-wise an extra dependency for marginal gain — left for the final
  project.

---

## Data format

The app reads the first sheet of an `.xlsx`/`.xls`/`.csv` file. Columns are
matched case-insensitively; only `day`, `name`, `lat`, `lng` are required.

| Column | Type | Notes |
|---|---|---|
| `day` | int | 1, 2, 3 … |
| `order` | int | order within the day; auto-renumbered if missing |
| `name` | string | stop name |
| `category` | string | one of: Landmark, Museum, Food, Park, Nature, Shopping, Entertainment, Neighborhood |
| `lat`, `lng` | float | coordinates |
| `address` | string | optional |
| `duration_minutes` | int | time spent at the stop |
| `popularity` | 1–10 | drives the star rating |
| `transport_from_prev` | walk/transit/car | how you got here from the previous stop |
| `travel_minutes_from_prev` | int | minutes |
| `opening_hours` | string | free text, e.g. `9:00–18:00` |
| `notes` | string | free text |

See [`scripts/generate_sample_xlsx.cjs`](scripts/generate_sample_xlsx.cjs) for
the bundled Seattle example.

---

## Project structure

```
tripmapper/
├── index.html
├── package.json
├── vite.config.js
├── .gitlab-ci.yml          # builds to ./public on push
├── scripts/
│   └── generate_sample_xlsx.cjs
├── static/                 # served as-is; copied into the build
│   └── seattle_trip.xlsx
└── src/
    ├── main.jsx
    ├── App.jsx / App.css
    ├── index.css
    ├── lib/
    │   ├── tripData.js     # parse / export xlsx, sample loader
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

---

## Run locally

```bash
npm install
npm run dev          # http://localhost:5173
```

Other scripts:

```bash
npm run build            # outputs to ./public (what GitLab Pages serves)
npm run preview          # preview the production build
npm run generate-sample  # rebuild static/seattle_trip.xlsx from the script
```

## Deploy on GitLab Pages

The included `.gitlab-ci.yml` runs `npm install && npm run build` on push and
publishes the `public/` artifact. No manual steps required once the repo is on
GitLab.

---

## References

- **Map tiles & geocoding:** [OpenStreetMap](https://www.openstreetmap.org/)
- **Map library:** [Leaflet](https://leafletjs.com/) + [react-leaflet](https://react-leaflet.js.org/)
- **Spreadsheet I/O:** [SheetJS (xlsx)](https://sheetjs.com/)
- **Visual reference:** [pitravel.cn](https://www.pitravel.cn/) — for the
  side-by-side list-and-map layout and travel-time pills.
- **Course readings:** Ahlberg & Shneiderman 1994 (dynamic queries / brushing);
  Wattenberg 2005 (NameVoyager).

Sample Seattle data is hand-curated from public information; coordinates are
from OpenStreetMap.

---

## Team & development process

> _TODO: replace this section with your team details before submitting._

**Team members:** _Names, UW emails, GitLab usernames._

**How work was split:** _e.g. who built the map, who built the filters, who
authored the sample data, who wrote the README._

**Time spent:** _≈ X person-hours total._

**What took the most time:** _e.g. designing the marker style so day + category
were both legible; getting the day-by-day polylines and travel pills to update
correctly when filters change; supporting both upload-from-Excel and export-back
without losing fields._
