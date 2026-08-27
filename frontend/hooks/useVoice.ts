"use client";

import { useState, useCallback } from "react";

export function useVoice() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const langMap: Record<string, string> = {
    en: "en-IN",
    ta: "ta-IN",
    te: "te-IN",
    hi: "hi-IN",
    kn: "kn-IN",
    ml: "ml-IN",
  };

  const speak = useCallback((text: string, lang = "en") => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      console.warn("Speech Synthesis not supported");
      return;
    }

    window.speechSynthesis.cancel(); // Stop any active speech

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = langMap[lang] || "en-IN";
    utterance.rate = 0.9; // Slightly slower for clear accessibility

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  }, []);

  const stopSpeech = useCallback(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, []);

  const listen = useCallback((onResult: (text: string) => void, lang = "en") => {
    if (typeof window === "undefined") return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Voice input is not available on this device.");
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = langMap[lang] || "en-IN";
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          onResult(transcript);
        }
      };

      recognition.start();
    } catch (e) {
      console.error("Speech recognition error:", e);
      setIsListening(false);
    }
  }, []);

  return { speak, stopSpeech, isSpeaking, listen, isListening };
}
