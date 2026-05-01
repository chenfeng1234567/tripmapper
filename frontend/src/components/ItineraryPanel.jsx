import './ItineraryPanel.css';

const DAY_COLORS = ['#2563EB', '#F97316', '#10B981', '#8B5CF6', '#EC4899'];

const CAT_STYLES = {
  Landmark:      { bg: '#FEF3C7', text: '#92400E' },
  Museum:        { bg: '#EDE9FE', text: '#5B21B6' },
  Food:          { bg: '#FCE7F3', text: '#9D174D' },
  Nature:        { bg: '#D1FAE5', text: '#065F46' },
  Shopping:      { bg: '#DBEAFE', text: '#1E40AF' },
  Entertainment: { bg: '#FFEDD5', text: '#9A3412' },
  Neighborhood:  { bg: '#F1F5F9', text: '#475569' },
  Park:          { bg: '#DCFCE7', text: '#166534' },
};

const TRANSPORT_ICONS = {
  walk:    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="5" r="1"/><path d="M9 20l1.5-6L9 11l3-2 3 2-1.5 3L15 20"/><path d="M6 10l3-3M18 10l-3-3"/></svg>,
  transit: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/><path d="M8 6h8M8 10h8"/></svg>,
  car:     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v6a2 2 0 0 1-2 2h-2"/><circle cx="7.5" cy="17.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/></svg>,
};

function TravelConnector({ travelInfo }) {
  if (!travelInfo) return null;
  const icon = TRANSPORT_ICONS[travelInfo.mode] || TRANSPORT_ICONS.walk;
  return (
    <div className="travel-connector">
      <div className="connector-line" />
      <div className="connector-pill">
        <span className="connector-icon">{icon}</span>
        <span className="connector-text">~{travelInfo.minutes} min</span>
        <span className="connector-dist">{travelInfo.km} km</span>
      </div>
      <div className="connector-line" />
    </div>
  );
}

export default function ItineraryPanel({
  places, allPlaces, days, activeDay, onDayChange,
  sortMode, onSortChange, selectedPlace, onSelectPlace
}) {
  return (
    <div className="itinerary-panel">
      {/* Controls */}
      <div className="panel-controls">
        <div className="sort-controls">
          <span className="ctrl-label">Sort by</span>
          {[
            { v: 'ai',         l: 'AI Order' },
            { v: 'distance',   l: 'Route' },
            { v: 'popularity', l: 'Popular' },
          ].map(({ v, l }) => (
            <button
              key={v}
              className={`ctrl-btn ${sortMode === v ? 'active' : ''}`}
              onClick={() => onSortChange(v)}
            >
              {l}
            </button>
          ))}
        </div>

        {days.length > 1 && (
          <div className="day-tabs">
            <button
              className={`day-tab ${activeDay === 'all' ? 'active' : ''}`}
              onClick={() => onDayChange('all')}
            >All</button>
            {days.map(d => (
              <button
                key={d}
                className={`day-tab ${activeDay === String(d) ? 'active' : ''}`}
                style={activeDay === String(d) ? { '--dt': DAY_COLORS[(d - 1) % DAY_COLORS.length] } : {}}
                onClick={() => onDayChange(String(d))}
              >
                Day {d}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Place list */}
      <div className="places-list">
        {places.map((place, index) => {
          const cat = CAT_STYLES[place.category] || CAT_STYLES.Neighborhood;
          const dayColor = DAY_COLORS[(place.day - 1) % DAY_COLORS.length];
          const isSelected = selectedPlace?.name === place.name;

          return (
            <div key={`${place.name}-${index}`}>
              {/* Travel time connector (above this card) */}
              {index > 0 && place.travel_from_prev && (
                <TravelConnector travelInfo={place.travel_from_prev} />
              )}

              <div
                className={`place-card ${isSelected ? 'selected' : ''}`}
                onClick={() => onSelectPlace(isSelected ? null : place)}
              >
                {/* Number badge */}
                <div className="place-badge" style={{ background: dayColor }}>
                  {index + 1}
                </div>

                <div className="place-body">
                  <div className="place-top-row">
                    <h3 className="place-name">{place.name}</h3>
                    {days.length > 1 && activeDay === 'all' && (
                      <span className="day-dot" style={{ background: dayColor }}>D{place.day}</span>
                    )}
                  </div>

                  <div className="place-meta">
                    <span className="cat-tag" style={{ background: cat.bg, color: cat.text }}>
                      {place.category}
                    </span>
                    <span className="duration-tag">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                      </svg>
                      {place.estimated_duration}
                    </span>
                    <span className="pop-tag">
                      {'★'.repeat(Math.round(place.popularity / 2))}{'☆'.repeat(5 - Math.round(place.popularity / 2))}
                    </span>
                  </div>

                  {isSelected && (
                    <div className="place-expanded">
                      <p className="place-desc">{place.description}</p>
                      {place.tips && (
                        <div className="place-tip">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/>
                            <line x1="12" y1="16" x2="12.01" y2="16"/>
                          </svg>
                          {place.tips}
                        </div>
                      )}
                      <div className="place-details-row">
                        {place.opening_hours && (
                          <span className="detail-item">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                            </svg>
                            {place.opening_hours}
                          </span>
                        )}
                        {place.address && (
                          <span className="detail-item">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                            </svg>
                            {place.address}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Expand/collapse chevron */}
                <div className="place-chevron">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                    style={{ transform: isSelected ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
