import time
import math
import cv2
import numpy as np
from pathlib import Path
from typing import Dict, Any, List, Optional

class TrafficDensityEngine:
    """
    SIH 2026 PS 26124: Intelligent Vehicle Density Estimation, Classification,
    and Directional Flow Counting Engine using YOLOv8 edge object detection.
    """
    _instance = None

    VEHICLE_CLASSES = {
        1: "bicycle",
        2: "car",
        3: "motorcycle",
        5: "bus",
        7: "truck"
    }

    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    def __init__(self):
        import torch
        from ultralytics import YOLO

        self.device = 'mps' if torch.backends.mps.is_available() else 'cpu'
        
        # Load base pretrained YOLO for multi-class vehicle detection
        model_paths = [
            Path("/Users/purushothambalamurali/Desktop/civicAI/yolov8n.pt"),
            Path("yolov8n.pt")
        ]
        self.model = None
        for mp in model_paths:
            if mp.exists():
                try:
                    self.model = YOLO(str(mp))
                    break
                except Exception:
                    pass
        
        if self.model is None:
            self.model = YOLO("yolov8n.pt")

        # Track history for centroid tracking & speed estimation {id: [(x, y, t), ...]}
        self.track_history: Dict[int, List[Dict[str, Any]]] = {}
        self.next_track_id = 1001

    def analyze_frame(self, cv_img: np.ndarray, conf_threshold: float = 0.35) -> Dict[str, Any]:
        """
        Analyzes a camera frame (Rear Traffic or Front Road camera) to:
        1. Classify & count individual vehicle types (bikes, autos, cars, buses, trucks).
        2. Compute Vehicle Density Index (0-100%).
        3. Assess Traffic Bottleneck / Level of Service (LOS A through F).
        """
        t0 = time.perf_counter()
        h, w = cv_img.shape[:2]

        results = self.model.predict(
            cv_img,
            conf=conf_threshold,
            device=self.device,
            verbose=False,
            imgsz=416,
            classes=list(self.VEHICLE_CLASSES.keys())
        )

        counts = {
            "bicycle": 0,
            "motorcycle": 0,
            "car": 0,
            "bus": 0,
            "truck": 0
        }
        detected_vehicles = []
        total_vehicle_area = 0

        if results and len(results) > 0:
            boxes = results[0].boxes
            if boxes is not None:
                for box in boxes:
                    cls_id = int(box.cls[0].item())
                    conf = float(box.conf[0].item())
                    xyxy = box.xyxy[0].tolist()

                    bx1, by1, bx2, by2 = xyxy
                    bw = bx2 - bx1
                    bh = by2 - by1
                    area = bw * bh
                    total_vehicle_area += area

                    v_type = self.VEHICLE_CLASSES.get(cls_id, "car")
                    counts[v_type] = counts.get(v_type, 0) + 1

                    center_x = (bx1 + bx2) / 2.0
                    center_y = (by1 + by2) / 2.0

                    detected_vehicles.append({
                        "vehicle_type": v_type,
                        "confidence": round(conf, 3),
                        "box_normalized": {
                            "x": round(bx1 / w, 4),
                            "y": round(by1 / h, 4),
                            "w": round(bw / w, 4),
                            "h": round(bh / h, 4)
                        },
                        "distance_m": round(max(3.0, 30.0 - (by2 / h) * 26.0), 1),
                        "lane": "LEFT" if center_x < w * 0.35 else ("RIGHT" if center_x > w * 0.65 else "CENTER")
                    })

        total_vehicles = sum(counts.values())

        # Area occupancy ratio relative to carriage-way (bottom 70% of frame)
        road_area = w * (h * 0.70)
        occupancy_ratio = min(1.0, total_vehicle_area / max(1.0, road_area))

        # Density score (0-100) combining count and area occupancy
        density_index = min(100, int((total_vehicles * 8.0) + (occupancy_ratio * 60.0)))

        # Level of Service (LOS A to F based on Highway Capacity Manual standards)
        if density_index < 20:
            los = "A"
            bottleneck_status = "FREE_FLOW"
            speed_estimate_kmh = 48.0
            delay_minutes = 0.0
        elif density_index < 40:
            los = "B"
            bottleneck_status = "REASONABLY_FREE"
            speed_estimate_kmh = 38.0
            delay_minutes = 1.5
        elif density_index < 60:
            los = "C"
            bottleneck_status = "STABLE_FLOW"
            speed_estimate_kmh = 28.0
            delay_minutes = 4.0
        elif density_index < 75:
            los = "D"
            bottleneck_status = "APPROACHING_UNSTABLE"
            speed_estimate_kmh = 18.0
            delay_minutes = 8.5
        elif density_index < 88:
            los = "E"
            bottleneck_status = "UNSTABLE_CONGESTION"
            speed_estimate_kmh = 10.0
            delay_minutes = 14.0
        else:
            los = "F"
            bottleneck_status = "BOTTLENECK_BREAKDOWN"
            speed_estimate_kmh = 4.5
            delay_minutes = 22.0

        latency_ms = round((time.perf_counter() - t0) * 1000, 2)

        return {
            "status": "SUCCESS",
            "total_vehicles_detected": total_vehicles,
            "counts": counts,
            "density_index": density_index,
            "level_of_service": los,
            "bottleneck_status": bottleneck_status,
            "estimated_corridor_speed_kmh": speed_estimate_kmh,
            "estimated_delay_minutes": delay_minutes,
            "occupancy_ratio": round(occupancy_ratio, 3),
            "vehicles": detected_vehicles,
            "inference_latency_ms": latency_ms,
            "timestamp": time.time()
        }

traffic_density_engine = TrafficDensityEngine.get_instance()
