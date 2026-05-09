import { dayColor, categoryStyle } from '../lib/colors.js';
import './ItineraryPanel.css';

const TRANSPORT_ICONS = {
  walk: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="5" r="1" />
      <path d="M9 20l1.5-6L9 11l3-2 3 2-1.5 3L15 20" />
      <path d="M6 10l3-3M18 10l-3-3" />
    </svg>
  ),
  transit: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="5" y="2" width="14" height="20" rx="2" />
      <line x1="12" y1="18" x2="12.01" y2="18" />
      <path d="M8 6h8M8 10h8" />
    </svg>
  ),
  car: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v6a2 2 0 0 1-2 2h-2" />
      <circle cx="7.5" cy="17.5" r="2.5" />
      <circle cx="17.5" cy="17.5" r="2.5" />
    </svg>
  ),
};

function TravelConnector({ mode, minutes }) {
  if (!minutes && minutes !== 0) return null;
  const icon = TRANSPORT_ICONS[mode] || TRANSPORT_ICONS.walk;
  return (
    <div className="travel-connector">
      <div className="connector-line" />
      <div className="connector-pill">
        <span className="connector-icon">{icon}</span>
        <span className="connector-text">~{minutes} min</span>
        <span className="connector-mode">{mode || 'walk'}</span>
      </div>
      <div className="connector-line" />
    </div>
  );
}

function PlaceCard({
  place, index, isSelected, showDayBadge,
  onSelect, onEdit, onDelete, onMove, isFirstInDay, isLastInDay,
}) {
  const cat = categoryStyle(place.category);
  const dc  = dayColor(place.day);

  return (
    <div
      className={`place-card ${isSelected ? 'selected' : ''}`}
      onClick={() => onSelect(isSelected ? null : place)}
    >
      <div className="place-badge" style={{ background: dc }}>
        {index}
      </div>

      <div className="place-body">
        <div className="place-top-row">
          <h3 className="place-name">{place.name}</h3>
          {showDayBadge && (
            <span className="day-pill" style={{ background: dc }}>D{place.day}</span>
          )}
        </div>

        <div className="place-meta">
          <span className="cat-tag" style={{ background: cat.bg, color: cat.text }}>
            {place.category}
          </span>
          <span className="meta-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
            </svg>
            {Math.round(place.duration_minutes)} min
          </span>
          <span className="meta-item pop">
            {'★'.repeat(Math.round(place.popularity / 2))}
            <span className="pop-empty">
              {'★'.repeat(5 - Math.round(place.popularity / 2))}
            </span>
          </span>
        </div>

        {isSelected && (
          <div className="place-expanded" onClick={(e) => e.stopPropagation()}>
            {place.address && (
              <div className="detail-line">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                <span>{place.address}</span>
              </div>
            )}
            {place.opening_hours && (
              <div className="detail-line">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                </svg>
                <span>{place.opening_hours}</span>
              </div>
            )}
            {place.notes && (
              <div className="notes-box">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
                <span>{place.notes}</span>
              </div>
            )}

            <div className="place-actions">
              <div className="reorder-group">
                <button
                  className="action-btn"
                  disabled={isFirstInDay}
                  onClick={() => onMove(place.id, 'up')}
                  title="Move up in day"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="18 15 12 9 6 15" />
                  </svg>
                </button>
                <button
                  className="action-btn"
                  disabled={isLastInDay}
                  onClick={() => onMove(place.id, 'down')}
                  title="Move down in day"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>
              </div>
              <button className="action-btn primary" onClick={() => onEdit(place)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 20h9M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4z" />
                </svg>
                Edit
              </button>
              <button className="action-btn danger" onClick={() => onDelete(place.id)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
                Delete
              </button>
            </div>
          </div>
        )}
      </div>

      <div className={`place-chevron ${isSelected ? 'open' : ''}`}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>
    </div>
  );
}

export default function ItineraryPanel({
  places, allPlaces, days, activeDay,
  selectedPlace, onSelectPlace,
  onEditPlace, onDeletePlace, onMovePlace,
}) {
  if (places.length === 0) {
    return (
      <div className="itinerary-empty">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
        <p>No stops match the current filters.</p>
      </div>
    );
  }

  // Day boundaries — used both to disable reorder buttons at the edges and to
  // insert day-headers when "all days" view is active.
  const positionByDay = new Map();
  allPlaces.forEach(p => {
    const list = positionByDay.get(p.day) || [];
    list.push(p.id);
    positionByDay.set(p.day, list);
  });

  return (
    <div className="itinerary">
      {places.map((place, idx) => {
        const dayList = positionByDay.get(place.day) || [];
        const dayIdx = dayList.indexOf(place.id);
        const isFirst = dayIdx === 0;
        const isLast  = dayIdx === dayList.length - 1;
        const showTravel = idx > 0 && places[idx - 1].day === place.day;

        // When viewing all days, insert a day header before the first card of each day.
        const prevDay = idx > 0 ? places[idx - 1].day : null;
        const newDay = activeDay === 'all' && place.day !== prevDay && days.length > 1;

        return (
          <div key={place.id}>
            {newDay && (
              <div className="day-divider" style={{ '--c': dayColor(place.day) }}>
                <span className="day-divider-pill">Day {place.day}</span>
              </div>
            )}
            {showTravel && place.travel_minutes_from_prev != null && (
              <TravelConnector
                mode={place.transport_from_prev}
                minutes={place.travel_minutes_from_prev}
              />
            )}
            <PlaceCard
              place={place}
              index={idx + 1}
              isSelected={selectedPlace?.id === place.id}
              showDayBadge={activeDay === 'all' && days.length > 1}
              onSelect={onSelectPlace}
              onEdit={onEditPlace}
              onDelete={onDeletePlace}
              onMove={onMovePlace}
              isFirstInDay={isFirst}
              isLastInDay={isLast}
            />
          </div>
        );
      })}
    </div>
  );
}
