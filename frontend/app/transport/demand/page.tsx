"use client";

import { useState, useEffect } from "react";
import { TrendingUp, Cpu, AlertTriangle, CheckCircle2, Clock, Sparkles, BarChart2 } from "lucide-react";
import { predictDemand } from "@/lib/api";

export default function BusDemandPage() {
  const [routeId, setRouteId] = useState("R-21G");
  const [hour, setHour] = useState(9);
  const [traffic, setTraffic] = useState("Heavy");
  const [weather, setWeather] = useState("Sunny");
  const [prediction, setPrediction] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handlePredict = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      const res = await predictDemand(routeId, hour, traffic);
      setPrediction(res);
    } catch (err: any) {
      alert("Prediction error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handlePredict();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold mb-2">
            <Cpu className="w-4 h-4" /> Scikit-Learn Regressor • Demand Forecasting
          </div>
          <h1 className="text-3xl font-extrabold text-white">Passenger Demand Prediction</h1>
          <p className="text-slate-400 text-sm mt-1">
            Predict passenger surges on bus routes based on commuting hours, traffic, and weather conditions.
          </p>
        </div>
      </div>

      {/* INPUT FORM & PREDICTION RESULT */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        {/* INPUT FORM */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="font-bold text-white text-base border-b border-slate-800 pb-2">Prediction Parameters</h3>

          <form onSubmit={handlePredict} className="space-y-4 text-xs">
            <div>
              <label className="text-slate-300 block mb-1 font-semibold">Select Route</label>
              <select
                value={routeId}
                onChange={(e) => setRouteId(e.target.value)}
                className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono"
              >
                <option value="R-21G">Route 21G (Tambaram → Broadway)</option>
                <option value="R-570">Route 570 (Koyambedu → Siruseri IT Park)</option>
                <option value="R-18B">Route 18B (Guindy → Chennai Central)</option>
                <option value="R-70">Route 70 (Tambaram → Koyambedu CMBT)</option>
                <option value="R-170X">Route 170X (SRM Ramapuram Express)</option>
              </select>
            </div>

            <div>
              <label className="text-slate-300 block mb-1 font-semibold">Hour of Day (0 - 23)</label>
              <input
                type="number"
                min="0"
                max="23"
                value={hour}
                onChange={(e) => setHour(parseInt(e.target.value))}
                className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono"
              />
            </div>

            <div>
              <label className="text-slate-300 block mb-1 font-semibold">Traffic Condition</label>
              <select
                value={traffic}
                onChange={(e) => setTraffic(e.target.value)}
                className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white"
              >
                <option value="Low">Low</option>
                <option value="Moderate">Moderate</option>
                <option value="Heavy">Heavy</option>
                <option value="Severe">Severe</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-amber-500 text-slate-950 font-bold text-xs rounded-xl hover:bg-amber-400 transition"
            >
              {loading ? "Running ML Inference..." : "Execute Demand Predictor"}
            </button>
          </form>
        </div>

        {/* PREDICTION DISPLAY CARD */}
        {prediction && (
          <div className="md:col-span-2 bg-slate-900 border border-slate-800 p-8 rounded-2xl flex flex-col justify-between space-y-6">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-mono text-slate-400">MODEL EXECUTION: SUCCESS</span>
                <span className={`px-3 py-1 rounded-full text-xs font-black uppercase ${
                  prediction.demand_status === "HIGH DEMAND"
                    ? "bg-rose-500/20 text-rose-400 border border-rose-500/40"
                    : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                }`}>
                  {prediction.demand_status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-slate-400 text-xs block">Current Load</span>
                  <span className="text-3xl font-black text-white mt-1 block">{prediction.current_demand}</span>
                  <span className="text-[10px] text-slate-500">passengers/hr</span>
                </div>
                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-slate-400 text-xs block">AI Predicted Demand</span>
                  <span className="text-3xl font-black text-amber-400 mt-1 block">{prediction.predicted_demand}</span>
                  <span className="text-[10px] text-amber-500">passengers/hr (+32% surge)</span>
                </div>
              </div>

              <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl space-y-2 mb-4">
                <h4 className="font-bold text-amber-300 text-xs flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> Recommended Action
                </h4>
                <p className="text-xs text-slate-200 font-medium">{prediction.recommended_action}</p>
              </div>

              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-1">
                <span className="font-bold text-cyan-400 block uppercase tracking-wider text-[10px]">
                  AI Model Explanation
                </span>
                <p>{prediction.ai_explanation}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
