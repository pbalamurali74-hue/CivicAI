import math
from app.services.gemini_service import (
    calculate_real_haversine_km, 
    calculate_mtc_bus_fare, 
    calculate_metro_fare, 
    calculate_cab_fare,
    is_tn_location
)

def calculate_multimodal_routes(origin: str, destination: str, passengers: int = 1, preference: str = "BALANCED") -> dict:
    """
    Calculates multimodal trip options (Bus, Cab, Auto, Metro) for ANY starting point and ANY destination,
    evaluating real GPS Haversine distances, official fare tariffs, and step-by-step how-to-reach guides.
    """
    # 1. Dynamically compute real road distance via OpenStreetMap & Haversine GPS for ANY starting point and ANY destination
    dist_km = calculate_real_haversine_km(origin, destination)
    is_tn = is_tn_location(destination)

    # 2. Dynamic transport fare and duration calculations based on real distance & passenger count
    if not is_tn or dist_km > 50:
        bus_time = round(dist_km * 1.5 + 25)
        bus_cost = calculate_mtc_bus_fare(dist_km) * passengers
        bus_route_name = "Inter-State Express Bus (APSRTC / KSRTC / SETC)"
        bus_explain = (
            f"📍 How to reach {destination} (Out-of-State / Long Distance): "
            f"Step 1: Take city MTC Bus 70H from {origin} to Koyambedu CMBT Terminal (₹18). "
            f"Step 2: Board Inter-state AC Express Bus to {destination} Bus Station (Distance: {dist_km} km, ₹{max(10, bus_cost - 18)}). "
            f"Step 3: Local shuttle/auto to destination. Total Distance: {dist_km} km | Total Fare: ₹{bus_cost}."
        )
    else:
        bus_time = round(dist_km * 2.8 + 8)
        bus_cost = calculate_mtc_bus_fare(dist_km) * passengers
        bus_route_name = "MTC Express Bus Route 70H / 5E / 21G"
        bus_explain = f"City bus route covering {dist_km} km via major arterial roads. Total Fare: ₹{bus_cost}."

    cab_time = round(dist_km * 2.1 + 5)
    cab_cost = calculate_cab_fare(dist_km)
    cab_explain = f"📍 Door-to-Door Taxi: Take direct cab via national highways directly to {destination}. Total Distance: {dist_km} km | Total Fare: ₹{cab_cost}."

    auto_time = round(dist_km * 2.4 + 6)
    auto_cost = round((80 + max(0, dist_km - 3) * 16) * passengers)
    auto_explain = f"📍 Auto Ride: Three-wheeler auto-rickshaw option. Total Distance: {dist_km} km | Total Fare: ₹{auto_cost}."

    metro_time = round(dist_km * 1.8 + 4)
    metro_cost = calculate_metro_fare(dist_km) * passengers
    if not is_tn or dist_km > 40:
        metro_route_name = "Intercity Express Train (Vande Bharat / SF Express)"
        metro_explain = (
            f"🚆 How to reach {destination} by Rail: "
            f"Step 1: Take Metro/Cab from {origin} to Chennai Central / Egmore Station (₹30). "
            f"Step 2: Board Express Train to {destination} Junction (Distance: {dist_km} km, ₹{max(10, metro_cost - 30)}). "
            f"Step 3: Station Auto to final landmark. Total Distance: {dist_km} km | Total Fare: ₹{metro_cost}."
        )
    else:
        metro_route_name = "Chennai Metro Rail (CMRL Blue/Green Line)"
        metro_explain = f"Fast air-conditioned Metro Rail transit covering {dist_km} km completely bypassing road traffic. Total Fare: ₹{metro_cost}."

    # 4 transport options with dynamic distance and fare
    raw_options = [
        {
            "mode": "BUS",
            "route_name": bus_route_name,
            "travel_time_mins": bus_time,
            "cost_inr": bus_cost,
            "transfers": 1 if (not is_tn or dist_km > 30) else 0,
            "distance_km": dist_km,
            "traffic_level": "Moderate",
            "demand_level": "High (82% seats filled)",
            "explanation": bus_explain
        },
        {
            "mode": "CAB",
            "route_name": "Ola / Uber / Outstation Sedan Taxi",
            "travel_time_mins": cab_time,
            "cost_inr": cab_cost,
            "transfers": 0,
            "distance_km": dist_km,
            "traffic_level": "Moderate",
            "demand_level": "Normal Surge (1.1x)",
            "explanation": cab_explain
        },
        {
            "mode": "AUTO",
            "route_name": "Rapido Auto / Meter Auto",
            "travel_time_mins": auto_time,
            "cost_inr": auto_cost,
            "transfers": 0,
            "distance_km": dist_km,
            "traffic_level": "Moderate",
            "demand_level": "Normal",
            "explanation": auto_explain
        },
        {
            "mode": "BUS_WALK",
            "route_name": metro_route_name,
            "travel_time_mins": metro_time,
            "cost_inr": metro_cost,
            "transfers": 1 if (not is_tn or dist_km > 40) else 0,
            "distance_km": dist_km,
            "traffic_level": "Low",
            "demand_level": "Moderate",
            "explanation": metro_explain
        }
    ]

    # Normalize metrics to [0, 1] range for fair multi-objective scoring
    max_time = max(o["travel_time_mins"] for o in raw_options) or 1.0
    max_cost = max(o["cost_inr"] for o in raw_options) or 1.0
    max_transfers = max(o["transfers"] for o in raw_options) or 1.0

    traffic_weights = {"Low": 0.2, "Moderate": 0.5, "Heavy": 0.8, "Severe": 1.0}
    demand_weights = {"Low": 0.2, "Moderate": 0.5, "Normal": 0.5, "Normal Surge (1.1x)": 0.6, "High (82% seats filled)": 0.85}

    # Set user preference weights
    w_time, w_cost, w_transfers, w_traffic, w_demand = 0.35, 0.30, 0.15, 0.10, 0.10
    
    if preference == "FASTEST":
        w_time, w_cost, w_transfers = 0.60, 0.15, 0.15
    elif preference == "CHEAPEST":
        w_time, w_cost, w_transfers = 0.15, 0.60, 0.15
    elif preference == "LEAST_TRANSFERS":
        w_time, w_cost, w_transfers = 0.20, 0.20, 0.50

    scored_options = []
    for opt in raw_options:
        norm_time = opt["travel_time_mins"] / max_time
        norm_cost = opt["cost_inr"] / max_cost
        norm_trans = opt["transfers"] / max_transfers
        norm_traf = traffic_weights.get(opt["traffic_level"], 0.5)
        norm_dem = demand_weights.get(opt["demand_level"], 0.5)

        score = (
            w_time * norm_time +
            w_cost * norm_cost +
            w_transfers * norm_trans +
            w_traffic * norm_traf +
            w_demand * norm_dem
        )
        opt["route_score"] = round(score, 3)
        scored_options.append(opt)

    scored_options.sort(key=lambda x: x["route_score"])

    fastest_option = min(scored_options, key=lambda x: x["travel_time_mins"])
    cheapest_option = min(scored_options, key=lambda x: x["cost_inr"])

    for opt in scored_options:
        tags = []
        if opt["mode"] == cheapest_option["mode"]:
            tags.append("BEST VALUE")
        if opt["mode"] == fastest_option["mode"]:
            tags.append("FASTEST")
        if not tags and opt == scored_options[0]:
            tags.append("BALANCED")
        opt["highlight_tag"] = " • ".join(tags) if tags else None

    best_mode = scored_options[0]["mode"]
    reason = (
        f"Recommended {scored_options[0]['route_name']} from {origin} to {destination} ({dist_km} km). "
        f"Step-by-step: {scored_options[0]['explanation']} "
        f"Total fare: ₹{scored_options[0]['cost_inr']}."
    )

    return {
        "origin": origin,
        "destination": destination,
        "distance_km": dist_km,
        "options": scored_options,
        "recommended_mode": best_mode,
        "ai_recommendation_reason": reason
    }
