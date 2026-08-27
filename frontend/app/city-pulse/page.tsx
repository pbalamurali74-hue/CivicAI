"use client";

import { useEffect, useState } from "react";
import { 
  Activity, 
  Bus, 
  ShieldCheck, 
  Building2, 
  AlertTriangle, 
  Sparkles, 
  TrendingUp, 
  Radio, 
  CheckCircle2
} from "lucide-react";
import GuidedWalkthroughBanner from "@/components/GuidedWalkthroughBanner";
import { useLanguage } from "@/context/LanguageContext";

export default function CityPulsePage() {
  const { t } = useLanguage();
  const [pulseData, setPulseData] = useState<any>(null);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/city-pulse")
      .then((res) => res.json())
      .then((data) => setPulseData(data))
      .catch((err) => console.error(err));
  }, []);

  const walkthroughSteps = [
    { title: "City Pulse", speech: "Welcome to CivicAI City Pulse. Here you can view real-time civic health, transit telemetry, and active traffic alerts." }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <GuidedWalkthroughBanner steps={walkthroughSteps} />

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 bg-white p-6 md:p-8 rounded-3xl border-2 border-[#FFC107] shadow-sm">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-100 border border-amber-300 text-amber-900 text-xs font-black uppercase tracking-wider mb-2">
            <Radio className="w-4 h-4 text-amber-600 animate-pulse" /> LIVE CIVIC INTELLIGENCE
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-[#212121]">CIVICSHIELD CITY PULSE</h1>
          <p className="text-zinc-600 text-sm font-semibold mt-1">
            Real-time urban governance health, public transit telemetry, and automated AI advisories for Chennai.
          </p>
        </div>
      </div>

      {/* TOP STATUS CARDS (TRANSPORT, VERIFICATION, SERVICES, TRAFFIC, ALERTS) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {/* CARD 1: TRANSPORT */}
        <div className="bg-white p-5 rounded-3xl border border-zinc-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-500 uppercase font-mono">Transport</span>
            <Bus className="w-5 h-5 text-amber-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-[#212121]">GOOD</span>
            <span className="text-xs font-black text-amber-700">✓ 94% On-time</span>
          </div>
          <p className="text-[11px] text-zinc-500 font-medium">100 active buses streaming telemetry</p>
        </div>

        {/* CARD 2: VERIFICATION */}
        <div className="bg-white p-5 rounded-3xl border border-zinc-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-500 uppercase font-mono">Trust & QR</span>
            <ShieldCheck className="w-5 h-5 text-amber-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-[#212121]">SAFE</span>
            <span className="text-xs font-black text-amber-700">✓ 142 Verified</span>
          </div>
          <p className="text-[11px] text-zinc-500 font-medium">2 suspicious reports pending review</p>
        </div>

        {/* CARD 3: SERVICES */}
        <div className="bg-white p-5 rounded-3xl border border-zinc-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-500 uppercase font-mono">Services</span>
            <Building2 className="w-5 h-5 text-zinc-700" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-[#212121]">NORMAL</span>
            <span className="text-xs font-black text-zinc-600">30 Offices Open</span>
          </div>
          <p className="text-[11px] text-zinc-500 font-medium">Average wait time ~22 mins</p>
        </div>

        {/* CARD 4: TRAFFIC */}
        <div className="bg-white p-5 rounded-3xl border border-zinc-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-500 uppercase font-mono">Traffic</span>
            <Activity className="w-5 h-5 text-amber-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-700">HIGH DEMAND</span>
          </div>
          <p className="text-[11px] text-zinc-500 font-medium">Kathipara & Anna Salai surge</p>
        </div>

        {/* CARD 5: ALERTS */}
        <div className="bg-white p-5 rounded-3xl border border-zinc-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-500 uppercase font-mono">Active Alerts</span>
            <AlertTriangle className="w-5 h-5 text-[#D32F2F]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-[#D32F2F]">7</span>
            <span className="text-xs font-black text-[#D32F2F]">Alerts</span>
          </div>
          <p className="text-[11px] text-zinc-500 font-medium">3 route frequency advisories</p>
        </div>
      </div>

      {/* EXPLAINABLE AI INSIGHTS BOX */}
      <div className="bg-white p-6 md:p-8 rounded-3xl border border-zinc-200 shadow-sm space-y-6 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#FFC107] text-[#18181B] flex items-center justify-center font-black text-xl border border-amber-300 shadow-sm">
            ✨
          </div>
          <div>
            <h3 className="text-xl font-black text-[#212121]">Explainable AI City Advisories</h3>
            <p className="text-xs text-zinc-500 font-medium">Automated pattern discovery from real-time civic streams</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {pulseData?.ai_insights?.map((insight: string, idx: number) => (
            <div key={idx} className="p-4 bg-zinc-50 rounded-2xl border border-zinc-200 flex items-start gap-3 shadow-sm">
              <span className="text-amber-600 text-lg">💡</span>
              <div>
                <span className="text-[10px] font-mono text-amber-700 font-bold block uppercase">INSIGHT #{idx + 1}</span>
                <p className="text-xs font-bold text-[#212121] leading-relaxed">{insight}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

