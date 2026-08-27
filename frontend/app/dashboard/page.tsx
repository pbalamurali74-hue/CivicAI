"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  ShieldCheck, 
  Building2, 
  Navigation, 
  AlertTriangle, 
  MapPin, 
  CheckCircle2, 
  Bus, 
  Clock, 
  Sparkles,
  Volume2,
  HelpCircle,
  ToggleLeft,
  ToggleRight
} from "lucide-react";
import MapWrapper from "@/components/MapWrapper";
import GuidedWalkthroughBanner from "@/components/GuidedWalkthroughBanner";
import { getNearbyOffices, getLiveBuses } from "@/lib/api";
import { useLanguage } from "@/context/LanguageContext";
import { useAccessibility } from "@/context/AccessibilityContext";

export default function CitizenDashboard() {
  const { t, language } = useLanguage();
  const { simpleMode, setSimpleMode, guidedWalkthrough } = useAccessibility();
  const [offices, setOffices] = useState<any[]>([]);
  const [buses, setBuses] = useState<any[]>([]);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const [officeData, busData] = await Promise.all([
          getNearbyOffices(13.0315, 80.1812, "All"),
          getLiveBuses().catch(() => [])
        ]);
        setOffices(officeData || []);
        setBuses(busData || []);
      } catch (err) {
        console.error("Dashboard error:", err);
      }
    }
    loadDashboardData();
  }, []);

  const walkthroughSteps = [
    { title: "Welcome", speech: "Welcome to CivicAI. How can we help you today?" },
    { title: "Verify", speech: "To check if a police or government officer is genuine, tap Verify Official." },
    { title: "Govt Office", speech: "To find nearby police stations, hospitals, or EB offices, tap Government Office." },
    { title: "Travel", speech: "To find the best bus or cab routes, tap Travel." },
    { title: "Report", speech: "To report extortion or fake officers, tap Report Issue." }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* GUIDED AUDIO WALKTHROUGH BANNER */}
      <GuidedWalkthroughBanner steps={walkthroughSteps} />

      {/* HEADER BANNER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950 p-6 rounded-3xl border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs mb-1">
            <Sparkles className="w-4 h-4" /> {t("appSubtitle")} • Chennai Region
          </div>
          <h1 className="text-2xl md:text-4xl font-extrabold text-white">{t("howCanWeHelp")}</h1>
          <p className="text-slate-400 text-sm mt-1">
            Large icon controls & instant verification for every citizen.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Simple Mode Toggle */}
          <button
            onClick={() => setSimpleMode(!simpleMode)}
            className={`px-4 py-2.5 rounded-2xl border text-xs font-extrabold transition flex items-center gap-2 min-h-[48px] ${
              simpleMode
                ? "bg-emerald-500 text-slate-950 border-emerald-400 shadow-lg shadow-emerald-500/20"
                : "bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700"
            }`}
          >
            {simpleMode ? <ToggleRight className="w-5 h-5 text-slate-950" /> : <ToggleLeft className="w-5 h-5 text-cyan-400" />}
            <span>{simpleMode ? "✓ Simple Mode ON" : "Simple Mode"}</span>
          </button>
        </div>
      </div>

      {/* VERY SIMPLE HOME SCREEN / LOW-LITERACY CARDS GRID */}
      <div className="space-y-6 mb-12">
        {/* LARGEST PROMINENT CARD 1: VERIFY OFFICIAL */}
        <Link
          href="/verify"
          className="w-full bg-gradient-to-r from-slate-900 via-emerald-950/60 to-slate-900 p-8 rounded-3xl border-3 border-emerald-500 hover:border-emerald-400 transition flex flex-col md:flex-row items-center justify-between gap-6 group shadow-2xl shadow-emerald-500/10 min-h-[140px]"
        >
          <div className="flex items-center gap-6 text-center md:text-left">
            <div className="w-20 h-20 rounded-3xl bg-emerald-500 text-slate-950 flex items-center justify-center font-black text-4xl shrink-0 group-hover:scale-110 transition shadow-lg shadow-emerald-500/30">
              🛡️
            </div>
            <div>
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-xs font-black uppercase tracking-wider inline-block mb-1">
                RECOMMENDED ACTION
              </span>
              <h2 className="text-2xl md:text-3xl font-black text-white">{t("verifyOfficial")}</h2>
              <p className="text-slate-300 font-semibold text-sm mt-1">{t("verifyOfficialSub")}</p>
            </div>
          </div>

          <div className="px-6 py-3.5 bg-emerald-500 text-slate-950 font-black text-sm rounded-2xl group-hover:bg-emerald-400 transition shadow-lg shadow-emerald-500/20 shrink-0 min-h-[56px] flex items-center justify-center">
            {t("checkOfficial")} →
          </div>
        </Link>

        {/* 2X2 CARDS GRID (MIN 56PX TOUCH TARGETS) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Card 2: GOVT OFFICE */}
          <Link
            href="/offices"
            className="p-6 rounded-3xl bg-slate-900 border-2 border-slate-800 hover:border-cyan-500 transition flex items-center gap-5 group min-h-[100px] shadow-lg"
          >
            <div className="w-16 h-16 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-black text-3xl shrink-0 group-hover:scale-110 transition border border-cyan-500/30">
              🏛️
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-white">{t("govtOffice")}</h3>
              <p className="text-slate-400 text-xs mt-0.5">{t("govtOfficeSub")}</p>
            </div>
          </Link>

          {/* Card 3: TRAVEL */}
          <Link
            href="/mobility"
            className="p-6 rounded-3xl bg-slate-900 border-2 border-slate-800 hover:border-indigo-500 transition flex items-center gap-5 group min-h-[100px] shadow-lg"
          >
            <div className="w-16 h-16 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-black text-3xl shrink-0 group-hover:scale-110 transition border border-indigo-500/30">
              🚌
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-white">{t("travel")}</h3>
              <p className="text-slate-400 text-xs mt-0.5">{t("travelSub")}</p>
            </div>
          </Link>

          {/* Card 4: FIND NEARBY */}
          <Link
            href="/offices"
            className="p-6 rounded-3xl bg-slate-900 border-2 border-slate-800 hover:border-amber-500 transition flex items-center gap-5 group min-h-[100px] shadow-lg"
          >
            <div className="w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-black text-3xl shrink-0 group-hover:scale-110 transition border border-amber-500/30">
              🗺️
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-white">{t("findNearby")}</h3>
              <p className="text-slate-400 text-xs mt-0.5">{t("findNearbySub")}</p>
            </div>
          </Link>

          {/* Card 5: REPORT ISSUE */}
          <Link
            href="/grievances"
            className="p-6 rounded-3xl bg-slate-900 border-2 border-slate-800 hover:border-rose-500 transition flex items-center gap-5 group min-h-[100px] shadow-lg"
          >
            <div className="w-16 h-16 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center font-black text-3xl shrink-0 group-hover:scale-110 transition border border-rose-500/30">
              ⚠️
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-white">{t("reportIssue")}</h3>
              <p className="text-slate-400 text-xs mt-0.5">{t("reportIssueSub")}</p>
            </div>
          </Link>
        </div>
      </div>

      {/* MAP & NEARBY SERVICES (Hidden in Simple Mode if preferred, or shown in standard mode) */}
      {!simpleMode && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <MapPin className="w-5 h-5 text-cyan-400" /> Nearby Government Services & Bus Stops
              </h3>
              <span className="text-xs text-slate-400 font-mono">SRM Ramapuram (600089)</span>
            </div>

            <MapWrapper
              center={[13.0315, 80.1812]}
              zoom={13}
              offices={offices}
              buses={buses}
              height="480px"
            />
          </div>

          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
              <h3 className="text-sm font-bold text-white mb-3 flex items-center justify-between">
                <span>Nearby Offices</span>
                <Link href="/offices" className="text-xs text-cyan-400 hover:underline">View All</Link>
              </h3>
              <div className="space-y-3">
                {offices.slice(0, 4).map((off) => (
                  <div key={off.office_id} className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-start justify-between">
                    <div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold text-cyan-400 bg-cyan-950 border border-cyan-800">
                        {off.category}
                      </span>
                      <h5 className="font-bold text-xs text-white mt-1">{off.name}</h5>
                      <p className="text-[11px] text-slate-400 truncate max-w-[180px]">{off.address}</p>
                    </div>
                    <span className="text-[11px] font-semibold text-emerald-400 shrink-0">{off.distance_km} km</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
