"use client";

import { useEffect, useState } from "react";
import { getNearbyOffices } from "@/lib/api";

export default function AdminOfficesPage() {
  const [offices, setOffices] = useState<any[]>([]);

  useEffect(() => {
    getNearbyOffices(13.0315, 80.1812, "All").then((data) => setOffices(data || []));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-black text-white">Government Office Directory</h1>
          <p className="text-xs text-slate-400">Manage government office listings, locations, and visitor queue limits.</p>
        </div>
      </div>

      <div className="glass-panel p-6 rounded-3xl border border-slate-800">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-950 text-slate-400 font-mono border-b border-slate-800 uppercase text-[10px]">
            <tr>
              <th className="p-3">Office ID</th>
              <th className="p-3">Name</th>
              <th className="p-3">Category</th>
              <th className="p-3">Pincode</th>
              <th className="p-3">Phone</th>
              <th className="p-3">Opening Hours</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-slate-300">
            {offices.map((off) => (
              <tr key={off.office_id} className="hover:bg-slate-800/40 transition">
                <td className="p-3 font-mono font-bold text-cyan-400">{off.office_id}</td>
                <td className="p-3 font-bold text-white">{off.name}</td>
                <td className="p-3">{off.category}</td>
                <td className="p-3 font-mono">{off.pincode}</td>
                <td className="p-3 font-mono text-cyan-400">{off.phone}</td>
                <td className="p-3 text-slate-300">{off.opening_hours}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
