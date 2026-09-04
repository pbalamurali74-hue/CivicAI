const express = require('express');
const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const os = require('os');

const app = express();
const HTTP_PORT = process.env.PORT || 3001;
const HTTPS_PORT = process.env.HTTPS_PORT || 3443;

app.use(express.json({ limit: '25mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// In-Memory Incident Store initialized with SIH PS 26124 test cases
const incidents = [
  {
    incident_id: "INC-2026-00421",
    work_order_id: "GCC-ROAD-4092",
    hazard_type: "POTHOLE",
    title: "Severe Deep Asphalt Pothole",
    confidence: 94.8,
    severity: "HIGH",
    risk_score: 87,
    timestamp: "05 Sep 2026, 19:42:18 IST",
    latitude: 13.0067,
    longitude: 80.2020,
    location_name: "Guindy Kathipara Underpass, Chennai",
    vehicle_id: "BUS-104A",
    route_id: "70H",
    camera_id: "FRONT ROAD AI CAMERA",
    status: "ASSIGNED",
    verified_by_fleet: ["BUS-104A", "BUS-102", "BUS-103"],
    vehicles_alerted: 7
  },
  {
    incident_id: "INC-2026-00388",
    work_order_id: "GCC-FLOOD-1092",
    hazard_type: "WATERLOGGING",
    title: "Standing Water on Road Carriage-Way (~38m²)",
    confidence: 92.1,
    severity: "HIGH",
    risk_score: 82,
    timestamp: "05 Sep 2026, 19:28:44 IST",
    latitude: 13.0112,
    longitude: 80.2085,
    location_name: "Saidapet Subway Incline, Chennai",
    vehicle_id: "BUS-102",
    route_id: "101A",
    camera_id: "FRONT ROAD AI CAMERA",
    status: "WORK ORDER CREATED",
    verified_by_fleet: ["BUS-102", "BUS-104A"],
    vehicles_alerted: 5
  },
  {
    incident_id: "INC-2026-00362",
    work_order_id: "GCC-SAFETY-1104",
    hazard_type: "PEDESTRIAN_HAZARD",
    title: "Vulnerable Road User in Non-Zebra Road Danger Zone",
    confidence: 96.4,
    severity: "CRITICAL",
    risk_score: 94,
    timestamp: "05 Sep 2026, 19:15:02 IST",
    latitude: 13.0275,
    longitude: 80.2289,
    location_name: "Teynampet Signal Junction, Chennai",
    vehicle_id: "BUS-104A",
    route_id: "70H",
    camera_id: "FRONT ROAD AI CAMERA",
    status: "REPORTED",
    verified_by_fleet: ["BUS-104A", "BUS-102", "BUS-103"],
    vehicles_alerted: 9
  }
];

function getLocalIpAddresses() {
  const interfaces = os.networkInterfaces();
  const addresses = [];
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        addresses.push(iface.address);
      }
    }
  }
  return addresses.length > 0 ? addresses : ['127.0.0.1'];
}

function getHazardMetadata(type) {
  switch (type) {
    case 'POTHOLE':
      return {
        title: "Severe Deep Asphalt Pothole",
        prefix: "GCC-ROAD",
        dept: "Greater Chennai Corporation (GCC) — Road Infrastructure Dept"
      };
    case 'PEDESTRIAN_HAZARD':
      return {
        title: "Vulnerable Pedestrian in Roadway Corridor",
        prefix: "GCC-SAFETY",
        dept: "Greater Chennai Traffic Police (GCTP) & Road Safety Cell"
      };
    case 'WATERLOGGING':
      return {
        title: "Standing Water on Road Carriage-Way (~38m²)",
        prefix: "GCC-FLOOD",
        dept: "CMWSSB & GCC Storm Water Drainage Division"
      };
    case 'MISSING_SIGN':
      return {
        title: "Missing Regulatory Traffic Sign (Expected Zone)",
        prefix: "GCC-TRAFFIC",
        dept: "GCC Traffic Engineering Cell & Highway Signage Division"
      };
    case 'DAMAGED_SIGN':
      return {
        title: "Damaged / Bent Regulatory Post (>28° Defect)",
        prefix: "GCC-TRAFFIC",
        dept: "GCC Traffic Engineering Cell & Highway Signage Division"
      };
    case 'GARBAGE_SPILL':
      return {
        title: "Municipal Waste Accumulation Obstructing Roadway (~12m²)",
        prefix: "GCC-WASTE",
        dept: "Urbaser Sumeet / GCC Solid Waste Management"
      };
    default:
      return {
        title: "Roadway Hazard Incident",
        prefix: "GCC-CIVIC",
        dept: "Greater Chennai Corporation Central Control"
      };
  }
}

app.get('/api/status', (req, res) => {
  res.json({
    status: "ONLINE",
    app_name: "CivicAI RoadGuard",
    tagline: "AI-Powered Real-Time Road Hazard Detection & Connected Vehicle Alerts",
    problem_statement: "SIH 2026 PS 26124",
    primary_bus: "BUS-104A (TN-01-N-9842)",
    route: "70H (Guindy ⇄ T. Nagar)",
    target_classes: [
      "POTHOLE",
      "PEDESTRIAN_HAZARD",
      "WATERLOGGING",
      "MISSING_SIGN",
      "DAMAGED_SIGN",
      "GARBAGE_SPILL"
    ],
    incidents_logged: incidents.length
  });
});

app.get('/api/incidents', (req, res) => {
  res.json({ status: "SUCCESS", incidents });
});

async function queryYoloBackend(imageBase64, threshold, lat, lng) {
  return new Promise((resolve) => {
    const postData = JSON.stringify({
      image_base64: imageBase64,
      threshold: threshold || 0.40,
      iou_threshold: 0.45,
      lat: lat !== undefined ? Number(lat) : null,
      lng: lng !== undefined ? Number(lng) : null
    });

    const req = http.request({
      hostname: '127.0.0.1',
      port: 8000,
      path: '/api/hazard/detect-frame',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      },
      timeout: 2500
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve(parsed);
        } catch (e) {
          resolve(null);
        }
      });
    });

    req.on('error', () => resolve(null));
    req.on('timeout', () => {
      req.destroy();
      resolve(null);
    });

    req.write(postData);
    req.end();
  });
}

app.post('/api/pothole/detect-frame', async (req, res) => {
  const { image_base64, threshold, lat, lng } = req.body;
  const confThresh = threshold ? parseFloat(threshold) : 0.40;

  if (!image_base64) {
    return res.status(400).json({ status: "ERROR", message: "Missing image_base64" });
  }

  // Forward to FastAPI YOLO model
  const yoloRes = await queryYoloBackend(image_base64, confThresh, lat, lng);
  if (yoloRes && yoloRes.status === "SUCCESS") {
    return res.json({
      status: "SUCCESS",
      inference_engine: yoloRes.model_name || "YOLOv8n-RoadGuard Fine-Tuned",
      device: yoloRes.device || "APPLE SILICON MPS",
      detected: yoloRes.detected,
      count: yoloRes.count,
      detections: yoloRes.detections,
      latency_ms: yoloRes.latency_ms,
      confidence_threshold: confThresh
    });
  }

  // Graceful fallback to client-side detection telemetry
  res.json({
    status: "STANDBY",
    inference_engine: "CivicAI RoadGuard Edge Dispatcher",
    detected: false,
    detections: [],
    latency_ms: 5,
    confidence_threshold: confThresh
  });
});

app.post('/api/hazard/detect-frame', async (req, res) => {
  const { image_base64, threshold } = req.body;
  const confThresh = threshold ? parseFloat(threshold) : 0.40;
  const yoloRes = await queryYoloBackend(image_base64, confThresh);
  if (yoloRes && yoloRes.status === "SUCCESS") {
    return res.json(yoloRes);
  }
  res.json({
    status: "STANDBY",
    detected: false,
    detections: [],
    latency_ms: 5
  });
});

app.post('/api/detect', (req, res) => {
  const { hazard_type, confidence, severity, risk_score, latitude, longitude, location_name, vehicle_id, camera_id, evidence_frame } = req.body;
  
  const now = new Date();
  const timeString = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ', ' +
                     now.toLocaleTimeString('en-GB', { hour12: false }) + ' IST';

  const type = hazard_type || "POTHOLE";
  const meta = getHazardMetadata(type);
  const ticketSeq = Math.floor(Math.random() * 9000) + 1000;

  const newIncident = {
    incident_id: `INC-2026-${ticketSeq}`,
    work_order_id: `${meta.prefix}-${ticketSeq}`,
    hazard_type: type,
    title: meta.title,
    confidence: confidence || 94.8,
    severity: severity || "HIGH",
    risk_score: risk_score || 85,
    timestamp: timeString,
    latitude: latitude || 13.0067,
    longitude: longitude || 80.2020,
    location_name: location_name || "Guindy Kathipara Underpass, Chennai",
    vehicle_id: vehicle_id || "BUS-104A",
    route_id: "70H",
    camera_id: camera_id || "FRONT ROAD AI CAMERA",
    evidence_frame: evidence_frame || null,
    status: "WORK ORDER CREATED",
    verified_by_fleet: ["BUS-104A", "BUS-102", "BUS-103"],
    vehicles_alerted: 7
  };

  incidents.unshift(newIncident);
  res.json({ status: "SUCCESS", incident: newIncident });
});

app.post('/api/report-municipal', (req, res) => {
  const { incident_id, hazard_type } = req.body;
  const inc = incidents.find(i => i.incident_id === incident_id) || incidents[0];
  const meta = getHazardMetadata(hazard_type || (inc ? inc.hazard_type : 'POTHOLE'));

  if (inc) {
    inc.status = "REPORTED";
    if (!inc.work_order_id) {
      inc.work_order_id = `${meta.prefix}-${Math.floor(Math.random() * 9000) + 1000}`;
    }
  }

  res.json({
    status: "SUCCESS",
    work_order_id: inc ? inc.work_order_id : `${meta.prefix}-4092`,
    department: meta.dept,
    message: `Municipal Work Order dispatched to ${meta.dept}.`
  });
});

// Start HTTP Server
const httpServer = http.createServer(app);
httpServer.listen(HTTP_PORT, '0.0.0.0', () => {
  printStartupBanner();
});

// Start HTTPS Server
const keyPath = path.join(__dirname, 'key.pem');
const certPath = path.join(__dirname, 'cert.pem');

if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
  const httpsOptions = {
    key: fs.readFileSync(keyPath),
    cert: fs.readFileSync(certPath)
  };
  const httpsServer = https.createServer(httpsOptions, app);
  httpsServer.listen(HTTPS_PORT, '0.0.0.0', () => {
    // HTTPS started
  });
}

function printStartupBanner() {
  const ips = getLocalIpAddresses();
  const primaryIp = ips[0];

  console.log('\n' + '='.repeat(75));
  console.log('  🛡️  CIVICAI ROADGUARD — SIH 2026 PS 26124 SIX ROAD HAZARDS APPLICATION');
  console.log('  Exact Six Classes: Pothole, Pedestrian Hazard, Waterlogging, Missing Sign, Damaged Sign, Garbage Spill');
  console.log('='.repeat(75));
  console.log(`\n💻 LAPTOP BROWSER ACCESS:`);
  console.log(`   ▶ HTTP:  http://localhost:${HTTP_PORT}`);
  console.log(`   ▶ HTTPS: https://localhost:${HTTPS_PORT}`);
  console.log(`\n📱 PHONE / MOBILE BROWSER ACCESS (Same Wi-Fi Network):`);
  console.log(`   ▶ HTTPS (RECOMMENDED FOR REAR CAMERA): https://${primaryIp}:${HTTPS_PORT}`);
  console.log(`   ▶ HTTP:                                 http://${primaryIp}:${HTTP_PORT}`);
  console.log('\n💡 MOBILE CAMERA NOTE:');
  console.log('   Mobile browsers require HTTPS to grant camera permission.');
  console.log('   If your phone shows an SSL warning on HTTPS, tap "Advanced" -> "Proceed to site".');
  console.log('   If camera hardware is unavailable, tap "START SIX-HAZARD DEMO" for automated demo feed.');
  console.log('='.repeat(75) + '\n');
}
