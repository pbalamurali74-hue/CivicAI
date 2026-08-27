from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.models.models import BusRoute
from app.ml.schedule_optimizer import optimize_bus_schedule

router = APIRouter(prefix="/api/scheduling", tags=["Transport Authority Scheduling"])

@router.post("/optimize")
def generate_schedule_recommendations(db: Session = Depends(get_db)):
    """
    Executes optimization algorithm to minimize passenger wait times, operating cost,
    and overcrowding across all bus routes.
    """
    routes = db.query(BusRoute).all()
    route_dicts = [
        {
            "route_id": r.route_id,
            "route_code": r.route_code,
            "origin": r.origin,
            "destination": r.destination,
            "frequency_mins": r.frequency_mins
        } for r in routes
    ]
    
    recommendations = optimize_bus_schedule(route_dicts)
    return {
        "status": "SUCCESS",
        "total_routes_analyzed": len(routes),
        "schedule_recommendations": recommendations
    }

@router.post("/approve/{route_id}")
def approve_schedule_change(route_id: str, new_frequency_mins: int, db: Session = Depends(get_db)):
    route = db.query(BusRoute).filter(BusRoute.route_id == route_id).first()
    if not route:
        return {"status": "ERROR", "message": "Route not found"}
        
    old_freq = route.frequency_mins
    route.frequency_mins = new_frequency_mins
    db.commit()
    
    return {
        "status": "APPROVED",
        "route_id": route_id,
        "route_code": route.route_code,
        "previous_frequency": f"{old_freq} mins",
        "new_frequency": f"{new_frequency_mins} mins",
        "message": f"Updated timetable for Route {route.route_code}. Dispatch frequency set to every {new_frequency_mins} minutes."
    }
