"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  ShieldCheck, 
  Navigation, 
  Building2, 
  Sparkles, 
  Volume2, 
  Mic, 
  Home, 
  Briefcase, 
  Hospital, 
  ShoppingBag, 
  QrCode, 
  Star, 
  ArrowRight, 
  Globe, 
  Heart, 
  CheckCircle2, 
  AlertTriangle,
  Play,
  RotateCcw
} from "lucide-react";

export default function LandingPage() {
  // Step Simulator State
  const [activeStep, setActiveStep] = useState(1);
  const [selectedEmoji, setSelectedEmoji] = useState<string | null>(null);

  const steps = [
    { id: 1, name: "Welcome", title: "Welcome to CIVICSHIELD", icon: "🛡️" },
    { id: 2, name: "Language", title: "Choose Language", icon: "🌐" },
    { id: 3, name: "Instant Verify", title: "Verify Official ID", icon: "🔍" },
    { id: 4, name: "Your Journey", title: "Search Destination", icon: "📍" },
    { id: 5, name: "Best Route", title: "Smart Route Solver", icon: "🚌" },
    { id: 6, name: "Live Map", title: "Real-time Tracking", icon: "🗺️" },
    { id: 7, name: "Rate Experience", title: "Rate Your Experience", icon: "⭐" },
  ];

  return (
    <div className="min-h-screen bg-[#fafafa] text-[#212121] selection:bg-[#FFC107] selection:text-[#18181B] pb-20">
      
      {/* HEADER TAGLINE BANNER & PS 26124 HERO CTA */}
      <section className="pt-8 pb-8 max-w-7xl mx-auto px-4 text-center relative z-10 space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-800 text-xs font-black shadow-sm">
          <ShieldCheck className="w-4 h-4 text-amber-600" />
          <span>CIVICSHIELD PLATFORM • SIH 2026 PS 26124 EDITION</span>
        </div>
        <h1 className="text-4xl md:text-6xl font-black text-[#212121] tracking-tight mb-3">
          AI Mobile Urban Sensing <span className="text-amber-600">& Fleet Intelligence.</span>
        </h1>
        <p className="text-zinc-600 max-w-2xl mx-auto text-sm md:text-base font-semibold">
          Turn public transport buses into mobile urban sensing units. Detect potholes, traffic bottlenecks, pedestrian dangers, and official identity verification in real-time.
        </p>

        {/* PRIMARY PS 26124 ACTION BUTTON */}
        <div className="pt-2 flex justify-center gap-4">
          <Link
            href="/sih-sensing"
            className="px-8 py-4 rounded-2xl bg-[#FFC107] text-[#18181B] font-black text-sm hover:bg-[#F59E0B] transition shadow-lg shadow-amber-500/30 flex items-center gap-2 border border-amber-400"
          >
            <span>🚌 Launch PS 26124 Fleet AI Sensing Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* THREE 3D MOBILE DEVICE FRAMES SHOWCASE — PS 26124 PILLARS */}
      <section className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          
          {/* FRAME 1: MOBILE SENSING FLEET (BUS-104A) */}
          <div className="phone-frame-light-3d p-6 flex flex-col justify-between min-h-[580px] border-zinc-900 bg-white shadow-md">
            <div>
              {/* Phone Status Bar */}
              <div className="flex justify-between items-center text-[10px] text-zinc-500 mb-4 px-2 font-mono">
                <span>18:45</span>
                <span className="font-bold text-amber-700">FLEET SENSING</span>
                <span>45 FPS ⚡</span>
              </div>

              <div className="text-center mb-6">
                <span className="text-xs font-black uppercase text-amber-700 tracking-wider">Pillar 1: Mobile Fleet</span>
                <h3 className="text-xl font-black text-[#212121] mt-1">BUS-104A Mobile Sensing Unit</h3>
                <p className="text-xs text-zinc-500 font-semibold mt-1">Route 70H: SRM ➔ Guindy ➔ T. Nagar</p>
              </div>

              {/* Bus Fleet Visual Card */}
              <div className="bg-amber-50/80 border border-amber-200 rounded-3xl p-5 text-center mb-6 relative overflow-hidden shadow-sm space-y-3">
                <div className="w-20 h-20 mx-auto rounded-3xl bg-[#FFC107] text-[#18181B] flex items-center justify-center text-4xl shadow-md border border-amber-300">
                  🚌
                </div>
                <div>
                  <div className="font-mono font-black text-sm text-zinc-900">TN-01-N-9842</div>
                  <div className="text-xs font-bold text-emerald-700">● 4 AI Cameras Active • Edge Online</div>
                </div>
                <div className="p-2 bg-white rounded-xl border border-amber-200 text-[11px] font-mono text-zinc-600">
                  NVIDIA Jetson AGX Orin 64GB
                </div>
              </div>
            </div>

            {/* Action Button */}
            <div className="text-center space-y-3">
              <Link
                href="/sih-sensing"
                className="w-full py-4 rounded-3xl bg-gradient-to-r from-[#FFC107] to-[#F59E0B] text-[#18181B] font-black text-sm flex flex-col items-center justify-center shadow-lg shadow-amber-500/30 hover:scale-102 transition border border-amber-300"
              >
                <span>Inspect BUS-104A Cameras</span>
                <span className="text-[10px] font-bold text-zinc-800">4-stream computer vision →</span>
              </Link>
            </div>
          </div>

          {/* FRAME 2: AI DETECTION & CIVIC RISK SCORE (92/100) */}
          <div className="phone-frame-light-3d p-6 flex flex-col justify-between min-h-[580px] border-amber-500 bg-white shadow-md">
            <div>
              <div className="flex justify-between items-center text-[10px] text-zinc-500 mb-4 px-2 font-mono">
                <span>18:45</span>
                <span className="font-bold text-rose-600">🔴 CRITICAL HAZARD</span>
                <span>RISK: 92/100</span>
              </div>

              <div className="text-center mb-4">
                <span className="text-xs font-black uppercase text-amber-700 tracking-wider">Pillar 2: AI Prioritization</span>
                <h3 className="text-xl font-black text-[#212121] mt-1">Severe Asphalt Pothole</h3>
                <p className="text-xs text-zinc-500 font-semibold">Guindy Kathipara Underpass</p>
              </div>

              {/* Big Civic Risk Score Badge */}
              <div className="bg-amber-50 border-2 border-[#FFC107] rounded-3xl p-5 text-center mb-4 shadow-sm">
                <div className="font-mono text-4xl font-black text-[#EF4444] tracking-tight">
                  92 <span className="text-sm text-zinc-500 font-bold">/ 100</span>
                </div>
                <div className="text-xs font-black text-rose-600 uppercase tracking-wider mt-0.5">
                  CRITICAL CIVIC RISK SCORE
                </div>
                <div className="text-[11px] text-zinc-600 font-medium mt-2">
                  Confidence: <strong>94.8%</strong> • Arterial Road
                </div>
              </div>

              {/* Multi-Bus Verification Callout */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 text-xs space-y-1">
                <div className="flex items-center gap-1.5 font-black text-emerald-950">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Multi-Bus Verified: 3 Buses</span>
                </div>
                <p className="text-[11px] text-emerald-900 font-medium">
                  Corroborated by BUS-104A, BUS-102, & BUS-103 within 5 meters.
                </p>
              </div>
            </div>

            {/* Action Link */}
            <div className="pt-3">
              <Link
                href="/sih-sensing"
                className="w-full py-3.5 rounded-2xl bg-zinc-900 text-white font-black text-xs flex items-center justify-center gap-2 hover:bg-black transition shadow-md"
              >
                <span>View Multi-Bus Evidence</span>
                <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
              </Link>
            </div>
          </div>

          {/* FRAME 3: MUNICIPAL WORK ORDER & CENTRAL GIS */}
          <div className="phone-frame-light-3d p-6 flex flex-col justify-between min-h-[580px] border-zinc-900 bg-white shadow-md">
            <div>
              <div className="flex justify-between items-center text-[10px] text-zinc-500 mb-4 px-2 font-mono">
                <span>18:46</span>
                <span className="font-bold text-emerald-600">✓ DISPATCHED</span>
                <span>SLA: 4 HRS</span>
              </div>

              <div className="text-center mb-6">
                <span className="text-xs font-black uppercase text-amber-700 tracking-wider">Pillar 3: Actionable Orders</span>
                <h3 className="text-xl font-black text-[#212121] mt-1">GCC Municipal Work Order</h3>
                <p className="text-xs font-semibold text-zinc-500 mt-1">Ticket #GCC-ROAD-4092</p>
              </div>

              {/* Work Order Ticket Card */}
              <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-4 space-y-2.5 mb-4 text-xs">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Agency:</span>
                  <span className="font-bold text-zinc-900">Greater Chennai Corp (GCC)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Assigned Crew:</span>
                  <span className="font-bold text-zinc-900">Patch Crew #4</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Status:</span>
                  <span className="font-bold text-indigo-700 font-mono">IN_PROGRESS</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">GIS Coordinates:</span>
                  <span className="font-mono text-zinc-800">13.0067°N, 80.2020°E</span>
                </div>
              </div>

              {/* Central GIS Map Tag */}
              <div className="p-3 bg-amber-50 rounded-2xl border border-amber-300 text-xs text-amber-900 font-bold text-center">
                🗺️ Auto-pinned on Chennai Central GIS Command Map
              </div>
            </div>

            <Link
              href="/sih-sensing"
              className="clay-button-3d w-full py-3.5 rounded-2xl text-center font-black text-xs flex items-center justify-center gap-2 shadow-md"
            >
              <span>Launch GIS Command Map</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

        </div>
      </section>

      {/* DESIGNED FOR EVERY CITIZEN GRID */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <span className="text-xs font-black uppercase text-amber-700 tracking-wider">Universal Accessibility</span>
          <h2 className="text-3xl font-black text-[#212121] mt-1">DESIGNED FOR EVERY CITIZEN</h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-sm text-center">
            <div className="text-2xl mb-2">🌐</div>
            <h4 className="font-black text-[#212121] text-xs">Local Languages</h4>
            <p className="text-[10px] text-zinc-500 mt-1">Multi-lingual interface support</p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-sm text-center">
            <div className="text-2xl mb-2">👆</div>
            <h4 className="font-black text-[#212121] text-xs">Big Buttons</h4>
            <p className="text-[10px] text-zinc-500 mt-1">Easy to tap. Easy to use.</p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-sm text-center">
            <div className="text-2xl mb-2">🎨</div>
            <h4 className="font-black text-[#212121] text-xs">Color Coded</h4>
            <p className="text-[10px] text-zinc-500 mt-1">🟡 Safe | 🔴 Alert</p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-sm text-center">
            <div className="text-2xl mb-2">🔍</div>
            <h4 className="font-black text-[#212121] text-xs">Instant Verify</h4>
            <p className="text-[10px] text-zinc-500 mt-1">1-tap official verification</p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-sm text-center">
            <div className="text-2xl mb-2">🗺️</div>
            <h4 className="font-black text-[#212121] text-xs">Universal Icons</h4>
            <p className="text-[10px] text-zinc-500 mt-1">Icons that everyone understands</p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-sm text-center">
            <div className="text-2xl mb-2">◐</div>
            <h4 className="font-black text-[#212121] text-xs">High Contrast</h4>
            <p className="text-[10px] text-zinc-500 mt-1">Visible in all conditions</p>
          </div>
        </div>
      </section>

      {/* INTERACTIVE STEP-BY-STEP MOBILE JOURNEY SIMULATOR */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="bg-white p-8 rounded-3xl border border-zinc-200 shadow-sm">
          <div className="text-center mb-8">
            <span className="text-xs font-black uppercase text-amber-700 tracking-wider">Interactive Flow</span>
            <h2 className="text-3xl font-black text-[#212121] mt-1">PREMIUM STEP-BY-STEP EXPERIENCE</h2>
            <p className="text-xs text-zinc-500 mt-1">Click steps below to simulate the citizen user flow</p>
          </div>

          {/* STEP NAVIGATION BUTTONS */}
          <div className="flex items-center justify-center gap-2 overflow-x-auto pb-4 mb-8">
            {steps.map((s) => (
              <button
                key={s.id}
                onClick={() => setActiveStep(s.id)}
                className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap shrink-0 ${
                  activeStep === s.id
                    ? "bg-[#FFC107] text-[#18181B] font-black shadow-md scale-105"
                    : "bg-zinc-100 text-zinc-700 border border-zinc-200 hover:bg-zinc-200"
                }`}
              >
                <span>{s.icon}</span>
                <span>{s.id}. {s.name}</span>
              </button>
            ))}
          </div>

          {/* SIMULATED STEP DISPLAY SCREEN */}
          <div className="max-w-md mx-auto phone-frame-light-3d p-6 min-h-[420px] flex flex-col justify-between border-zinc-800 bg-white">
            {/* Step 1: Welcome */}
            {activeStep === 1 && (
              <div className="text-center my-auto space-y-4">
                <div className="w-20 h-20 mx-auto rounded-3xl bg-[#FFC107] text-[#18181B] flex items-center justify-center text-4xl shadow-md border border-amber-300">
                  🛡️
                </div>
                <h3 className="text-2xl font-black text-[#212121]">CIVICSHIELD</h3>
                <p className="text-xs text-zinc-600 font-medium">Trusted Officials. Safer Citizens. Smarter Mobility.</p>
                <button onClick={() => setActiveStep(2)} className="clay-button-3d px-6 py-2.5 text-xs font-bold">
                  Tap to Continue →
                </button>
              </div>
            )}

            {/* Step 2: Choose Language */}
            {activeStep === 2 && (
              <div className="space-y-3 my-auto">
                <h3 className="text-lg font-black text-[#212121] text-center mb-4">Choose Language</h3>
                {["English", "हिन्दी", "తెలుగు", "தமிழ்", "বাংলা"].map((lang, idx) => (
                  <div key={lang} className="p-3 bg-zinc-50 border border-zinc-200 rounded-2xl flex items-center justify-between text-xs font-bold text-zinc-800 hover:border-amber-500">
                    <span>{lang}</span>
                    <span className="text-amber-600">✓</span>
                  </div>
                ))}
              </div>
            )}

            {/* Step 3: Instant Verify */}
            {activeStep === 3 && (
              <div className="text-center my-auto space-y-4">
                <div className="w-20 h-20 mx-auto rounded-3xl bg-amber-100 border-2 border-[#FFC107] flex items-center justify-center text-4xl text-amber-800 shadow-md">
                  🔍
                </div>
                <div>
                  <h3 className="text-lg font-black text-[#212121]">Instant Officer Verification</h3>
                  <p className="text-xs text-amber-800 font-bold mt-1">Point QR code to verify official status</p>
                </div>
                <button onClick={() => setActiveStep(4)} className="clay-button-3d px-6 py-2.5 text-xs font-bold">
                  Verify QR Code →
                </button>
              </div>
            )}

            {/* Step 4: Search Journey */}
            {activeStep === 4 && (
              <div className="space-y-4 my-auto">
                <h3 className="text-lg font-black text-[#212121] text-center">Your Journey</h3>
                <div className="space-y-2 text-xs">
                  <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-2xl text-zinc-700">
                    From: <span className="font-black text-[#212121]">My Location (SRM Ramapuram)</span>
                  </div>
                  <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-2xl text-zinc-700">
                    To: <span className="font-black text-amber-700">Chennai Central</span>
                  </div>
                </div>
                <button onClick={() => setActiveStep(5)} className="clay-button-3d w-full py-3 text-xs">
                  Find Best Route →
                </button>
              </div>
            )}

            {/* Step 5: Best Route for You */}
            {activeStep === 5 && (
              <div className="space-y-4 my-auto">
                <div className="text-center">
                  <span className="text-[10px] font-black uppercase text-amber-700">Best Route for You</span>
                  <h3 className="text-xl font-black text-[#212121]">Direct Bus 101A / 70H</h3>
                </div>

                <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-2xl space-y-2 text-xs">
                  <div className="flex justify-between text-zinc-900 font-black">
                    <span>Duration: 20 mins</span>
                    <span className="text-amber-700">Fare: ₹15</span>
                  </div>
                  <div className="flex gap-2 text-[10px] font-bold">
                    <span className="px-2 py-1 bg-amber-100 text-amber-900 rounded-lg border border-amber-300">⭐ Less Crowd</span>
                    <span className="px-2 py-1 bg-zinc-200 text-zinc-800 rounded-lg">⭐ More Comfort</span>
                  </div>
                </div>

                <button onClick={() => setActiveStep(6)} className="clay-button-3d w-full py-3 text-xs text-[#18181B] font-black rounded-2xl">
                  Start Journey
                </button>
              </div>
            )}

            {/* Step 6: Live Journey Map */}
            {activeStep === 6 && (
              <div className="space-y-4 my-auto text-center">
                <div className="h-36 bg-zinc-100 rounded-2xl border border-zinc-200 flex items-center justify-center relative overflow-hidden">
                  <span className="text-4xl">🗺️ 🚌 📍</span>
                  <span className="absolute bottom-2 left-2 text-[10px] bg-white px-2 py-0.5 rounded text-amber-700 font-bold border border-zinc-200">Live GPS Stream Active</span>
                </div>
                <div>
                  <h3 className="text-base font-black text-[#212121]">8 mins to reach stop</h3>
                  <p className="text-xs text-zinc-500 mt-0.5">Route 70H Bus approaching Guindy station</p>
                </div>
                <button onClick={() => setActiveStep(7)} className="clay-button-3d w-full py-2.5 text-xs">
                  Complete Journey →
                </button>
              </div>
            )}

            {/* Step 7: Rate Your Experience (Emoji Sentiment Faces) */}
            {activeStep === 7 && (
              <div className="space-y-4 my-auto text-center">
                <h3 className="text-lg font-black text-[#212121]">Rate Your Experience</h3>
                <p className="text-xs text-zinc-500">How was your journey?</p>

                {/* 4 EMOJI SENTIMENT FACES MATCHING IMAGE */}
                <div className="grid grid-cols-4 gap-2 pt-2">
                  <button
                    onClick={() => setSelectedEmoji("Very Bad")}
                    className={`p-3 rounded-2xl border text-center transition ${selectedEmoji === "Very Bad" ? "bg-red-100 border-[#D32F2F] scale-110" : "bg-zinc-50 border-zinc-200"}`}
                  >
                    <div className="text-3xl">😡</div>
                    <span className="text-[10px] font-black text-[#D32F2F] block mt-1">Very Bad</span>
                  </button>
                  <button
                    onClick={() => setSelectedEmoji("Bad")}
                    className={`p-3 rounded-2xl border text-center transition ${selectedEmoji === "Bad" ? "bg-amber-100 border-amber-500 scale-110" : "bg-zinc-50 border-zinc-200"}`}
                  >
                    <div className="text-3xl">🙁</div>
                    <span className="text-[10px] font-black text-amber-700 block mt-1">Bad</span>
                  </button>
                  <button
                    onClick={() => setSelectedEmoji("Good")}
                    className={`p-3 rounded-2xl border text-center transition ${selectedEmoji === "Good" ? "bg-amber-100 border-amber-400 scale-110" : "bg-zinc-50 border-zinc-200"}`}
                  >
                    <div className="text-3xl">🙂</div>
                    <span className="text-[10px] font-black text-amber-700 block mt-1">Good</span>
                  </button>
                  <button
                    onClick={() => setSelectedEmoji("Excellent")}
                    className={`p-3 rounded-2xl border text-center transition ${selectedEmoji === "Excellent" ? "bg-amber-200 border-[#FFC107] scale-110" : "bg-zinc-50 border-zinc-200"}`}
                  >
                    <div className="text-3xl">😀</div>
                    <span className="text-[10px] font-black text-amber-800 block mt-1">Excellent</span>
                  </button>
                </div>

                {selectedEmoji && (
                  <div className="p-2 bg-amber-50 border border-amber-300 rounded-xl text-xs font-bold text-amber-900">
                    ✓ Feedback Saved: {selectedEmoji}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ACCESSIBLE FOR ALL CARD WITH 3D GRANDMA AVATAR */}
      <section className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white p-8 rounded-3xl border border-zinc-200 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <span className="text-xs font-black uppercase text-amber-700 tracking-wider">Inclusive Design</span>
            <h2 className="text-3xl font-black text-[#212121] mt-1 mb-4">ACCESSIBLE FOR ALL</h2>
            
            <div className="space-y-4 text-xs">
              <div className="p-3.5 bg-zinc-50 border border-zinc-200 rounded-2xl flex items-center gap-3">
                <span className="text-2xl">🅰️</span>
                <div>
                  <h4 className="font-black text-[#212121]">Big Text</h4>
                  <p className="text-zinc-600">Large and clear fonts for easy readability</p>
                </div>
              </div>

              <div className="p-3.5 bg-zinc-50 border border-zinc-200 rounded-2xl flex items-center gap-3">
                <span className="text-2xl">🌐</span>
                <div>
                  <h4 className="font-black text-[#212121]">Multi-Lingual Support</h4>
                  <p className="text-zinc-600">Local language selection across all flows</p>
                </div>
              </div>

              <div className="p-3.5 bg-zinc-50 border border-zinc-200 rounded-2xl flex items-center gap-3">
                <span className="text-2xl">⚡</span>
                <div>
                  <h4 className="font-black text-[#212121]">Simple Flow</h4>
                  <p className="text-zinc-600">Step by step guided walkthroughs</p>
                </div>
              </div>

              <div className="p-3.5 bg-zinc-50 border border-zinc-200 rounded-2xl flex items-center gap-3">
                <span className="text-2xl">👥</span>
                <div>
                  <h4 className="font-black text-[#212121]">Assisted Mode</h4>
                  <p className="text-zinc-600">Get assistance from family members</p>
                </div>
              </div>
            </div>
          </div>

          {/* 3D Elderly Citizen Graphic Card */}
          <div className="bg-gradient-to-br from-amber-50 via-white to-amber-100/60 border border-amber-200 rounded-3xl p-8 text-center space-y-4 shadow-sm">
            <div className="w-32 h-32 mx-auto rounded-full bg-[#FFC107] p-1 shadow-md border border-amber-300">
              <img
                src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80"
                alt="Elderly Citizen Avatar"
                className="w-full h-full rounded-full object-cover border-4 border-white"
              />
            </div>
            <h3 className="text-xl font-black text-[#212121]">Designed for Low-Literacy & First-Time Users</h3>
            <p className="text-xs text-zinc-600 leading-relaxed max-w-sm mx-auto font-medium">
              Empowering senior citizens and first-time commuters with clear visual feedback, zero complex text forms, and single-tap actions.
            </p>
          </div>
        </div>
      </section>

      {/* BOTTOM TRUST FEATURE HIGHLIGHTS BAR */}
      <section className="max-w-7xl mx-auto px-4 pt-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-center text-xs font-bold text-zinc-700">
          <div className="p-3 bg-white border border-zinc-200 rounded-2xl shadow-sm">
            <span className="block text-amber-600 text-base mb-1">👤</span>
            <span>Easy for Everyone</span>
            <span className="block text-[9px] text-zinc-500 font-normal">First-time smartphone users</span>
          </div>
          <div className="p-3 bg-white border border-zinc-200 rounded-2xl shadow-sm">
            <span className="block text-amber-600 text-base mb-1">🛡️</span>
            <span>Built for Bharat</span>
            <span className="block text-[9px] text-zinc-500 font-normal">Local languages & needs</span>
          </div>
          <div className="p-3 bg-white border border-zinc-200 rounded-2xl shadow-sm">
            <span className="block text-amber-600 text-base mb-1">🔒</span>
            <span>Safe & Trusted</span>
            <span className="block text-[9px] text-zinc-500 font-normal">Verified identity records</span>
          </div>
          <div className="p-3 bg-white border border-zinc-200 rounded-2xl shadow-sm">
            <span className="block text-amber-600 text-base mb-1">⚡</span>
            <span>Smart & Fast</span>
            <span className="block text-[9px] text-zinc-500 font-normal">AI powered routing</span>
          </div>
          <div className="p-3 bg-white border border-zinc-200 rounded-2xl shadow-sm col-span-2 md:col-span-1">
            <span className="block text-amber-600 text-base mb-1">📱</span>
            <span>Always with You</span>
            <span className="block text-[9px] text-zinc-500 font-normal">24x7 Assistance & updates</span>
          </div>
        </div>
      </section>

    </div>
  );
}


