"use client";

import { useEffect, useState } from "react";
import { getAdminMetrics } from "@/lib/api";

export default function AdminAnalyticsPage() {
  const [metrics, setMetrics] = useState<any>(null);

  useEffect(() => {
    getAdminMetrics().then((data) => setMetrics(data));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-black text-white">System Analytics & Machine Learning Telemetry</h1>
          <p className="text-xs text-slate-400">High-level civic trust, transport demand, and ML performance metrics.</p>
        </div>
      </div>

      {metrics && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-2">
            <span className="text-xs font-mono font-bold text-slate-400 uppercase">Total Citizens</span>
            <h3 className="text-3xl font-black text-white">{metrics.total_citizens}</h3>
            <p className="text-xs text-emerald-400">Active Mobile Platform Users</p>
          </div>

          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-2">
            <span className="text-xs font-mono font-bold text-slate-400 uppercase">Verified Officers</span>
            <h3 className="text-3xl font-black text-emerald-400">{metrics.verified_officers}</h3>
            <p className="text-xs text-slate-400">Active Official QR Badges</p>
          </div>

          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-2">
            <span className="text-xs font-mono font-bold text-slate-400 uppercase">Active Buses</span>
            <h3 className="text-3xl font-black text-cyan-400">{metrics.active_buses}</h3>
            <p className="text-xs text-slate-400">Streaming GTFS Telemetry</p>
          </div>

          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-2">
            <span className="text-xs font-mono font-bold text-slate-400 uppercase">Suspicious Ratings</span>
            <h3 className="text-3xl font-black text-amber-400">{metrics.suspicious_ratings}</h3>
            <p className="text-xs text-slate-400">Flagged by IsolationForest</p>
          </div>
        </div>
      )}
    </div>
  );
}
