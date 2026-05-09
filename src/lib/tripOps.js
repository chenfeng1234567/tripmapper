/*
 * Pure functions that produce a new `places` array given the current one and
 * an edit. Keeping these pure makes them trivially testable and lets the UI
 * stay a thin presentation layer.
 */

function reindexDay(places, day) {
  const dayPlaces = places.filter(p => p.day === day).sort((a, b) => a.order - b.order);
  dayPlaces.forEach((p, i) => { p.order = i + 1; });
  return places;
}

export function updatePlace(places, id, patch) {
  const next = places.map(p => p.id === id ? { ...p, ...patch } : p);
  // If day changed, both the old and new day need re-indexing.
  if (patch.day != null) {
    const old = places.find(p => p.id === id);
    if (old && old.day !== patch.day) {
      reindexDay(next, old.day);
      reindexDay(next, patch.day);
    }
  }
  return [...next].sort((a, b) => (a.day - b.day) || (a.order - b.order));
}

export function deletePlace(places, id) {
  const removed = places.find(p => p.id === id);
  if (!removed) return places;
  const next = places.filter(p => p.id !== id);
  reindexDay(next, removed.day);
  return next;
}

export function addPlaceToDay(places, place, day) {
  const dayPlaces = places.filter(p => p.day === day);
  const order = dayPlaces.length + 1;
  const newPlace = { ...place, day, order };
  return [...places, newPlace].sort((a, b) => (a.day - b.day) || (a.order - b.order));
}

export function movePlaceWithinDay(places, id, direction) {
  const place = places.find(p => p.id === id);
  if (!place) return places;
  const dayPlaces = places.filter(p => p.day === place.day).sort((a, b) => a.order - b.order);
  const idx = dayPlaces.findIndex(p => p.id === id);
  const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
  if (swapIdx < 0 || swapIdx >= dayPlaces.length) return places;
  [dayPlaces[idx].order, dayPlaces[swapIdx].order] = [dayPlaces[swapIdx].order, dayPlaces[idx].order];
  return [...places].sort((a, b) => (a.day - b.day) || (a.order - b.order));
}
