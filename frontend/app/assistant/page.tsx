"use client";

import { useState } from "react";
import { 
  Bot, 
  Send, 
  Sparkles, 
  HelpCircle, 
  ShieldCheck, 
  Building2, 
  Bus, 
  Navigation
} from "lucide-react";
import GuidedWalkthroughBanner from "@/components/GuidedWalkthroughBanner";

export default function AssistantPage() {
  const [query, setQuery] = useState("Where is the nearest police station?");
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const sampleQuestions = [
    "Where is the nearest police station?",
    "How do I reach Chennai Central?",
    "Which bus is cheapest?",
    "Is officer TN-POL-10001 verified?",
    "Where is the nearest EB office?",
    "How can I report a fake officer?"
  ];

  const handleAsk = async (qText?: string) => {
    const prompt = qText || query;
    if (!prompt.trim()) return;

    setLoading(true);
    try {
      const res = await fetch("http://127.0.0.1:8000/api/assistant/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: prompt }),
      });
      const data = await res.json();
      setResponse(data);
    } catch (err: any) {
      alert("Assistant error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const walkthroughSteps = [
    { title: "CivicAI Assistant", speech: "Welcome to Ask CivicAI. You can type or select questions about government services, transit routes, or official verification." }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <GuidedWalkthroughBanner steps={walkthroughSteps} />

      {/* HEADER */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold mb-3">
          <Bot className="w-4 h-4" /> 🤖 PLATFORM INTELLIGENCE ASSISTANT
        </div>
        <h1 className="text-3xl md:text-4xl font-black text-white">Ask CivicAI</h1>
        <p className="text-slate-400 text-sm mt-2 max-w-xl mx-auto">
          Ask questions about transit, QR verification, government office locations, or civic complaints.
        </p>
      </div>

      {/* SEARCH INPUT CARD */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4 mb-8">
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask a question (e.g. Where is the nearest police station?)..."
            className="w-full pl-4 pr-24 py-4 bg-slate-900 border border-slate-700 rounded-2xl text-sm font-bold text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none min-h-[56px]"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
            <button
              onClick={() => handleAsk()}
              disabled={loading}
              className="px-4 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs rounded-xl transition flex items-center gap-1"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{loading ? "Asking..." : "Ask"}</span>
            </button>
          </div>
        </div>

        {/* QUICK SAMPLE QUESTIONS */}
        <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-400 font-semibold">Suggested Questions:</span>
          {sampleQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => { setQuery(q); handleAsk(q); }}
              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-slate-800 font-bold text-[11px]"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* ASSISTANT RESPONSE DISPLAY CARD */}
      {response && (
        <div className="glass-panel p-6 md:p-8 rounded-3xl border-2 border-cyan-500/40 space-y-5 animate-fadeIn glow-cyan">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-2xl font-black border border-cyan-500/30">
                🤖
              </div>
              <div>
                <span className="text-[10px] font-mono text-cyan-400 font-bold block uppercase">CivicAI Response</span>
                <h3 className="text-lg font-black text-white">{response.query}</h3>
              </div>
            </div>
          </div>

          <p className="text-sm font-semibold text-slate-200 bg-slate-950/80 p-5 rounded-2xl border border-slate-800 leading-relaxed">
            {response.answer}
          </p>
        </div>
      )}
    </div>
  );
}
