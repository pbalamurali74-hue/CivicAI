"use client";

import { useEffect, useState } from "react";
import { getSuspiciousRatings } from "@/lib/api";

export default function AdminRatingsPage() {
  const [ratings, setRatings] = useState<any[]>([]);

  useEffect(() => {
    getSuspiciousRatings().then((data) => setRatings(data || []));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-black text-white">Ratings Anomaly & Anti-Abuse Moderation</h1>
          <p className="text-xs text-slate-400">Review flagged suspicious ratings detected by IsolationForest model.</p>
        </div>
      </div>

      <div className="glass-panel p-6 rounded-3xl border border-slate-800">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-950 text-slate-400 font-mono border-b border-slate-800 uppercase text-[10px]">
            <tr>
              <th className="p-3">Rating ID</th>
              <th className="p-3">Officer ID</th>
              <th className="p-3">Rating</th>
              <th className="p-3">Anomaly Score</th>
              <th className="p-3">Reason</th>
              <th className="p-3">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-slate-300">
            {ratings.map((r) => (
              <tr key={r.rating_id} className="hover:bg-slate-800/40 transition">
                <td className="p-3 font-mono font-bold text-cyan-400">{r.rating_id}</td>
                <td className="p-3 font-mono text-white">{r.officer_id}</td>
                <td className="p-3 font-bold text-amber-400">⭐ {r.professionalism}/5</td>
                <td className="p-3 font-mono text-rose-400 font-bold">{r.anomaly_score}</td>
                <td className="p-3 text-slate-300">{r.anomaly_reason || "Rating burst"}</td>
                <td className="p-3">
                  <button onClick={() => alert("Rating dismissed")} className="px-3 py-1 bg-slate-800 text-slate-300 rounded-xl font-bold hover:bg-slate-700">
                    Dismiss
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
