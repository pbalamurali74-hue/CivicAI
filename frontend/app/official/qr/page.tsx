"use client";

import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { ShieldCheck, Download, Printer, Star, Building2, User, Sparkles } from "lucide-react";

export default function OfficerQrGeneratorPage() {
  const [officerId, setOfficerId] = useState("TN-POL-10001");
  const [officerName, setOfficerName] = useState("Rajesh Kumar");
  const [dept, setDept] = useState("Tamil Nadu Police");
  const [designation, setDesignation] = useState("Traffic Police Inspector");
  const [office, setOffice] = useState("Chennai Traffic Division - Guindy");

  const verifyUrl = `http://localhost:3000/verify?officer_id=${encodeURIComponent(officerId)}`;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-3">
          <ShieldCheck className="w-4 h-4" /> UPI-Style Official Digital Credential
        </div>
        <h1 className="text-3xl font-extrabold text-white">Official QR Badge Generator</h1>
        <p className="text-slate-400 text-sm mt-2 max-w-xl mx-auto">
          Every active officer is issued a unique verification QR code. Citizens can scan this badge on duty to verify authenticity immediately.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* INPUT FORM */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4 text-xs">
          <h3 className="font-bold text-white text-base border-b border-slate-800 pb-2">Officer Details</h3>
          
          <div>
            <label className="text-slate-300 block mb-1 font-semibold">Officer ID</label>
            <input
              type="text"
              value={officerId}
              onChange={(e) => setOfficerId(e.target.value)}
              className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono"
            />
          </div>

          <div>
            <label className="text-slate-300 block mb-1 font-semibold">Officer Name</label>
            <input
              type="text"
              value={officerName}
              onChange={(e) => setOfficerName(e.target.value)}
              className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white"
            />
          </div>

          <div>
            <label className="text-slate-300 block mb-1 font-semibold">Department</label>
            <input
              type="text"
              value={dept}
              onChange={(e) => setDept(e.target.value)}
              className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white"
            />
          </div>

          <div>
            <label className="text-slate-300 block mb-1 font-semibold">Designation</label>
            <input
              type="text"
              value={designation}
              onChange={(e) => setDesignation(e.target.value)}
              className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white"
            />
          </div>

          <div>
            <label className="text-slate-300 block mb-1 font-semibold">Office Location</label>
            <input
              type="text"
              value={office}
              onChange={(e) => setOffice(e.target.value)}
              className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white"
            />
          </div>
        </div>

        {/* PRINTABLE QR BADGE DISPLAY CARD */}
        <div className="bg-slate-900 border-2 border-emerald-500/80 p-8 rounded-3xl text-center space-y-6 shadow-2xl shadow-emerald-500/10 print:border-black print:bg-white print:text-black">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4 print:border-slate-300">
            <div className="flex items-center gap-2 text-left">
              <div className="w-8 h-8 rounded bg-emerald-500 text-slate-950 font-black flex items-center justify-center">
                C
              </div>
              <div>
                <span className="font-bold text-white text-sm block leading-none print:text-black">CivicAI</span>
                <span className="text-[10px] text-slate-400 font-mono print:text-slate-600">Gov Trust Portal</span>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-bold font-mono">
              ACTIVE OFFICER
            </span>
          </div>

          {/* QR CODE CONTAINER */}
          <div className="p-4 bg-white rounded-2xl inline-block shadow-inner mx-auto border-4 border-slate-200">
            <QRCodeSVG value={verifyUrl} size={180} level="H" includeMargin={true} />
          </div>

          <div>
            <h3 className="text-xl font-black text-white print:text-black">{officerName}</h3>
            <p className="text-xs text-emerald-400 font-semibold mt-0.5">{designation}</p>
            <p className="text-xs text-slate-400 font-mono mt-1 print:text-slate-600">ID: {officerId}</p>
            <p className="text-xs text-slate-400 mt-1 print:text-slate-600">{dept} • {office}</p>
          </div>

          <div className="pt-4 border-t border-slate-800 text-[11px] text-slate-400 print:border-slate-300 print:text-slate-600">
            Scan to instantly verify credentials & report extortion.
          </div>

          <div className="flex items-center justify-center gap-3 pt-2 print:hidden">
            <button
              onClick={handlePrint}
              className="px-5 py-2.5 bg-emerald-500 text-slate-950 font-bold text-xs rounded-xl hover:bg-emerald-400 transition flex items-center gap-2"
            >
              <Printer className="w-4 h-4" /> Print QR Badge
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
