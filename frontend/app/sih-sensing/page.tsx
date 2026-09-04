"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Bus, 
  Camera, 
  Activity, 
  AlertTriangle, 
  ShieldCheck, 
  Zap, 
  Cpu, 
  MapPin, 
  CheckCircle2, 
  Radio, 
  Eye, 
  Layers, 
  FileText, 
  RotateCcw,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  HelpCircle,
  Sliders,
  Clock,
  Send,
  Lock,
  ChevronRight,
  TrendingUp,
  BarChart2
} from "lucide-react";
import MapWrapper from "@/components/MapWrapper";
import GuidedWalkthroughBanner from "@/components/GuidedWalkthroughBanner";
import { 
  getSensingFleet, 
  getSensingDetections, 
  getSensingTrafficIntelligence,
  getSensingRoadHealth,
  updateWorkOrderStatus
} from "@/lib/api";

const FALLBACK_BUSES = [
  {
    bus_id: "BUS-104A",
    reg_number: "TN-01-N-9842",
    route_code: "70H",
    route_name: "SRM Ramapuram ➔ Guindy ➔ T. Nagar",
    driver_name: "K. Selvam",
    speed_kmh: 34,
    lat: 13.0067,
    lng: 80.2020,
    status: "AI_ONLINE",
    edge_device: "NVIDIA Jetson AGX Orin 64GB (Simulated)",
    inference_fps: 45,
    cameras_active: 4,
    cameras: [
      { id: "CAM-FRONT", name: "Front Road AI Camera", resolution: "1080p 60FPS", status: "ACTIVE", role: "Potholes, cracks, waterlogging, debris" },
      { id: "CAM-REAR", name: "Rear Traffic AI Camera", resolution: "1080p 60FPS", status: "ACTIVE", role: "Traffic density & bottleneck intelligence" },
      { id: "CAM-LEFT", name: "Side Obstacle / Curb Camera", resolution: "720p 30FPS", status: "ACTIVE", role: "Damaged signs, garbage overflow, encroachment" },
      { id: "CAM-CABIN", name: "Cabin Passenger Safety Camera", resolution: "1080p 30FPS", status: "ACTIVE", role: "Secondary crowd density & interior safety" },
    ]
  },
  {
    bus_id: "BUS-102",
    reg_number: "TN-02-M-4410",
    route_code: "101A",
    route_name: "Koyambedu CMBT ➔ Central Railway Station",
    driver_name: "P. Arumugam",
    speed_kmh: 28,
    lat: 13.0694,
    lng: 80.1948,
    status: "AI_ONLINE",
    edge_device: "NVIDIA Jetson Xavier NX (Simulated)",
    inference_fps: 38,
    cameras_active: 4,
    cameras: [
      { id: "CAM-FRONT", name: "Front Road AI Camera", resolution: "1080p 60FPS", status: "ACTIVE", role: "Potholes, cracks, waterlogging, debris" },
      { id: "CAM-REAR", name: "Rear Traffic AI Camera", resolution: "1080p 60FPS", status: "ACTIVE", role: "Traffic density & bottleneck intelligence" },
      { id: "CAM-LEFT", name: "Side Obstacle / Curb Camera", resolution: "720p 30FPS", status: "ACTIVE", role: "Damaged signs, garbage overflow, encroachment" },
      { id: "CAM-CABIN", name: "Cabin Passenger Safety Camera", resolution: "1080p 30FPS", status: "ACTIVE", role: "Secondary crowd density & interior safety" },
    ]
  },
  {
    bus_id: "BUS-103",
    reg_number: "TN-07-H-3129",
    route_code: "23C",
    route_name: "Adayar Depot ➔ Egmore Station",
    driver_name: "M. Sundaram",
    speed_kmh: 41,
    lat: 13.0067,
    lng: 80.2571,
    status: "AI_ONLINE",
    edge_device: "NVIDIA Jetson AGX Orin 64GB (Simulated)",
    inference_fps: 48,
    cameras_active: 4,
    cameras: [
      { id: "CAM-FRONT", name: "Front Road AI Camera", resolution: "1080p 60FPS", status: "ACTIVE", role: "Potholes, cracks, waterlogging, debris" },
      { id: "CAM-REAR", name: "Rear Traffic AI Camera", resolution: "1080p 60FPS", status: "ACTIVE", role: "Traffic density & bottleneck intelligence" },
      { id: "CAM-LEFT", name: "Side Obstacle / Curb Camera", resolution: "720p 30FPS", status: "ACTIVE", role: "Damaged signs, garbage overflow, encroachment" },
      { id: "CAM-CABIN", name: "Cabin Passenger Safety Camera", resolution: "1080p 30FPS", status: "ACTIVE", role: "Secondary crowd density & interior safety" },
    ]
  }
];

export default function SihSensingPage() {
  const [fleetData, setFleetData] = useState<any>({
    active_sensing_buses: 3,
    total_cameras_online: 48,
    buses: FALLBACK_BUSES
  });
  const [detections, setDetections] = useState<any[]>([]);
  const [roadSegments, setRoadSegments] = useState<any[]>([]);
  const [traffic, setTraffic] = useState<any>(null);
  const [selectedBus, setSelectedBus] = useState<any>(FALLBACK_BUSES[0]);
  const [selectedCamera, setSelectedCamera] = useState<string>("CAM-FRONT");
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [demoStep, setDemoStep] = useState<number>(1);
  const [activeCategory, setActiveCategory] = useState<string>("ALL");
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  useEffect(() => {
    async function loadAllData() {
      try {
        const [fleet, evts, tfc, segments] = await Promise.all([
          getSensingFleet().catch(() => null),
          getSensingDetections().catch(() => null),
          getSensingTrafficIntelligence().catch(() => null),
          getSensingRoadHealth().catch(() => null)
        ]);

        if (fleet?.buses?.length > 0) {
          setFleetData(fleet);
          setSelectedBus(fleet.buses[0]);
        }
        if (evts?.events?.length > 0) {
          setDetections(evts.events);
          setSelectedEvent(evts.events[0]);
        }
        if (tfc) setTraffic(tfc);
        if (segments?.segments?.length > 0) setRoadSegments(segments.segments);
      } catch (err) {
        console.error("Error loading SIH PS 26124 data:", err);
      }
    }
    loadAllData();
  }, []);

  // 7-Step Evaluator Walkthrough Controller
  const demoStepsList = [
    { 
      step: 1, 
      title: "1. Select BUS-104A", 
      desc: "Select flagship mobile sensing unit BUS-104A (TN-01-N-9842) cruising on Route 70H." 
    },
    { 
      step: 2, 
      title: "2. Onboard 4-Camera Streams", 
      desc: "Inspect 4 onboard AI cameras (Front Road, Rear Traffic, Side Infrastructure, Cabin Safety)." 
    },
    { 
      step: 3, 
      title: "3. AI Pothole Detection", 
      desc: "Edge computer vision detects severe asphalt pothole on Front Road camera (94.8% confidence)." 
    },
    { 
      step: 4, 
      title: "4. GPS & Civic Risk Score", 
      desc: "Attach GPS (13.0067°N, 80.2020°E) and compute Civic Risk Score: 92/100 (CRITICAL)." 
    },
    { 
      step: 5, 
      title: "5. Multi-Bus Verification", 
      desc: "Cross-validate duplicate sightings across 3 independent buses (BUS-104A, BUS-102, BUS-103)." 
    },
    { 
      step: 6, 
      title: "6. GIS Map & Work Order", 
      desc: "Auto-pin hazard on Central GIS Command Map & dispatch Work Order #GCC-ROAD-4092." 
    },
    { 
      step: 7, 
      title: "7. Municipal Resolution", 
      desc: "Track work order transition from Assigned ➔ In Progress ➔ Resolved by GCC Road Crews." 
    }
  ];

  const handleStepClick = (stepNum: number) => {
    setDemoStep(stepNum);
    const primaryPothole = detections.find(d => d.event_id === "EVT-8091") || detections[0];

    if (stepNum === 1 || stepNum === 2) {
      if (fleetData?.buses?.[0]) setSelectedBus(fleetData.buses[0]);
      setSelectedCamera("CAM-FRONT");
      if (primaryPothole) setSelectedEvent(primaryPothole);
    } else if (stepNum === 3 || stepNum === 4 || stepNum === 5 || stepNum === 6) {
      if (fleetData?.buses?.[0]) setSelectedBus(fleetData.buses[0]);
      setSelectedCamera("CAM-FRONT");
      if (primaryPothole) setSelectedEvent(primaryPothole);
    } else if (stepNum === 7) {
      if (primaryPothole) {
        setSelectedEvent({ ...primaryPothole, work_order_status: "RESOLVED" });
      }
    }
  };

  const handleWorkOrderStatusChange = async (eventId: string, newStatus: string) => {
    setUpdatingOrderId(eventId);
    try {
      await updateWorkOrderStatus(eventId, newStatus);
      setDetections(prev => prev.map(d => d.event_id === eventId ? { ...d, work_order_status: newStatus } : d));
      if (selectedEvent?.event_id === eventId) {
        setSelectedEvent((prev: any) => ({ ...prev, work_order_status: newStatus }));
      }
    } catch (err) {
      console.error("Failed to update status:", err);
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const filteredDetections = activeCategory === "ALL" 
    ? detections 
    : detections.filter((d) => d.category === activeCategory);

  const walkthroughSteps = [
    { title: "PS 26124 Fleet AI Sensing", speech: "Welcome to SIH 2026 Problem Statement PS 26124 Mobile Urban Intelligence Platform." },
    { title: "Mobile Sensing Units", speech: "Buses act as mobile AI sensing units with 4 cameras, edge TensorRT inference, and multi-bus spatial verification." },
    { title: "Actionable Work Orders", speech: "Verified infrastructure hazards are tagged with a Civic Risk Score and auto-dispatched to municipal repair teams." }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-[#212121]">
      <GuidedWalkthroughBanner steps={walkthroughSteps} />

      {/* ========================================================================= */}
      {/* 1. HERO HEADER BANNER                                                     */}
      {/* ========================================================================= */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border-2 border-[#FFC107] shadow-md space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 border border-amber-300 text-amber-950 text-xs font-black uppercase tracking-wider">
                <Bus className="w-3.5 h-3.5 text-amber-600" />
                SIH 2026 PS 26124 • Mobile Urban Intelligence Platform
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-950 text-xs font-bold">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                Edge AI Pipeline Live
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-zinc-100 border border-zinc-300 text-zinc-700 text-xs font-mono font-bold">
                Primary Demo Unit: BUS-104A
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-[#212121]">
              Mobile Urban Sensing Fleet & Municipal AI Command
            </h1>
            <p className="text-zinc-600 text-xs sm:text-sm font-semibold max-w-4xl">
              Transforming public transport buses into continuous mobile urban intelligence units.
              Onboard Edge AI detects road potholes, waterlogging, damaged signs, and civic hazards, attaches GPS/time context,
              cross-verifies repeated sightings across multiple buses, calculates a transparent <strong>Civic Risk Score (0–100)</strong>,
              and auto-routes verified incidents to municipal repair crews.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 shrink-0">
            <div className="p-3 rounded-2xl bg-amber-50 border border-amber-300 text-right">
              <span className="text-[10px] font-mono text-zinc-500 font-bold uppercase block">Core Workflow</span>
              <span className="text-xs font-black text-amber-900 font-mono">
                BUS ➔ AI ➔ RISK ➔ VERIFY ➔ GIS ➔ WORK ORDER
              </span>
            </div>
          </div>
        </div>

        {/* TOP METRICS HIGHLIGHT BAR */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-4 border-t border-zinc-200">
          <div className="p-3 bg-zinc-50 rounded-2xl border border-zinc-200 text-center">
            <span className="text-[10px] font-mono text-zinc-500 font-bold uppercase block">Active Fleet Buses</span>
            <span className="text-xl sm:text-2xl font-black text-[#212121]">12 Units</span>
            <span className="text-[10px] text-emerald-600 font-bold block">BUS-104A Active</span>
          </div>
          <div className="p-3 bg-zinc-50 rounded-2xl border border-zinc-200 text-center">
            <span className="text-[10px] font-mono text-zinc-500 font-bold uppercase block">AI Camera Streams</span>
            <span className="text-xl sm:text-2xl font-black text-amber-600">48 Streams</span>
            <span className="text-[10px] text-zinc-500 font-bold block">4 Cameras / Bus</span>
          </div>
          <div className="p-3 bg-zinc-50 rounded-2xl border border-zinc-200 text-center">
            <span className="text-[10px] font-mono text-zinc-500 font-bold uppercase block">Detections Today</span>
            <span className="text-xl sm:text-2xl font-black text-indigo-600">282 Events</span>
            <span className="text-[10px] text-zinc-500 font-bold block">Across 4 Corridors</span>
          </div>
          <div className="p-3 bg-zinc-50 rounded-2xl border border-zinc-200 text-center">
            <span className="text-[10px] font-mono text-zinc-500 font-bold uppercase block">Critical Priority</span>
            <span className="text-xl sm:text-2xl font-black text-[#EF4444]">32 Critical</span>
            <span className="text-[10px] text-rose-600 font-bold block">Risk Score &gt; 80</span>
          </div>
          <div className="p-3 bg-zinc-50 rounded-2xl border border-zinc-200 text-center col-span-2 sm:col-span-1">
            <span className="text-[10px] font-mono text-zinc-500 font-bold uppercase block">Resolved Work Orders</span>
            <span className="text-xl sm:text-2xl font-black text-emerald-600">86 Fixed</span>
            <span className="text-[10px] text-zinc-500 font-bold block">Avg SLA: 3.4 Hrs</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. SIMPLIFIED 7-STEP INTERACTIVE SIH DEMO CONTROLLER                      */}
      {/* ========================================================================= */}
      <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-2xl bg-[#FFC107] text-[#18181B] font-black flex items-center justify-center text-sm shadow-sm">
              🎬
            </div>
            <div>
              <h2 className="text-base font-black text-[#212121]">SIH 7-Step Evaluator Walkthrough Controller</h2>
              <p className="text-xs text-zinc-500 font-medium">Click through the continuous story sequence to demonstrate the complete mobile sensing lifecycle</p>
            </div>
          </div>
          <button
            onClick={() => handleStepClick(1)}
            className="px-3 py-1.5 bg-amber-100 text-amber-950 border border-amber-300 rounded-xl text-xs font-black hover:bg-amber-200 flex items-center gap-1.5 transition self-start sm:self-auto"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Restart Demo
          </button>
        </div>

        {/* 7 Clean Steps Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {demoStepsList.map((s) => (
            <button
              key={s.step}
              onClick={() => handleStepClick(s.step)}
              className={`p-3 rounded-2xl text-left border text-xs font-bold transition flex flex-col justify-between min-h-[95px] ${
                demoStep === s.step
                  ? "bg-[#FFC107] text-[#18181B] border-amber-400 font-black shadow-md scale-102"
                  : "bg-zinc-50 text-zinc-700 border-zinc-200 hover:bg-zinc-100"
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span className="text-[10px] font-mono font-bold uppercase opacity-75">STEP #{s.step}</span>
                {demoStep === s.step && <span className="text-xs">▶</span>}
              </div>
              <span className="text-[11px] font-black leading-snug block my-1">{s.title}</span>
            </button>
          ))}
        </div>

        {/* Step Banner Detail & Next Button */}
        <div className="p-4 bg-amber-50 border border-amber-300 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-bold text-amber-950">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-amber-200 text-amber-900 font-mono text-[11px] font-black">
              ACTIVE STEP #{demoStep}
            </span>
            <span className="font-semibold">{demoStepsList[demoStep - 1]?.desc}</span>
          </div>

          <button
            onClick={() => handleStepClick(Math.min(7, demoStep + 1))}
            disabled={demoStep === 7}
            className="px-4 py-2 bg-[#FFC107] hover:bg-amber-400 text-[#18181B] font-black rounded-xl border border-amber-400 shadow-sm transition active:scale-95 disabled:opacity-50 flex items-center justify-center gap-1.5 self-end sm:self-auto"
          >
            <span>{demoStep === 7 ? "✓ Lifecycle Completed" : "Next Step →"}</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. CORE MULTI-CAMERA AI SENSING & LIVE INCIDENT INSPECTOR                 */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: BUS UNIT & 4-CAMERA SWITCHER */}
        <div className="lg:col-span-4 space-y-6">
          {/* Public Bus Fleet Unit Selector */}
          <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <h3 className="font-black text-[#212121] text-base flex items-center gap-2">
                <Bus className="w-5 h-5 text-amber-600" /> Public Fleet Bus Units
              </h3>
              <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                EDGE AI ONLINE
              </span>
            </div>

            <div className="space-y-2.5">
              {fleetData?.buses?.map((bus: any) => {
                const isSelected = selectedBus?.bus_id === bus.bus_id;
                return (
                  <div
                    key={bus.bus_id}
                    onClick={() => {
                      setSelectedBus(bus);
                      const matchingEvt = detections.find(d => d.bus_id === bus.bus_id) || detections[0];
                      if (matchingEvt) setSelectedEvent(matchingEvt);
                    }}
                    className={`p-3.5 rounded-2xl border transition cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? "bg-amber-50 border-2 border-[#FFC107] shadow-sm"
                        : "bg-zinc-50 border-zinc-200 hover:border-zinc-300"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-[#FFC107] text-[#18181B] font-black flex items-center justify-center text-sm shadow-sm border border-amber-300">
                        🚌
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-black text-sm text-[#212121]">{bus.bus_id}</span>
                          <span className="text-[11px] font-mono font-bold text-zinc-500">({bus.reg_number})</span>
                        </div>
                        <p className="text-[11px] text-zinc-600 font-medium">Route {bus.route_code}: {bus.route_name}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] font-mono font-bold text-emerald-700 block">⚡ {bus.status}</span>
                      <span className="text-xs font-mono font-black text-zinc-700">{bus.speed_kmh} km/h</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Onboard 4-Camera Feeds Switcher */}
          <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <h3 className="font-black text-[#212121] text-base flex items-center gap-2">
                <Camera className="w-5 h-5 text-amber-600" /> Onboard 4-Camera Feeds
              </h3>
              <span className="text-[10px] font-mono text-zinc-500 font-bold">{selectedBus?.reg_number}</span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {selectedBus?.cameras?.map((cam: any) => {
                const isSelected = selectedCamera === cam.id;
                return (
                  <button
                    key={cam.id}
                    onClick={() => setSelectedCamera(cam.id)}
                    className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between min-h-[75px] ${
                      isSelected
                        ? "bg-[#FFC107] text-[#18181B] border-amber-400 font-black shadow-sm"
                        : "bg-zinc-50 text-zinc-700 border-zinc-200 hover:bg-zinc-100"
                    }`}
                  >
                    <span className="text-[10px] font-mono font-bold block opacity-75">{cam.id}</span>
                    <span className="text-xs font-bold leading-tight block mt-1">{cam.name}</span>
                    <span className="text-[9px] font-medium opacity-80 mt-1 line-clamp-1">{cam.role}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* CENTER COLUMN: LIVE CAMERA EVIDENCE FEED & BOUNDING BOX OVERLAY */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <div>
                <span className="text-[10px] font-mono font-bold text-amber-700 uppercase tracking-wider block">
                  LIVE EDGE AI CAMERA FEED • {selectedCamera}
                </span>
                <h3 className="text-base font-black text-[#212121]">
                  {selectedBus?.cameras?.find((c: any) => c.id === selectedCamera)?.name || "Front AI Stream"}
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-ping" />
                <span className="text-xs font-mono font-black text-emerald-700">45 FPS (Simulated)</span>
              </div>
            </div>

            {/* COMPUTER VISION CANVAS WITH BOUNDING BOX ANIMATION */}
            <div className="relative w-full h-[290px] sm:h-[340px] bg-zinc-950 rounded-2xl overflow-hidden border-2 border-zinc-800 flex items-center justify-center shadow-inner">
              <img
                src={
                  selectedCamera === "CAM-REAR"
                    ? "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&auto=format&fit=crop&q=80"
                    : selectedCamera === "CAM-CABIN"
                    ? "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=800&auto=format&fit=crop&q=80"
                    : selectedCamera === "CAM-LEFT"
                    ? "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&auto=format&fit=crop&q=80"
                    : "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&auto=format&fit=crop&q=80"
                }
                alt="Camera Feed Stream"
                className="w-full h-full object-cover opacity-85"
              />

              {/* Edge AI Telemetry Overlay Top-Left */}
              <div className="absolute top-3 left-3 bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/20 font-mono text-[10px] text-amber-400 font-bold space-y-0.5">
                <div>BUS: {selectedBus?.bus_id} ({selectedBus?.reg_number})</div>
                <div>DEVICE: NVIDIA Jetson AGX Orin</div>
                <div>GPS: {selectedEvent?.lat?.toFixed(4)}°N, {selectedEvent?.lng?.toFixed(4)}°E</div>
                <div>FRAME RATE: 45 FPS • BUFFER: 800-byte JSON alert</div>
              </div>

              {/* Privacy Masking Tag Top-Right */}
              <div className="absolute top-3 right-3 bg-black/80 backdrop-blur-md px-2.5 py-1 rounded-xl border border-white/20 font-mono text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                <Lock className="w-3 h-3 text-emerald-400" />
                <span>PRIVACY MASKED</span>
              </div>

              {/* BOUNDING BOX ANIMATION OVERLAY */}
              {selectedEvent && (
                <div
                  className="absolute border-2 border-[#FFC107] bg-amber-500/25 rounded-lg p-1.5 transition-all duration-500 animate-pulse shadow-xl"
                  style={{
                    left: `${Math.min(220, selectedEvent.bounding_box?.x || 120)}px`,
                    top: `${(selectedEvent.bounding_box?.y || 240) / 1.7}px`,
                    width: `${Math.min(200, selectedEvent.bounding_box?.width || 180)}px`,
                    height: `${Math.min(130, selectedEvent.bounding_box?.height || 110)}px`,
                  }}
                >
                  <div className="absolute -top-7 left-0 bg-[#FFC107] text-[#18181B] px-2 py-0.5 rounded text-[10px] font-black uppercase whitespace-nowrap shadow-md flex items-center gap-1">
                    <span>{selectedEvent.type}</span>
                    <span>({selectedEvent.confidence}%)</span>
                  </div>
                </div>
              )}

              {/* Bottom Telemetry Status Bar */}
              <div className="absolute bottom-3 right-3 bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/20 text-xs font-black text-white flex items-center gap-2">
                <span className="text-amber-400">🟡 DETECTED:</span>
                <span className="truncate max-w-[200px]">{selectedEvent?.title || "Monitoring Road Surface..."}</span>
              </div>
            </div>

            {/* AI EVIDENCE CARD */}
            {selectedEvent && (
              <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-2xl space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase">
                    AI Evidence Frame #{selectedEvent.event_id}
                  </span>
                  <span className="font-mono text-zinc-500 font-bold">{selectedEvent.timestamp}</span>
                </div>
                <h4 className="font-black text-[#212121] text-sm">{selectedEvent.title}</h4>
                <p className="text-zinc-600 font-medium leading-relaxed">{selectedEvent.description}</p>
                <div className="pt-1 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono">
                  <span className="text-zinc-500">📍 {selectedEvent.location_name} ({selectedEvent.lat}, {selectedEvent.lng})</span>
                  <span className="text-amber-700 font-bold">Bus: {selectedEvent.bus_id} ({selectedEvent.bus_reg})</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: CIVIC RISK SCORE (0-100) & MULTI-BUS VERIFICATION */}
        <div className="lg:col-span-3 space-y-6">
          {/* Civic Risk Score Card */}
          {selectedEvent && (
            <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
                <div>
                  <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider block">
                    AI Prioritization Engine
                  </span>
                  <h3 className="text-base font-black text-[#212121]">Civic Risk Score</h3>
                </div>
                <span className="text-[10px] font-bold text-amber-900 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded">
                  Prototype Formula
                </span>
              </div>

              {/* Large Score Gauge */}
              <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 text-center space-y-1">
                <span className="text-4xl sm:text-5xl font-black font-mono tracking-tight" style={{
                  color: selectedEvent.civic_risk_score >= 80 ? "#EF4444" : selectedEvent.civic_risk_score >= 65 ? "#F59E0B" : "#10B981"
                }}>
                  {selectedEvent.civic_risk_score || 85}
                  <span className="text-lg text-zinc-400 font-bold"> / 100</span>
                </span>
                <span className={`block text-xs font-black uppercase tracking-wider ${
                  selectedEvent.severity === "CRITICAL" ? "text-rose-600" : "text-amber-600"
                }`}>
                  {selectedEvent.severity} SEVERITY LEVEL
                </span>
              </div>

              {/* Formula Breakdown */}
              <div className="space-y-2 text-xs">
                <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase block">Score Breakdown:</span>
                <div className="space-y-1.5 text-[11px] font-medium text-zinc-600 bg-zinc-50 p-3 rounded-xl border border-zinc-200">
                  <div className="flex justify-between">
                    <span>AI Confidence ({selectedEvent.confidence}%):</span>
                    <span className="font-mono font-bold text-zinc-900">+{selectedEvent.risk_breakdown?.ai_confidence_score || 24} pts</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Hazard Severity ({selectedEvent.severity}):</span>
                    <span className="font-mono font-bold text-zinc-900">+{selectedEvent.risk_breakdown?.severity_weight || 35} pts</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Arterial Corridor Traffic:</span>
                    <span className="font-mono font-bold text-zinc-900">+{selectedEvent.risk_breakdown?.traffic_density_weight || 18} pts</span>
                  </div>
                  <div className="flex justify-between text-amber-700 font-bold">
                    <span>Multi-Bus Recurrence Bonus:</span>
                    <span className="font-mono">+{selectedEvent.risk_breakdown?.multi_bus_recurrence || 15} pts</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Multi-Bus Verification Card */}
          {selectedEvent && (
            <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
                <div>
                  <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider block">
                    False Positive Reduction
                  </span>
                  <h3 className="text-base font-black text-[#212121]">Multi-Bus Verification</h3>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-100 text-emerald-950 border border-emerald-300">
                  {selectedEvent.multi_bus_verification?.bus_count || 1} BUSES
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-black text-emerald-950">
                    {selectedEvent.multi_bus_verification?.status === "MULTI_BUS_VERIFIED"
                      ? `Corroborated by ${selectedEvent.multi_bus_verification.bus_count} Buses`
                      : "Single Bus Initial Sighting"}
                  </span>
                </div>
                <p className="text-[11px] text-emerald-900 font-medium leading-snug">
                  {selectedEvent.multi_bus_verification?.correlation_rationale}
                </p>
                <div className="pt-1 text-[10px] font-mono text-emerald-800 font-bold">
                  Combined Verification Confidence: {selectedEvent.multi_bus_verification?.verification_confidence}%
                </div>
              </div>

              {/* Reporting Buses Telemetry List */}
              {selectedEvent.multi_bus_verification?.buses_reporting && (
                <div className="space-y-1.5">
                  <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase block">Correlated Telemetry:</span>
                  {selectedEvent.multi_bus_verification.buses_reporting.map((r: any, idx: number) => (
                    <div key={idx} className="p-2 rounded-xl bg-zinc-50 border border-zinc-200 flex items-center justify-between text-[11px]">
                      <span className="font-bold text-zinc-900">{r.bus_id} ({r.confidence}% conf.)</span>
                      <span className="font-mono text-zinc-500">Δ {r.delta_distance_m}m • {r.timestamp}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. ROAD HEALTH SCORE & PREDICTIVE ROAD MAINTENANCE                        */}
      {/* ========================================================================= */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-zinc-200 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-100 pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-xs font-black uppercase mb-1">
              <BarChart2 className="w-3.5 h-3.5" /> Corridor Health Index
            </div>
            <h3 className="text-xl font-black text-[#212121]">Road Segment Health Scores & Maintenance Prioritization</h3>
            <p className="text-xs text-zinc-500 font-medium">Aggregated infrastructure defect density across primary Chennai public transit corridors</p>
          </div>
          <span className="text-xs font-mono font-bold bg-zinc-100 px-3 py-1.5 rounded-xl border border-zinc-200 text-zinc-700">
            Prototype Analytics Metric
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {roadSegments.map((seg) => {
            const statusBadge = 
              seg.health_status === "GOOD" ? "bg-emerald-100 text-emerald-950 border-emerald-300" :
              seg.health_status === "WATCH" ? "bg-amber-100 text-amber-950 border-amber-300" :
              seg.health_status === "POOR" ? "bg-orange-100 text-orange-950 border-orange-300" :
              "bg-rose-100 text-rose-950 border-rose-300";

            return (
              <div key={seg.segment_id} className="p-5 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-mono font-bold text-zinc-400">{seg.segment_id}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black border ${statusBadge}`}>
                      {seg.health_status}
                    </span>
                  </div>
                  <h4 className="font-black text-sm text-[#212121] leading-snug">{seg.segment_name}</h4>
                  <p className="text-[11px] text-zinc-500 font-medium">{seg.corridor}</p>
                </div>

                <div className="pt-2 border-t border-zinc-200/80 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-zinc-600">Road Health Index:</span>
                    <span className="font-mono font-black text-base" style={{ color: seg.status_color }}>
                      {seg.health_score} / 100
                    </span>
                  </div>

                  <div className="text-[11px] text-zinc-600 space-y-0.5">
                    <div>• Active Defects: <strong>{seg.active_hazards_count} detected</strong></div>
                    <div>• Traffic Density: <strong>{seg.traffic_density}</strong></div>
                    <div>• Daily Fleet Bus Runs: <strong>{seg.daily_bus_trips} trips</strong></div>
                  </div>

                  {/* Predictive Maintenance Callout */}
                  <div className="p-2 rounded-xl bg-white border border-zinc-200 text-[10px] space-y-1">
                    <div className="flex justify-between font-bold">
                      <span className="text-zinc-500">30-Day Failure Risk:</span>
                      <span className="font-mono text-rose-600">{seg.predictive_maintenance.risk_of_critical_failure_30d}</span>
                    </div>
                    <p className="text-zinc-600 leading-tight italic">{seg.predictive_maintenance.recommendation}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5. CENTRAL GIS COMMAND MAP WITH HAZARD PINS                               */}
      {/* ========================================================================= */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-zinc-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-100 pb-3">
          <div>
            <h3 className="text-xl font-black text-[#212121] flex items-center gap-2">
              <MapPin className="w-5 h-5 text-amber-600" /> Central GIS Urban Hazard & Fleet Command Map
            </h3>
            <p className="text-xs text-zinc-500 font-medium">Click any hazard pin on the map to inspect AI evidence, risk scores, and work orders</p>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#EF4444]" /> Critical (&gt;80)</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" /> High (65-80)</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#EAB308]" /> Medium</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" /> Resolved</span>
          </div>
        </div>

        <MapWrapper
          center={[13.0315, 80.2020]}
          zoom={12}
          buses={fleetData?.buses || []}
          hazards={detections}
          onHazardSelect={(hazard: any) => {
            setSelectedEvent(hazard);
            const matchingBus = fleetData?.buses?.find((b: any) => b.bus_id === hazard.bus_id);
            if (matchingBus) setSelectedBus(matchingBus);
          }}
          height="480px"
        />
      </div>

      {/* ========================================================================= */}
      {/* 6. MUNICIPAL ACTION QUEUE & WORK ORDER WORKFLOW                           */}
      {/* ========================================================================= */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-zinc-200 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-xs font-black uppercase mb-1">
              <FileText className="w-3.5 h-3.5" /> Municipal Dispatch
            </div>
            <h3 className="text-xl font-black text-[#212121]">Municipal Action Queue & Work Order Lifecycle</h3>
            <p className="text-xs text-zinc-500 font-medium">Prioritized by Civic Risk Score (0-100) for municipal repair crews (GCC, CMWSSB, Traffic Police)</p>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
            {["ALL", "ROAD_DEFECT", "DRAINAGE_DEFECT", "CIVIC_HAZARD", "INFRASTRUCTURE", "SANITATION"].map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 rounded-xl font-bold transition whitespace-nowrap ${
                  activeCategory === cat
                    ? "bg-[#FFC107] text-[#18181B] font-black shadow-sm"
                    : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
                }`}
              >
                {cat.replace("_", " ")}
              </button>
            ))}
          </div>
        </div>

        {/* Priority Action Queue Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-100 text-zinc-600 font-mono border-b border-zinc-200 uppercase text-[10px]">
              <tr>
                <th className="p-3">Risk Score</th>
                <th className="p-3">Event / Ticket ID</th>
                <th className="p-3">Hazard Type</th>
                <th className="p-3">Location</th>
                <th className="p-3">Multi-Bus Status</th>
                <th className="p-3">Assigned Agency</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Workflow Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 text-zinc-800">
              {filteredDetections.map((evt) => {
                const isSelected = selectedEvent?.event_id === evt.event_id;
                return (
                  <tr key={evt.event_id} className={`transition ${isSelected ? "bg-amber-50/70 font-semibold" : "hover:bg-zinc-50"}`}>
                    <td className="p-3 font-mono font-black">
                      <span className="px-2.5 py-1 rounded-lg text-xs font-black text-white" style={{
                        backgroundColor: evt.civic_risk_score >= 80 ? "#EF4444" : evt.civic_risk_score >= 65 ? "#F59E0B" : "#10B981"
                      }}>
                        {evt.civic_risk_score}/100
                      </span>
                    </td>
                    <td className="p-3 font-mono text-zinc-700">
                      <div className="font-bold text-amber-800">{evt.event_id}</div>
                      <div className="text-[10px] text-zinc-400">{evt.work_order_id || "Unassigned"}</div>
                    </td>
                    <td className="p-3">
                      <div className="font-bold text-zinc-950">{evt.title}</div>
                      <div className="text-[10px] text-zinc-500">{evt.category} ({evt.confidence}%)</div>
                    </td>
                    <td className="p-3 text-zinc-600 font-medium">
                      {evt.location_name}
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                        evt.multi_bus_verification?.status === "MULTI_BUS_VERIFIED"
                          ? "bg-emerald-100 text-emerald-950 border border-emerald-300"
                          : "bg-zinc-100 text-zinc-600 border border-zinc-200"
                      }`}>
                        {evt.multi_bus_verification?.status === "MULTI_BUS_VERIFIED" 
                          ? `✓ ${evt.multi_bus_verification.bus_count} Buses` 
                          : "1 Bus Sight"}
                      </span>
                    </td>
                    <td className="p-3 text-zinc-700 font-medium max-w-[180px] truncate">
                      {evt.assigned_department || "Greater Chennai Corporation"}
                    </td>
                    <td className="p-3 font-mono text-[11px] font-bold">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                        evt.work_order_status === "RESOLVED" ? "bg-emerald-100 text-emerald-800" :
                        evt.work_order_status === "IN_PROGRESS" ? "bg-indigo-100 text-indigo-800" :
                        evt.work_order_status === "ASSIGNED" ? "bg-amber-100 text-amber-800" :
                        "bg-zinc-100 text-zinc-700"
                      }`}>
                        {evt.work_order_status}
                      </span>
                    </td>
                    <td className="p-3 text-right space-x-1">
                      {evt.work_order_status === "ASSIGNED" && (
                        <button
                          onClick={() => handleWorkOrderStatusChange(evt.event_id, "IN_PROGRESS")}
                          disabled={updatingOrderId === evt.event_id}
                          className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[10px] font-bold transition shadow-sm"
                        >
                          Mark In Progress
                        </button>
                      )}
                      {evt.work_order_status === "IN_PROGRESS" && (
                        <button
                          onClick={() => handleWorkOrderStatusChange(evt.event_id, "RESOLVED")}
                          disabled={updatingOrderId === evt.event_id}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold transition shadow-sm"
                        >
                          Mark Resolved
                        </button>
                      )}
                      {evt.work_order_status === "RESOLVED" && (
                        <span className="text-[11px] font-bold text-emerald-700 font-mono">✓ Closed</span>
                      )}
                      {(!evt.work_order_status || evt.work_order_status === "CREATED") && (
                        <button
                          onClick={() => handleWorkOrderStatusChange(evt.event_id, "ASSIGNED")}
                          disabled={updatingOrderId === evt.event_id}
                          className="px-2.5 py-1 bg-[#FFC107] text-[#18181B] font-black rounded-lg text-[10px] shadow-sm hover:bg-amber-400"
                        >
                          Assign GCC Crew
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setSelectedEvent(evt);
                          const matchingBus = fleetData?.buses?.find((b: any) => b.bus_id === evt.bus_id);
                          if (matchingBus) setSelectedBus(matchingBus);
                        }}
                        className="px-2 py-1 bg-zinc-100 text-zinc-800 hover:bg-zinc-200 rounded-lg text-[10px] font-bold"
                      >
                        Inspect Feed →
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 7. ON-BUS EDGE AI ARCHITECTURE & PRIVACY FRAMEWORK                        */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        {/* EDGE AI ARCHITECTURE */}
        <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
            <h3 className="font-black text-[#212121] text-base flex items-center gap-2">
              <Cpu className="w-5 h-5 text-amber-600" /> On-Bus Edge AI Architecture (Simulated Prototype)
            </h3>
            <span className="text-[10px] font-mono font-bold bg-zinc-100 px-2.5 py-1 rounded text-zinc-600">
              NVIDIA Jetson AGX Orin
            </span>
          </div>

          {/* Compact Architecture Pipeline */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs font-bold pt-1">
            <div className="p-3 bg-zinc-50 rounded-2xl border border-zinc-200 space-y-1">
              <span className="text-[10px] text-zinc-400 font-mono block">1. INPUT</span>
              <Camera className="w-5 h-5 mx-auto text-zinc-700" />
              <span className="text-[11px] block">4x 1080p Cameras</span>
            </div>
            <div className="p-3 bg-zinc-50 rounded-2xl border border-zinc-200 space-y-1">
              <span className="text-[10px] text-zinc-400 font-mono block">2. INFERENCE</span>
              <Cpu className="w-5 h-5 mx-auto text-amber-600" />
              <span className="text-[11px] block">TensorRT FP16</span>
            </div>
            <div className="p-3 bg-zinc-50 rounded-2xl border border-zinc-200 space-y-1">
              <span className="text-[10px] text-zinc-400 font-mono block">3. FILTER</span>
              <Sliders className="w-5 h-5 mx-auto text-indigo-600" />
              <span className="text-[11px] block">99.98% Filtered</span>
            </div>
            <div className="p-3 bg-zinc-50 rounded-2xl border border-zinc-200 space-y-1">
              <span className="text-[10px] text-zinc-400 font-mono block">4. CONTEXT</span>
              <MapPin className="w-5 h-5 mx-auto text-emerald-600" />
              <span className="text-[11px] block">GPS + Time Tag</span>
            </div>
            <div className="p-3 bg-amber-50 rounded-2xl border border-amber-300 space-y-1 col-span-2 sm:col-span-1">
              <span className="text-[10px] text-amber-700 font-mono block font-black">5. TRANSMIT</span>
              <Send className="w-5 h-5 mx-auto text-amber-800" />
              <span className="text-[11px] text-amber-950 font-black block">800-byte JSON</span>
            </div>
          </div>

          <p className="text-xs text-zinc-600 leading-relaxed font-medium">
            <strong>Bandwidth Optimization:</strong> Continuous raw 4x1080p video streaming would saturate ~48 Mbps per bus, making fleet scale prohibitive.
            By conducting inference directly at the edge, raw silent frames are discarded immediately, sending only confirmed event metadata over low-cost cellular networks.
          </p>
        </div>

        {/* PRIVACY-PRESERVING EDGE AI */}
        <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
            <h3 className="font-black text-[#212121] text-base flex items-center gap-2">
              <Lock className="w-5 h-5 text-emerald-600" /> Privacy-Preserving Framework
            </h3>
            <span className="text-[10px] font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded">
              DPDP / GDPR Compliant
            </span>
          </div>

          <div className="space-y-2.5 text-xs text-zinc-600 font-medium">
            <div className="p-2.5 rounded-xl bg-zinc-50 border border-zinc-200 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>Zero Raw Video Centralization:</strong> Video buffers remain in volatile memory and are overwritten continuously.</span>
            </div>
            <div className="p-2.5 rounded-xl bg-zinc-50 border border-zinc-200 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>Automated Anonymization:</strong> Pedestrian faces and private vehicle license plates are blurred on incident evidence frames.</span>
            </div>
            <div className="p-2.5 rounded-xl bg-zinc-50 border border-zinc-200 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>Infrastructure Focus:</strong> Cameras are calibrated for road and civic assets, not citizen surveillance.</span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 8. SECONDARY FLEET INTELLIGENCE (TRAFFIC & BOTTLENECKS)                   */}
      {/* ========================================================================= */}
      <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
          <div>
            <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider block">
              Secondary Fleet Intelligence
            </span>
            <h3 className="text-base font-black text-[#212121]">Corridor Traffic Flow & Bottleneck Delays</h3>
          </div>
          <span className="text-xs font-bold text-amber-700 bg-amber-50 px-3 py-1 rounded-xl border border-amber-200">
            Rear Camera & Dwell Time Analytics
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
          <div className="p-3 bg-zinc-50 rounded-2xl border border-zinc-200">
            <span className="text-zinc-500 block font-medium">Bikes / 2-Wheelers</span>
            <span className="text-lg font-black text-[#212121]">1,420 / hr</span>
          </div>
          <div className="p-3 bg-zinc-50 rounded-2xl border border-zinc-200">
            <span className="text-zinc-500 block font-medium">Auto Rickshaws</span>
            <span className="text-lg font-black text-[#212121]">580 / hr</span>
          </div>
          <div className="p-3 bg-zinc-50 rounded-2xl border border-zinc-200">
            <span className="text-zinc-500 block font-medium">Cars & Cabs</span>
            <span className="text-lg font-black text-[#212121]">1,120 / hr</span>
          </div>
          <div className="p-3 bg-zinc-50 rounded-2xl border border-zinc-200">
            <span className="text-zinc-500 block font-medium">Buses & Trucks</span>
            <span className="text-lg font-black text-amber-700">240 / hr</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
          {traffic?.bottlenecks?.map((b: any, idx: number) => (
            <div key={idx} className="p-3 bg-zinc-50 rounded-xl border border-zinc-200 flex items-center justify-between">
              <span className="font-bold text-[#212121]">{b.intersection}</span>
              <span className="font-black text-[#EF4444]">+{b.avg_delay_mins} mins delay</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
