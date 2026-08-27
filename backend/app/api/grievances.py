from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.models.models import Grievance
from app.schemas.schemas import GrievanceSubmit, GrievanceResponse
from datetime import datetime
import random

router = APIRouter(prefix="/api/grievances", tags=["Civic Grievances"])

@router.post("", response_model=GrievanceResponse)
def submit_grievance(payload: GrievanceSubmit, db: Session = Depends(get_db)):
    comp_id = f"CIV-2026-{random.randint(100000, 999999)}"
    
    new_grievance = Grievance(
        complaint_id=comp_id,
        citizen_email="citizen@demo.com",
        category=payload.category,
        description=payload.description,
        location=payload.location,
        officer_id=payload.officer_id,
        image_url=payload.image_url,
        status="Submitted",
        created_at=datetime.utcnow()
    )
    db.add(new_grievance)
    db.commit()
    db.refresh(new_grievance)
    return new_grievance

@router.get("")
def get_grievances(status: str = None, db: Session = Depends(get_db)):
    query = db.query(Grievance)
    if status:
        query = query.filter(Grievance.status.ilike(f"%{status}%"))
    
    results = []
    for g in query.all():
        results.append({
            "ticket_id": g.complaint_id,
            "complaint_id": g.complaint_id,
            "category": g.category,
            "description": g.description,
            "location": g.location,
            "officer_id": g.officer_id,
            "status": g.status,
            "created_at": str(g.created_at) if g.created_at else ""
        })
    return results

@router.patch("/{complaint_id}/status")
def update_grievance_status(complaint_id: str, new_status: str, db: Session = Depends(get_db)):
    g = db.query(Grievance).filter(Grievance.complaint_id == complaint_id).first()
    if not g:
        raise HTTPException(status_code=404, detail="Complaint not found")
    g.status = new_status
    db.commit()
    return {"complaint_id": complaint_id, "updated_status": new_status}
