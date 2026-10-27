import React, { useState, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Tooltip,
  useMapEvents,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { IoClose } from "react-icons/io5";
import useApi from "../../hooks/useApi";
import { fetchLocationName } from "../../services/locationService";

// Fix marker icon issue in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// ✅ Custom green marker icon for searched location
const greenIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

function MapPicker({ initialSpots = [], onClose, onConfirm, description }) {
  const [spots, setSpots] = useState(initialSpots);
  const [searchResult, setSearchResult] = useState(null);

  const { request: fetchLocationRequest } = useApi(fetchLocationName);

  const fetchLocation = async (lat, lon) => {
    try {
      const response = await fetchLocationRequest({ params: { lat, lon } });
      return response?.data?.locationName || "Unknown Location";
    } catch (err) {
      console.error("Error fetching location name:", err);
      return "Unknown Location";
    }
  };

  async function handleAddSpot(e) {
    const { lat, lng } = e.latlng;

    try {
      const name = await fetchLocation(lat, lng);
      const spot = { lat, lng, name, description };
      setSpots([spot]);
      if (onConfirm) onConfirm([spot]);
      onClose();
    } catch (error) {
      console.error("Error selecting location:", error);
    }
  }

  function MapClickHandler() {
    useMapEvents({
      click: handleAddSpot,
    });
    return null;
  }

  function MapSearchHandler({ searchResult }) {
    const map = useMap();
    useEffect(() => {
      if (searchResult) {
        map.setView([searchResult.lat, searchResult.lng], 9);
      }
    }, [searchResult, map]);
    return null;
  }

  function SearchBox({ onResult }) {
    const [query, setQuery] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSearch(e) {
      e.preventDefault();
      if (!query) return;
      setLoading(true);

      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
            query
          )}&format=json&limit=1`
        );
        const results = await response.json();

        if (results.length > 0) {
          const { lat, lon, display_name } = results[0];
          onResult({
            lat: parseFloat(lat),
            lng: parseFloat(lon),
            name: display_name || query,
          });
        } else {
          alert("No results found.");
        }
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setLoading(false);
      }
    }

    return (
      <form onSubmit={handleSearch} className="flex gap-2 items-center">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search location..."
          className="px-2 py-1 border border-gray-300 rounded text-sm w-64"
        />
        <button
          type="submit"
          className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
          disabled={loading}
        >
          {loading ? "..." : "Go"}
        </button>
      </form>
    );
  }

  const handleSelectSearchedLocation = async () => {
    if (!searchResult) return;
    try {
      const name =
        searchResult.name ||
        (await fetchLocation(searchResult.lat, searchResult.lng));
      const spot = {
        lat: searchResult.lat,
        lng: searchResult.lng,
        name,
        description,
      };
      setSpots([spot]);
      if (onConfirm) onConfirm([spot]);
      onClose();
    } catch (err) {
      console.error("Error selecting searched location:", err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 sm:p-0">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl h-[75vh] flex flex-col relative overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 w-full sm:w-auto">
            <h2 className="text-xl font-bold whitespace-nowrap">
              Select Location
            </h2>
            <SearchBox
              onResult={({ lat, lng, name }) =>
                setSearchResult({ lat, lng, name })
              }
            />
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl cursor-pointer self-start sm:self-center"
            title="Close"
          >
            <IoClose />
          </button>
        </div>

        {/* Map */}
        <div className="flex-1 relative min-h-[300px]">
          <MapContainer
            center={[20.5937, 78.9629]}
            zoom={5}
            className="h-full w-full z-0 relative"
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <MapClickHandler />
            <MapSearchHandler searchResult={searchResult} />

            {/* Confirmed Marker */}
            {spots.length === 1 && (
              <Marker position={[spots[0].lat, spots[0].lng]}>
                <Popup>
                  <strong>{spots[0].name}</strong>
                </Popup>
              </Marker>
            )}

            {/* Search Marker (click to add) */}
            {searchResult && (
              <Marker
                position={[searchResult.lat, searchResult.lng]}
                eventHandlers={{
                  click: handleSelectSearchedLocation,
                }}
                icon={greenIcon}
              >
                <Tooltip direction="top" offset={[0, -30]} opacity={1}>
                  {searchResult.name}
                </Tooltip>
                <Popup>
                  <strong>Click marker to add this location</strong>
                </Popup>
              </Marker>
            )}
          </MapContainer>
        </div>
      </div>
    </div>
  );
}

export default MapPicker;
