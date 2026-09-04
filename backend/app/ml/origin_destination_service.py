import math
import time
import numpy as np
from typing import Dict, Any, List, Optional

class OriginDestinationService:
    """
    SIH 2026 PS 26124: Centralized Transit Origin-Destination (OD) Matrix Analysis,
    Passenger Boarding Gravity Model, and Route Segment Delay Predictor.
    """
    _instance = None

    METRO_ZONES = [
        {"id": "ZONE-TAMBARAM", "name": "Tambaram Gateway", "lat": 12.9249, "lng": 80.1000, "demand_weight": 85},
        {"id": "ZONE-CHROMPET", "name": "Chromepet Commercial", "lat": 12.9516, "lng": 80.1462, "demand_weight": 70},
        {"id": "ZONE-AIRPORT", "name": "Meenambakkam Airport", "lat": 12.9941, "lng": 80.1709, "demand_weight": 92},
        {"id": "ZONE-GUINDY", "name": "Guindy Kathipara Junction", "lat": 13.0067, "lng": 80.2025, "demand_weight": 100},
        {"id": "ZONE-SAIDAPET", "name": "Saidapet Anna Salai", "lat": 13.0210, "lng": 80.2240, "demand_weight": 78},
        {"id": "ZONE-TNAGAR", "name": "T. Nagar Shopping Hub", "lat": 13.0418, "lng": 80.2341, "demand_weight": 95},
        {"id": "ZONE-KOYAMBEDU", "name": "Koyambedu CMBT Terminal", "lat": 13.0694, "lng": 80.1948, "demand_weight": 98},
        {"id": "ZONE-CENTRAL", "name": "Chennai Central Railway", "lat": 13.0827, "lng": 80.2707, "demand_weight": 99}
    ]

    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    def __init__(self):
        # Generate baseline symmetric gravity interaction matrix
        self.od_matrix = self._compute_gravity_od_matrix()

    def _compute_gravity_od_matrix(self) -> List[Dict[str, Any]]:
        """
        Gravity interaction model: Flow(i, j) = G * (M_i * M_j) / (d_ij ^ gamma)
        Where M_i, M_j are commercial trip attraction weights and d_ij is transit distance.
        """
        flows = []
        for orig in self.METRO_ZONES:
            for dest in self.METRO_ZONES:
                if orig["id"] == dest["id"]:
                    continue
                d_lat = orig["lat"] - dest["lat"]
                d_lng = orig["lng"] - dest["lng"]
                dist_km = max(1.5, math.sqrt(d_lat**2 + d_lng**2) * 111.0)
                
                # Gravity interaction
                flow_intensity = int((orig["demand_weight"] * dest["demand_weight"]) / (dist_km ** 1.4) * 1.8)
                delay_index = round(min(28.0, dist_km * 0.9 + (flow_intensity / 80.0)), 1)

                flows.append({
                    "origin_id": orig["id"],
                    "origin_name": orig["name"],
                    "destination_id": dest["id"],
                    "destination_name": dest["name"],
                    "distance_km": round(dist_km, 1),
                    "daily_transit_trips": flow_intensity,
                    "peak_hour_delay_mins": delay_index,
                    "congestion_factor": "SEVERE" if delay_index > 18 else ("MODERATE" if delay_index > 8 else "LOW"),
                    "recommended_fleet_headway_mins": max(4, min(20, int(35.0 / max(1.0, flow_intensity / 30.0))))
                })
        return flows

    def get_corridor_insights(self) -> Dict[str, Any]:
        """Provides high-level origin-destination insights and bottleneck mitigation strategies."""
        top_congested = sorted(self.od_matrix, key=lambda x: x["daily_transit_trips"], reverse=True)[:5]
        return {
            "status": "SUCCESS",
            "total_od_pairs": len(self.od_matrix),
            "top_demand_corridors": top_congested,
            "system_transit_efficiency": "78.4%",
            "suggested_actions": [
                "Deploy 4 additional electric feeder buses on Tambaram ➔ Guindy peak window (08:30 - 10:30)",
                "Activate Dedicated Bus Lane enforcement along Saidapet Anna Salai corridor",
                "Adjust traffic signal green-phase split at Guindy Kathipara Junction by +12 seconds for transit queue"
            ]
        }

origin_destination_service = OriginDestinationService.get_instance()
