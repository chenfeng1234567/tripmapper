import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import './MapView.css';

const DAY_COLORS = ['#2563EB', '#F97316', '#10B981', '#8B5CF6', '#EC4899'];

const CAT_COLORS = {
  Landmark:      '#F59E0B',
  Museum:        '#7C3AED',
  Food:          '#EC4899',
  Nature:        '#10B981',
  Shopping:      '#3B82F6',
  Entertainment: '#F97316',
  Neighborhood:  '#64748B',
  Park:          '#22C55E',
};

function getDayColor(day) {
  return DAY_COLORS[(day - 1) % DAY_COLORS.length];
}

function getCatColor(category) {
  return CAT_COLORS[category] || '#64748B';
}

// Bearing between two lat/lng points in degrees
function bearing(lat1, lng1, lat2, lng2) {
  const dL = (lng2 - lng1) * Math.PI / 180;
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const y = Math.sin(dL) * Math.cos(φ2);
  const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(dL);
  return (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
}

function createNumberedIcon(number, color, isSelected) {
  const s = isSelected ? 34 : 28;
  return L.divIcon({
    className: '',
    html: `<div style="
      width:${s}px; height:${s}px;
      background:${color};
      border:2.5px solid white;
      border-radius:50%;
      display:flex; align-items:center; justify-content:center;
      color:white; font-size:${isSelected ? 13 : 11}px; font-weight:700;
      font-family:'Outfit',sans-serif;
      box-shadow: 0 2px ${isSelected ? 10 : 6}px rgba(0,0,0,${isSelected ? 0.35 : 0.2});
      transform:${isSelected ? 'scale(1.1)' : 'scale(1)'};
      transition:transform 0.15s;
      cursor:pointer;
    ">${number}</div>`,
    iconSize: [s, s],
    iconAnchor: [s / 2, s / 2],
    popupAnchor: [0, -(s / 2 + 4)],
  });
}

function createArrowLabel(seg, color) {
  const brng = bearing(seg.lat1, seg.lng1, seg.lat2, seg.lng2);
  const modeIcon = seg.mode === 'walk' ? '🚶' : seg.mode === 'transit' ? '🚌' : '🚗';
  return L.divIcon({
    className: '',
    html: `<div style="
      display:flex; flex-direction:column; align-items:center; gap:2px;
      pointer-events:none;
    ">
      <div style="
        background:white;
        border:1px solid ${color}40;
        border-radius:10px;
        padding:3px 8px;
        font-size:10px;
        font-weight:600;
        color:${color};
        white-space:nowrap;
        box-shadow:0 1px 4px rgba(0,0,0,0.12);
        display:flex;align-items:center;gap:4px;
      ">
        <span style="transform:rotate(${brng}deg);display:inline-block;font-size:9px;">➤</span>
        ${seg.minutes}min
      </div>
    </div>`,
    iconSize: [80, 24],
    iconAnchor: [40, 12],
  });
}

function createPopupHtml(place, number, dayColor) {
  const catColor = getCatColor(place.category);
  return `
    <div style="font-family:'Work Sans',sans-serif;min-width:200px;max-width:250px;">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
        <div style="
          width:26px;height:26px;background:${dayColor};
          border-radius:50%;color:white;
          display:flex;align-items:center;justify-content:center;
          font-family:'Outfit',sans-serif;font-size:12px;font-weight:700;flex-shrink:0;
        ">${number}</div>
        <strong style="font-size:14px;color:#1E293B;line-height:1.2;font-family:'Outfit',sans-serif;">${place.name}</strong>
      </div>
      <div style="margin-bottom:7px;display:flex;align-items:center;gap:6px;flex-wrap:wrap;">
        <span style="
          background:${catColor}20;color:${catColor};
          font-size:11px;font-weight:600;padding:2px 8px;border-radius:10px;
        ">${place.category}</span>
        <span style="font-size:11px;color:#94A3B8;">⏱ ${place.estimated_duration}</span>
      </div>
      <p style="font-size:12px;color:#475569;line-height:1.5;margin:0 0 6px;">
        ${place.description.slice(0, 130)}${place.description.length > 130 ? '…' : ''}
      </p>
      ${place.tips ? `<div style="
        background:#FFFBEB;border:1px solid #FDE68A;border-radius:6px;
        padding:5px 8px;font-size:11px;color:#92400E;line-height:1.4;
      ">💡 ${place.tips}</div>` : ''}
    </div>`;
}

function MapController({ places, selectedPlace }) {
  const map = useMap();
  const markersRef  = useRef([]);
  const linesRef    = useRef([]);
  const labelsRef   = useRef([]);
  const prevKeyRef  = useRef('');

  useEffect(() => {
    // Clear
    [...markersRef.current, ...linesRef.current, ...labelsRef.current].forEach(l => l.remove());
    markersRef.current = [];
    linesRef.current   = [];
    labelsRef.current  = [];

    if (!places || places.length === 0) return;
    const valid = places.filter(p => p.lat != null && p.lng != null);
    if (valid.length === 0) return;

    // Group by day to draw per-day colored routes
    const byDay = {};
    valid.forEach(p => {
      if (!byDay[p.day]) byDay[p.day] = [];
      byDay[p.day].push(p);
    });

    // Draw route polylines per day
    Object.entries(byDay).forEach(([day, dayPlaces]) => {
      const color = getDayColor(parseInt(day));
      const latlngs = dayPlaces.map(p => [p.lat, p.lng]);

      // Shadow polyline (wider, lighter)
      linesRef.current.push(
        L.polyline(latlngs, { color, weight: 6, opacity: 0.12 }).addTo(map)
      );
      // Main route line
      linesRef.current.push(
        L.polyline(latlngs, { color, weight: 2.5, opacity: 0.65, dashArray: '8,5' }).addTo(map)
      );

      // Segment mid-point labels with travel time
      dayPlaces.forEach((place, i) => {
        if (i === 0 || !place.travel_from_prev) return;
        const prev = dayPlaces[i - 1];
        const midLat = (prev.lat + place.lat) / 2;
        const midLng = (prev.lng + place.lng) / 2;
        const label = createArrowLabel({
          lat1: prev.lat, lng1: prev.lng,
          lat2: place.lat, lng2: place.lng,
          minutes: place.travel_from_prev.minutes,
          mode: place.travel_from_prev.mode,
        }, color);
        labelsRef.current.push(L.marker([midLat, midLng], { icon: label, interactive: false }).addTo(map));
      });
    });

    // Place markers (on top)
    valid.forEach((place, index) => {
      const dayColor   = getDayColor(place.day);
      const isSelected = selectedPlace?.name === place.name;
      const icon       = createNumberedIcon(index + 1, dayColor, isSelected);

      const marker = L.marker([place.lat, place.lng], { icon })
        .addTo(map)
        .bindPopup(createPopupHtml(place, index + 1, dayColor), {
          maxWidth: 270,
          className: 'trip-popup',
        });

      markersRef.current.push(marker);
    });

    // Auto-fit bounds only when place list changes
    const key = valid.map(p => p.name).join(',');
    if (key !== prevKeyRef.current) {
      const bounds = L.latLngBounds(valid.map(p => [p.lat, p.lng]));
      map.fitBounds(bounds, { padding: [48, 48], maxZoom: 14 });
      prevKeyRef.current = key;
    }
  }, [places, selectedPlace, map]);

  // Pan + open popup on selection
  useEffect(() => {
    if (!selectedPlace?.lat) return;
    map.panTo([selectedPlace.lat, selectedPlace.lng], { animate: true, duration: 0.4 });
    const places_valid = (places || []).filter(p => p.lat != null);
    const idx = places_valid.findIndex(p => p.name === selectedPlace.name);
    if (idx >= 0 && markersRef.current[idx]) {
      markersRef.current[idx].openPopup();
    }
  }, [selectedPlace, map, places]);

  return null;
}

export default function MapView({ places, allPlaces, activeDay, selectedPlace, onSelectPlace }) {
  const isEmpty = !places || places.length === 0;

  return (
    <div className="map-wrapper">
      <MapContainer
        center={[20, 0]}
        zoom={2}
        style={{ height: '100%', width: '100%' }}
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapController
          places={places}
          selectedPlace={selectedPlace}
          onSelectPlace={onSelectPlace}
        />
      </MapContainer>

      {/* Day legend */}
      {!isEmpty && allPlaces?.length > 0 && (
        <DayLegend places={allPlaces} activeDay={activeDay} />
      )}

      {isEmpty && (
        <div className="map-empty">
          <div className="map-empty-card">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/>
              <line x1="9" y1="3" x2="9" y2="18"/>
              <line x1="15" y1="6" x2="15" y2="21"/>
            </svg>
            <h3>Your route appears here</h3>
            <p>Enter a destination and generate your itinerary to see the map</p>
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
        const color = getDayColor(d);
        const isActive = activeDay === String(d) || activeDay === 'all';
        return (
          <div key={d} className={`legend-item ${isActive ? '' : 'dimmed'}`}>
            <div className="legend-dot" style={{ background: color }} />
            <span>Day {d}</span>
          </div>
        );
      })}
    </div>
  );
}
