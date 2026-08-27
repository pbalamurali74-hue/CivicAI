from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional, List
from app.schemas.schemas import RoutePlanRequest, RoutePlanResponse
from app.ml.route_optimizer import calculate_multimodal_routes
from app.ml.od_clustering import get_od_pattern_insights
from app.services.gemini_service import generate_trip_plan_with_gemini, manage_multi_stop_trip_with_gemini

router = APIRouter(prefix="/api/routes", tags=["Smart Mobility & Multimodal Routes"])

class GeminiTripRequest(BaseModel):
    prompt: str
    origin: Optional[str] = "SRM Ramapuram"
    destination: Optional[str] = "Chennai Central"
    passengers: Optional[int] = 1
    preference: Optional[str] = "BALANCED"

class GeminiMultiStopTripRequest(BaseModel):
    title: str
    origin: str
    stops: List[str]
    budget_inr: Optional[int] = 500
    passengers: Optional[int] = 1
    notes: Optional[str] = ""

@router.post("/plan", response_model=RoutePlanResponse)
def plan_multimodal_route(payload: RoutePlanRequest):
    """
    Multimodal journey planner calculating Bus, Cab, Auto, and Bus+Walk options,
    evaluating composite route utility score.
    """
    result = calculate_multimodal_routes(
        origin=payload.origin,
        destination=payload.destination,
        passengers=payload.passengers or 1,
        preference=payload.preference or "BALANCED"
    )
    return result

@router.post("/ai-plan")
def plan_trip_with_gemini(payload: GeminiTripRequest):
    """
    Gemini AI-powered conversational trip planner.
    Generates intelligent step-by-step itinerary, cost breakdown, and local Chennai insights.
    """
    return generate_trip_plan_with_gemini(
        prompt=payload.prompt,
        origin=payload.origin or "SRM Ramapuram",
        destination=payload.destination or "Chennai Central",
        passengers=payload.passengers or 1,
        preference=payload.preference or "BALANCED"
    )

@router.post("/trip-manager")
def optimize_multi_stop_trip_with_gemini(payload: GeminiMultiStopTripRequest):
    """
    Gemini AI Embedded Trip Manager Endpoint.
    Optimizes multi-stop trip sequence, time slots, fares, and local traffic recommendations.
    """
    return manage_multi_stop_trip_with_gemini(
        title=payload.title,
        origin=payload.origin,
        stops=payload.stops,
        budget_inr=payload.budget_inr or 500,
        passengers=payload.passengers or 1,
        notes=payload.notes or ""
    )

@router.get("/recommendations")
def get_ai_route_recommendations():
    """
    Returns high-frequency transfer patterns and direct route recommendations.
    """
    clusters = get_od_pattern_insights()
    return {
        "title": "AI Transfer Bottleneck & Route Recommendations",
        "description": "Discovered high-volume multi-leg journeys where direct routes eliminate transfer congestion.",
        "insights": clusters
    }
