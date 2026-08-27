"use client";

import { useEffect, useState } from "react";
import { UserCheck, ShieldCheck, AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import { getAdminMetrics } from "@/lib/api";

export default function AdminOfficersPage() {
  const [officers, setOfficers] = useState<any[]>([
    { officer_id: "TN-POL-10001", name: "R. K. Selvam", department: "Traffic Police", designation: "Inspector", status: "ACTIVE" },
    { officer_id: "TN-POL-10002", name: "M. Anitha", department: "Law & Order", designation: "Sub-Inspector", status: "ACTIVE" },
    { officer_id: "TN-POL-10004", name: "K. Vijay", department: "Crime Branch", designation: "Head Constable", status: "SUSPENDED" }
  ]);

  const toggleStatus = async (officerId: string, currentStatus: string) => {
    const newStatus = currentStatus === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
    const endpoint = currentStatus === "ACTIVE" ? `/officers/suspend/${officerId}` : `/officers/approve/${officerId}`;
    try {
      await fetch(`http://127.0.0.1:8000/api/admin${endpoint}`, { method: "POST" });
      setOfficers(officers.map(o => o.officer_id === officerId ? { ...o, status: newStatus } : o));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-black text-white">Officer Management & Verification Moderation</h1>
          <p className="text-xs text-slate-400">Review government official profiles, status, and verification badges.</p>
        </div>
      </div>

      <div className="glass-panel p-6 rounded-3xl border border-slate-800">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-950 text-slate-400 font-mono border-b border-slate-800 uppercase text-[10px]">
            <tr>
              <th className="p-3">Officer ID</th>
              <th className="p-3">Name</th>
              <th className="p-3">Department</th>
              <th className="p-3">Designation</th>
              <th className="p-3">Status</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-slate-300">
            {officers.map((off) => (
              <tr key={off.officer_id} className="hover:bg-slate-800/40 transition">
                <td className="p-3 font-mono font-bold text-cyan-400">{off.officer_id}</td>
                <td className="p-3 font-bold text-white">{off.name}</td>
                <td className="p-3">{off.department}</td>
                <td className="p-3">{off.designation}</td>
                <td className="p-3">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                    off.status === "ACTIVE" ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40" : "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                  }`}>
                    {off.status}
                  </span>
                </td>
                <td className="p-3">
                  <button
                    onClick={() => toggleStatus(off.officer_id, off.status)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold ${
                      off.status === "ACTIVE" ? "bg-rose-500 text-white" : "bg-emerald-500 text-slate-950"
                    }`}
                  >
                    {off.status === "ACTIVE" ? "Suspend" : "Approve"}
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
