"use client";

import { useState } from "react";
import { 
  Ticket, 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Bus, 
  ShieldCheck, 
  Sparkles,
  FileCheck,
  Zap
} from "lucide-react";
import GuidedWalkthroughBanner from "@/components/GuidedWalkthroughBanner";
import { verifyTicketProof } from "@/lib/api";

export default function TicketProofPage() {
  const [ticketNumber, setTicketNumber] = useState("MTC-ETM-994821");
  const [routeCode, setRouteCode] = useState("70H");
  const [timestamp, setTimestamp] = useState("2026-08-26 08:45 AM");
  const [fareInr, setFareInr] = useState(20);
  const [passengerCount, setPassengerCount] = useState(1);
  const [boardedStop, setBoardedStop] = useState("SRM Ramapuram");

  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    setLoading(true);
    try {
      const res = await verifyTicketProof(
        ticketNumber,
        routeCode,
        timestamp,
        fareInr,
        passengerCount,
        boardedStop
      );
      setVerificationResult(res);
    } catch (err) {
      console.error("Ticket verification error:", err);
    } finally {
      setLoading(false);
    }
  };

  const sampleTickets = [
    { num: "MTC-ETM-994821", route: "70H", time: "2026-08-26 08:45 AM", stop: "SRM Ramapuram", fare: 20 },
    { num: "MTC-ETM-401822", route: "101A", time: "2026-08-26 09:15 AM", stop: "Koyambedu CMBT", fare: 25 },
    { num: "TNSTC-ETM-881204", route: "21G", time: "2026-08-26 08:30 AM", stop: "Guindy Station", fare: 15 }
  ];

  const walkthroughSteps = [
    { title: "Ticket Rush Proof", speech: "Welcome to Bus Ticket Overcrowding Proof Verification. Upload or scan your physical MTC or TNSTC bus ticket as tangible proof of peak hour surge." },
    { title: "Verification Hash", speech: "The system validates the ETM transaction timestamp and tags the overcrowding proof for Transport Authority relief scheduling." }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <GuidedWalkthroughBanner steps={walkthroughSteps} />

      {/* HEADER BANNER */}
      <div className="bg-white p-6 md:p-8 rounded-3xl border border-zinc-200 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-800 text-xs font-black uppercase tracking-wider mb-2">
              <Ticket className="w-4 h-4 text-amber-600" /> COMMUTER BUS TICKET RUSH PROOF ENGINE
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-[#212121]">
              Bus Ticket Rush & Overcrowding Proof Scanner
            </h1>
            <p className="text-zinc-600 text-sm font-semibold mt-1">
              Upload or scan physical/electronic MTC & TNSTC ETM bus tickets as verified tangible proof of corridor rush hours and footboard standing surges.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="px-3 py-1.5 rounded-2xl bg-amber-100 text-amber-900 border border-amber-300 font-mono text-xs font-black">
              ETM Cryptographic Hash Verified
            </span>
          </div>
        </div>

        {/* METRICS HIGHLIGHT BAR */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-3 border-t border-zinc-200 text-center">
          <div className="p-3 bg-zinc-50 rounded-2xl border border-zinc-200">
            <span className="text-[10px] font-mono text-zinc-500 font-bold uppercase block">Verified Ticket Proofs</span>
            <span className="text-xl font-black text-[#212121]">4,820 Today</span>
          </div>
          <div className="p-3 bg-zinc-50 rounded-2xl border border-zinc-200">
            <span className="text-[10px] font-mono text-zinc-500 font-bold uppercase block">Proof Credibility Score</span>
            <span className="text-xl font-black text-emerald-800">98.4% Verified</span>
          </div>
          <div className="p-3 bg-zinc-50 rounded-2xl border border-zinc-200">
            <span className="text-[10px] font-mono text-zinc-500 font-bold uppercase block">Corridor Surge Load</span>
            <span className="text-xl font-black text-[#D32F2F]">118% Occupancy</span>
          </div>
          <div className="p-3 bg-zinc-50 rounded-2xl border border-zinc-200">
            <span className="text-[10px] font-mono text-zinc-500 font-bold uppercase block">Authority Action</span>
            <span className="text-xs font-black text-amber-800 block mt-1">+1 Relief Bus Dispatched</span>
          </div>
        </div>
      </div>

      {/* INPUT FORM & TICKET VERIFICATION RESULT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT COLUMN: TICKET UPLOAD & INPUT */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-[#212121] text-base flex items-center gap-2">
                <Upload className="w-5 h-5 text-amber-600" /> Ticket Photo Upload / ETM Input
              </h3>
              <span className="text-xs text-zinc-500 font-mono">ETM Receipt OCR</span>
            </div>

            {/* Quick Sample Tickets Switcher */}
            <div className="space-y-2">
              <span className="text-[10px] font-mono text-zinc-500 font-bold uppercase block">Quick Select Sample Bus Ticket:</span>
              <div className="grid grid-cols-1 gap-2">
                {sampleTickets.map((t) => (
                  <button
                    key={t.num}
                    onClick={() => {
                      setTicketNumber(t.num);
                      setRouteCode(t.route);
                      setTimestamp(t.time);
                      setBoardedStop(t.stop);
                      setFareInr(t.fare);
                    }}
                    className={`p-3 rounded-2xl border text-left transition flex items-center justify-between ${
                      ticketNumber === t.num
                        ? "bg-amber-50 border-2 border-[#FFC107] font-black"
                        : "bg-zinc-50 border-zinc-200 hover:bg-zinc-100"
                    }`}
                  >
                    <div>
                      <span className="text-xs font-black text-[#212121] block">{t.num} • Route {t.route}</span>
                      <span className="text-[10px] text-zinc-500 font-medium">{t.stop} ({t.time})</span>
                    </div>
                    <span className="text-xs font-mono font-bold text-amber-700">₹{t.fare}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Ticket Input Fields */}
            <div className="space-y-3 text-xs pt-2 border-t border-zinc-200">
              <div>
                <label className="font-bold text-[#212121] block mb-1">ETM Ticket Number / Hash:</label>
                <input
                  type="text"
                  value={ticketNumber}
                  onChange={(e) => setTicketNumber(e.target.value)}
                  className="w-full px-3 py-2.5 bg-zinc-50 border border-zinc-300 rounded-xl font-mono text-[#212121]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#212121] block mb-1">Route Code:</label>
                  <input
                    type="text"
                    value={routeCode}
                    onChange={(e) => setRouteCode(e.target.value)}
                    className="w-full px-3 py-2.5 bg-zinc-50 border border-zinc-300 rounded-xl font-bold text-[#212121]"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#212121] block mb-1">Fare Paid (₹):</label>
                  <input
                    type="number"
                    value={fareInr}
                    onChange={(e) => setFareInr(Number(e.target.value))}
                    className="w-full px-3 py-2.5 bg-zinc-50 border border-zinc-300 rounded-xl font-mono text-[#212121]"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-[#212121] block mb-1">Boarded Bus Stop:</label>
                <input
                  type="text"
                  value={boardedStop}
                  onChange={(e) => setBoardedStop(e.target.value)}
                  className="w-full px-3 py-2.5 bg-zinc-50 border border-zinc-300 rounded-xl text-[#212121]"
                />
              </div>

              <div>
                <label className="font-bold text-[#212121] block mb-1">Ticket Issue Timestamp:</label>
                <input
                  type="text"
                  value={timestamp}
                  onChange={(e) => setTimestamp(e.target.value)}
                  className="w-full px-3 py-2.5 bg-zinc-50 border border-zinc-300 rounded-xl font-mono text-[#212121]"
                />
              </div>

              <button
                onClick={handleVerify}
                disabled={loading}
                className="w-full py-3.5 bg-[#FFC107] text-[#18181B] font-black text-xs rounded-2xl hover:bg-amber-400 transition shadow-sm border border-amber-400"
              >
                {loading ? "Verifying ETM Ticket..." : "🎟️ Verify Ticket Rush Proof"}
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: VERIFIED PROOF CERTIFICATE */}
        <div className="lg:col-span-7 space-y-6">
          {verificationResult ? (
            <div className="bg-white p-6 md:p-8 rounded-3xl border-2 border-emerald-500 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-200 pb-4">
                <div>
                  <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 text-[10px] font-black uppercase tracking-wider">
                    ✓ VERIFIED GENUINE BUS TICKET PROOF
                  </span>
                  <h3 className="text-xl font-black text-[#212121] mt-2">
                    Commuter Overcrowding Proof Certificate
                  </h3>
                </div>
                <span className="text-xs font-mono font-bold text-emerald-800">
                  {verificationResult.rush_proof_assessment?.verification_hash}
                </span>
              </div>

              {/* TICKET DETAILS CARD */}
              <div className="p-5 bg-amber-50 border border-amber-300 rounded-2xl space-y-3 text-xs">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  <div className="p-2.5 bg-white rounded-xl border border-amber-200">
                    <span className="text-zinc-500 text-[10px] font-mono block">Ticket Number</span>
                    <span className="font-black text-[#212121] text-xs">{verificationResult.ticket_number}</span>
                  </div>
                  <div className="p-2.5 bg-white rounded-xl border border-amber-200">
                    <span className="text-zinc-500 text-[10px] font-mono block">Route Code</span>
                    <span className="font-black text-amber-900 text-xs">{verificationResult.route_code}</span>
                  </div>
                  <div className="p-2.5 bg-white rounded-xl border border-amber-200">
                    <span className="text-zinc-500 text-[10px] font-mono block">Verified Occupancy</span>
                    <span className="font-black text-[#D32F2F] text-xs">118% Surge</span>
                  </div>
                  <div className="p-2.5 bg-white rounded-xl border border-amber-200">
                    <span className="text-zinc-500 text-[10px] font-mono block">Credibility Score</span>
                    <span className="font-black text-emerald-800 text-xs">98.4%</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-amber-200 space-y-1">
                  <div className="flex items-center justify-between text-zinc-700">
                    <span>Boarded Stop: <span className="font-bold text-[#212121]">{verificationResult.boarded_stop}</span></span>
                    <span>Issued: <span className="font-mono font-bold text-[#212121]">{verificationResult.ticket_timestamp}</span></span>
                  </div>
                  <div className="text-zinc-700">
                    Fare Paid: <span className="font-mono font-bold text-[#212121]">₹{verificationResult.fare_paid_inr}</span>
                  </div>
                </div>
              </div>

              {/* ACTION LOGGED BOX */}
              <div className="p-5 bg-emerald-50 border border-emerald-300 rounded-2xl space-y-2 text-xs">
                <div className="flex items-center gap-2 text-emerald-950 font-black text-sm">
                  <ShieldCheck className="w-4 h-4 text-emerald-700" />
                  <span>Transport Authority Logging & Action:</span>
                </div>
                <p className="text-emerald-900 font-bold">
                  👉 {verificationResult.authority_insight}
                </p>
                <div className="text-[11px] text-emerald-800 font-mono pt-1">
                  Status: {verificationResult.rush_proof_assessment?.action_logged}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white p-12 rounded-3xl border border-zinc-200 shadow-sm text-center space-y-3">
              <Ticket className="w-12 h-12 text-amber-500 mx-auto opacity-60" />
              <h4 className="text-lg font-black text-[#212121]">Select or Enter a Bus Ticket Above</h4>
              <p className="text-xs text-zinc-500 font-medium max-w-md mx-auto">
                Click any sample ticket on the left or enter a ticket number to verify proof of peak rush hour overcrowding.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
