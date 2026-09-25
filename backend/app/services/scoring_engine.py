"""
AI-Based Road Hazard Severity and Maintenance Priority Scoring Engine.
Modular, explainable, and extensible for future ML models (Random Forest / XGBoost).
"""
import math
from typing import Dict, Any, List, Optional, Tuple
from app.models.road_hazard_models import PriorityLevel, ScoreBreakdown, FutureRiskPrediction, HistoricalObservation
from app.services.scoring_config import DEFAULT_SCORING_CONFIG


class BaseScoringStrategy:
    """Abstract base class for pluggable severity scoring implementations."""
    def calculate(self, feature_vector: Dict[str, Any]) -> Tuple[float, ScoreBreakdown, str, str]:
        raise NotImplementedError

class TransparentWeightedScoringEngine(BaseScoringStrategy):
    """
    Core transparent multi-factor weighted scoring engine.
    Computes explainable contributions from:
      1. Defect Type (max 25)
      2. Defect Size Proxy (max 20)
      3. Traffic Density (max 20)
      4. Vulnerable Area Proximity (max 15)
      5. Detection Frequency (max 15)
      6. Deterioration Trend (max 5)
    Total normalized score: 0 to 100.
    """
    def __init__(self, config: Optional[Dict[str, Any]] = None):
        self.config = config or DEFAULT_SCORING_CONFIG

    def score_defect_type(self, defect_type: str) -> float:
        weights = self.config["defect_type_weights"]
        key = defect_type.lower().strip()
        raw_val = weights.get(key, 30.0) # default reasonable fallback for unknown defect
        # Normalize 0-100 base risk to 0-25 points
        return round((raw_val / 100.0) * self.config["defect_type_max_pts"], 1)

    def score_size(self, size_category: str, bounding_box_ratio: Optional[float] = None) -> float:
        weights = self.config["size_weights"]
        key = size_category.lower().strip() if size_category else ""
        if key in weights:
            return round(weights[key], 1)
        
        # If bounding box ratio available (0.0 - 1.0)
        if bounding_box_ratio is not None:
            if bounding_box_ratio < 0.05:
                return 5.0
            elif bounding_box_ratio < 0.12:
                return 8.0
            elif bounding_box_ratio < 0.25:
                return 12.0
            elif bounding_box_ratio < 0.40:
                return 16.0
            else:
                return 20.0
        return 10.0 # moderate fallback

    def score_traffic(self, traffic_density: str) -> float:
        weights = self.config["traffic_weights"]
        key = traffic_density.lower().strip() if traffic_density else "moderate"
        return round(weights.get(key, 10.0), 1)

    def score_vulnerability(self, distance_m: Optional[float]) -> float:
        if distance_m is None:
            return 0.0
        thresholds = self.config["vulnerability_thresholds"]
        for t in thresholds:
            if distance_m <= t["max_distance_m"]:
                return float(t["points"])
        return 0.0

    def score_frequency(self, detection_count: int) -> float:
        thresholds = self.config["frequency_thresholds"]
        for t in thresholds:
            if detection_count >= t["min_count"]:
                return float(t["points"])
        return 0.0

    def score_deterioration(self, history: List[HistoricalObservation]) -> Tuple[float, str]:
        """
        Deterioration score based on historical measurements.
        Returns: (points: float, trend_label: str)
        """
        if not history or len(history) < 2:
            return 0.0, "Insufficient historical data"
        
        # Calculate severity trend over time
        scores = [h.severityScore for h in history]
        diff = scores[-1] - scores[0]
        
        if diff >= 15:
            return 5.0, "Rapid Deterioration"
        elif diff >= 8:
            return 4.0, "Deteriorating"
        elif diff >= 3:
            return 2.5, "Mild Growth"
        elif diff <= -5:
            return 0.0, "Improving / Partially Repaired"
        else:
            return 1.0, "Stable"

    def classify_priority(self, total_score: float) -> PriorityLevel:
        if total_score >= 75.0:
            return PriorityLevel.CRITICAL
        elif total_score >= 50.0:
            return PriorityLevel.HIGH
        elif total_score >= 25.0:
            return PriorityLevel.MEDIUM
        else:
            return PriorityLevel.LOW

    def generate_ai_reasoning(
        self,
        defect_type: str,
        size_category: str,
        traffic_density: str,
        vulnerable_area: Optional[str],
        vulnerable_dist: Optional[float],
        detection_count: int,
        deterioration_label: str,
        priority: PriorityLevel,
        total_score: float
    ) -> str:
        factors = []
        if priority in [PriorityLevel.CRITICAL, PriorityLevel.HIGH]:
            factors.append(f"it is a {size_category.lower()} {defect_type.lower()}")
            if traffic_density.lower() in ["high", "very high"]:
                factors.append(f"located on a {traffic_density.lower()}-traffic corridor")
            if detection_count >= 4:
                factors.append(f"has been detected repeatedly ({detection_count} times)")
            if vulnerable_dist is not None and vulnerable_dist <= 100:
                facility = vulnerable_area or "a sensitive zone"
                factors.append(f"sits only {int(vulnerable_dist)}m from {facility}")
            if deterioration_label in ["Rapid Deterioration", "Deteriorating"]:
                factors.append("shows documented physical growth/deterioration")
        else:
            factors.append(f"it is currently a {size_category.lower()} {defect_type.lower()}")
            if traffic_density.lower() in ["low", "moderate"]:
                factors.append(f"traffic intensity is {traffic_density.lower()}")
            if detection_count <= 2:
                factors.append("detected frequency is low")
            if vulnerable_dist is None or vulnerable_dist > 200:
                factors.append("it is outside immediate pedestrian/school danger zones")
            
        reason_core = ", ".join(factors) if factors else f"standard risk factors for {defect_type}"
        return f"This hazard is classified as {priority.value} (Score: {total_score:.0f}/100) because {reason_core}."

    def calculate(self, feature_vector: Dict[str, Any]) -> Tuple[float, PriorityLevel, ScoreBreakdown, str, str, FutureRiskPrediction]:
        defect_type = feature_vector.get("defect_type", "Pothole")
        size_cat = feature_vector.get("size_category", "Medium")
        bbox_ratio = feature_vector.get("bounding_box_area_ratio")
        traffic = feature_vector.get("traffic_density", "Moderate")
        vuln_dist = feature_vector.get("vulnerable_area_distance_m")
        vuln_type = feature_vector.get("vulnerable_area_type")
        freq = int(feature_vector.get("detection_count", 1))
        history = feature_vector.get("history", [])

        # 1. Individual scoring components
        defect_score = self.score_defect_type(defect_type)
        size_score = self.score_size(size_cat, bbox_ratio)
        traffic_score = self.score_traffic(traffic)
        vuln_score = self.score_vulnerability(vuln_dist)
        freq_score = self.score_frequency(freq)
        det_score, det_label = self.score_deterioration(history)

        # 2. Total score clamped to 0-100
        raw_total = defect_score + size_score + traffic_score + vuln_score + freq_score + det_score
        total_score = max(0.0, min(100.0, round(raw_total, 1)))

        # 3. Priority classification
        priority = self.classify_priority(total_score)

        # 4. Score breakdown
        breakdown = ScoreBreakdown(
            defectType=defect_score,
            size=size_score,
            traffic=traffic_score,
            vulnerability=vuln_score,
            frequency=freq_score,
            deterioration=det_score,
            totalScore=total_score
        )

        # 5. AI Reasoning
        reasoning = self.generate_ai_reasoning(
            defect_type=defect_type,
            size_category=size_cat,
            traffic_density=traffic,
            vulnerable_area=vuln_type,
            vulnerable_dist=vuln_dist,
            detection_count=freq,
            deterioration_label=det_label,
            priority=priority,
            total_score=total_score
        )

        # 6. Action recommendation
        rec_actions = self.config["recommended_actions"]
        recommended_action = rec_actions.get(priority.value, "Monitor condition")

        # 7. Future risk prediction
        if history and len(history) >= 2:
            # Linear trend extrapolation based on history
            recent_delta = history[-1].severityScore - history[0].severityScore
            step_rate = recent_delta / max(1, len(history) - 1)
            projected_7d = min(100.0, max(0.0, round(total_score + (step_rate * 1.5), 1)))
            
            # Risk of becoming critical (75+)
            if projected_7d >= 75:
                crit_prob = min(98.0, round(60.0 + (projected_7d - 75) * 1.5, 1))
            elif projected_7d >= 60:
                crit_prob = round(35.0 + (projected_7d - 60) * 1.5, 1)
            else:
                crit_prob = round(max(5.0, projected_7d * 0.3), 1)

            future_pred = FutureRiskPrediction(
                available=True,
                currentSeverity=total_score,
                estimated7DaySeverity=projected_7d,
                criticalRiskPercentage=crit_prob,
                trendLabel=det_label,
                explanation=f"Based on {len(history)} historical inspections, severity is shifting at ~{step_rate:+.1f} pts/interval."
            )
        else:
            future_pred = FutureRiskPrediction(
                available=False,
                currentSeverity=total_score,
                estimated7DaySeverity=None,
                criticalRiskPercentage=None,
                trendLabel="Insufficient historical data",
                explanation="Prediction unavailable — requires at least 2 historical inspections to evaluate progression."
            )

        return total_score, priority, breakdown, reasoning, recommended_action, future_pred

# Singleton instance of severity scoring engine
scoring_engine = TransparentWeightedScoringEngine()
