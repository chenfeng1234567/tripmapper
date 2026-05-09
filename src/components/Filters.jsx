import { dayColor, categoryStyle } from '../lib/colors.js';
import './Filters.css';

/*
 * Two stacked dynamic-query filters:
 *  - Day filter   (single-select; "All" or a specific day)
 *  - Category     (multi-toggle; clicking a chip toggles it on/off)
 *
 * Sort selector is included here too — it's a "select different measure"
 * control that belongs alongside the filters logically.
 */
export default function Filters({
  days, activeDay, onDayChange,
  categories, activeCategories, onToggleCategory, onClearCategories,
  sortMode, onSortChange,
  filteredCount, totalCount,
}) {
  return (
    <div className="filters">
      {/* Day filter */}
      {days.length > 1 && (
        <div className="filter-row">
          <span className="filter-label">Day</span>
          <div className="chip-row">
            <button
              className={`chip ${activeDay === 'all' ? 'on' : ''}`}
              onClick={() => onDayChange('all')}
            >All</button>
            {days.map(d => (
              <button
                key={d}
                className={`chip ${activeDay === String(d) ? 'on' : ''}`}
                style={activeDay === String(d) ? { '--c': dayColor(d) } : {}}
                onClick={() => onDayChange(String(d))}
              >
                <span className="chip-dot" style={{ background: dayColor(d) }} />
                Day {d}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Category multi-filter */}
      {categories.length > 1 && (
        <div className="filter-row">
          <span className="filter-label">
            Category
            {activeCategories.size > 0 && (
              <button className="filter-clear" onClick={onClearCategories}>clear</button>
            )}
          </span>
          <div className="chip-row">
            {categories.map(cat => {
              const sty = categoryStyle(cat);
              const on = activeCategories.size === 0 || activeCategories.has(cat);
              return (
                <button
                  key={cat}
                  className={`cat-chip ${on ? '' : 'off'}`}
                  style={{ '--cbg': sty.bg, '--ctxt': sty.text }}
                  onClick={() => onToggleCategory(cat)}
                  title={`Toggle ${cat}`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Sort + count */}
      <div className="filter-footer">
        <div className="sort-group">
          <span className="filter-label">Sort</span>
          {[
            { v: 'plan',       l: 'Plan order' },
            { v: 'route',      l: 'Nearest route' },
            { v: 'popularity', l: 'Popularity' },
          ].map(({ v, l }) => (
            <button
              key={v}
              className={`sort-btn ${sortMode === v ? 'on' : ''}`}
              onClick={() => onSortChange(v)}
            >{l}</button>
          ))}
        </div>
        <span className="filter-count">
          {filteredCount === totalCount
            ? `${totalCount} stops`
            : `${filteredCount} of ${totalCount} stops`}
        </span>
      </div>
    </div>
  );
}
