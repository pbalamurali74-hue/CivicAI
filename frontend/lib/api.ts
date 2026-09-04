const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

export async function fetchJson(endpoint: string, options: RequestInit = {}) {
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: "Network request failed" }));
      throw new Error(err.detail || "API request failed");
    }
    return await res.json();
  } catch (error: any) {
    console.error(`API Error on ${endpoint}:`, error);
    throw error;
  }
}

// 1. OFFICER VERIFICATION
export async function verifyOfficer(officerId: string) {
  return fetchJson(`/officers/${encodeURIComponent(officerId)}/verify`);
}

export async function submitOfficerRating(officerId: string, ratingData: any) {
  return fetchJson(`/officers/${encodeURIComponent(officerId)}/rating`, {
    method: "POST",
    body: JSON.stringify(ratingData),
  });
}

// 2. GOVERNMENT OFFICES
export async function getOffices(category?: string, pincode?: string, search?: string) {
  const params = new URLSearchParams();
  if (category) params.append("category", category);
  if (pincode) params.append("pincode", pincode);
  if (search) params.append("search", search);
  return fetchJson(`/offices?${params.toString()}`);
}

export async function getNearbyOffices(lat = 13.0315, lng = 80.1812, category = "All") {
  return fetchJson(`/offices/nearby?lat=${lat}&lng=${lng}&category=${category}`);
}

// 3. SMART MOBILITY & ROUTE PLANNER
export async function planRoute(origin: string, destination: string, passengers = 1, preference = "BALANCED") {
  return fetchJson(`/routes/plan`, {
    method: "POST",
    body: JSON.stringify({ origin, destination, passengers, preference }),
  });
}

export async function planTripWithGemini(prompt: string, origin: string, destination: string, passengers = 1, preference = "BALANCED") {
  return fetchJson(`/routes/ai-plan`, {
    method: "POST",
    body: JSON.stringify({ prompt, origin, destination, passengers, preference }),
  });
}

export async function manageTripWithGemini(title: string, origin: string, stops: string[], budgetInr = 500, passengers = 1, notes = "") {
  return fetchJson(`/routes/trip-manager`, {
    method: "POST",
    body: JSON.stringify({ title, origin, stops, budget_inr: budgetInr, passengers, notes }),
  });
}

export async function getAiRouteRecommendations() {
  return fetchJson(`/routes/recommendations`);
}

// 4. TRANSIT & LIVE BUSES
export async function getLiveBuses() {
  return fetchJson(`/buses/live`);
}

export async function getBusRoutes() {
  return fetchJson(`/buses/routes`);
}

// 5. DEMAND & SCHEDULING
export async function predictDemand(routeId: string, hour = 9, trafficLevel = "Heavy") {
  return fetchJson(`/demand/predict`, {
    method: "POST",
    body: JSON.stringify({ route_id: routeId, hour, traffic_level: trafficLevel }),
  });
}

export async function optimizeSchedule() {
  return fetchJson(`/scheduling/optimize`, {
    method: "POST",
  });
}

export async function approveScheduleChange(routeId: string, newFreq: number) {
  return fetchJson(`/scheduling/approve/${routeId}?new_frequency_mins=${newFreq}`, {
    method: "POST",
  });
}

// 6. GRIEVANCES
export async function submitGrievance(data: any) {
  return fetchJson(`/grievances`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getGrievances() {
  return fetchJson(`/grievances`);
}

// 7. ADMIN METRICS
export async function getAdminMetrics() {
  return fetchJson(`/admin/metrics`);
}

export async function getSuspiciousRatings() {
  return fetchJson(`/admin/suspicious-ratings`);
}

// 8. SIH PS 26124 MOBILE FLEET URBAN SENSING
export async function getSensingFleet() {
  return fetchJson(`/sensing/fleet`);
}

export async function getSensingDetections() {
  return fetchJson(`/sensing/detections`);
}

export async function getSensingTrafficIntelligence() {
  return fetchJson(`/sensing/traffic-intelligence`);
}

export async function getOfficeProcedureAi(query: string, officeCategory: string = "General") {
  return fetchJson(`/offices/procedure-query`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, office_category: officeCategory })
  });
}

export async function predictTnBus(routeCode: string, hour: number, dayOfWeek: number, weather: string, trafficDensity: number) {
  return fetchJson(`/buses/predict-tn-bus`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      route_code: routeCode,
      hour_of_day: hour,
      day_of_week: dayOfWeek,
      weather_condition: weather,
      traffic_density_index: trafficDensity
    })
  });
}

export async function verifyTicketProof(ticketNumber: string, routeCode: string, timestamp: string, fareInr: number, passengerCount: number, boardedStop: string) {
  return fetchJson(`/buses/verify-ticket-proof`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ticket_number: ticketNumber,
      route_code: routeCode,
      timestamp: timestamp,
      fare_inr: fareInr,
      passenger_count: passengerCount,
      boarded_stop: boardedStop
    })
  });
}

// 9. COMPLETE MACHINE LEARNING ANALYTICS & PREDICTION ENGINE
export async function getMLBusDelayReport() {
  return fetchJson(`/ml/bus-delay/train-report`);
}

export async function predictMLBusDelay(payload: {
  route_code: string;
  hour_of_day: number;
  day_of_week: number;
  weather_condition: string;
  traffic_density_index: number;
  passenger_occupancy_percent: number;
  distance_km?: number;
  is_peak_hour?: number;
  model_name?: string;
}) {
  return fetchJson(`/ml/bus-delay/predict`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export async function retrainMLBusDelay() {
  return fetchJson(`/ml/bus-delay/retrain`, {
    method: "POST",
  });
}

export async function getMLRatingAbuseReport() {
  return fetchJson(`/ml/rating-abuse/train-report`);
}

export async function predictMLRatingAbuse(payload: {
  rating_value: number;
  professionalism: number;
  behavior: number;
  transparency: number;
  service_quality: number;
  ip_freq?: number;
  comment?: string;
}) {
  return fetchJson(`/ml/rating-abuse/predict`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

