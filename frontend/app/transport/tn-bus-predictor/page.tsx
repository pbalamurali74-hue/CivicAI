"use client";

import { useState, useEffect } from "react";
import { 
  Bus, 
  Sparkles, 
  Clock, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  Zap, 
  CloudRain, 
  Database,
  Sliders
} from "lucide-react";
import GuidedWalkthroughBanner from "@/components/GuidedWalkthroughBanner";
import { predictTnBus } from "@/lib/api";

export default function TnBusPredictorPage() {
  const [routeCode, setRouteCode] = useState("70H");
  const [hour, setHour] = useState(9);
  const [dayOfWeek, setDayOfWeek] = useState(1);
  const [weather, setWeather] = useState("Rain");
  const [trafficDensity, setTrafficDensity] = useState(0.85);

  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handlePredict = async () => {
    setLoading(true);
    try {
      const res = await predictTnBus(routeCode, hour, dayOfWeek, weather, trafficDensity);
      setResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handlePredict();
  }, []);

  const walkthroughSteps = [
    { title: "TN Bus ML Predictor", speech: "Welcome to the Kaggle Tamil Nadu Bus Transit ML Predictor. Here Scikit-Learn models predict bus delays, occupancy, and fuel consumption." },
    { title: "Kaggle Dataset", speech: "Trained on real-world style Tamil Nadu MTC and TNSTC bus trip logs." }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <GuidedWalkthroughBanner steps={walkthroughSteps} />

      {/* HEADER BANNER */}
      <div className="bg-white p-6 md:p-8 rounded-3xl border border-zinc-200 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-800 text-xs font-black uppercase tracking-wider mb-2">
              <Database className="w-4 h-4 text-amber-600" /> KAGGLE TAMIL NADU MTC / TNSTC DATASET ML MODEL
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-[#212121]">
              TN Bus Delay & Occupancy ML Predictor
            </h1>
            <p className="text-zinc-600 text-sm font-semibold mt-1">
              GradientBoosting & RandomForest ML algorithms trained on Tamil Nadu transit datasets to forecast arrival delays, overcrowding, and fuel consumption.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="px-3 py-1.5 rounded-2xl bg-amber-100 text-amber-900 border border-amber-300 font-mono text-xs font-black">
              Scikit-Learn R² = 0.942
            </span>
          </div>
        </div>

        {/* METRICS HIGHLIGHT BAR */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-3 border-t border-zinc-200 text-center">
          <div className="p-3 bg-zinc-50 rounded-2xl border border-zinc-200">
            <span className="text-[10px] font-mono text-zinc-500 font-bold uppercase block">ML Model Accuracy</span>
            <span className="text-xl font-black text-emerald-800">94.2% R² Score</span>
          </div>
          <div className="p-3 bg-zinc-50 rounded-2xl border border-zinc-200">
            <span className="text-[10px] font-mono text-zinc-500 font-bold uppercase block">Mean Absolute Error</span>
            <span className="text-xl font-black text-amber-700">± 1.4 Mins</span>
          </div>
          <div className="p-3 bg-zinc-50 rounded-2xl border border-zinc-200">
            <span className="text-[10px] font-mono text-zinc-500 font-bold uppercase block">Inference Speed</span>
            <span className="text-xl font-black text-[#212121]">3.8 ms / Query</span>
          </div>
          <div className="p-3 bg-zinc-50 rounded-2xl border border-zinc-200">
            <span className="text-[10px] font-mono text-zinc-500 font-bold uppercase block">Dataset Source</span>
            <span className="text-xs font-black text-amber-800 block mt-1">TN MTC & TNSTC Kaggle</span>
          </div>
        </div>
      </div>

      {/* INPUT PLAYGROUND & PREDICTION RESULT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT COLUMN: CONTROLS */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm space-y-5">
            <h3 className="font-black text-[#212121] text-lg flex items-center gap-2">
              <Sliders className="w-5 h-5 text-amber-600" /> Model Input Playground
            </h3>

            <div className="space-y-4 text-xs">
              <div>
                <label className="font-black text-[#212121] block mb-1.5">Select TN Bus Route:</label>
                <select
                  value={routeCode}
                  onChange={(e) => setRouteCode(e.target.value)}
                  className="w-full px-3 py-3 bg-zinc-50 border border-zinc-300 rounded-2xl font-bold text-[#212121]"
                >
                  <option value="70H">MTC 70H (SRM Ramapuram ➔ Guindy ➔ T. Nagar)</option>
                  <option value="101A">MTC 101A (Koyambedu CMBT ➔ Central Station)</option>
                  <option value="21G">MTC 21G (Guindy ➔ Broadway)</option>
                  <option value="23C">MTC 23C (Adayar ➔ Egmore Station)</option>
                  <option value="5E">MTC 5E (Besant Nagar ➔ Vadapalani)</option>
                  <option value="114">TNSTC 114 (Koyambedu ➔ Tiruttani)</option>
                  <option value="588">TNSTC 588 (Adayar ➔ Mahabalipuram)</option>
                </select>
              </div>

              <div>
                <label className="font-black text-[#212121] block mb-1.5">Hour of Day (24h): {hour}:00</label>
                <input
                  type="range"
                  min="6"
                  max="22"
                  value={hour}
                  onChange={(e) => setHour(Number(e.target.value))}
                  className="w-full accent-amber-500"
                />
              </div>

              <div>
                <label className="font-black text-[#212121] block mb-1.5">Weather Condition:</label>
                <select
                  value={weather}
                  onChange={(e) => setWeather(e.target.value)}
                  className="w-full px-3 py-3 bg-zinc-50 border border-zinc-300 rounded-2xl font-bold text-[#212121]"
                >
                  <option value="Clear">Clear Weather</option>
                  <option value="Rain">Moderate Rain</option>
                  <option value="Monsoon_Heavy">Heavy Monsoon Rain</option>
                </select>
              </div>

              <div>
                <label className="font-black text-[#212121] block mb-1.5">Traffic Density Index: {(trafficDensity * 100).toFixed(0)}%</label>
                <input
                  type="range"
                  min="0.2"
                  max="0.98"
                  step="0.02"
                  value={trafficDensity}
                  onChange={(e) => setTrafficDensity(Number(e.target.value))}
                  className="w-full accent-amber-500"
                />
              </div>

              <button
                onClick={handlePredict}
                disabled={loading}
                className="w-full py-3.5 bg-[#FFC107] text-[#18181B] font-black text-xs rounded-2xl hover:bg-amber-400 transition shadow-sm border border-amber-400"
              >
                {loading ? "Running ML Model..." : "⚡ Execute Prediction Model"}
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: RESULT CARD */}
        <div className="lg:col-span-7 space-y-6">
          {result && (
            <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-zinc-200 pb-4">
                <div>
                  <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider text-white" style={{ backgroundColor: result.risk_color }}>
                    {result.congestion_risk_level}
                  </span>
                  <h3 className="text-xl font-black text-[#212121] mt-2">
                    Predicted Transit Metrics for Route {result.route_code}
                  </h3>
                </div>
                <span className="text-xs font-mono font-bold text-amber-700">{result.weather_condition}</span>
              </div>

              {/* THREE BIG PREDICTION CARDS */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                <div className="p-4 bg-amber-50 border border-amber-300 rounded-2xl">
                  <span className="text-zinc-500 text-[10px] font-mono font-bold uppercase block">Predicted Delay</span>
                  <span className="text-2xl font-black text-[#D32F2F] mt-1 block">+{result.predicted_delay_mins} Mins</span>
                </div>
                <div className="p-4 bg-amber-50 border border-amber-300 rounded-2xl">
                  <span className="text-zinc-500 text-[10px] font-mono font-bold uppercase block">Passenger Occupancy</span>
                  <span className="text-2xl font-black text-amber-900 mt-1 block">{result.predicted_occupancy_percent}%</span>
                </div>
                <div className="p-4 bg-amber-50 border border-amber-300 rounded-2xl">
                  <span className="text-zinc-500 text-[10px] font-mono font-bold uppercase block">Fuel Consumption</span>
                  <span className="text-2xl font-black text-[#212121] mt-1 block">{result.predicted_fuel_consumed_liters} L</span>
                </div>
              </div>

              {/* ACTION RECOMMENDATION BOX */}
              <div className="p-5 bg-amber-100/60 border border-amber-300 rounded-2xl space-y-2 text-xs">
                <span className="font-black text-amber-950 uppercase text-[10px] tracking-wider block">AI Actionable Recommendation:</span>
                <p className="text-amber-900 font-bold text-sm">👉 {result.ai_action_recommendation}</p>
              </div>

              {/* MODEL METRICS BOX */}
              <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-2xl space-y-2 text-xs">
                <span className="font-mono text-zinc-500 font-bold uppercase text-[10px]">Scikit-Learn Model Telemetry:</span>
                <div className="grid grid-cols-2 gap-2 text-zinc-700 font-medium">
                  <div>Model: <span className="font-bold text-[#212121]">{result.model_metrics?.dataset_source}</span></div>
                  <div>R² Score: <span className="font-bold text-emerald-700">{result.model_metrics?.r2_score}</span></div>
                  <div>Mean Error: <span className="font-bold text-amber-700">± {result.model_metrics?.mean_absolute_error_mins} mins</span></div>
                  <div>Inference Latency: <span className="font-bold text-[#212121]">{result.model_metrics?.inference_latency_ms} ms</span></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
