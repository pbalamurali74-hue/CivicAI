"use client";

import { useState, useEffect, Suspense } from "react";
import { 
  Bus, 
  Camera, 
  Activity, 
  AlertTriangle, 
  ShieldCheck, 
  Zap, 
  Cpu, 
  MapPin, 
  Navigation, 
  CheckCircle2, 
  Radio, 
  Eye, 
  Layers, 
  FileText, 
  Play, 
  RotateCcw,
  Sparkles
} from "lucide-react";
import MapWrapper from "@/components/MapWrapper";
import GuidedWalkthroughBanner from "@/components/GuidedWalkthroughBanner";
import { getSensingFleet, getSensingDetections, getSensingTrafficIntelligence } from "@/lib/api";
import { useLanguage } from "@/context/LanguageContext";

const INITIAL_BUSES = [
  {
    bus_id: "BUS-101",
    reg_number: "TN-01-N-9842",
    route_code: "70H",
    route_name: "SRM Ramapuram ➔ Guindy ➔ T. Nagar",
    driver_name: "K. Selvam",
    speed_kmh: 32,
    lat: 13.0315,
    lng: 80.1812,
    status: "AI_ONLINE",
    edge_device: "NVIDIA Jetson AGX Orin 64GB",
    inference_fps: 45,
    cameras_active: 4,
    cameras: [
      { id: "CAM-FRONT", name: "Front Road AI Camera", resolution: "1080p 60FPS", status: "ACTIVE" },
      { id: "CAM-REAR", name: "Rear Traffic AI Camera", resolution: "1080p 60FPS", status: "ACTIVE" },
      { id: "CAM-LEFT", name: "Side Obstacle Camera", resolution: "720p 30FPS", status: "ACTIVE" },
      { id: "CAM-CABIN", name: "Passenger Cabin Safety Camera", resolution: "1080p 30FPS", status: "ACTIVE" },
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
    edge_device: "NVIDIA Jetson Xavier NX",
    inference_fps: 38,
    cameras_active: 4,
    cameras: [
      { id: "CAM-FRONT", name: "Front Road AI Camera", resolution: "1080p 60FPS", status: "ACTIVE" },
      { id: "CAM-REAR", name: "Rear Traffic AI Camera", resolution: "1080p 60FPS", status: "ACTIVE" },
      { id: "CAM-LEFT", name: "Side Obstacle Camera", resolution: "720p 30FPS", status: "ACTIVE" },
      { id: "CAM-CABIN", name: "Passenger Cabin Safety Camera", resolution: "1080p 30FPS", status: "ACTIVE" },
    ]
  }
];

const INITIAL_EVENTS = [
  {
    event_id: "EVT-8091",
    bus_id: "BUS-101",
    bus_reg: "TN-01-N-9842",
    type: "POTHOLE_SEVERE",
    category: "ROAD_DEFECT",
    title: "Severe Deep Asphalt Pothole",
    description: "2.4ft wide deep pothole detected near Guindy Kathipara Flyover underpass.",
    location_name: "Guindy Kathipara Underpass",
    lat: 13.0067,
    lng: 80.2020,
    severity: "CRITICAL",
    confidence: 94.8,
    timestamp: "2026-08-26 18:45:12",
    bounding_box: { x: 120, y: 240, width: 180, height: 110 },
    camera: "CAM-FRONT",
    work_order_generated: true,
    work_order_id: "GCC-ROAD-4092"
  },
  {
    event_id: "EVT-8092",
    bus_id: "BUS-101",
    bus_reg: "TN-01-N-9842",
    type: "DAMAGED_SIGN",
    category: "INFRASTRUCTURE",
    title: "Damaged / Bent Speed Limit Sign",
    description: "Mandatory 40 km/h speed sign post bent 45 degrees near SRM Ramapuram main gate.",
    location_name: "SRM Ramapuram Entrance",
    lat: 13.0315,
    lng: 80.1812,
    severity: "HIGH",
    confidence: 91.2,
    timestamp: "2026-08-26 18:50:30",
    bounding_box: { x: 310, y: 80, width: 95, height: 140 },
    camera: "CAM-FRONT",
    work_order_generated: true,
    work_order_id: "GCC-TRAFFIC-1044"
  },
  {
    event_id: "EVT-8093",
    bus_id: "BUS-102",
    bus_reg: "TN-02-M-4410",
    type: "PEDESTRIAN_DANGER",
    category: "PEDESTRIAN_SAFETY",
    title: "Vulnerable Pedestrian / School Child Crossing Alert",
    description: "Two children stepping into non-zebra road zone near Koyambedu Metro.",
    location_name: "Koyambedu School Zone",
    lat: 13.0694,
    lng: 80.1948,
    severity: "CRITICAL",
    confidence: 96.4,
    timestamp: "2026-08-26 18:55:04",
    bounding_box: { x: 200, y: 180, width: 140, height: 160 },
    camera: "CAM-FRONT",
    work_order_generated: false
  },
  {
    event_id: "EVT-8094",
    bus_id: "BUS-103",
    bus_reg: "TN-07-H-3129",
    type: "ANPR_INCIDENT",
    category: "INCIDENT_INTELLIGENCE",
    title: "Rash Driving / Suspicious Vehicle License Plate Extracted",
    description: "Vehicle TN-09-AB-1234 driving erratically at 74 km/h in 40 km/h zone.",
    location_name: "Adayar Depot Junction",
    lat: 13.0067,
    lng: 80.2571,
    severity: "HIGH",
    confidence: 98.1,
    timestamp: "2026-08-26 19:01:22",
    license_plate: "TN-09-AB-1234",
    bounding_box: { x: 150, y: 210, width: 160, height: 75 },
    camera: "CAM-REAR",
    work_order_generated: true,
    work_order_id: "TN-POL-ALERT-881"
  }
];

export default function SihSensingPage() {
  const { t } = useLanguage();
  
  // State initialized with robust defaults so page never renders blank
  const [fleetData, setFleetData] = useState<any>({
    active_sensing_buses: 3,
    total_cameras_online: 48,
    buses: INITIAL_BUSES
  });
  const [detections, setDetections] = useState<any[]>(INITIAL_EVENTS);
  const [traffic, setTraffic] = useState<any>({
    bottlenecks: [
      { intersection: "Kathipara Junction", avg_delay_mins: 14 },
      { intersection: "Koyambedu Roundtana", avg_delay_mins: 11 }
    ]
  });
  const [selectedBus, setSelectedBus] = useState<any>(INITIAL_BUSES[0]);
  const [selectedCamera, setSelectedCamera] = useState<string>("CAM-FRONT");
  const [selectedEvent, setSelectedEvent] = useState<any>(INITIAL_EVENTS[0]);
  const [demoStep, setDemoStep] = useState<number>(1);
  const [activeCategory, setActiveCategory] = useState<string>("ALL");

  useEffect(() => {
    async function loadSensingData() {
      try {
        const [fleet, evts, tfc] = await Promise.all([
          getSensingFleet().catch(() => null),
          getSensingDetections().catch(() => null),
          getSensingTrafficIntelligence().catch(() => null)
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
      } catch (err) {
        console.error("Error loading SIH PS 26124 data:", err);
      }
    }
    loadSensingData();
  }, []);

  const demoStepsList = [
    { step: 1, title: "1. Select BUS 104A Fleet Unit", desc: "Select BUS 104A (TN-01-N-9842) on Route 70H" },
    { step: 2, title: "2. Multi-Camera Stream", desc: "Inspect BUS 104A 4 onboard AI cameras (Front, Rear, Side, Cabin)" },
    { step: 3, title: "3. AI Pothole Detection", desc: "Computer vision detects deep asphalt defect on Front Camera" },
    { step: 4, title: "4. Bounding Box & Class", desc: "Classify: POTHOLE_SEVERE • Confidence: 94.8%" },
    { step: 5, title: "5. Edge AI Tagging", desc: "Attach GPS: 13.0067°N, 80.2020°E • Timestamp: 18:45:12" },
    { step: 6, title: "6. GIS Auto-Pinning", desc: "Auto-create hazard pin on Chennai Central GIS map" },
    { step: 7, title: "7. Command Alert", desc: "Event streams live to Central Transport Dashboard" },
    { step: 8, title: "8. Traffic Analytics", desc: "Vehicle counting: 34 Cars, 18 Autos, 42 Bikes" },
    { step: 9, title: "9. Pedestrian Danger Alert", desc: "Detect children stepping into dangerous road zone" },
    { step: 10, title: "10. ANPR Vehicle Tracking", desc: "License plate extracted: TN-09-AB-1234 (74 km/h)" },
    { step: 11, title: "11. Municipal Work Order", desc: "Actionable Ticket #GCC-ROAD-4092 dispatched to repair crew" }
  ];

  const handleStepClick = (stepNum: number) => {
    setDemoStep(stepNum);
    if (stepNum === 1 || stepNum === 2 || stepNum === 3 || stepNum === 4 || stepNum === 5) {
      if (fleetData?.buses?.[0]) setSelectedBus(fleetData.buses[0]);
      setSelectedCamera("CAM-FRONT");
      if (detections[0]) setSelectedEvent(detections[0]);
    } else if (stepNum === 8) {
      if (fleetData?.buses?.[1]) setSelectedBus(fleetData.buses[1]);
      setSelectedCamera("CAM-FRONT");
    } else if (stepNum === 9) {
      if (detections[2]) setSelectedEvent(detections[2]);
      setSelectedCamera("CAM-FRONT");
    } else if (stepNum === 10) {
      if (detections[3]) setSelectedEvent(detections[3]);
      setSelectedCamera("CAM-REAR");
    }
  };

  const filteredDetections = activeCategory === "ALL" 
    ? detections 
    : detections.filter((d) => d.category === activeCategory);

  const walkthroughSteps = [
    { title: "PS 26124 Fleet AI", speech: "Welcome to SIH 2026 Problem Statement 26124 Mobile Urban Intelligence Platform." },
    { title: "Multi-Camera Bus", speech: "Buses act as mobile sensing units with 4 onboard cameras and NVIDIA Jetson Edge AI." },
    { title: "Auto Detection", speech: "Potholes, damaged signs, traffic density, and pedestrian hazards are tagged with GPS and pushed to the GIS map." }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <GuidedWalkthroughBanner steps={walkthroughSteps} />

      {/* HEADER BANNER */}
      <div className="bg-white p-6 md:p-8 rounded-3xl border-2 border-[#FFC107] shadow-md space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 border border-amber-300 text-amber-900 text-xs font-black uppercase tracking-wider mb-2">
              <Bus className="w-4 h-4 text-amber-600" /> SIH 2026 PS 26124 • MOBILE URBAN SENSING FLEET
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-[#212121]">
              AI-Powered Mobile Urban Intelligence Platform
            </h1>
            <p className="text-zinc-600 text-sm font-semibold mt-1">
              Public transport buses equipped with 4-camera Edge AI processors detecting potholes, damaged signs, traffic bottlenecks, pedestrian dangers, and vehicle incidents in real-time.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <span className="px-3 py-1.5 rounded-2xl bg-amber-50 text-amber-900 border border-amber-300 font-mono text-xs font-black">
              DEMO / SIMULATED FLEET STREAM
            </span>
          </div>
        </div>

        {/* METRICS HIGHLIGHT BAR */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-3 border-t border-zinc-200 text-center">
          <div className="p-3 bg-zinc-50 rounded-2xl border border-zinc-200">
            <span className="text-[10px] font-mono text-zinc-500 font-bold uppercase block">Active Buses</span>
            <span className="text-xl font-black text-[#212121]">{fleetData?.active_sensing_buses || 3} / 12 Units</span>
          </div>
          <div className="p-3 bg-zinc-50 rounded-2xl border border-zinc-200">
            <span className="text-[10px] font-mono text-zinc-500 font-bold uppercase block">Onboard Cameras</span>
            <span className="text-xl font-black text-amber-700">{fleetData?.total_cameras_online || 48} Streams</span>
          </div>
          <div className="p-3 bg-zinc-50 rounded-2xl border border-zinc-200">
            <span className="text-[10px] font-mono text-zinc-500 font-bold uppercase block">Edge AI Processor</span>
            <span className="text-xs font-black text-amber-800 block mt-1">NVIDIA Jetson AGX Orin</span>
            <span className="text-[10px] font-mono font-bold text-amber-700">45 FPS Inference</span>
          </div>
          <div className="p-3 bg-zinc-50 rounded-2xl border border-zinc-200">
            <span className="text-[10px] font-mono text-zinc-500 font-bold uppercase block">Detections Today</span>
            <span className="text-xl font-black text-[#D32F2F]">282 Hazards</span>
          </div>
        </div>
      </div>

      {/* 11-STEP INTERACTIVE SIH DEMO STORY FLOW CONTROLLER */}
      <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-[#FFC107] text-[#18181B] font-black flex items-center justify-center text-sm">
              🎬
            </span>
            <div>
              <h2 className="text-lg font-black text-[#212121]">SIH Evaluator 11-Step Interactive Demo Walkthrough</h2>
              <p className="text-xs text-zinc-500 font-medium">Click any step below to simulate end-to-end mobile sensing ➔ AI detection ➔ GIS mapping ➔ Work Order dispatch</p>
            </div>
          </div>
          <button
            onClick={() => handleStepClick(1)}
            className="px-3 py-1.5 bg-amber-100 text-amber-900 border border-amber-300 rounded-xl text-xs font-black hover:bg-amber-200 flex items-center gap-1"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Restart Demo
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 lg:grid-cols-11 gap-2 overflow-x-auto pb-2">
          {demoStepsList.map((s) => (
            <button
              key={s.step}
              onClick={() => handleStepClick(s.step)}
              className={`p-2.5 rounded-2xl text-left border text-xs font-bold transition flex flex-col justify-between min-h-[90px] ${
                demoStep === s.step
                  ? "bg-[#FFC107] text-[#18181B] border-amber-400 font-black shadow-md scale-105"
                  : "bg-zinc-50 text-zinc-700 border-zinc-200 hover:bg-zinc-100"
              }`}
            >
              <span className="text-[10px] font-mono font-bold block mb-1">STEP #{s.step}</span>
              <span className="text-[11px] leading-tight block">{s.title}</span>
            </button>
          ))}
        </div>

        {/* STEP BANNER DETAIL */}
        <div className="p-4 bg-amber-50 border border-amber-300 rounded-2xl flex items-center justify-between text-xs font-bold text-amber-900">
          <span>👉 Active Demo Step #{demoStep}: {demoStepsList[demoStep - 1]?.desc}</span>
          <button
            onClick={() => handleStepClick(Math.min(11, demoStep + 1))}
            className="px-4 py-1.5 bg-[#FFC107] text-[#18181B] font-black rounded-xl border border-amber-400 shadow-sm hover:bg-amber-400"
          >
            Next Step →
          </button>
        </div>
      </div>

      {/* MULTI-CAMERA BUS INSPECTOR + EDGE AI BOUNDING BOX SIMULATOR */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT COLUMN: BUS & CAMERA SELECTOR */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm space-y-4">
            <h3 className="font-black text-[#212121] text-lg flex items-center gap-2">
              <Bus className="w-5 h-5 text-amber-600" /> Select Public Fleet Bus Unit
            </h3>

            <div className="space-y-3">
              {fleetData?.buses?.map((bus: any) => (
                <div
                  key={bus.bus_id}
                  onClick={() => { setSelectedBus(bus); setSelectedEvent(detections.find(d => d.bus_id === bus.bus_id) || detections[0]); }}
                  className={`p-4 rounded-2xl border transition cursor-pointer flex items-center justify-between ${
                    selectedBus?.bus_id === bus.bus_id
                      ? "bg-amber-50 border-2 border-[#FFC107] shadow-sm"
                      : "bg-zinc-50 border-zinc-200 hover:border-zinc-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-[#FFC107] text-[#18181B] font-black flex items-center justify-center text-lg shadow-sm border border-amber-300">
                      🚌
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-[#212121] text-sm">{bus.reg_number}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-black bg-amber-100 text-amber-900 border border-amber-300">
                          Route {bus.route_code}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-500 font-medium truncate max-w-[200px]">{bus.route_name}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] font-mono font-bold text-amber-700 block">⚡ {bus.status}</span>
                    <span className="text-xs font-bold text-zinc-700">{bus.speed_kmh} km/h</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ONBOARD CAMERA FEED SWITCHER */}
          <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm space-y-4">
            <h3 className="font-black text-[#212121] text-base flex items-center gap-2">
              <Camera className="w-5 h-5 text-amber-600" /> Onboard 4-Camera Feeds ({selectedBus?.reg_number})
            </h3>

            <div className="grid grid-cols-2 gap-3">
              {selectedBus?.cameras?.map((cam: any) => (
                <button
                  key={cam.id}
                  onClick={() => setSelectedCamera(cam.id)}
                  className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between min-h-[70px] ${
                    selectedCamera === cam.id
                      ? "bg-[#FFC107] text-[#18181B] border-amber-400 font-black shadow-sm"
                      : "bg-zinc-50 text-zinc-700 border-zinc-200 hover:bg-zinc-100"
                  }`}
                >
                  <span className="text-[10px] font-mono font-bold block opacity-80">{cam.id}</span>
                  <span className="text-xs font-bold leading-snug block mt-1">{cam.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: AI COMPUTER VISION FEED & BOUNDING BOX OVERLAY */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold text-amber-700 uppercase tracking-wider block">
                  LIVE EDGE AI CAMERA FEED • {selectedCamera}
                </span>
                <h3 className="text-lg font-black text-[#212121]">
                  {selectedBus?.cameras?.find((c: any) => c.id === selectedCamera)?.name || "Front AI Stream"}
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-ping" />
                <span className="text-xs font-mono font-bold text-emerald-700">45 FPS INFERENCE ACTIVE</span>
              </div>
            </div>

            {/* COMPUTER VISION CANVAS WITH BOUNDING BOX ANIMATION */}
            <div className="relative w-full h-[320px] bg-zinc-900 rounded-2xl overflow-hidden border-2 border-zinc-800 flex items-center justify-center">
              {/* Simulated Road Video Background Image */}
              <img
                src={
                  selectedCamera === "CAM-REAR"
                    ? "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&auto=format&fit=crop&q=80"
                    : selectedCamera === "CAM-CABIN"
                    ? "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=800&auto=format&fit=crop&q=80"
                    : "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&auto=format&fit=crop&q=80"
                }
                alt="Camera Feed Stream"
                className="w-full h-full object-cover opacity-80"
              />

              {/* Edge AI Telemetry Overlay Top-Left */}
              <div className="absolute top-3 left-3 bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/20 font-mono text-[10px] text-amber-400 font-bold space-y-0.5">
                <div>BUS: {selectedBus?.reg_number}</div>
                <div>DEVICE: {selectedBus?.edge_device}</div>
                <div>GPS: {selectedEvent?.lat?.toFixed(4)}°N, {selectedEvent?.lng?.toFixed(4)}°E</div>
              </div>

              {/* BOUNDING BOX ANIMATION OVERLAY */}
              {selectedEvent && (
                <div
                  className="absolute border-3 border-[#FFC107] bg-amber-500/20 rounded-lg p-2 transition-all duration-500 animate-pulse shadow-lg"
                  style={{
                    left: `${selectedEvent.bounding_box.x}px`,
                    top: `${selectedEvent.bounding_box.y / 1.5}px`,
                    width: `${selectedEvent.bounding_box.width}px`,
                    height: `${selectedEvent.bounding_box.height}px`,
                  }}
                >
                  <div className="absolute -top-7 left-0 bg-[#FFC107] text-[#18181B] px-2 py-0.5 rounded text-[10px] font-black uppercase whitespace-nowrap shadow-md">
                    {selectedEvent.type} ({selectedEvent.confidence}%)
                  </div>
                </div>
              )}

              {/* Bottom Telemetry Status Bar */}
              <div className="absolute bottom-3 right-3 bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/20 text-xs font-black text-white flex items-center gap-2">
                <span className="text-amber-400">🟡 DETECTED:</span>
                <span>{selectedEvent?.title || "Monitoring Road..."}</span>
              </div>
            </div>

            {/* EVENT DETAILS CARD ATTACHED TO AI STREAM */}
            {selectedEvent && (
              <div className="p-4 bg-amber-50 border border-amber-300 rounded-2xl space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#FFC107] text-[#18181B] font-black uppercase text-[10px]">
                    {selectedEvent.category} • {selectedEvent.severity} SEVERITY
                  </span>
                  <span className="font-mono text-zinc-500 font-bold">{selectedEvent.timestamp}</span>
                </div>
                <h4 className="font-black text-[#212121] text-base">{selectedEvent.title}</h4>
                <p className="text-zinc-600 font-medium">{selectedEvent.description}</p>
                {selectedEvent.work_order_generated && (
                  <div className="pt-1 flex items-center gap-1.5 text-amber-900 font-bold">
                    <CheckCircle2 className="w-4 h-4 text-amber-600" />
                    <span>Actionable Ticket Generated: <span className="font-mono">{selectedEvent.work_order_id}</span></span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CENTRAL GIS MAP & INCIDENT INTELLIGENCE STREAM */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* CENTRAL GIS MAP */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-black text-[#212121] flex items-center gap-2">
              <MapPin className="w-5 h-5 text-amber-600" /> Central GIS Urban Hazard & Fleet Map
            </h3>
            <span className="text-xs font-mono font-bold text-amber-700">Live GPS Telemetry</span>
          </div>

          <MapWrapper
            center={[13.0315, 80.1812]}
            zoom={12}
            buses={fleetData?.buses || []}
            offices={[]}
            height="460px"
          />
        </div>

        {/* URBAN INCIDENT LOG TABLE & TRAFFIC ANALYTICS */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-[#212121] text-base">Traffic Intelligence Analytics</h3>
              <span className="text-xs font-bold text-amber-700">Vehicle Counting</span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-center text-xs">
              <div className="p-3 bg-zinc-50 rounded-2xl border border-zinc-200">
                <span className="text-zinc-500 block font-medium">Bikes / 2-Wheelers</span>
                <span className="text-lg font-black text-[#212121]">1,420</span>
              </div>
              <div className="p-3 bg-zinc-50 rounded-2xl border border-zinc-200">
                <span className="text-zinc-500 block font-medium">Auto Rickshaws</span>
                <span className="text-lg font-black text-[#212121]">580</span>
              </div>
              <div className="p-3 bg-zinc-50 rounded-2xl border border-zinc-200">
                <span className="text-zinc-500 block font-medium">Cars & Cabs</span>
                <span className="text-lg font-black text-[#212121]">1,120</span>
              </div>
              <div className="p-3 bg-zinc-50 rounded-2xl border border-zinc-200">
                <span className="text-zinc-500 block font-medium">Buses & Trucks</span>
                <span className="text-lg font-black text-amber-700">240</span>
              </div>
            </div>

            {/* TRAFFIC BOTTLENECKS */}
            <div className="space-y-2 pt-2 border-t border-zinc-200 text-xs">
              <span className="font-black text-[#212121] uppercase tracking-wider block text-[10px]">Detected Congestion Bottlenecks:</span>
              {traffic?.bottlenecks?.map((b: any, idx: number) => (
                <div key={idx} className="p-2.5 bg-zinc-50 rounded-xl border border-zinc-200 flex items-center justify-between">
                  <span className="font-bold text-[#212121]">{b.intersection}</span>
                  <span className="font-black text-[#D32F2F]">+{b.avg_delay_mins} mins delay</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* DETECTED URBAN HAZARDS EVENT INCIDENT LOG TABLE */}
      <div className="bg-white p-6 md:p-8 rounded-3xl border border-zinc-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-black text-[#212121]">Real-time AI Detected Urban Incidents</h3>
            <p className="text-xs text-zinc-500 font-medium">Auto-tagged with GPS coordinates, edge confidence, and severity level</p>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto text-xs">
            {["ALL", "ROAD_DEFECT", "INFRASTRUCTURE", "PEDESTRIAN_SAFETY", "INCIDENT_INTELLIGENCE"].map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 rounded-xl font-bold transition whitespace-nowrap ${
                  activeCategory === cat
                    ? "bg-[#FFC107] text-[#18181B] font-black shadow-sm"
                    : "bg-zinc-100 text-zinc-700 border border-zinc-200 hover:bg-zinc-200"
                }`}
              >
                {cat.replace("_", " ")}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-100 text-zinc-600 font-mono border-b border-zinc-200 uppercase text-[10px]">
              <tr>
                <th className="p-3">Event ID</th>
                <th className="p-3">Category</th>
                <th className="p-3">Incident Title</th>
                <th className="p-3">Location & GPS</th>
                <th className="p-3">Bus Source</th>
                <th className="p-3">Confidence</th>
                <th className="p-3">Severity</th>
                <th className="p-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 text-zinc-800">
              {filteredDetections.map((evt) => (
                <tr key={evt.event_id} className="hover:bg-amber-50/50 transition">
                  <td className="p-3 font-mono font-black text-amber-700">{evt.event_id}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-black bg-zinc-100 border border-zinc-300 text-zinc-800">
                      {evt.category}
                    </span>
                  </td>
                  <td className="p-3 font-bold text-[#212121]">{evt.title}</td>
                  <td className="p-3 font-mono text-zinc-600">{evt.location_name} ({evt.lat}, {evt.lng})</td>
                  <td className="p-3 font-mono font-bold text-amber-800">{evt.bus_reg}</td>
                  <td className="p-3 font-black text-amber-700">{evt.confidence}%</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                      evt.severity === "CRITICAL" ? "bg-red-100 text-[#D32F2F] border border-red-300" : "bg-amber-100 text-amber-900 border border-amber-300"
                    }`}>
                      {evt.severity}
                    </span>
                  </td>
                  <td className="p-3">
                    <button
                      onClick={() => { setSelectedEvent(evt); setSelectedBus(fleetData?.buses?.find((b: any) => b.bus_id === evt.bus_id) || fleetData?.buses?.[0]); }}
                      className="px-3 py-1 bg-[#FFC107] text-[#18181B] font-black text-[11px] rounded-lg hover:bg-amber-400 shadow-sm"
                    >
                      Inspect Feed →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
