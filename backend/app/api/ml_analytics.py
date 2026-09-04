"""
CivicShield Machine Learning Analytics API Router
Exposes training performance benchmarks, statistics, dynamic graph data,
model comparisons, and live prediction pipelines for civic & transit decision support.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from app.ml.ml_analytics_engine import ml_analytics_engine

router = APIRouter(prefix="/api/ml", tags=["Machine Learning Analytics & Predictions"])


class BusDelayPredictionRequest(BaseModel):
    route_code: str = Field(..., example="70H", description="MTC / TNSTC Bus Route Code")
    hour_of_day: int = Field(8, ge=0, le=23, description="Hour of departure (0-23)")
    day_of_week: int = Field(0, ge=0, le=6, description="Day of week (0=Mon, 6=Sun)")
    weather_condition: str = Field("Rain", example="Rain", description="Weather (Clear, Rain, Fog, Monsoon_Heavy)")
    traffic_density_index: float = Field(0.85, ge=0.0, le=1.0, description="Congestion index between 0.0 and 1.0")
    passenger_occupancy_percent: float = Field(95.0, ge=0.0, le=200.0, description="Passenger load percentage")
    distance_km: Optional[float] = Field(15.0, ge=1.0, description="Route distance in km")
    is_peak_hour: Optional[int] = Field(None, ge=0, le=1, description="Optional peak hour flag")
    model_name: Optional[str] = Field(None, description="Model to evaluate (Random Forest, Gradient Boosting, Logistic Regression)")


class RatingAbusePredictionRequest(BaseModel):
    rating_value: float = Field(1.0, ge=1.0, le=5.0)
    professionalism: int = Field(1, ge=1, le=5)
    behavior: int = Field(1, ge=1, le=5)
    transparency: int = Field(1, ge=1, le=5)
    service_quality: int = Field(1, ge=1, le=5)
    ip_freq: Optional[int] = Field(5, ge=1)
    comment: Optional[str] = Field("Unsatisfactory experience fake officer!", description="Citizen feedback comment")


@router.get("/bus-delay/train-report")
def get_bus_delay_training_report():
    """
    Returns full empirical evaluation report for the Bus Delay Classification Models:
    - 3 algorithms compared (Random Forest, Gradient Boosting, Logistic Regression)
    - Accuracy, Precision, Recall, F1-Score, ROC-AUC, Training Latency
    - Confusion matrices, Feature importance rankings, Multi-class ROC curves
    - Dataset properties & class distribution
    """
    try:
        return ml_analytics_engine.report_cache
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate ML report: {str(e)}")


@router.post("/bus-delay/predict")
def predict_bus_delay(payload: BusDelayPredictionRequest):
    """
    Live prediction endpoint:
    Passes project telemetry through identical feature preprocessing and trained model,
    returning delay classification, confidence score, probability distribution, and AI action recommendations.
    """
    try:
        result = ml_analytics_engine.predict_bus_delay_risk(
            route_code=payload.route_code,
            hour=payload.hour_of_day,
            day_of_week=payload.day_of_week,
            weather=payload.weather_condition,
            traffic_density=payload.traffic_density_index,
            occupancy=payload.passenger_occupancy_percent,
            distance_km=payload.distance_km or 18.0,
            is_peak_hour=payload.is_peak_hour,
            model_name=payload.model_name
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")


@router.post("/bus-delay/retrain")
def retrain_models():
    """
    Dynamically re-executes the complete ML training pipeline from source data,
    re-benchmarking all 3 algorithms and refreshing model metrics in memory.
    """
    try:
        fresh_report = ml_analytics_engine.train_all_models()
        return {
            "status": "SUCCESS",
            "message": "Models successfully retrained from scratch on dataset.",
            "best_model": ml_analytics_engine.best_model_name,
            "report": fresh_report
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Retraining failed: {str(e)}")


@router.get("/rating-abuse/train-report")
def get_rating_abuse_training_report():
    """
    Returns training report for the Citizen Rating Abuse / Anomaly Detection model.
    """
    try:
        return ml_analytics_engine.rating_abuse_cache
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Rating abuse report error: {str(e)}")


@router.post("/rating-abuse/predict")
def predict_rating_abuse(payload: RatingAbusePredictionRequest):
    """
    Evaluates citizen rating submission for suspicious manipulation / extortion pattern.
    """
    try:
        result = ml_analytics_engine.predict_rating_abuse(
            rating_value=payload.rating_value,
            professionalism=payload.professionalism,
            behavior=payload.behavior,
            transparency=payload.transparency,
            service_quality=payload.service_quality,
            ip_freq=payload.ip_freq or 1,
            comment=payload.comment or ""
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Abuse prediction error: {str(e)}")
