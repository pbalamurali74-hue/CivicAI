/**
 * CivicAI RoadGuard - Application Controller
 * Orchestrates camera stream, real-time canvas rendering, six-hazard detections,
 * C-V2X simulations, municipal ticketing, evidence snapshots, and automated SIH demo runner.
 */

document.addEventListener('DOMContentLoaded', () => {
  // Video & Canvas Elements
  const videoEl = document.getElementById('cameraVideo');
  const canvasEl = document.getElementById('cameraCanvas');
  const ctx = canvasEl.getContext('2d');

  // Primary Camera & HUD Buttons
  const btnStartCamera = document.getElementById('btnStartCamera');
  const btnFlipCamera = document.getElementById('btnFlipCamera');
  const btnToggleDangerZone = document.getElementById('btnToggleDangerZone');
  const btnGpsModeToggle = document.getElementById('btnGpsModeToggle');
  const btnMobileGuide = document.getElementById('btnMobileGuide');
  const btnCloseGuide = document.getElementById('btnCloseGuide');
  const btnCloseGuideBtn = document.getElementById('btnCloseGuideBtn');
  const mobileGuideModal = document.getElementById('mobileGuideModal');

  // AI Inference Mode Controls (Section 18: Real vs Demo)
  const btnModeRealTf = document.getElementById('btnModeRealTf');
  const btnModeDemo = document.getElementById('btnModeDemo');
  const aiEngineStatus = document.getElementById('aiEngineStatus');

  // Confidence Threshold Slider (Section 6 & 13)
  const sliderConfidenceThreshold = document.getElementById('sliderConfidenceThreshold');
  const valConfidenceThreshold = document.getElementById('valConfidenceThreshold');

  // Inference Frame Preview (Section 11)
  const btnToggleInferenceFrame = document.getElementById('btnToggleInferenceFrame');
  const lblToggleInferenceFrame = document.getElementById('lblToggleInferenceFrame');
  const inferenceFrameContainer = document.getElementById('inferenceFrameContainer');
  const debugInferenceCanvas = document.getElementById('debugInferenceCanvas');
  const debugInferenceCtx = debugInferenceCanvas ? debugInferenceCanvas.getContext('2d') : null;
  let isInferenceFrameVisible = false;

  // AI Debug Telemetry Elements (Section 10)
  const dbgCameraStatus = document.getElementById('dbgCameraStatus');
  const dbgFramesCaptured = document.getElementById('dbgFramesCaptured');
  const dbgInferenceFps = document.getElementById('dbgInferenceFps');
  const dbgLatency = document.getElementById('dbgLatency');
  const dbgModelName = document.getElementById('dbgModelName');
  const dbgInputRes = document.getElementById('dbgInputRes');
  const dbgModeTag = document.getElementById('dbgModeTag');

  // Six-Hazard Interactive Triggers
  const btnTriggerPothole = document.getElementById('btnTriggerPothole');
  const btnTriggerPedDanger = document.getElementById('btnTriggerPedDanger');
  const btnTriggerPedNormal = document.getElementById('btnTriggerPedNormal');
  const btnTriggerWaterlogging = document.getElementById('btnTriggerWaterlogging');
  const btnTriggerMissingSign = document.getElementById('btnTriggerMissingSign');
  const btnTriggerDamagedSign = document.getElementById('btnTriggerDamagedSign');
  const btnTriggerGarbageSpill = document.getElementById('btnTriggerGarbageSpill');
  const btnClearDetections = document.getElementById('btnClearDetections');

  // Automated Six-Hazard Demo Controls
  const btnStartSihDemo = document.getElementById('btnStartSihDemo');
  const btnStopSihDemo = document.getElementById('btnStopSihDemo');
  const demoBanner = document.getElementById('demoBanner');
  const demoStepTitle = document.getElementById('demoStepTitle');
  const demoProgressBar = document.getElementById('demoProgressBar');
  const demoTimer = document.getElementById('demoTimer');

  // Action CTAs
  const btnDispatchTicket = document.getElementById('btnDispatchTicket');
  const btnViewEvidence = document.getElementById('btnViewEvidence');
  const btnAudioToggle = document.getElementById('btnAudioToggle');
  const btnMobileReportIncident = document.getElementById('btnMobileReportIncident');
  const btnMobileAlertV2x = document.getElementById('btnMobileAlertV2x');

  // Evidence Modal Elements
  const evidenceModal = document.getElementById('evidenceModal');
  const btnCloseEvidence = document.getElementById('btnCloseEvidence');
  const evidenceImage = document.getElementById('evidenceImage');
  const evidenceImagePlaceholder = document.getElementById('evidenceImagePlaceholder');
  const evidenceTicketId = document.getElementById('evidenceTicketId');
  const evidenceHazardClass = document.getElementById('evidenceHazardClass');
  const evidenceConfidence = document.getElementById('evidenceConfidence');
  const evidenceRiskScore = document.getElementById('evidenceRiskScore');
  const evidenceGps = document.getElementById('evidenceGps');
  const evidenceBusId = document.getElementById('evidenceBusId');

  // Telemetry HUD Elements
  const hudClock = document.getElementById('hudClock');
  const hudFps = document.getElementById('hudFps');
  const hudResolution = document.getElementById('hudResolution');
  const hudGps = document.getElementById('hudGps');
  const hudSpeed = document.getElementById('hudSpeed');
  const hudCameraStatus = document.getElementById('hudCameraStatus');
  const hudActiveThreat = document.getElementById('hudActiveThreat');
  const hudRiskScore = document.getElementById('hudRiskScore');
  const hudRiskBar = document.getElementById('hudRiskBar');
  const hudConfidence = document.getElementById('hudConfidence');
  const hudDistance = document.getElementById('hudDistance');
  const hudSeverityPill = document.getElementById('hudSeverityPill');
  const hudConsensusBadge = document.getElementById('hudConsensusBadge');

  // Six-Hazard Summary Panel Elements
  const statCountTotal = document.getElementById('statCountTotal');
  const statCountHigh = document.getElementById('statCountHigh');
  const statCountMed = document.getElementById('statCountMed');
  const statCountLow = document.getElementById('statCountLow');
  const sixHazardsList = document.getElementById('sixHazardsList');

  // V2X & Fleet Elements
  const v2xBroadcastStatus = document.getElementById('v2xBroadcastStatus');
  const v2xStatusText = document.getElementById('v2xStatusText');
  const v2xFleetList = document.getElementById('v2xFleetList');
  const consensusList = document.getElementById('consensusList');
  const incidentList = document.getElementById('incidentList');

  // Instantiate Camera
  const camera = new RoadGuardCamera(videoEl, canvasEl);
  window.roadGuardCamera = camera;

  // Initialize Geolocation (attempts real device GPS first)
  window.roadGuardGeo.init();

  // Active state
  let currentActiveDetection = null;
  let latestCapturedIncident = null;
  let sihDemoRunning = false;
  let sihDemoTimerId = null;
  let sihDemoStartTime = 0;
  const SIH_DEMO_TOTAL_SECONDS = 60;

  // Six Target Classes Definition for Summary Panel
  const TARGET_SIX_CLASSES = [
    { key: 'POTHOLE', icon: '🕳️', name: 'Pothole', defaultSev: 'HIGH' },
    { key: 'PEDESTRIAN_HAZARD', icon: '🚶', name: 'Pedestrian Hazard', defaultSev: 'CRITICAL' },
    { key: 'WATERLOGGING', icon: '🌊', name: 'Waterlogging', defaultSev: 'HIGH' },
    { key: 'MISSING_SIGN', icon: '🚦', name: 'Missing Sign (Expected Zone)', defaultSev: 'MEDIUM' },
    { key: 'DAMAGED_SIGN', icon: '🛑', name: 'Damaged Sign', defaultSev: 'MEDIUM' },
    { key: 'GARBAGE_SPILL', icon: '🗑️', name: 'Garbage Spill', defaultSev: 'MEDIUM' }
  ];

  // 1. Clock Update Loop
  setInterval(() => {
    const now = new Date();
    hudClock.textContent = now.toTimeString().split(' ')[0] + '.' + String(Math.floor(now.getMilliseconds() / 100));
  }, 100);

  // 2. Geolocation Listener
  window.roadGuardGeo.subscribe((coords) => {
    if (coords.status === 'REAL_GPS') {
      hudGps.textContent = `${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}`;
      btnGpsModeToggle.textContent = '📍 REAL GPS (Device)';
      btnGpsModeToggle.className = 'btn btn-secondary text-emerald-400 font-bold text-[11px] flex items-center justify-center';
    } else if (coords.status === 'DEMO_GPS') {
      hudGps.textContent = `${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)} [DEMO]`;
      btnGpsModeToggle.textContent = '📍 DEMO GPS (Chennai)';
      btnGpsModeToggle.className = 'btn btn-secondary text-amber-400 font-bold text-[11px] flex items-center justify-center';
    } else {
      hudGps.textContent = 'GPS UNAVAILABLE';
      btnGpsModeToggle.textContent = '📍 GPS Unavailable';
      btnGpsModeToggle.className = 'btn btn-secondary text-slate-400 text-[11px] flex items-center justify-center';
    }

    hudSpeed.textContent = `${coords.speed} km/h`;
    const locElem = document.getElementById('hudLocationName');
    if (locElem) {
      locElem.textContent = coords.locationName;
    }
  });

  // 3. Canvas Render Loop with Live Computer Vision Inference
  function renderLoop() {
    if (camera.active) {
      if (videoEl.videoWidth && canvasEl.width !== videoEl.videoWidth) {
        canvasEl.width = videoEl.videoWidth;
        canvasEl.height = videoEl.videoHeight;
        hudResolution.textContent = `${videoEl.videoWidth}x${videoEl.videoHeight}`;
      } else if (camera.isSynthesized && canvasEl.width !== 1280) {
        canvasEl.width = 1280;
        canvasEl.height = 720;
        hudResolution.textContent = '1280x720 (SYNTH)';
      }

      const currentFps = camera.tickFps();
      hudFps.textContent = `${currentFps} FPS`;

      // Live frame inference (REAL AI: Pavement Cavity CV + TensorFlow.js COCO-SSD)
      if (videoEl && videoEl.readyState >= 2) {
        window.roadGuardDetector.detectLive(videoEl, canvasEl.width, canvasEl.height);
      }

      // Render Detection overlays & real bounding boxes
      window.roadGuardDetector.render(ctx, canvasEl.width, canvasEl.height);

      // Render Debug Inference Frame if toggled (Section 11)
      if (isInferenceFrameVisible && debugInferenceCtx && window.roadGuardRealDetector) {
        const dbgCanvas = window.roadGuardRealDetector.getDebugCanvas();
        if (dbgCanvas) {
          debugInferenceCtx.drawImage(dbgCanvas, 0, 0, debugInferenceCanvas.width, debugInferenceCanvas.height);
        }
      }

      // Update AI Debug Telemetry (Section 10)
      updateDebugTelemetry();

    } else {
      ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);
      hudFps.textContent = '0 FPS';
    }

    requestAnimationFrame(renderLoop);
  }
  requestAnimationFrame(renderLoop);

  // 4. Update UI when Detections Change
  function setupDetectionHandler(detector) {
    detector.onDetection((event) => {
      updateSixHazardsSummaryPanel();

      if (event.type === 'CLEARED' || !event.detection) {
        currentActiveDetection = null;
        hudActiveThreat.textContent = 'CLEAR / NO HAZARDS';
        hudActiveThreat.className = 'font-bold text-emerald-400';
        hudRiskScore.textContent = '0';
        hudRiskBar.style.width = '0%';
        hudRiskBar.className = 'h-full bg-emerald-500 transition-all duration-300';
        hudConfidence.textContent = '--%';
        hudDistance.textContent = '--m';
        hudSeverityPill.textContent = 'MONITORING';
        hudSeverityPill.className = 'badge badge-slate';
        btnDispatchTicket.disabled = true;
        return;
      }

      const det = event.detection;
      currentActiveDetection = det;

      // Classification & Label
      hudActiveThreat.textContent = `${det.humanLabel || det.label}`;
      hudConfidence.textContent = `${(det.confidence * 100).toFixed(1)}%`;
      hudDistance.textContent = det.distanceMeters ? `${det.distanceMeters}m` : (det.dimensionsEstimate || '~15m');

      // Risk Prioritization Score (0 - 100)
      const risk = det.riskScore || 85;
      hudRiskScore.textContent = String(risk);
      hudRiskBar.style.width = `${risk}%`;

      if (risk >= 80) {
        hudRiskBar.className = 'h-full bg-red-500 transition-all duration-300';
        hudActiveThreat.className = 'font-bold text-red-400 text-sm animate-pulse';
      } else if (risk >= 50) {
        hudRiskBar.className = 'h-full bg-amber-500 transition-all duration-300';
        hudActiveThreat.className = 'font-bold text-amber-400 text-sm';
      } else {
        hudRiskBar.className = 'h-full bg-emerald-500 transition-all duration-300';
        hudActiveThreat.className = 'font-bold text-emerald-400 text-sm';
      }

      // Severity Badge
      const sev = det.severity || 'HIGH';
      hudSeverityPill.textContent = sev;
      if (sev === 'CRITICAL') {
        hudSeverityPill.className = 'badge badge-danger animate-pulse';
      } else if (sev === 'HIGH') {
        hudSeverityPill.className = 'badge badge-warning';
      } else {
        hudSeverityPill.className = 'badge badge-success';
      }

      // Enable dispatch button
      btnDispatchTicket.disabled = false;

      // Trigger Connected Vehicle Alert Broadcast
      window.roadGuardV2X.broadcastHazard(det);
    });
  }

  setupDetectionHandler(window.roadGuardRealDetector);
  setupDetectionHandler(window.roadGuardDemoDetector);

  // 5. Update AI Debug Panel Telemetry (Section 10)
  function updateDebugTelemetry() {
    if (!window.roadGuardDetector) return;
    const metrics = window.roadGuardDetector.getMetrics();

    if (dbgFramesCaptured) dbgFramesCaptured.textContent = metrics.framesCaptured.toLocaleString();
    if (dbgInferenceFps) dbgInferenceFps.textContent = `${metrics.inferenceFps} FPS`;
    if (dbgLatency) dbgLatency.textContent = `${metrics.measuredLatencyMs} ms`;
    if (dbgModelName) dbgModelName.textContent = metrics.modelName;
    if (dbgInputRes) dbgInputRes.textContent = metrics.inputResolution;

    if (dbgCameraStatus) {
      dbgCameraStatus.textContent = camera.active ? 'CONNECTED ✓' : 'OFFLINE';
      dbgCameraStatus.className = camera.active ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold';
    }

    if (dbgModeTag) {
      if (metrics.isSimulated) {
        dbgModeTag.textContent = 'SIMULATED AI';
        dbgModeTag.className = 'px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold';
      } else {
        dbgModeTag.textContent = 'REAL AI INFERENCE';
        dbgModeTag.className = 'px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold';
      }
    }
  }

  // 6. Six-Hazard Summary Panel Updater
  function updateSixHazardsSummaryPanel() {
    const activeList = window.roadGuardDetector.activeDetections || [];
    let countTotal = 0;
    let countHigh = 0;
    let countMed = 0;
    let countLow = 0;

    sixHazardsList.innerHTML = '';

    TARGET_SIX_CLASSES.forEach(item => {
      const activeMatch = activeList.find(d => d.classKey === item.key);

      const row = document.createElement('div');
      row.className = 'p-2 rounded-lg bg-slate-900 border flex items-center justify-between text-xs transition ' +
        (activeMatch ? 'border-sky-500/60 bg-sky-950/30' : 'border-slate-800/80 opacity-70');

      if (activeMatch) {
        countTotal++;
        const risk = activeMatch.riskScore || 75;
        if (risk >= 80) countHigh++;
        else if (risk >= 50) countMed++;
        else countLow++;

        row.innerHTML = `
          <div class="flex items-center space-x-2">
            <span class="text-sm">${item.icon}</span>
            <div>
              <div class="font-bold text-white">${item.name}</div>
              <div class="text-[10px] font-mono text-emerald-400">DETECTED • ${(activeMatch.confidence * 100).toFixed(1)}%</div>
            </div>
          </div>
          <div class="flex items-center space-x-1.5">
            <span class="badge ${activeMatch.severity === 'CRITICAL' ? 'badge-danger' : activeMatch.severity === 'HIGH' ? 'badge-warning' : 'badge-primary'} text-[10px]">
              ${activeMatch.severity}
            </span>
            <span class="text-[11px] font-mono font-bold ${risk >= 80 ? 'text-red-400' : 'text-amber-400'}">
              ${risk}/100
            </span>
          </div>
        `;
      } else {
        row.innerHTML = `
          <div class="flex items-center space-x-2">
            <span class="text-sm opacity-60">${item.icon}</span>
            <div>
              <div class="font-medium text-slate-300">${item.name}</div>
              <div class="text-[10px] font-mono text-slate-500">MONITORING CORRIDOR</div>
            </div>
          </div>
          <div class="text-[10px] font-mono text-slate-500">
            STANDBY
          </div>
        `;
      }

      sixHazardsList.appendChild(row);
    });

    statCountTotal.textContent = String(countTotal);
    statCountHigh.textContent = String(countHigh);
    statCountMed.textContent = String(countMed);
    statCountLow.textContent = String(countLow);
  }

  // 7. Confidence Threshold Slider Handler (Section 6 & 13)
  if (sliderConfidenceThreshold) {
    sliderConfidenceThreshold.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      valConfidenceThreshold.textContent = val.toFixed(2);
      if (window.roadGuardRealDetector) {
        window.roadGuardRealDetector.setConfidenceThreshold(val);
      }
      if (window.roadGuardDemoDetector) {
        window.roadGuardDemoDetector.setConfidenceThreshold(val);
      }
    });
  }

  // 8. Inference Frame Toggle (Section 11)
  if (btnToggleInferenceFrame) {
    btnToggleInferenceFrame.addEventListener('click', () => {
      isInferenceFrameVisible = !isInferenceFrameVisible;
      if (isInferenceFrameVisible) {
        inferenceFrameContainer.classList.remove('hidden');
        lblToggleInferenceFrame.textContent = 'Hide Inference Frame';
        if (window.roadGuardRealDetector) {
          window.roadGuardRealDetector.setShowInferenceFrame(true);
        }
      } else {
        inferenceFrameContainer.classList.add('hidden');
        lblToggleInferenceFrame.textContent = 'Show Inference Frame';
        if (window.roadGuardRealDetector) {
          window.roadGuardRealDetector.setShowInferenceFrame(false);
        }
      }
    });
  }

  // 9. AI Engine Mode Switcher (Section 18: Real vs Demo)
  function switchToRealMode() {
    window.roadGuardDetector = window.roadGuardRealDetector;
    btnModeRealTf.className = 'px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[11px] font-bold transition flex items-center gap-1 active shadow-sm';
    btnModeDemo.className = 'px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 text-[11px] font-medium transition';
    aiEngineStatus.textContent = 'REAL AI INFERENCE (Live Camera CV)';
    aiEngineStatus.className = 'text-[11px] text-emerald-400 font-mono font-bold';
    if (dbgModeTag) {
      dbgModeTag.textContent = 'REAL AI INFERENCE';
      dbgModeTag.className = 'px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold';
    }
    console.log('[App] Switched to REAL AI INFERENCE ENGINE.');
  }

  function switchToDemoMode() {
    window.roadGuardDetector = window.roadGuardDemoDetector;
    btnModeDemo.className = 'px-2.5 py-1 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[11px] font-bold transition flex items-center gap-1 active shadow-sm';
    btnModeRealTf.className = 'px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 text-[11px] font-medium transition';
    aiEngineStatus.textContent = 'DEMO / SIMULATED AI (SIH Presets)';
    aiEngineStatus.className = 'text-[11px] text-amber-400 font-mono font-bold';
    if (dbgModeTag) {
      dbgModeTag.textContent = 'DEMO / SIMULATION';
      dbgModeTag.className = 'px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold';
    }
    console.log('[App] Switched to DEMO / SIMULATED AI ENGINE.');
  }

  btnModeRealTf.addEventListener('click', switchToRealMode);
  btnModeDemo.addEventListener('click', switchToDemoMode);

  // 10. Connected Vehicle Alerts (C-V2X) Listener
  window.roadGuardV2X.onUpdate((data) => {
    if (data.isBroadcasting) {
      v2xBroadcastStatus.className = 'p-2 rounded bg-amber-500/20 border border-amber-500/40 text-xs flex items-center font-mono text-amber-300 animate-pulse';
      v2xStatusText.textContent = data.message || 'C-V2X BROADCASTING IN DIRECTION OF TRAVEL (350m)';
    } else {
      v2xBroadcastStatus.className = 'p-2 rounded bg-slate-900/80 border border-slate-800 text-xs flex items-center font-mono text-slate-400';
      v2xStatusText.textContent = 'V2X DSRC / C-V2X STANDBY';
    }

    // Render neighboring vehicles
    v2xFleetList.innerHTML = '';
    data.fleet.forEach(v => {
      const item = document.createElement('div');
      item.className = 'p-1.5 rounded bg-slate-900/70 border border-slate-800/80 flex items-center justify-between text-[11px] font-mono';
      item.innerHTML = `
        <div class="flex items-center space-x-2 truncate">
          <span class="${v.ack ? 'text-emerald-400 font-bold' : 'text-slate-500'}">●</span>
          <span class="text-slate-200 font-bold">${v.id}</span>
          <span class="text-slate-400 text-[10px]">(${v.type})</span>
        </div>
        <div class="flex items-center space-x-2 text-right">
          <span class="text-slate-400">${v.distance}m</span>
          <span class="text-[10px] px-1.5 py-0.5 rounded ${v.ack ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold' : 'bg-slate-800 text-slate-400'}">
            ${v.status}
          </span>
        </div>
      `;
      v2xFleetList.appendChild(item);
    });

    // Render consensus
    consensusList.innerHTML = '';
    data.consensus.fleetPasses.forEach(p => {
      const item = document.createElement('div');
      item.className = 'p-2 rounded bg-slate-900/80 border border-slate-800 text-xs font-mono flex items-center justify-between';
      item.innerHTML = `
        <div>
          <div class="font-bold text-sky-400">${p.busId}</div>
          <div class="text-[10px] text-slate-400">${p.route}</div>
        </div>
        <div class="text-right">
          <div class="text-emerald-400 font-bold">${p.conf}</div>
          <div class="text-[10px] text-slate-400">${p.time}</div>
        </div>
      `;
      consensusList.appendChild(item);
    });
  });

  // 11. Municipal Incidents Listener
  window.roadGuardIncidents.onUpdate((incidents) => {
    incidentList.innerHTML = '';
    incidents.forEach(inc => {
      const item = document.createElement('div');
      item.className = 'p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 text-xs space-y-1.5 transition hover:border-slate-700';

      item.innerHTML = `
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-1.5">
            <span class="font-mono font-bold text-sky-400">${inc.ticketId}</span>
            <span class="badge ${inc.severity === 'CRITICAL' ? 'badge-danger' : inc.severity === 'HIGH' ? 'badge-warning' : 'badge-primary'} text-[10px]">
              ${inc.humanLabel || inc.hazardType}
            </span>
          </div>
          <span class="text-[10px] font-mono text-emerald-400 font-bold">${inc.status}</span>
        </div>
        <div class="text-slate-300 text-[11px] truncate">${inc.location}</div>
        <div class="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-0.5 border-t border-slate-800/80">
          <span>${inc.agency || 'GCC Roads Div'}</span>
          <div class="flex items-center space-x-2">
            ${inc.evidenceSnapshot ? `<button data-ticket="${inc.ticketId}" class="btn-evidence-view text-sky-400 hover:text-sky-300 underline font-bold">View Evidence</button>` : ''}
            <span>${inc.verifiedCount || 3} Buses Verified</span>
          </div>
        </div>
      `;

      incidentList.appendChild(item);
    });

    document.querySelectorAll('.btn-evidence-view').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const ticketId = e.currentTarget.getAttribute('data-ticket');
        window.roadGuardIncidents.viewEvidence(ticketId);
      });
    });
  });

  // 12. Evidence Modal Handler
  window.roadGuardIncidents.onEvidenceView((inc) => {
    if (!inc) return;
    latestCapturedIncident = inc;

    evidenceTicketId.textContent = inc.ticketId;
    evidenceHazardClass.textContent = inc.humanLabel || inc.hazardType;
    evidenceConfidence.textContent = `${(inc.confidence * 100).toFixed(1)}%`;
    evidenceRiskScore.textContent = `${inc.riskScore || 87}/100`;
    evidenceGps.textContent = inc.coords ? `${inc.coords.lat.toFixed(4)}, ${inc.coords.lng.toFixed(4)}` : '13.0067, 80.2020';
    evidenceBusId.textContent = inc.vehicleId || 'BUS-104A';

    if (inc.evidenceSnapshot) {
      evidenceImage.src = inc.evidenceSnapshot;
      evidenceImage.classList.remove('hidden');
      evidenceImagePlaceholder.classList.add('hidden');
    } else {
      evidenceImage.src = '';
      evidenceImage.classList.add('hidden');
      evidenceImagePlaceholder.classList.remove('hidden');
    }

    evidenceModal.classList.remove('hidden');
  });

  btnCloseEvidence.addEventListener('click', () => {
    evidenceModal.classList.add('hidden');
  });

  btnViewEvidence.addEventListener('click', () => {
    if (latestCapturedIncident) {
      window.roadGuardIncidents.viewEvidence(latestCapturedIncident.ticketId);
    }
  });

  // 13. Dispatch Municipal Work Order CTA
  btnDispatchTicket.addEventListener('click', async () => {
    if (!currentActiveDetection) return;

    btnDispatchTicket.disabled = true;
    btnDispatchTicket.innerHTML = '<span>Dispatching Ticket...</span>';

    const inc = await window.roadGuardIncidents.createWorkOrder(
      currentActiveDetection,
      camera,
      window.roadGuardGeo
    );

    latestCapturedIncident = inc;
    btnViewEvidence.disabled = false;

    btnDispatchTicket.innerHTML = `<span>✓ Ticket Created (${inc.ticketId})</span>`;
    setTimeout(() => {
      btnDispatchTicket.innerHTML = `
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/></svg>
        <span>Dispatch Work Order</span>
      `;
      btnDispatchTicket.disabled = false;
    }, 2500);
  });

  // Mobile Actions
  btnMobileReportIncident.addEventListener('click', () => {
    btnDispatchTicket.click();
  });

  btnMobileAlertV2x.addEventListener('click', () => {
    if (currentActiveDetection) {
      window.roadGuardV2X.broadcastHazard(currentActiveDetection);
    } else {
      window.roadGuardDetector.triggerPothole();
    }
  });

  // 14. Camera Controls
  btnStartCamera.addEventListener('click', () => {
    if (camera.active) {
      camera.stopCamera();
      btnStartCamera.innerHTML = `
        <svg class="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
        Start Camera
      `;
      hudCameraStatus.className = 'w-1.5 h-1.5 rounded-full bg-rose-500';
    } else {
      camera.startCamera(camera.facingMode);
      btnStartCamera.innerHTML = `
        <svg class="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
        Stop Camera
      `;
      hudCameraStatus.className = 'w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse';
    }
  });

  btnFlipCamera.addEventListener('click', () => {
    camera.switchCamera();
  });

  btnToggleDangerZone.addEventListener('click', () => {
    const isShown = window.roadGuardDetector.toggleDangerZone();
    btnToggleDangerZone.className = isShown
      ? 'btn btn-secondary active flex items-center justify-center'
      : 'btn btn-secondary flex items-center justify-center text-slate-400';
  });

  btnGpsModeToggle.addEventListener('click', () => {
    window.roadGuardGeo.toggleGpsMode();
  });

  // Manual Hazard Triggers (switches to Demo engine when clicked so judge can test specific presets)
  btnTriggerPothole.addEventListener('click', () => {
    switchToDemoMode();
    window.roadGuardDemoDetector.triggerPothole();
  });
  btnTriggerPedDanger.addEventListener('click', () => {
    switchToDemoMode();
    window.roadGuardDemoDetector.triggerPedestrianDanger();
  });
  btnTriggerPedNormal.addEventListener('click', () => {
    switchToDemoMode();
    window.roadGuardDemoDetector.triggerPedestrianNormal();
  });
  btnTriggerWaterlogging.addEventListener('click', () => {
    switchToDemoMode();
    window.roadGuardDemoDetector.triggerWaterlogging();
  });
  btnTriggerMissingSign.addEventListener('click', () => {
    switchToDemoMode();
    window.roadGuardDemoDetector.triggerMissingSign();
  });
  btnTriggerDamagedSign.addEventListener('click', () => {
    switchToDemoMode();
    window.roadGuardDemoDetector.triggerDamagedSign();
  });
  btnTriggerGarbageSpill.addEventListener('click', () => {
    switchToDemoMode();
    window.roadGuardDemoDetector.triggerGarbageSpill();
  });
  btnClearDetections.addEventListener('click', () => {
    if (window.roadGuardRealDetector) window.roadGuardRealDetector.clearDetections();
    if (window.roadGuardDemoDetector) window.roadGuardDemoDetector.clearDetections();
  });

  // Audio Toggle
  btnAudioToggle.addEventListener('click', () => {
    const isAudioOn = window.roadGuardAudio.toggleSound();
    btnAudioToggle.textContent = isAudioOn ? '🔊 Audio Alerts: ON' : '🔇 Audio Alerts: MUTED';
    btnAudioToggle.className = isAudioOn ? 'btn btn-secondary text-[10px] px-2 py-0.5' : 'btn btn-secondary text-[10px] px-2 py-0.5 text-slate-500';
  });

  // Mobile Guide Modal
  btnMobileGuide.addEventListener('click', () => {
    mobileGuideModal.classList.remove('hidden');
  });
  btnCloseGuide.addEventListener('click', () => {
    mobileGuideModal.classList.add('hidden');
  });
  btnCloseGuideBtn.addEventListener('click', () => {
    mobileGuideModal.classList.add('hidden');
  });

  // =========================================================================
  // 15. AUTOMATED SIX-HAZARD DEMO RUNNER (Section 19 & 23)
  // =========================================================================
  const DEMO_SIX_STEPS = [
    {
      timeSec: 0,
      title: 'Class 1/6: Pothole Detection (94.8% Confidence, High Risk 87/100)',
      action: () => {
        window.roadGuardDetector = window.roadGuardDemoDetector;
        window.roadGuardDemoDetector.triggerPothole();
        btnDispatchTicket.click();
      }
    },
    {
      timeSec: 10,
      title: 'Class 2/6: Pedestrian Hazard (VRU in Road Danger Zone, Critical Risk 94/100)',
      action: () => {
        window.roadGuardDetector = window.roadGuardDemoDetector;
        window.roadGuardDemoDetector.triggerPedestrianDanger();
        btnDispatchTicket.click();
      }
    },
    {
      timeSec: 20,
      title: 'Class 3/6: Waterlogging Accumulation (~38m² Surface Water, High Risk 82/100)',
      action: () => {
        window.roadGuardDetector = window.roadGuardDemoDetector;
        window.roadGuardDemoDetector.triggerWaterlogging();
        btnDispatchTicket.click();
      }
    },
    {
      timeSec: 30,
      title: 'Class 4/6: Missing Sign in Expected GIS Zone (88.4% Confidence, Medium Risk 64/100)',
      action: () => {
        window.roadGuardDetector = window.roadGuardDemoDetector;
        window.roadGuardDemoDetector.triggerMissingSign();
        btnDispatchTicket.click();
      }
    },
    {
      timeSec: 40,
      title: 'Class 5/6: Damaged / Bent Regulatory Sign (93.2% Confidence, Medium Risk 71/100)',
      action: () => {
        window.roadGuardDetector = window.roadGuardDemoDetector;
        window.roadGuardDemoDetector.triggerDamagedSign();
        btnDispatchTicket.click();
      }
    },
    {
      timeSec: 50,
      title: 'Class 6/6: Garbage Spill Encroaching Carriage-Way (91.7% Confidence, Medium Risk 68/100)',
      action: () => {
        window.roadGuardDetector = window.roadGuardDemoDetector;
        window.roadGuardDemoDetector.triggerGarbageSpill();
        btnDispatchTicket.click();
      }
    }
  ];

  function startSixHazardDemo() {
    if (sihDemoRunning) return;
    sihDemoRunning = true;
    sihDemoStartTime = performance.now();

    btnStartSihDemo.classList.add('hidden');
    btnStopSihDemo.classList.remove('hidden');
    demoBanner.classList.remove('hidden');

    if (!camera.active) {
      camera.startCamera();
    }

    let currentStepIndex = -1;

    sihDemoTimerId = setInterval(() => {
      const elapsedSeconds = Math.floor((performance.now() - sihDemoStartTime) / 1000);
      demoProgressBar.style.width = `${Math.min(100, (elapsedSeconds / SIH_DEMO_TOTAL_SECONDS) * 100)}%`;
      demoTimer.textContent = `${elapsedSeconds}s / ${SIH_DEMO_TOTAL_SECONDS}s`;

      const stepIndex = DEMO_SIX_STEPS.slice().reverse().findIndex(s => elapsedSeconds >= s.timeSec);
      const activeIdx = stepIndex !== -1 ? (DEMO_SIX_STEPS.length - 1 - stepIndex) : 0;

      if (activeIdx !== currentStepIndex && activeIdx < DEMO_SIX_STEPS.length) {
        currentStepIndex = activeIdx;
        const currentStep = DEMO_SIX_STEPS[currentStepIndex];
        demoStepTitle.textContent = currentStep.title;
        currentStep.action();
      }

      if (elapsedSeconds >= SIH_DEMO_TOTAL_SECONDS) {
        demoStepTitle.textContent = '✓ Completed Six-Hazard Demonstration (All classes verified & tickets created!)';
        setTimeout(() => stopSixHazardDemo(), 5000);
      }
    }, 500);
  }

  function stopSixHazardDemo() {
    if (!sihDemoRunning) return;
    sihDemoRunning = false;
    clearInterval(sihDemoTimerId);
    sihDemoTimerId = null;

    btnStartSihDemo.classList.remove('hidden');
    btnStopSihDemo.classList.add('hidden');
    demoBanner.classList.add('hidden');
  }

  btnStartSihDemo.addEventListener('click', startSixHazardDemo);
  btnStopSihDemo.addEventListener('click', stopSixHazardDemo);

  // Initialize UI tables
  window.roadGuardV2X.notify();
  window.roadGuardIncidents.notify();
  updateSixHazardsSummaryPanel();

  // Auto-start camera on load (laptop webcam or phone rear camera)
  camera.startCamera('environment').then(success => {
    if (!success) {
      console.log('[App] Camera hardware permission required user click; fallback available.');
    }
  });
});
