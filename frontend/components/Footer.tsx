import Link from "next/link";
import { ShieldCheck, Bus, Building2, Cpu, Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-zinc-100 border-t border-zinc-200 pt-12 pb-20 lg:pb-12 text-zinc-700 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-xl bg-[#FFC107] text-[#18181B] flex items-center justify-center font-black text-sm shadow-sm border border-amber-300">
                <ShieldCheck className="w-5 h-5 stroke-[2.5]" />
              </div>
              <span className="text-[#212121] font-black text-base font-mono">CIVICSHIELD</span>
            </div>
            <p className="text-xs text-zinc-600 leading-relaxed mb-3">
              Unified Civic Trust & Smart Mobility Platform. Empowering citizens with real-time official QR verification, government office discovery, and AI-optimized transit routes.
            </p>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-800 text-xs border border-amber-500/30 font-bold font-mono">
              <Cpu className="w-3.5 h-3.5" /> RakshaTech Synapse Edition
            </span>
          </div>

          <div>
            <h4 className="text-[#212121] font-black text-xs uppercase tracking-wider mb-3">Civic Trust</h4>
            <ul className="space-y-2 text-xs font-semibold">
              <li><Link href="/verify" className="hover:text-amber-600 transition">Verify Government Official</Link></li>
              <li><Link href="/official/qr" className="hover:text-amber-600 transition">Official QR Generator</Link></li>
              <li><Link href="/ratings" className="hover:text-amber-600 transition">Ratings & Anti-Abuse AI</Link></li>
              <li><Link href="/grievances" className="hover:text-amber-600 transition">Submit Grievance</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-[#212121] font-black text-xs uppercase tracking-wider mb-3">Smart Mobility</h4>
            <ul className="space-y-2 text-xs font-semibold">
              <li><Link href="/mobility" className="hover:text-amber-600 transition">Multimodal Route Planner</Link></li>
              <li><Link href="/live-transit" className="hover:text-amber-600 transition">Live Bus Tracker</Link></li>
              <li><Link href="/transport/demand" className="hover:text-amber-600 transition">Bus Demand Analytics</Link></li>
              <li><Link href="/offices" className="hover:text-amber-600 transition">Government Office Locator</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-[#212121] font-black text-xs uppercase tracking-wider mb-3">Role Portals</h4>
            <ul className="space-y-2 text-xs font-semibold">
              <li><Link href="/dashboard" className="hover:text-amber-600 transition">Citizen Dashboard</Link></li>
              <li><Link href="/official/dashboard" className="hover:text-amber-600 transition">Official Portal</Link></li>
              <li><Link href="/authority/dashboard" className="hover:text-amber-600 transition">Transport Authority</Link></li>
              <li><Link href="/admin" className="hover:text-amber-600 transition">Admin System Analytics</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-zinc-200 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-500 gap-2">
          <p>© 2026 CivicShield Platform. Designed for Smart Governance & Intelligent Transit.</p>
          <div className="flex items-center gap-4 font-semibold">
            <span className="hover:text-zinc-700 transition">Chennai Pilot Zone</span>
            <span>•</span>
            <span className="hover:text-zinc-700 transition">GTFS Compatible</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

