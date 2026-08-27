"use client";

import { useEffect, useState } from "react";
import { getBusRoutes } from "@/lib/api";

export default function AdminRoutesPage() {
  const [routes, setRoutes] = useState<any[]>([]);

  useEffect(() => {
    getBusRoutes().then((data) => setRoutes(data || []));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-black text-white">Transit Route Network Management</h1>
          <p className="text-xs text-slate-400">View bus route corridors, headway frequencies, and assigned bus fleet counts.</p>
        </div>
      </div>

      <div className="glass-panel p-6 rounded-3xl border border-slate-800">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-950 text-slate-400 font-mono border-b border-slate-800 uppercase text-[10px]">
            <tr>
              <th className="p-3">Route ID</th>
              <th className="p-3">Route Name</th>
              <th className="p-3">Origin</th>
              <th className="p-3">Destination</th>
              <th className="p-3">Frequency</th>
              <th className="p-3">Buses Allocated</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-slate-300">
            {routes.map((r) => (
              <tr key={r.route_id} className="hover:bg-slate-800/40 transition">
                <td className="p-3 font-mono font-bold text-cyan-400">{r.route_id}</td>
                <td className="p-3 font-bold text-white">{r.route_name}</td>
                <td className="p-3">{r.origin_stop}</td>
                <td className="p-3">{r.destination_stop}</td>
                <td className="p-3 font-semibold text-emerald-400">{r.frequency_mins} mins</td>
                <td className="p-3 font-bold text-white">{r.total_buses} Buses</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
