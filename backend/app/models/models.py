from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text, ForeignKey
from datetime import datetime
from app.database.connection import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    role = Column(String, default="CITIZEN")  # CITIZEN, OFFICIAL, AUTHORITY, ADMIN
    created_at = Column(DateTime, default=datetime.utcnow)

class Officer(Base):
    __tablename__ = "officers"

    officer_id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    department = Column(String, nullable=False)
    designation = Column(String, nullable=False)
    office_location = Column(String, nullable=False)
    verification_status = Column(String, default="ACTIVE")  # ACTIVE, SUSPENDED, PENDING
    trust_score = Column(Float, default=4.5)
    verified_date = Column(String, nullable=True)
    photo_url = Column(String, nullable=True)

class Office(Base):
    __tablename__ = "offices"

    office_id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    category = Column(String, nullable=False)  # Police, Hospital, EB, SRO, Municipality, Transport
    address = Column(String, nullable=False)
    pincode = Column(String, index=True, nullable=False)
    city = Column(String, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    phone = Column(String, nullable=True)
    opening_hours = Column(String, nullable=True)

class BusStop(Base):
    __tablename__ = "bus_stops"

    stop_id = Column(String, primary_key=True, index=True)
    stop_name = Column(String, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)

class BusRoute(Base):
    __tablename__ = "bus_routes"

    route_id = Column(String, primary_key=True, index=True)
    route_code = Column(String, nullable=False)
    origin = Column(String, nullable=False)
    destination = Column(String, nullable=False)
    distance_km = Column(Float, nullable=False)
    base_fare = Column(Float, nullable=False)
    frequency_mins = Column(Integer, nullable=False)
    path_stops = Column(Text, nullable=False)  # Comma-separated stop IDs

class LiveVehicle(Base):
    __tablename__ = "vehicles"

    vehicle_id = Column(String, primary_key=True, index=True)
    bus_number = Column(String, nullable=False)
    route_id = Column(String, ForeignKey("bus_routes.route_id"))
    current_lat = Column(Float, nullable=False)
    current_lng = Column(Float, nullable=False)
    speed_kmh = Column(Float, default=25.0)
    occupancy_percent = Column(Integer, default=50)
    next_stop_id = Column(String, nullable=True)
    eta_mins = Column(Integer, default=5)

class Rating(Base):
    __tablename__ = "ratings"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    officer_id = Column(String, ForeignKey("officers.officer_id"))
    citizen_id = Column(String, nullable=False)
    professionalism = Column(Integer, default=5)
    behavior = Column(Integer, default=5)
    transparency = Column(Integer, default=5)
    service_quality = Column(Integer, default=5)
    rating_value = Column(Float, nullable=False)
    comment = Column(Text, nullable=True)
    ip_address = Column(String, nullable=True)
    created_at = Column(String, nullable=False)
    is_suspicious = Column(Boolean, default=False)
    anomaly_score = Column(Float, default=0.0)

class Grievance(Base):
    __tablename__ = "grievances"

    complaint_id = Column(String, primary_key=True, index=True)
    citizen_email = Column(String, nullable=False)
    category = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    location = Column(String, nullable=True)
    officer_id = Column(String, nullable=True)
    image_url = Column(String, nullable=True)
    status = Column(String, default="Submitted")  # Submitted, Under Review, Assigned, Resolved
    created_at = Column(DateTime, default=datetime.utcnow)

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_email = Column(String, nullable=False)
    title = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    category = Column(String, default="INFO")
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
