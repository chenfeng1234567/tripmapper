import * as XLSX from 'xlsx';

/*
 * Trip data shape used everywhere in the app:
 *
 *   {
 *     city:   string,                  // derived from filename if not given
 *     places: Place[],                 // already sorted by (day, order)
 *   }
 *
 *   Place {
 *     id:                       string,    // stable id for React keys
 *     day:                      number,
 *     order:                    number,    // order within the day
 *     name:                     string,
 *     category:                 string,    // one of CATEGORIES
 *     lat, lng:                 number,
 *     address:                  string,
 *     duration_minutes:         number,
 *     popularity:               number,    // 1-10
 *     opening_hours:            string,
 *     notes:                    string,
 *     transport_from_prev:      'walk' | 'transit' | 'car' | '',
 *     travel_minutes_from_prev: number | null,
 *   }
 *
 * Anything else found in the spreadsheet is preserved on the place object
 * but ignored by the app.
 */

export const CATEGORIES = [
  'Landmark', 'Museum', 'Food', 'Park',
  'Nature', 'Shopping', 'Entertainment', 'Neighborhood',
];

export const TRANSPORT_MODES = ['walk', 'transit', 'car'];

const REQUIRED_COLUMNS = ['day', 'name', 'lat', 'lng'];

let nextId = 1;
const newId = () => `p${nextId++}`;

function num(v) {
  if (v === '' || v == null) return null;
  const n = typeof v === 'number' ? v : parseFloat(v);
  return Number.isFinite(n) ? n : null;
}

function str(v) {
  return v == null ? '' : String(v).trim();
}

function normalizeRow(row) {
  // Lower-case keys for case-insensitive matching.
  const r = {};
  Object.keys(row).forEach(k => { r[k.toLowerCase().trim()] = row[k]; });

  const place = {
    id:                       newId(),
    day:                      num(r.day),
    order:                    num(r.order) ?? 0,
    name:                     str(r.name),
    category:                 str(r.category) || 'Landmark',
    lat:                      num(r.lat),
    lng:                      num(r.lng),
    address:                  str(r.address),
    duration_minutes:         num(r.duration_minutes) ?? 60,
    popularity:               Math.max(1, Math.min(10, num(r.popularity) ?? 5)),
    opening_hours:            str(r.opening_hours),
    notes:                    str(r.notes),
    transport_from_prev:      str(r.transport_from_prev).toLowerCase(),
    travel_minutes_from_prev: num(r.travel_minutes_from_prev),
  };

  return place;
}

function validatePlaces(places) {
  const errors = [];
  places.forEach((p, i) => {
    REQUIRED_COLUMNS.forEach(col => {
      const v = p[col === 'name' ? 'name' : col];
      if (v == null || v === '') {
        errors.push(`Row ${i + 2}: missing required column "${col}".`);
      }
    });
  });
  return errors;
}

export function parseTripWorkbook(arrayBuffer, filename = '') {
  const wb = XLSX.read(arrayBuffer, { type: 'array' });
  const sheetName = wb.SheetNames[0];
  if (!sheetName) throw new Error('Workbook contains no sheets.');

  const rows = XLSX.utils.sheet_to_json(wb.Sheets[sheetName], { defval: '' });
  if (rows.length === 0) throw new Error('Sheet is empty.');

  const places = rows.map(normalizeRow);
  const errors = validatePlaces(places);
  if (errors.length) throw new Error(errors.slice(0, 3).join('\n'));

  // Sort by (day, order) so the on-map index matches the user's intent.
  places.sort((a, b) => (a.day - b.day) || (a.order - b.order));

  // Re-stamp `order` so it is contiguous within each day. This makes editing
  // (insert / delete / reorder) consistent regardless of what the file had.
  const byDay = new Map();
  places.forEach(p => {
    const list = byDay.get(p.day) || [];
    list.push(p);
    byDay.set(p.day, list);
  });
  byDay.forEach(list => list.forEach((p, i) => { p.order = i + 1; }));

  // Derive a city name from the sheet name if it looks meaningful, else from
  // the file name. This is just used as a label.
  const guessFromSheet = sheetName !== 'Sheet1' ? sheetName.replace(/trip$/i, '').trim() : '';
  const guessFromFile  = filename.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ').trim();
  const city = guessFromSheet || guessFromFile || 'My Trip';

  return { city, places };
}

export async function loadSampleTrip() {
  const res = await fetch(`${import.meta.env.BASE_URL}seattle_trip.xlsx`);
  if (!res.ok) throw new Error('Failed to load sample trip file.');
  const buf = await res.arrayBuffer();
  return parseTripWorkbook(buf, 'Seattle Trip');
}

export function exportTripToWorkbook(trip) {
  const COLUMNS = [
    'day', 'order', 'name', 'category',
    'lat', 'lng', 'address',
    'duration_minutes', 'popularity',
    'transport_from_prev', 'travel_minutes_from_prev',
    'opening_hours', 'notes',
  ];
  const rows = trip.places.map(p => {
    const r = {};
    COLUMNS.forEach(c => { r[c] = p[c] ?? ''; });
    return r;
  });
  const ws = XLSX.utils.json_to_sheet(rows, { header: COLUMNS });
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, `${trip.city || 'Trip'}`.slice(0, 31));
  return wb;
}

export function downloadTripAsXlsx(trip, filename = 'trip.xlsx') {
  const wb = exportTripToWorkbook(trip);
  XLSX.writeFile(wb, filename);
}

// Helper used by the app whenever a place is created.
export function makeBlankPlace(day = 1) {
  return {
    id: newId(),
    day,
    order: 99,
    name: 'New stop',
    category: 'Landmark',
    lat: null,
    lng: null,
    address: '',
    duration_minutes: 60,
    popularity: 5,
    opening_hours: '',
    notes: '',
    transport_from_prev: '',
    travel_minutes_from_prev: null,
  };
}
