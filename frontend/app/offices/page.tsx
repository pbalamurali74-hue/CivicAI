"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Building2, 
  Search, 
  MapPin, 
  Phone, 
  Clock, 
  Navigation, 
  Sparkles,
  FileText,
  CheckCircle2,
  HelpCircle,
  Compass
} from "lucide-react";
import MapWrapper from "@/components/MapWrapper";
import GuidedWalkthroughBanner from "@/components/GuidedWalkthroughBanner";
import { getNearbyOffices, getOfficeProcedureAi } from "@/lib/api";
import { useLanguage } from "@/context/LanguageContext";

export default function GovernmentOfficeLocatorPage() {
  const { t } = useLanguage();
  const [offices, setOffices] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [pincode, setPincode] = useState("600089");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedOffice, setSelectedOffice] = useState<any>(null);

  // AI Procedure Query Assistant State
  const [aiQuery, setAiQuery] = useState("");
  const [aiResult, setAiResult] = useState<any>(null);
  const [aiLoading, setAiLoading] = useState(false);

  const iconCategories = [
    { code: "All", label: "All", icon: "🏢" },
    { code: "Police", label: t("police"), icon: "👮" },
    { code: "Hospital", label: t("hospital"), icon: "🏥" },
    { code: "EB", label: t("electricity"), icon: "⚡" },
    { code: "SRO", label: t("registration"), icon: "📄" },
    { code: "Transport", label: "Transport (RTO)", icon: "🚌" },
    { code: "Municipality", label: "Municipality", icon: "🏛️" },
    { code: "Attraction", label: "Attractions", icon: "🏖️" }
  ];

  const fetchOffices = async () => {
    setLoading(true);
    try {
      const data = await getNearbyOffices(13.0315, 80.1812, selectedCategory);
      let filtered = data || [];
      if (pincode) {
        filtered = filtered.filter((o: any) => o.pincode === pincode.trim());
      }
      if (search) {
        filtered = filtered.filter((o: any) => 
          o.name.toLowerCase().includes(search.toLowerCase()) || 
          o.address.toLowerCase().includes(search.toLowerCase())
        );
      }
      setOffices(filtered);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffices();
  }, [selectedCategory]);

  const handleProcedureQuery = async (queryText: string) => {
    if (!queryText.trim()) return;
    setAiLoading(true);
    setAiQuery(queryText);
    try {
      const res = await getOfficeProcedureAi(queryText, selectedCategory);
      setAiResult(res);
    } catch (err) {
      console.error("AI Procedure Query error:", err);
    } finally {
      setAiLoading(false);
    }
  };

  const walkthroughSteps = [
    { title: "Select Category", speech: "Tap an icon to choose what you need: Police, Hospital, Electricity, Registration, or Attractions." },
    { title: "Find Distance", speech: "View nearby locations with distance in kilometers and tap directions." },
    { title: "AI Procedure Helper", speech: "Ask our AI Assistant for step-by-step government office procedures and required documents." }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <GuidedWalkthroughBanner steps={walkthroughSteps} />

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 md:p-8 rounded-3xl border border-zinc-200 shadow-sm">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-800 text-xs font-black mb-2 shadow-sm">
            <Building2 className="w-4 h-4 text-amber-600" /> CIVIC WORKPLACES & ATTRACTIONS LOCATOR
          </div>
          <h1 className="text-3xl font-black text-[#212121]">Workplace Locator & Landmark Discovery</h1>
          <p className="text-zinc-600 text-sm font-semibold mt-1">
            Discover nearby government offices, hospitals, police stations, and major city attractions.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="px-3 py-1.5 rounded-2xl bg-amber-100 text-amber-900 border border-amber-300 font-mono text-xs font-black">
            📍 SRM Ramapuram Base • 15 km Radius
          </span>
        </div>
      </div>

      {/* ICON-FIRST CATEGORY SELECTION CARDS */}
      <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm space-y-6">
        <h3 className="font-black text-[#212121] text-base tracking-wider uppercase flex items-center gap-2">
          <span>Filter by Category & Attractions</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {iconCategories.map((item) => (
            <button
              key={item.code}
              onClick={() => setSelectedCategory(item.code)}
              className={`p-3.5 rounded-2xl border transition flex flex-col items-center justify-center gap-2 min-h-[90px] ${
                selectedCategory === item.code
                  ? "bg-[#FFC107] text-[#18181B] border-amber-400 font-black shadow-sm scale-105"
                  : "bg-zinc-50 text-zinc-700 border-zinc-200 hover:bg-zinc-100"
              }`}
            >
              <span className="text-3xl">{item.icon}</span>
              <span className="text-xs font-bold text-center leading-tight">{item.label}</span>
            </button>
          ))}
        </div>

        {/* INPUTS ROW */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-zinc-200">
          <div className="relative">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search office or attraction name..."
              className="w-full pl-9 pr-3 py-3 bg-zinc-50 border border-zinc-300 rounded-2xl text-xs text-[#212121] placeholder-zinc-400 focus:outline-none focus:border-[#FFC107] min-h-[48px]"
            />
          </div>

          <div>
            <input
              type="text"
              value={pincode}
              onChange={(e) => setPincode(e.target.value)}
              placeholder="Pincode (e.g. 600089)"
              className="w-full px-3 py-3 bg-zinc-50 border border-zinc-300 rounded-2xl text-xs text-[#212121] font-mono placeholder-zinc-400 focus:outline-none focus:border-[#FFC107] min-h-[48px]"
            />
          </div>

          <button
            onClick={fetchOffices}
            className="w-full py-3 bg-[#FFC107] text-[#18181B] font-black text-xs rounded-2xl hover:bg-[#F59E0B] transition min-h-[48px] shadow-sm"
          >
            {loading ? "Searching..." : "Apply Filter"}
          </button>
        </div>
      </div>

      {/* AI GOVERNMENT SERVICE PROCEDURE & DOCUMENT ASSISTANT CARD */}
      <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-2xl bg-[#FFC107] text-[#18181B] font-black flex items-center justify-center text-lg shadow-sm border border-amber-300">
              ✨
            </div>
            <div>
              <h3 className="text-lg font-black text-[#212121]">AI Government Procedure & Document Assistant</h3>
              <p className="text-xs text-zinc-500 font-medium">Type any query to get step-by-step government procedures and document checklists</p>
            </div>
          </div>

          {/* Quick Query Pill Buttons */}
          <div className="flex items-center gap-2 overflow-x-auto text-xs">
            <button
              onClick={() => handleProcedureQuery("How to apply for Driving License at RTO?")}
              className="px-3 py-1.5 rounded-xl bg-amber-50 text-amber-900 border border-amber-300 font-bold hover:bg-amber-100 shrink-0"
            >
              🚗 Driving License (RTO)
            </button>
            <button
              onClick={() => handleProcedureQuery("Property Registration procedure at SRO")}
              className="px-3 py-1.5 rounded-xl bg-amber-50 text-amber-900 border border-amber-300 font-bold hover:bg-amber-100 shrink-0"
            >
              📜 Property Sale Deed (SRO)
            </button>
            <button
              onClick={() => handleProcedureQuery("Police Complaint and FIR procedure")}
              className="px-3 py-1.5 rounded-xl bg-amber-50 text-amber-900 border border-amber-300 font-bold hover:bg-amber-100 shrink-0"
            >
              👮 Police NOC / FIR
            </button>
          </div>
        </div>

        {/* Query Input Box */}
        <div className="flex gap-2">
          <input
            type="text"
            value={aiQuery}
            onChange={(e) => setAiQuery(e.target.value)}
            placeholder="Ask AI: 'What documents do I need for Driving License?' or 'Property Registration procedure'..."
            className="flex-1 px-4 py-3 bg-zinc-50 border border-zinc-300 rounded-2xl text-xs text-[#212121] placeholder-zinc-400 focus:outline-none focus:border-[#FFC107]"
          />
          <button
            onClick={() => handleProcedureQuery(aiQuery)}
            className="px-6 py-3 bg-[#FFC107] text-[#18181B] font-black text-xs rounded-2xl hover:bg-amber-400 shadow-sm shrink-0"
          >
            {aiLoading ? "Consulting AI..." : "Get Procedure →"}
          </button>
        </div>

        {/* AI PROCEDURE RESULT DISPLAY CARD */}
        {aiResult && (
          <div className="p-5 bg-amber-50 border border-amber-300 rounded-2xl space-y-4 text-xs mt-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-200 pb-3">
              <div>
                <span className="px-2.5 py-0.5 rounded-full bg-[#FFC107] text-[#18181B] font-black uppercase text-[10px]">
                  {aiResult.office_category}
                </span>
                <h4 className="text-base font-black text-[#212121] mt-1">{aiResult.title}</h4>
              </div>

              <div className="flex items-center gap-3 text-right">
                <div>
                  <span className="text-[10px] text-zinc-500 font-medium block">Est. Queue Time</span>
                  <span className="font-black text-[#D32F2F] text-xs">⏱ {aiResult.estimated_queue_mins} Mins</span>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 font-medium block">Best Visit Time</span>
                  <span className="font-black text-emerald-800 text-xs">🕒 {aiResult.best_visit_time}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* STEPS COLUMN */}
              <div className="space-y-2">
                <span className="font-black text-[#212121] uppercase text-[10px] tracking-wider block">Step-by-Step Procedure:</span>
                {aiResult.steps?.map((st: string, idx: number) => (
                  <div key={idx} className="p-2.5 bg-white rounded-xl border border-amber-200 font-medium text-zinc-800">
                    {st}
                  </div>
                ))}
              </div>

              {/* REQUIRED DOCUMENTS COLUMN */}
              <div className="space-y-2">
                <span className="font-black text-[#212121] uppercase text-[10px] tracking-wider block">Required Documents & Fee Checklist:</span>
                <div className="p-3 bg-white rounded-xl border border-amber-200 space-y-2">
                  <div className="font-bold text-amber-900">Official Fee: ₹{aiResult.fee_inr}</div>
                  <ul className="space-y-1 text-zinc-700">
                    {aiResult.documents_required?.map((doc: string, idx: number) => (
                      <li key={idx} className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{doc}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MAP & CARDS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <MapWrapper
            center={[13.0315, 80.1812]}
            zoom={13}
            offices={offices}
            height="550px"
            onOfficeSelect={(off) => setSelectedOffice(off)}
          />
        </div>

        <div className="space-y-4 max-h-[550px] overflow-y-auto pr-1">
          <h3 className="font-black text-[#212121] text-sm flex items-center justify-between">
            <span>Results ({offices.length})</span>
            <span className="text-xs text-zinc-500 font-mono">Distance Sorted</span>
          </h3>

          {offices.map((off) => (
            <div
              key={off.office_id}
              className={`p-5 rounded-3xl border transition space-y-3 ${
                selectedOffice?.office_id === off.office_id
                  ? "bg-white border-2 border-[#FFC107] shadow-md"
                  : "bg-white border-zinc-200 shadow-sm"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <span className="px-2.5 py-1 rounded-xl text-xs font-black text-amber-900 bg-amber-100 border border-amber-300">
                  {off.category}
                </span>
                <span className="text-sm font-black text-amber-700 font-mono">
                  📍 {off.distance_km} km
                </span>
              </div>

              <div>
                <h4 className="font-black text-base text-[#212121]">{off.name}</h4>
                <p className="text-xs text-zinc-600 font-medium mt-0.5">{off.address}</p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-zinc-200">
                <button
                  onClick={() => handleProcedureQuery(`${off.name} procedure and required documents`)}
                  className="text-xs font-black text-amber-800 hover:underline flex items-center gap-1"
                >
                  <FileText className="w-3.5 h-3.5 text-amber-600" /> Procedure Info
                </button>
                <Link
                  href={`/mobility?destination=${encodeURIComponent(off.name)}`}
                  className="px-4 py-2 bg-[#FFC107] text-[#18181B] font-black text-xs rounded-xl hover:bg-[#F59E0B] transition flex items-center gap-1 min-h-[44px] shadow-sm"
                >
                  <Navigation className="w-4 h-4 text-[#18181B]" />
                  <span>DIRECTIONS</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
