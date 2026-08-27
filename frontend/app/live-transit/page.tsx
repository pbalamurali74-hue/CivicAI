"use client";

import { useEffect, useState } from "react";
import { Bus, Wifi, Clock, Activity, AlertCircle, RefreshCw } from "lucide-react";
import MapWrapper from "@/components/MapWrapper";
import { getLiveBuses } from "@/lib/api";

export default function LiveTransitPage() {
  const [buses, setBuses] = useState<any[]>([]);
  const [connected, setConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<string>("");

  useEffect(() => {
    // Initial fetch
    getLiveBuses().then((data) => {
      setBuses(data || []);
      setLastUpdate(new Date().toLocaleTimeString());
    });

    // Setup WebSocket connection
    let socket: WebSocket | null = null;
    try {
      const wsUrl = process.env.NEXT_PUBLIC_WS_URL || "ws://127.0.0.1:8000/ws/buses";
      socket = new WebSocket(wsUrl);
      
      socket.onopen = () => {
        setConnected(true);
        console.log("WebSocket connected to live bus stream");
      };

      socket.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.type === "bus_position_update" && payload.buses) {
            setBuses(payload.buses);
            setLastUpdate(new Date().toLocaleTimeString());
          }
        } catch (e) {
          console.error("WS Parse error:", e);
        }
      };

      socket.onerror = () => {
        setConnected(false);
      };

      socket.onclose = () => {
        setConnected(false);
      };
    } catch (e) {
      setConnected(false);
    }

    // Fallback interval polling if socket drops
    const interval = setInterval(() => {
      if (!socket || socket.readyState !== WebSocket.OPEN) {
        getLiveBuses().then((data) => {
          setBuses(data || []);
          setLastUpdate(new Date().toLocaleTimeString());
        });
      }
    }, 4000);

    return () => {
      if (socket) socket.close();
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-400 text-xs font-semibold mb-2">
            <Bus className="w-4 h-4" /> GTFS Realtime Telemetry • Chennai Metro Region
          </div>
          <h1 className="text-3xl font-extrabold text-white">Live Bus Transit Map</h1>
          <p className="text-slate-400 text-sm mt-1">
            Real-time GPS vehicle tracking with WebSockets. Live speed, occupancy levels, and ETA calculations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border text-xs font-mono font-bold ${
            connected
              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
              : "bg-amber-500/10 text-amber-400 border-amber-500/30"
          }`}>
            <Wifi className="w-3.5 h-3.5 animate-pulse" />
            <span>{connected ? "WebSocket Stream Live" : "Polling Mode (3s)"}</span>
          </div>

          <span className="text-xs text-slate-400 font-mono">
            Updated: {lastUpdate || "Connecting..."}
          </span>
        </div>
      </div>

      {/* MAP DISPLAY */}
      <div className="space-y-4 mb-8">
        <MapWrapper
          center={[13.0315, 80.1812]}
          zoom={12}
          buses={buses}
          height="550px"
        />
      </div>

      {/* LIVE BUSES FLEET TABLE */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-white text-base flex items-center gap-2">
            <Activity className="w-5 h-5 text-sky-400" /> Active Vehicle Fleet Telemetry ({buses.length})
          </h3>
          <span className="text-xs text-slate-400">Simulated GPS Stream</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 font-mono border-b border-slate-800 uppercase text-[10px]">
              <tr>
                <th className="p-3">Vehicle ID</th>
                <th className="p-3">Bus Number</th>
                <th className="p-3">Route ID</th>
                <th className="p-3">Coordinates (Lat, Lng)</th>
                <th className="p-3">Speed</th>
                <th className="p-3">Occupancy</th>
                <th className="p-3">Next Stop</th>
                <th className="p-3">ETA</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {buses.slice(0, 15).map((bus) => (
                <tr key={bus.vehicle_id} className="hover:bg-slate-800/40 transition">
                  <td className="p-3 font-mono font-bold text-cyan-400">{bus.vehicle_id}</td>
                  <td className="p-3 font-bold text-white">{bus.bus_number}</td>
                  <td className="p-3 font-mono">{bus.route_id}</td>
                  <td className="p-3 font-mono text-slate-400">{bus.current_lat}, {bus.current_lng}</td>
                  <td className="p-3">{bus.speed_kmh} km/h</td>
                  <td className="p-3 font-bold text-amber-400">{bus.occupancy_percent}%</td>
                  <td className="p-3 text-slate-300">{bus.next_stop_id}</td>
                  <td className="p-3 font-semibold text-emerald-400">{bus.eta_mins} mins</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
