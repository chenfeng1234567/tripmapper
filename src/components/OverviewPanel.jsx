import { dayColor } from '../lib/colors.js';
import './OverviewPanel.css';

/*
 * Compact summary at the top of the sidebar:
 *  - City + headline counts (days, stops, total hours)
 *  - One small bar per day showing relative time spent (visit + travel)
 */
export default function OverviewPanel({ city, places, days }) {
  const stats = days.map(day => {
    const dp = places.filter(p => p.day === day);
    const visit  = dp.reduce((s, p) => s + (p.duration_minutes || 0), 0);
    const travel = dp.reduce((s, p) => s + (p.travel_minutes_from_prev || 0), 0);
    return { day, count: dp.length, visit, travel, total: visit + travel };
  });

  const totalMin = stats.reduce((s, d) => s + d.total, 0);
  const totalHours = (totalMin / 60).toFixed(1);
  const maxDayMin = Math.max(...stats.map(d => d.total), 1);

  return (
    <div className="overview">
      <div className="overview-top">
        <h2 className="overview-city">{city}</h2>
        <div className="overview-meta">
          <span>{days.length} {days.length === 1 ? 'day' : 'days'}</span>
          <span className="dot" />
          <span>{places.length} stops</span>
          <span className="dot" />
          <span>~{totalHours}h total</span>
        </div>
      </div>

      {days.length > 1 && (
        <div className="day-bars">
          {stats.map(({ day, count, visit, travel, total }) => {
            const visitPct  = (visit  / maxDayMin) * 100;
            const travelPct = (travel / maxDayMin) * 100;
            return (
              <div key={day} className="day-bar">
                <div className="day-bar-head">
                  <span className="day-bar-label" style={{ color: dayColor(day) }}>
                    Day {day}
                  </span>
                  <span className="day-bar-stats">
                    {count} stops · ~{(total / 60).toFixed(1)}h
                  </span>
                </div>
                <div className="day-bar-track">
                  <div
                    className="day-bar-visit"
                    style={{ width: `${visitPct}%`, background: dayColor(day) }}
                    title={`${Math.round(visit)} min at stops`}
                  />
                  <div
                    className="day-bar-travel"
                    style={{
                      width: `${travelPct}%`,
                      background: `repeating-linear-gradient(45deg, ${dayColor(day)} 0 4px, ${dayColor(day)}55 4px 8px)`,
                    }}
                    title={`${Math.round(travel)} min in transit`}
                  />
                </div>
              </div>
            );
          })}
          <div className="day-legend-row">
            <span><span className="lg-swatch lg-solid" /> at stop</span>
            <span><span className="lg-swatch lg-hatched" /> travel</span>
          </div>
        </div>
      )}
    </div>
  );
}
