"use client";

import { useEffect, useState } from "react";
import { 
  Star, 
  ShieldCheck, 
  AlertTriangle, 
  Sparkles, 
  TrendingUp, 
  UserCheck, 
  Filter
} from "lucide-react";
import GuidedWalkthroughBanner from "@/components/GuidedWalkthroughBanner";
import { getSuspiciousRatings } from "@/lib/api";

export default function RatingsPage() {
  const [ratings, setRatings] = useState<any[]>([]);

  useEffect(() => {
    getSuspiciousRatings()
      .then((res) => setRatings(res || []))
      .catch((err) => console.error(err));
  }, []);

  const walkthroughSteps = [
    { title: "Civic Trust", speech: "Welcome to Civic Trust & Anti-Abuse Ratings. Our weighted IsolationForest AI detects rating bursts and fake feedback patterns." }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <GuidedWalkthroughBanner steps={walkthroughSteps} />

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 bg-white p-6 md:p-8 rounded-3xl border-2 border-[#FFC107] shadow-sm">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-100 border border-amber-300 text-amber-900 text-xs font-black uppercase tracking-wider mb-2">
            <Star className="w-4 h-4 text-amber-600" /> WEIGHTED CIVIC TRUST SCORE & ISOLATION FOREST AI
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-[#212121]">Trust & Rating Analytics</h1>
          <p className="text-zinc-600 text-sm font-medium mt-1">
            Prevent single-rating manipulation with weighted trust scoring and ML anti-abuse anomaly detection.
          </p>
        </div>
      </div>

      {/* EMOJI SENTIMENT FEEDBACK CARD MATCHING PRESENTATION BOARD */}
      <div className="bg-white p-6 md:p-8 rounded-3xl mb-8 border border-zinc-200 shadow-sm text-center space-y-4">
        <span className="text-xs font-black uppercase text-amber-700 tracking-wider">Universal Sentiment Feedback</span>
        <h2 className="text-2xl font-black text-[#212121]">Rate Your Official Interaction</h2>
        <p className="text-xs text-zinc-500 font-medium">Tap an emoji below for instant 1-tap feedback in any language</p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto pt-2">
          <div className="bg-white p-4 rounded-3xl border border-zinc-200 hover:border-red-500 shadow-sm text-center cursor-pointer transition">
            <div className="text-4xl mb-2">😡</div>
            <span className="font-black text-[#D32F2F] text-sm block">Very Bad</span>
            <span className="text-[10px] text-zinc-500 font-bold">Score: 1.0</span>
          </div>

          <div className="bg-white p-4 rounded-3xl border border-zinc-200 hover:border-amber-500 shadow-sm text-center cursor-pointer transition">
            <div className="text-4xl mb-2">🙁</div>
            <span className="font-black text-amber-700 text-sm block">Bad</span>
            <span className="text-[10px] text-zinc-500 font-bold">Score: 2.0</span>
          </div>

          <div className="bg-white p-4 rounded-3xl border border-zinc-200 hover:border-amber-400 shadow-sm text-center cursor-pointer transition">
            <div className="text-4xl mb-2">🙂</div>
            <span className="font-black text-amber-700 text-sm block">Good</span>
            <span className="text-[10px] text-zinc-500 font-bold">Score: 4.0</span>
          </div>

          <div className="bg-white p-4 rounded-3xl border border-zinc-200 hover:border-[#FFC107] shadow-sm text-center cursor-pointer transition">
            <div className="text-4xl mb-2">😀</div>
            <span className="font-black text-amber-800 text-sm block">Excellent</span>
            <span className="text-[10px] text-zinc-500 font-bold">Score: 5.0</span>
          </div>
        </div>
      </div>

      {/* TRUST SCORE CATEGORY BREAKDOWN CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm space-y-2">
          <span className="text-xs font-mono font-bold text-zinc-500 uppercase">Identity Verification</span>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-black text-amber-700">95 / 100</span>
            <span className="text-xs font-black text-amber-700">🟡 Verified</span>
          </div>
          <p className="text-xs text-zinc-600 font-medium">Official department & QR cryptographic key valid</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm space-y-2">
          <span className="text-xs font-mono font-bold text-zinc-500 uppercase">Interaction Activity</span>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-black text-[#212121]">90 / 100</span>
            <span className="text-xs font-black text-zinc-700">✓ Active</span>
          </div>
          <p className="text-xs text-zinc-600 font-medium">Regular citizen check-in logs verified</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm space-y-2">
          <span className="text-xs font-mono font-bold text-zinc-500 uppercase">Citizen Feedback</span>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-black text-amber-600">92 / 100</span>
            <span className="text-xs font-black text-amber-600">⭐ 4.6 / 5.0</span>
          </div>
          <p className="text-xs text-zinc-600 font-medium">500+ verified citizen reviews</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm space-y-2">
          <span className="text-xs font-mono font-bold text-zinc-500 uppercase">Report History</span>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-black text-zinc-800">88 / 100</span>
            <span className="text-xs font-black text-zinc-700">Low Risk</span>
          </div>
          <p className="text-xs text-zinc-600 font-medium">Zero critical misconduct reports</p>
        </div>
      </div>

      {/* SUSPICIOUS RATING MODERATION TABLE */}
      <div className="bg-white p-6 md:p-8 rounded-3xl border border-zinc-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-black text-[#212121] text-lg flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-[#D32F2F]" /> AI Moderation: Flagged Anomaly Ratings ({ratings.length})
          </h3>
          <span className="text-xs font-mono text-zinc-500">IsolationForest Model</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-100 text-zinc-700 font-mono border-b border-zinc-200 uppercase text-[10px]">
              <tr>
                <th className="p-3">Rating ID</th>
                <th className="p-3">Officer ID</th>
                <th className="p-3">Rating Score</th>
                <th className="p-3">Anomaly Score</th>
                <th className="p-3">Reason</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 text-zinc-800 font-medium">
              {ratings.map((r) => (
                <tr key={r.rating_id} className="hover:bg-zinc-50 transition">
                  <td className="p-3 font-mono font-black text-amber-700">{r.rating_id}</td>
                  <td className="p-3 font-mono text-[#212121] font-bold">{r.officer_id}</td>
                  <td className="p-3 font-black text-amber-600">⭐ {r.professionalism}/5</td>
                  <td className="p-3 font-mono text-[#D32F2F] font-black">{r.anomaly_score}</td>
                  <td className="p-3 text-zinc-700">{r.anomaly_reason || "Rating burst detected"}</td>
                  <td className="p-3">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-red-100 text-[#D32F2F] border border-red-300 uppercase">
                      🔴 PENDING REVIEW
                    </span>
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

