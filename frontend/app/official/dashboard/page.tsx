"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  ShieldCheck, 
  QrCode, 
  Star, 
  UserCheck, 
  Building2, 
  MessageSquare, 
  AlertTriangle, 
  Sparkles,
  Printer
} from "lucide-react";
import GuidedWalkthroughBanner from "@/components/GuidedWalkthroughBanner";

export default function OfficialDashboardPage() {
  const [officer, setOfficer] = useState<any>({
    officer_id: "TN-POL-10001",
    name: "Rajesh Kumar",
    department: "Tamil Nadu Police",
    designation: "Traffic Police Inspector",
    office: "Chennai Traffic Division - Guindy",
    trust_score: 92,
    verification_status: "ACTIVE",
    total_ratings: 52,
    avg_rating: 4.8
  });

  const walkthroughSteps = [
    { title: "Official Portal", speech: "Welcome to Official Portal. Here you can view your digital verification badge, citizen ratings, and assigned grievances." }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <GuidedWalkthroughBanner steps={walkthroughSteps} />

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-emerald-950/70 to-slate-900 p-6 md:p-8 rounded-3xl border-2 border-emerald-500/40 glow-emerald shadow-2xl">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-black uppercase tracking-wider mb-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" /> OFFICIAL GOVERNMENT PORTAL
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white">Welcome, {officer.name}</h1>
          <p className="text-slate-300 text-sm mt-1">
            {officer.designation} • {officer.department} ({officer.office})
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/official/qr"
            className="px-5 py-3 bg-emerald-500 text-slate-950 font-black text-xs rounded-2xl hover:bg-emerald-400 transition flex items-center gap-2 shadow-lg shadow-emerald-500/20 min-h-[48px]"
          >
            <QrCode className="w-4 h-4" /> Digital QR Badge
          </Link>
        </div>
      </div>

      {/* STATS METRICS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-2">
          <span className="text-xs font-mono font-bold text-slate-400 uppercase">Verification Status</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-emerald-400">🟢 ACTIVE</span>
            <span className="text-xs font-bold text-emerald-400">✓ Verified</span>
          </div>
          <p className="text-xs text-slate-400">Cryptographic QR badge valid</p>
        </div>

        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-2">
          <span className="text-xs font-mono font-bold text-slate-400 uppercase">Civic Trust Score</span>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-black text-white">{officer.trust_score} / 100</span>
            <span className="text-xs font-bold text-emerald-400">Top 5%</span>
          </div>
          <p className="text-xs text-slate-400">Weighted multi-metric trust rating</p>
        </div>

        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-2">
          <span className="text-xs font-mono font-bold text-slate-400 uppercase">Average Rating</span>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-black text-amber-400">⭐ {officer.avg_rating}</span>
            <span className="text-xs font-bold text-slate-300">/ 5.0</span>
          </div>
          <p className="text-xs text-slate-400">Based on {officer.total_ratings} verified reviews</p>
        </div>

        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-2">
          <span className="text-xs font-mono font-bold text-slate-400 uppercase">Flags & Misconduct</span>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-black text-emerald-400">0 Reports</span>
            <span className="text-xs font-bold text-emerald-400">✓ Clean</span>
          </div>
          <p className="text-xs text-slate-400">No active grievance reports</p>
        </div>
      </div>

      {/* RECENT CITIZEN RATINGS TABLE */}
      <div className="glass-panel p-6 md:p-8 rounded-3xl border border-slate-800 space-y-4">
        <h3 className="font-extrabold text-white text-lg flex items-center justify-between">
          <span>Recent Verified Citizen Feedback</span>
          <span className="text-xs font-mono text-cyan-400">Anti-Abuse Filtered</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 font-mono border-b border-slate-800 uppercase text-[10px]">
              <tr>
                <th className="p-3">Interaction Date</th>
                <th className="p-3">Rating</th>
                <th className="p-3">Professionalism</th>
                <th className="p-3">Behavior</th>
                <th className="p-3">Comment</th>
                <th className="p-3">AI Verification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              <tr className="hover:bg-slate-800/40 transition">
                <td className="p-3 font-mono text-slate-400">2026-08-10 14:30</td>
                <td className="p-3 font-bold text-amber-400">⭐ 5/5</td>
                <td className="p-3 font-bold text-white">5/5</td>
                <td className="p-3 font-bold text-white">5/5</td>
                <td className="p-3 text-slate-300">"Officer verified credentials via QR code politely near Guindy."</td>
                <td className="p-3"><span className="px-2.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold">✓ AI VALIDATED</span></td>
              </tr>
              <tr className="hover:bg-slate-800/40 transition">
                <td className="p-3 font-mono text-slate-400">2026-08-09 11:15</td>
                <td className="p-3 font-bold text-amber-400">⭐ 5/5</td>
                <td className="p-3 font-bold text-white">5/5</td>
                <td className="p-3 font-bold text-white">4/5</td>
                <td className="p-3 text-slate-300">"Quick response and transparent ID verification."</td>
                <td className="p-3"><span className="px-2.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold">✓ AI VALIDATED</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
