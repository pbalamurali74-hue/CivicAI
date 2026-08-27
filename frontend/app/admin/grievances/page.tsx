"use client";

import { useEffect, useState } from "react";
import { getGrievances } from "@/lib/api";

export default function AdminGrievancesPage() {
  const [grievances, setGrievances] = useState<any[]>([]);

  useEffect(() => {
    getGrievances().then((data) => setGrievances(data || []));
  }, []);

  const handleResolve = (ticketId: string) => {
    setGrievances(grievances.map(g => g.ticket_id === ticketId ? { ...g, status: "RESOLVED" } : g));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-black text-white">Grievance Resolution Desk</h1>
          <p className="text-xs text-slate-400">Review, assign, and resolve citizen complaints and extortion reports.</p>
        </div>
      </div>

      <div className="glass-panel p-6 rounded-3xl border border-slate-800">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-950 text-slate-400 font-mono border-b border-slate-800 uppercase text-[10px]">
            <tr>
              <th className="p-3">Ticket ID</th>
              <th className="p-3">Category</th>
              <th className="p-3">Description</th>
              <th className="p-3">Location</th>
              <th className="p-3">Status</th>
              <th className="p-3">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-slate-300">
            {grievances.map((g) => (
              <tr key={g.ticket_id} className="hover:bg-slate-800/40 transition">
                <td className="p-3 font-mono font-bold text-cyan-400">{g.ticket_id}</td>
                <td className="p-3 font-bold text-white">{g.category}</td>
                <td className="p-3 text-slate-300 max-w-xs truncate">{g.description}</td>
                <td className="p-3">{g.location}</td>
                <td className="p-3">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                    g.status === "RESOLVED" ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40" : "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                  }`}>
                    {g.status}
                  </span>
                </td>
                <td className="p-3">
                  {g.status !== "RESOLVED" && (
                    <button onClick={() => handleResolve(g.ticket_id)} className="px-3 py-1 bg-emerald-500 text-slate-950 rounded-xl font-bold hover:bg-emerald-400">
                      Resolve
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
