"""
CivicAI Road Hazard Severity & Maintenance Priority Module API
Seamlessly integrates with CivicAI / CivicShield urban mobility platform.
"""
import os
from typing import Optional, List
from fastapi import APIRouter, HTTPException, Query, UploadFile, File, Form
from pydantic import BaseModel

from app.models.road_hazard_models import RoadHazard, PriorityLevel, MaintenanceStatus, TrafficDensity
from app.database.road_hazard_store import data_store
from app.services.scoring_engine import scoring_engine

router = APIRouter(prefix="/api/hazards", tags=["CivicAI Road Hazard Priority & Severity"])

@router.get("")
def list_hazards(
    priority: Optional[str] = None,
    defect_type: Optional[str] = None,
    status: Optional[str] = None,
    search: Optional[str] = None,
    sort_by: Optional[str] = "severityScore",
    sort_order: Optional[str] = "desc",
    page: int = Query(1, ge=1),
    limit: int = Query(25, ge=1, le=100)
):
    hazards = data_store.get_all()

    # Search filter
    if search:
        s = search.lower()
        hazards = [
            h for h in hazards 
            if s in h.hazardId.lower() or s in h.locationName.lower() or s in h.defectType.lower() or s in h.roadSegment.lower()
        ]

    # Priority filter
    if priority and priority.upper() != "ALL":
        hazards = [h for h in hazards if h.priorityLevel.value == priority.upper() or (h.manualPriorityOverride and h.manualPriorityOverride.value == priority.upper())]

    # Defect Type filter
    if defect_type and defect_type.upper() != "ALL":
        hazards = [h for h in hazards if h.defectType.lower() == defect_type.lower()]

    # Status filter
    if status and status.upper() != "ALL":
        if status.upper() == "OPEN":
            hazards = [h for h in hazards if h.maintenanceStatus not in [MaintenanceStatus.RESOLVED, MaintenanceStatus.REJECTED]]
        else:
            hazards = [h for h in hazards if h.maintenanceStatus.value.lower() == status.lower()]

    # Sorting
    reverse = (sort_order.lower() == "desc")
    if sort_by == "severityScore":
        hazards.sort(key=lambda x: x.severityScore, reverse=reverse)
    elif sort_by == "detectionCount":
        hazards.sort(key=lambda x: x.detectionCount, reverse=reverse)
    elif sort_by == "firstDetected":
        hazards.sort(key=lambda x: x.firstDetected, reverse=reverse)
    elif sort_by == "priority":
        p_order = {"CRITICAL": 4, "HIGH": 3, "MEDIUM": 2, "LOW": 1}
        hazards.sort(key=lambda x: p_order.get(x.priorityLevel.value, 0), reverse=reverse)

    total_count = len(hazards)
    start = (page - 1) * limit
    end = start + limit
    paginated = hazards[start:end]

    return {
        "total": total_count,
        "page": page,
        "limit": limit,
        "hazards": [h.model_dump() for h in paginated]
    }

@router.get("/ranking")
def get_maintenance_ranking():
    """Ranked maintenance priority queue for municipal authorities."""
    return data_store.get_ranked_hazards()

@router.get("/summary")
def get_priority_summary():
    """Executive KPI summary and top hazardous corridors for CivicAI."""
    hazards = data_store.get_all()
    total = len(hazards)
    if total == 0:
        return {
            "totalHazards": 0, "critical": 0, "high": 0, "medium": 0, "low": 0,
            "averageScore": 0, "awaitingMaintenance": 0, "resolvedCount": 0,
            "topHazardousRoads": []
        }

    critical = sum(1 for h in hazards if h.priorityLevel == PriorityLevel.CRITICAL or h.manualPriorityOverride == PriorityLevel.CRITICAL)
    high = sum(1 for h in hazards if (h.priorityLevel == PriorityLevel.HIGH or h.manualPriorityOverride == PriorityLevel.HIGH) and h.manualPriorityOverride != PriorityLevel.CRITICAL)
    medium = sum(1 for h in hazards if h.priorityLevel == PriorityLevel.MEDIUM and not h.manualPriorityOverride)
    low = sum(1 for h in hazards if h.priorityLevel == PriorityLevel.LOW and not h.manualPriorityOverride)

    avg_score = round(sum(h.severityScore for h in hazards) / total, 1)
    awaiting = sum(1 for h in hazards if h.maintenanceStatus in [MaintenanceStatus.DETECTED, MaintenanceStatus.VERIFIED, MaintenanceStatus.ASSIGNED])
    resolved = sum(1 for h in hazards if h.maintenanceStatus == MaintenanceStatus.RESOLVED)

    # Road Segments Aggregation
    road_map = {}
    for h in hazards:
        seg = h.roadSegment or "Unspecified Road"
        if seg not in road_map:
            road_map[seg] = {
                "roadName": seg,
                "hazardCount": 0,
                "criticalCount": 0,
                "totalScore": 0.0,
                "totalDetections": 0
            }
        road_map[seg]["hazardCount"] += 1
        if h.priorityLevel == PriorityLevel.CRITICAL or h.manualPriorityOverride == PriorityLevel.CRITICAL:
            road_map[seg]["criticalCount"] += 1
        road_map[seg]["totalScore"] += h.severityScore
        road_map[seg]["totalDetections"] += h.detectionCount

    top_roads = []
    for r, data in road_map.items():
        avg_r_score = data["totalScore"] / max(1, data["hazardCount"])
        risk_index = min(100.0, round(avg_r_score * 0.7 + (data["criticalCount"] * 10), 1))
        top_roads.append({
            "roadSegment": r,
            "hazardCount": data["hazardCount"],
            "criticalCount": data["criticalCount"],
            "averageSeverity": round(avg_r_score, 1),
            "riskIndex": risk_index,
            "totalDetections": data["totalDetections"]
        })
    top_roads.sort(key=lambda x: x["riskIndex"], reverse=True)

    defect_counts = {}
    for h in hazards:
        defect_counts[h.defectType] = defect_counts.get(h.defectType, 0) + 1

    return {
        "totalHazards": total,
        "critical": critical,
        "high": high,
        "medium": medium,
        "low": low,
        "averageScore": avg_score,
        "awaitingMaintenance": awaiting,
        "resolvedCount": resolved,
        "topHazardousRoads": top_roads[:5],
        "defectTypeDistribution": defect_counts
    }

@router.get("/{hazard_id}")
def get_hazard_detail(hazard_id: str):
    hazard = data_store.get_by_id(hazard_id)
    if not hazard:
        raise HTTPException(status_code=404, detail="Hazard not found")
    return hazard.model_dump()

@router.get("/{hazard_id}/severity")
def get_hazard_severity(hazard_id: str):
    hazard = data_store.get_by_id(hazard_id)
    if not hazard:
        raise HTTPException(status_code=404, detail="Hazard not found")
    return {
        "hazardId": hazard.hazardId,
        "severityScore": hazard.severityScore,
        "priority": hazard.priorityLevel.value,
        "manualOverride": hazard.manualPriorityOverride.value if hazard.manualPriorityOverride else None,
        "recommendedAction": hazard.recommendedAction,
        "scoreBreakdown": hazard.scoreBreakdown.model_dump(),
        "aiReasoning": hazard.aiReasoning,
        "futurePrediction": hazard.futurePrediction.model_dump() if hazard.futurePrediction else None
    }

class StatusUpdateRequest(BaseModel):
    status: MaintenanceStatus
    assignedTeam: Optional[str] = None
    notes: Optional[str] = None

@router.patch("/{hazard_id}/status")
def update_hazard_status(hazard_id: str, req: StatusUpdateRequest):
    updated = data_store.update_maintenance_status(
        hazard_id, req.status, req.assignedTeam, req.notes
    )
    if not updated:
        raise HTTPException(status_code=404, detail="Hazard not found")
    return {"message": "Status updated successfully", "hazard": updated.model_dump()}

class PriorityOverrideRequest(BaseModel):
    overrideLevel: PriorityLevel
    reason: str

@router.patch("/{hazard_id}/override")
def set_priority_override(hazard_id: str, req: PriorityOverrideRequest):
    updated = data_store.set_priority_override(hazard_id, req.overrideLevel, req.reason)
    if not updated:
        raise HTTPException(status_code=404, detail="Hazard not found")
    return {"message": "Manual priority override applied", "hazard": updated.model_dump()}

@router.delete("/{hazard_id}/override")
def clear_priority_override(hazard_id: str):
    updated = data_store.clear_priority_override(hazard_id)
    if not updated:
        raise HTTPException(status_code=404, detail="Hazard not found")
    return {"message": "Priority override cleared", "hazard": updated.model_dump()}
