from fastapi import APIRouter
import random
from datetime import datetime

router = APIRouter(prefix="/api/sensing", tags=["SIH PS 26124 Fleet Sensing"])

DEMO_BUSES = [
    {
        "bus_id": "BUS-101",
        "reg_number": "TN-01-N-9842",
        "route_code": "70H",
        "route_name": "SRM Ramapuram ➔ Guindy ➔ T. Nagar",
        "driver_name": "K. Selvam",
        "speed_kmh": 32,
        "lat": 13.0315,
        "lng": 80.1812,
        "status": "AI_ONLINE",
        "edge_device": "NVIDIA Jetson AGX Orin 64GB",
        "inference_fps": 45,
        "cameras_active": 4,
        "cameras": [
          {"id": "CAM-FRONT", "name": "Front Road AI Camera", "resolution": "1080p 60FPS", "status": "ACTIVE"},
          {"id": "CAM-REAR", "name": "Rear Traffic AI Camera", "resolution": "1080p 60FPS", "status": "ACTIVE"},
          {"id": "CAM-LEFT", "name": "Side Obstacle Camera", "resolution": "720p 30FPS", "status": "ACTIVE"},
          {"id": "CAM-CABIN", "name": "Passenger Cabin Safety Camera", "resolution": "1080p 30FPS", "status": "ACTIVE"},
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
        "edge_device": "NVIDIA Jetson Xavier NX",
        "inference_fps": 38,
        "cameras_active": 4,
        "cameras": [
          {"id": "CAM-FRONT", "name": "Front Road AI Camera", "resolution": "1080p 60FPS", "status": "ACTIVE"},
          {"id": "CAM-REAR", "name": "Rear Traffic AI Camera", "resolution": "1080p 60FPS", "status": "ACTIVE"},
          {"id": "CAM-LEFT", "name": "Side Obstacle Camera", "resolution": "720p 30FPS", "status": "ACTIVE"},
          {"id": "CAM-CABIN", "name": "Passenger Cabin Safety Camera", "resolution": "1080p 30FPS", "status": "ACTIVE"},
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
        "edge_device": "NVIDIA Jetson AGX Orin 64GB",
        "inference_fps": 48,
        "cameras_active": 4,
        "cameras": [
          {"id": "CAM-FRONT", "name": "Front Road AI Camera", "resolution": "1080p 60FPS", "status": "ACTIVE"},
          {"id": "CAM-REAR", "name": "Rear Traffic AI Camera", "resolution": "1080p 60FPS", "status": "ACTIVE"},
          {"id": "CAM-LEFT", "name": "Side Obstacle Camera", "resolution": "720p 30FPS", "status": "ACTIVE"},
          {"id": "CAM-CABIN", "name": "Passenger Cabin Safety Camera", "resolution": "1080p 30FPS", "status": "ACTIVE"},
        ]
    }
]

DEMO_DETECTIONS = [
    {
        "event_id": "EVT-8091",
        "bus_id": "BUS-101",
        "bus_reg": "TN-01-N-9842",
        "type": "POTHOLE_SEVERE",
        "category": "ROAD_DEFECT",
        "title": "Severe Deep Asphalt Pothole",
        "description": "2.4ft wide deep pothole detected near Guindy Kathipara Flyover underpass.",
        "location_name": "Guindy Kathipara Underpass",
        "lat": 13.0067,
        "lng": 80.2020,
        "severity": "CRITICAL",
        "confidence": 94.8,
        "timestamp": "2026-08-26 18:45:12",
        "bounding_box": {"x": 120, "y": 240, "width": 180, "height": 110},
        "camera": "CAM-FRONT",
        "work_order_generated": True,
        "work_order_id": "GCC-ROAD-4092"
    },
    {
        "event_id": "EVT-8092",
        "bus_id": "BUS-101",
        "bus_reg": "TN-01-N-9842",
        "type": "DAMAGED_SIGN",
        "category": "INFRASTRUCTURE",
        "title": "Damaged / Bent Speed Limit Sign",
        "description": "Mandatory 40 km/h speed sign post bent 45 degrees near SRM Ramapuram main gate.",
        "location_name": "SRM Ramapuram Entrance",
        "lat": 13.0315,
        "lng": 80.1812,
        "severity": "HIGH",
        "confidence": 91.2,
        "timestamp": "2026-08-26 18:50:30",
        "bounding_box": {"x": 310, "y": 80, "width": 95, "height": 140},
        "camera": "CAM-FRONT",
        "work_order_generated": True,
        "work_order_id": "GCC-TRAFFIC-1044"
    },
    {
        "event_id": "EVT-8093",
        "bus_id": "BUS-102",
        "bus_reg": "TN-02-M-4410",
        "type": "PEDESTRIAN_DANGER",
        "category": "PEDESTRIAN_SAFETY",
        "title": "Vulnerable Pedestrian / School Child Crossing Alert",
        "description": "Two children stepping into non-zebra road zone near Koyambedu Metro.",
        "location_name": "Koyambedu School Zone",
        "lat": 13.0694,
        "lng": 80.1948,
        "severity": "CRITICAL",
        "confidence": 96.4,
        "timestamp": "2026-08-26 18:55:04",
        "bounding_box": {"x": 200, "y": 180, "width": 140, "height": 160},
        "camera": "CAM-FRONT",
        "work_order_generated": False
    },
    {
        "event_id": "EVT-8094",
        "bus_id": "BUS-103",
        "bus_reg": "TN-07-H-3129",
        "type": "ANPR_INCIDENT",
        "category": "INCIDENT_INTELLIGENCE",
        "title": "Rash Driving / Suspicious Vehicle License Plate Extracted",
        "description": "Vehicle TN-09-AB-1234 driving erratically at 74 km/h in 40 km/h zone.",
        "location_name": "Adayar Depot Junction",
        "lat": 13.0067,
        "lng": 80.2571,
        "severity": "HIGH",
        "confidence": 98.1,
        "timestamp": "2026-08-26 19:01:22",
        "license_plate": "TN-09-AB-1234",
        "bounding_box": {"x": 150, "y": 210, "width": 160, "height": 75},
        "camera": "CAM-REAR",
        "work_order_generated": True,
        "work_order_id": "TN-POL-ALERT-881"
    }
]

@router.get("/fleet")
def get_fleet_status():
    return {
        "status": "SUCCESS",
        "demo_mode": True,
        "total_fleet_buses": 12,
        "active_sensing_buses": len(DEMO_BUSES),
        "total_cameras_online": 48,
        "edge_ai_processing_unit": "NVIDIA Jetson AGX Orin 64GB",
        "average_inference_fps": 45,
        "buses": DEMO_BUSES
    }

@router.get("/detections")
def get_sensing_detections():
    return {
        "status": "SUCCESS",
        "demo_mode": True,
        "total_detections_today": 282,
        "breakdown": {
            "potholes": 248,
            "damaged_signs": 18,
            "pedestrian_alerts": 8,
            "anpr_incidents": 8
        },
        "events": DEMO_DETECTIONS
    }

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
        "metrics": edge_simulator.get_edge_performance_report()
    }
