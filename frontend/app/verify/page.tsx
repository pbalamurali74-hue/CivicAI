"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { 
  ShieldCheck, 
  AlertTriangle, 
  XCircle, 
  Search, 
  QrCode, 
  Star, 
  Building2, 
  Calendar, 
  CheckCircle2,
  Sparkles,
  Camera,
  Volume2
} from "lucide-react";
import GuidedWalkthroughBanner from "@/components/GuidedWalkthroughBanner";
import { verifyOfficer, submitOfficerRating } from "@/lib/api";
import { useLanguage } from "@/context/LanguageContext";

function OfficialVerificationContent() {
  const { t, language } = useLanguage();
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialOfficerId = searchParams.get("officer_id") || "TN-POL-10001";

  const [inputOfficerId, setInputOfficerId] = useState(initialOfficerId);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);

  // Rating Modal state
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [prof, setProf] = useState(5);
  const [beh, setBeh] = useState(5);
  const [transp, setTransp] = useState(5);
  const [qual, setQual] = useState(5);
  const [comment, setComment] = useState("");
  const [ratingStatus, setRatingStatus] = useState<any>(null);
  const [submittingRating, setSubmittingRating] = useState(false);

  const handleVerify = async (idToSearch?: string) => {
    const queryId = idToSearch || inputOfficerId;
    if (!queryId) return;

    setLoading(true);
    setResult(null);
    try {
      const data = await verifyOfficer(queryId);
      setResult(data);
    } catch (err: any) {
      setResult({
        status: "INVALID",
        message: err.message || "Verification failed. Officer ID not found."
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialOfficerId) {
      handleVerify(initialOfficerId);
    }
  }, []);

  const handleRatingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!result?.officer?.officer_id) return;

    setSubmittingRating(true);
    try {
      const res = await submitOfficerRating(result.officer.officer_id, {
        professionalism: prof,
        behavior: beh,
        transparency: transp,
        service_quality: qual,
        comment,
      });
      setRatingStatus(res);
      handleVerify(result.officer.officer_id);
    } catch (err: any) {
      alert("Failed to submit rating: " + err.message);
    } finally {
      setSubmittingRating(false);
    }
  };

  const walkthroughSteps = [
    { title: "Point Camera", speech: "Please point your phone camera at the official's QR code, or enter their Officer ID below." },
    { title: "Check Badge", speech: "Look for the big green check mark. If you see red or do not pay, do not give any money." }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <GuidedWalkthroughBanner steps={walkthroughSteps} />

      {/* HEADER */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold mb-3">
          <ShieldCheck className="w-4 h-4" /> {t("checkOfficial")}
        </div>
        <h1 className="text-3xl md:text-4xl font-black text-[#212121]">{t("verifyOfficial")}</h1>
        <p className="text-zinc-600 text-sm mt-2 max-w-xl mx-auto font-medium">
          {t("pointCameraQr")}
        </p>
      </div>

      {/* CAMERA SCANNER AREA & MANUAL INPUT CARD */}
      <div className="bg-white p-6 rounded-3xl mb-8 border border-zinc-200 shadow-sm space-y-6">
        {/* CAMERA SCANNER TARGET BOX */}
        <div className="p-6 bg-zinc-50 border-2 border-dashed border-amber-400 rounded-3xl text-center flex flex-col items-center justify-center space-y-3 relative overflow-hidden">
          <div className="w-20 h-20 rounded-full bg-[#FFC107] text-[#18181B] flex items-center justify-center text-3xl shadow-md border-2 border-white font-black">
            📷
          </div>
          <div>
            <h3 className="font-black text-[#212121] text-base">{t("pointCameraQr")}</h3>
            <p className="text-xs text-zinc-500 mt-1">Automatic QR Scanner Active</p>
          </div>
          <button
            onClick={() => setCameraActive(!cameraActive)}
            className="px-5 py-2.5 bg-white text-amber-800 border border-zinc-300 rounded-xl text-xs font-bold hover:bg-zinc-100 transition shadow-sm"
          >
            {cameraActive ? "Stop Camera" : "Open Camera Scanner"}
          </button>
        </div>

        {/* MANUAL ENTRY */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-grow w-full">
            <Search className="w-5 h-5 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={inputOfficerId}
              onChange={(e) => setInputOfficerId(e.target.value)}
              placeholder="Enter Officer ID (e.g. TN-POL-10001)"
              className="w-full pl-11 pr-4 py-3.5 bg-white border border-zinc-300 rounded-2xl text-[#212121] placeholder-zinc-400 font-mono text-sm focus:outline-none focus:border-[#FFC107] transition min-h-[52px] shadow-sm"
            />
          </div>
          <button
            onClick={() => handleVerify()}
            disabled={loading}
            className="w-full sm:w-auto px-8 py-3.5 bg-[#FFC107] text-[#18181B] font-black text-sm rounded-2xl hover:bg-[#F59E0B] transition flex items-center justify-center gap-2 shadow-md min-h-[52px]"
          >
            {loading ? "Verifying..." : t("checkOfficial")}
          </button>
        </div>

        {/* QUICK SELECTOR DEMOS */}
        <div className="pt-4 border-t border-zinc-200 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-zinc-500 font-bold">Demo QR Quick Select:</span>
          <button
            onClick={() => { setInputOfficerId("TN-POL-10001"); handleVerify("TN-POL-10001"); }}
            className="px-3 py-1.5 rounded-xl bg-amber-50 text-amber-900 font-mono hover:bg-amber-100 border border-amber-300 font-black"
          >
            TN-POL-10001 (Verified Active)
          </button>
          <button
            onClick={() => { setInputOfficerId("TN-POL-10004"); handleVerify("TN-POL-10004"); }}
            className="px-3 py-1.5 rounded-xl bg-red-50 text-red-800 font-mono hover:bg-red-100 border border-red-300 font-black"
          >
            TN-POL-10004 (Suspended)
          </button>
          <button
            onClick={() => { setInputOfficerId("INVALID-999"); handleVerify("INVALID-999"); }}
            className="px-3 py-1.5 rounded-xl bg-red-100 text-red-900 font-mono hover:bg-red-200 border border-red-400 font-black"
          >
            INVALID-999 (Fake Officer)
          </button>
        </div>
      </div>

      {/* VERIFICATION RESULT CARDS */}

      {/* 1. GOLDEN YELLOW VERIFIED CARD */}
      {result?.status === "VERIFIED" && result.officer && (
        <div className="bg-white border-2 border-[#FFC107] p-8 rounded-3xl shadow-lg mb-8 animate-fadeIn space-y-6">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <div className="relative shrink-0">
              <img
                src={result.officer.photo_url || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"}
                alt={result.officer.name}
                className="w-32 h-32 rounded-3xl object-cover border-4 border-[#FFC107] shadow-md"
              />
              <div className="absolute -top-3 -right-3 w-10 h-10 rounded-full bg-[#FFC107] text-[#18181B] font-black flex items-center justify-center text-xl shadow-md border-2 border-white">
                ✓
              </div>
            </div>

            <div className="flex-grow text-center md:text-left space-y-3">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FFC107] text-[#18181B] font-black text-sm uppercase tracking-wider shadow-sm">
                🟡 <span>{t("officialVerified")}</span>
              </div>

              {/* Multi-lingual verification captions */}
              <div className="text-xs font-bold text-amber-800 space-y-0.5">
                <p>இந்த அதிகாரி சரிபார்க்கப்பட்டவர் (Tamil)</p>
                <p>ఈ అధికారి ధృవీకరించబడ్డారు (Telugu)</p>
              </div>

              <div>
                <h2 className="text-3xl font-black text-[#212121]">{result.officer.name}</h2>
                <p className="text-amber-700 font-bold text-base">{result.officer.designation}</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 text-xs">
                <div className="bg-zinc-50 p-3 rounded-2xl border border-zinc-200">
                  <span className="text-zinc-500 block text-[10px] font-medium">Officer ID</span>
                  <span className="font-mono font-black text-[#212121] text-sm">{result.officer.officer_id}</span>
                </div>
                <div className="bg-zinc-50 p-3 rounded-2xl border border-zinc-200">
                  <span className="text-zinc-500 block text-[10px] font-medium">Department</span>
                  <span className="font-bold text-[#212121] text-xs">{result.officer.department}</span>
                </div>
                <div className="bg-zinc-50 p-3 rounded-2xl border border-zinc-200">
                  <span className="text-zinc-500 block text-[10px] font-medium">Trust Score</span>
                  <span className="font-black text-amber-700 text-xs flex items-center gap-1">
                    ⭐ {result.officer.trust_score} / 5.0
                  </span>
                </div>
              </div>

              <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 font-bold flex items-center justify-between">
                <span>✓ {t("alwaysVerifyNotice")}</span>
              </div>

              <div className="pt-2 flex flex-wrap items-center gap-3">
                <button
                  onClick={() => setShowRatingModal(true)}
                  className="px-6 py-3 bg-[#FFC107] text-[#18181B] font-black text-xs rounded-2xl hover:bg-[#F59E0B] transition flex items-center gap-2 min-h-[48px] shadow-sm"
                >
                  ⭐ Rate Official Performance
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. RED WARNING CARD (SUSPENDED) */}
      {result?.status === "SUSPENDED" && (
        <div className="bg-red-50 border-3 border-[#D32F2F] p-8 rounded-3xl shadow-lg mb-8 animate-fadeIn space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-[#D32F2F] text-white flex items-center justify-center font-black text-3xl shadow-md">
              ⚠️
            </div>
            <div>
              <span className="px-3 py-1 rounded-full bg-[#D32F2F] text-white font-black text-xs uppercase shadow-sm">
                🔴 {t("officialSuspended")}
              </span>
              <h2 className="text-2xl font-black text-red-950 mt-1">{result.officer?.name || "Official"}</h2>
            </div>
          </div>

          <div className="bg-red-100 border border-red-300 p-5 rounded-2xl text-xs text-red-950 space-y-2 flex items-center justify-between">
            <div>
              <p className="font-black text-[#D32F2F] text-base">🔴 {t("doNotPay")}</p>
              <p className="mt-1 font-bold">WARNING: THIS OFFICIAL IS SUSPENDED FROM DUTY.</p>
            </div>
          </div>
        </div>
      )}

      {/* 3. RED INVALID CARD */}
      {result?.status === "INVALID" && (
        <div className="bg-red-50 border-3 border-[#D32F2F] p-8 rounded-3xl shadow-lg mb-8 animate-fadeIn text-center space-y-4">
          <div className="w-20 h-20 rounded-full bg-red-100 text-[#D32F2F] flex items-center justify-center mx-auto border-2 border-red-300 text-4xl shadow-sm">
            🔴
          </div>
          <div className="inline-block px-4 py-1.5 rounded-full bg-[#D32F2F] text-white font-black text-sm uppercase tracking-wider shadow-sm">
            🔴 {t("doNotPay")} • {t("officialNotVerified")}
          </div>
          <h2 className="text-2xl font-black text-red-950 mt-2">Fake Officer or Invalid ID</h2>
          <p className="text-red-900 text-xs max-w-md mx-auto font-bold">{result.message}</p>
        </div>
      )}

      {/* RATING MODAL */}
      {showRatingModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel p-6 rounded-3xl max-w-lg w-full border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-lg flex items-center gap-2">
                ⭐ Rate Official Performance
              </h3>
              <button onClick={() => setShowRatingModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleRatingSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 block mb-1">Professionalism (1-5)</label>
                  <input type="number" min="1" max="5" value={prof} onChange={(e) => setProf(parseInt(e.target.value))} className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white" />
                </div>
                <div>
                  <label className="text-slate-300 block mb-1">Behavior (1-5)</label>
                  <input type="number" min="1" max="5" value={beh} onChange={(e) => setBeh(parseInt(e.target.value))} className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white" />
                </div>
                <div>
                  <label className="text-slate-300 block mb-1">Transparency (1-5)</label>
                  <input type="number" min="1" max="5" value={transp} onChange={(e) => setTransp(parseInt(e.target.value))} className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white" />
                </div>
                <div>
                  <label className="text-slate-300 block mb-1">Service Quality (1-5)</label>
                  <input type="number" min="1" max="5" value={qual} onChange={(e) => setQual(parseInt(e.target.value))} className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white" />
                </div>
              </div>

              <div>
                <label className="text-slate-300 block mb-1">Feedback Comment (Optional)</label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Provide brief details..."
                  className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white h-20"
                />
              </div>

              {ratingStatus && (
                <div className={`p-3 rounded-xl text-xs font-semibold ${
                  ratingStatus.is_suspicious ? "bg-amber-500/10 border border-amber-500/30 text-amber-300" : "bg-emerald-500/10 border border-emerald-500/30 text-emerald-300"
                }`}>
                  <p className="font-bold">{ratingStatus.is_suspicious ? "⚠ AI Anti-Abuse Flag" : "✓ AI Rating Validated"}</p>
                  <p className="mt-0.5">{ratingStatus.status_message}</p>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowRatingModal(false)} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl">Close</button>
                <button type="submit" disabled={submittingRating} className="px-6 py-2.5 bg-emerald-500 text-slate-950 font-bold rounded-xl hover:bg-emerald-400">
                  {submittingRating ? "Evaluating..." : "Submit Rating"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function OfficialVerificationPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-slate-400">Loading Verification Protocol...</div>}>
      <OfficialVerificationContent />
    </Suspense>
  );
}
