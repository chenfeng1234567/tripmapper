import { useState, useEffect } from 'react';
import { CATEGORIES, TRANSPORT_MODES } from '../lib/tripData.js';
import './EditPlaceModal.css';

/*
 * Modal form for editing or adding a single place. The parent decides which
 * (it just passes a `place` prop and an `onSave` handler).
 *
 * The form is intentionally lightweight — no schema library, no validation
 * beyond "lat/lng must be numbers, name must be non-empty" — because the
 * intended user is the trip's owner editing their own data.
 */
export default function EditPlaceModal({ place, days, mode, onSave, onClose }) {
  const [form, setForm] = useState(place);

  useEffect(() => { setForm(place); }, [place]);

  if (!place) return null;

  const set = (field) => (e) => {
    const raw = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm(f => ({ ...f, [field]: raw }));
  };

  const setNum = (field) => (e) => {
    const v = e.target.value;
    setForm(f => ({ ...f, [field]: v === '' ? null : Number(v) }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name?.trim()) return;
    if (form.lat == null || form.lng == null) return;
    onSave({
      ...form,
      name: form.name.trim(),
      day: Number(form.day),
      duration_minutes: Number(form.duration_minutes) || 60,
      popularity: Math.max(1, Math.min(10, Number(form.popularity) || 5)),
      lat: Number(form.lat),
      lng: Number(form.lng),
    });
  };

  // Allow placing on a brand-new day if the user types one that doesn't exist.
  const dayOptions = Array.from(new Set([...days, Number(form.day) || 1])).sort((a, b) => a - b);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{mode === 'add' ? 'Add a stop' : 'Edit stop'}</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <label className="field full">
            <span>Name</span>
            <input type="text" required value={form.name || ''} onChange={set('name')} />
          </label>

          <label className="field">
            <span>Day</span>
            <select value={form.day} onChange={set('day')}>
              {dayOptions.map(d => <option key={d} value={d}>Day {d}</option>)}
              <option value={Math.max(...dayOptions) + 1}>+ New day</option>
            </select>
          </label>

          <label className="field">
            <span>Category</span>
            <select value={form.category} onChange={set('category')}>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </label>

          <label className="field">
            <span>Latitude</span>
            <input
              type="number" step="0.0001" required
              value={form.lat ?? ''} onChange={setNum('lat')}
            />
          </label>

          <label className="field">
            <span>Longitude</span>
            <input
              type="number" step="0.0001" required
              value={form.lng ?? ''} onChange={setNum('lng')}
            />
          </label>

          <label className="field">
            <span>Duration (min)</span>
            <input
              type="number" min="0" step="5"
              value={form.duration_minutes ?? ''} onChange={setNum('duration_minutes')}
            />
          </label>

          <label className="field">
            <span>Popularity (1–10)</span>
            <input
              type="number" min="1" max="10"
              value={form.popularity ?? ''} onChange={setNum('popularity')}
            />
          </label>

          <label className="field full">
            <span>Address</span>
            <input type="text" value={form.address || ''} onChange={set('address')} />
          </label>

          <label className="field">
            <span>Opening hours</span>
            <input
              type="text" placeholder="9:00 – 17:00"
              value={form.opening_hours || ''} onChange={set('opening_hours')}
            />
          </label>

          <label className="field">
            <span>Transport from previous</span>
            <select value={form.transport_from_prev || ''} onChange={set('transport_from_prev')}>
              <option value="">— none —</option>
              {TRANSPORT_MODES.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </label>

          <label className="field">
            <span>Travel from previous (min)</span>
            <input
              type="number" min="0" step="1"
              value={form.travel_minutes_from_prev ?? ''}
              onChange={setNum('travel_minutes_from_prev')}
            />
          </label>

          <label className="field full">
            <span>Notes</span>
            <textarea
              rows={3}
              placeholder="Reservations, tips, things to remember…"
              value={form.notes || ''}
              onChange={set('notes')}
            />
          </label>

          <div className="modal-actions">
            <button type="button" className="m-btn ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="m-btn primary">
              {mode === 'add' ? 'Add stop' : 'Save changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
