"use client";

import { useEffect, useState } from "react";
import { User, ShieldCheck, Mail, Calendar, Key, CheckCircle2 } from "lucide-react";

export default function ProfilePage() {
  const [role, setRole] = useState("CITIZEN");
  const [email, setEmail] = useState("citizen@demo.com");

  useEffect(() => {
    setRole(localStorage.getItem("civicai_role") || "CITIZEN");
    setEmail(localStorage.getItem("civicai_email") || "citizen@demo.com");
  }, []);

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl space-y-6">
        <div className="flex items-center gap-4 border-b border-slate-800 pb-6">
          <div className="w-16 h-16 rounded-2xl bg-cyan-500/20 text-cyan-400 font-bold text-2xl flex items-center justify-center border border-cyan-500/30">
            {role[0]}
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-white">{email.split("@")[0]}</h2>
            <span className="px-2.5 py-0.5 rounded bg-cyan-500/20 text-cyan-400 font-mono text-xs font-bold border border-cyan-500/30">
              Role: {role}
            </span>
          </div>
        </div>

        <div className="space-y-4 text-xs">
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
            <span className="text-slate-400 flex items-center gap-2">
              <Mail className="w-4 h-4 text-cyan-400" /> Account Email:
            </span>
            <span className="font-mono text-white font-bold">{email}</span>
          </div>

          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
            <span className="text-slate-400 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> Account Security Level:
            </span>
            <span className="font-bold text-emerald-400">Verified Hackathon Demo Account</span>
          </div>

          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
            <span className="text-slate-400 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-400" /> Session Expiry:
            </span>
            <span className="font-mono text-slate-300">24 Hours (Active)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
