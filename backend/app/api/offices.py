from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.models.models import Office
from app.ml.office_queue_prediction import predict_office_queue
from typing import Optional
import math

router = APIRouter(prefix="/api/offices", tags=["Government Offices"])

def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculates distance between two coordinates in kilometers."""
    R = 6371.0  # Earth radius in km
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat / 2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return round(R * c, 2)

@router.get("")
def get_offices(
    category: Optional[str] = None,
    pincode: Optional[str] = None,
    city: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Office)
    
    if category and category.lower() != "all":
        query = query.filter(Office.category.ilike(f"%{category}%"))
    if pincode:
        query = query.filter(Office.pincode == pincode.strip())
    if city:
        query = query.filter(Office.city.ilike(f"%{city}%"))
    if search:
        query = query.filter(
            (Office.name.ilike(f"%{search}%")) |
            (Office.address.ilike(f"%{search}%")) |
            (Office.category.ilike(f"%{search}%"))
        )
        
    offices = query.all()
    return offices

@router.get("/nearby")
def get_nearby_offices(
    lat: float = Query(13.0315, description="Current latitude"),
    lng: float = Query(80.1812, description="Current longitude"),
    category: Optional[str] = None,
    radius_km: float = 15.0,
    db: Session = Depends(get_db)
):
    query = db.query(Office)
    if category and category.lower() != "all":
        query = query.filter(Office.category.ilike(f"%{category}%"))
        
    offices = query.all()
    results = []
    
    for off in offices:
        dist = haversine_distance(lat, lng, off.latitude, off.longitude)
        if dist <= radius_km:
            results.append({
                "office_id": off.office_id,
                "name": off.name,
                "category": off.category,
                "address": off.address,
                "pincode": off.pincode,
                "city": off.city,
                "latitude": off.latitude,
                "longitude": off.longitude,
                "phone": off.phone,
                "opening_hours": off.opening_hours,
                "distance_km": dist
            })
            
    results.sort(key=lambda x: x["distance_km"])
    return results

from pydantic import BaseModel

class ProcedureQuery(BaseModel):
    query: str
    office_category: Optional[str] = "General"

@router.get("/queue-predict/{office_id}")
def get_office_queue_prediction(office_id: str, hour: int = 11):
    """
    Predicts visitor queue density, wait time, and optimal visit slot.
    """
    return predict_office_queue(office_id, hour)

@router.post("/procedure-query")
def get_office_procedure_ai(payload: ProcedureQuery):
    q = payload.query.lower()
    
    if "driving" in q or "rto" in q or "license" in q:
        return {
            "title": "Driving License Application Procedure (RTO)",
            "office_category": "Transport (RTO)",
            "steps": [
                "1. Apply online on Parivahan Sarathi portal & obtain Learner's License (LLR).",
                "2. Schedule DL slot online for driving test track at your local RTO.",
                "3. Bring original LLR, Aadhaar card, Address proof, and vehicle for test.",
                "4. Complete bio-metric photo capture and physical driving test on track.",
                "5. DL smart card dispatched via Speed Post within 7 working days."
            ],
            "documents_required": [
                "Aadhaar Card / Voter ID (Address & Age Proof)",
                "Valid Learner's License (LLR Number)",
                "Medical Certificate Form 1-A (for commercial / age 40+)",
                "Application Reference Form & Fee Receipt (₹200 LLR + ₹300 DL)"
            ],
            "fee_inr": 500,
            "estimated_queue_mins": 35,
            "best_visit_time": "11:30 AM (Post-morning surge)"
        }
    elif "property" in q or "sro" in q or "registration" in q or "patta" in q:
        return {
            "title": "Property Sale Deed Registration Procedure (SRO)",
            "office_category": "Sub-Registrar Office (SRO)",
            "steps": [
                "1. Create draft Sale Deed with registered advocate/deed writer.",
                "2. Pay Stamp Duty (7%) & Registration Fee (4%) online via TN TNREGINET portal.",
                "3. Book token slot for biometric registration at designated SRO.",
                "4. Buyer, Seller & 2 Witnesses present original IDs and sign deed.",
                "5. Biometric fingerprint scan & photo capture by Sub-Registrar officer.",
                "6. Registered Sale Deed document issued on the same day."
            ],
            "documents_required": [
                "Draft Sale Deed / Parent Document Copies",
                "Encumbrance Certificate (EC) for last 30 years",
                "Patta / Chitta copy in seller's name",
                "Aadhaar Card & PAN Card of Buyer, Seller, and 2 Witnesses",
                "Online Stamp Duty Payment Challan & Slot Token"
            ],
            "fee_inr": "7% Stamp Duty + 4% Registration Fee",
            "estimated_queue_mins": 50,
            "best_visit_time": "02:30 PM (Post-lunch slot)"
        }
    elif "police" in q or "complaint" in q or "fir" in q or "verification" in q:
        return {
            "title": "Police NOC & Complaint Procedure",
            "office_category": "Police Department",
            "steps": [
                "1. File online CSR / Lost Document report on TN Police e-Services portal.",
                "2. For formal complaints, visit jurisdictional Police Station Duty Officer.",
                "3. Receive CSR (Community Service Register) receipt acknowledgement.",
                "4. Officer conducts enquiry and issues FIR or resolution report."
            ],
            "documents_required": [
                "Government Identity Proof (Aadhaar / Passport)",
                "Written complaint petition detailing event date, location, and loss",
                "Proof of ownership (for lost mobile IMEI / vehicle document)"
            ],
            "fee_inr": 0,
            "estimated_queue_mins": 15,
            "best_visit_time": "10:30 AM or 04:00 PM"
        }
    else:
        return {
            "title": f"Civic Service Procedure: {payload.query}",
            "office_category": payload.office_category or "Government Services",
            "steps": [
                "1. Check required category office on CivicShield map locator.",
                "2. Carry valid Government ID proof (Aadhaar Card & PAN Card).",
                "3. Present application at counter and collect token receipt.",
                "4. Track application status online or receive SMS updates."
            ],
            "documents_required": [
                "Aadhaar Card (Original & Self-attested copy)",
                "Proof of Address / Ration Card / Utility Bill",
                "Passport size photographs (2 copies)"
            ],
            "fee_inr": 100,
            "estimated_queue_mins": 25,
            "best_visit_time": "11:00 AM"
        }
