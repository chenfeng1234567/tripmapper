import { useRef } from 'react';
import { parseTripWorkbook, downloadTripAsXlsx } from '../lib/tripData.js';
import './TripToolbar.css';

/*
 * Top-of-app toolbar. Three responsibilities:
 *  1. Show the current trip name + summary stats.
 *  2. Let the user upload their own .xlsx / .xls / .csv.
 *  3. Export the (possibly edited) trip back to .xlsx.
 */
export default function TripToolbar({ trip, onTripLoaded, onAddPlace, onError }) {
  const fileInputRef = useRef(null);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const buf = await file.arrayBuffer();
      const next = parseTripWorkbook(buf, file.name);
      onTripLoaded(next);
    } catch (err) {
      onError(`Couldn't read "${file.name}":\n${err.message}`);
    } finally {
      // Reset so re-uploading the same file fires `change` again.
      e.target.value = '';
    }
  };

  const handleExport = () => {
    if (!trip) return;
    const safe = (trip.city || 'trip').toLowerCase().replace(/\s+/g, '_');
    downloadTripAsXlsx(trip, `${safe}.xlsx`);
  };

  return (
    <header className="toolbar">
      <div className="toolbar-brand">
        <svg className="toolbar-logo" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="10" r="3" />
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
        </svg>
        <div className="toolbar-titles">
          <h1>TripMapper</h1>
          <span className="toolbar-sub">Interactive trip visualization</span>
        </div>
      </div>

      <div className="toolbar-actions">
        <button className="tb-btn ghost" onClick={onAddPlace} disabled={!trip}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add stop
        </button>

        <button className="tb-btn ghost" onClick={() => fileInputRef.current?.click()}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          Open Excel
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls,.csv"
          onChange={handleFile}
          hidden
        />

        <button className="tb-btn primary" onClick={handleExport} disabled={!trip}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          Export
        </button>
      </div>
    </header>
  );
}
