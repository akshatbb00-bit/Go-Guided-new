import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useRef } from "react";

// ✅ Green Marker Icon (Default)
const greenIcon = L.icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  shadowSize: [41, 41],
});

// ✅ start and end Marker Icon (For Day 1 / Day 7)
const startIcon = L.icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png", // Use blue (close to teal)
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  shadowSize: [41, 41],
});

// ✅ Function to Calculate Midpoint & Correct Bearing
const calculateMidpointAndBearing = (pos1, pos2) => {
  const { lat: lat1, lng: lon1 } = pos1;
  const { lat: lat2, lng: lon2 } = pos2;

  const toRad = (deg) => (deg * Math.PI) / 180;
  const toDeg = (rad) => (rad * 180) / Math.PI;

  const φ1 = toRad(lat1);
  const φ2 = toRad(lat2);
  const λ1 = toRad(lon1);
  const λ2 = toRad(lon2);

  // Midpoint calculation
  const midLat = (lat1 + lat2) / 2;
  const midLon = (lon1 + lon2) / 2;

  // Vincenty's bearing calculation
  const Δλ = λ2 - λ1;
  const X = Math.cos(φ2) * Math.sin(Δλ);
  const Y =
    Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
  let bearing = toDeg(Math.atan2(X, Y));

  // Normalize bearing to be within 0 - 360 degrees
  bearing = (bearing + 360) % 360;
  bearing = (bearing - 90 + 360) % 360;

  return { midpoint: [midLat, midLon], bearing };
};

// ✅ Component to Handle Marker Click (Zoom) & Show Popup on Hover
function ZoomToMarker({ position, label, day, isSpecial }) {
  const map = useMap();
  const markerRef = useRef(null);

  const handleClick = () => {
    map.setView(position, 14);
  };

  const handleMouseOver = () => {
    if (markerRef.current) {
      markerRef.current.openPopup();
    }
  };

  const handleMouseOut = () => {
    if (markerRef.current) {
      markerRef.current.closePopup();
    }
  };

  return (
    <Marker
      ref={markerRef}
      position={position}
      eventHandlers={{
        click: handleClick,
        mouseover: handleMouseOver,
        mouseout: handleMouseOut,
      }}
      icon={isSpecial ? startIcon : greenIcon} // 🔴 Red for Day 1 / Day 7, 🟢 Green for others
    >
      <Popup autoClose={true}>
        <span className="font-bold text-black">
          {day} - {label}
        </span>
      </Popup>
    </Marker>
  );
}

function mergeSameCoordinatesWithStartPoint(spots) {
  const mergedMap = new Map();

  for (const spot of spots) {
    const { lat, lng } = spot.position;
    const key = `${lat},${lng}`;

    if (mergedMap.has(key)) {
      const existing = mergedMap.get(key);

      existing.day += ` / ${spot.day}`;
      existing.task += ` / ${spot.task}`;

      if (!existing.place.includes(spot.place)) {
        existing.place += ` / ${spot.place}`;
      }

      // If this spot is Day 1, mark it as the starting point
      if (spot.day === "Day 1" || spot.day.includes("Day 1")) {
        existing.start = true;
      }
    } else {
      mergedMap.set(key, {
        ...spot,
        isStartPoint: spot.day === "Day 1", // true for Day 1 only
      });
    }
  }

  return Array.from(mergedMap.values());
}

// ✅ Main Map Component
function TourMap({ spots = [] }) {
  const locations = mergeSameCoordinatesWithStartPoint(spots);

  return (
    <div className="relative w-full md:w-[70%] bg-white p-2 rounded-lg shadow-sm z-0 h-[300px] md:h-[500px]">
      <MapContainer
        center={[locations[0].position.lat, locations[0].position.lng]}
        zoom={9}
        scrollWheelZoom={false}
        className="h-full w-full rounded-md"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        {/* ✅ Green & Red Markers with Popups on Hover */}
        {locations.map((loc, index) => (
          <ZoomToMarker
            key={index}
            position={[loc.position.lat, loc.position.lng]}
            label={loc.task}
            day={loc.day}
            isSpecial={loc.isStartPoint}
          />
        ))}

        {/* ✅ Dotted Polyline with Correct Arrow Direction */}
        {[...locations, locations[0]].slice(0, -1).map((loc, index) => {
          const nextLoc = locations[index + 1] || locations[0];
          const { midpoint, bearing } = calculateMidpointAndBearing(
            loc.position,
            nextLoc.position
          );

          return (
            <div key={index}>
              <Polyline
                positions={[loc.position, nextLoc.position]}
                pathOptions={{
                  color: "#22c55e",
                  weight: 2,
                  dashArray: "5, 10",
                }}
              />
              <Marker
                position={midpoint}
                icon={L.divIcon({
                  className: "custom-arrow",
                  html: `<div style="font-size: 24px; color: #22c55e; transform: rotate(${bearing}deg);">➤</div>`,
                  iconSize: [15, 15],
                  iconAnchor: [7, 18],
                })}
              />
            </div>
          );
        })}
      </MapContainer>
    </div>
  );
}

export default TourMap;
