import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import { dayColor, categoryStyle } from '../lib/colors.js';
import './MapView.css';

/*
 * Markers
 *  - Color of the ring  → which day the stop belongs to (lets you trace the
 *    route with your eye even when many days are visible).
 *  - Number             → order within the day.
 *  - Center icon        → category emoji, so you can spot food / parks /
 *    museums at a glance without reading.
 *  - Selected stops     → larger + drop-shadow + ring.
 *
 * Routes
 *  - One dashed polyline per day, drawn in the day color, with a soft halo
 *    underneath so it stays legible over dense map tiles.
 *
 * Travel-time labels
 *  - A small pill placed at the segment midpoint with the mode emoji and the
 *    duration. Non-interactive so it never blocks marker clicks.
 */

const TRANSPORT_EMOJI = { walk: '🚶', transit: '🚌', car: '🚗' };

function createMarkerIcon(place, number, isSelected, isDimmed) {
  const dc = dayColor(place.day);
  const cat = categoryStyle(place.category);
  const size = isSelected ? 38 : 32;
  const ring = isSelected ? 3.5 : 2.5;

  return L.divIcon({
    className: 'tm-marker-wrap',
    html: `
      <div class="tm-marker ${isSelected ? 'sel' : ''} ${isDimmed ? 'dim' : ''}"
           style="--dc:${dc};--cat:${cat.solid};width:${size}px;height:${size}px;border-width:${ring}px;">
        <span class="tm-marker-icon">${cat.icon}</span>
        <span class="tm-marker-num">${number}</span>
      </div>`,
    iconSize:  [size, size],
    iconAnchor:[size / 2, size / 2],
    popupAnchor:[0, -(size / 2 + 4)],
  });
}

function createTravelLabel(seg) {
  const emoji = TRANSPORT_EMOJI[seg.mode] || '🚶';
  return L.divIcon({
    className: 'tm-travel-wrap',
    html: `<div class="tm-travel" style="--c:${seg.color}">
             <span>${emoji}</span><span>${seg.minutes} min</span>
           </div>`,
    iconSize: [70, 22],
    iconAnchor:[35, 11],
  });
}

function createPopupHtml(place, number) {
  const dc  = dayColor(place.day);
  const cat = categoryStyle(place.category);
  const notes = place.notes
    ? `<div class="popup-notes">💡 ${escapeHtml(place.notes)}</div>` : '';
  const hours = place.opening_hours
    ? `<span class="popup-meta">⏱ ${escapeHtml(place.opening_hours)}</span>` : '';
  return `
    <div class="popup">
      <div class="popup-head">
        <span class="popup-num" style="background:${dc}">${number}</span>
        <strong class="popup-title">${escapeHtml(place.name)}</strong>
      </div>
      <div class="popup-row">
        <span class="popup-cat" style="background:${cat.bg};color:${cat.text}">
          ${cat.icon} ${escapeHtml(place.category)}
        </span>
        <span class="popup-meta">⏱ ${Math.round(place.duration_minutes)} min</span>
        ${hours}
      </div>
      ${place.address ? `<div class="popup-addr">📍 ${escapeHtml(place.address)}</div>` : ''}
      ${notes}
    </div>`;
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function MapController({ places, allPlaces, selectedPlace, onSelectPlace }) {
  const map = useMap();
  const layersRef = useRef([]);
  const markersByIdRef = useRef(new Map());
  const prevKeyRef = useRef('');

  // Render markers / lines / labels on every relevant change.
  useEffect(() => {
    layersRef.current.forEach(l => l.remove());
    layersRef.current = [];
    markersByIdRef.current.clear();

    if (!places || places.length === 0) return;
    const valid = places.filter(p => p.lat != null && p.lng != null);
    if (valid.length === 0) return;

    const visibleIds = new Set(valid.map(p => p.id));

    // Group visible places by day to draw per-day polylines.
    const byDay = new Map();
    valid.forEach(p => {
      if (!byDay.has(p.day)) byDay.set(p.day, []);
      byDay.get(p.day).push(p);
    });

    byDay.forEach((dayPlaces, day) => {
      dayPlaces.sort((a, b) => a.order - b.order);
      const color = dayColor(day);
      const latlngs = dayPlaces.map(p => [p.lat, p.lng]);

      // Halo + dashed main line.
      layersRef.current.push(
        L.polyline(latlngs, { color, weight: 7, opacity: 0.10 }).addTo(map)
      );
      layersRef.current.push(
        L.polyline(latlngs, { color, weight: 2.5, opacity: 0.75, dashArray: '6,5' }).addTo(map)
      );

      // Travel-time labels at segment midpoints.
      for (let i = 1; i < dayPlaces.length; i++) {
        const a = dayPlaces[i - 1], b = dayPlaces[i];
        if (b.travel_minutes_from_prev == null) continue;
        const mid = [(a.lat + b.lat) / 2, (a.lng + b.lng) / 2];
        const lbl = createTravelLabel({
          minutes: b.travel_minutes_from_prev,
          mode:    b.transport_from_prev || 'walk',
          color,
        });
        layersRef.current.push(L.marker(mid, { icon: lbl, interactive: false }).addTo(map));
      }
    });

    // Markers (drawn on top of polylines).
    valid.forEach((place, i) => {
      const isSelected = selectedPlace?.id === place.id;
      const isDimmed   = !!selectedPlace && !isSelected;
      const icon = createMarkerIcon(place, i + 1, isSelected, isDimmed);
      const marker = L.marker([place.lat, place.lng], { icon, riseOnHover: true })
        .addTo(map)
        .bindPopup(createPopupHtml(place, i + 1), { className: 'tm-popup', maxWidth: 280 })
        .on('click', () => onSelectPlace(isSelected ? null : place));
      layersRef.current.push(marker);
      markersByIdRef.current.set(place.id, marker);
    });

    // Auto-fit bounds when the *set* of visible places changes.
    const key = valid.map(p => p.id).join(',');
    if (key !== prevKeyRef.current) {
      const bounds = L.latLngBounds(valid.map(p => [p.lat, p.lng]));
      if (bounds.isValid()) map.fitBounds(bounds, { padding: [56, 56], maxZoom: 14 });
      prevKeyRef.current = key;
    }

    // Optional: when the trip *all-places* set changes (new trip loaded),
    // also reset the prev key so we re-fit.
    void allPlaces;
    void visibleIds;
  }, [places, allPlaces, selectedPlace, map, onSelectPlace]);

  // Pan + open popup whenever the selection changes.
  useEffect(() => {
    if (!selectedPlace?.lat) return;
    map.panTo([selectedPlace.lat, selectedPlace.lng], { animate: true, duration: 0.35 });
    const m = markersByIdRef.current.get(selectedPlace.id);
    if (m) m.openPopup();
  }, [selectedPlace, map]);

  return null;
}

export default function MapView({
  places, allPlaces, activeDay, selectedPlace, onSelectPlace,
}) {
  const isEmpty = !places || places.length === 0;

  return (
    <div className="map-wrapper">
      <MapContainer
        center={[20, 0]}
        zoom={2}
        style={{ height: '100%', width: '100%' }}
        zoomControl
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapController
          places={places}
          allPlaces={allPlaces}
          selectedPlace={selectedPlace}
          onSelectPlace={onSelectPlace}
        />
      </MapContainer>

      {!isEmpty && allPlaces?.length > 0 && (
        <DayLegend places={allPlaces} activeDay={activeDay} />
      )}

      {isEmpty && (
        <div className="map-empty">
          <div className="map-empty-card">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
              <line x1="9" y1="3" x2="9" y2="18" />
              <line x1="15" y1="6" x2="15" y2="21" />
            </svg>
            <h3>Nothing to show</h3>
            <p>No stops match the current filters. Try clearing them, or open a different trip.</p>
          </div>
        </div>
      )}
    </div>
  );
}

function DayLegend({ places, activeDay }) {
  const days = [...new Set(places.map(p => p.day))].sort((a, b) => a - b);
  if (days.length <= 1) return null;
  return (
    <div className="map-legend">
      {days.map(d => {
        const isActive = activeDay === String(d) || activeDay === 'all';
        return (
          <div key={d} className={`legend-item ${isActive ? '' : 'dimmed'}`}>
            <span className="legend-dot" style={{ background: dayColor(d) }} />
            Day {d}
          </div>
        );
      })}
    </div>
  );
}
