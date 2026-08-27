"use client";

import { useState } from "react";
import { ChevronRight, ChevronLeft, X, Sparkles } from "lucide-react";
import { useAccessibility } from "@/context/AccessibilityContext";
import { useLanguage } from "@/context/LanguageContext";

interface Step {
  title: string;
  speech: string;
}

interface Props {
  steps: Step[];
}

export default function GuidedWalkthroughBanner({ steps }: Props) {
  const { guidedWalkthrough, setGuidedWalkthrough } = useAccessibility();
  const { t } = useLanguage();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const currentStep = steps[currentStepIndex] || steps[0];

  if (!guidedWalkthrough || !steps || steps.length === 0) return null;

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  return (
    <div className="bg-[#FFC107] border-b-2 border-amber-500 p-4 sticky top-16 z-40 shadow-md text-[#18181B]">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#18181B] text-[#FFC107] font-black flex items-center justify-center text-sm shrink-0">
            ℹ️
          </div>
          <div>
            <span className="text-[10px] font-mono text-amber-950 uppercase tracking-wider block font-black">
              {t("guideMe")} • STEP {currentStepIndex + 1} OF {steps.length}
            </span>
            <p className="font-black text-[#18181B] text-sm">{currentStep.speech}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleBack}
            disabled={currentStepIndex === 0}
            className="px-3 py-1.5 bg-white text-[#18181B] rounded-xl font-bold flex items-center gap-1 disabled:opacity-50 hover:bg-zinc-100 border border-amber-400"
          >
            <ChevronLeft className="w-3.5 h-3.5" /> {t("back")}
          </button>

          <button
            onClick={handleNext}
            disabled={currentStepIndex === steps.length - 1}
            className="px-4 py-1.5 bg-[#18181B] text-[#FFC107] rounded-xl font-black flex items-center gap-1 disabled:opacity-50 hover:bg-black"
          >
            {t("next")} <ChevronRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setGuidedWalkthrough(false)}
            className="p-1.5 text-amber-950 hover:text-black font-black"
            title="Close Guide"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}


