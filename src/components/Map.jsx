"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix default marker icon issue in Next.js / Leaflet
const customIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export default function Map({ cars }) {
  // Center map on Addis Ababa
  const addisCenter = [9.0107, 38.7612];

  return (
    <MapContainer
      center={addisCenter}
      zoom={12}
      scrollWheelZoom={false}
      className="w-full h-full min-h-[320px] rounded-xl z-0"
    >
      {/* 100% Free OpenStreetMap Tiles (No API key required) */}
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* Map Markers from Seed Data */}
      {cars.map((car) => (
        <Marker
          key={car.id}
          position={[car.latitude, car.longitude]}
          icon={customIcon}
        >
          <Popup>
            <div className="text-gray-900 font-sans p-1 text-xs">
              <p className="font-bold">{car.make} {car.model}</p>
              <p className="text-gray-600">{car.neighbourhood}</p>
              <p className="font-extrabold text-emerald-600 mt-1">
                {car.pricePerDay.toLocaleString()} ETB / day
              </p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}