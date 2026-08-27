"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { 
  Navigation, 
  Bus, 
  Car, 
  Footprints, 
  DollarSign, 
  Clock, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  Zap,
  Sliders,
  Users,
  Bot,
  Send
} from "lucide-react";
import MapWrapper from "@/components/MapWrapper";
import GuidedWalkthroughBanner from "@/components/GuidedWalkthroughBanner";
import { planRoute, planTripWithGemini, getAiRouteRecommendations } from "@/lib/api";
import { useLanguage } from "@/context/LanguageContext";

function SmartMobilityContent() {
  const { t } = useLanguage();
  const searchParams = useSearchParams();
  const initialDest = searchParams.get("destination") || "Chennai Central";

  const [origin, setOrigin] = useState("SRM Ramapuram");
  const [destination, setDestination] = useState(initialDest);
  const [passengers, setPassengers] = useState(2);
  const [preference, setPreference] = useState("BALANCED");
  const [loading, setLoading] = useState(false);
  const [routeResult, setRouteResult] = useState<any>(null);

  // Gemini AI Assistant state
  const [aiPrompt, setAiPrompt] = useState("I want to visit T. Nagar market and then go to Marina Beach with 3 family members.");
  const [geminiResult, setGeminiResult] = useState<any>(null);
  const [geminiLoading, setGeminiLoading] = useState(false);

  const handlePlanRoute = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      const data = await planRoute(origin, destination, passengers, preference);
      setRouteResult(data);
    } catch (err: any) {
      alert("Error planning route: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGeminiPlan = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!aiPrompt.trim()) return;

    setGeminiLoading(true);
    try {
      const result = await planTripWithGemini(aiPrompt, origin, destination, passengers, preference);
      setGeminiResult(result);
    } catch (err: any) {
      alert("Gemini AI planning error: " + err.message);
    } finally {
      setGeminiLoading(false);
    }
  };

  useEffect(() => {
    handlePlanRoute();
    handleGeminiPlan();
  }, []);

  const walkthroughSteps = [
    { title: "Origin", speech: "First, select or speak where you are right now." },
    { title: "Destination", speech: "Now select or speak where you want to go." },
    { title: "Gemini AI", speech: "You can also ask Gemini AI to create a custom trip itinerary." }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <GuidedWalkthroughBanner steps={walkthroughSteps} />

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-800 text-xs font-black mb-2 shadow-sm">
            <Navigation className="w-4 h-4 text-amber-600" /> {t("travel")} • 3D Smart Travel Engine
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-[#212121]">Where do you want to go?</h1>
          <p className="text-zinc-600 text-sm font-semibold mt-1">
            Tap a quick destination, type your prompt, or compare Bus, Taxi, Auto, and Metro options.
          </p>
        </div>
      </div>

      {/* 4 QUICK 3D DESTINATION PRESET BUTTONS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <button
          onClick={() => { setDestination("Home / Residence Circle"); handlePlanRoute(); }}
          className="bg-white p-4 rounded-3xl text-center border border-zinc-200 shadow-sm hover:border-[#FFC107] hover:shadow-md transition group"
        >
          <div className="text-4xl mb-2 group-hover:scale-110 transition">🏠</div>
          <span className="font-black text-[#212121] text-sm block">Home</span>
          <span className="text-[10px] text-amber-700 font-bold">Quick Journey</span>
        </button>

        <button
          onClick={() => { setDestination("Work / DLF IT Park"); handlePlanRoute(); }}
          className="bg-white p-4 rounded-3xl text-center border border-zinc-200 shadow-sm hover:border-[#FFC107] hover:shadow-md transition group"
        >
          <div className="text-4xl mb-2 group-hover:scale-110 transition">💼</div>
          <span className="font-black text-[#212121] text-sm block">Work</span>
          <span className="text-[10px] text-amber-700 font-bold">DLF IT Park / Hub</span>
        </button>

        <button
          onClick={() => { setDestination("SRM Specialty Hospital"); handlePlanRoute(); }}
          className="bg-white p-4 rounded-3xl text-center border border-zinc-200 shadow-sm hover:border-[#FFC107] hover:shadow-md transition group"
        >
          <div className="text-4xl mb-2 group-hover:scale-110 transition">🏥</div>
          <span className="font-black text-[#212121] text-sm block">Hospital</span>
          <span className="text-[10px] text-amber-700 font-bold">Emergency Route</span>
        </button>

        <button
          onClick={() => { setDestination("T. Nagar Market"); handlePlanRoute(); }}
          className="bg-white p-4 rounded-3xl text-center border border-zinc-200 shadow-sm hover:border-[#FFC107] hover:shadow-md transition group"
        >
          <div className="text-4xl mb-2 group-hover:scale-110 transition">🛒</div>
          <span className="font-black text-[#212121] text-sm block">Market</span>
          <span className="text-[10px] text-amber-700 font-bold">Commercial Hub</span>
        </button>
      </div>

      {/* GEMINI AI CONVERSATIONAL TRIP PLANNER BOX */}
      <div className="bg-white p-6 md:p-8 rounded-3xl mb-8 border-2 border-[#FFC107] shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#FFC107] text-[#18181B] font-black flex items-center justify-center text-2xl shadow-md border border-amber-300">
              ✨
            </div>
            <div>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-black uppercase tracking-wider">
                POWERED BY GOOGLE GEMINI AI
              </span>
              <h2 className="text-xl font-black text-[#212121]">Ask Gemini AI Trip Planner</h2>
            </div>
          </div>
        </div>

        <form onSubmit={handleGeminiPlan} className="space-y-4">
          <div className="relative">
            <input
              type="text"
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="e.g. I want to visit T. Nagar market and Marina Beach with 3 family members..."
              className="w-full pl-4 pr-24 py-4 bg-zinc-50 border border-zinc-300 rounded-2xl text-sm font-bold text-[#212121] placeholder-zinc-400 focus:border-[#FFC107] focus:outline-none min-h-[56px] shadow-sm"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
              <button
                type="submit"
                disabled={geminiLoading}
                className="px-4 py-2.5 bg-[#FFC107] hover:bg-[#F59E0B] text-[#18181B] font-black text-xs rounded-xl transition flex items-center gap-1.5 shadow-sm"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{geminiLoading ? "Planning..." : "Ask AI"}</span>
              </button>
            </div>
          </div>
        </form>

        {/* GEMINI AI RESULT DISPLAY CARD */}
        {geminiResult && (
          <div className="p-6 bg-amber-50 border border-amber-200 rounded-2xl space-y-5 animate-fadeIn">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono text-amber-800 font-bold uppercase tracking-wider block">
                  {geminiResult.gemini_powered ? "⚡ Live Gemini 1.5 Flash Model Output" : "💡 Rule-Guided AI Engine Output"}
                </span>
                <h3 className="text-lg font-black text-[#212121]">{geminiResult.summary}</h3>
              </div>
              <div className="text-right">
                <span className="text-xs text-zinc-500 block font-semibold">Est. Cost / Time</span>
                <span className="text-base font-black text-amber-700">₹{geminiResult.estimated_cost_inr} • {geminiResult.estimated_time_mins} Mins</span>
              </div>
            </div>

            {/* ITINERARY STEPS */}
            <div className="space-y-2 pt-2 border-t border-amber-200">
              <h4 className="text-xs font-black text-amber-900 uppercase tracking-wider">Step-by-Step Itinerary:</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {geminiResult.itinerary_steps?.map((step: any) => (
                  <div key={step.step_number} className="p-3 bg-white rounded-xl border border-amber-200 flex items-start gap-3 shadow-sm">
                    <span className="text-2xl shrink-0">{step.icon || "📍"}</span>
                    <div>
                      <span className="text-[10px] font-mono text-amber-700 font-bold block">STEP #{step.step_number}</span>
                      <p className="text-xs text-[#212121] font-bold leading-snug">{step.instruction}</p>
                      <span className="text-[11px] text-zinc-600 mt-1 block font-semibold">⏱ {step.duration_mins} mins {step.cost_inr > 0 ? `• ₹${step.cost_inr}` : ""}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MULTIMODAL ROUTE FORM */}
      <div className="bg-white p-6 md:p-8 rounded-3xl mb-8 border border-zinc-200 shadow-sm space-y-6">
        <form onSubmit={handlePlanRoute} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 1. WHERE ARE YOU NOW? */}
            <div className="space-y-2">
              <label className="text-xs font-black text-amber-700 uppercase tracking-wider block flex items-center justify-between">
                <span>📍 {t("whereAreYouNow")}</span>
              </label>
              <input
                type="text"
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                className="w-full p-3.5 bg-zinc-50 border border-zinc-300 rounded-2xl text-sm font-bold text-[#212121] focus:border-[#FFC107] focus:outline-none min-h-[52px]"
                required
              />
            </div>

            {/* 2. WHERE DO YOU WANT TO GO? */}
            <div className="space-y-2">
              <label className="text-xs font-black text-amber-700 uppercase tracking-wider block flex items-center justify-between">
                <span>📍 {t("whereDoYouWantToGo")}</span>
              </label>
              <input
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="w-full p-3.5 bg-zinc-50 border border-zinc-300 rounded-2xl text-sm font-bold text-[#212121] focus:border-[#FFC107] focus:outline-none min-h-[52px]"
                required
              />
            </div>
          </div>

          {/* 3. HOW MANY PEOPLE? */}
          <div className="space-y-2 pt-2 border-t border-zinc-200">
            <label className="text-xs font-black text-amber-700 uppercase tracking-wider block">
              👥 {t("howManyPeople")}
            </label>
            <div className="flex items-center gap-3">
              {[1, 2, 3, 4].map((num) => (
                <button
                  type="button"
                  key={num}
                  onClick={() => setPassengers(num)}
                  className={`px-5 py-3 rounded-2xl border font-black text-sm transition min-h-[52px] flex items-center gap-1.5 ${
                    passengers === num
                      ? "bg-[#FFC107] text-[#18181B] border-amber-400 shadow-sm"
                      : "bg-zinc-50 text-zinc-700 border-zinc-200 hover:bg-zinc-100"
                  }`}
                >
                  <span>👤</span>
                  <span>{num} {num === 1 ? "Person" : "People"}</span>
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="clay-button-3d w-full py-4 text-[#18181B] font-black text-base rounded-2xl shadow-md min-h-[56px] flex items-center justify-center gap-2"
          >
            <span>🔎 {t("findBestWay")}</span>
          </button>
        </form>
      </div>

      {/* MULTIMODAL ROUTE CARDS */}
      {routeResult && (
        <div className="space-y-6 mb-12">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-[#212121] text-xl">Travel Options Found</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {routeResult.options.map((opt: any, idx: number) => {
              const isBest = idx === 0;
              return (
                <div
                  key={opt.mode}
                  className={`p-6 rounded-3xl border transition flex flex-col justify-between space-y-4 ${
                    isBest
                      ? "bg-white border-2 border-[#FFC107] shadow-md"
                      : "bg-white border-zinc-200 shadow-sm"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-mono font-bold text-zinc-500">OPTION #{idx + 1}</span>
                      {opt.highlight_tag && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-[#FFC107] text-[#18181B] uppercase shadow-sm">
                          {opt.highlight_tag}
                        </span>
                      )}
                    </div>

                    <h4 className="text-2xl font-black text-[#212121]">{opt.mode}</h4>
                    <p className="text-xs text-zinc-500 font-medium mb-4">{opt.route_name}</p>

                    <div className="space-y-2 text-xs border-t border-b border-zinc-200 py-3 mb-3">
                      <div className="flex items-center justify-between text-zinc-700">
                        <span className="text-zinc-500 font-medium">Time:</span>
                        <span className="font-black text-[#212121] text-sm">⏱ {opt.travel_time_mins} MINS</span>
                      </div>

                      <div className="flex items-center justify-between text-zinc-700">
                        <span className="text-zinc-500 font-medium">Fare:</span>
                        <span className="font-black text-amber-700 text-sm">₹{opt.cost_inr}</span>
                      </div>
                    </div>

                    <p className="text-xs text-zinc-600 font-medium leading-relaxed">{opt.explanation}</p>
                  </div>

                  <div className="pt-2 flex items-center justify-between border-t border-zinc-200">
                    <span className="text-[10px] font-mono text-amber-700 font-bold">Score: {opt.route_score}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default function SmartMobilityPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-slate-400">Loading Smart Mobility Optimizer...</div>}>
      <SmartMobilityContent />
    </Suspense>
  );
}
