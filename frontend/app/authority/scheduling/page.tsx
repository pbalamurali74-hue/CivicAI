"use client";

import { useState, useEffect } from "react";
import { SlidersHorizontal, CheckCircle2, TrendingUp, RefreshCw, Sparkles, Bus, Zap, Leaf, ShieldAlert } from "lucide-react";
import { optimizeSchedule, approveScheduleChange } from "@/lib/api";
import GuidedWalkthroughBanner from "@/components/GuidedWalkthroughBanner";

export default function AuthoritySchedulingPage() {
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [approvedRoutes, setApprovedRoutes] = useState<Record<string, boolean>>({});

  const handleOptimize = async () => {
    setLoading(true);
    try {
      const res = await optimizeSchedule();
      setRecommendations(res.schedule_recommendations || []);
    } catch (err: any) {
      alert("Optimization error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleOptimize();
  }, []);

  const handleApprove = async (routeId: string, newFreq: number) => {
    try {
      await approveScheduleChange(routeId, newFreq);
      setApprovedRoutes((prev) => ({ ...prev, [routeId]: true }));
    } catch (err: any) {
      alert("Approval error: " + err.message);
    }
  };

  const walkthroughSteps = [
    { title: "Fleet Optimization", speech: "Welcome to Rush-Hour Fleet Scheduling & Environmental Optimization." },
    { title: "Empty Bus Prevention", speech: "During off-peak hours, frequency is reduced to prevent empty diesel runs, saving fuel and carbon emissions." },
    { title: "Footboard Prevention", speech: "During peak rush hours, AI dispatches extra buses to ensure every passenger is seated safely." }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <GuidedWalkthroughBanner steps={walkthroughSteps} />

      {/* HEADER */}
      <div className="bg-white p-6 md:p-8 rounded-3xl border border-zinc-200 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-800 text-xs font-black uppercase tracking-wider mb-2">
              <SlidersHorizontal className="w-4 h-4 text-amber-600" /> SIH PS 26124 • FLEET SCHEDULING COMMAND
            </div>
            <h1 className="text-3xl font-black text-[#212121]">Rush-Hour Fleet & Environmental Optimization</h1>
            <p className="text-zinc-600 text-sm font-semibold mt-1">
              Dynamically dispatch bus fleets to match peak rush-hour demand—eliminating footboard standing while preventing empty diesel runs during off-peak hours.
            </p>
          </div>

          <button
            onClick={handleOptimize}
            disabled={loading}
            className="px-6 py-3 bg-[#FFC107] text-[#18181B] font-black text-xs rounded-2xl hover:bg-amber-400 transition flex items-center gap-2 shadow-sm shrink-0 border border-amber-400"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            <span>{loading ? "Calculating AI Headways..." : "Re-Optimize Timetables"}</span>
          </button>
        </div>

        {/* ENVIRONMENTAL & REVENUE METRICS BAR */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-3 border-t border-zinc-200 text-center">
          <div className="p-3 bg-zinc-50 rounded-2xl border border-zinc-200">
            <span className="text-[10px] font-mono text-zinc-500 font-bold uppercase block">Diesel Fuel Saved</span>
            <span className="text-xl font-black text-emerald-800">420 Liters / Day</span>
          </div>
          <div className="p-3 bg-zinc-50 rounded-2xl border border-zinc-200">
            <span className="text-[10px] font-mono text-zinc-500 font-bold uppercase block">CO2 Emissions Reduced</span>
            <span className="text-xl font-black text-emerald-700">1.1 Tons / Day</span>
          </div>
          <div className="p-3 bg-zinc-50 rounded-2xl border border-zinc-200">
            <span className="text-[10px] font-mono text-zinc-500 font-bold uppercase block">Footboard Risk Prevented</span>
            <span className="text-xs font-black text-[#D32F2F] block mt-1">0% Overcrowding Alert</span>
            <span className="text-[10px] font-mono font-bold text-amber-700">100% Seated Passengers</span>
          </div>
          <div className="p-3 bg-zinc-50 rounded-2xl border border-zinc-200">
            <span className="text-[10px] font-mono text-zinc-500 font-bold uppercase block">Daily Transport Revenue</span>
            <span className="text-xl font-black text-amber-800">+₹38,000 Increase</span>
          </div>
        </div>
      </div>

      {/* SCHEDULE OPTIMIZATION TABLE */}
      <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-black text-[#212121] text-base flex items-center gap-2">
            <Bus className="w-5 h-5 text-amber-600" /> AI Recommended Route Headways & Capacity
          </h3>
          <span className="text-xs text-zinc-500 font-mono font-bold">Constraints: Min 5m, Max 30m</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-100 text-zinc-600 font-mono border-b border-zinc-200 uppercase text-[10px]">
              <tr>
                <th className="p-3">Route Code</th>
                <th className="p-3">Current Frequency</th>
                <th className="p-3">Predicted Demand</th>
                <th className="p-3">Recommended Frequency</th>
                <th className="p-3">Status & Impact</th>
                <th className="p-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 text-zinc-800">
              {recommendations.map((rec) => {
                const isApproved = approvedRoutes[rec.route_id];
                return (
                  <tr key={rec.route_id} className="hover:bg-amber-50/50 transition">
                    <td className="p-3 font-mono font-black text-[#212121] text-sm">{rec.route_code}</td>
                    <td className="p-3 font-mono text-zinc-600">{rec.current_frequency_mins} min</td>
                    <td className="p-3 font-bold text-amber-800">{rec.predicted_demand} passengers/hr</td>
                    <td className="p-3 font-mono font-black text-emerald-700 text-sm">
                      {rec.recommended_frequency_mins} min
                    </td>
                    <td className="p-3">
                      <span className={`px-2.5 py-1 rounded-xl text-[10px] font-black ${
                        rec.status_action === "Increase Frequency"
                          ? "bg-red-100 text-[#D32F2F] border border-red-300"
                          : rec.status_action === "Reduce Frequency"
                          ? "bg-amber-100 text-amber-900 border border-amber-300"
                          : "bg-emerald-100 text-emerald-900 border border-emerald-300"
                      }`}>
                        {rec.status_action}
                      </span>
                    </td>
                    <td className="p-3">
                      {isApproved ? (
                        <span className="text-emerald-700 font-bold text-xs flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4" /> Timetable Applied
                        </span>
                      ) : (
                        <button
                          onClick={() => handleApprove(rec.route_id, rec.recommended_frequency_mins)}
                          className="px-3.5 py-1.5 bg-[#FFC107] text-[#18181B] rounded-xl font-black text-xs hover:bg-amber-400 transition shadow-sm border border-amber-400"
                        >
                          Approve AI Timetable
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
