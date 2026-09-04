from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import random
from datetime import datetime

router = APIRouter(prefix="/api/sensing", tags=["SIH PS 26124 Fleet Sensing"])

# Normalized Single Demo Bus Identity: BUS-104A / TN-01-N-9842 / Route 70H
DEMO_BUSES = [
    {
        "bus_id": "BUS-104A",
        "reg_number": "TN-01-N-9842",
        "route_code": "70H",
        "route_name": "SRM Ramapuram ➔ Guindy ➔ T. Nagar",
        "driver_name": "K. Selvam",
        "speed_kmh": 34,
        "lat": 13.0067,
        "lng": 80.2020,
        "status": "AI_ONLINE",
        "edge_device": "NVIDIA Jetson AGX Orin 64GB (Simulated)",
        "inference_fps": 45,
        "cameras_active": 4,
        "cameras": [
            {"id": "CAM-FRONT", "name": "Front Road AI Camera", "resolution": "1080p 60FPS", "status": "ACTIVE", "role": "Potholes, cracks, waterlogging, debris"},
            {"id": "CAM-REAR", "name": "Rear Traffic AI Camera", "resolution": "1080p 60FPS", "status": "ACTIVE", "role": "Traffic density & bottleneck intelligence"},
            {"id": "CAM-LEFT", "name": "Side Obstacle / Curb Camera", "resolution": "720p 30FPS", "status": "ACTIVE", "role": "Damaged signs, garbage overflow, encroachment"},
            {"id": "CAM-CABIN", "name": "Cabin Passenger Safety Camera", "resolution": "1080p 30FPS", "status": "ACTIVE", "role": "Secondary crowd density & interior safety"}
        ]
    },
    {
        "bus_id": "BUS-102",
        "reg_number": "TN-02-M-4410",
        "route_code": "101A",
        "route_name": "Koyambedu CMBT ➔ Central Railway Station",
        "driver_name": "P. Arumugam",
        "speed_kmh": 28,
        "lat": 13.0694,
        "lng": 80.1948,
        "status": "AI_ONLINE",
        "edge_device": "NVIDIA Jetson Xavier NX (Simulated)",
        "inference_fps": 38,
        "cameras_active": 4,
        "cameras": [
            {"id": "CAM-FRONT", "name": "Front Road AI Camera", "resolution": "1080p 60FPS", "status": "ACTIVE", "role": "Potholes, cracks, waterlogging, debris"},
            {"id": "CAM-REAR", "name": "Rear Traffic AI Camera", "resolution": "1080p 60FPS", "status": "ACTIVE", "role": "Traffic density & bottleneck intelligence"},
            {"id": "CAM-LEFT", "name": "Side Obstacle / Curb Camera", "resolution": "720p 30FPS", "status": "ACTIVE", "role": "Damaged signs, garbage overflow, encroachment"},
            {"id": "CAM-CABIN", "name": "Cabin Passenger Safety Camera", "resolution": "1080p 30FPS", "status": "ACTIVE", "role": "Secondary crowd density & interior safety"}
        ]
    },
    {
        "bus_id": "BUS-103",
        "reg_number": "TN-07-H-3129",
        "route_code": "23C",
        "route_name": "Adayar Depot ➔ Egmore Station",
        "driver_name": "M. Sundaram",
        "speed_kmh": 41,
        "lat": 13.0067,
        "lng": 80.2571,
        "status": "AI_ONLINE",
        "edge_device": "NVIDIA Jetson AGX Orin 64GB (Simulated)",
        "inference_fps": 48,
        "cameras_active": 4,
        "cameras": [
            {"id": "CAM-FRONT", "name": "Front Road AI Camera", "resolution": "1080p 60FPS", "status": "ACTIVE", "role": "Potholes, cracks, waterlogging, debris"},
            {"id": "CAM-REAR", "name": "Rear Traffic AI Camera", "resolution": "1080p 60FPS", "status": "ACTIVE", "role": "Traffic density & bottleneck intelligence"},
            {"id": "CAM-LEFT", "name": "Side Obstacle / Curb Camera", "resolution": "720p 30FPS", "status": "ACTIVE", "role": "Damaged signs, garbage overflow, encroachment"},
            {"id": "CAM-CABIN", "name": "Cabin Passenger Safety Camera", "resolution": "1080p 30FPS", "status": "ACTIVE", "role": "Secondary crowd density & interior safety"}
        ]
    }
]

# Expanded Urban Hazard Classes with Civic Risk Scores and Multi-Bus Verification
DEMO_DETECTIONS = [
    {
        "event_id": "EVT-8091",
        "bus_id": "BUS-104A",
        "bus_reg": "TN-01-N-9842",
        "type": "POTHOLE_SEVERE",
        "category": "ROAD_DEFECT",
        "title": "Severe Deep Asphalt Pothole",
        "description": "2.4ft wide deep pothole with exposed aggregate detected near Guindy Kathipara Flyover underpass.",
        "location_name": "Guindy Kathipara Underpass",
        "road_segment": "GUINDY_KATHIPARA",
        "lat": 13.0067,
        "lng": 80.2020,
        "severity": "CRITICAL",
        "confidence": 94.8,
        "civic_risk_score": 92,
        "risk_breakdown": {
            "ai_confidence_score": 24, # out of 25 (94.8%)
            "severity_weight": 35,     # out of 35 (Critical)
            "traffic_density_weight": 18, # out of 20 (High Arterial)
            "multi_bus_recurrence": 15   # out of 20 (3 independent bus sightings)
        },
        "multi_bus_verification": {
            "status": "MULTI_BUS_VERIFIED",
            "bus_count": 3,
            "verification_confidence": 98.4,
            "buses_reporting": [
                {"bus_id": "BUS-104A", "timestamp": "18:45:12", "confidence": 94.8, "delta_distance_m": 0.0},
                {"bus_id": "BUS-102", "timestamp": "18:48:30", "confidence": 91.3, "delta_distance_m": 4.2},
                {"bus_id": "BUS-103", "timestamp": "18:52:10", "confidence": 95.2, "delta_distance_m": 2.8}
            ],
            "correlation_rationale": "3 independent bus sightings recorded within a 5-meter radius and 7-minute window confirm structural pothole without false-positive camera shake."
        },
        "timestamp": "2026-08-26 18:45:12",
        "bounding_box": {"x": 120, "y": 240, "width": 180, "height": 110},
        "camera": "CAM-FRONT",
        "work_order_generated": True,
        "work_order_id": "GCC-ROAD-4092",
        "work_order_status": "ASSIGNED",
        "assigned_department": "Greater Chennai Corporation (GCC) — Ward 168 Roads Div.",
        "assigned_crew": "Quick Response Asphalt Patch Crew #4",
        "sla_hours": 4,
        "privacy_masked": True
    },
    {
        "event_id": "EVT-8092",
        "bus_id": "BUS-104A",
        "bus_reg": "TN-01-N-9842",
        "type": "WATERLOGGING",
        "category": "DRAINAGE_DEFECT",
        "title": "Severe Subway Waterlogging / Drainage Blockage",
        "description": "Standing rainwater depth > 8 inches accumulating across 2 lanes on GST Road underpass.",
        "location_name": "GST Road Kathipara Subway",
        "road_segment": "GUINDY_KATHIPARA",
        "lat": 13.0085,
        "lng": 80.2045,
        "severity": "CRITICAL",
        "confidence": 92.4,
        "civic_risk_score": 88,
        "risk_breakdown": {
            "ai_confidence_score": 23,
            "severity_weight": 35,
            "traffic_density_weight": 18,
            "multi_bus_recurrence": 12
        },
        "multi_bus_verification": {
            "status": "MULTI_BUS_VERIFIED",
            "bus_count": 2,
            "verification_confidence": 96.1,
            "buses_reporting": [
                {"bus_id": "BUS-104A", "timestamp": "18:46:05", "confidence": 92.4, "delta_distance_m": 0.0},
                {"bus_id": "BUS-103", "timestamp": "18:53:22", "confidence": 94.0, "delta_distance_m": 3.1}
            ],
            "correlation_rationale": "Subway water accumulation verified across consecutive trips on Route 70H."
        },
        "timestamp": "2026-08-26 18:46:05",
        "bounding_box": {"x": 80, "y": 210, "width": 240, "height": 130},
        "camera": "CAM-FRONT",
        "work_order_generated": True,
        "work_order_id": "GCC-DRAIN-1082",
        "work_order_status": "IN_PROGRESS",
        "assigned_department": "GCC Stormwater Drain & Pumping Division",
        "assigned_crew": "Emergency Dewatering Mobile Pump Unit #2",
        "sla_hours": 2,
        "privacy_masked": True
    },
    {
        "event_id": "EVT-8093",
        "bus_id": "BUS-102",
        "bus_reg": "TN-02-M-4410",
        "type": "OPEN_MANHOLE",
        "category": "CIVIC_HAZARD",
        "title": "Dislodged / Missing Stormwater Manhole Cover",
        "description": "Exposed open manhole cavity on left carriage-way near Vadapalani 100ft road intersection.",
        "location_name": "Vadapalani 100ft Road",
        "road_segment": "POONAMALLEE_HIGH",
        "lat": 13.0512,
        "lng": 80.2120,
        "severity": "CRITICAL",
        "confidence": 96.1,
        "civic_risk_score": 95,
        "risk_breakdown": {
            "ai_confidence_score": 25,
            "severity_weight": 35,
            "traffic_density_weight": 19,
            "multi_bus_recurrence": 16
        },
        "multi_bus_verification": {
            "status": "MULTI_BUS_VERIFIED",
            "bus_count": 2,
            "verification_confidence": 97.8,
            "buses_reporting": [
                {"bus_id": "BUS-102", "timestamp": "18:32:10", "confidence": 96.1, "delta_distance_m": 0.0},
                {"bus_id": "BUS-104A", "timestamp": "18:42:15", "confidence": 95.8, "delta_distance_m": 1.4}
            ],
            "correlation_rationale": "High-risk open cavity confirmed by independent sensors on 100ft Road corridor."
        },
        "timestamp": "2026-08-26 18:32:10",
        "bounding_box": {"x": 160, "y": 220, "width": 110, "height": 95},
        "camera": "CAM-FRONT",
        "work_order_generated": True,
        "work_order_id": "CMWSSB-HAZARD-901",
        "work_order_status": "CREATED",
        "assigned_department": "Chennai Metrowater & Sewerage Board (CMWSSB)",
        "assigned_crew": "Emergency Iron Cover Replacement Team",
        "sla_hours": 1,
        "privacy_masked": True
    },
    {
        "event_id": "EVT-8094",
        "bus_id": "BUS-102",
        "bus_reg": "TN-02-M-4410",
        "type": "GARBAGE_OVERFLOW",
        "category": "SANITATION",
        "title": "Municipal Bin Overflow Spilling onto Road",
        "description": "Commercial refuse spilling 4 meters into bus lane near Koyambedu Wholesale Market entrance.",
        "location_name": "Koyambedu Wholesale Market",
        "road_segment": "KOYAMBEDU_ROUNDTANA",
        "lat": 13.0694,
        "lng": 80.1948,
        "severity": "MEDIUM",
        "confidence": 89.2,
        "civic_risk_score": 68,
        "risk_breakdown": {
            "ai_confidence_score": 21,
            "severity_weight": 20,
            "traffic_density_weight": 17,
            "multi_bus_recurrence": 10
        },
        "multi_bus_verification": {
            "status": "SINGLE_BUS_DETECTED",
            "bus_count": 1,
            "verification_confidence": 89.2,
            "buses_reporting": [
                {"bus_id": "BUS-102", "timestamp": "18:50:00", "confidence": 89.2, "delta_distance_m": 0.0}
            ],
            "correlation_rationale": "Single bus sighting logged. Awaiting confirmation pass by Route 101A return trip."
        },
        "timestamp": "2026-08-26 18:50:00",
        "bounding_box": {"x": 280, "y": 140, "width": 140, "height": 130},
        "camera": "CAM-LEFT",
        "work_order_generated": True,
        "work_order_id": "GCC-SWM-4033",
        "work_order_status": "ASSIGNED",
        "assigned_department": "GCC Solid Waste Management — Urbaser Sumeet",
        "assigned_crew": "Compactor Truck Unit #14",
        "sla_hours": 6,
        "privacy_masked": True
    },
    {
        "event_id": "EVT-8095",
        "bus_id": "BUS-104A",
        "bus_reg": "TN-01-N-9842",
        "type": "DAMAGED_SIGN",
        "category": "INFRASTRUCTURE",
        "title": "Damaged / Bent Speed Limit Sign",
        "description": "Mandatory 40 km/h speed sign post bent 45 degrees near SRM Ramapuram main gate.",
        "location_name": "SRM Ramapuram Entrance",
        "road_segment": "GUINDY_KATHIPARA",
        "lat": 13.0315,
        "lng": 80.1812,
        "severity": "HIGH",
        "confidence": 91.2,
        "civic_risk_score": 64,
        "risk_breakdown": {
            "ai_confidence_score": 22,
            "severity_weight": 25,
            "traffic_density_weight": 11,
            "multi_bus_recurrence": 6
        },
        "multi_bus_verification": {
            "status": "MULTI_BUS_VERIFIED",
            "bus_count": 2,
            "verification_confidence": 94.6,
            "buses_reporting": [
                {"bus_id": "BUS-104A", "timestamp": "18:50:30", "confidence": 91.2, "delta_distance_m": 0.0},
                {"bus_id": "BUS-102", "timestamp": "18:57:12", "confidence": 93.5, "delta_distance_m": 1.9}
            ],
            "correlation_rationale": "Bent road furniture verified from side curb camera on consecutive trips."
        },
        "timestamp": "2026-08-26 18:50:30",
        "bounding_box": {"x": 310, "y": 80, "width": 95, "height": 140},
        "camera": "CAM-LEFT",
        "work_order_generated": True,
        "work_order_id": "GCC-TRAFFIC-1044",
        "work_order_status": "RESOLVED",
        "assigned_department": "GCC Traffic Engineering & Signage Division",
        "assigned_crew": "Sign Post Maintenance Van #8",
        "sla_hours": 12,
        "privacy_masked": True
    },
    {
        "event_id": "EVT-8096",
        "bus_id": "BUS-103",
        "bus_reg": "TN-07-H-3129",
        "type": "ROAD_DEBRIS",
        "category": "ROAD_DEFECT",
        "title": "Fallen Construction Concrete Slab & Debris",
        "description": "Loose concrete blocks obstructing right turn lane near Anna Salai Saidapet.",
        "location_name": "Anna Salai Saidapet",
        "road_segment": "ANNA_SALAI",
        "lat": 13.0180,
        "lng": 80.2240,
        "severity": "HIGH",
        "confidence": 88.5,
        "civic_risk_score": 74,
        "risk_breakdown": {
            "ai_confidence_score": 21,
            "severity_weight": 25,
            "traffic_density_weight": 18,
            "multi_bus_recurrence": 10
        },
        "multi_bus_verification": {
            "status": "SINGLE_BUS_DETECTED",
            "bus_count": 1,
            "verification_confidence": 88.5,
            "buses_reporting": [
                {"bus_id": "BUS-103", "timestamp": "18:58:45", "confidence": 88.5, "delta_distance_m": 0.0}
            ],
            "correlation_rationale": "Front camera detected obstacle on active roadway. High traffic corridor escalated priority."
        },
        "timestamp": "2026-08-26 18:58:45",
        "bounding_box": {"x": 190, "y": 230, "width": 150, "height": 85},
        "camera": "CAM-FRONT",
        "work_order_generated": True,
        "work_order_id": "GCC-ROAD-4098",
        "work_order_status": "IN_PROGRESS",
        "assigned_department": "Greater Chennai Corporation — Highways Division",
        "assigned_crew": "Heavy Obstacle Tow & Clearance Unit",
        "sla_hours": 3,
        "privacy_masked": True
    },
    {
        "event_id": "EVT-8097",
        "bus_id": "BUS-104A",
        "bus_reg": "TN-01-N-9842",
        "type": "ENCROACHMENT",
        "category": "INFRASTRUCTURE",
        "title": "Illegal Commercial Stall Encroaching Footpath",
        "description": "Temporary metal kiosk blocking pedestrian refuge sidewalk near T. Nagar Usman Road.",
        "location_name": "T. Nagar Usman Road",
        "road_segment": "GUINDY_KATHIPARA",
        "lat": 13.0410,
        "lng": 80.2330,
        "severity": "MEDIUM",
        "confidence": 87.3,
        "civic_risk_score": 60,
        "risk_breakdown": {
            "ai_confidence_score": 20,
            "severity_weight": 20,
            "traffic_density_weight": 14,
            "multi_bus_recurrence": 6
        },
        "multi_bus_verification": {
            "status": "SINGLE_BUS_DETECTED",
            "bus_count": 1,
            "verification_confidence": 87.3,
            "buses_reporting": [
                {"bus_id": "BUS-104A", "timestamp": "19:05:12", "confidence": 87.3, "delta_distance_m": 0.0}
            ],
            "correlation_rationale": "Sidewalk curb camera flagged physical barrier forcing pedestrians into traffic lane."
        },
        "timestamp": "2026-08-26 19:05:12",
        "bounding_box": {"x": 260, "y": 110, "width": 130, "height": 150},
        "camera": "CAM-LEFT",
        "work_order_generated": False,
        "work_order_status": "PENDING_INSPECTION",
        "assigned_department": "GCC Revenue & Encroachment Enforcement Unit",
        "sla_hours": 24,
        "privacy_masked": True
    },
    {
        "event_id": "EVT-8098",
        "bus_id": "BUS-103",
        "bus_reg": "TN-07-H-3129",
        "type": "FALLEN_TREE",
        "category": "CIVIC_HAZARD",
        "title": "Fallen Tree Branch Obstructing Carriage-way",
        "description": "Heavy banyan tree branch snapped and resting on road shoulder near Besant Nagar 4th Avenue.",
        "location_name": "Besant Nagar 4th Avenue",
        "road_segment": "ANNA_SALAI",
        "lat": 13.0012,
        "lng": 80.2680,
        "severity": "HIGH",
        "confidence": 93.7,
        "civic_risk_score": 82,
        "risk_breakdown": {
            "ai_confidence_score": 23,
            "severity_weight": 30,
            "traffic_density_weight": 14,
            "multi_bus_recurrence": 15
        },
        "multi_bus_verification": {
            "status": "MULTI_BUS_VERIFIED",
            "bus_count": 2,
            "verification_confidence": 96.5,
            "buses_reporting": [
                {"bus_id": "BUS-103", "timestamp": "18:40:11", "confidence": 93.7, "delta_distance_m": 0.0},
                {"bus_id": "BUS-104A", "timestamp": "18:55:40", "confidence": 94.2, "delta_distance_m": 2.5}
            ],
            "correlation_rationale": "Corroborated by 2 consecutive fleet runs. High safety hazard for two-wheelers."
        },
        "timestamp": "2026-08-26 18:40:11",
        "bounding_box": {"x": 100, "y": 180, "width": 260, "height": 140},
        "camera": "CAM-FRONT",
        "work_order_generated": True,
        "work_order_id": "GCC-PARKS-204",
        "work_order_status": "ASSIGNED",
        "assigned_department": "GCC Parks & Forestry Clearance Team",
        "assigned_crew": "Hydraulic Saw Clearance Crew #1",
        "sla_hours": 3,
        "privacy_masked": True
    },
    {
        "event_id": "EVT-8099",
        "bus_id": "BUS-102",
        "bus_reg": "TN-02-M-4410",
        "type": "PEDESTRIAN_DANGER",
        "category": "PEDESTRIAN_SAFETY",
        "title": "Vulnerable Pedestrian / School Child Crossing Alert",
        "description": "Children stepping into non-zebra road zone in heavy traffic near Koyambedu School Zone.",
        "location_name": "Koyambedu School Zone",
        "road_segment": "KOYAMBEDU_ROUNDTANA",
        "lat": 13.0694,
        "lng": 80.1948,
        "severity": "CRITICAL",
        "confidence": 96.4,
        "civic_risk_score": 85,
        "risk_breakdown": {
            "ai_confidence_score": 25,
            "severity_weight": 35,
            "traffic_density_weight": 15,
            "multi_bus_recurrence": 10
        },
        "multi_bus_verification": {
            "status": "SINGLE_BUS_DETECTED",
            "bus_count": 1,
            "verification_confidence": 96.4,
            "buses_reporting": [
                {"bus_id": "BUS-102", "timestamp": "18:55:04", "confidence": 96.4, "delta_distance_m": 0.0}
            ],
            "correlation_rationale": "Real-time edge alert triggered onboard chime for driver caution."
        },
        "timestamp": "2026-08-26 18:55:04",
        "bounding_box": {"x": 200, "y": 180, "width": 140, "height": 160},
        "camera": "CAM-FRONT",
        "work_order_generated": False,
        "work_order_status": "DRIVER_ALERTED",
        "assigned_department": "Chennai Traffic Police (Traffic Safety Cell)",
        "sla_hours": 1,
        "privacy_masked": True
    },
    {
        "event_id": "EVT-8100",
        "bus_id": "BUS-103",
        "bus_reg": "TN-07-H-3129",
        "type": "ANPR_INCIDENT",
        "category": "INCIDENT_INTELLIGENCE",
        "title": "Traffic Flow Hazard / Erratic Driving Alert (Masked)",
        "description": "Vehicle driving erratically at 74 km/h in 40 km/h urban school zone near Adayar Depot.",
        "location_name": "Adayar Depot Junction",
        "road_segment": "ANNA_SALAI",
        "lat": 13.0067,
        "lng": 80.2571,
        "severity": "HIGH",
        "confidence": 98.1,
        "civic_risk_score": 78,
        "risk_breakdown": {
            "ai_confidence_score": 25,
            "severity_weight": 25,
            "traffic_density_weight": 16,
            "multi_bus_recurrence": 12
        },
        "multi_bus_verification": {
            "status": "MULTI_BUS_VERIFIED",
            "bus_count": 2,
            "verification_confidence": 98.1,
            "buses_reporting": [
                {"bus_id": "BUS-103", "timestamp": "19:01:22", "confidence": 98.1, "delta_distance_m": 0.0},
                {"bus_id": "BUS-104A", "timestamp": "19:08:40", "confidence": 97.4, "delta_distance_m": 1.2}
            ],
            "correlation_rationale": "Consecutive fleet buses captured high-speed corridor transgression."
        },
        "timestamp": "2026-08-26 19:01:22",
        "license_plate": "TN-09-XX-XXXX",
        "license_plate_masked": True,
        "bounding_box": {"x": 150, "y": 210, "width": 160, "height": 75},
        "camera": "CAM-REAR",
        "work_order_generated": True,
        "work_order_id": "TN-POL-ALERT-881",
        "work_order_status": "ASSIGNED",
        "assigned_department": "Greater Chennai Traffic Police Control Room",
        "sla_hours": 2,
        "privacy_masked": True
    }
]

# Municipal Road Segment Health Indicators
DEMO_ROAD_SEGMENTS = [
    {
        "segment_id": "SEG-01",
        "segment_name": "Guindy Kathipara Junction & GST Road",
        "corridor": "Airport ➔ Guindy ➔ Saidapet Arterial",
        "health_score": 62,
        "health_status": "WATCH",
        "status_color": "#F59E0B",
        "active_hazards_count": 8,
        "breakdown": {
            "potholes": 5,
            "waterlogging_events": 1,
            "damaged_signs": 2,
            "debris": 0
        },
        "daily_bus_trips": 184,
        "traffic_density": "HIGH (0.88)",
        "predictive_maintenance": {
            "risk_of_critical_failure_30d": "78% Probability",
            "recommendation": "Priority Asphalt Milling & Sub-base Overlay required before upcoming monsoon cycle.",
            "urgency": "HIGH"
        }
    },
    {
        "segment_id": "SEG-02",
        "segment_name": "Koyambedu Roundtana & Market Approach",
        "corridor": "Koyambedu CMBT ➔ Metro Interchange",
        "health_score": 54,
        "health_status": "POOR",
        "status_color": "#EA580C",
        "active_hazards_count": 11,
        "breakdown": {
            "potholes": 6,
            "open_manholes": 1,
            "garbage_overflow": 3,
            "pedestrian_risks": 1
        },
        "daily_bus_trips": 240,
        "traffic_density": "HEAVY (0.82)",
        "predictive_maintenance": {
            "risk_of_critical_failure_30d": "84% Probability",
            "recommendation": "Urgent drainage clearing and heavy vehicle lane reinforcement near wholesale market.",
            "urgency": "CRITICAL"
        }
    },
    {
        "segment_id": "SEG-03",
        "segment_name": "Anna Salai (Saidapet to DMS)",
        "corridor": "Central Arterial Spine",
        "health_score": 86,
        "health_status": "GOOD",
        "status_color": "#10B981",
        "active_hazards_count": 2,
        "breakdown": {
            "potholes": 1,
            "waterlogging_events": 0,
            "damaged_signs": 0,
            "debris": 1
        },
        "daily_bus_trips": 310,
        "traffic_density": "MODERATE (0.64)",
        "predictive_maintenance": {
            "risk_of_critical_failure_30d": "18% Probability",
            "recommendation": "Optimal condition. Continue standard weekly mobile sensing sweep.",
            "urgency": "LOW"
        }
    },
    {
        "segment_id": "SEG-04",
        "segment_name": "Poonamallee High Road (Aminjikarai)",
        "corridor": "Chennai Central ➔ Koyambedu West Corridor",
        "health_score": 44,
        "health_status": "CRITICAL",
        "status_color": "#EF4444",
        "active_hazards_count": 14,
        "breakdown": {
            "potholes": 9,
            "open_manholes": 2,
            "waterlogging_events": 2,
            "debris": 1
        },
        "daily_bus_trips": 160,
        "traffic_density": "HIGH (0.78)",
        "predictive_maintenance": {
            "risk_of_critical_failure_30d": "92% Probability",
            "recommendation": "Immediate emergency resurfacing directive dispatched to GCC Zone 8 Engineers.",
            "urgency": "IMMEDIATE"
        }
    }
]

class WorkOrderStatusUpdate(BaseModel):
    event_id: str
    new_status: str  # CREATED, ASSIGNED, IN_PROGRESS, RESOLVED
    department: Optional[str] = None
    notes: Optional[str] = None

@router.get("/fleet")
def get_fleet_status():
    return {
        "status": "SUCCESS",
        "demo_mode": True,
        "note": "Prototype simulated fleet stream normalized to BUS-104A",
        "total_fleet_buses": 12,
        "active_sensing_buses": len(DEMO_BUSES),
        "total_cameras_online": 48,
        "primary_showcase_bus": "BUS-104A (TN-01-N-9842)",
        "edge_ai_processing_unit": "NVIDIA Jetson AGX Orin 64GB (Simulated)",
        "average_inference_fps": 45,
        "buses": DEMO_BUSES
    }

@router.get("/detections")
def get_sensing_detections():
    return {
        "status": "SUCCESS",
        "demo_mode": True,
        "note": "AI detections with Civic Risk Scores and Multi-Bus Independent Verification",
        "total_detections_today": 282,
        "critical_issues_count": 32,
        "resolved_issues_count": 86,
        "breakdown": {
            "potholes": 248,
            "waterlogging": 14,
            "open_manholes": 4,
            "damaged_signs": 18,
            "garbage_overflow": 22,
            "pedestrian_alerts": 8,
            "debris_and_trees": 12,
            "traffic_incidents": 8
        },
        "events": DEMO_DETECTIONS
    }

@router.get("/road-health")
def get_road_health_segments():
    """
    Returns road-segment health scores and predictive maintenance telemetry.
    """
    return {
        "status": "SUCCESS",
        "demo_mode": True,
        "note": "Prototype urban road-segment health and maintenance priority index",
        "segments": DEMO_ROAD_SEGMENTS
    }

@router.post("/work-orders/update-status")
def update_work_order_status(payload: WorkOrderStatusUpdate):
    """
    Simulates municipal repair workflow: CREATED ➔ ASSIGNED ➔ IN_PROGRESS ➔ RESOLVED
    """
    for evt in DEMO_DETECTIONS:
        if evt["event_id"] == payload.event_id:
            evt["work_order_status"] = payload.new_status
            if payload.department:
                evt["assigned_department"] = payload.department
            return {
                "status": "SUCCESS",
                "event_id": payload.event_id,
                "work_order_id": evt.get("work_order_id"),
                "new_status": payload.new_status,
                "message": f"Work order updated to {payload.new_status}."
            }
    raise HTTPException(status_code=404, detail="Detection event not found")

@router.get("/traffic-intelligence")
def get_traffic_intelligence():
    return {
        "status": "SUCCESS",
        "demo_mode": True,
        "congestion_index": "HIGH_SURGE",
        "vehicle_counts_last_hour": {
            "two_wheelers": 1420,
            "auto_rickshaws": 580,
            "four_wheelers": 1120,
            "buses_trucks": 240
        },
        "bottlenecks": [
            {"intersection": "Kathipara Junction", "density_score": 89, "avg_delay_mins": 14, "status": "CONGESTED"},
            {"intersection": "Koyambedu Roundtana", "density_score": 82, "avg_delay_mins": 11, "status": "HEAVY"},
            {"intersection": "Anna Salai Thousand Lights", "density_score": 76, "avg_delay_mins": 8, "status": "MODERATE"}
        ]
    }

from app.ml.edge_ai_simulator import edge_simulator

@router.get("/bus/BUS-104A")
def get_bus_104a_details():
    return {
        "status": "SUCCESS",
        "demo_mode": True,
        "telemetry": edge_simulator.get_bus_104a_telemetry()
    }

@router.get("/edge-metrics")
def get_edge_ai_metrics():
    return {
        "status": "SUCCESS",
        "demo_mode": True,
        "metrics": edge_simulator.get_edge_performance_report(),
        "privacy_framework": {
            "edge_privacy": "Privacy-Preserving Edge AI Architecture",
            "principles": [
                "Local On-Bus Inference: Raw video processed locally on ARM Cortex + Ampere GPU; zero continuous raw video transmission.",
                "Automated Anonymization: Pedestrian faces and private license plates blurred on evidence frames.",
                "Minimal Metadata Transmission: Only structured ~800-byte JSON event telemetry dispatched over cellular link.",
                "Data Retention Minimization: Unflagged frames discarded immediately after inference buffer cycle (99.98% discarded)."
            ]
        }
    }

# =========================================================================
# SAFETY CAMERA & CONNECTED VEHICLE BROADCAST MODULE
# =========================================================================

class SafetyCameraDetectRequest(BaseModel):
    source_type: str = "FRONT_CAMERA"  # FRONT_CAMERA, REAR_CAMERA, SIDE_CAMERA, DEVICE_CAMERA, UPLOADED_MEDIA, DEMO_FEED
    hazard_type: str = "POTHOLE"       # POTHOLE or PEDESTRIAN_DANGER
    lat: Optional[float] = 13.0067
    lng: Optional[float] = 80.2020

class BroadcastAlertRequest(BaseModel):
    incident_id: str
    hazard_type: str
    distance_meters: int = 180

SAFETY_CAMERA_INCIDENTS = [
    {
        "incident_id": "INC-2026-00421",
        "hazard_type": "POTHOLE",
        "title": "Severe Deep Asphalt Pothole",
        "confidence": 94.8,
        "severity": "HIGH",
        "civic_risk_score": 87,
        "timestamp": datetime.now().strftime("%H:%M:%S"),
        "latitude": 13.0067,
        "longitude": 80.2020,
        "location_name": "Guindy Kathipara Underpass, Chennai",
        "vehicle_id": "BUS-104A",
        "route_id": "70H (SRM ➔ Guindy ➔ T. Nagar)",
        "camera_id": "CAM-FRONT (Front Road AI Camera)",
        "bounding_box": {"x": 120, "y": 220, "width": 190, "height": 115},
        "danger_zone_active": False,
        "verification_status": "MULTI_VEHICLE_VERIFIED",
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
    }
]

@router.post("/safety-camera/detect")
def trigger_safety_camera_detection(payload: SafetyCameraDetectRequest):
    """
    Simulates real-time AI computer vision inference on safety camera feeds.
    Returns bounding box, risk score (0-100), multi-vehicle verification, and connected vehicle alerts.
    """
    now_time = datetime.now().strftime("%H:%M:%S")
    
    if payload.hazard_type.upper() == "PEDESTRIAN_DANGER":
        new_inc = {
            "incident_id": f"INC-2026-00{random.randint(425, 499)}",
            "hazard_type": "PEDESTRIAN_DANGER",
            "title": "Vulnerable Road User / Pedestrian in Road Danger Zone",
            "confidence": 96.4,
            "severity": "HIGH",
            "civic_risk_score": 91,
            "timestamp": now_time,
            "latitude": payload.lat or 13.0694,
            "longitude": payload.lng or 80.1948,
            "location_name": "Koyambedu School Approach Road, Chennai",
            "vehicle_id": "BUS-104A",
            "route_id": "70H",
            "camera_id": "CAM-FRONT (Front Road AI Camera)",
            "bounding_box": {"x": 210, "y": 170, "width": 140, "height": 165},
            "danger_zone_active": True,
            "danger_zone_note": "Pedestrian crossed active lane marker outside designated zebra crossing zone.",
            "verification_status": "HIGH_CONFIDENCE_EDGE_ALERT",
            "multi_vehicle_verification": {
                "status": "IMMEDIATE_EDGE_TRIGGER",
                "bus_count": 2,
                "verification_confidence": 96.4,
                "reporting_vehicles": [
                    {"vehicle_id": "BUS-104A", "confidence": 96.4, "delta_m": 0.0, "time_delta": "0s"},
                    {"vehicle_id": "BUS-102", "confidence": 94.1, "delta_m": 12.0, "time_delta": "+45s"}
                ]
            },
            "connected_vehicle_broadcast": {
                "alert_status": "ACTIVE_BROADCAST",
                "alert_type": "VULNERABLE_ROAD_USER_WARNING",
                "broadcast_radius_m": 250,
                "vehicles_alerted": 9,
                "caution_message": "⚠️ PEDESTRIAN DANGER AHEAD: High-risk pedestrian in roadway 120m ahead. Reduce speed and remain alert."
            },
            "work_order": {
                "created": True,
                "work_order_id": f"TN-TRAFFIC-VRU-{random.randint(100, 999)}",
                "status": "DRIVER_ALERTED",
                "department": "Greater Chennai Traffic Police (Traffic Safety Cell)"
            },
            "privacy": {
                "local_edge_inference": True,
                "metadata_only_transmitted": True,
                "privacy_masked": True,
                "face_anonymized": True
            }
        }
    else:
        # Default: POTHOLE
        new_inc = {
            "incident_id": f"INC-2026-00{random.randint(425, 499)}",
            "hazard_type": "POTHOLE",
            "title": "Severe Deep Asphalt Pothole",
            "confidence": 94.8,
            "severity": "HIGH",
            "civic_risk_score": 87,
            "timestamp": now_time,
            "latitude": payload.lat or 13.0067,
            "longitude": payload.lng or 80.2020,
            "location_name": "Guindy Kathipara Underpass, Chennai",
            "vehicle_id": "BUS-104A",
            "route_id": "70H (SRM ➔ Guindy ➔ T. Nagar)",
            "camera_id": "CAM-FRONT (Front Road AI Camera)",
            "bounding_box": {"x": 120, "y": 220, "width": 190, "height": 115},
            "danger_zone_active": False,
            "verification_status": "MULTI_VEHICLE_VERIFIED",
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
        }
    
    SAFETY_CAMERA_INCIDENTS.insert(0, new_inc)
    return {
        "status": "SUCCESS",
        "demo_mode": True,
        "inference_engine": "Prototype / Simulated Edge AI (YOLOv8s TensorRT)",
        "incident": new_inc
    }

@router.post("/safety-camera/broadcast-alert")
def broadcast_connected_vehicle_caution(payload: BroadcastAlertRequest):
    """
    Simulates V2X caution alert dispatch to nearby vehicles within alert radius.
    """
    nearby_fleet = [
        {"vehicle": "MTC Bus 70H-02", "type": "Bus", "distance_m": 120, "speed_kmh": 36, "ack_status": "RECEIVED"},
        {"vehicle": "Ambulance TN-01-G-1102", "type": "Emergency", "distance_m": 160, "speed_kmh": 48, "ack_status": "RECEIVED"},
        {"vehicle": "Chennai Cab TN-09-CB-4491", "type": "Car", "distance_m": 210, "speed_kmh": 42, "ack_status": "RECEIVED"},
        {"vehicle": "Auto TN-07-R-2210", "type": "Auto", "distance_m": 240, "speed_kmh": 28, "ack_status": "RECEIVED"},
        {"vehicle": "Delivery Van TN-02-D-9092", "type": "Van", "distance_m": 280, "speed_kmh": 33, "ack_status": "RECEIVED"},
        {"vehicle": "MTC Bus 101A-05", "type": "Bus", "distance_m": 310, "speed_kmh": 30, "ack_status": "RECEIVED"},
        {"vehicle": "Private Car TN-10-AZ-5511", "type": "Car", "distance_m": 340, "speed_kmh": 40, "ack_status": "RECEIVED"}
    ]
    
    return {
        "status": "SUCCESS",
        "demo_mode": True,
        "incident_id": payload.incident_id,
        "hazard_type": payload.hazard_type,
        "broadcast_timestamp": datetime.now().strftime("%H:%M:%S"),
        "vehicles_alerted_count": len(nearby_fleet),
        "alerted_vehicles": nearby_fleet,
        "caution_directive": f"Slow down to under 25 km/h. Hazard detected {payload.distance_meters}m ahead."
    }

@router.get("/safety-camera/recent-incidents")
def get_recent_safety_incidents():
    return {
        "status": "SUCCESS",
        "demo_mode": True,
        "count": len(SAFETY_CAMERA_INCIDENTS),
        "incidents": SAFETY_CAMERA_INCIDENTS
    }

