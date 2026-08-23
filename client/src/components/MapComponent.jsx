import {
  MapContainer,
  TileLayer,
  Marker,
  useMap,
  useMapEvents,
} from "react-leaflet";
import { useEffect, useRef, useState } from "react";
import L from "leaflet";

import icon from "../assets/leaflet/marker-icon.png";
import icon2x from "../assets/leaflet/marker-icon-2x.png";
import shadow from "../assets/leaflet/marker-shadow.png";
import "leaflet/dist/leaflet.css";

// ✅ FIX MARKER (same as your old working code)
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: icon2x,
  iconUrl: icon,
  shadowUrl: shadow,
});

// ✅ Move map when position updates
const MapUpdater = ({ position }) => {
  const map = useMap();

  useEffect(() => {
    if (position) {
      map.flyTo(position, 13);
    }
  }, [position, map]);

  return position ? <Marker position={position} /> : null;
};

// ✅ Click handler (disabled in search mode)
const LocationPicker = ({ setLocation, setPosition, mode }) => {
  const getAddress = async (lat, lng) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      );
      const data = await res.json();
      return data.display_name;
    } catch (err) {
      console.error(err);
      return "Unknown location";
    }
  };

  useMapEvents({
    async click(e) {
      // ❌ Block map clicks while typing/searching
      if (mode === "search") return;

      const { lat, lng } = e.latlng;

      const address = await getAddress(lat, lng);

      const locationData = {
        address,
        lat,
        lng,
      };

      setPosition([lat, lng]);
      setLocation(locationData);
    },
  });

  return null;
};

// ✅ MAIN COMPONENT
const MapComponent = ({ setLocation }) => {
  const [position, setPosition] = useState(null);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [mode, setMode] = useState("map"); // 🔥 map | search

  const debounceRef = useRef(null);

  // 🔍 Fetch suggestions
  const fetchSuggestions = async (value) => {
    if (!value) return setSuggestions([]);

    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${value}`
    );
    const data = await res.json();
    setSuggestions(data);
  };

  // ✍️ Typing
  const handleChange = (e) => {
    const value = e.target.value;
    setQuery(value);

    setMode("search"); // 🔒 lock map clicks

    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchSuggestions(value);
    }, 500);

    // 🔓 if cleared → enable map again
    if (!value) {
      setMode("map");
      setSuggestions([]);
    }
  };

  // ✅ Select suggestion
  const handleSelect = (place) => {
    const lat = parseFloat(place.lat);
    const lng = parseFloat(place.lon);

    const locationData = {
      address: place.display_name,
      lat,
      lng,
    };

    setPosition([lat, lng]);
    setLocation(locationData);
    setQuery(place.display_name);
    setSuggestions([]);

    setMode("search"); // 🔒 keep locked
  };

  return (
    <div className="relative">
      {/* 🗺️ MAP */}
      <MapContainer
        center={[19.076, 72.8777]}
        zoom={13}
        style={{ height: "250px", width: "100%" }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        <LocationPicker
          setLocation={setLocation}
          setPosition={setPosition}
          mode={mode}
        />

        <MapUpdater position={position} />
      </MapContainer>

      {/* 🔤 INPUT BELOW MAP */}
      <input
        type="text"
        value={query}
        onChange={handleChange}
        placeholder="Search location..."
        className="w-full border px-3 py-2 mt-2 rounded-md"
      />

      {/* 🔽 Suggestions */}
      {suggestions.length > 0 && (
        <div className="absolute z-[1000] bg-white w-full max-h-40 overflow-y-auto border rounded shadow">
          {suggestions.map((item, index) => (
            <div
              key={index}
              onClick={() => handleSelect(item)}
              className="p-2 cursor-pointer hover:bg-gray-100 text-sm"
            >
              {item.display_name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MapComponent;