from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.models.models import Officer, Rating
from app.schemas.schemas import OfficerVerifyResponse, RatingSubmit, RatingResponse
from app.ml.rating_anomaly import evaluate_rating_anomaly
from datetime import datetime

router = APIRouter(prefix="/api/officers", tags=["Officers & QR Verification"])

@router.get("")
def get_all_officers(db: Session = Depends(get_db)):
    officers = db.query(Officer).all()
    results = []
    for off in officers:
        results.append({
            "officer_id": off.officer_id,
            "name": off.name,
            "department": off.department,
            "designation": off.designation,
            "office_location": off.office_location,
            "verification_status": off.verification_status,
            "trust_score": off.trust_score,
            "verified_date": off.verified_date,
            "photo_url": off.photo_url
        })
    return results

@router.get("/{officer_id}/verify")
def verify_officer(officer_id: str, db: Session = Depends(get_db)):
    """
    Core official QR verification endpoint.
    Returns officer details and verification state (ACTIVE, SUSPENDED, INVALID).
    """
    officer = db.query(Officer).filter(Officer.officer_id == officer_id.strip().upper()).first()
    
    if not officer:
        return {
            "status": "INVALID",
            "message": "Officer ID not found or inactive. Always verify before making payments or sharing sensitive information.",
            "officer": None
        }
        
    if officer.verification_status == "SUSPENDED":
        return {
            "status": "SUSPENDED",
            "message": "WARNING: OFFICIAL IS CURRENTLY SUSPENDED FROM DUTY. DO NOT REMIT FINES TO THIS OFFICER.",
            "officer": {
                "officer_id": officer.officer_id,
                "name": officer.name,
                "department": officer.department,
                "designation": officer.designation,
                "office_location": officer.office_location,
                "verification_status": officer.verification_status,
                "trust_score": officer.trust_score,
                "verified_date": officer.verified_date,
                "photo_url": officer.photo_url
            }
        }

    return {
        "status": "VERIFIED",
        "message": "OFFICIAL VERIFIED SUCCESSFUL. Verified active government officer.",
        "officer": {
            "officer_id": officer.officer_id,
            "name": officer.name,
            "department": officer.department,
            "designation": officer.designation,
            "office_location": officer.office_location,
            "verification_status": officer.verification_status,
            "trust_score": officer.trust_score,
            "verified_date": officer.verified_date,
            "photo_url": officer.photo_url
        }
    }

@router.post("/{officer_id}/rating", response_model=RatingResponse)
def submit_officer_rating(
    officer_id: str,
    rating_data: RatingSubmit,
    request: Request,
    db: Session = Depends(get_db)
):
    officer = db.query(Officer).filter(Officer.officer_id == officer_id).first()
    if not officer:
        raise HTTPException(status_code=404, detail="Officer not found")

    client_ip = request.client.host if request.client else "127.0.0.1"
    rating_val = round((rating_data.professionalism + rating_data.behavior + rating_data.transparency + rating_data.service_quality) / 4.0, 1)

    # Execute ML Anomaly Detection Model
    anomaly_score, is_suspicious, status_msg = evaluate_rating_anomaly(
        rating_val=rating_val,
        prof=rating_data.professionalism,
        beh=rating_data.behavior,
        transp=rating_data.transparency,
        qual=rating_data.service_quality,
        comment=rating_data.comment or "",
        ip_address=client_ip,
        user_id="DEMO-CITIZEN-01",
        db_session=db
    )

    new_rating = Rating(
        officer_id=officer_id,
        citizen_id="DEMO-CITIZEN-01",
        professionalism=rating_data.professionalism,
        behavior=rating_data.behavior,
        transparency=rating_data.transparency,
        service_quality=rating_data.service_quality,
        rating_value=rating_val,
        comment=rating_data.comment,
        ip_address=client_ip,
        created_at=datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S"),
        is_suspicious=is_suspicious,
        anomaly_score=anomaly_score
    )
    db.add(new_rating)
    
    # Update officer's trust score smoothly if rating is valid
    if not is_suspicious:
        officer.trust_score = round((officer.trust_score * 0.85) + (rating_val * 0.15), 1)

    db.commit()
    db.refresh(new_rating)

    return {
        "rating_id": new_rating.id,
        "officer_id": officer_id,
        "rating_value": rating_val,
        "anomaly_score": anomaly_score,
        "is_suspicious": is_suspicious,
        "status_message": status_msg
    }
