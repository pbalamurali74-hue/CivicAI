"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { 
  Camera, 
  Video, 
  Upload, 
  Play, 
  Pause, 
  RotateCcw, 
  AlertTriangle, 
  ShieldAlert, 
  Radio, 
  MapPin, 
  CheckCircle2, 
  Clock, 
  Cpu, 
  Lock, 
  Wifi, 
  Send, 
  ArrowRight, 
  Bus, 
  UserCheck, 
  FileText, 
  Sparkles, 
  ChevronRight,
  Sliders,
  ShieldCheck,
  Eye,
  Layers
} from "lucide-react";
import MapWrapper from "@/components/MapWrapper";
import GuidedWalkthroughBanner from "@/components/GuidedWalkthroughBanner";
import { 
  detectSafetyCameraHazard, 
  broadcastSafetyCameraAlert, 
  getRecentSafetyIncidents,
  updateWorkOrderStatus
} from "@/lib/api";

type CameraSource = "FRONT_CAMERA" | "REAR_CAMERA" | "SIDE_CAMERA" | "DEVICE_CAMERA" | "UPLOADED_MEDIA" | "DEMO_FEED";
type HazardClass = "POTHOLE" | "PEDESTRIAN_DANGER";

export default function SafetyCameraPage() {
  const [source, setSource] = useState<CameraSource>("FRONT_CAMERA");
  const [hazardClass, setHazardClass] = useState<HazardClass>("POTHOLE");
  const [isWebcamActive, setIsWebcamActive] = useState<boolean>(false);
  const [uploadedMediaUrl, setUploadedMediaUrl] = useState<string | null>(null);
  const [uploadedMediaType, setUploadedMediaType] = useState<"image" | "video" | null>(null);
  
  // Incident & Detection State
  const [activeIncident, setActiveIncident] = useState<any>({
    incident_id: "INC-2026-00421",
    hazard_type: "POTHOLE",
    title: "Severe Deep Asphalt Pothole",
    confidence: 94.8,
    severity: "HIGH",
    civic_risk_score: 87,
    timestamp: "19:42:18",
    latitude: 13.0067,
    longitude: 80.2020,
    location_name: "Guindy Kathipara Underpass, Chennai",
    vehicle_id: "BUS-104A",
    route_id: "70H (SRM ➔ Guindy ➔ T. Nagar)",
    camera_id: "CAM-FRONT (Front Road AI Camera)",
    bounding_box: { x: 130, y: 220, width: 190, height: 115 },
    danger_zone_active: false,
    verification_status: "MULTI_VEHICLE_VERIFIED",
    multi_vehicle_verification: {
      status: "MULTI_VEHICLE_VERIFIED",
      bus_count: 3,
      verification_confidence: 98.4,
      reporting_vehicles: [
        { vehicle_id: "BUS-104A", confidence: 94.8, delta_m: 0.0, time_delta: "0s" },
        { vehicle_id: "BUS-102", confidence: 91.3, delta_m: 4.2, time_delta: "+3m" },
        { vehicle_id: "BUS-103", confidence: 95.2, delta_m: 2.8, time_delta: "+6m" }
      ]
    },
    connected_vehicle_broadcast: {
      alert_status: "ACTIVE_BROADCAST",
      alert_type: "ROAD_HAZARD_WARNING",
      broadcast_radius_m: 350,
      vehicles_alerted: 7,
      caution_message: "⚠️ ROAD HAZARD AHEAD: Deep Pothole detected 180m ahead. Slow down and proceed carefully."
    },
    work_order: {
      created: true,
      work_order_id: "GCC-ROAD-4092",
      status: "ASSIGNED",
      department: "Greater Chennai Corporation (GCC) — Ward 168 Roads Div."
    }
  });

  const [connectedVehiclesList, setConnectedVehiclesList] = useState<any[]>([
    { vehicle: "MTC Bus 70H-02", type: "Bus", distance_m: 120, speed_kmh: 36, ack_status: "RECEIVED" },
    { vehicle: "Ambulance TN-01-G-1102", type: "Emergency", distance_m: 160, speed_kmh: 48, ack_status: "RECEIVED" },
    { vehicle: "Chennai Cab TN-09-CB-4491", type: "Car", distance_m: 210, speed_kmh: 42, ack_status: "RECEIVED" },
    { vehicle: "Auto TN-07-R-2210", type: "Auto", distance_m: 240, speed_kmh: 28, ack_status: "RECEIVED" },
    { vehicle: "Delivery Van TN-02-D-9092", type: "Van", distance_m: 280, speed_kmh: 33, ack_status: "RECEIVED" },
    { vehicle: "MTC Bus 101A-05", type: "Bus", distance_m: 310, speed_kmh: 30, ack_status: "RECEIVED" },
    { vehicle: "Private Car TN-10-AZ-5511", type: "Car", distance_m: 340, speed_kmh: 40, ack_status: "RECEIVED" }
  ]);

  const [recentIncidents, setRecentIncidents] = useState<any[]>([]);
  const [demoProgressStep, setDemoProgressStep] = useState<number | null>(null);
  const [isDemoRunning, setIsDemoRunning] = useState<boolean>(false);
  const [broadcastSent, setBroadcastSent] = useState<boolean>(true);
  const [workOrderStatus, setWorkOrderStatus] = useState<string>("ASSIGNED");
  const [isDetectionLoading, setIsDetectionLoading] = useState<boolean>(false);

  // DOM Refs
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Load initial safety incidents
  useEffect(() => {
    async function loadIncidents() {
      try {
        const res = await getRecentSafetyIncidents();
        if (res?.incidents) setRecentIncidents(res.incidents);
      } catch (err) {
        console.error("Failed to load safety incidents:", err);
      }
    }
    loadIncidents();
  }, []);

  // Handle Device Camera Start/Stop
  const startWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: { ideal: 1280 }, height: { ideal: 720 } } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setIsWebcamActive(true);
        setSource("DEVICE_CAMERA");
      }
    } catch (err) {
      console.warn("Webcam access denied or unavailable. Falling back to simulated feed.", err);
      alert("Camera permission denied or hardware not found. Switching to high-reliability simulated road feed.");
      setSource("FRONT_CAMERA");
    }
  };

  const stopWebcam = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsWebcamActive(false);
  };

  // Handle File Upload (Image or Video)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setUploadedMediaUrl(url);
    if (file.type.startsWith("video/")) {
      setUploadedMediaType("video");
    } else {
      setUploadedMediaType("image");
    }
    setSource("UPLOADED_MEDIA");
    stopWebcam();
  };

  // Trigger Detection on Hazard Switch
  const handleTriggerDetection = async (hazardType: HazardClass) => {
    setHazardClass(hazardType);
    setIsDetectionLoading(true);
    try {
      const res = await detectSafetyCameraHazard(source, hazardType);
      if (res?.incident) {
        setActiveIncident(res.incident);
        setWorkOrderStatus(res.incident.work_order?.status || "ASSIGNED");
        setRecentIncidents((prev) => [res.incident, ...prev.slice(0, 4)]);
      }
    } catch (err) {
      console.error("Detection error:", err);
    } finally {
      setIsDetectionLoading(false);
    }
  };

  // 60-Second Automated SIH Demo Sequence
  const run60SecondDemo = async () => {
    setIsDemoRunning(true);
    setDemoProgressStep(1); // Step 1: Start Feed
    setSource("FRONT_CAMERA");

    setTimeout(() => {
      setDemoProgressStep(2); // Step 2: AI Detects Pothole
      handleTriggerDetection("POTHOLE");
    }, 2000);

    setTimeout(() => {
      setDemoProgressStep(3); // Step 3: Bounding Box & Risk Score (87/100)
    }, 4500);

    setTimeout(() => {
      setDemoProgressStep(4); // Step 4: Multi-Vehicle Verification (3 Buses)
    }, 7000);

    setTimeout(async () => {
      setDemoProgressStep(5); // Step 5: Broadcast Caution to Nearby Vehicles (V2X)
      try {
        await broadcastSafetyCameraAlert(activeIncident.incident_id, "POTHOLE", 180);
        setBroadcastSent(true);
      } catch (err) {}
    }, 9500);

    setTimeout(() => {
      setDemoProgressStep(6); // Step 6: GIS Auto-Pinning & Work Order Dispatched
    }, 12000);

    setTimeout(() => {
      setIsDemoRunning(false);
    }, 15000);
  };

  const handleWorkOrderTransition = async (newStatus: string) => {
    setWorkOrderStatus(newStatus);
    try {
      await updateWorkOrderStatus(activeIncident.incident_id, newStatus);
    } catch (err) {
      console.error("Failed to update work order:", err);
    }
  };

  const walkthroughSteps = [
    { title: "Live Safety Camera", speech: "Welcome to the dedicated Live Road Safety Camera module for SIH PS 26124." },
    { title: "Dual Hazard Classes", speech: "Computer vision detects road potholes and vulnerable pedestrians in active danger zones." },
    { title: "Connected Vehicle Alert", speech: "Verified hazards are broadcast to approaching vehicles and dispatched as municipal work orders." }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-[#212121]">
      <GuidedWalkthroughBanner steps={walkthroughSteps} />

      {/* ========================================================================= */}
      {/* 1. HEADER BANNER & SIH PS 26124 OBJECTIVE                                */}
      {/* ========================================================================= */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border-2 border-[#FFC107] shadow-md space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 border border-amber-300 text-amber-950 text-xs font-black uppercase tracking-wider">
                <Camera className="w-3.5 h-3.5 text-amber-600" />
                SIH 2026 PS 26124 • DEDICATED LIVE SENSING MODULE
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-950 text-xs font-bold">
                <Radio className="w-3 h-3 text-emerald-600 animate-pulse" />
                Live Camera Pipeline Active
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-zinc-100 border border-zinc-300 text-zinc-700 text-xs font-mono font-bold">
                Bus Unit: BUS-104A / Route 70H
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-[#212121]">
              Live Road Safety Camera & Connected Vehicle Alert
            </h1>
            <p className="text-zinc-600 text-xs sm:text-sm font-semibold max-w-4xl leading-relaxed">
              Real-time AI computer vision for public transit fleet cameras. Continuously detects severe road potholes
              and vulnerable pedestrians in dangerous traffic zones, tags GPS/timestamp context, correlates independent observations across
              multiple fleet buses, calculates a transparent <strong>Civic Risk Score (0–100)</strong>, broadcasts immediate caution warnings to approaching
              connected vehicles, and dispatches actionable municipal work orders.
            </p>
          </div>

          {/* 60s SIH Judge Demo Button */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0">
            <button
              onClick={run60SecondDemo}
              disabled={isDemoRunning}
              className="px-6 py-3.5 rounded-2xl bg-[#FFC107] hover:bg-amber-400 text-[#18181B] font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/30 border border-amber-400 transition active:scale-95 disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4 text-zinc-950" />
              <span>{isDemoRunning ? "Running Demo Walkthrough..." : "▶ START 60s SIH DEMO"}</span>
            </button>
          </div>
        </div>

        {/* Demo Mode Disclaimer Alert */}
        <div className="pt-3 border-t border-zinc-200 flex flex-wrap items-center justify-between gap-2 text-xs font-medium text-zinc-500">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 font-mono text-[10px] font-black">
              PROTOTYPE NOTICE
            </span>
            <span>Simulated on-bus Jetson edge inference & connected-vehicle (V2X) alert broadcast for reliable presentation.</span>
          </div>
          <div className="font-mono text-[11px] text-zinc-600 font-bold">
            Primary Bus: <strong className="text-zinc-900">BUS-104A</strong> (TN-01-N-9842)
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. CAMERA SOURCE & HAZARD CLASS SELECTORS                                 */}
      {/* ========================================================================= */}
      <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* CAMERA SOURCE SELECTOR */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider block">
              1. Select Camera Feed Source:
            </span>
            <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
              <button
                onClick={() => { setSource("FRONT_CAMERA"); stopWebcam(); }}
                className={`px-3 py-2 rounded-xl border transition flex items-center gap-1.5 ${
                  source === "FRONT_CAMERA" 
                    ? "bg-[#FFC107] text-[#18181B] border-amber-400 font-black shadow-sm" 
                    : "bg-zinc-50 text-zinc-700 border-zinc-200 hover:bg-zinc-100"
                }`}
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Front Road Camera (Default)</span>
              </button>

              <button
                onClick={() => { setSource("REAR_CAMERA"); stopWebcam(); }}
                className={`px-3 py-2 rounded-xl border transition flex items-center gap-1.5 ${
                  source === "REAR_CAMERA" 
                    ? "bg-[#FFC107] text-[#18181B] border-amber-400 font-black shadow-sm" 
                    : "bg-zinc-50 text-zinc-700 border-zinc-200 hover:bg-zinc-100"
                }`}
              >
                <Video className="w-3.5 h-3.5" />
                <span>Rear Traffic Camera</span>
              </button>

              <button
                onClick={() => { setSource("SIDE_CAMERA"); stopWebcam(); }}
                className={`px-3 py-2 rounded-xl border transition flex items-center gap-1.5 ${
                  source === "SIDE_CAMERA" 
                    ? "bg-[#FFC107] text-[#18181B] border-amber-400 font-black shadow-sm" 
                    : "bg-zinc-50 text-zinc-700 border-zinc-200 hover:bg-zinc-100"
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Side Curb Camera</span>
              </button>

              <button
                onClick={isWebcamActive ? stopWebcam : startWebcam}
                className={`px-3 py-2 rounded-xl border transition flex items-center gap-1.5 ${
                  isWebcamActive 
                    ? "bg-rose-500 text-white border-rose-600 font-black shadow-sm" 
                    : "bg-zinc-50 text-zinc-700 border-zinc-200 hover:bg-zinc-100"
                }`}
              >
                <Camera className="w-3.5 h-3.5" />
                <span>{isWebcamActive ? "Stop Device Webcam" : "Device Webcam / Phone Camera"}</span>
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                className={`px-3 py-2 rounded-xl border transition flex items-center gap-1.5 ${
                  source === "UPLOADED_MEDIA" 
                    ? "bg-[#FFC107] text-[#18181B] border-amber-400 font-black shadow-sm" 
                    : "bg-zinc-50 text-zinc-700 border-zinc-200 hover:bg-zinc-100"
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload Video / Image</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="video/*,image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          </div>

          {/* HAZARD CLASS TOGGLE */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider block">
              2. Target AI Detection Class:
            </span>
            <div className="flex items-center gap-2 text-xs font-black">
              <button
                onClick={() => handleTriggerDetection("POTHOLE")}
                className={`px-4 py-2 rounded-xl border transition flex items-center gap-1.5 ${
                  hazardClass === "POTHOLE"
                    ? "bg-rose-600 text-white border-rose-700 shadow-md scale-102"
                    : "bg-zinc-100 text-zinc-700 border-zinc-200 hover:bg-zinc-200"
                }`}
              >
                <span>🕳️</span>
                <span>Severe Pothole (94.8%)</span>
              </button>

              <button
                onClick={() => handleTriggerDetection("PEDESTRIAN_DANGER")}
                className={`px-4 py-2 rounded-xl border transition flex items-center gap-1.5 ${
                  hazardClass === "PEDESTRIAN_DANGER"
                    ? "bg-amber-500 text-zinc-950 border-amber-600 shadow-md scale-102"
                    : "bg-zinc-100 text-zinc-700 border-zinc-200 hover:bg-zinc-200"
                }`}
              >
                <span>🚶⚠️</span>
                <span>Pedestrian Danger Zone (96.4%)</span>
              </button>
            </div>
          </div>

        </div>

        {/* 60s Demo Step Banner */}
        {demoProgressStep && (
          <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-300 text-xs font-bold text-amber-950 flex items-center justify-between animate-fadeIn">
            <span>
              👉 Demo Step #{demoProgressStep}:{" "}
              {demoProgressStep === 1 && "Starting live camera video stream from Front Road AI sensor..."}
              {demoProgressStep === 2 && "Edge AI detects severe asphalt defect on roadway carriage-way..."}
              {demoProgressStep === 3 && "Bounding box overlaid with 94.8% confidence. Civic Risk Score computed: 87/100."}
              {demoProgressStep === 4 && "Corroborated by BUS-102 & BUS-103 for Multi-Vehicle Spatial Verification (98.4%)."}
              {demoProgressStep === 5 && "V2X broadcast sent: 7 nearby vehicles alerted within 350m radius."}
              {demoProgressStep === 6 && "Incident auto-pinned on Central GIS Map and Work Order #GCC-ROAD-4092 created!"}
            </span>
            <span className="font-mono text-[10px] text-amber-800 font-black">
              STEP {demoProgressStep} OF 6
            </span>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 3. CENTRAL CAMERA FEED & LIVE AI DETECTION OVERLAY                        */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT/CENTER: LARGE LIVE CAMERA FEED */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-ping" />
                <h3 className="font-black text-base text-[#212121]">
                  Live Video Stream • {source.replace("_", " ")}
                </h3>
              </div>

              <div className="flex items-center gap-2 font-mono text-[11px] font-bold">
                <span className="px-2 py-0.5 rounded bg-zinc-100 text-zinc-700 border border-zinc-200">
                  45 FPS INFERENCE
                </span>
                <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300">
                  NVIDIA Jetson AGX Orin
                </span>
              </div>
            </div>

            {/* VIDEO CANVAS CONTAINER */}
            <div className="relative w-full h-[360px] sm:h-[420px] bg-zinc-950 rounded-2xl overflow-hidden border-2 border-zinc-800 flex items-center justify-center shadow-inner">
              
              {/* WEBCAM VIDEO STREAM */}
              {isWebcamActive ? (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
              ) : uploadedMediaUrl ? (
                uploadedMediaType === "video" ? (
                  <video
                    src={uploadedMediaUrl}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <img
                    src={uploadedMediaUrl}
                    alt="Uploaded Feed"
                    className="w-full h-full object-cover"
                  />
                )
              ) : (
                /* HIGH-RES STREET-LEVEL TRANSIT PHOTOGRAPHY FOR ROAD HAZARD SIMULATION */
                <img
                  src={
                    hazardClass === "PEDESTRIAN_DANGER"
                      ? "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=1000&auto=format&fit=crop&q=80"
                      : source === "REAR_CAMERA"
                      ? "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=1000&auto=format&fit=crop&q=80"
                      : source === "SIDE_CAMERA"
                      ? "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1000&auto=format&fit=crop&q=80"
                      : "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=1000&auto=format&fit=crop&q=80"
                  }
                  alt="Transit Camera Stream"
                  className="w-full h-full object-cover opacity-90"
                />
              )}

              {/* Edge AI Telemetry Overlay (Top-Left) */}
              <div className="absolute top-3 left-3 bg-black/80 backdrop-blur-md px-3 py-2 rounded-xl border border-white/20 font-mono text-[10px] text-amber-400 font-bold space-y-0.5 pointer-events-none">
                <div>BUS UNIT: BUS-104A (TN-01-N-9842)</div>
                <div>CORRIDOR: Route 70H (Guindy Kathipara Flyover)</div>
                <div>GPS: {activeIncident.latitude?.toFixed(4)}°N, {activeIncident.longitude?.toFixed(4)}°E</div>
                <div>SPEED: 34 km/h • LATENCY: 18.2ms</div>
              </div>

              {/* Privacy Masking Tag (Top-Right) */}
              <div className="absolute top-3 right-3 bg-black/80 backdrop-blur-md px-2.5 py-1 rounded-xl border border-white/20 font-mono text-[10px] text-emerald-400 font-bold flex items-center gap-1.5 pointer-events-none">
                <Lock className="w-3 h-3 text-emerald-400" />
                <span>PRIVACY-PRESERVING EDGE AI</span>
              </div>

              {/* CONFIGURABLE PEDESTRIAN ROAD DANGER ZONE OVERLAY */}
              {hazardClass === "PEDESTRIAN_DANGER" && (
                <div 
                  className="absolute border-2 border-dashed border-amber-400 bg-amber-500/15 rounded-xl pointer-events-none transition-all duration-300"
                  style={{
                    left: "22%",
                    top: "26%",
                    width: "48%",
                    height: "58%",
                  }}
                >
                  <span className="absolute -top-5 left-1 bg-amber-400 text-zinc-950 px-1.5 py-0.5 rounded text-[9px] font-black uppercase">
                    ⚠️ ACTIVE ROAD DANGER ZONE (NON-ZEBRA)
                  </span>
                </div>
              )}

              {/* REAL-TIME COMPUTER VISION BOUNDING BOX OVERLAY */}
              <div
                className={`absolute border-2 rounded-lg p-1.5 transition-all duration-500 animate-pulse shadow-2xl pointer-events-none ${
                  hazardClass === "POTHOLE" 
                    ? "border-rose-500 bg-rose-500/25" 
                    : "border-amber-400 bg-amber-400/25"
                }`}
                style={{
                  left: hazardClass === "POTHOLE" ? "22%" : "34%",
                  top: hazardClass === "POTHOLE" ? "52%" : "32%",
                  width: hazardClass === "POTHOLE" ? "36%" : "24%",
                  height: hazardClass === "POTHOLE" ? "28%" : "44%",
                }}
              >
                <div className={`absolute -top-7 left-0 px-2 py-0.5 rounded text-[10px] font-black uppercase whitespace-nowrap shadow-md flex items-center gap-1 ${
                  hazardClass === "POTHOLE" ? "bg-rose-600 text-white" : "bg-amber-400 text-zinc-950"
                }`}>
                  <span>{hazardClass === "POTHOLE" ? "POTHOLE" : "VULNERABLE PEDESTRIAN"}</span>
                  <span>({activeIncident.confidence}%)</span>
                </div>
              </div>

              {/* Bottom Telemetry Status Bar */}
              <div className="absolute bottom-3 left-3 right-3 bg-black/85 backdrop-blur-md px-3 py-2 rounded-xl border border-white/20 text-xs font-bold text-white flex flex-wrap items-center justify-between gap-2 pointer-events-none">
                <div className="flex items-center gap-2">
                  <span className={hazardClass === "POTHOLE" ? "text-rose-400" : "text-amber-400"}>
                    {hazardClass === "POTHOLE" ? "🔴 POTHOLE DETECTED" : "🚶⚠️ VULNERABLE ROAD USER DETECTED"}
                  </span>
                  <span className="font-mono text-zinc-300">Confidence: {activeIncident.confidence}%</span>
                </div>
                <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-400">
                  <span>GPS: {activeIncident.latitude}, {activeIncident.longitude}</span>
                  <span>TIME: {activeIncident.timestamp}</span>
                </div>
              </div>
            </div>

            {/* Bottom Status Tickers */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-[10px] font-mono font-bold pt-1">
              <div className="p-2 bg-zinc-50 rounded-xl border border-zinc-200">
                <span className="text-zinc-400 block">GPS TELEMETRY</span>
                <span className="text-emerald-700">✓ LOCK ACTIVE</span>
              </div>
              <div className="p-2 bg-zinc-50 rounded-xl border border-zinc-200">
                <span className="text-zinc-400 block">TIMESTAMP</span>
                <span className="text-zinc-800">{activeIncident.timestamp}</span>
              </div>
              <div className="p-2 bg-zinc-50 rounded-xl border border-zinc-200">
                <span className="text-zinc-400 block">EDGE INFERENCE</span>
                <span className="text-amber-800">✓ TENSORRT FP16</span>
              </div>
              <div className="p-2 bg-zinc-50 rounded-xl border border-zinc-200">
                <span className="text-zinc-400 block">EVIDENCE FRAME</span>
                <span className="text-indigo-700">✓ CAPTURED</span>
              </div>
              <div className="p-2 bg-zinc-50 rounded-xl border border-zinc-200 col-span-2 sm:col-span-1">
                <span className="text-zinc-400 block">V2X BROADCAST</span>
                <span className="text-rose-700">📡 7 VEHICLES</span>
              </div>
            </div>
          </div>

          {/* EVIDENCE FRAME CARD */}
          <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-amber-600" />
                <h4 className="font-black text-sm text-[#212121]">Captured Evidence Frame</h4>
              </div>
              <span className="text-[10px] font-mono text-zinc-500 font-bold">
                Incident #{activeIncident.incident_id}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="relative w-full sm:w-48 h-28 bg-zinc-900 rounded-xl overflow-hidden border border-zinc-200 shrink-0">
                <img
                  src={
                    hazardClass === "PEDESTRIAN_DANGER"
                      ? "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=500&auto=format&fit=crop&q=80"
                      : "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=500&auto=format&fit=crop&q=80"
                  }
                  alt="Evidence Thumbnail"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 border-2 border-amber-400/80 m-2 rounded pointer-events-none" />
                <span className="absolute bottom-1 right-1 bg-black/80 text-amber-400 text-[8px] font-mono px-1 rounded">
                  EVIDENCE SNAPSHOT
                </span>
              </div>

              <div className="space-y-1 text-xs text-zinc-600 w-full font-medium">
                <div className="font-black text-[#212121] text-sm">{activeIncident.title}</div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px]">
                  <span>📍 {activeIncident.location_name}</span>
                  <span>🕐 {activeIncident.timestamp}</span>
                  <span>🚌 Unit: <strong>{activeIncident.vehicle_id}</strong></span>
                  <span>📷 Camera: <strong>{activeIncident.camera_id}</strong></span>
                </div>
                <div className="pt-1 text-[11px] text-zinc-500 font-normal">
                  Face and license plate blurring applied locally at the edge prior to cloud metadata transmission.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: INCIDENT TELEMETRY, RISK SCORE, V2X ALERT & MULTI-BUS VERIFICATION */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* CIVIC RISK SCORE (0-100) */}
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

            <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 text-center space-y-1">
              <span className="text-5xl font-black font-mono tracking-tight" style={{
                color: activeIncident.civic_risk_score >= 80 ? "#EF4444" : "#F59E0B"
              }}>
                {activeIncident.civic_risk_score}
                <span className="text-lg text-zinc-400 font-bold"> / 100</span>
              </span>
              <span className="block text-xs font-black uppercase tracking-wider text-rose-600">
                {activeIncident.severity} HAZARD SEVERITY
              </span>
            </div>

            <div className="space-y-1.5 text-xs text-zinc-600 font-medium bg-zinc-50 p-3 rounded-xl border border-zinc-200">
              <div className="flex justify-between">
                <span>AI Confidence ({activeIncident.confidence}%):</span>
                <span className="font-mono font-bold text-zinc-900">+24 pts</span>
              </div>
              <div className="flex justify-between">
                <span>Hazard Severity ({activeIncident.severity}):</span>
                <span className="font-mono font-bold text-zinc-900">+35 pts</span>
              </div>
              <div className="flex justify-between">
                <span>Arterial Traffic Corridor:</span>
                <span className="font-mono font-bold text-zinc-900">+18 pts</span>
              </div>
              <div className="flex justify-between text-amber-700 font-bold">
                <span>Multi-Bus Recurrence Bonus:</span>
                <span className="font-mono">+10 pts</span>
              </div>
            </div>
          </div>

          {/* 📡 BROADCAST CAUTION TO NEARBY VEHICLES (V2X CONNECTED VEHICLE ALERT) */}
          <div className="bg-white p-6 rounded-3xl border-2 border-rose-300 shadow-md space-y-4">
            <div className="flex items-center justify-between border-b border-rose-100 pb-3">
              <div className="flex items-center gap-2">
                <Radio className="w-5 h-5 text-rose-600 animate-pulse" />
                <h3 className="font-black text-sm text-[#212121]">Connected Vehicle Alert (V2X)</h3>
              </div>
              <span className="text-[10px] font-black bg-rose-100 text-rose-950 border border-rose-300 px-2 py-0.5 rounded uppercase">
                Active Broadcast
              </span>
            </div>

            {/* Simulated In-Cabin Caution Card */}
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 space-y-2 text-xs">
              <div className="flex items-center gap-2 text-rose-700 font-black">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>
                  {hazardClass === "POTHOLE" 
                    ? "⚠️ ROAD HAZARD AHEAD: POTHOLE DETECTED" 
                    : "⚠️ PEDESTRIAN DANGER AHEAD: HIGH-RISK PEDESTRIAN"}
                </span>
              </div>

              <div className="font-mono text-[11px] text-zinc-700 space-y-0.5 pl-6">
                <div>Distance: <strong>{hazardClass === "POTHOLE" ? "180 m" : "120 m"}</strong></div>
                <div>Severity: <strong className="text-rose-600">{activeIncident.severity}</strong></div>
                <div>Confidence: <strong>{activeIncident.confidence}%</strong></div>
              </div>

              <p className="text-[11px] text-rose-950 font-bold pl-6">
                {hazardClass === "POTHOLE" 
                  ? "Slow down and proceed carefully." 
                  : "Reduce speed and remain alert. Vulnerable pedestrian in carriage-way."}
              </p>

              <div className="pt-2 border-t border-rose-200/80 flex justify-between items-center text-[10px] font-mono text-zinc-500">
                <span>BROADCAST RADIUS: 350m</span>
                <span className="text-rose-700 font-black">VEHICLES ALERTED: 7</span>
              </div>
            </div>

            {/* List of Alerted Vehicles */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase block">Nearby Alerted Fleet:</span>
              <div className="space-y-1 max-h-[140px] overflow-y-auto pr-1">
                {connectedVehiclesList.map((v, idx) => (
                  <div key={idx} className="p-2 rounded-xl bg-zinc-50 border border-zinc-200 flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-2">
                      <span className="text-xs">🚗</span>
                      <span className="font-bold text-zinc-800">{v.vehicle}</span>
                    </div>
                    <div className="font-mono text-[10px] text-zinc-500">
                      <span>{v.distance_m}m</span> • <span className="text-emerald-700 font-bold">✓ ACK</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* MULTI-VEHICLE VERIFICATION */}
          <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <h3 className="font-black text-sm text-[#212121] flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Multi-Vehicle Verification</span>
              </h3>
              <span className="text-[10px] font-black bg-emerald-100 text-emerald-950 border border-emerald-300 px-2 py-0.5 rounded">
                3 BUSES CORRELATED
              </span>
            </div>

            <div className="space-y-1.5 text-xs text-zinc-600 font-medium">
              <div className="p-2.5 rounded-xl bg-zinc-50 border border-zinc-200 space-y-1">
                <div className="flex justify-between text-[11px] font-bold text-zinc-900">
                  <span>BUS-104A (Flagship)</span>
                  <span className="text-emerald-700">94.8% conf. (0m)</span>
                </div>
                <div className="flex justify-between text-[11px] font-bold text-zinc-900">
                  <span>BUS-102 (Route 101A)</span>
                  <span className="text-emerald-700">91.3% conf. (+4.2m)</span>
                </div>
                <div className="flex justify-between text-[11px] font-bold text-zinc-900">
                  <span>BUS-103 (Route 23C)</span>
                  <span className="text-emerald-700">95.2% conf. (+2.8m)</span>
                </div>
              </div>

              <div className="p-2 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-950 text-[11px] font-bold flex items-center justify-between">
                <span>✓ MULTI-VEHICLE VERIFIED</span>
                <span>Combined Conf: 98.4%</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. CENTRAL GIS MAP & AUTOMATED MUNICIPAL WORK ORDER LIFECYCLE             */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* GIS INCIDENT MAP */}
        <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-zinc-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
            <div>
              <h3 className="font-black text-lg text-[#212121] flex items-center gap-2">
                <MapPin className="w-5 h-5 text-amber-600" /> GIS Incident Pinning
              </h3>
              <p className="text-xs text-zinc-500 font-medium">Automatically mapped to Chennai Central GIS Command Map</p>
            </div>
            <span className="text-xs font-mono font-bold text-zinc-700 bg-zinc-100 px-3 py-1 rounded-xl">
              13.0067°N, 80.2020°E
            </span>
          </div>

          <MapWrapper
            center={[activeIncident.latitude || 13.0067, activeIncident.longitude || 80.2020]}
            zoom={13}
            buses={[{ bus_id: "BUS-104A", reg_number: "TN-01-N-9842", lat: activeIncident.latitude, lng: activeIncident.longitude, speed_kmh: 34 }]}
            hazards={[activeIncident]}
            height="380px"
          />
        </div>

        {/* MUNICIPAL WORK ORDER WORKFLOW */}
        <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-3xl border border-zinc-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
            <div>
              <h3 className="font-black text-lg text-[#212121] flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-600" /> Municipal Work Order
              </h3>
              <p className="text-xs text-zinc-500 font-medium">Automated dispatch to civic repair crew</p>
            </div>
            <span className="text-xs font-mono font-bold bg-amber-100 text-amber-900 border border-amber-300 px-2.5 py-1 rounded-xl">
              #GCC-ROAD-4092
            </span>
          </div>

          {/* Workflow Sequence Indicator */}
          <div className="p-3 bg-zinc-50 rounded-2xl border border-zinc-200 text-center space-y-2">
            <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase block">
              Automated Lifecycle Progress:
            </span>
            <div className="text-[11px] font-mono font-black text-zinc-800 leading-snug">
              AI DETECTED ➔ VERIFIED ➔ PRIORITIZED ➔ WORK ORDER CREATED
            </div>
          </div>

          {/* Ticket Details */}
          <div className="space-y-2 text-xs text-zinc-600">
            <div className="p-3 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-1.5">
              <div className="flex justify-between">
                <span className="text-zinc-500">Incident Ticket:</span>
                <span className="font-mono font-bold text-zinc-900">{activeIncident.incident_id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Assigned Department:</span>
                <span className="font-bold text-zinc-900">Greater Chennai Corp (GCC)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Assigned Crew:</span>
                <span className="font-bold text-zinc-900">Patch Repair Crew #4</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Current Status:</span>
                <span className="font-mono font-black text-indigo-700">{workOrderStatus}</span>
              </div>
            </div>

            {/* Interactive Status Transition Buttons */}
            <div className="pt-2 space-y-2">
              <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase block">Simulate Municipal Action:</span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => handleWorkOrderTransition("ASSIGNED")}
                  className={`py-2 rounded-xl text-xs font-bold transition ${
                    workOrderStatus === "ASSIGNED" 
                      ? "bg-[#FFC107] text-[#18181B] font-black shadow-sm" 
                      : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
                  }`}
                >
                  Assigned
                </button>
                <button
                  onClick={() => handleWorkOrderTransition("IN_PROGRESS")}
                  className={`py-2 rounded-xl text-xs font-bold transition ${
                    workOrderStatus === "IN_PROGRESS" 
                      ? "bg-indigo-600 text-white font-black shadow-sm" 
                      : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
                  }`}
                >
                  In Progress
                </button>
                <button
                  onClick={() => handleWorkOrderTransition("RESOLVED")}
                  className={`py-2 rounded-xl text-xs font-bold transition ${
                    workOrderStatus === "RESOLVED" 
                      ? "bg-emerald-600 text-white font-black shadow-sm" 
                      : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
                  }`}
                >
                  Resolved
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* 5. ARCHITECTURE DISPLAY & PRIVACY-PRESERVING FRAMEWORK                   */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* ARCHITECTURE DISPLAY */}
        <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
            <h3 className="font-black text-sm text-[#212121] flex items-center gap-2">
              <Cpu className="w-4 h-4 text-amber-600" /> End-to-End Safety Camera Architecture
            </h3>
            <span className="text-[10px] font-mono font-bold bg-zinc-100 px-2.5 py-1 rounded text-zinc-600">
              NVIDIA Jetson AGX Orin
            </span>
          </div>

          <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-200 text-center font-mono text-xs font-bold text-zinc-700 leading-relaxed">
            CAMERA ➔ EDGE AI ➔ POTHOLE / PEDESTRIAN DETECTION ➔ CONFIDENCE + GPS + TIMESTAMP ➔ RISK ASSESSMENT ➔ MULTI-BUS VERIFICATION ➔ CONNECTED VEHICLE ALERT ➔ GIS + MUNICIPAL WORK ORDER
          </div>

          <p className="text-xs text-zinc-600 leading-relaxed font-medium">
            <strong>Edge-First Processing:</strong> Rather than streaming high-bandwidth raw video to a centralized cloud, on-bus edge processors perform inference in 18.2ms. Unflagged frames are immediately discarded, transmitting only confirmed hazard alert packets (~800 bytes).
          </p>
        </div>

        {/* PRIVACY-PRESERVING FRAMEWORK */}
        <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
            <h3 className="font-black text-sm text-[#212121] flex items-center gap-2">
              <Lock className="w-4 h-4 text-emerald-600" /> Privacy-Preserving Edge Processing
            </h3>
            <span className="text-[10px] font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded">
              DPDP / GDPR Compliant
            </span>
          </div>

          <div className="space-y-2 text-xs text-zinc-600 font-medium">
            <div className="p-2.5 rounded-xl bg-zinc-50 border border-zinc-200 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>Automated Face & Plate Blurring:</strong> Computer vision anonymization algorithms blur human faces and private vehicle plates.</span>
            </div>
            <div className="p-2.5 rounded-xl bg-zinc-50 border border-zinc-200 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>Metadata-First Transmission:</strong> Only incident telemetry (coordinates, timestamp, risk score) is dispatched.</span>
            </div>
            <div className="p-2.5 rounded-xl bg-zinc-50 border border-zinc-200 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>Minimum Evidence Retention:</strong> Ephemeral storage clears unverified frames after 24 hours.</span>
            </div>
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* 6. RECENT INCIDENTS TIMELINE                                              */}
      {/* ========================================================================= */}
      <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
          <h3 className="font-black text-base text-[#212121]">Safety Camera Detection History</h3>
          <span className="text-xs font-mono font-bold text-zinc-500">Live Incident Log</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {recentIncidents.map((inc: any, idx: number) => (
            <div
              key={idx}
              onClick={() => {
                setActiveIncident(inc);
                setHazardClass(inc.hazard_type);
              }}
              className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 hover:border-amber-400 hover:bg-amber-50/50 transition cursor-pointer space-y-2 text-xs"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono font-black text-amber-800">{inc.incident_id}</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-black" style={{
                  backgroundColor: inc.hazard_type === "POTHOLE" ? "#FEE2E2" : "#FEF3C7",
                  color: inc.hazard_type === "POTHOLE" ? "#991B1B" : "#92400E"
                }}>
                  {inc.hazard_type}
                </span>
              </div>
              <div className="font-bold text-zinc-900">{inc.title}</div>
              <div className="text-[11px] text-zinc-500 font-mono">
                📍 {inc.location_name} • {inc.timestamp}
              </div>
              <div className="flex justify-between items-center pt-1 border-t border-zinc-200 text-[10px] font-bold">
                <span className="text-rose-600">Risk: {inc.civic_risk_score}/100</span>
                <span className="text-emerald-700">✓ {inc.verification_status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
