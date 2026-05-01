import { useState } from 'react';
import SearchForm from './components/SearchForm.jsx';
import MapView from './components/MapView.jsx';
import ItineraryPanel from './components/ItineraryPanel.jsx';
import OverviewPanel from './components/OverviewPanel.jsx';
import ChatPanel from './components/ChatPanel.jsx';
import './App.css';

function greedySortByDistance(places) {
  if (places.length <= 1) return places;
  const remaining = [...places];
  const sorted = [remaining.shift()];
  while (remaining.length > 0) {
    const last = sorted[sorted.length - 1];
    let nearestIdx = 0, nearestDist = Infinity;
    remaining.forEach((p, i) => {
      const d = Math.hypot(p.lat - last.lat, p.lng - last.lng);
      if (d < nearestDist) { nearestDist = d; nearestIdx = i; }
    });
    sorted.push(remaining.splice(nearestIdx, 1)[0]);
  }
  return sorted;
}

export default function App() {
  const [itinerary, setItinerary]     = useState(null);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState(null);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [sortMode, setSortMode]       = useState('ai');
  const [activeDay, setActiveDay]     = useState('all');
  const [chatHistory, setChatHistory] = useState([]);
  const [searchCollapsed, setSearchCollapsed] = useState(false);

  const handleGenerate = async (formData) => {
    setLoading(true);
    setError(null);
    setItinerary(null);
    setSelectedPlace(null);
    setChatHistory([]);

    try {
      const res = await fetch('/api/itinerary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to generate itinerary');
      }
      const data = await res.json();
      setItinerary(data);
      setSortMode('ai');
      setActiveDay('all');
      setSearchCollapsed(true);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChat = async (message) => {
    if (!itinerary) return;

    const userMsg = { role: 'user', content: message };
    const history = [...chatHistory, userMsg];
    setChatHistory(history);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, history: chatHistory, currentItinerary: itinerary })
      });
      if (!res.ok) throw new Error('Chat request failed');
      const data = await res.json();

      if (data.type === 'update') {
        setItinerary(data.itinerary);
        setSelectedPlace(null);
        setSortMode('ai');
        setChatHistory([...history, { role: 'assistant', content: data.message }]);
      } else {
        setChatHistory([...history, { role: 'assistant', content: data.text }]);
      }
    } catch (e) {
      setChatHistory([...history, { role: 'assistant', content: `Sorry, something went wrong: ${e.message}` }]);
    }
  };

  const getSortedPlaces = () => {
    if (!itinerary) return [];
    let places = [...itinerary.places];
    if (activeDay !== 'all') places = places.filter(p => p.day === parseInt(activeDay));
    if (sortMode === 'popularity') return [...places].sort((a, b) => b.popularity - a.popularity);
    if (sortMode === 'distance')   return greedySortByDistance(places);
    return places;
  };

  const sortedPlaces = getSortedPlaces();
  const days = itinerary
    ? [...new Set(itinerary.places.map(p => p.day))].sort((a, b) => a - b)
    : [];

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-brand">
          <svg className="header-logo" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="10" r="3"/>
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
          </svg>
          <h1>TripMapper</h1>
        </div>
        <span className="header-tagline">AI-powered trip planning</span>
      </header>

      <div className="app-body">
        <aside className="sidebar">
          {/* Search */}
          <div className={`sidebar-search ${searchCollapsed ? 'collapsed' : ''}`}>
            {searchCollapsed ? (
              <button
                className="search-reopen-btn"
                onClick={() => setSearchCollapsed(false)}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                </svg>
                Plan a new trip
              </button>
            ) : (
              <SearchForm
                onSubmit={handleGenerate}
                loading={loading}
                hasItinerary={!!itinerary}
                onCollapse={() => setSearchCollapsed(true)}
              />
            )}
          </div>

          {error && (
            <div className="error-banner">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {error}
            </div>
          )}

          {loading && <LoadingState />}

          {itinerary && !loading && (
            <div className="sidebar-content">
              <OverviewPanel
                city={itinerary.city}
                overview={itinerary.overview}
                highlights={itinerary.highlights}
                places={itinerary.places}
                days={days}
              />
              <ItineraryPanel
                places={sortedPlaces}
                allPlaces={itinerary.places}
                days={days}
                activeDay={activeDay}
                onDayChange={setActiveDay}
                sortMode={sortMode}
                onSortChange={setSortMode}
                selectedPlace={selectedPlace}
                onSelectPlace={setSelectedPlace}
              />
            </div>
          )}

          {/* Chat is always shown when itinerary exists */}
          {itinerary && !loading && (
            <ChatPanel
              history={chatHistory}
              onSend={handleChat}
              disabled={false}
            />
          )}
        </aside>

        <main className="map-section">
          <MapView
            places={sortedPlaces}
            allPlaces={itinerary?.places || []}
            activeDay={activeDay}
            selectedPlace={selectedPlace}
            onSelectPlace={setSelectedPlace}
          />
        </main>
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="loading-state">
      <div className="loading-visual">
        <div className="loading-spinner" />
        <div className="loading-dots">
          <span />
          <span />
          <span />
        </div>
      </div>
      <p className="loading-title">Planning your trip...</p>
      <p className="loading-sub">Generating itinerary & locating each place on the map</p>
      <div className="loading-steps">
        <div className="loading-step done">Generating with AI</div>
        <div className="loading-step active">Geocoding locations</div>
        <div className="loading-step">Building your map</div>
      </div>
    </div>
  );
}
