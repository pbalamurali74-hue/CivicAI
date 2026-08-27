"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

import en from "../locales/en.json";
import ta from "../locales/ta.json";
import te from "../locales/te.json";
import hi from "../locales/hi.json";
import kn from "../locales/kn.json";
import ml from "../locales/ml.json";

const translations: Record<string, Record<string, string>> = {
  en,
  ta,
  te,
  hi,
  kn,
  ml,
};

interface LanguageContextType {
  language: string;
  setLanguage: (lang: string) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  language: "en",
  setLanguage: () => {},
  t: (key: string) => key,
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<string>("en");

  useEffect(() => {
    const saved = localStorage.getItem("civicai_lang");
    if (saved && translations[saved]) {
      setLanguageState(saved);
    }
  }, []);

  const setLanguage = (lang: string) => {
    if (translations[lang]) {
      setLanguageState(lang);
      localStorage.setItem("civicai_lang", lang);
    }
  };

  const t = (key: string): string => {
    const dict = translations[language] || translations["en"];
    return dict[key] || translations["en"][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
