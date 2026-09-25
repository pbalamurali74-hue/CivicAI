"""
Type definitions and constants for AI-Based Road Hazard Severity and Maintenance Priority Module.
"""
from typing import Dict, List, Optional, Any
from pydantic import BaseModel, Field
from enum import Enum

class PriorityLevel(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"

class MaintenanceStatus(str, Enum):
    DETECTED = "Detected"
    VERIFIED = "Verified"
    ASSIGNED = "Assigned"
    IN_PROGRESS = "In Progress"
    RESOLVED = "Resolved"
    REJECTED = "Rejected"

class TrafficDensity(str, Enum):
    LOW = "Low"
    MODERATE = "Moderate"
    HIGH = "High"
    VERY_HIGH = "Very High"

class VulnerableAreaType(str, Enum):
    SCHOOL = "School"
    HOSPITAL = "Hospital"
    COLLEGE = "College"
    BUS_STOP = "Bus Stop"
    RAILWAY_STATION = "Railway Station"
    PEDESTRIAN_CROSSING = "Pedestrian Crossing"
    RESIDENTIAL_ZONE = "Residential Zone"
    ACCIDENT_PRONE_LOCATION = "Accident-Prone Location"

class ScoreBreakdown(BaseModel):
    defectType: float = Field(..., description="Risk score from defect type (0-25)")
    size: float = Field(..., description="Risk score from defect size proxy (0-20)")
    traffic: float = Field(..., description="Risk score from traffic intensity (0-20)")
    vulnerability: float = Field(..., description="Risk score from proximity to vulnerable facility (0-15)")
    frequency: float = Field(..., description="Risk score from detection frequency (0-15)")
    deterioration: float = Field(..., description="Risk score from deterioration trend (0-5)")
    totalScore: float = Field(..., description="Normalized total score (0-100)")

class HistoricalObservation(BaseModel):
    timestamp: str
    sizeEstimateMm: Optional[float] = None
    severityScore: float
    confidence: float
    source: str = "CV_Detection"

class FutureRiskPrediction(BaseModel):
    available: bool
    currentSeverity: float
    estimated7DaySeverity: Optional[float] = None
    criticalRiskPercentage: Optional[float] = None
    trendLabel: str = "Insufficient historical data"
    explanation: Optional[str] = None

class RoadHazard(BaseModel):
    hazardId: str
    defectType: str
    confidence: float
    latitude: float
    longitude: float
    locationName: str
    roadSegment: str
    
    # Dimensions & Features
    estimatedLengthCm: Optional[float] = None
    estimatedWidthCm: Optional[float] = None
    boundingBoxAreaRatio: Optional[float] = None # proxy normalized area (0.0 to 1.0)
    sizeCategory: str # Very small, Small, Medium, Large, Very large
    
    # Environmental & Operational Context
    trafficDensity: TrafficDensity
    trafficSource: str = "Simulated" # Real or Simulated
    vulnerableAreaType: Optional[str] = None
    vulnerableAreaDistanceM: Optional[float] = None
    
    # Temporal & Repetition
    detectionCount: int = 1
    firstDetected: str
    lastDetected: str
    history: List[HistoricalObservation] = []
    
    # Scoring & Classification
    severityScore: float
    priorityLevel: PriorityLevel
    manualPriorityOverride: Optional[PriorityLevel] = None
    overrideReason: Optional[str] = None
    scoreBreakdown: ScoreBreakdown
    aiReasoning: str
    recommendedAction: str
    
    # Workflow
    maintenanceStatus: MaintenanceStatus
    assignedTeam: Optional[str] = None
    notes: Optional[str] = None
    imageUrl: Optional[str] = None
    
    # Deterioration & Predictive
    futurePrediction: Optional[FutureRiskPrediction] = None
    created_at: str
    updated_at: str
