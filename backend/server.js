import express from 'express';
import cors from 'cors';
import Anthropic from '@anthropic-ai/sdk';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ── Geocoding ────────────────────────────────────────────────────────────────

async function geocode(placeName, city) {
  const query = `${placeName}, ${city}`;
  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`;
    const res = await fetch(url, {
      headers: { 'User-Agent': 'TripMapper/1.0 (travel-planner-app)' }
    });
    const data = await res.json();
    if (data.length > 0) {
      return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
    }
  } catch (e) {
    console.error(`Geocode failed for "${placeName}":`, e.message);
  }
  return null;
}

// Geocode with fallback; returns coords or null
async function geocodeWithFallback(place, city) {
  let coords = await geocode(place.name, city);
  if (!coords && place.address) {
    coords = await geocode(place.address, city);
  }
  return coords;
}

// Geocode places sequentially (Nominatim: 1 req/sec)
// Only geocodes places that don't already have lat/lng
async function geocodePlaces(places, city) {
  const result = [];
  for (const place of places) {
    if (place.lat != null && place.lng != null) {
      result.push(place); // already has coords
      continue;
    }
    const coords = await geocodeWithFallback(place, city);
    result.push(coords ? { ...place, ...coords } : null);
    await new Promise(r => setTimeout(r, 1050)); // respect rate limit
  }
  return result.filter(Boolean);
}

// ── Distance & travel time ────────────────────────────────────────────────────

function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2
    + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180)
    * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function estimateTravelTime(km) {
  if (km <= 0.3) return { minutes: 5, mode: 'walk' };
  if (km <= 1.5) return { minutes: Math.round(km / 4 * 60), mode: 'walk' };
  if (km <= 6)   return { minutes: Math.round(km / 20 * 60), mode: 'transit' };
  return           { minutes: Math.round(km / 35 * 60), mode: 'car' };
}

function addTravelTimes(places) {
  return places.map((place, i) => {
    if (i === 0) return { ...place, travel_from_prev: null };
    const prev = places[i - 1];
    const km = haversineKm(prev.lat, prev.lng, place.lat, place.lng);
    return { ...place, travel_from_prev: { ...estimateTravelTime(km), km: +km.toFixed(2) } };
  });
}

// ── POST /api/itinerary ───────────────────────────────────────────────────────

app.post('/api/itinerary', async (req, res) => {
  const { destination, days, preferences } = req.body;
  if (!destination) return res.status(400).json({ error: 'destination is required' });

  const numDays = parseInt(days) || 1;
  const prefs = preferences || 'general sightseeing, mix of popular and hidden gems';

  const prompt = `You are an expert travel planner. Generate a ${numDays}-day itinerary for ${destination}.
User preferences: ${prefs}

Return ONLY valid JSON (no markdown) with this exact structure:
{
  "city": "${destination}",
  "overview": "3-4 sentence summary of what this itinerary covers and the experience it offers",
  "highlights": ["top highlight 1", "top highlight 2", "top highlight 3"],
  "places": [
    {
      "name": "exact searchable place name",
      "description": "2-3 sentences about why to visit and what to expect",
      "category": "one of: Landmark, Museum, Food, Nature, Shopping, Entertainment, Neighborhood, Park",
      "address": "full street address or neighborhood",
      "estimated_duration": "e.g. 1-2 hours",
      "estimated_duration_minutes": 90,
      "popularity": 8,
      "day": 1,
      "opening_hours": "e.g. 9am-5pm or All day or Varies",
      "tips": "one practical tip for visiting"
    }
  ]
}

Rules:
- Generate 4-5 places per day
- Place names must be exact and searchable
- estimated_duration_minutes is a number (e.g. 90 for 1.5 hours)
- Distribute places in a logical geographic order per day to minimize travel
- Include a mix of categories`;

  try {
    const message = await anthropic.messages.create({
      model: 'claude-opus-4-6',
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt }]
    });

    const text = message.content[0].text;
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON in LLM response');

    const itinerary = JSON.parse(jsonMatch[0]);
    const geocoded = await geocodePlaces(itinerary.places, itinerary.city);
    const withTravelTimes = addTravelTimes(geocoded);

    res.json({
      city: itinerary.city,
      overview: itinerary.overview,
      highlights: itinerary.highlights || [],
      places: withTravelTimes
    });
  } catch (err) {
    console.error('Itinerary error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/chat ────────────────────────────────────────────────────────────

app.post('/api/chat', async (req, res) => {
  const { message, history = [], currentItinerary } = req.body;
  if (!message || !currentItinerary) {
    return res.status(400).json({ error: 'message and currentItinerary required' });
  }

  const placesContext = currentItinerary.places.map((p, i) =>
    `${i + 1}. [Day ${p.day}] ${p.name} (${p.category}) — lat:${p.lat}, lng:${p.lng}`
  ).join('\n');

  const historyStr = history.map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`).join('\n');

  const prompt = `You are a helpful travel assistant for a trip to ${currentItinerary.city}.

CURRENT ITINERARY:
${placesContext}

${history.length > 0 ? `CONVERSATION SO FAR:\n${historyStr}\n` : ''}
USER: ${message}

INSTRUCTIONS — respond with ONLY valid JSON (no markdown, no extra text):

If the user asks a question or wants general advice:
{"type":"answer","text":"your detailed helpful answer"}

If the user wants to ADD, REMOVE, REPLACE, or REORDER places:
{
  "type":"update",
  "message":"brief friendly explanation of what changed",
  "overview":"updated 3-4 sentence overview",
  "places":[
    {
      "name":"...",
      "description":"...",
      "category":"Landmark|Museum|Food|Nature|Shopping|Entertainment|Neighborhood|Park",
      "address":"...",
      "estimated_duration":"...",
      "estimated_duration_minutes": 90,
      "popularity": 8,
      "day": 1,
      "opening_hours":"...",
      "tips":"...",
      "lat": <copy from above if UNCHANGED, null if NEW>,
      "lng": <copy from above if UNCHANGED, null if NEW>
    }
  ]
}

IMPORTANT: For UNCHANGED places, you MUST copy their exact lat/lng values from the context above.
Only set lat/lng to null for genuinely NEW places not in the current list.`;

  try {
    const aiMessage = await anthropic.messages.create({
      model: 'claude-opus-4-6',
      max_tokens: 3000,
      messages: [{ role: 'user', content: prompt }]
    });

    const text = aiMessage.content[0].text;
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON in response');

    const parsed = JSON.parse(jsonMatch[0]);

    if (parsed.type === 'update') {
      // Only geocode new places (those with null lat/lng)
      const geocoded = await geocodePlaces(parsed.places, currentItinerary.city);
      const withTravelTimes = addTravelTimes(geocoded);

      return res.json({
        type: 'update',
        message: parsed.message,
        itinerary: {
          city: currentItinerary.city,
          overview: parsed.overview || currentItinerary.overview,
          highlights: currentItinerary.highlights,
          places: withTravelTimes
        }
      });
    }

    // type === 'answer'
    res.json({ type: 'answer', text: parsed.text });
  } catch (err) {
    console.error('Chat error:', err);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`TripMapper backend → http://localhost:${PORT}`));
