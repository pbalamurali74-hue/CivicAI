"""
CivicAI Multi-Bus Spatial-Temporal Consensus & Corroboration Engine
SIH 2026 PS 26124: AI-Powered Mobile Urban Intelligence Platform Using Public Transport Fleet

Mathematical Formulation:
1. Spatial Proximity: Haversine distance d(p_1, p_2) <= 15.0 meters
2. Temporal Window: |t_1 - t_2| <= 1800 seconds (30 minutes)
3. Same Hazard Class: c_1 == c_2
4. Bayesian Confidence Escalation:
   C_fused = 1.0 - PROD_{i=1}^N (1.0 - c_i)
5. Corroboration States:
   - N == 1: SINGLE_BUS_UNVERIFIED
   - N == 2: MULTI_BUS_CORROBORATED
   - N >= 3: MUNICIPAL_PRIORITY_CONSENSUS
"""

import math
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional

def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculates ground distance in meters between two GPS coordinates using Haversine formula."""
    R = 6371000.0  # Earth radius in meters
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)
    a = (math.sin(delta_phi / 2.0) ** 2 +
         math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2.0) ** 2)
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return R * c

class MultiBusConsensusEngine:
    """
    Corroborates hazard detections across independent mobile transit units (buses).
    Eliminates false alarms and prioritizes genuine municipal infrastructure failures.
    """
    SPATIAL_THRESHOLD_METERS = 15.0
    TEMPORAL_WINDOW_SECONDS = 1800.0  # 30 minutes

    def __init__(self):
        # In-memory registry of hazard observations
        self.observations: List[Dict[str, Any]] = []

    def clear(self):
        self.observations.clear()

    def add_observation(self, observation: Dict[str, Any]) -> Dict[str, Any]:
        """
        Adds a single bus hazard observation and evaluates consensus clusters.
        """
        ts = observation.get("timestamp")
        if isinstance(ts, str):
            try:
                dt = datetime.fromisoformat(ts.replace("Z", "+00:00"))
                ts_epoch = dt.timestamp()
            except Exception:
                ts_epoch = datetime.now(timezone.utc).timestamp()
        elif isinstance(ts, (int, float)):
            ts_epoch = float(ts)
        else:
            ts_epoch = datetime.now(timezone.utc).timestamp()

        record = {
            "bus_id": str(observation.get("bus_id", "BUS-UNKNOWN")),
            "route_id": str(observation.get("route_id", "UNKNOWN")),
            "hazard_type": str(observation.get("hazard_type", "POTHOLE")).upper(),
            "confidence": float(observation.get("confidence", 0.75)),
            "lat": float(observation.get("lat", 13.0067)),
            "lng": float(observation.get("lng", 80.2025)),
            "timestamp": ts_epoch,
            "image_evidence": observation.get("image_evidence"),
            "observation_id": observation.get("observation_id", f"OBS-{len(self.observations) + 1:04d}")
        }

        self.observations.append(record)
        return self.find_cluster_for_observation(record)

    def find_cluster_for_observation(self, target: Dict[str, Any]) -> Dict[str, Any]:
        """
        Finds all matching observations within spatial-temporal thresholds for the target.
        """
        matching: List[Dict[str, Any]] = []
        distinct_buses = set()

        for obs in self.observations:
            if obs["hazard_type"] != target["hazard_type"]:
                continue
            
            # Spatial distance
            dist = haversine_distance(target["lat"], target["lng"], obs["lat"], obs["lng"])
            if dist > self.SPATIAL_THRESHOLD_METERS:
                continue

            # Temporal difference
            dt = abs(target["timestamp"] - obs["timestamp"])
            if dt > self.TEMPORAL_WINDOW_SECONDS:
                continue

            matching.append(obs)
            distinct_buses.add(obs["bus_id"])

        return self._build_cluster_summary(target["hazard_type"], matching, list(distinct_buses))

    def cluster_all(self, custom_observations: Optional[List[Dict[str, Any]]] = None) -> List[Dict[str, Any]]:
        """
        Runs spatial-temporal clustering over a given list or current memory.
        """
        pool = custom_observations if custom_observations is not None else self.observations
        clusters: List[Dict[str, Any]] = []
        visited = set()

        for i, obs in enumerate(pool):
            if i in visited:
                continue

            cluster_members = [obs]
            visited.add(i)
            distinct_buses = {obs["bus_id"]}

            for j, candidate in enumerate(pool):
                if j in visited:
                    continue
                if candidate["hazard_type"] != obs["hazard_type"]:
                    continue

                dist = haversine_distance(obs["lat"], obs["lng"], candidate["lat"], candidate["lng"])
                if dist <= self.SPATIAL_THRESHOLD_METERS:
                    dt = abs(obs["timestamp"] - candidate["timestamp"])
                    if dt <= self.TEMPORAL_WINDOW_SECONDS:
                        cluster_members.append(candidate)
                        visited.add(j)
                        distinct_buses.add(candidate["bus_id"])

            summary = self._build_cluster_summary(obs["hazard_type"], cluster_members, list(distinct_buses))
            clusters.append(summary)

        return clusters

    def _build_cluster_summary(self, hazard_type: str, members: List[Dict[str, Any]], distinct_buses: List[str]) -> Dict[str, Any]:
        n_buses = len(distinct_buses)
        n_obs = len(members)

        # Centroid coordinates
        avg_lat = sum(m["lat"] for m in members) / max(1, n_obs)
        avg_lng = sum(m["lng"] for m in members) / max(1, n_obs)

        # Bayesian Confidence Escalation
        bus_conf_map: Dict[str, float] = {}
        for m in members:
            b_id = m["bus_id"]
            c = m["confidence"]
            bus_conf_map[b_id] = max(bus_conf_map.get(b_id, 0.0), c)

        prob_all_false = 1.0
        for conf_val in bus_conf_map.values():
            prob_all_false *= (1.0 - min(0.999, max(0.10, conf_val)))
        
        fused_confidence = round(1.0 - prob_all_false, 4)

        if n_buses >= 3:
            consensus_status = "MUNICIPAL_PRIORITY_CONSENSUS"
            severity = "CRITICAL"
            work_order_priority = "P1_EMERGENCY"
            auto_work_order = True
        elif n_buses == 2:
            consensus_status = "MULTI_BUS_CORROBORATED"
            severity = "HIGH"
            work_order_priority = "P2_ELEVATED"
            auto_work_order = True
        else:
            consensus_status = "SINGLE_BUS_UNVERIFIED"
            severity = "MEDIUM"
            work_order_priority = "P3_MONITORING"
            auto_work_order = False

        return {
            "cluster_id": f"CLUS-{hazard_type[:3]}-{int(avg_lat*1000)%1000}{int(avg_lng*1000)%1000}",
            "hazard_type": hazard_type,
            "observations_count": n_obs,
            "distinct_buses_count": n_buses,
            "observing_buses": distinct_buses,
            "centroid_lat": round(avg_lat, 6),
            "centroid_lng": round(avg_lng, 6),
            "fused_confidence": fused_confidence,
            "consensus_status": consensus_status,
            "severity": severity,
            "work_order_priority": work_order_priority,
            "auto_work_order_triggered": auto_work_order,
            "spatial_radius_meters": self.SPATIAL_THRESHOLD_METERS,
            "temporal_window_minutes": round(self.TEMPORAL_WINDOW_SECONDS / 60.0, 1),
            "evidence_count": sum(1 for m in members if m.get("image_evidence")),
            "member_observations": members
        }

multi_bus_consensus = MultiBusConsensusEngine()
