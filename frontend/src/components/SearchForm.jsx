import { useState } from 'react';
import './SearchForm.css';

const INTERESTS = [
  { label: 'Food & Dining',    icon: '🍜' },
  { label: 'Art & Museums',    icon: '🎨' },
  { label: 'Nature & Parks',   icon: '🌿' },
  { label: 'History',          icon: '🏛️' },
  { label: 'Shopping',         icon: '🛍️' },
  { label: 'Nightlife',        icon: '✨' },
  { label: 'Family Friendly',  icon: '👨‍👩‍👧' },
];

export default function SearchForm({ onSubmit, loading, hasItinerary, onCollapse }) {
  const [destination, setDestination] = useState('');
  const [days, setDays] = useState('2');
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [customPrefs, setCustomPrefs] = useState('');

  const toggleInterest = (label) =>
    setSelectedInterests(prev =>
      prev.includes(label) ? prev.filter(i => i !== label) : [...prev, label]
    );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!destination.trim()) return;
    const prefs = [...selectedInterests, customPrefs.trim()].filter(Boolean).join(', ')
      || 'general sightseeing';
    onSubmit({ destination: destination.trim(), days, preferences: prefs });
  };

  return (
    <form className="search-form" onSubmit={handleSubmit}>
      <div className="search-form-header">
        <h2>Plan your trip</h2>
        {hasItinerary && (
          <button type="button" className="collapse-btn" onClick={onCollapse} aria-label="Collapse search">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="18 15 12 9 6 15"/>
            </svg>
          </button>
        )}
      </div>

      <div className="form-field">
        <label className="form-label" htmlFor="destination">Destination</label>
        <div className="input-wrap">
          <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            id="destination"
            className="form-input with-icon"
            type="text"
            placeholder="City, country, or region..."
            value={destination}
            onChange={e => setDestination(e.target.value)}
            disabled={loading}
            autoComplete="off"
          />
        </div>
      </div>

      <div className="form-field">
        <label className="form-label">Trip duration</label>
        <div className="day-row">
          {['1', '2', '3', '4', '5'].map(d => (
            <button
              key={d}
              type="button"
              className={`day-chip ${days === d ? 'active' : ''}`}
              onClick={() => setDays(d)}
              disabled={loading}
            >
              {d} day{d !== '1' ? 's' : ''}
            </button>
          ))}
        </div>
      </div>

      <div className="form-field">
        <label className="form-label">Interests <span className="label-opt">optional</span></label>
        <div className="interest-row">
          {INTERESTS.map(({ label }) => (
            <button
              key={label}
              type="button"
              className={`interest-chip ${selectedInterests.includes(label) ? 'active' : ''}`}
              onClick={() => toggleInterest(label)}
              disabled={loading}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="form-field">
        <label className="form-label" htmlFor="prefs">Other preferences <span className="label-opt">optional</span></label>
        <input
          id="prefs"
          className="form-input"
          type="text"
          placeholder="e.g. budget-friendly, avoid crowds..."
          value={customPrefs}
          onChange={e => setCustomPrefs(e.target.value)}
          disabled={loading}
        />
      </div>

      <button type="submit" className="generate-btn" disabled={loading || !destination.trim()}>
        {loading ? (
          <>
            <span className="btn-spinner" />
            Generating...
          </>
        ) : (
          <>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="5 3 19 12 5 21 5 3"/>
            </svg>
            Plan My Trip
          </>
        )}
      </button>
    </form>
  );
}
