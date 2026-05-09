// Day route colors. Stays consistent across map polylines, list badges, and
// the day filter pills so the eye can match them at a glance.
export const DAY_COLORS = ['#2563EB', '#F97316', '#10B981', '#8B5CF6', '#EC4899'];

export function dayColor(day) {
  return DAY_COLORS[(day - 1) % DAY_COLORS.length];
}

// Category palette. `bg` / `text` are used by tag pills; `solid` by markers
// and any other accent.
export const CATEGORY_STYLES = {
  Landmark:      { bg: '#FEF3C7', text: '#92400E', solid: '#F59E0B', icon: '★' },
  Museum:        { bg: '#EDE9FE', text: '#5B21B6', solid: '#7C3AED', icon: '🏛' },
  Food:          { bg: '#FCE7F3', text: '#9D174D', solid: '#EC4899', icon: '🍽' },
  Park:          { bg: '#DCFCE7', text: '#166534', solid: '#22C55E', icon: '🌳' },
  Nature:        { bg: '#D1FAE5', text: '#065F46', solid: '#10B981', icon: '🌿' },
  Shopping:      { bg: '#DBEAFE', text: '#1E40AF', solid: '#3B82F6', icon: '🛍' },
  Entertainment: { bg: '#FFEDD5', text: '#9A3412', solid: '#F97316', icon: '🎭' },
  Neighborhood:  { bg: '#F1F5F9', text: '#475569', solid: '#64748B', icon: '🏘' },
};

export function categoryStyle(category) {
  return CATEGORY_STYLES[category] || CATEGORY_STYLES.Neighborhood;
}
