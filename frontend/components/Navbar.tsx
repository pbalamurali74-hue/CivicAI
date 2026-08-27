"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  ShieldCheck, 
  Building2, 
  Navigation, 
  Bus, 
  TrendingUp, 
  AlertTriangle, 
  SlidersHorizontal, 
  User, 
  Home, 
  Sparkles,
  Globe,
  Ticket
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useAccessibility } from "@/context/AccessibilityContext";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { language, setLanguage, t } = useLanguage();
  const { simpleMode } = useAccessibility();
  const [role, setRole] = useState<string>("CITIZEN");
  const [userEmail, setUserEmail] = useState<string>("citizen@demo.com");

  useEffect(() => {
    const storedRole = localStorage.getItem("civicai_role") || "CITIZEN";
    const storedEmail = localStorage.getItem("civicai_email") || "citizen@demo.com";
    setRole(storedRole);
    setUserEmail(storedEmail);
  }, []);

  const switchRole = (newRole: string, email: string) => {
    localStorage.setItem("civicai_role", newRole);
    localStorage.setItem("civicai_email", email);
    setRole(newRole);
    setUserEmail(email);

    if (newRole === "OFFICIAL") router.push("/official/dashboard");
    else if (newRole === "AUTHORITY") router.push("/authority/dashboard");
    else if (newRole === "ADMIN") router.push("/admin");
    else router.push("/dashboard");
  };

  const navItems = [
    { name: t("verifyOfficial"), href: "/verify", icon: ShieldCheck },
    { name: t("govtOffice"), href: "/offices", icon: Building2 },
    { name: t("travel"), href: "/mobility", icon: Navigation },
    { name: "Trip Manager", href: "/trip-manager", icon: Sparkles },
    { name: "Live Transit", href: "/live-transit", icon: Bus },
    { name: t("reportIssue"), href: "/grievances", icon: AlertTriangle },
  ];

  if (role === "ADMIN") {
    navItems.push({ name: "Admin Portal", href: "/admin", icon: SlidersHorizontal });
  } else if (role === "AUTHORITY") {
    navItems.push({ name: "Scheduling", href: "/authority/scheduling", icon: SlidersHorizontal });
  } else if (role === "OFFICIAL") {
    navItems.push({ name: "Official QR", href: "/official/qr", icon: ShieldCheck });
  }

  const languages = [
    { code: "en", name: "English", flag: "🇬🇧" },
    { code: "ta", name: "தமிழ்", flag: "🇮🇳" },
    { code: "te", name: "తెలుగు", flag: "🇮🇳" },
    { code: "hi", name: "हिन्दी", flag: "🇮🇳" },
    { code: "kn", name: "ಕನ್ನಡ", flag: "🇮🇳" },
    { code: "ml", name: "മലയാളം", flag: "🇮🇳" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-zinc-200 shadow-sm">
      {/* Hackathon Demo Mode & Language Bar */}
      <div className="bg-zinc-100 px-4 py-1.5 border-b border-zinc-200 flex flex-wrap items-center justify-between text-xs text-zinc-700 gap-2">
        <div className="flex items-center gap-2 font-bold text-zinc-900">
          <span className="flex h-2 w-2 rounded-full bg-amber-500 animate-ping" />
          <ShieldCheck className="w-4 h-4 text-amber-500" />
          <span>CivicShield Platform</span>
        </div>

        {/* Quick Language Switcher */}
        <div className="flex items-center gap-1 overflow-x-auto py-0.5">
          <Globe className="w-3.5 h-3.5 text-zinc-500 hidden sm:inline" />
          {languages.map((l) => (
            <button
              key={l.code}
              onClick={() => setLanguage(l.code)}
              className={`px-2 py-0.5 rounded text-[11px] font-bold transition ${
                language === l.code
                  ? "bg-[#FFC107] text-[#18181B] font-black shadow-sm"
                  : "bg-white text-zinc-700 hover:bg-zinc-200 border border-zinc-200"
              }`}
            >
              {l.flag} {l.name}
            </button>
          ))}
        </div>

        {/* Demo Role Switcher */}
        <div className="flex items-center gap-1">
          <span className="text-zinc-500 hidden md:inline text-[11px] font-medium">Role:</span>
          <button
            onClick={() => switchRole("CITIZEN", "citizen@demo.com")}
            className={`px-2 py-0.5 rounded text-[11px] font-bold transition ${
              role === "CITIZEN" ? "bg-[#FFC107] text-[#18181B]" : "bg-white text-zinc-700 border border-zinc-200 hover:bg-zinc-200"
            }`}
          >
            Citizen
          </button>
          <button
            onClick={() => switchRole("OFFICIAL", "officer@demo.com")}
            className={`px-2 py-0.5 rounded text-[11px] font-bold transition ${
              role === "OFFICIAL" ? "bg-[#FFC107] text-[#18181B]" : "bg-white text-zinc-700 border border-zinc-200 hover:bg-zinc-200"
            }`}
          >
            Official
          </button>
          <button
            onClick={() => switchRole("AUTHORITY", "authority@demo.com")}
            className={`px-2 py-0.5 rounded text-[11px] font-bold transition ${
              role === "AUTHORITY" ? "bg-[#FFC107] text-[#18181B]" : "bg-white text-zinc-700 border border-zinc-200 hover:bg-zinc-200"
            }`}
          >
            Authority
          </button>
          <button
            onClick={() => switchRole("ADMIN", "admin@demo.com")}
            className={`px-2 py-0.5 rounded text-[11px] font-bold transition ${
              role === "ADMIN" ? "bg-[#D32F2F] text-white" : "bg-white text-zinc-700 border border-zinc-200 hover:bg-zinc-200"
            }`}
          >
            Admin
          </button>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-2xl bg-[#FFC107] text-[#18181B] flex items-center justify-center shadow-md border border-amber-300 group-hover:scale-105 transition">
              <ShieldCheck className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <span className="text-2xl font-black tracking-tight text-[#212121] flex items-center gap-1.5 font-mono">
                CIVIC<span className="text-[#D97706]">SHIELD</span>
              </span>
              <span className="block text-[10px] text-zinc-600 font-bold tracking-wide -mt-0.5">
                Trusted Officials. Safer Citizens. Smarter Mobility.
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links matching presentation tabs */}
          <nav className="hidden lg:flex items-center gap-2">
            <Link
              href="/sih-sensing"
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition ${
                pathname === "/sih-sensing"
                  ? "bg-[#FFC107] text-[#18181B] shadow-sm border border-amber-400"
                  : "bg-amber-100/60 text-amber-900 border border-amber-300 hover:bg-amber-100"
              }`}
            >
              <Bus className="w-4 h-4 text-amber-700" />
              <span>Fleet Sensing (PS 26124)</span>
            </Link>
            <Link
              href="/verify"
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition ${
                pathname === "/verify"
                  ? "bg-[#FFC107] text-[#18181B] shadow-sm"
                  : "text-zinc-700 hover:bg-zinc-100 hover:text-black"
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Verify Official</span>
            </Link>
            <Link
              href="/ratings"
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition ${
                pathname === "/ratings"
                  ? "bg-[#FFC107] text-[#18181B] shadow-sm"
                  : "text-zinc-700 hover:bg-zinc-100 hover:text-black"
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>Trust</span>
            </Link>
            <Link
              href="/mobility"
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition ${
                pathname === "/mobility"
                  ? "bg-[#FFC107] text-[#18181B] shadow-sm"
                  : "text-zinc-700 hover:bg-zinc-100 hover:text-black"
              }`}
            >
              <Navigation className="w-4 h-4" />
              <span>Travel</span>
            </Link>
            <Link
              href="/transport/tn-bus-predictor"
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition ${
                pathname === "/transport/tn-bus-predictor"
                  ? "bg-[#FFC107] text-[#18181B] shadow-sm border border-amber-400"
                  : "text-zinc-700 hover:bg-zinc-100 hover:text-black"
              }`}
            >
              <TrendingUp className="w-4 h-4 text-amber-600" />
              <span>TN Bus ML Predictor</span>
            </Link>
            <Link
              href="/transport/ticket-proof"
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition ${
                pathname === "/transport/ticket-proof"
                  ? "bg-[#FFC107] text-[#18181B] shadow-sm border border-amber-400"
                  : "text-zinc-700 hover:bg-zinc-100 hover:text-black"
              }`}
            >
              <Ticket className="w-4 h-4 text-amber-600" />
              <span>Ticket Proof</span>
            </Link>
            <Link
              href="/city-pulse"
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition ${
                pathname === "/city-pulse"
                  ? "bg-[#FFC107] text-[#18181B] shadow-sm"
                  : "text-zinc-700 hover:bg-zinc-100 hover:text-black"
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>City Pulse</span>
            </Link>
          </nav>

          {/* User Profile Info */}
          <div className="flex items-center gap-3">
            <Link
              href="/profile"
              className="flex items-center gap-2 bg-zinc-100 border border-zinc-200 px-3 py-1.5 rounded-xl hover:bg-zinc-200 transition"
            >
              <div className="w-7 h-7 rounded-full bg-[#FFC107] text-[#18181B] flex items-center justify-center text-xs font-black">
                {role[0]}
              </div>
              <div className="hidden sm:block text-left">
                <span className="block text-xs font-bold text-zinc-900 leading-none">
                  {userEmail.split("@")[0]}
                </span>
                <span className="text-[10px] text-amber-600 font-mono font-bold leading-none">
                  {role}
                </span>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-t border-zinc-200 py-2.5 px-4 flex items-center justify-around shadow-lg">
        <Link
          href="/dashboard"
          className={`flex flex-col items-center gap-1 text-[11px] font-bold ${
            pathname === "/dashboard" ? "text-amber-600 font-black" : "text-zinc-500"
          }`}
        >
          <Home className="w-5 h-5" />
          <span>Home</span>
        </Link>
        <Link
          href="/verify"
          className={`flex flex-col items-center gap-1 text-[11px] font-bold ${
            pathname === "/verify" ? "text-amber-600 font-black" : "text-zinc-500"
          }`}
        >
          <ShieldCheck className="w-6 h-6 text-amber-500" />
          <span>Verify</span>
        </Link>
        <Link
          href="/mobility"
          className={`flex flex-col items-center gap-1 text-[11px] font-bold ${
            pathname === "/mobility" ? "text-amber-600 font-black" : "text-zinc-500"
          }`}
        >
          <Navigation className="w-5 h-5" />
          <span>Travel</span>
        </Link>
        <Link
          href="/offices"
          className={`flex flex-col items-center gap-1 text-[11px] font-bold ${
            pathname === "/offices" ? "text-amber-600 font-black" : "text-zinc-500"
          }`}
        >
          <Building2 className="w-5 h-5" />
          <span>Offices</span>
        </Link>
        <Link
          href="/profile"
          className={`flex flex-col items-center gap-1 text-[11px] font-bold ${
            pathname === "/profile" ? "text-amber-600 font-black" : "text-zinc-500"
          }`}
        >
          <User className="w-5 h-5" />
          <span>Profile</span>
        </Link>
      </div>
    </header>
  );
}
