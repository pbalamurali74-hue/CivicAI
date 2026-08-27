"use client";

import { useState, useEffect } from "react";
import { 
  Sparkles, 
  MapPin, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Navigation, 
  DollarSign, 
  Clock, 
  Download,
  Share2,
  Bus,
  Car,
  Table,
  ArrowDown
} from "lucide-react";
import GuidedWalkthroughBanner from "@/components/GuidedWalkthroughBanner";
import { manageTripWithGemini } from "@/lib/api";
import { useLanguage } from "@/context/LanguageContext";

export default function TripManagerPage() {
  const { t, language } = useLanguage();

  const [title, setTitle] = useState("Chennai Family Outing");
  const [origin, setOrigin] = useState("SRM Ramapuram");
  const [destination, setDestination] = useState("Tirupati");
  const [intermediateStops, setIntermediateStops] = useState<string[]>([
    "Koyambedu CMBT"
  ]);
  const [newStopInput, setNewStopInput] = useState("");
  const [budgetInr, setBudgetInr] = useState(500);
  const [notes, setNotes] = useState("Avoid heavy traffic and prefer AC buses or Metro if possible.");

  const [loading, setLoading] = useState(false);
  const [tripData, setTripData] = useState<any>(null);

  const handleAddIntermediateStop = () => {
    if (newStopInput.trim()) {
      setIntermediateStops([...intermediateStops, newStopInput.trim()]);
      setNewStopInput("");
    }
  };

  const handleRemoveIntermediateStop = (index: number) => {
    setIntermediateStops(intermediateStops.filter((_, i) => i !== index));
  };

  const handleOptimizeTrip = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!origin || !destination) {
      alert("Please specify a starting point and a final destination.");
      return;
    }

    const allStops = [...intermediateStops, destination];

    setLoading(true);
    try {
      const res = await manageTripWithGemini(title, origin, allStops, budgetInr, 1, notes);
      setTripData(res);
    } catch (err: any) {
      alert("Gemini Trip Manager error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleOptimizeTrip();
  }, []);

  const walkthroughSteps = [
    { title: "Trip Manager", speech: "Welcome to Gemini AI Trip Manager. Set your starting point, final destination, and intermediate stops." },
    { title: "Optimize", speech: "Tap Optimize Trip with Gemini AI to get exact Tamil Nadu bus numbers or step-by-step inter-state guides." }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <GuidedWalkthroughBanner steps={walkthroughSteps} />

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 p-6 md:p-8 rounded-3xl border-2 border-indigo-500/30 glow-indigo shadow-2xl">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 text-xs font-black uppercase tracking-wider mb-2">
            <Sparkles className="w-4 h-4 text-indigo-400" /> EMBEDDED GEMINI AI TRIP MANAGER
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white">Smart Trip Manager</h1>
          <p className="text-slate-300 text-sm mt-1">
            Tamil Nadu bus numbers for in-state stops • Step-by-step guides & real fares for out-of-state destinations.
          </p>
        </div>
      </div>

      {/* MULTI-STOP TRIP MANAGER FORM */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
        {/* LEFT COLUMN: CONTROLS */}
        <div className="lg:col-span-5 space-y-6">
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-5">
            <h3 className="font-black text-white text-lg flex items-center gap-2">
              <span>🗺️ Configure Your Route</span>
            </h3>

            {/* TRIP TITLE */}
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Trip Name</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-3 bg-slate-900 border border-slate-700 rounded-2xl text-xs font-bold text-white focus:border-indigo-400 min-h-[48px]"
              />
            </div>

            {/* STARTING POINT (ORIGIN) */}
            <div className="p-4 bg-slate-900/90 border-2 border-cyan-500/40 rounded-2xl space-y-2">
              <label className="text-xs font-bold text-cyan-400 block flex items-center justify-between">
                <span>📍 Starting Point (Origin)</span>
              </label>
              <input
                type="text"
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                placeholder="e.g. SRM Ramapuram, Guindy..."
                className="w-full p-3 bg-slate-950 border border-slate-700 rounded-xl text-xs font-bold text-white focus:border-cyan-400 min-h-[44px]"
              />
            </div>

            {/* ADD INTERMEDIATE STOPS (+ BUTTON) */}
            <div className="space-y-3 pt-2 border-t border-slate-800">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-amber-400 block">
                  🛑 Intermediate Stops ({intermediateStops.length})
                </label>
                <span className="text-[10px] text-slate-400 font-mono">Optional stops in between</span>
              </div>

              {/* LIST OF INTERMEDIATE STOPS */}
              {intermediateStops.length > 0 && (
                <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                  {intermediateStops.map((stop, idx) => (
                    <div key={idx} className="p-3 bg-slate-900/90 border border-amber-500/30 rounded-xl flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 text-[10px] font-mono font-bold flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <span className="text-xs font-bold text-white truncate max-w-[200px]">{stop}</span>
                      </div>
                      <button
                        onClick={() => handleRemoveIntermediateStop(idx)}
                        className="p-1 text-slate-500 hover:text-rose-400"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* ADD STOP INPUT WITH + SYMBOL */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newStopInput}
                  onChange={(e) => setNewStopInput(e.target.value)}
                  placeholder="Add stop in between (e.g. Koyambedu CMBT)..."
                  className="flex-grow p-3 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:border-amber-400 min-h-[44px]"
                />
                <button
                  type="button"
                  onClick={handleAddIntermediateStop}
                  className="px-4 py-3 bg-amber-500 text-slate-950 font-black text-sm rounded-xl hover:bg-amber-400 transition flex items-center gap-1 min-h-[44px]"
                  title="Add Intermediate Stop"
                >
                  <Plus className="w-5 h-5" />
                  <span className="text-xs">Add</span>
                </button>
              </div>
            </div>

            {/* FINAL DESTINATION */}
            <div className="p-4 bg-slate-900/90 border-2 border-emerald-500/40 rounded-2xl space-y-2">
              <label className="text-xs font-bold text-emerald-400 block flex items-center justify-between">
                <span>🏁 Final Destination</span>
              </label>
              <input
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="e.g. Tirupati, Marina Beach, Bengaluru..."
                className="w-full p-3 bg-slate-950 border border-slate-700 rounded-xl text-xs font-bold text-white focus:border-emerald-400 min-h-[44px]"
              />
            </div>

            {/* BUDGET */}
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Target Budget (₹)</label>
              <input
                type="number"
                value={budgetInr}
                onChange={(e) => setBudgetInr(parseInt(e.target.value))}
                className="w-full p-3 bg-slate-900 border border-slate-700 rounded-2xl text-xs font-bold text-emerald-400 min-h-[48px]"
              />
            </div>

            {/* NOTES FOR GEMINI */}
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Gemini AI Preferences</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Special notes for Gemini..."
                className="w-full p-3 bg-slate-900 border border-slate-700 rounded-2xl text-xs text-white h-16"
              />
            </div>

            <button
              onClick={() => handleOptimizeTrip()}
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-indigo-500 to-cyan-500 text-slate-950 font-black text-sm rounded-2xl hover:scale-[1.02] transition shadow-xl shadow-indigo-500/25 min-h-[56px] flex items-center justify-center gap-2"
            >
              <span>✨ {loading ? "Gemini AI Optimizing..." : "OPTIMIZE TRIP WITH GEMINI AI"}</span>
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: GEMINI AI ITINERARY RESULTS */}
        <div className="lg:col-span-7 space-y-6">
          {tripData ? (
            <div className="space-y-6 animate-fadeIn">
              {/* SUMMARY STATS BAR */}
              <div className="glass-panel p-6 rounded-3xl border-2 border-indigo-500/40 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
                  <div>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-black uppercase tracking-wider">
                      {tripData.overall_status}
                    </span>
                    <h2 className="text-2xl font-black text-white mt-1">{tripData.title}</h2>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => alert("Itinerary saved to citizen profile!")}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-400 rounded-xl text-xs font-bold flex items-center gap-1 border border-slate-700"
                    >
                      <Download className="w-3.5 h-3.5" /> Export
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 block font-mono">Total Distance</span>
                    <span className="text-base font-black text-white">{tripData.total_distance_km} km</span>
                  </div>
                  <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 block font-mono">Total Fare</span>
                    <span className="text-base font-black text-emerald-400">₹{tripData.total_cost_inr}</span>
                  </div>
                  <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 block font-mono">Total Duration</span>
                    <span className="text-base font-black text-cyan-400">{tripData.total_duration_hours} hrs</span>
                  </div>
                </div>

                {/* GEMINI AI REASONING ALERT BOX */}
                <div className="p-4 bg-indigo-950/60 border border-indigo-500/30 rounded-2xl text-xs text-indigo-200 space-y-1">
                  <div className="flex items-center gap-1.5 text-indigo-400 font-extrabold">
                    <Sparkles className="w-4 h-4" /> Gemini AI State-Aware Transit Intelligence:
                  </div>
                  <p className="leading-relaxed">{tripData.gemini_optimization_reasoning}</p>
                </div>
              </div>

              {/* DESTINATION DISTANCE & FARE MATRIX TABLE */}
              <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
                <h3 className="font-extrabold text-white text-base flex items-center justify-between">
                  <span>📊 Destination Distance & Fare Matrix</span>
                  <span className="text-xs font-mono text-emerald-400 font-bold">Calculated Per Leg</span>
                </h3>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-950 text-slate-400 font-mono border-b border-slate-800 uppercase text-[10px]">
                      <tr>
                        <th className="p-3">Leg</th>
                        <th className="p-3">From ➔ To</th>
                        <th className="p-3">Distance</th>
                        <th className="p-3">Fare</th>
                        <th className="p-3">Bus Number / Transit Mode</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 text-slate-300">
                      {tripData.schedule?.map((leg: any) => (
                        <tr key={leg.leg_number} className="hover:bg-slate-800/40 transition">
                          <td className="p-3 font-mono font-bold text-indigo-400">#{leg.leg_number}</td>
                          <td className="p-3 font-bold text-white">{leg.from} ➔ {leg.to}</td>
                          <td className="p-3 font-mono font-bold text-cyan-400">{leg.distance_km || "—"} km</td>
                          <td className="p-3 font-mono font-bold text-emerald-400">₹{leg.cost_inr}</td>
                          <td className="p-3 text-slate-300 font-semibold">{leg.recommended_mode}</td>
                        </tr>
                      ))}
                      <tr className="bg-slate-950/80 font-bold text-white border-t border-slate-700">
                        <td className="p-3 font-mono">TOTAL</td>
                        <td className="p-3">{tripData.schedule?.length} Destination Leg(s)</td>
                        <td className="p-3 font-mono text-cyan-400">{tripData.total_distance_km} km</td>
                        <td className="p-3 font-mono text-emerald-400">₹{tripData.total_cost_inr}</td>
                        <td className="p-3 text-slate-400">{tripData.total_duration_hours} Total Hours</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* TIMED SCHEDULE LEGS */}
              <div className="space-y-4">
                <h3 className="font-extrabold text-white text-base flex items-center justify-between">
                  <span>Optimized Schedule & Step-by-Step Route Guides ({tripData.schedule?.length})</span>
                  <span className="text-xs font-mono text-cyan-400 font-bold">Sequential Order</span>
                </h3>

                {tripData.schedule?.map((leg: any) => (
                  <div key={leg.leg_number} className="glass-panel p-5 rounded-3xl border border-slate-800 space-y-3 hover:border-indigo-500/50 transition">
                    <div className="flex items-center justify-between text-xs">
                      <span className="px-3 py-1 rounded-xl bg-indigo-500/20 text-indigo-300 font-mono font-bold border border-indigo-500/30">
                        LEG #{leg.leg_number} • {leg.time_slot}
                      </span>
                      <div className="flex items-center gap-2">
                        {leg.distance_km && (
                          <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 font-mono font-bold border border-cyan-500/30 text-xs">
                            📏 {leg.distance_km} km
                          </span>
                        )}
                        <span className="font-black text-emerald-400 text-sm font-mono">₹{leg.cost_inr}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-black text-lg shrink-0 border border-cyan-500/30">
                        🚌
                      </div>
                      <div className="flex-grow">
                        <h4 className="font-extrabold text-white text-sm">{leg.from} → {leg.to}</h4>
                        <p className="text-xs text-cyan-400 font-bold mt-0.5">{leg.recommended_mode} ({leg.duration_mins} mins)</p>
                      </div>
                    </div>

                    <p className="text-xs text-slate-200 bg-slate-950/80 p-4 rounded-2xl border border-slate-800/80 leading-relaxed font-medium">
                      💡 {leg.gemini_advice}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="glass-panel p-12 rounded-3xl border border-slate-800 text-center space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto text-3xl">
                ✨
              </div>
              <h3 className="text-lg font-bold text-white">Configure your starting point and destination</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Gemini AI will output specific bus numbers for Tamil Nadu destinations and step-by-step transit guides for out-of-state locations.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
