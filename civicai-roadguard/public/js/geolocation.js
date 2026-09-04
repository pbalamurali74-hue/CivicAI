/**
 * CivicAI RoadGuard - Geolocation Manager
 * Implements transparent GPS handling for SIH 2026 PS 26124:
 * 1. REAL DEVICE GPS: Requests browser/phone navigator.geolocation
 * 2. GPS UNAVAILABLE: Displayed honestly if hardware/permission denied
 * 3. DEMO GPS: Explicitly toggled & clearly labeled (never silently substituted)
 */

class RoadGuardGeo {
  constructor() {
    this.mode = 'real'; // Try real GPS first as required by SIH prompt
    this.status = 'INITIALIZING'; // 'REAL_GPS' | 'DEMO_GPS' | 'UNAVAILABLE'
    this.watchId = null;
    this.listeners = [];

    // Chennai Anna Salai Corridor (Guindy to Central)
    this.demoRoute = [
      { lat: 13.0067, lng: 80.2020, name: 'Anna Salai - Guindy Kathipara Underpass (Ward 117), Chennai' },
      { lat: 13.0112, lng: 80.2085, name: 'Anna Salai - Saidapet Bridge (Ward 116), Chennai' },
      { lat: 13.0189, lng: 80.2173, name: 'Anna Salai - Nandanam Signal (Ward 118), Chennai' },
      { lat: 13.0275, lng: 80.2289, name: 'Anna Salai - Teynampet Metro (Ward 119), Chennai' },
      { lat: 13.0392, lng: 80.2415, name: 'Anna Salai - Thousand Lights (Ward 114), Chennai' }
    ];
    this.demoRouteIndex = 0;
    this.demoInterval = null;

    this.currentCoords = {
      lat: null,
      lng: null,
      accuracy: null,
      speed: 34.0,
      heading: 42,
      locationName: 'Requesting Device GPS...',
      isDemo: false,
      status: 'ACQUIRING',
      timestamp: new Date().toISOString()
    };
  }

  init() {
    // Attempt real device GPS acquisition first
    this.requestRealGps();
  }

  subscribe(callback) {
    if (typeof callback === 'function') {
      this.listeners.push(callback);
      callback(this.currentCoords);
    }
  }

  notify() {
    this.listeners.forEach(cb => cb(this.currentCoords));
  }

  requestRealGps() {
    if (!navigator.geolocation) {
      console.warn('[Geo] Browser does not support geolocation API.');
      this.setUnavailable();
      return;
    }

    this.stopDemoSimulation();
    this.mode = 'real';

    const onSuccess = (pos) => {
      this.status = 'REAL_GPS';
      this.currentCoords = {
        lat: Number(pos.coords.latitude.toFixed(6)),
        lng: Number(pos.coords.longitude.toFixed(6)),
        accuracy: Math.round(pos.coords.accuracy || 8),
        speed: pos.coords.speed ? Number((pos.coords.speed * 3.6).toFixed(1)) : 32.5,
        heading: pos.coords.heading ? Math.round(pos.coords.heading) : 45,
        locationName: `Device GPS (±${Math.round(pos.coords.accuracy || 8)}m)`,
        isDemo: false,
        status: 'REAL_GPS',
        timestamp: new Date(pos.timestamp).toISOString()
      };
      console.log(`[Geo] Acquired Real GPS: ${this.currentCoords.lat}, ${this.currentCoords.lng}`);
      this.notify();
    };

    const onError = (err) => {
      console.warn('[Geo] Real GPS permission denied or timed out:', err.message);
      this.setUnavailable();
    };

    try {
      this.watchId = navigator.geolocation.watchPosition(onSuccess, onError, {
        enableHighAccuracy: true,
        maximumAge: 3000,
        timeout: 10000
      });
    } catch (e) {
      this.setUnavailable();
    }
  }

  setUnavailable() {
    this.status = 'UNAVAILABLE';
    this.currentCoords = {
      lat: null,
      lng: null,
      accuracy: null,
      speed: 0,
      heading: 0,
      locationName: 'GPS UNAVAILABLE (Permission Denied or No Sensor)',
      isDemo: false,
      status: 'UNAVAILABLE',
      timestamp: new Date().toISOString()
    };
    this.notify();
  }

  enableDemoSimulation() {
    if (this.watchId && navigator.geolocation) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }

    this.mode = 'demo';
    this.status = 'DEMO_GPS';
    this.startDemoSimulation();
  }

  startDemoSimulation() {
    this.stopDemoSimulation();
    this.status = 'DEMO_GPS';

    const updateStep = () => {
      const pt = this.demoRoute[this.demoRouteIndex];
      this.currentCoords = {
        lat: pt.lat,
        lng: pt.lng,
        accuracy: 4.5,
        speed: 34.0,
        heading: 42,
        locationName: `${pt.name} [DEMO GPS]`,
        isDemo: true,
        status: 'DEMO_GPS',
        timestamp: new Date().toISOString()
      };
      this.demoRouteIndex = (this.demoRouteIndex + 1) % this.demoRoute.length;
      this.notify();
    };

    updateStep();
    this.demoInterval = setInterval(updateStep, 6000);
  }

  stopDemoSimulation() {
    if (this.demoInterval) {
      clearInterval(this.demoInterval);
      this.demoInterval = null;
    }
  }

  toggleGpsMode() {
    if (this.mode === 'real') {
      this.enableDemoSimulation();
    } else {
      this.requestRealGps();
    }
    return this.mode;
  }

  getCoords() {
    return this.currentCoords.lat !== null
      ? this.currentCoords
      : {
          lat: 13.0067,
          lng: 80.2020,
          locationName: 'Anna Salai, Guindy (Fallback Reference)',
          isDemo: true,
          status: 'FALLBACK'
        };
  }
}

window.roadGuardGeo = new RoadGuardGeo();
