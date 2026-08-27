from fastapi import APIRouter
from app.schemas.schemas import DemandPredictRequest, DemandPredictResponse
from app.ml.demand_prediction import predict_passenger_demand

router = APIRouter(prefix="/api/demand", tags=["Demand Analytics"])

@router.post("/predict", response_model=DemandPredictResponse)
def predict_demand(payload: DemandPredictRequest):
    result = predict_passenger_demand(
        route_id=payload.route_id,
        stop_id=payload.stop_id or "STOP-001",
        hour=payload.hour or 9,
        day_of_week=payload.day_of_week or 1,
        weather=payload.weather or "Sunny",
        traffic_level=payload.traffic_level or "Heavy"
    )
    return result

@router.get("/summary")
def get_demand_summary():
    return {
        "peak_hours": "08:00 - 10:30 AM & 05:00 - 08:00 PM",
        "overcrowded_routes": ["21G", "570", "M70", "18B"],
        "underutilized_routes": ["70", "45B", "5B"],
        "city_avg_occupancy": "74%",
        "predicted_fleet_shortfall": "12 Buses during peak morning corridor"
    }
