import { useEffect, useMemo, useState } from 'react';
import TripToolbar from './components/TripToolbar.jsx';
import OverviewPanel from './components/OverviewPanel.jsx';
import Filters from './components/Filters.jsx';
import ItineraryPanel from './components/ItineraryPanel.jsx';
import MapView from './components/MapView.jsx';
import EditPlaceModal from './components/EditPlaceModal.jsx';
import { loadSampleTrip, makeBlankPlace } from './lib/tripData.js';
import { updatePlace, deletePlace, addPlaceToDay, movePlaceWithinDay } from './lib/tripOps.js';
import './App.css';

// Greedy nearest-neighbor reorder used by the "Nearest route" sort mode.
function greedyByDistance(places) {
  if (places.length <= 1) return places;
  const remaining = [...places];
  const out = [remaining.shift()];
  while (remaining.length) {
    const last = out[out.length - 1];
    let best = 0, bestD = Infinity;
    remaining.forEach((p, i) => {
      const d = Math.hypot(p.lat - last.lat, p.lng - last.lng);
      if (d < bestD) { bestD = d; best = i; }
    });
    out.push(remaining.splice(best, 1)[0]);
  }
  return out;
}

export default function App() {
  const [trip, setTrip]       = useState(null);
  const [error, setError]     = useState(null);
  const [loading, setLoading] = useState(true);

  // Selection + filter state
  const [selectedPlace, setSelectedPlace]       = useState(null);
  const [activeDay, setActiveDay]               = useState('all');
  const [activeCategories, setActiveCategories] = useState(new Set()); // empty = show all
  const [sortMode, setSortMode]                 = useState('plan');

  // Modal state
  const [editing, setEditing]   = useState(null); // { place, mode }

  // Load the bundled Seattle sample on first mount.
  useEffect(() => {
    loadSampleTrip()
      .then(setTrip)
      .catch(e => setError(`Failed to load sample trip: ${e.message}`))
      .finally(() => setLoading(false));
  }, []);

  // Reset filters / selection whenever a new trip is loaded.
  const handleTripLoaded = (next) => {
    setTrip(next);
    setSelectedPlace(null);
    setActiveDay('all');
    setActiveCategories(new Set());
    setSortMode('plan');
    setError(null);
  };

  // ── derived state ────────────────────────────────────────────────────
  const days = useMemo(() => {
    if (!trip) return [];
    return [...new Set(trip.places.map(p => p.day))].sort((a, b) => a - b);
  }, [trip]);

  const categories = useMemo(() => {
    if (!trip) return [];
    return [...new Set(trip.places.map(p => p.category))].sort();
  }, [trip]);

  const filteredPlaces = useMemo(() => {
    if (!trip) return [];
    let list = trip.places;
    if (activeDay !== 'all') list = list.filter(p => p.day === Number(activeDay));
    if (activeCategories.size > 0) list = list.filter(p => activeCategories.has(p.category));

    if (sortMode === 'popularity') return [...list].sort((a, b) => b.popularity - a.popularity);
    if (sortMode === 'route')      return greedyByDistance(list);
    return list; // 'plan' — already sorted by (day, order)
  }, [trip, activeDay, activeCategories, sortMode]);

  // ── place-edit handlers ──────────────────────────────────────────────
  const toggleCategory = (cat) => {
    setActiveCategories(prev => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat); else next.add(cat);
      return next;
    });
  };

  const handleEditPlace = (place) => setEditing({ place, mode: 'edit' });

  const handleAddPlace = () => {
    const day = activeDay === 'all' ? (days[0] || 1) : Number(activeDay);
    setEditing({ place: makeBlankPlace(day), mode: 'add' });
  };

  const handleSavePlace = (next) => {
    if (!trip) return;
    if (editing.mode === 'add') {
      setTrip({ ...trip, places: addPlaceToDay(trip.places, next, next.day) });
    } else {
      setTrip({ ...trip, places: updatePlace(trip.places, next.id, next) });
    }
    setEditing(null);
  };

  const handleDeletePlace = (id) => {
    if (!trip) return;
    if (!confirm('Remove this stop from the trip?')) return;
    setTrip({ ...trip, places: deletePlace(trip.places, id) });
    if (selectedPlace?.id === id) setSelectedPlace(null);
  };

  const handleMovePlace = (id, direction) => {
    if (!trip) return;
    setTrip({ ...trip, places: movePlaceWithinDay(trip.places, id, direction) });
  };

  // ── render ───────────────────────────────────────────────────────────
  return (
    <div className="app">
      <TripToolbar
        trip={trip}
        onTripLoaded={handleTripLoaded}
        onAddPlace={handleAddPlace}
        onError={setError}
      />

      {error && (
        <div className="error-banner">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span>{error}</span>
          <button className="error-close" onClick={() => setError(null)}>×</button>
        </div>
      )}

      <div className="app-body">
        <aside className="sidebar">
          {loading && <div className="sidebar-status">Loading sample trip…</div>}

          {trip && (
            <>
              <OverviewPanel city={trip.city} places={trip.places} days={days} />
              <Filters
                days={days}
                activeDay={activeDay}
                onDayChange={setActiveDay}
                categories={categories}
                activeCategories={activeCategories}
                onToggleCategory={toggleCategory}
                onClearCategories={() => setActiveCategories(new Set())}
                sortMode={sortMode}
                onSortChange={setSortMode}
                filteredCount={filteredPlaces.length}
                totalCount={trip.places.length}
              />
              <div className="sidebar-scroll">
                <ItineraryPanel
                  places={filteredPlaces}
                  allPlaces={trip.places}
                  days={days}
                  activeDay={activeDay}
                  selectedPlace={selectedPlace}
                  onSelectPlace={setSelectedPlace}
                  onEditPlace={handleEditPlace}
                  onDeletePlace={handleDeletePlace}
                  onMovePlace={handleMovePlace}
                />
              </div>
            </>
          )}
        </aside>

        <main className="map-section">
          <MapView
            places={filteredPlaces}
            allPlaces={trip?.places || []}
            activeDay={activeDay}
            selectedPlace={selectedPlace}
            onSelectPlace={setSelectedPlace}
          />
        </main>
      </div>

      {editing && (
        <EditPlaceModal
          place={editing.place}
          mode={editing.mode}
          days={days}
          onSave={handleSavePlace}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}
