"""
Data Persistence, Hazard Association, and Ranking Management Store.
Handles:
  - Storing hazards and detections
  - Proximity-based duplicate detection & recurrence tracking
  - Maintenance updates & authority priority overrides
  - Dynamic priority ranking queries
"""
import math
import json
import os
from pathlib import Path
from datetime import datetime
from typing import List, Optional, Dict, Any
from app.models.road_hazard_models import RoadHazard, PriorityLevel, MaintenanceStatus, HistoricalObservation
from app.database.road_hazard_seed import generate_initial_hazards
from app.services.scoring_engine import scoring_engine

class HazardDataStore:
    def __init__(self, data_file: Optional[str] = None):
        if data_file is None:
            base_dir = Path(__file__).resolve().parent.parent
            data_file = str(base_dir / "data" / "hazards.json")
        self.data_file = data_file
        self.hazards: Dict[str, RoadHazard] = {}
        self.load_or_seed()


    def load_or_seed(self):
        if os.path.exists(self.data_file):
            try:
                with open(self.data_file, "r") as f:
                    data = json.load(f)
                    for item in data:
                        hazard = RoadHazard(**item)
                        self.hazards[hazard.hazardId] = hazard
                print(f"Loaded {len(self.hazards)} hazards from {self.data_file}")
                return
            except Exception as e:
                print(f"Error loading {self.data_file}: {e}. Seeding fresh data.")

        # Seed initial realistic hazards
        initial = generate_initial_hazards()
        for h in initial:
            self.hazards[h.hazardId] = h
        self.save()

    def save(self):
        os.makedirs(os.path.dirname(self.data_file), exist_ok=True)
        with open(self.data_file, "w") as f:
            json.dump([h.model_dump() for h in self.hazards.values()], f, indent=2)

    def get_all(self) -> List[RoadHazard]:
        return list(self.hazards.values())

    def get_by_id(self, hazard_id: str) -> Optional[RoadHazard]:
        return self.hazards.get(hazard_id)

    def calculate_distance_meters(self, lat1: float, lon1: float, lat2: float, lon2: float) -> float:
        """Haversine formula to calculate distance between two coordinates in meters."""
        R = 6371000.0  # Earth radius in meters
        phi1 = math.radians(lat1)
        phi2 = math.radians(lat2)
        delta_phi = math.radians(lat2 - lat1)
        delta_lambda = math.radians(lon2 - lon1)

        a = math.sin(delta_phi / 2.0) ** 2 + math.cos(phi1) * math.cos(phi2) * (math.sin(delta_lambda / 2.0) ** 2)
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
        return R * c

    def find_nearby_existing_hazard(self, lat: float, lon: float, defect_type: str, threshold_m: float = 35.0) -> Optional[RoadHazard]:
        """
        Duplicate detection and persistence logic:
        Checks if a defect of compatible type exists within threshold meters (e.g. 35m).
        """
        for h in self.hazards.values():
            if h.maintenanceStatus == MaintenanceStatus.RESOLVED:
                continue
            dist = self.calculate_distance_meters(lat, lon, h.latitude, h.longitude)
            if dist <= threshold_m:
                return h
        return None

    def record_detection(
        self,
        defect_type: str,
        confidence: float,
        latitude: float,
        longitude: float,
        location_name: str,
        road_segment: str,
        size_category: str,
        bounding_box_ratio: float,
        est_length_cm: float,
        est_width_cm: float,
        traffic_density: str,
        vulnerable_area_type: Optional[str],
        vulnerable_area_distance_m: Optional[float],
        image_url: Optional[str] = None
    ) -> RoadHazard:
        """
        Processes a new defect detection.
        Associates with existing hazard if nearby, increments count, records historical observation,
        and triggers dynamic severity recalculation.
        """
        existing = self.find_nearby_existing_hazard(latitude, longitude, defect_type)
        now_str = datetime.now().isoformat()

        if existing:
            # Update existing hazard recurrence
            existing.detectionCount += 1
            existing.lastDetected = now_str
            existing.confidence = max(existing.confidence, confidence)
            if image_url:
                existing.imageUrl = image_url
            if est_length_cm > (existing.estimatedLengthCm or 0):
                existing.estimatedLengthCm = est_length_cm
                existing.estimatedWidthCm = est_width_cm
                existing.sizeCategory = size_category

            # Recalculate feature vector
            fv = {
                "defect_type": existing.defectType,
                "size_category": existing.sizeCategory,
                "bounding_box_area_ratio": bounding_box_ratio,
                "traffic_density": existing.trafficDensity.value,
                "vulnerable_area_distance_m": existing.vulnerableAreaDistanceM,
                "vulnerable_area_type": existing.vulnerableAreaType,
                "detection_count": existing.detectionCount,
                "history": existing.history
            }
            score, priority, breakdown, reasoning, action, future_pred = scoring_engine.calculate(fv)

            # Append historical record
            existing.history.append(
                HistoricalObservation(
                    timestamp=datetime.now().strftime("%Y-%m-%d %H:%M"),
                    sizeEstimateMm=est_length_cm * 10,
                    severityScore=score,
                    confidence=confidence
                )
            )
            # Recompute with new history entry
            fv["history"] = existing.history
            score, priority, breakdown, reasoning, action, future_pred = scoring_engine.calculate(fv)

            existing.severityScore = score
            existing.priorityLevel = priority
            existing.scoreBreakdown = breakdown
            existing.aiReasoning = reasoning
            existing.recommendedAction = action
            existing.futurePrediction = future_pred
            existing.updated_at = now_str

            self.hazards[existing.hazardId] = existing
            self.save()
            return existing
        else:
            # Create new hazard
            new_id = f"RH-{1000 + len(self.hazards) + 1}"
            fv = {
                "defect_type": defect_type,
                "size_category": size_category,
                "bounding_box_area_ratio": bounding_box_ratio,
                "traffic_density": traffic_density,
                "vulnerable_area_distance_m": vulnerable_area_distance_m,
                "vulnerable_area_type": vulnerable_area_type,
                "detection_count": 1,
                "history": []
            }
            score, priority, breakdown, reasoning, action, future_pred = scoring_engine.calculate(fv)

            first_hist = [
                HistoricalObservation(
                    timestamp=datetime.now().strftime("%Y-%m-%d %H:%M"),
                    sizeEstimateMm=est_length_cm * 10,
                    severityScore=score,
                    confidence=confidence
                )
            ]

            new_hazard = RoadHazard(
                hazardId=new_id,
                defectType=defect_type,
                confidence=confidence,
                latitude=latitude,
                longitude=longitude,
                locationName=location_name or f"Coords: {latitude:.4f}, {longitude:.4f}",
                roadSegment=road_segment or "Municipal Sector Way",
                estimatedLengthCm=est_length_cm,
                estimatedWidthCm=est_width_cm,
                sizeCategory=size_category,
                trafficDensity=traffic_density,
                trafficSource="Simulated",
                vulnerableAreaType=vulnerable_area_type,
                vulnerableAreaDistanceM=vulnerable_area_distance_m,
                detectionCount=1,
                firstDetected=now_str,
                lastDetected=now_str,
                history=first_hist,
                severityScore=score,
                priorityLevel=priority,
                scoreBreakdown=breakdown,
                aiReasoning=reasoning,
                recommendedAction=action,
                maintenanceStatus=MaintenanceStatus.DETECTED,
                assignedTeam=None,
                notes="Newly registered defect via detection pipeline.",
                imageUrl=image_url or "/static/images/pothole_medium.jpg",
                futurePrediction=future_pred,
                created_at=now_str,
                updated_at=now_str
            )
            self.hazards[new_id] = new_hazard
            self.save()
            return new_hazard

    def update_maintenance_status(self, hazard_id: str, new_status: MaintenanceStatus, assigned_team: Optional[str] = None, notes: Optional[str] = None) -> Optional[RoadHazard]:
        h = self.get_by_id(hazard_id)
        if not h:
            return None
        h.maintenanceStatus = new_status
        if assigned_team:
            h.assignedTeam = assigned_team
        if notes:
            h.notes = notes
        h.updated_at = datetime.now().isoformat()
        self.hazards[hazard_id] = h
        self.save()
        return h

    def set_priority_override(self, hazard_id: str, override_level: PriorityLevel, reason: str) -> Optional[RoadHazard]:
        h = self.get_by_id(hazard_id)
        if not h:
            return None
        h.manualPriorityOverride = override_level
        h.overrideReason = reason
        h.updated_at = datetime.now().isoformat()
        self.hazards[hazard_id] = h
        self.save()
        return h

    def clear_priority_override(self, hazard_id: str) -> Optional[RoadHazard]:
        h = self.get_by_id(hazard_id)
        if not h:
            return None
        h.manualPriorityOverride = None
        h.overrideReason = None
        h.updated_at = datetime.now().isoformat()
        self.hazards[hazard_id] = h
        self.save()
        return h

    def get_ranked_hazards(self) -> List[Dict[str, Any]]:
        """
        Rank hazards by:
        1. Severity score descending
        2. Priority level
        3. Recurrence / detection frequency
        4. Defect age
        """
        all_hazards = [h for h in self.hazards.values() if h.maintenanceStatus != MaintenanceStatus.REJECTED]

        def sort_key(h: RoadHazard):
            # Effective score considers manual priority override escalation
            eff_score = h.severityScore
            if h.manualPriorityOverride == PriorityLevel.CRITICAL and eff_score < 75:
                eff_score += 20
            return (eff_score, h.detectionCount, h.firstDetected)

        sorted_hazards = sorted(all_hazards, key=sort_key, reverse=True)
        ranked_list = []
        for idx, h in enumerate(sorted_hazards, start=1):
            item = h.model_dump()
            item["rank"] = idx
            ranked_list.append(item)
        return ranked_list

data_store = HazardDataStore()
