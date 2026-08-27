"use client";

import { useEffect, useState } from "react";
import { 
  Network, 
  ArrowRight, 
  Sparkles, 
  Bus, 
  Clock, 
  CheckCircle2, 
  TrendingUp, 
  GitMerge,
  Zap,
  ShieldCheck
} from "lucide-react";
import GuidedWalkthroughBanner from "@/components/GuidedWalkthroughBanner";
import { useLanguage } from "@/context/LanguageContext";

export default function OdAnalysisPage() {
  const { t } = useLanguage();
  const [selectedRouteCase, setSelectedRouteCase] = useState<string>("CASE_DIRECT_SOLVER");

  const walkthroughSteps = [
    { title: "SIH PS 26124 O-D AI", speech: "Welcome to Origin-Destination AI Route Optimization & Frequency Boost Engine." },
    { title: "Direct Bus Solver", speech: "When citizens must transfer between buses at a junction, AI detects the transfer bottleneck and proposes a Direct Express Route." },
    { title: "Frequency Boost", speech: "If a direct bus already exists, AI predicts passenger crowding and recommends increasing bus frequency." }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <GuidedWalkthroughBanner steps={walkthroughSteps} />

      {/* HEADER BANNER */}
      <div className="bg-white p-6 md:p-8 rounded-3xl border border-zinc-200 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-800 text-xs font-black uppercase tracking-wider mb-2">
              <GitMerge className="w-4 h-4 text-amber-600" /> SIH PS 26124 • ORIGIN-DESTINATION AI ANALYTICS
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-[#212121]">
              Direct Bus Route & Frequency Optimization Engine
            </h1>
            <p className="text-zinc-600 text-sm font-semibold mt-1">
              AI graph clustering analyzes citizen travel patterns to eliminate multi-bus transfer bottlenecks and optimize fleet frequency.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="px-3 py-1.5 rounded-2xl bg-amber-100 text-amber-900 border border-amber-300 font-mono text-xs font-black">
              DBSCAN Graph Clustering
            </span>
          </div>
        </div>

        {/* METRICS HIGHLIGHT BAR */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-3 border-t border-zinc-200 text-center">
          <div className="p-3 bg-zinc-50 rounded-2xl border border-zinc-200">
            <span className="text-[10px] font-mono text-zinc-500 font-bold uppercase block">Transfer Bottlenecks</span>
            <span className="text-xl font-black text-[#212121]">14 Corridors</span>
          </div>
          <div className="p-3 bg-zinc-50 rounded-2xl border border-zinc-200">
            <span className="text-[10px] font-mono text-zinc-500 font-bold uppercase block">Commuter Travel Saved</span>
            <span className="text-xl font-black text-amber-700">30 Mins / Trip</span>
          </div>
          <div className="p-3 bg-zinc-50 rounded-2xl border border-zinc-200">
            <span className="text-[10px] font-mono text-zinc-500 font-bold uppercase block">Direct Buses Proposed</span>
            <span className="text-lg font-black text-amber-800 block mt-0.5">Route 70X & 21X</span>
          </div>
          <div className="p-3 bg-zinc-50 rounded-2xl border border-zinc-200">
            <span className="text-[10px] font-mono text-zinc-500 font-bold uppercase block">Frequency Boost Recommended</span>
            <span className="text-xl font-black text-emerald-700">6 Mins Headway</span>
          </div>
        </div>
      </div>

      {/* FEATURE DEMO SWITCHER CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* SCENARIO 1: NO DIRECT BUS (PROPOSE NEW DIRECT BUS) */}
        <div className="bg-white p-6 md:p-8 rounded-3xl border-2 border-[#FFC107] shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-zinc-200 pb-4">
            <div>
              <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-black uppercase tracking-wider">
                SCENARIO A: NO DIRECT BUS PRESENT
              </span>
              <h3 className="text-xl font-black text-[#212121] mt-2">AI Direct Bus Proposal Algorithm</h3>
            </div>
            <span className="text-xs font-mono font-bold text-amber-700">1,420 Daily Commuters</span>
          </div>

          <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-200 space-y-2 text-xs">
            <span className="font-mono text-zinc-500 font-bold uppercase text-[10px]">Current Multi-Leg Transfer Problem:</span>
            <div className="flex items-center gap-2 font-bold text-[#212121]">
              <span>SRM Ramapuram</span>
              <ArrowRight className="w-3.5 h-3.5 text-amber-600" />
              <span className="px-2 py-0.5 rounded bg-red-100 text-[#D32F2F] border border-red-300">
                Guindy Junction (Transfer #1 • 22m wait)
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-amber-600" />
              <span>T. Nagar</span>
            </div>
            <div className="text-zinc-500 pt-1 font-medium">Total Duration: 65 mins • 2 Transfers required</div>
          </div>

          {/* AI SOLUTION BOX */}
          <div className="p-5 bg-amber-50 border-2 border-[#FFC107] rounded-2xl space-y-3 text-xs">
            <div className="flex items-center gap-2 text-amber-900 font-black text-sm">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>✨ AI Recommended Action: Create Direct Express Route 70X</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#212121]">
              <span>SRM Ramapuram</span>
              <span className="px-3 py-1 rounded-full bg-[#FFC107] text-[#18181B] font-black">
                ──────── DIRECT EXPRESS 70X ────────→
              </span>
              <span>T. Nagar</span>
            </div>
            <div className="flex items-center justify-between text-xs font-bold text-amber-900 pt-1 border-t border-amber-200">
              <span>⏱ Time Saved: 30 Mins (65m ➔ 35m)</span>
              <span>✓ 0 Transfers Required</span>
            </div>
          </div>
        </div>

        {/* SCENARIO 2: DIRECT BUS EXISTS BUT OVERCROWDED (BOOST FREQUENCY) */}
        <div className="bg-white p-6 md:p-8 rounded-3xl border-2 border-amber-400 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-zinc-200 pb-4">
            <div>
              <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 text-[10px] font-black uppercase tracking-wider">
                SCENARIO B: DIRECT BUS PRESENT BUT OVERCROWDED
              </span>
              <h3 className="text-xl font-black text-[#212121] mt-2">AI Frequency Boost Recommender</h3>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-800">Route 21G Corridor</span>
          </div>

          <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-200 space-y-2 text-xs">
            <span className="font-mono text-zinc-500 font-bold uppercase text-[10px]">Current Route 21G Condition:</span>
            <div className="flex items-center justify-between font-bold text-[#212121]">
              <span>Guindy ➔ Central Railway Station</span>
              <span className="text-[#D32F2F] font-mono">Occupancy: 117% (Footboard Standing)</span>
            </div>
            <div className="text-zinc-500 pt-1 font-medium">Current Frequency: 1 bus every 15 minutes</div>
          </div>

          {/* AI FREQUENCY SOLUTION BOX */}
          <div className="p-5 bg-emerald-50 border-2 border-emerald-400 rounded-2xl space-y-3 text-xs">
            <div className="flex items-center gap-2 text-emerald-950 font-black text-sm">
              <Zap className="w-4 h-4 text-emerald-700" />
              <span>⚡ AI Recommended Action: Increase Bus Frequency (15m ➔ 6m)</span>
            </div>
            <p className="text-emerald-900 font-medium">
              Dispatch +4 extra buses during 08:00 AM – 10:30 AM morning surge. Eliminates footboard standing, improves commuter safety, and boosts transport authority daily revenue by +₹38,000.
            </p>
            <div className="flex items-center justify-between text-xs font-bold text-emerald-900 pt-1 border-t border-emerald-200">
              <span>⏱ New Headway: 6 Mins</span>
              <span>✓ Optimal Seating Capacity</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
