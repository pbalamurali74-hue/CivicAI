"""
Centralized Configuration for Severity Scoring Engine.
Enables authorities and engineers to fine-tune weights and thresholds dynamically.
"""

DEFAULT_SCORING_CONFIG = {
    # 1. Defect Type Base Points (Max 25 pts)
    "defect_type_weights": {
        "minor crack": 10.0,
        "minor cracks": 10.0,
        "crack": 15.0,
        "surface crack": 20.0,
        "surface cracks": 20.0,
        "road depression": 35.0,
        "depression": 35.0,
        "pothole": 45.0,
        "potholes": 45.0,
        "waterlogging": 60.0,
        "water logging": 60.0,
        "large pothole": 65.0,
        "damaged speed breaker": 70.0,
        "exposed/damaged manhole": 90.0,
        "damaged manhole": 90.0,
        "open manhole": 90.0,
        "road collapse": 95.0,
        "collapse": 95.0
    },
    # Scale from 0-100 base defect severity to 25 pts maximum:
    "defect_type_max_pts": 25.0,

    # 2. Defect Size Points (Max 20 pts)
    "size_weights": {
        "very small": 5.0,
        "small": 8.0,
        "medium": 12.0,
        "large": 16.0,
        "very large": 20.0
    },
    "size_max_pts": 20.0,

    # 3. Traffic Density Points (Max 20 pts)
    "traffic_weights": {
        "low": 5.0,
        "moderate": 10.0,
        "high": 15.0,
        "very high": 20.0
    },
    "traffic_max_pts": 20.0,

    # 4. Vulnerable Area Proximity Points (Max 15 pts)
    "vulnerability_thresholds": [
        {"max_distance_m": 50.0, "points": 15.0},
        {"max_distance_m": 100.0, "points": 10.0},
        {"max_distance_m": 250.0, "points": 5.0},
        {"max_distance_m": float("inf"), "points": 0.0}
    ],
    "vulnerability_max_pts": 15.0,

    # 5. Detection Frequency Points (Max 15 pts)
    "frequency_thresholds": [
        {"min_count": 11, "points": 15.0},
        {"min_count": 6, "points": 12.0},
        {"min_count": 4, "points": 10.0},
        {"min_count": 2, "points": 5.0},
        {"min_count": 1, "points": 0.0}
    ],
    "frequency_max_pts": 15.0,

    # 6. Deterioration Trend Bonus (Max 5 pts)
    "deterioration_max_pts": 5.0,

    # Recommended Action Mapping
    "recommended_actions": {
        "LOW": "Monitor road condition during routine inspections",
        "MEDIUM": "Schedule maintenance within 7 days",
        "HIGH": "Repair within 48 hours to prevent severe hazard",
        "CRITICAL": "Immediate inspection/repair required — escalate to emergency road crew"
    }
}
