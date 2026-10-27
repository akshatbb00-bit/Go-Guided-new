import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect } from "react";

const numberIcon = (n) =>
  L.divIcon({
    className: "",
    html: `<div style="background:#15803d;color:#fff;width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.4)">${n}</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });

function FitBounds({ points }) {
  const map = useMap();
  useEffect(() => {
    if (points.length === 1) map.setView(points[0], 10);
    else if (points.length > 1) map.fitBounds(points, { padding: [30, 30] });
  }, [points, map]);
  return null;
}

// stops: [{ name, place, day, location: { coordinates: [lng, lat] } }]
export default function TripMap({ stops = [] }) {
  const points = stops.map((s) => [s.location.coordinates[1], s.location.coordinates[0]]);
  if (!points.length) return null;
  return (
    <div className="w-full h-[320px] md:h-[420px] rounded-lg overflow-hidden shadow-sm z-0">
      <MapContainer center={points[0]} zoom={6} scrollWheelZoom={false} className="h-full w-full">
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <FitBounds points={points} />
        <Polyline positions={points} pathOptions={{ color: "#16a34a", weight: 3, dashArray: "6 8" }} />
        {stops.map((s, i) => (
          <Marker key={`${s.name}-${i}`} position={points[i]} icon={numberIcon(i + 1)}>
            <Popup>
              <strong>{s.name}</strong>
              <br />
              Day {s.day}
              {s.place ? ` · ${s.place}` : ""}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
