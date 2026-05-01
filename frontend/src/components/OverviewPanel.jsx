import './OverviewPanel.css';

const DAY_COLORS = ['#2563EB', '#F97316', '#10B981', '#8B5CF6', '#EC4899'];

function parseDuration(str) {
  if (!str) return 0;
  const m = str.match(/(\d+)/g);
  if (!m) return 60;
  const nums = m.map(Number);
  return nums.length >= 2 ? Math.round((nums[0] + nums[1]) / 2) * 60 : nums[0] * 60;
}

export default function OverviewPanel({ city, overview, highlights, places, days }) {
  // Compute per-day stats
  const dayStats = days.map(day => {
    const dayPlaces = places.filter(p => p.day === day);
    const totalVisitMin = dayPlaces.reduce((sum, p) =>
      sum + (p.estimated_duration_minutes || parseDuration(p.estimated_duration) || 90), 0);
    const totalTravelMin = dayPlaces.reduce((sum, p) =>
      sum + (p.travel_from_prev?.minutes || 0), 0);
    const totalMin = totalVisitMin + totalTravelMin;
    return {
      day,
      count: dayPlaces.length,
      hours: (totalMin / 60).toFixed(1),
      color: DAY_COLORS[(day - 1) % DAY_COLORS.length]
    };
  });

  const totalPlaces = places.length;
  const totalHours = dayStats.reduce((s, d) => s + parseFloat(d.hours), 0).toFixed(1);

  return (
    <div className="overview-panel">
      {/* City + stats */}
      <div className="overview-header">
        <div>
          <h2 className="overview-city">{city}</h2>
          <p className="overview-stats">
            {days.length} day{days.length > 1 ? 's' : ''} · {totalPlaces} places · ~{totalHours}h total
          </p>
        </div>
      </div>

      {/* AI overview text */}
      {overview && (
        <p className="overview-text">{overview}</p>
      )}

      {/* Highlights */}
      {highlights?.length > 0 && (
        <div className="highlights-row">
          {highlights.map((h, i) => (
            <span key={i} className="highlight-pill">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
              {h}
            </span>
          ))}
        </div>
      )}

      {/* Day summary pills */}
      {days.length > 1 && (
        <div className="day-stats-row">
          {dayStats.map(({ day, count, hours, color }) => (
            <div key={day} className="day-stat-card" style={{ '--dc': color }}>
              <div className="day-stat-label">Day {day}</div>
              <div className="day-stat-num">{count} stops</div>
              <div className="day-stat-time">~{hours}h</div>
              <div className="day-stat-bar" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
