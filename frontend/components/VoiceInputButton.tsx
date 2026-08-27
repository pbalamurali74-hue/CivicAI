"use client";

import { Mic, MicOff } from "lucide-react";
import { useVoice } from "@/hooks/useVoice";
import { useLanguage } from "@/context/LanguageContext";

interface Props {
  onResult: (text: string) => void;
  className?: string;
}

export default function VoiceInputButton({ onResult, className = "" }: Props) {
  const { listen, isListening } = useVoice();
  const { language, t } = useLanguage();

  return (
    <button
      type="button"
      onClick={() => listen(onResult, language)}
      className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border ${
        isListening
          ? "bg-rose-500 text-white border-rose-400 animate-ping"
          : "bg-slate-800 text-slate-200 border-slate-700 hover:border-cyan-500 hover:text-cyan-400"
      } ${className}`}
      title={t("speak")}
    >
      {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-cyan-400" />}
      <span>{isListening ? "Listening..." : t("speak")}</span>
    </button>
  );
}
