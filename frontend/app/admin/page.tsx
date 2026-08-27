"use client";

import { useEffect, useState } from "react";
import { 
  SlidersHorizontal, 
  Users, 
  ShieldCheck, 
  Building2, 
  Bus, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle,
  TrendingUp,
  Cpu
} from "lucide-react";
import { getAdminMetrics, getSuspiciousRatings, fetchJson } from "@/lib/api";

export default function AdminDashboardPage() {
  const [metrics, setMetrics] = useState<any>(null);
  const [suspiciousRatings, setSuspiciousRatings] = useState<any[]>([]);
  const [officers, setOfficers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [m, r, o] = await Promise.all([
        getAdminMetrics(),
        getSuspiciousRatings().catch(() => []),
        fetchJson("/officers").catch(() => [])
      ]);
      setMetrics(m);
      setSuspiciousRatings(r || []);
      setOfficers(o || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOfficerStatus = async (officerId: string, action: "approve" | "suspend") => {
    try {
      await fetchJson(`/admin/officers/${action}/${officerId}`, { method: "POST" });
      loadData();
    } catch (err: any) {
      alert("Action failed: " + err.message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold mb-2">
            <SlidersHorizontal className="w-4 h-4" /> Super Admin Operations & Moderation
          </div>
          <h1 className="text-3xl font-extrabold text-white">System Analytics & Control Panel</h1>
          <p className="text-slate-400 text-sm mt-1">
            Monitor system health, manage officer approvals, review suspicious ratings, and track city transit performance.
          </p>
        </div>
      </div>

      {/* METRIC CARDS */}
      {metrics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400 text-xs font-semibold">Total Citizens</span>
              <Users className="w-4 h-4 text-cyan-400" />
            </div>
            <span className="text-3xl font-black text-white">{metrics.total_citizens.toLocaleString()}</span>
            <span className="text-[10px] text-emerald-400 block mt-1">+12% growth this week</span>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400 text-xs font-semibold">Verified Officers</span>
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <span className="text-3xl font-black text-emerald-400">{metrics.verified_officers}</span>
            <span className="text-[10px] text-slate-400 block mt-1">{metrics.suspended_officers} Suspended</span>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400 text-xs font-semibold">Active Buses</span>
              <Bus className="w-4 h-4 text-sky-400" />
            </div>
            <span className="text-3xl font-black text-sky-400">{metrics.active_buses}</span>
            <span className="text-[10px] text-slate-400 block mt-1">{metrics.bus_routes} Active Routes</span>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400 text-xs font-semibold">Suspicious Ratings</span>
              <AlertTriangle className="w-4 h-4 text-amber-400" />
            </div>
            <span className="text-3xl font-black text-amber-400">{metrics.suspicious_ratings}</span>
            <span className="text-[10px] text-amber-500 block mt-1">Pending AI Anomaly Review</span>
          </div>
        </div>
      )}

      {/* OFFICER MANAGEMENT & APPROVALS TABLE */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-white text-base flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" /> Government Official Credential Management
          </h3>
          <span className="text-xs text-slate-400 font-mono">Total Roster: {officers.length} Officers</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 font-mono border-b border-slate-800 uppercase text-[10px]">
              <tr>
                <th className="p-3">Officer ID</th>
                <th className="p-3">Officer Name</th>
                <th className="p-3">Department</th>
                <th className="p-3">Designation</th>
                <th className="p-3">Trust Score</th>
                <th className="p-3">Status</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {officers.slice(0, 10).map((off) => (
                <tr key={off.officer_id} className="hover:bg-slate-800/40 transition">
                  <td className="p-3 font-mono font-bold text-cyan-400">{off.officer_id}</td>
                  <td className="p-3 font-bold text-white">{off.name}</td>
                  <td className="p-3">{off.department}</td>
                  <td className="p-3 text-slate-400">{off.designation}</td>
                  <td className="p-3 font-bold text-emerald-400">{off.trust_score} / 5.0</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      off.verification_status === "ACTIVE"
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                    }`}>
                      {off.verification_status}
                    </span>
                  </td>
                  <td className="p-3 space-x-2">
                    {off.verification_status === "ACTIVE" ? (
                      <button
                        onClick={() => handleOfficerStatus(off.officer_id, "suspend")}
                        className="px-2.5 py-1 bg-rose-500/20 text-rose-300 border border-rose-500/40 rounded text-[11px] hover:bg-rose-500 hover:text-white"
                      >
                        Suspend
                      </button>
                    ) : (
                      <button
                        onClick={() => handleOfficerStatus(off.officer_id, "approve")}
                        className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded text-[11px] hover:bg-emerald-500 hover:text-slate-950"
                      >
                        Activate
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
