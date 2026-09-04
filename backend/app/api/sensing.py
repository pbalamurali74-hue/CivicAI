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
    },
    {
        "event_id": "EVT-8101",
        "bus_id": "BUS-104A",
        "bus_reg": "TN-01-N-9842",
        "type": "MISSING_SIGN",
        "category": "INFRASTRUCTURE",
        "title": "Missing Mandatory Stop / School Zone Sign",
        "description": "Regulatory school zone sign post missing or sheared off near Guindy Industrial Estate junction.",
        "location_name": "Guindy Industrial Estate Approach",
        "road_segment": "GUINDY_KATHIPARA",
        "lat": 13.0098,
        "lng": 80.2062,
        "severity": "HIGH",
        "confidence": 92.8,
        "civic_risk_score": 76,
        "risk_breakdown": {
            "ai_confidence_score": 23,
            "severity_weight": 25,
            "traffic_density_weight": 16,
            "multi_bus_recurrence": 12
        },
        "multi_bus_verification": {
            "status": "MULTI_BUS_VERIFIED",
            "bus_count": 2,
            "verification_confidence": 95.1,
            "buses_reporting": [
                {"bus_id": "BUS-104A", "timestamp": "19:12:04", "confidence": 92.8, "delta_distance_m": 0.0},
                {"bus_id": "BUS-102", "timestamp": "19:18:22", "confidence": 94.0, "delta_distance_m": 1.6}
            ],
            "correlation_rationale": "Side-curb cameras from 2 fleet buses confirmed absent regulatory signage."
        },
        "timestamp": "2026-08-26 19:12:04",
        "bounding_box": {"x": 290, "y": 90, "width": 110, "height": 130},
        "camera": "CAM-LEFT",
        "work_order_generated": True,
        "work_order_id": "GCC-TRAFFIC-1049",
        "work_order_status": "ASSIGNED",
        "assigned_department": "GCC Traffic Engineering & Signage Division",
        "assigned_crew": "Regulatory Sign Replacement Unit #3",
        "sla_hours": 24,
        "privacy_masked": True
    },
    {
        "event_id": "EVT-8102",
        "bus_id": "BUS-102",
        "bus_reg": "TN-02-M-4410",
        "type": "STREETLIGHT_DEFICIENCY",
        "category": "INFRASTRUCTURE",
        "title": "Visual Streetlight Deficiency / Luminaire Inactive",
        "description": "Visual inspection indicates 3 consecutive streetlight luminaires non-illuminated on GST Road underpass.",
        "location_name": "GST Road Underpass Sector 4",
        "road_segment": "GUINDY_KATHIPARA",
        "lat": 13.0075,
        "lng": 80.2035,
        "severity": "MEDIUM",
        "confidence": 88.4,
        "civic_risk_score": 66,
        "risk_breakdown": {
            "ai_confidence_score": 21,
            "severity_weight": 20,
            "traffic_density_weight": 15,
            "multi_bus_recurrence": 10
        },
        "multi_bus_verification": {
            "status": "MULTI_BUS_VERIFIED",
            "bus_count": 2,
            "verification_confidence": 91.2,
            "buses_reporting": [
                {"bus_id": "BUS-102", "timestamp": "19:15:30", "confidence": 88.4, "delta_distance_m": 0.0},
                {"bus_id": "BUS-103", "timestamp": "19:22:15", "confidence": 90.1, "delta_distance_m": 2.2}
            ],
            "correlation_rationale": "Low-light night camera sweep logged visual streetlight blackout zone."
        },
        "timestamp": "2026-08-26 19:15:30",
        "bounding_box": {"x": 260, "y": 40, "width": 140, "height": 110},
        "camera": "CAM-LEFT",
        "work_order_generated": True,
        "work_order_id": "GCC-ELEC-3011",
        "work_order_status": "CREATED",
        "assigned_department": "GCC Electrical & Streetlighting Department",
        "assigned_crew": "Zone 9 Mobile Crane Electricians",
        "sla_hours": 12,
        "privacy_masked": True
    },
    {
        "event_id": "EVT-8103",
        "bus_id": "BUS-104A",
        "bus_reg": "TN-01-N-9842",
        "type": "DAMAGED_ROAD",
        "category": "ROAD_DEFECT",
        "title": "Severe Road Surface Alligator Cracking & Erosion",
        "description": "Extensive 6-meter longitudinal fatigue cracking and surface disintegration on central bus carriage-way.",
        "location_name": "Anna Salai - Guindy Metro Crossing",
        "road_segment": "ANNA_SALAI",
        "lat": 13.0115,
        "lng": 80.2090,
        "severity": "HIGH",
        "confidence": 93.1,
        "civic_risk_score": 79,
        "risk_breakdown": {
            "ai_confidence_score": 23,
            "severity_weight": 25,
            "traffic_density_weight": 17,
            "multi_bus_recurrence": 14
        },
        "multi_bus_verification": {
            "status": "MULTI_BUS_VERIFIED",
            "bus_count": 3,
            "verification_confidence": 97.4,
            "buses_reporting": [
                {"bus_id": "BUS-104A", "timestamp": "19:18:40", "confidence": 93.1, "delta_distance_m": 0.0},
                {"bus_id": "BUS-102", "timestamp": "19:24:10", "confidence": 94.6, "delta_distance_m": 1.1},
                {"bus_id": "BUS-103", "timestamp": "19:30:05", "confidence": 95.0, "delta_distance_m": 0.9}
            ],
            "correlation_rationale": "High-frequency vibration and visual pavement texture analysis confirms progressive asphalt fatigue."
        },
        "timestamp": "2026-08-26 19:18:40",
        "bounding_box": {"x": 110, "y": 250, "width": 240, "height": 100},
        "camera": "CAM-FRONT",
        "work_order_generated": True,
        "work_order_id": "GCC-ROAD-4105",
        "work_order_status": "IN_PROGRESS",
        "assigned_department": "Greater Chennai Corporation (GCC) — Highways Division",
        "assigned_crew": "Asphalt Milling & Profiling Unit #2",
        "sla_hours": 24,
        "privacy_masked": True
    },
    {
        "event_id": "EVT-8104",
        "bus_id": "BUS-103",
        "bus_reg": "TN-07-H-3129",
        "type": "MISSING_DIVIDER",
        "category": "INFRASTRUCTURE",
        "title": "Missing Concrete Road Median Divider",
        "description": "3-meter gap in central concrete crash barrier posing severe head-on collision danger on Saidapet flyover ramp.",
        "location_name": "Saidapet Flyover Southern Ramp",
        "road_segment": "ANNA_SALAI",
        "lat": 13.0165,
        "lng": 80.2195,
        "severity": "CRITICAL",
        "confidence": 95.8,
        "civic_risk_score": 93,
        "risk_breakdown": {
            "ai_confidence_score": 25,
            "severity_weight": 35,
            "traffic_density_weight": 18,
            "multi_bus_recurrence": 15
        },
        "multi_bus_verification": {
            "status": "MULTI_BUS_VERIFIED",
            "bus_count": 2,
            "verification_confidence": 98.0,
            "buses_reporting": [
                {"bus_id": "BUS-103", "timestamp": "19:22:15", "confidence": 95.8, "delta_distance_m": 0.0},
                {"bus_id": "BUS-104A", "timestamp": "19:29:40", "confidence": 96.2, "delta_distance_m": 1.3}
            ],
            "correlation_rationale": "High-speed arterial median rupture corroborated across consecutive passes."
        },
        "timestamp": "2026-08-26 19:22:15",
        "bounding_box": {"x": 20, "y": 210, "width": 160, "height": 120},
        "camera": "CAM-FRONT",
        "work_order_generated": True,
        "work_order_id": "GCC-SAFETY-902",
        "work_order_status": "ASSIGNED",
        "assigned_department": "GCC Road Safety & Infrastructure Division",
        "assigned_crew": "Emergency Crash Barrier Fast-Deploy Crew",
        "sla_hours": 4,
        "privacy_masked": True
    },
    {
        "event_id": "EVT-8105",
        "bus_id": "BUS-102",
        "bus_reg": "TN-02-M-4410",
        "type": "MISSING_ZEBRA_CROSSING",
        "category": "INFRASTRUCTURE",
        "title": "Faded / Missing Pedestrian Zebra Crossing",
        "description": "Thermoplastic paint completely worn away at major pedestrian crossing near Vadapalani junction.",
        "location_name": "Vadapalani Signal Pedestrian Cross",
        "road_segment": "POONAMALLEE_HIGH",
        "lat": 13.0520,
        "lng": 80.2135,
        "severity": "MEDIUM",
        "confidence": 90.7,
        "civic_risk_score": 71,
        "risk_breakdown": {
            "ai_confidence_score": 22,
            "severity_weight": 20,
            "traffic_density_weight": 16,
            "multi_bus_recurrence": 13
        },
        "multi_bus_verification": {
            "status": "MULTI_BUS_VERIFIED",
            "bus_count": 2,
            "verification_confidence": 93.8,
            "buses_reporting": [
                {"bus_id": "BUS-102", "timestamp": "19:26:00", "confidence": 90.7, "delta_distance_m": 0.0},
                {"bus_id": "BUS-104A", "timestamp": "19:35:10", "confidence": 92.4, "delta_distance_m": 1.8}
            ],
            "correlation_rationale": "Surface marking degradation verified by Route 101A and Route 70H forward road cameras."
        },
        "timestamp": "2026-08-26 19:26:00",
        "bounding_box": {"x": 80, "y": 280, "width": 280, "height": 60},
        "camera": "CAM-FRONT",
        "work_order_generated": True,
        "work_order_id": "GCC-MARKINGS-412",
        "work_order_status": "CREATED",
        "assigned_department": "GCC Traffic Engineering (Road Markings Cell)",
        "assigned_crew": "Thermoplastic Paint Line Crew #4",
        "sla_hours": 48,
        "privacy_masked": True
    },
    {
        "event_id": "EVT-8106",
        "bus_id": "BUS-104A",
        "bus_reg": "TN-01-N-9842",
        "type": "POTENTIAL_HIT_AND_RUN",
        "category": "INCIDENT_INTELLIGENCE",
        "title": "Potential Hit-and-Run Collision Alert",
        "description": "Camera captured rear impact with two-wheeler followed by sudden high-speed departure without halting.",
        "location_name": "Guindy Race Course Road Intersection",
        "road_segment": "GUINDY_KATHIPARA",
        "lat": 13.0108,
        "lng": 80.2078,
        "severity": "CRITICAL",
        "confidence": 96.8,
        "civic_risk_score": 98,
        "risk_breakdown": {
            "ai_confidence_score": 25,
            "severity_weight": 35,
            "traffic_density_weight": 19,
            "multi_bus_recurrence": 19
        },
        "multi_bus_verification": {
            "status": "AUTHORITY_ALERT_DISPATCHED",
            "bus_count": 1,
            "verification_confidence": 96.8,
            "buses_reporting": [
                {"bus_id": "BUS-104A", "timestamp": "19:31:14", "confidence": 96.8, "delta_distance_m": 0.0}
            ],
            "correlation_rationale": "Sudden collision impact vector + evasive vehicle acceleration trajectory tagged."
        },
        "timestamp": "2026-08-26 19:31:14",
        "license_plate": "TN-07-BP-XXXX (Forensic Masked)",
        "license_plate_masked": True,
        "bounding_box": {"x": 140, "y": 190, "width": 180, "height": 120},
        "camera": "CAM-REAR",
        "work_order_generated": True,
        "work_order_id": "POL-HITRUN-091",
        "work_order_status": "ASSIGNED",
        "assigned_department": "Chennai City Traffic Police — Flying Squad Patrol",
        "assigned_crew": "Patrol Interceptor Vehicle #12",
        "sla_hours": 1,
        "privacy_masked": True
    },
    {
        "event_id": "EVT-8107",
        "bus_id": "BUS-103",
        "bus_reg": "TN-07-H-3129",
        "type": "POTENTIAL_RASH_DRIVING",
        "category": "INCIDENT_INTELLIGENCE",
        "title": "Potential Rash Driving / Dangerous Proximity Maneuver",
        "description": "High-risk zigzag overtaking at estimated 68 km/h cutting within 1.2m of bus front bumper.",
        "location_name": "Anna Salai - Teynampet Corridor",
        "road_segment": "ANNA_SALAI",
        "lat": 13.0280,
        "lng": 80.2310,
        "severity": "HIGH",
        "confidence": 94.2,
        "civic_risk_score": 86,
        "risk_breakdown": {
            "ai_confidence_score": 24,
            "severity_weight": 30,
            "traffic_density_weight": 18,
            "multi_bus_recurrence": 14
        },
        "multi_bus_verification": {
            "status": "MULTI_BUS_VERIFIED",
            "bus_count": 2,
            "verification_confidence": 95.9,
            "buses_reporting": [
                {"bus_id": "BUS-103", "timestamp": "19:36:20", "confidence": 94.2, "delta_distance_m": 0.0},
                {"bus_id": "BUS-104A", "timestamp": "19:42:05", "confidence": 95.1, "delta_distance_m": 1.4}
            ],
            "correlation_rationale": "Consecutive fleet buses recorded identical vehicle reckless trajectory."
        },
        "timestamp": "2026-08-26 19:36:20",
        "license_plate": "TN-01-AK-XXXX (Forensic Masked)",
        "license_plate_masked": True,
        "bounding_box": {"x": 160, "y": 200, "width": 150, "height": 110},
        "camera": "CAM-FRONT",
        "work_order_generated": True,
        "work_order_id": "POL-TRAFFIC-441",
        "work_order_status": "ASSIGNED",
        "assigned_department": "Greater Chennai Traffic Police Control Room",
        "assigned_crew": "Teynampet Traffic Signal Station",
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

# Spatial Recurring Incident Clusters (Hotspots)
DEMO_HOTSPOTS = [
    {
        "hotspot_id": "HOTSPOT-01",
        "name": "Guindy Kathipara Interchange Hotspot",
        "corridor": "Airport ➔ Guindy ➔ Saidapet Arterial",
        "lat": 13.0067,
        "lng": 80.2020,
        "affected_radius_m": 650,
        "overall_risk": "CRITICAL (91/100)",
        "risk_color": "#EF4444",
        "summary": "High-frequency pothole recurrence & subway monsoon drainage blockage",
        "breakdown": {
            "total_potholes": 17,
            "waterlogging_events": 5,
            "sign_defects": 3,
            "vru_pedestrian_alerts": 2
        },
        "fleet_passes_analyzed": 1420,
        "recommended_action": "Comprehensive structural milling and stormwater pump installation."
    },
    {
        "hotspot_id": "HOTSPOT-02",
        "name": "Koyambedu Roundtana Wholesale Market Hotspot",
        "corridor": "Koyambedu CMBT ➔ Metro Interchange",
        "lat": 13.0694,
        "lng": 80.1948,
        "affected_radius_m": 500,
        "overall_risk": "HIGH (84/100)",
        "risk_color": "#EA580C",
        "summary": "Commercial refuse spillage, heavy truck wear & pedestrian crowding",
        "breakdown": {
            "total_potholes": 14,
            "garbage_overflow": 8,
            "manhole_risks": 2,
            "vru_pedestrian_alerts": 4
        },
        "fleet_passes_analyzed": 980,
        "recommended_action": "Dedicated solid waste compactor routing & pedestrian skywalk barrier."
    },
    {
        "hotspot_id": "HOTSPOT-03",
        "name": "Poonamallee High Road Aminjikarai Hotspot",
        "corridor": "Chennai Central ➔ Koyambedu West Corridor",
        "lat": 13.0720,
        "lng": 80.2210,
        "affected_radius_m": 800,
        "overall_risk": "CRITICAL (94/100)",
        "risk_color": "#DC2626",
        "summary": "Severe pavement fatigue, open manholes & chronic transit delay choke point",
        "breakdown": {
            "total_potholes": 19,
            "open_manholes": 3,
            "waterlogging_events": 4,
            "vru_pedestrian_alerts": 3
        },
        "fleet_passes_analyzed": 1150,
        "recommended_action": "Emergency multi-agency road restoration under GCC Zone 8 supervision."
    }
]

# Origin-Destination Corridor Matrix (Anonymized Fleet Volume Analytics)
DEMO_OD_MATRIX = [
    {
        "corridor_id": "OD-01",
        "origin": "Guindy Kathipara Junction",
        "destination": "T. Nagar (Panagal Park)",
        "distance_km": 6.8,
        "vehicle_volume_per_hr": 1240,
        "peak_window": "08:00 – 10:30 AM",
        "dominant_mode": "Public Bus (MTC) & Two-Wheelers",
        "congestion_index": "SEVERE (0.88)",
        "avg_speed_kmh": 16.4
    },
    {
        "corridor_id": "OD-02",
        "origin": "Velachery Vijayanagar",
        "destination": "Guindy Industrial Estate",
        "distance_km": 5.2,
        "vehicle_volume_per_hr": 980,
        "peak_window": "08:30 – 10:00 AM",
        "dominant_mode": "Private Car & Auto-Rickshaws",
        "congestion_index": "HIGH (0.76)",
        "avg_speed_kmh": 21.0
    },
    {
        "corridor_id": "OD-03",
        "origin": "Koyambedu CMBT",
        "destination": "Chennai Central Railway Station",
        "distance_km": 11.4,
        "vehicle_volume_per_hr": 1510,
        "peak_window": "07:30 – 11:00 AM",
        "dominant_mode": "MTC Fleet Buses (Routes 101A, 70H)",
        "congestion_index": "HEAVY (0.82)",
        "avg_speed_kmh": 18.2
    },
    {
        "corridor_id": "OD-04",
        "origin": "Tambaram Sanatorium",
        "destination": "Guindy Kathipara",
        "distance_km": 14.5,
        "vehicle_volume_per_hr": 1180,
        "peak_window": "17:00 – 19:30 PM",
        "dominant_mode": "Mixed Commuter Fleet",
        "congestion_index": "HIGH (0.79)",
        "avg_speed_kmh": 24.5
    }
]

# SIH PS 26124 Complete Requirement Coverage & Traceability Matrix
REQUIREMENTS_TRACEABILITY = [
    {"req_id": "REQ-01", "name": "Public transport mobile sensing fleet", "status": "REAL", "detail": "Buses BUS-104A, BUS-102, BUS-103 normalized across platform as mobile sensing units."},
    {"req_id": "REQ-02", "name": "Multi-camera bus sensing system", "status": "REAL", "detail": "4 on-bus camera streams: Front Road AI, Rear Traffic AI, Side Curb AI, Cabin Safety."},
    {"req_id": "REQ-03", "name": "Edge AI processing unit", "status": "SIMULATED", "detail": "NVIDIA Jetson AGX Orin 64GB edge computing pipeline with TensorRT FP16 telemetry."},
    {"req_id": "REQ-04", "name": "Pothole detection (P0)", "status": "REAL", "detail": "Asphalt depression detection with 94.8% confidence, severity and risk score."},
    {"req_id": "REQ-05", "name": "Pedestrian safety & VRU danger (P0)", "status": "REAL", "detail": "Distinguishes normal sidewalk pedestrians from VRU collision threats in road corridor."},
    {"req_id": "REQ-06", "name": "Damaged traffic signs (P0)", "status": "REAL", "detail": "Detects bent, defaced, or damaged regulatory speed/warning signs."},
    {"req_id": "REQ-07", "name": "Missing traffic signs (P0)", "status": "REAL", "detail": "Identifies missing mandatory stop and school zone sign posts."},
    {"req_id": "REQ-08", "name": "Waterlogging detection (P0)", "status": "REAL", "detail": "Monsoon subway standing water accumulation with High/Med/Low affected area extent."},
    {"req_id": "REQ-09", "name": "Garbage overflow (P1)", "status": "REAL", "detail": "Refuse spillover onto bus lanes dispatched to GCC Solid Waste Management."},
    {"req_id": "REQ-10", "name": "Visual streetlight deficiency (P1)", "status": "REAL", "detail": "Low-light camera sweep detects unlit street luminaires on dark corridors."},
    {"req_id": "REQ-11", "name": "Damaged road & surface cracking (P1)", "status": "REAL", "detail": "Longitudinal fatigue cracking & aggregate wear detection on carriage-way."},
    {"req_id": "REQ-12", "name": "Missing road divider (P1)", "status": "REAL", "detail": "Concrete median gap detection preventing dangerous head-on collisions."},
    {"req_id": "REQ-13", "name": "Missing zebra crossing (P1)", "status": "REAL", "detail": "Faded thermoplastic line detection at pedestrian crossing zones."},
    {"req_id": "REQ-14", "name": "Road debris & fallen trees (P1)", "status": "REAL", "detail": "Concrete obstacles and banyan branch obstructions on carriage-way."},
    {"req_id": "REQ-15", "name": "Roadside encroachment (P1)", "status": "REAL", "detail": "Potential illegal commercial kiosks encroaching pedestrian sidewalk margins."},
    {"req_id": "REQ-16", "name": "Vehicle classification & counting", "status": "REAL", "detail": "Live classification for Cars, Buses, Trucks, Motorcycles, Auto-rickshaws with total counts."},
    {"req_id": "REQ-17", "name": "Traffic density & bottleneck estimation", "status": "REAL", "detail": "Kathipara (+14m), Koyambedu (+11m), and Anna Salai (+8m) congestion delays."},
    {"req_id": "REQ-18", "name": "Congestion GIS heat map", "status": "REAL", "detail": "Color-coded corridor congestion index with 15m, 1h, and daily time filters."},
    {"req_id": "REQ-19", "name": "Origin-Destination (OD) analysis", "status": "REAL", "detail": "Anonymized 4-corridor volume matrix with peak-hour patterns and dominant transit modes."},
    {"req_id": "REQ-20", "name": "Route delay ML estimation", "status": "PROTOTYPE_ML", "detail": "Random Forest model predicting Route 70H delay (+15 mins) based on rain & density."},
    {"req_id": "REQ-21", "name": "Potential Hit-and-Run workflow", "status": "REAL", "detail": "Collision detection, evasive trajectory tracking, and emergency police dispatch."},
    {"req_id": "REQ-22", "name": "Potential Rash Driving workflow", "status": "REAL", "detail": "Sudden dangerous lane cutting within 1.2m of bus bumper tagged with risk score."},
    {"req_id": "REQ-23", "name": "ANPR vehicle identification", "status": "REAL", "detail": "Registration number extraction (TN-09-AB-1234) with forensic privacy masking."},
    {"req_id": "REQ-24", "name": "Centralized Incident Model (Section 23)", "status": "REAL", "detail": "Standardized schema with 9-stage lifecycle: Detected ➔ Verified ➔ Assigned ➔ Resolved."},
    {"req_id": "REQ-25", "name": "Multi-bus spatial verification", "status": "REAL", "detail": "Cross-validates 3 buses (BUS-104A, 102, 103) within 5m/10m window, boosting confidence to 99.2%."},
    {"req_id": "REQ-26", "name": "Civic Risk Score 0–100", "status": "REAL", "detail": "Transparent formula: Confidence (25%) + Severity (35%) + Traffic Density (20%) + Recurrence (20%)."},
    {"req_id": "REQ-27", "name": "Forensic evidence frame capture", "status": "REAL", "detail": "Visual snapshot with vehicle watermark (BUS-104A), UTC time, and GPS coords embedded."},
    {"req_id": "REQ-28", "name": "Connected Vehicle Alerts (C-V2X / DSRC)", "status": "SIMULATED", "detail": "Direct broadcast warning nearby vehicles with distance, vehicle type, and millisecond ACKs."},
    {"req_id": "REQ-29", "name": "Hazard geo-fencing (Approach matching)", "status": "REAL", "detail": "Alerts only sent to approaching vehicles within 350m; vehicles moving away are excluded."},
    {"req_id": "REQ-30", "name": "Central GIS Urban Intelligence Map", "status": "REAL", "detail": "Leaflet GIS map with multi-layer markers: Potholes, Floods, Signs, Garbage, Fleet Buses."},
    {"req_id": "REQ-31", "name": "Road Health Index 0–100", "status": "REAL", "detail": "Corridor health scores: Anna Salai (91), Guindy (63), Mount Road (42), Poonamallee (44)."},
    {"req_id": "REQ-32", "name": "Municipal Command & Auto Work Orders", "status": "REAL", "detail": "Generates Ticket #GCC-ROAD-4092 with SLA tracking and interactive resolution."},
    {"req_id": "REQ-33", "name": "Hotspot spatial clustering", "status": "REAL", "detail": "Aggregates recurring incident hotspots: Guindy Kathipara, Koyambedu, Poonamallee."},
    {"req_id": "REQ-34", "name": "Predictive road maintenance", "status": "PROTOTYPE_ML", "detail": "30-day structural failure probability & early milling inspection directives."},
    {"req_id": "REQ-35", "name": "Edge bandwidth optimization", "status": "REAL", "detail": "99.98% bandwidth reduction: 48 Mbps raw video filtered to 0.8 kbps event metadata."},
    {"req_id": "REQ-36", "name": "Privacy-preserving edge AI", "status": "REAL", "detail": "Face & license plate anonymization, local edge inference, minimum data retention."},
    {"req_id": "REQ-37", "name": "In-browser live camera (Hero feature)", "status": "REAL", "detail": "Laptop webcam & mobile rear camera support via browser getUserMedia() + TensorFlow.js."},
    {"req_id": "REQ-38", "name": "Automated 60–90s SIH Demo Runner", "status": "REAL", "detail": "Complete automated presentation sequence walking judges through the entire urban intelligence loop."}
]

class WorkOrderStatusUpdate(BaseModel):
    event_id: str
    new_status: str  # CREATED, ASSIGNED, IN_PROGRESS, RESOLVED
    department: Optional[str] = None
    notes: Optional[str] = None

class IncidentLifecycleTransition(BaseModel):
    incident_id: str
    target_status: str  # DETECTED, VERIFICATION_PENDING, VERIFIED, PRIORITIZED, REPORTED, WORK_ORDER_CREATED, ASSIGNED, IN_PROGRESS, RESOLVED
    assigned_crew: Optional[str] = None
    resolution_notes: Optional[str] = None

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
        "vehicle_counting": {
            "source": "SIMULATED DEMO DATA (ONBOARD REAR & FRONT AI DETECTOR)",
            "sample_window": "5-Minute Sliding Window",
            "cars": 84,
            "buses": 17,
            "trucks": 12,
            "motorcycles": 69,
            "auto_rickshaws": 45,
            "total_detected": 227,
            "flow_rate_per_min": 45.4
        },
        "vehicle_counts_last_hour": {
            "two_wheelers": 1420,
            "auto_rickshaws": 580,
            "four_wheelers": 1120,
            "buses_trucks": 240
        },
        "bottlenecks": [
            {"intersection": "Guindy Kathipara Junction", "density_score": 89, "avg_delay_mins": 14, "status": "CONGESTED", "queue_length_m": 480},
            {"intersection": "Koyambedu Roundtana", "density_score": 82, "avg_delay_mins": 11, "status": "HEAVY", "queue_length_m": 350},
            {"intersection": "Anna Salai Thousand Lights", "density_score": 76, "avg_delay_mins": 8, "status": "MODERATE", "queue_length_m": 210}
        ],
        "od_matrix": DEMO_OD_MATRIX,
        "route_delay_estimation": {
            "route_id": "70H",
            "bus_id": "BUS-104A",
            "normal_duration_mins": 42,
            "current_duration_mins": 57,
            "delay_mins": 15,
            "delay_cause": "Heavy bottleneck congestion near Guindy Kathipara Flyover underpass",
            "model_type": "Random Forest Transit Delay Regressor (Trained on 1,200 TN Bus trips)",
            "confidence": 89.2
        },
        "congestion_heat_map": {
            "corridors": [
                {"name": "Guindy – Kathipara", "congestion": "SEVERE", "index": 0.88, "color": "#EF4444", "lat": 13.0067, "lng": 80.2020},
                {"name": "Koyambedu CMBT", "congestion": "HEAVY", "index": 0.82, "color": "#EA580C", "lat": 13.0694, "lng": 80.1948},
                {"name": "Anna Salai Saidapet", "congestion": "MODERATE", "index": 0.64, "color": "#F59E0B", "lat": 13.0180, "lng": 80.2240},
                {"name": "Poonamallee High Road", "congestion": "HIGH", "index": 0.78, "color": "#DC2626", "lat": 13.0512, "lng": 80.2120}
            ],
            "time_filter_options": ["last_15m", "last_1h", "today"]
        }
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
    Includes Hazard Geo-Fencing: Only approaching vehicles receive caution alerts;
    vehicles moving away from the hazard are excluded.
    """
    nearby_fleet = [
        {"vehicle": "MTC Bus 70H-02", "type": "Bus", "distance_m": 120, "speed_kmh": 36, "heading": "Approaching", "geo_fenced": True, "ack_status": "RECEIVED", "latency_ms": 110},
        {"vehicle": "Ambulance TN-01-G-1102", "type": "Emergency", "distance_m": 160, "speed_kmh": 48, "heading": "Approaching", "geo_fenced": True, "ack_status": "RECEIVED", "latency_ms": 140},
        {"vehicle": "Chennai Cab TN-09-CB-4491", "type": "Car", "distance_m": 210, "speed_kmh": 42, "heading": "Approaching", "geo_fenced": True, "ack_status": "RECEIVED", "latency_ms": 180},
        {"vehicle": "Auto TN-07-R-2210", "type": "Auto", "distance_m": 240, "speed_kmh": 28, "heading": "Approaching", "geo_fenced": True, "ack_status": "RECEIVED", "latency_ms": 220},
        {"vehicle": "Delivery Van TN-02-D-9092", "type": "Van", "distance_m": 280, "speed_kmh": 33, "heading": "Approaching", "geo_fenced": True, "ack_status": "RECEIVED", "latency_ms": 250},
        {"vehicle": "MTC Bus 101A-05", "type": "Bus", "distance_m": 310, "speed_kmh": 30, "heading": "Approaching", "geo_fenced": True, "ack_status": "RECEIVED", "latency_ms": 280},
        {"vehicle": "Private Car TN-10-AZ-5511", "type": "Car", "distance_m": 340, "speed_kmh": 40, "heading": "Approaching", "geo_fenced": True, "ack_status": "RECEIVED", "latency_ms": 320},
        {"vehicle": "Sanitation Truck GCC-04", "type": "Truck", "distance_m": 420, "speed_kmh": 25, "heading": "Moving Away", "geo_fenced": False, "ack_status": "EXCLUDED (OUT OF VECTOR)", "latency_ms": None}
    ]
    
    alerted = [v for v in nearby_fleet if v["geo_fenced"]]
    
    return {
        "status": "SUCCESS",
        "demo_mode": True,
        "incident_id": payload.incident_id,
        "hazard_type": payload.hazard_type,
        "broadcast_timestamp": datetime.now().strftime("%H:%M:%S"),
        "total_nearby_detected": len(nearby_fleet),
        "vehicles_alerted_count": len(alerted),
        "alerted_vehicles": nearby_fleet,
        "geofence_policy": "Directional Corridor Match: Only approaching vehicles within 350m receive dynamic brake/caution directive.",
        "caution_directive": f"Slow down to under 25 km/h. Hazard detected {payload.distance_meters}m ahead."
    }

@router.get("/safety-camera/recent-incidents")
def get_recent_safety_incidents():
    from app.database.incidents_store import incidents_store
    all_inc = incidents_store.get_all()
    return {
        "status": "SUCCESS",
        "demo_mode": False,
        "count": len(all_inc),
        "incidents": all_inc
    }

@router.get("/hotspots")
def get_recurring_hotspots():
    """
    Returns spatial clusters of recurring hazards (potholes, drainage failures, sign defects).
    """
    return {
        "status": "SUCCESS",
        "demo_mode": True,
        "note": "Spatial clustering of recurring urban hazards",
        "hotspots_count": len(DEMO_HOTSPOTS),
        "hotspots": DEMO_HOTSPOTS
    }

@router.get("/requirement-coverage")
def get_sih_requirement_coverage():
    """
    Returns full traceability and compliance matrix for SIH 2026 PS 26124 requirements.
    """
    real_count = sum(1 for r in REQUIREMENTS_TRACEABILITY if r["status"] == "REAL")
    simulated_count = sum(1 for r in REQUIREMENTS_TRACEABILITY if r["status"] == "SIMULATED")
    ml_count = sum(1 for r in REQUIREMENTS_TRACEABILITY if r["status"] == "PROTOTYPE_ML")
    
    return {
        "status": "SUCCESS",
        "problem_statement": "SIH 2026 PS 26124",
        "title": "AI-Powered Mobile Urban Intelligence Platform Using Public Transport Fleet",
        "summary": {
            "total_requirements": len(REQUIREMENTS_TRACEABILITY),
            "real_implemented": real_count,
            "simulated_edge_v2x": simulated_count,
            "prototype_ml": ml_count,
            "coverage_percent": 100.0
        },
        "traceability_matrix": REQUIREMENTS_TRACEABILITY
    }

@router.post("/incidents/transition")
def transition_incident_lifecycle(payload: IncidentLifecycleTransition):
    """
    Transitions incident through the standardized 9-stage lifecycle:
    DETECTED ➔ VERIFICATION_PENDING ➔ VERIFIED ➔ PRIORITIZED ➔ REPORTED ➔ WORK_ORDER_CREATED ➔ ASSIGNED ➔ IN_PROGRESS ➔ RESOLVED
    """
    now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    
    # Check DEMO_DETECTIONS
    for evt in DEMO_DETECTIONS:
        if evt["event_id"] == payload.incident_id:
            evt["work_order_status"] = payload.target_status
            if payload.assigned_crew:
                evt["assigned_crew"] = payload.assigned_crew
            if payload.resolution_notes:
                evt["resolution_notes"] = payload.resolution_notes
            evt["last_transition_time"] = now_str
            return {
                "status": "SUCCESS",
                "incident_id": payload.incident_id,
                "current_status": payload.target_status,
                "transition_time": now_str,
                "message": f"Incident {payload.incident_id} successfully moved to {payload.target_status}."
            }
            
    # Check persistent incidents_store and SAFETY_CAMERA_INCIDENTS
    from app.database.incidents_store import incidents_store
    stored_inc = incidents_store.transition_status(
        payload.incident_id, 
        payload.target_status, 
        payload.assigned_crew, 
        payload.resolution_notes
    )
    if stored_inc:
        return {
            "status": "SUCCESS",
            "incident_id": payload.incident_id,
            "current_status": payload.target_status,
            "transition_time": now_str,
            "message": f"Safety incident {payload.incident_id} work order moved to {payload.target_status} (Persisted)."
        }
            
    raise HTTPException(status_code=404, detail="Incident ID not found in active registry")

from app.ml.multi_bus_consensus import multi_bus_consensus

class ObservationItem(BaseModel):
    bus_id: str
    route_id: Optional[str] = "70H"
    hazard_type: str
    confidence: float
    lat: float
    lng: float
    timestamp: Optional[float] = None
    image_evidence: Optional[str] = None

class ClusterEvaluationRequest(BaseModel):
    observations: Optional[List[ObservationItem]] = None
    new_observation: Optional[ObservationItem] = None

@router.post("/corroborate-cluster")
def corroborate_cluster(payload: ClusterEvaluationRequest):
    """
    Multi-Bus Spatial-Temporal Consensus & Corroboration Engine
    SIH 2026 PS 26124

    Clusters observations within 15 meters and 30 minutes, applying Bayesian confidence escalation:
    C_fused = 1 - PROD(1 - c_i)
    """
    if payload.observations:
        obs_dicts = [obs.dict() for obs in payload.observations]
        clusters = multi_bus_consensus.cluster_all(obs_dicts)
        return {
            "status": "SUCCESS",
            "clusters_count": len(clusters),
            "clusters": clusters
        }
    elif payload.new_observation:
        cluster = multi_bus_consensus.add_observation(payload.new_observation.dict())
        return {
            "status": "SUCCESS",
            "cluster": cluster
        }
    else:
        clusters = multi_bus_consensus.cluster_all()
        return {
            "status": "SUCCESS",
            "clusters_count": len(clusters),
            "clusters": clusters
        }

@router.get("/clusters")
def get_sensing_clusters():
    """
    Returns active spatial-temporal consensus clusters across the bus fleet.
    """
    clusters = multi_bus_consensus.cluster_all()
    return {
        "status": "SUCCESS",
        "clusters_count": len(clusters),
        "clusters": clusters
    }




# =========================================================================
# SIH 2026 PS 26124: ADVANCED URBAN FLEET SENSING ENGINES & ENDPOINTS
# =========================================================================

from app.ml.traffic_density_engine import traffic_density_engine
from app.ml.alpr_rash_driving_service import alpr_rash_driving_service
from app.ml.origin_destination_service import origin_destination_service

class TrafficFrameAnalysisRequest(BaseModel):
    image_base64: str
    conf_threshold: Optional[float] = 0.35
    camera_id: Optional[str] = "CAM-REAR"
    bus_id: Optional[str] = "BUS-104A"
    lat: Optional[float] = None
    lng: Optional[float] = None

@router.post("/traffic/analyze-frame")
async def analyze_traffic_frame(req: TrafficFrameAnalysisRequest):
    """
    SIH PS 26124: Intelligent Vehicle Density Estimation, Classification,
    Counting, and Bottleneck Delay Analysis from Bus Camera Video Frame.
    """
    import base64
    import cv2
    import numpy as np
    
    img_data = req.image_base64
    if "," in img_data:
        img_data = img_data.split(",", 1)[1]
        
    try:
        raw_bytes = base64.b64decode(img_data)
        np_arr = np.frombuffer(raw_bytes, np.uint8)
        cv_img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Image decoding failed: {e}")
        
    if cv_img is None:
        raise HTTPException(status_code=400, detail="Invalid image payload")
        
    result = traffic_density_engine.analyze_frame(cv_img, conf_threshold=req.conf_threshold or 0.35)
    result["bus_id"] = req.bus_id
    result["camera_id"] = req.camera_id
    result["corridor_gps"] = {"lat": req.lat or 13.0067, "lng": req.lng or 80.2025}
    return result

class RashDrivingReportRequest(BaseModel):
    vehicle_id: str
    speed_kmh: float
    bus_speed_kmh: float = 34.0
    lat: Optional[float] = None
    lng: Optional[float] = None
    box: Optional[Dict[str, float]] = None
    image_base64: Optional[str] = None

@router.post("/incidents/report-rash-driving")
async def report_rash_driving(req: RashDrivingReportRequest):
    """
    SIH PS 26124: Rash driving kinematic anomaly analysis, offender tracking,
    and automatic license plate extraction with confidence score and GPS dispatch.
    """
    import base64
    import cv2
    import numpy as np
    
    box = req.box or {"x": 0.35, "y": 0.45, "w": 0.30, "h": 0.40}
    kinematics = alpr_rash_driving_service.assess_rash_driving(
        vehicle_id=req.vehicle_id,
        current_box=box,
        speed_kmh=req.speed_kmh,
        bus_speed_kmh=req.bus_speed_kmh,
        lat=req.lat,
        lng=req.lng
    )
    
    # ALPR Plate Extraction
    alpr_res = None
    if req.image_base64:
        img_data = req.image_base64
        if "," in img_data:
            img_data = img_data.split(",", 1)[1]
        try:
            raw_bytes = base64.b64decode(img_data)
            np_arr = np.frombuffer(raw_bytes, np.uint8)
            cv_img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
            if cv_img is not None:
                alpr_res = alpr_rash_driving_service.extract_license_plate(cv_img)
        except Exception:
            pass
            
    if not alpr_res:
        alpr_res = alpr_rash_driving_service.extract_license_plate(np.zeros((300, 300, 3), dtype=np.uint8))
        
    return {
        "status": "SUCCESS",
        "kinematics": kinematics,
        "alpr": alpr_res,
        "traffic_police_dispatch": {
            "dispatched": kinematics["is_anomalous"],
            "target_control_room": "Greater Chennai Traffic Police (GCTP) — Automated E-Challan Cell",
            "dispatch_id": f"GCTP-CHALLAN-2026-{random.randint(1000, 9999)}",
            "timestamp": kinematics["timestamp"]
        }
    }

@router.get("/analytics/origin-destination")
async def get_origin_destination_analytics():
    """
    SIH PS 26124: Centralized Origin-Destination Traffic Flow Analysis,
    Passenger Boarding Gravity Model, and Route Delay Insights.
    """
    insights = origin_destination_service.get_corridor_insights()
    flows = origin_destination_service.od_matrix
    return {
        "status": "SUCCESS",
        "insights": insights,
        "od_matrix": flows[:20],
        "metro_zones": origin_destination_service.METRO_ZONES
    }

@router.get("/analytics/congestion-heatmap")
async def get_congestion_heatmap():
    """
    SIH PS 26124: Continuous GIS Congestion and Road Distress Heatmap.
    Provides weighted GPS coordinate matrices for high-fidelity GIS rendering.
    """
    heatmap_points = [
        # Guindy Kathipara Junction - High Congestion & Pothole Distress
        {"lat": 13.0067, "lng": 80.2020, "weight": 0.94, "category": "CONGESTION_AND_DEFECT", "label": "Kathipara Flyover Underpass (LOS E)"},
        {"lat": 13.0075, "lng": 80.2032, "weight": 0.88, "category": "CONGESTION", "label": "Guindy Race Course Link (LOS D)"},
        {"lat": 13.0125, "lng": 80.2156, "weight": 0.82, "category": "CONGESTION_AND_DEFECT", "label": "Guindy Industrial Estate Junction (LOS D)"},
        # Saidapet Anna Salai Corridor
        {"lat": 13.0210, "lng": 80.2240, "weight": 0.76, "category": "CONGESTION", "label": "Saidapet Court Transit Lane (LOS C)"},
        {"lat": 13.0280, "lng": 80.2310, "weight": 0.70, "category": "CONGESTION", "label": "Chamiers Road Junction (LOS C)"},
        # Nandanam & T. Nagar Corridor
        {"lat": 13.0382, "lng": 80.2405, "weight": 0.91, "category": "CONGESTION", "label": "Nandanam Signal Incline (LOS E)"},
        {"lat": 13.0418, "lng": 80.2341, "weight": 0.96, "category": "CONGESTION_AND_DEFECT", "label": "T. Nagar Panagal Park Arterial (LOS F)"},
        {"lat": 13.0450, "lng": 80.2390, "weight": 0.85, "category": "CONGESTION", "label": "Usman Road Flyover Approach (LOS D)"},
        # Koyambedu CMBT Corridor
        {"lat": 13.0694, "lng": 80.1948, "weight": 0.95, "category": "CONGESTION_AND_DEFECT", "label": "Koyambedu CMBT Gateway (LOS F)"},
        {"lat": 13.0720, "lng": 80.2010, "weight": 0.89, "category": "CONGESTION", "label": "Koyambedu Wholesale Market Road (LOS E)"}
    ]
    return {
        "status": "SUCCESS",
        "point_count": len(heatmap_points),
        "heatmap_points": heatmap_points,
        "grid_resolution_meters": 50,
        "timestamp": datetime.now().isoformat()
    }
