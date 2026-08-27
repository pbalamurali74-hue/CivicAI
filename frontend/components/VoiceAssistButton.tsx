"use client";

import { Volume2, VolumeX } from "lucide-react";
import { useVoice } from "@/hooks/useVoice";
import { useLanguage } from "@/context/LanguageContext";

interface Props {
  text: string;
  label?: string;
  className?: string;
}

export default function VoiceAssistButton({ text, label = "Listen", className = "" }: Props) {
  const { speak, stopSpeech, isSpeaking } = useVoice();
  const { language, t } = useLanguage();

  const handleToggle = () => {
    if (isSpeaking) {
      stopSpeech();
    } else {
      speak(text, language);
    }
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition shadow-md border ${
        isSpeaking
          ? "bg-rose-500 text-white border-rose-400 animate-pulse"
          : "bg-slate-800 text-cyan-400 border-slate-700 hover:bg-slate-700 hover:border-cyan-500"
      } ${className}`}
      title={isSpeaking ? t("stop") : t("listen")}
    >
      {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
      <span>{isSpeaking ? t("stop") : t(label.toLowerCase()) || label}</span>
    </button>
  );
}
