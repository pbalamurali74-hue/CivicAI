import json
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from pathlib import Path
from app.ml.hazard_yolo_service import hazard_yolo_service

router = APIRouter(prefix="/api/hazard", tags=["Road Hazard AI Detection (PS 26124)"])

class FrameDetectionRequest(BaseModel):
    image_base64: str = Field(..., description="Base64 encoded JPEG or PNG image frame")
    threshold: Optional[float] = Field(0.40, description="Confidence threshold (0.20 - 0.95)")
    iou_threshold: Optional[float] = Field(0.45, description="NMS IOU threshold")
    lat: Optional[float] = Field(None, description="Current Bus/Device Latitude (for Missing Sign GIS check)")
    lng: Optional[float] = Field(None, description="Current Bus/Device Longitude (for Missing Sign GIS check)")

@router.post("/detect-frame")
async def detect_hazard_frame(req: FrameDetectionRequest):
    """
    Real-Time YOLO Deep Learning Frame Detection
    SIH 2026 PS 26124 Road Hazard & Infrastructure Intelligence
    """
    if not req.image_base64:
        raise HTTPException(status_code=400, detail="Missing image_base64 payload")

    conf = max(0.20, min(0.95, float(req.threshold or 0.40)))
    result = hazard_yolo_service.detect_frame(
        req.image_base64,
        conf_threshold=conf,
        iou_threshold=req.iou_threshold or 0.45,
        lat=req.lat,
        lng=req.lng
    )
    return result

@router.get("/metrics")
async def get_hazard_model_metrics():
    """
    Returns verifiable model metrics: Precision, Recall, mAP50, mAP50-95,
    dataset composition, and live inference speed.
    """
    base_dir = Path(__file__).resolve().parent.parent
    metrics_files = [
        base_dir / "ml/saved_models/six_hazard_metrics.json",
        base_dir.parent / "ml/models/six_hazard_metrics.json",
        base_dir / "ml/saved_models/training_metrics.json",
        base_dir.parent / "ml/models/training_metrics.json",
        Path("backend/app/ml/saved_models/six_hazard_metrics.json"),
        Path("ml/models/six_hazard_metrics.json")
    ]

    metrics_data = {}
    for mf in metrics_files:
        if mf.exists():
            try:
                with open(mf, "r") as f:
                    metrics_data = json.load(f)
                    break
            except Exception:
                pass

    return {
        "status": "ONLINE",
        "service_name": "CivicAI RoadGuard Edge Inference Engine",
        "problem_statement": "SIH 2026 PS 26124",
        "model_loaded": hazard_yolo_service.model_name,
        "is_fine_tuned": hazard_yolo_service.is_custom_trained,
        "is_six_hazard_model": hazard_yolo_service.is_six_hazard_model,
        "device": hazard_yolo_service.device.upper(),
        "weights_path": hazard_yolo_service.model_path,
        "classes": [
            "POTHOLE",
            "PEDESTRIAN_HAZARD",
            "WATERLOGGING",
            "POTENTIAL_MISSING_SIGN",
            "DAMAGED_SIGN",
            "GARBAGE_SPILL"
        ],
        "training_report": metrics_data
    }

@router.post("/reload-model")
async def reload_hazard_model():
    """Reloads latest trained weights into active memory."""
    ok = hazard_yolo_service.reload_best_weights()
    return {
        "status": "SUCCESS" if ok else "NO_UPDATE",
        "model_name": hazard_yolo_service.model_name,
        "is_fine_tuned": hazard_yolo_service.is_custom_trained,
        "is_six_hazard_model": hazard_yolo_service.is_six_hazard_model
    }
