"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  ShieldAlert, 
  Phone, 
  MapPin, 
  Navigation, 
  Clock, 
  CheckCircle2, 
  Building2
} from "lucide-react";
import GuidedWalkthroughBanner from "@/components/GuidedWalkthroughBanner";
import { getNearbyOffices } from "@/lib/api";
import { useLanguage } from "@/context/LanguageContext";

export default function EmergencyHelpPage() {
  const { t } = useLanguage();
  const [selectedService, setSelectedService] = useState("Police");
  const [offices, setOffices] = useState<any[]>([]);

  const helpServices = [
    { code: "Police", label: "Police Station", icon: "👮", phone: "100" },
    { code: "Hospital", label: "Hospital / Ambulance", icon: "🏥", phone: "108" },
    { code: "Fire", label: "Fire & Rescue", icon: "🚒", phone: "101" },
    { code: "EB", label: "Electricity / EB", icon: "⚡", phone: "1912" },
    { code: "Municipality", label: "Government Office", icon: "🏛️", phone: "1913" },
    { code: "Transport", label: "Bus / Transport Help", icon: "🚌", phone: "149" },
  ];

  useEffect(() => {
    getNearbyOffices(13.0315, 80.1812, selectedService)
      .then((data) => setOffices(data || []))
      .catch((err) => console.error(err));
  }, [selectedService]);

  const walkthroughSteps = [
    { title: "I Need Help", speech: "Tap an emergency icon below to find the nearest police station, hospital, or electricity office." }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <GuidedWalkthroughBanner steps={walkthroughSteps} />

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 bg-gradient-to-r from-slate-900 via-rose-950/70 to-slate-900 p-6 md:p-8 rounded-3xl border-3 border-rose-500/50 glow-rose shadow-2xl">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-rose-500 text-white text-xs font-black uppercase tracking-wider mb-2">
            <ShieldAlert className="w-4 h-4" /> 🆘 EMERGENCY & CIVIC SERVICE DISCOVERY
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white">I NEED HELP</h1>
          <p className="text-slate-300 text-sm mt-1">
            Tap any service icon below to locate the nearest station, view phone numbers, and get instant directions.
          </p>
        </div>
      </div>

      {/* LARGE SERVICE SELECTION BUTTONS (MIN 56PX TOUCH TARGETS) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {helpServices.map((serv) => (
          <button
            key={serv.code}
            onClick={() => setSelectedService(serv.code)}
            className={`p-6 rounded-3xl border-2 transition flex flex-col items-center justify-center gap-3 min-h-[110px] ${
              selectedService === serv.code
                ? "bg-rose-500 text-slate-950 border-rose-400 font-black shadow-xl shadow-rose-500/30 scale-105"
                : "glass-panel border-slate-800 hover:border-slate-700"
            }`}
          >
            <span className="text-4xl">{serv.icon}</span>
            <span className="text-xs font-bold text-center leading-tight">{serv.label}</span>
          </button>
        ))}
      </div>

      {/* EMERGENCY RESULTS */}
      <div className="space-y-4">
        <h3 className="text-xl font-black text-white flex items-center justify-between">
          <span>Nearest {selectedService} Services Found</span>
          <span className="text-xs font-mono text-emerald-400">📍 Distance Sorted</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {offices.map((off) => {
            return (
              <div key={off.office_id} className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-xl text-xs font-black text-rose-400 bg-rose-950 border border-rose-800">
                    {off.category}
                  </span>
                  <span className="text-sm font-black text-emerald-400 font-mono">📍 {off.distance_km} km</span>
                </div>

                <div>
                  <h4 className="text-xl font-black text-white">{off.name}</h4>
                  <p className="text-xs text-slate-300 mt-1">{off.address}</p>
                </div>

                <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800 flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400">Direct Helpline:</span>
                  <a href={`tel:${off.phone}`} className="font-bold text-cyan-400 text-sm hover:underline flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5" /> {off.phone}
                  </a>
                </div>

                <div className="flex items-center justify-end pt-2 border-t border-slate-800">
                  <Link
                    href={`/mobility?destination=${encodeURIComponent(off.name)}`}
                    className="px-4 py-2 bg-cyan-500 text-slate-950 font-black text-xs rounded-xl hover:bg-cyan-400 transition flex items-center gap-1 min-h-[44px]"
                  >
                    <Navigation className="w-4 h-4 text-slate-950" />
                    <span>DIRECTIONS</span>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
