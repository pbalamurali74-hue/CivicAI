"use client";

import { useState } from "react";
import { 
  Eye, 
  Volume2, 
  Type, 
  Sparkles, 
  X, 
  Globe, 
  Sliders, 
  CheckCircle2, 
  Zap
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useAccessibility } from "@/context/AccessibilityContext";

export default function AccessibilityToolbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { language, setLanguage, t } = useLanguage();
  const { 
    textSize, 
    setTextSize, 
    highContrast, 
    setHighContrast, 
    simpleMode, 
    setSimpleMode,
    guidedWalkthrough,
    setGuidedWalkthrough
  } = useAccessibility();

  const languages = [
    { code: "en", name: "English", flag: "🇬🇧", native: "English" },
    { code: "ta", name: "Tamil", flag: "🇮🇳", native: "தமிழ்" },
    { code: "te", name: "Telugu", flag: "🇮🇳", native: "తెలుగు" },
    { code: "hi", name: "Hindi", flag: "🇮🇳", native: "हिन्दी" },
    { code: "kn", name: "Kannada", flag: "🇮🇳", native: "ಕನ್ನಡ" },
    { code: "ml", name: "Malayalam", flag: "🇮🇳", native: "മലയാളം" },
  ];

  return (
    <>
      {/* FLOATING ACCESSIBILITY BUTTON */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 right-4 lg:bottom-6 lg:right-6 z-50 p-3.5 bg-gradient-to-tr from-cyan-500 to-indigo-600 text-slate-950 font-black rounded-full shadow-2xl hover:scale-110 transition border-2 border-white/20 flex items-center gap-2 group"
        title="Accessibility & Language Settings"
      >
        <span className="text-xl">♿</span>
        <span className="hidden group-hover:inline text-xs font-bold text-slate-950 pr-1">
          {t("accessibility")}
        </span>
      </button>

      {/* ACCESSIBILITY MODAL */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel p-6 rounded-3xl max-w-lg w-full border-2 border-cyan-500/40 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">♿</span>
                <h3 className="font-extrabold text-white text-lg">{t("accessibility")}</h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* 1. LANGUAGE SELECTION */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-cyan-400 uppercase tracking-wider block flex items-center gap-1.5">
                <Globe className="w-4 h-4" /> {t("chooseLanguage")}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {languages.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => setLanguage(l.code)}
                    className={`p-3 rounded-2xl border text-left transition flex items-center justify-between min-h-[52px] ${
                      language === l.code
                        ? "bg-cyan-500 text-slate-950 border-cyan-400 font-extrabold shadow-lg shadow-cyan-500/20"
                        : "bg-slate-900 text-slate-200 border-slate-800 hover:bg-slate-800"
                    }`}
                  >
                    <div>
                      <span className="block text-xs font-bold leading-none">{l.native}</span>
                      <span className="text-[10px] opacity-75 font-mono leading-none mt-0.5">{l.name}</span>
                    </div>
                    <span className="text-lg">{l.flag}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 2. TEXT SIZE SCALING */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <label className="text-xs font-bold text-cyan-400 uppercase tracking-wider block flex items-center gap-1.5">
                <Type className="w-4 h-4" /> {t("textSize")}
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setTextSize("normal")}
                  className={`py-3 rounded-xl border text-xs font-bold transition ${
                    textSize === "normal"
                      ? "bg-cyan-500 text-slate-950 border-cyan-400"
                      : "bg-slate-900 text-slate-300 border-slate-800"
                  }`}
                >
                  A (Normal)
                </button>
                <button
                  onClick={() => setTextSize("large")}
                  className={`py-3 rounded-xl border text-sm font-bold transition ${
                    textSize === "large"
                      ? "bg-cyan-500 text-slate-950 border-cyan-400"
                      : "bg-slate-900 text-slate-300 border-slate-800"
                  }`}
                >
                  A+ (Large)
                </button>
                <button
                  onClick={() => setTextSize("xlarge")}
                  className={`py-3 rounded-xl border text-base font-extrabold transition ${
                    textSize === "xlarge"
                      ? "bg-cyan-500 text-slate-950 border-cyan-400"
                      : "bg-slate-900 text-slate-300 border-slate-800"
                  }`}
                >
                  A++ (XL)
                </button>
              </div>
            </div>

            {/* 3. HIGH CONTRAST & SIMPLE MODE TOGGLES */}
            <div className="space-y-3 pt-2 border-t border-slate-800">
              <div className="flex items-center justify-between p-3.5 bg-slate-900 rounded-2xl border border-slate-800">
                <div>
                  <h4 className="text-xs font-bold text-white">{t("highContrast")}</h4>
                  <p className="text-[11px] text-slate-400">High contrast text for low visibility</p>
                </div>
                <button
                  onClick={() => setHighContrast(!highContrast)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                    highContrast ? "bg-emerald-500 text-slate-950" : "bg-slate-800 text-slate-400"
                  }`}
                >
                  {highContrast ? "◐ ON" : "OFF"}
                </button>
              </div>

              <div className="flex items-center justify-between p-3.5 bg-slate-900 rounded-2xl border border-slate-800">
                <div>
                  <h4 className="text-xs font-bold text-white">{t("simpleMode")}</h4>
                  <p className="text-[11px] text-slate-400">Large touch cards & simple words</p>
                </div>
                <button
                  onClick={() => setSimpleMode(!simpleMode)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                    simpleMode ? "bg-emerald-500 text-slate-950" : "bg-slate-800 text-slate-400"
                  }`}
                >
                  {simpleMode ? "✓ ON" : "OFF"}
                </button>
              </div>

              <div className="flex items-center justify-between p-3.5 bg-slate-900 rounded-2xl border border-slate-800">
                <div>
                  <h4 className="text-xs font-bold text-white">{t("guideMe")}</h4>
                  <p className="text-[11px] text-slate-400">Step-by-step guided walkthrough</p>
                </div>
                <button
                  onClick={() => setGuidedWalkthrough(!guidedWalkthrough)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                    guidedWalkthrough ? "bg-emerald-500 text-slate-950" : "bg-slate-800 text-slate-400"
                  }`}
                >
                  {guidedWalkthrough ? "ℹ️ ON" : "OFF"}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setIsOpen(false)}
                className="w-full py-3 bg-cyan-500 text-slate-950 font-bold text-xs rounded-2xl hover:bg-cyan-400 transition"
              >
                Apply & Save Preferences
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
