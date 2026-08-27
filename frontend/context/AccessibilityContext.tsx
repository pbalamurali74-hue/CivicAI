"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface AccessibilityContextType {
  textSize: "normal" | "large" | "xlarge";
  setTextSize: (size: "normal" | "large" | "xlarge") => void;
  highContrast: boolean;
  setHighContrast: (val: boolean) => void;
  voiceGuidance: boolean;
  setVoiceGuidance: (val: boolean) => void;
  simpleMode: boolean;
  setSimpleMode: (val: boolean) => void;
  guidedWalkthrough: boolean;
  setGuidedWalkthrough: (val: boolean) => void;
}

const AccessibilityContext = createContext<AccessibilityContextType>({
  textSize: "normal",
  setTextSize: () => {},
  highContrast: false,
  setHighContrast: () => {},
  voiceGuidance: true,
  setVoiceGuidance: () => {},
  simpleMode: false,
  setSimpleMode: () => {},
  guidedWalkthrough: false,
  setGuidedWalkthrough: () => {},
});

export const AccessibilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [textSize, setTextSizeState] = useState<"normal" | "large" | "xlarge">("normal");
  const [highContrast, setHighContrastState] = useState(false);
  const [voiceGuidance, setVoiceGuidanceState] = useState(true);
  const [simpleMode, setSimpleModeState] = useState(false);
  const [guidedWalkthrough, setGuidedWalkthroughState] = useState(false);

  useEffect(() => {
    const savedSize = localStorage.getItem("civicai_text_size") as any;
    if (savedSize) setTextSizeState(savedSize);

    const savedHC = localStorage.getItem("civicai_hc");
    if (savedHC) setHighContrastState(savedHC === "true");

    const savedSM = localStorage.getItem("civicai_sm");
    if (savedSM) setSimpleModeState(savedSM === "true");
  }, []);

  const setTextSize = (size: "normal" | "large" | "xlarge") => {
    setTextSizeState(size);
    localStorage.setItem("civicai_text_size", size);
  };

  const setHighContrast = (val: boolean) => {
    setHighContrastState(val);
    localStorage.setItem("civicai_hc", String(val));
  };

  const setSimpleMode = (val: boolean) => {
    setSimpleModeState(val);
    localStorage.setItem("civicai_sm", String(val));
  };

  const setVoiceGuidance = (val: boolean) => {
    setVoiceGuidanceState(val);
  };

  const setGuidedWalkthrough = (val: boolean) => {
    setGuidedWalkthroughState(val);
  };

  return (
    <AccessibilityContext.Provider
      value={{
        textSize,
        setTextSize,
        highContrast,
        setHighContrast,
        voiceGuidance,
        setVoiceGuidance,
        simpleMode,
        setSimpleMode,
        guidedWalkthrough,
        setGuidedWalkthrough,
      }}
    >
      <div className={`${textSize === "large" ? "text-lg" : textSize === "xlarge" ? "text-xl" : ""} ${highContrast ? "high-contrast-mode" : ""}`}>
        {children}
      </div>
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = () => useContext(AccessibilityContext);
