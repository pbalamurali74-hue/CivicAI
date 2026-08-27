"use client";

import { useState, useEffect } from "react";
import { AlertTriangle, CheckCircle2, Clock, FileText, Send, ShieldAlert, Sparkles } from "lucide-react";
import { submitGrievance, getGrievances } from "@/lib/api";

export default function GrievancesPage() {
  const [category, setCategory] = useState("Fake official");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("Guindy Station Road");
  const [officerId, setOfficerId] = useState("");
  const [grievances, setGrievances] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState<any>(null);

  const categories = [
    "Fake official",
    "Bribery/extortion",
    "Wrong information",
    "Transport issue",
    "Bus overcrowding",
    "Other"
  ];

  const fetchGrievances = async () => {
    try {
      const data = await getGrievances();
      setGrievances(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchGrievances();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await submitGrievance({
        category,
        description,
        location,
        officer_id: officerId || null,
      });
      setSubmitted(res);
      setDescription("");
      fetchGrievances();
    } catch (err: any) {
      alert("Error logging complaint: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-red-100 border border-red-300 text-[#D32F2F] text-xs font-black mb-2 shadow-sm">
            <ShieldAlert className="w-4 h-4 text-[#D32F2F]" /> Civic Accountability & Extortion Reporting
          </div>
          <h1 className="text-3xl font-black text-[#212121]">Grievance Redressal Portal</h1>
          <p className="text-zinc-600 text-sm font-semibold mt-1">
            Report unverified officials, extortion, or transit issues directly to state authorities.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* SUBMISSION FORM */}
        <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm space-y-4">
          <h3 className="font-black text-[#212121] text-base border-b border-zinc-200 pb-2">Log New Complaint</h3>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="text-zinc-700 block mb-1 font-bold">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-3 bg-zinc-50 border border-zinc-300 rounded-2xl text-[#212121] font-bold"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-zinc-700 block mb-1 font-bold">Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Incident Location (e.g. Guindy)"
                className="w-full p-3 bg-zinc-50 border border-zinc-300 rounded-2xl text-[#212121] font-bold"
                required
              />
            </div>

            <div>
              <label className="text-zinc-700 block mb-1 font-bold">Officer ID (Optional)</label>
              <input
                type="text"
                value={officerId}
                onChange={(e) => setOfficerId(e.target.value)}
                placeholder="e.g. TN-POL-10004"
                className="w-full p-3 bg-zinc-50 border border-zinc-300 rounded-2xl text-[#212121] font-mono font-bold"
              />
            </div>

            <div>
              <label className="text-zinc-700 block mb-1 font-bold">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the incident in detail..."
                className="w-full p-3 bg-zinc-50 border border-zinc-300 rounded-2xl text-[#212121] font-bold h-24"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="clay-button-red-3d w-full py-3.5 text-white font-black text-xs rounded-2xl shadow-md flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>{loading ? "Submitting..." : "Submit Grievance"}</span>
            </button>
          </form>

          {submitted && (
            <div className="p-4 bg-amber-50 border border-amber-300 rounded-2xl text-xs text-amber-950 space-y-1 font-bold">
              <span className="font-black flex items-center gap-1 text-amber-900">
                <CheckCircle2 className="w-4 h-4 text-amber-700" /> Complaint Submitted Successfully!
              </span>
              <p className="font-mono text-[#212121]">ID: {submitted.complaint_id}</p>
              <p className="text-[10px] text-zinc-600">Status: {submitted.status}</p>
            </div>
          )}
        </div>

        {/* GRIEVANCE LIST & STATUS TRACKER */}
        <div className="md:col-span-2 space-y-4">
          <h3 className="font-black text-[#212121] text-base">Track Grievance Status ({grievances.length})</h3>

          <div className="space-y-3 max-h-[550px] overflow-y-auto pr-1">
            {grievances.map((g) => (
              <div key={g.complaint_id} className="p-5 rounded-3xl bg-white border border-zinc-200 shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-black text-amber-700">{g.complaint_id}</span>
                  <span className={`px-2.5 py-0.5 rounded text-[10px] font-black uppercase ${
                    g.status === "Resolved"
                      ? "bg-amber-100 text-amber-900 border border-amber-300"
                      : "bg-red-100 text-[#D32F2F] border border-red-300"
                  }`}>
                    {g.status}
                  </span>
                </div>

                <div className="text-xs font-black text-[#212121]">{g.category} • Location: {g.location}</div>
                <p className="text-xs text-zinc-600 font-medium">{g.description}</p>
                {g.officer_id && (
                  <span className="text-[10px] font-mono text-[#D32F2F] font-black block">Flagged Officer: {g.officer_id}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
