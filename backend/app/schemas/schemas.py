from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

# AUTH SCHEMAS
class UserRegister(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    role: Optional[str] = "CITIZEN"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user: dict

# OFFICER SCHEMAS
class OfficerVerifyResponse(BaseModel):
    officer_id: str
    name: str
    department: str
    designation: str
    office_location: str
    verification_status: str
    trust_score: float
    verified_date: Optional[str] = None
    photo_url: Optional[str] = None

class RatingSubmit(BaseModel):
    officer_id: str
    professionalism: int
    behavior: int
    transparency: int
    service_quality: int
    comment: Optional[str] = ""

class RatingResponse(BaseModel):
    rating_id: int
    officer_id: str
    rating_value: float
    anomaly_score: float
    is_suspicious: bool
    status_message: str

# OFFICE SCHEMAS
class OfficeResponse(BaseModel):
    office_id: str
    name: str
    category: str
    address: str
    pincode: str
    city: str
    latitude: float
    longitude: float
    phone: Optional[str] = None
    opening_hours: Optional[str] = None
    distance_km: Optional[float] = None

# ROUTE & MOBILITY SCHEMAS
class RoutePlanRequest(BaseModel):
    origin: str
    destination: str
    passengers: Optional[int] = 1
    preference: Optional[str] = "BALANCED" # FASTEST, CHEAPEST, BALANCED, LEAST_TRANSFERS

class RouteOption(BaseModel):
    mode: str  # BUS, CAB, AUTO, BUS_WALK
    route_name: str
    travel_time_mins: int
    cost_inr: float
    transfers: int
    distance_km: float
    traffic_level: str
    demand_level: str
    route_score: float
    highlight_tag: Optional[str] = None
    explanation: str

class RoutePlanResponse(BaseModel):
    origin: str
    destination: str
    options: List[RouteOption]
    recommended_mode: str
    ai_recommendation_reason: str

# DEMAND & SCHEDULING SCHEMAS
class DemandPredictRequest(BaseModel):
    route_id: str
    stop_id: Optional[str] = "STOP-001"
    hour: Optional[int] = 9
    day_of_week: Optional[int] = 1
    weather: Optional[str] = "Sunny"
    traffic_level: Optional[str] = "Heavy"

class DemandPredictResponse(BaseModel):
    route_id: str
    current_demand: int
    predicted_demand: int
    demand_status: str  # HIGH DEMAND, MODERATE DEMAND, LOW DEMAND
    recommended_action: str
    ai_explanation: str

class ScheduleOptimizeRequest(BaseModel):
    route_id: Optional[str] = None

class ScheduleRecommendation(BaseModel):
    route_id: str
    route_code: str
    current_frequency_mins: int
    predicted_demand: int
    recommended_frequency_mins: int
    status_action: str  # Increase Frequency, Reduce Frequency, Optimal
    reasoning: str

# GRIEVANCE SCHEMAS
class GrievanceSubmit(BaseModel):
    category: str
    description: str
    location: Optional[str] = None
    officer_id: Optional[str] = None
    image_url: Optional[str] = None

class GrievanceResponse(BaseModel):
    complaint_id: str
    citizen_email: str
    category: str
    description: str
    status: str
    created_at: datetime
