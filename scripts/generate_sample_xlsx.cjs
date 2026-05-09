/*
 * Generates static/seattle_trip.xlsx — a sample 3-day Seattle itinerary used
 * as the default trip when the app loads.
 *
 * Run with:  npm run generate-sample
 *
 * Edit the `places` array below to change the sample. Every column listed in
 * COLUMNS is what the app expects when reading any user-uploaded spreadsheet.
 */
const path = require('path');
const XLSX = require('xlsx');

const COLUMNS = [
  'day', 'order', 'name', 'category',
  'lat', 'lng', 'address',
  'duration_minutes', 'popularity',
  'transport_from_prev', 'travel_minutes_from_prev',
  'opening_hours', 'notes',
];

// Seattle itinerary. Coordinates are real; descriptions are short on purpose
// so they fit nicely in the popups.
const places = [
  // ---------------- Day 1 — Downtown & Waterfront ----------------
  { day: 1, order: 1, name: 'Pike Place Market',           category: 'Landmark',
    lat: 47.6097, lng: -122.3422, address: '85 Pike St, Seattle, WA',
    duration_minutes: 90, popularity: 10,
    transport_from_prev: '', travel_minutes_from_prev: '',
    opening_hours: '9:00–18:00', notes: 'Watch the fish-throwing at the original stall.' },

  { day: 1, order: 2, name: 'Pike Place Chowder',           category: 'Food',
    lat: 47.6099, lng: -122.3404, address: '1530 Post Alley, Seattle, WA',
    duration_minutes: 45, popularity: 9,
    transport_from_prev: 'walk', travel_minutes_from_prev: 4,
    opening_hours: '11:00–17:00', notes: 'Get the New England clam chowder sampler.' },

  { day: 1, order: 3, name: 'Seattle Aquarium',             category: 'Entertainment',
    lat: 47.6076, lng: -122.3425, address: '1483 Alaskan Way, Seattle, WA',
    duration_minutes: 90, popularity: 8,
    transport_from_prev: 'walk', travel_minutes_from_prev: 6,
    opening_hours: '9:30–18:00', notes: 'Sea otter feeding at 11:30 and 14:00.' },

  { day: 1, order: 4, name: 'Olympic Sculpture Park',       category: 'Park',
    lat: 47.6166, lng: -122.3553, address: '2901 Western Ave, Seattle, WA',
    duration_minutes: 60, popularity: 7,
    transport_from_prev: 'walk', travel_minutes_from_prev: 18,
    opening_hours: 'Sunrise–sunset', notes: 'Free outdoor sculpture by Calder, Serra & friends.' },

  { day: 1, order: 5, name: 'Space Needle',                 category: 'Landmark',
    lat: 47.6205, lng: -122.3493, address: '400 Broad St, Seattle, WA',
    duration_minutes: 75, popularity: 10,
    transport_from_prev: 'walk', travel_minutes_from_prev: 12,
    opening_hours: '10:00–22:00', notes: 'Book the rotating glass floor before sunset.' },

  { day: 1, order: 6, name: 'Chihuly Garden and Glass',     category: 'Museum',
    lat: 47.6206, lng: -122.3502, address: '305 Harrison St, Seattle, WA',
    duration_minutes: 75, popularity: 9,
    transport_from_prev: 'walk', travel_minutes_from_prev: 3,
    opening_hours: '10:00–20:00', notes: 'Combo ticket with the Space Needle saves $.' },

  // ---------------- Day 2 — Capitol Hill & Seattle Center ----------------
  { day: 2, order: 1, name: 'Volunteer Park Conservatory',  category: 'Nature',
    lat: 47.6306, lng: -122.3158, address: '1402 E Galer St, Seattle, WA',
    duration_minutes: 60, popularity: 7,
    transport_from_prev: '', travel_minutes_from_prev: '',
    opening_hours: '10:00–16:00', notes: 'Climb the water tower for free city views.' },

  { day: 2, order: 2, name: 'Espresso Vivace',              category: 'Food',
    lat: 47.6188, lng: -122.3211, address: '532 Broadway E, Seattle, WA',
    duration_minutes: 30, popularity: 8,
    transport_from_prev: 'walk', travel_minutes_from_prev: 14,
    opening_hours: '6:00–22:00', notes: 'Order the caffè nico — the rosetta is iconic.' },

  { day: 2, order: 3, name: 'Museum of Pop Culture (MoPOP)', category: 'Museum',
    lat: 47.6215, lng: -122.3484, address: '325 5th Ave N, Seattle, WA',
    duration_minutes: 120, popularity: 8,
    transport_from_prev: 'transit', travel_minutes_from_prev: 18,
    opening_hours: '10:00–17:00', notes: 'Sound Lab lets you jam on real instruments.' },

  { day: 2, order: 4, name: 'Kerry Park Viewpoint',         category: 'Landmark',
    lat: 47.6296, lng: -122.3599, address: '211 W Highland Dr, Seattle, WA',
    duration_minutes: 30, popularity: 9,
    transport_from_prev: 'car', travel_minutes_from_prev: 9,
    opening_hours: 'Always open', notes: 'Best skyline shot in the city — go at golden hour.' },

  { day: 2, order: 5, name: 'Dick’s Drive-In (Capitol Hill)', category: 'Food',
    lat: 47.6190, lng: -122.3214, address: '115 Broadway E, Seattle, WA',
    duration_minutes: 30, popularity: 7,
    transport_from_prev: 'car', travel_minutes_from_prev: 14,
    opening_hours: '10:30–02:00', notes: 'Cash only at some windows. Get the Deluxe.' },

  // ---------------- Day 3 — Ballard, Fremont & Discovery Park ----------------
  { day: 3, order: 1, name: 'Ballard Locks',                category: 'Landmark',
    lat: 47.6657, lng: -122.3974, address: '3015 NW 54th St, Seattle, WA',
    duration_minutes: 60, popularity: 7,
    transport_from_prev: '', travel_minutes_from_prev: '',
    opening_hours: '7:00–21:00', notes: 'Watch boats pass through; salmon ladder downstairs.' },

  { day: 3, order: 2, name: 'Discovery Park',               category: 'Nature',
    lat: 47.6614, lng: -122.4351, address: '3801 Discovery Park Blvd, Seattle, WA',
    duration_minutes: 120, popularity: 8,
    transport_from_prev: 'car', travel_minutes_from_prev: 14,
    opening_hours: '4:00–23:30', notes: 'Loop trail to the lighthouse takes ~1 hour.' },

  { day: 3, order: 3, name: 'Fremont Troll',                category: 'Landmark',
    lat: 47.6510, lng: -122.3473, address: 'N 36th St, Seattle, WA',
    duration_minutes: 20, popularity: 6,
    transport_from_prev: 'car', travel_minutes_from_prev: 16,
    opening_hours: 'Always open', notes: 'Quirky photo stop under the Aurora Bridge.' },

  { day: 3, order: 4, name: 'The Pink Door',                category: 'Food',
    lat: 47.6093, lng: -122.3414, address: '1919 Post Alley, Seattle, WA',
    duration_minutes: 90, popularity: 9,
    transport_from_prev: 'transit', travel_minutes_from_prev: 22,
    opening_hours: '17:00–22:00', notes: 'Italian + cabaret. Reserve early or sit at the bar.' },

  { day: 3, order: 5, name: 'Seattle Public Library (Central)', category: 'Landmark',
    lat: 47.6063, lng: -122.3324, address: '1000 4th Ave, Seattle, WA',
    duration_minutes: 45, popularity: 7,
    transport_from_prev: 'walk', travel_minutes_from_prev: 8,
    opening_hours: '10:00–20:00', notes: 'Take the elevator to the 10th-floor reading room.' },
];

// Re-order to match COLUMNS so the spreadsheet column order is predictable.
const rows = places.map(p => {
  const row = {};
  COLUMNS.forEach(c => { row[c] = p[c] ?? ''; });
  return row;
});

const wb = XLSX.utils.book_new();
const ws = XLSX.utils.json_to_sheet(rows, { header: COLUMNS });

// Reasonable column widths so the file is readable when opened in Excel.
ws['!cols'] = [
  { wch: 5 }, { wch: 6 }, { wch: 30 }, { wch: 14 },
  { wch: 10 }, { wch: 11 }, { wch: 38 },
  { wch: 8 }, { wch: 6 },
  { wch: 10 }, { wch: 10 },
  { wch: 14 }, { wch: 50 },
];

XLSX.utils.book_append_sheet(wb, ws, 'Seattle Trip');

const outPath = path.join(__dirname, '..', 'static', 'seattle_trip.xlsx');
XLSX.writeFile(wb, outPath);
console.log(`Wrote ${rows.length} rows to ${outPath}`);
