"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";

// Custom Icon helper using SVG string data URIs
function createCustomIcon(emoji: string, bgColor: string) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36">
    <circle cx="18" cy="18" r="16" fill="${bgColor}" stroke="#ffffff" stroke-width="2"/>
    <text x="18" y="23" font-size="18" text-anchor="middle">${emoji}</text>
  </svg>`;
  return L.icon({
    iconUrl: `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`,
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -32],
  });
}

const icons: Record<string, L.Icon> = {
  Police: createCustomIcon("🚓", "#1E40AF"),
  Hospital: createCustomIcon("🏥", "#DC2626"),
  EB: createCustomIcon("⚡", "#D97706"),
  SRO: createCustomIcon("📜", "#7C3AED"),
  Municipality: createCustomIcon("🏛️", "#059669"),
  Transport: createCustomIcon("🚌", "#2563EB"),
  Attraction: createCustomIcon("🏖️", "#D97706"),
  Landmark: createCustomIcon("🏛️", "#059669"),
  Workplace: createCustomIcon("🏢", "#1E293B"),
  Bus: createCustomIcon("🚌", "#0284C7"),
  Stop: createCustomIcon("🏣", "#475569"),
  User: createCustomIcon("📍", "#10B981")
};

interface MapProps {
  center?: [number, number];
  zoom?: number;
  offices?: any[];
  buses?: any[];
  stops?: any[];
  markers?: any[];
  userLocation?: [number, number];
  height?: string;
  onOfficeSelect?: (office: any) => void;
}

export default function InteractiveMap({
  center = [13.0315, 80.1812],
  zoom = 13,
  offices = [],
  buses = [],
  stops = [],
  markers = [],
  userLocation = [13.0315, 80.1812],
  height = "450px",
  onOfficeSelect,
}: MapProps) {
  const [mounted, setMounted] = useState(false);
  const [mapProvider, setMapProvider] = useState<"google" | "carto">("google");

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div 
        className="w-full flex items-center justify-center bg-zinc-900 text-zinc-400 rounded-2xl border border-zinc-800 animate-pulse"
        style={{ height }}
      >
        <span>Loading Google Maps & GIS Workspace Engine...</span>
      </div>
    );
  }

  return (
    <div className="relative w-full rounded-3xl overflow-hidden border border-zinc-200 shadow-md" style={{ height }}>
      {/* MAP PROVIDER TOGGLE BAR */}
      <div className="absolute top-3 right-3 z-[400] bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-zinc-200 shadow-md flex items-center gap-2 text-xs font-bold">
        <span className="text-zinc-500 text-[10px] font-mono uppercase">Map Layer:</span>
        <button
          onClick={() => setMapProvider("google")}
          className={`px-2.5 py-1 rounded-xl transition ${
            mapProvider === "google"
              ? "bg-[#FFC107] text-[#18181B] font-black shadow-sm"
              : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
          }`}
        >
          🗺️ Google Maps
        </button>
        <button
          onClick={() => setMapProvider("carto")}
          className={`px-2.5 py-1 rounded-xl transition ${
            mapProvider === "carto"
              ? "bg-[#FFC107] text-[#18181B] font-black shadow-sm"
              : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
          }`}
        >
          🗺️ Carto / OSM
        </button>
      </div>

      <MapContainer center={center} zoom={zoom} scrollWheelZoom={false} style={{ width: "100%", height: "100%" }}>
        {mapProvider === "google" ? (
          <TileLayer
            attribution='&copy; <a href="https://www.google.com/maps">Google Maps</a>'
            url="https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
          />
        ) : (
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          />
        )}

        {/* User Location Marker */}
        {userLocation && Number.isFinite(userLocation[0]) && Number.isFinite(userLocation[1]) && (
          <Marker position={userLocation} icon={icons.User}>
            <Popup>
              <div className="text-slate-900 font-semibold p-1">
                📍 Your Current Location (SRM Ramapuram, Chennai)
              </div>
            </Popup>
          </Marker>
        )}

        {/* Government Offices & Tourist Attractions */}
        {offices.map((off) => {
          const lat = Number(off.latitude ?? off.lat);
          const lng = Number(off.longitude ?? off.lng);
          if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

          const categoryIcon = icons[off.category] || icons.Workplace;
          return (
            <Marker key={off.office_id || off.id} position={[lat, lng]} icon={categoryIcon}>
              <Popup>
                <div className="p-1 max-w-xs text-slate-900">
                  <div className="inline-block px-2 py-0.5 text-xs font-bold text-white rounded mb-1" style={{ backgroundColor: '#1E293B' }}>
                    {off.category}
                  </div>
                  <h4 className="font-bold text-sm leading-tight text-slate-900">{off.name}</h4>
                  <p className="text-xs text-slate-600 my-1">{off.address}</p>
                  {off.distance_km && (
                    <div className="text-xs font-semibold text-emerald-600">
                      📍 {off.distance_km} km away
                    </div>
                  )}
                  {off.phone && <p className="text-xs text-slate-500">📞 {off.phone}</p>}
                  <button
                    onClick={() => onOfficeSelect && onOfficeSelect(off)}
                    className="mt-2 w-full py-1 bg-[#FFC107] text-[#18181B] rounded text-xs font-black hover:bg-amber-400 transition"
                  >
                    View Procedure & Details
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Live Buses */}
        {buses.map((bus) => {
          const lat = Number(bus.current_lat ?? bus.lat);
          const lng = Number(bus.current_lng ?? bus.lng);
          if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

          const keyId = bus.vehicle_id || bus.bus_id || bus.reg_number;
          return (
            <Marker
              key={keyId}
              position={[lat, lng]}
              icon={icons.Bus}
            >
              <Popup>
                <div className="p-1 text-slate-900">
                  <span className="bg-amber-600 text-white text-xs font-black px-2 py-0.5 rounded">
                    BUS: {bus.bus_number || bus.reg_number}
                  </span>
                  <p className="text-xs font-semibold mt-1">Route: {bus.route_code || bus.route_id}</p>
                  {bus.speed_kmh !== undefined && <p className="text-xs text-slate-600">Speed: {bus.speed_kmh} km/h</p>}
                  {bus.occupancy_percent !== undefined && (
                    <div className="flex items-center gap-1 mt-1 text-xs font-bold text-amber-700">
                      <span>Occupancy: {bus.occupancy_percent}%</span>
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Bus Stops */}
        {stops.map((stop) => {
          const lat = Number(stop.latitude ?? stop.lat);
          const lng = Number(stop.longitude ?? stop.lng);
          if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

          return (
            <Marker key={stop.stop_id || stop.id} position={[lat, lng]} icon={icons.Stop}>
              <Popup>
                <div className="text-slate-900 font-semibold p-1 text-xs">
                  🏣 {stop.stop_name || stop.name}
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Generic Custom Markers */}
        {markers.map((m) => {
          const lat = m.position ? Number(m.position[0]) : Number(m.lat);
          const lng = m.position ? Number(m.position[1]) : Number(m.lng);
          if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

          return (
            <Marker key={m.id || m.title} position={[lat, lng]} icon={icons.Landmark}>
              <Popup>
                <div className="text-slate-900 p-1 text-xs">
                  <div className="font-bold">{m.title}</div>
                  {m.popupText && <div className="text-slate-600 mt-0.5">{m.popupText}</div>}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
