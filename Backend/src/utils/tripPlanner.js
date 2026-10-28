// Builds a day-wise multi-stop itinerary (any type of trip) with Google Gemini.
const { generate } = require("./geminiClient");

const buildPrompt = ({ origin, destination, purpose, startDate, days, travellers, budgetLevel, preferences }) => `
You are an expert Indian travel planner. You plan any kind of trip: pilgrimage, family holiday, adventure and trekking, heritage and culture, nature and wildlife, honeymoon, friends' trips and more.
Plan a ${days}-day trip for ${travellers} people travelling from ${origin} to ${destination}.
Purpose of the trip: ${purpose}. Start date: ${startDate}. Budget level: ${budgetLevel}.

Rules:
- Cover ${destination} well, and also add other well-known places that match the purpose and lie ON THE WAY or NEARBY, so the group sees more in the same journey.
- Choose places that suit the purpose (for example temples and ghats for a pilgrimage, viewpoints and trails for trekking, forts and museums for heritage, parks and lakes for nature).
- Day 1 starts at or near ${origin} or on the way to ${destination}. Keep the order of stops geographically sensible (no zig-zag). Put places on the same day only if they are close to each other.
- About 2 stops per day (2 to 3 on most days): between ${Math.max(days, days * 2 - 1)} and ${Math.min(days * 2 + 2, 20)} stops in total. At least half of the stops must be in ${destination} itself and be its best-known places.
- Use only real, well-known, named places. Never add "travel day", "rest", "arrival", "departure" or similar entries as stops: travelling between places is not a stop.
- "day" is a whole number from 1 to ${days}.
- "lat" and "lng" are decimal degrees (approximate is fine).
- "description" is 1 or 2 simple sentences (why visit, what to do, rough time needed).
${preferences ? `- The travellers' special wishes (follow them if sensible): ${preferences}\n` : ""}
Return ONLY JSON in exactly this shape:
{"title": string, "summary": string, "stops": [{"day": number, "name": string, "place": string, "description": string, "lat": number, "lng": number}]}
`;

// Keeps only safe, valid stops from the AI answer.
const sanitizeStops = (rawStops, days) => {
  if (!Array.isArray(rawStops)) return [];
  const text = (v, max) => String(v ?? "").trim().slice(0, max);
  return rawStops
    .map((s) => ({
      day: Math.min(days, Math.max(1, Math.round(Number(s?.day)) || 1)),
      name: text(s?.name, 120),
      place: text(s?.place, 120),
      description: text(s?.description, 500),
      lat: Number(s?.lat),
      lng: Number(s?.lng),
    }))
    .filter((s) => s.name && Number.isFinite(s.lat) && Number.isFinite(s.lng) &&
      s.lat >= -90 && s.lat <= 90 && s.lng >= -180 && s.lng <= 180)
    .slice(0, 30)
    .sort((a, b) => a.day - b.day)
    .map(({ lat, lng, ...rest }) => ({ ...rest, location: { type: "Point", coordinates: [lng, lat] } }));
};

const parseJson = (text) => {
  const cleaned = String(text || "").replace(/^```json\s*/i, "").replace(/```\s*$/i, "").trim();
  return JSON.parse(cleaned);
};

const generateItinerary = async (params) => {
  const response = await generate({
    contents: buildPrompt(params),
    config: { responseMimeType: "application/json" },
  });
  const data = parseJson(response.text);
  return {
    title: String(data.title || `${params.destination} trip`).trim().slice(0, 150),
    summary: String(data.summary || "").trim().slice(0, 600),
    stops: sanitizeStops(data.stops, params.days),
  };
};

module.exports = { generateItinerary, sanitizeStops, buildPrompt };
