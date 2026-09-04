"""
Persistent JSON Store for CivicAI Safety Camera Incidents & Work Orders
Ensures all state transitions and newly created incidents survive server reloads.
SIH 2026 PS 26124
"""

import json
import os
import threading
from pathlib import Path
from typing import List, Dict, Any, Optional

STORE_FILE = Path(__file__).resolve().parent / "incidents_store.json"
_lock = threading.Lock()

DEFAULT_INCIDENTS = [
    {
        "incident_id": "INC-2026-00421",
        "hazard_type": "POTHOLE",
        "title": "Severe Deep Asphalt Pothole",
        "confidence": 94.8,
        "severity": "HIGH",
        "civic_risk_score": 87,
        "timestamp": "19:42:18",
        "latitude": 13.0067,
        "longitude": 80.2020,
        "location_name": "Guindy Kathipara Underpass, Chennai",
        "vehicle_id": "BUS-104A",
        "route_id": "70H (SRM ➔ Guindy ➔ T. Nagar)",
        "camera_id": "CAM-FRONT (Front Road AI Camera)",
        "bounding_box": {"x": 130, "y": 220, "width": 190, "height": 115},
        "danger_zone_active": False,
        "verification_status": "MULTI_VEHICLE_VERIFIED",
        "work_order_status": "ASSIGNED",
        "multi_vehicle_verification": {
            "status": "MULTI_VEHICLE_VERIFIED",
            "bus_count": 3,
            "verification_confidence": 98.4,
            "reporting_vehicles": [
                {"vehicle_id": "BUS-104A", "confidence": 94.8, "delta_m": 0.0, "time_delta": "0s"},
                {"vehicle_id": "BUS-102", "confidence": 91.3, "delta_m": 4.2, "time_delta": "+3m"},
                {"vehicle_id": "BUS-103", "confidence": 95.2, "delta_m": 2.8, "time_delta": "+6m"}
            ]
        },
        "connected_vehicle_broadcast": {
            "alert_status": "ACTIVE_BROADCAST",
            "alert_type": "ROAD_HAZARD_WARNING",
            "broadcast_radius_m": 350,
            "vehicles_alerted": 7,
            "caution_message": "⚠️ ROAD HAZARD AHEAD: Deep Pothole detected 180m ahead. Slow down and proceed carefully."
        },
        "work_order": {
            "created": True,
            "work_order_id": "GCC-ROAD-4092",
            "status": "ASSIGNED",
            "department": "Greater Chennai Corporation (GCC) — Ward 168 Roads Div."
        },
        "privacy": {
            "local_edge_inference": True,
            "metadata_only_transmitted": True,
            "privacy_masked": True
        }
    },
    {
        "incident_id": "INC-2026-00418",
        "hazard_type": "PEDESTRIAN_HAZARD",
        "title": "Pedestrian in Vehicle Carriage-Way Danger Corridor",
        "confidence": 96.2,
        "severity": "CRITICAL",
        "civic_risk_score": 93,
        "timestamp": "19:15:02",
        "latitude": 13.0125,
        "longitude": 80.2156,
        "location_name": "Guindy Industrial Estate Junction, Chennai",
        "vehicle_id": "BUS-104A",
        "route_id": "70H",
        "camera_id": "CAM-FRONT",
        "bounding_box": {"x": 210, "y": 170, "width": 140, "height": 165},
        "danger_zone_active": True,
        "verification_status": "HIGH_CONFIDENCE_EDGE_ALERT",
        "work_order_status": "PRIORITIZED",
        "multi_vehicle_verification": {
            "status": "IMMEDIATE_EDGE_TRIGGER",
            "bus_count": 2,
            "verification_confidence": 96.2,
            "reporting_vehicles": [
                {"vehicle_id": "BUS-104A", "confidence": 96.2, "delta_m": 0.0, "time_delta": "0s"}
            ]
        },
        "connected_vehicle_broadcast": {
            "alert_status": "ACTIVE_BROADCAST",
            "alert_type": "VULNERABLE_ROAD_USER_WARNING",
            "broadcast_radius_m": 250,
            "vehicles_alerted": 9,
            "caution_message": "⚠️ PEDESTRIAN HAZARD: Person in travel lane. Slow down immediately."
        },
        "work_order": {
            "created": True,
            "work_order_id": "TN-TRAFFIC-VRU-108",
            "status": "PRIORITIZED",
            "department": "Greater Chennai Traffic Police (Traffic Safety Cell)"
        },
        "privacy": {
            "local_edge_inference": True,
            "metadata_only_transmitted": True,
            "privacy_masked": True,
            "face_anonymized": True
        }
    },
    {
        "incident_id": "INC-2026-00392",
        "hazard_type": "WATERLOGGING",
        "title": "Monsoon Subway Water Stagnation",
        "confidence": 92.4,
        "severity": "HIGH",
        "civic_risk_score": 84,
        "timestamp": "18:30:45",
        "latitude": 13.0382,
        "longitude": 80.2405,
        "location_name": "Saidapet Subway, Anna Salai",
        "vehicle_id": "BUS-102",
        "route_id": "101A",
        "camera_id": "CAM-FRONT",
        "bounding_box": {"x": 100, "y": 240, "width": 300, "height": 120},
        "danger_zone_active": False,
        "verification_status": "MULTI_VEHICLE_VERIFIED",
        "work_order_status": "WORK_ORDER_CREATED",
        "multi_vehicle_verification": {
            "status": "MULTI_VEHICLE_VERIFIED",
            "bus_count": 2,
            "verification_confidence": 92.4,
            "reporting_vehicles": [
                {"vehicle_id": "BUS-102", "confidence": 92.4, "delta_m": 0.0, "time_delta": "0s"}
            ]
        },
        "connected_vehicle_broadcast": {
            "alert_status": "ACTIVE_BROADCAST",
            "alert_type": "ROAD_HAZARD_WARNING",
            "broadcast_radius_m": 300,
            "vehicles_alerted": 5,
            "caution_message": "⚠️ WATERLOGGING AHEAD: Subway lane submerged. Exercise caution."
        },
        "work_order": {
            "created": True,
            "work_order_id": "GCC-STORM-DRAIN-88",
            "status": "WORK_ORDER_CREATED",
            "department": "GCC Storm Water Drainage Division"
        },
        "privacy": {"local_edge_inference": True, "metadata_only_transmitted": True, "privacy_masked": True}
    },
    {
        "incident_id": "INC-2026-00360",
        "hazard_type": "POTENTIAL_MISSING_SIGN",
        "title": "GIS Discrepancy: Missing Mandatory Bus Lane Sign",
        "confidence": 92.8,
        "severity": "HIGH",
        "civic_risk_score": 76,
        "timestamp": "17:15:10",
        "latitude": 13.0210,
        "longitude": 80.2240,
        "location_name": "Saidapet Anna Salai Transit Corridor",
        "vehicle_id": "BUS-104A",
        "route_id": "70H",
        "camera_id": "CAM-FRONT",
        "bounding_box": {"x": 280, "y": 90, "width": 80, "height": 120},
        "danger_zone_active": False,
        "verification_status": "GIS_CORRIDOR_VERIFIED",
        "work_order_status": "IN_PROGRESS",
        "multi_vehicle_verification": {
            "status": "MULTI_VEHICLE_VERIFIED",
            "bus_count": 3,
            "verification_confidence": 94.0,
            "reporting_vehicles": [
                {"vehicle_id": "BUS-104A", "confidence": 92.8, "delta_m": 0.0, "time_delta": "0s"}
            ]
        },
        "connected_vehicle_broadcast": {
            "alert_status": "ACTIVE_BROADCAST",
            "alert_type": "TRAFFIC_SIGN_DISCREPANCY",
            "broadcast_radius_m": 200,
            "vehicles_alerted": 4,
            "caution_message": "⚠️ SIGN DEFICIENCY: Regulatory bus lane sign missing."
        },
        "work_order": {
            "created": True,
            "work_order_id": "GCC-SIGN-1204",
            "status": "IN_PROGRESS",
            "department": "Greater Chennai Corporation — Traffic Assets Dept"
        },
        "privacy": {"local_edge_inference": True, "metadata_only_transmitted": True, "privacy_masked": True}
    },
    {
        "incident_id": "INC-2026-00315",
        "hazard_type": "DAMAGED_SIGN",
        "title": "Damaged / Bent Speed Limit 40 Sign",
        "confidence": 91.2,
        "severity": "MEDIUM",
        "civic_risk_score": 64,
        "timestamp": "16:02:19",
        "latitude": 13.0520,
        "longitude": 80.2501,
        "location_name": "T. Nagar Panagal Park Approach",
        "vehicle_id": "BUS-103",
        "route_id": "23C",
        "camera_id": "CAM-LEFT",
        "bounding_box": {"x": 260, "y": 80, "width": 85, "height": 130},
        "danger_zone_active": False,
        "verification_status": "EDGE_VERIFIED",
        "work_order_status": "RESOLVED",
        "multi_vehicle_verification": {
            "status": "MULTI_VEHICLE_VERIFIED",
            "bus_count": 2,
            "verification_confidence": 91.2,
            "reporting_vehicles": [{"vehicle_id": "BUS-103", "confidence": 91.2, "delta_m": 0.0, "time_delta": "0s"}]
        },
        "connected_vehicle_broadcast": {
            "alert_status": "STANDBY",
            "alert_type": "TRAFFIC_SIGN_WARNING",
            "broadcast_radius_m": 150,
            "vehicles_alerted": 2,
            "caution_message": "⚠️ DAMAGED SIGN: Bent signpost on curb."
        },
        "work_order": {
            "created": True,
            "work_order_id": "GCC-SIGN-1192",
            "status": "RESOLVED",
            "department": "GCC Traffic Assets Dept"
        },
        "privacy": {"local_edge_inference": True, "metadata_only_transmitted": True, "privacy_masked": True}
    },
    {
        "incident_id": "INC-2026-00280",
        "hazard_type": "GARBAGE_SPILL",
        "title": "Roadside Solid Waste Spill Encroaching Carriage-way",
        "confidence": 89.2,
        "severity": "MEDIUM",
        "civic_risk_score": 68,
        "timestamp": "15:20:10",
        "latitude": 13.0450,
        "longitude": 80.2200,
        "location_name": "Ashok Nagar 1st Avenue Bus Stop",
        "vehicle_id": "BUS-104A",
        "route_id": "70H",
        "camera_id": "CAM-LEFT",
        "bounding_box": {"x": 40, "y": 250, "width": 160, "height": 110},
        "danger_zone_active": False,
        "verification_status": "MULTI_VEHICLE_VERIFIED",
        "work_order_status": "ASSIGNED",
        "multi_vehicle_verification": {
            "status": "MULTI_VEHICLE_VERIFIED",
            "bus_count": 2,
            "verification_confidence": 89.2,
            "reporting_vehicles": [{"vehicle_id": "BUS-104A", "confidence": 89.2, "delta_m": 0.0, "time_delta": "0s"}]
        },
        "connected_vehicle_broadcast": {
            "alert_status": "STANDBY",
            "alert_type": "SANITATION_ALERT",
            "broadcast_radius_m": 150,
            "vehicles_alerted": 3,
            "caution_message": "⚠️ ROAD ENCROACHMENT: Overflowing bin encroaching lane."
        },
        "work_order": {
            "created": True,
            "work_order_id": "GCC-SWM-4401",
            "status": "ASSIGNED",
            "department": "Greater Chennai Corporation — Solid Waste Management (SWM)"
        },
        "privacy": {"local_edge_inference": True, "metadata_only_transmitted": True, "privacy_masked": True}
    }
]

class IncidentsStore:
    def __init__(self):
        self._incidents = []
        self._load()

    def _load(self):
        with _lock:
            if STORE_FILE.exists():
                try:
                    with open(STORE_FILE, "r") as f:
                        self._incidents = json.load(f)
                        return
                except Exception:
                    pass
            self._incidents = list(DEFAULT_INCIDENTS)
            self._save()

    def _save(self):
        try:
            with open(STORE_FILE, "w") as f:
                json.dump(self._incidents, f, indent=2)
        except Exception as e:
            print(f"Failed to persist incidents: {e}")

    def get_all(self) -> List[Dict[str, Any]]:
        with _lock:
            return list(self._incidents)

    def add(self, inc: Dict[str, Any]):
        with _lock:
            # Check if incident_id already exists
            existing_idx = next((i for i, x in enumerate(self._incidents) if x.get("incident_id") == inc.get("incident_id")), None)
            if existing_idx is not None:
                self._incidents[existing_idx] = inc
            else:
                self._incidents.insert(0, inc)
            self._save()

    def transition_status(self, incident_id: str, new_status: str, crew: Optional[str] = None, notes: Optional[str] = None) -> Optional[Dict[str, Any]]:
        with _lock:
            for inc in self._incidents:
                if inc.get("incident_id") == incident_id:
                    inc["work_order_status"] = new_status
                    if "work_order" in inc:
                        inc["work_order"]["status"] = new_status
                    if crew:
                        inc["assigned_crew"] = crew
                    if notes:
                        inc["resolution_notes"] = notes
                    self._save()
                    return inc
        return None

incidents_store = IncidentsStore()
