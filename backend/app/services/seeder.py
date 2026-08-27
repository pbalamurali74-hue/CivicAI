import csv
import os
import hashlib
from sqlalchemy.orm import Session
from app.models.models import User, Officer, Office, BusStop, BusRoute, LiveVehicle, Rating, Grievance

def get_password_hash(password: str) -> str:
    """Standard SHA-256 password hashing for robust zero-dependency hashing."""
    return hashlib.sha256(password.encode('utf-8')).hexdigest()

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return get_password_hash(plain_password) == hashed_password

def seed_database(db: Session):
    print("🌱 Checking and seeding database...")
    
    # 1. SEED DEFAULT DEMO USERS
    if db.query(User).count() == 0:
        demo_users = [
            User(email="citizen@demo.com", hashed_password=get_password_hash("Demo@123"), full_name="Rahul Verma (Citizen)", role="CITIZEN"),
            User(email="officer@demo.com", hashed_password=get_password_hash("Demo@123"), full_name="Rajesh Kumar (Inspector)", role="OFFICIAL"),
            User(email="authority@demo.com", hashed_password=get_password_hash("Demo@123"), full_name="Chennai Transport Director", role="AUTHORITY"),
            User(email="admin@demo.com", hashed_password=get_password_hash("Demo@123"), full_name="CivicAI Super Admin", role="ADMIN"),
        ]
        db.add_all(demo_users)
        db.commit()
        print("  ✓ Demo accounts created.")

    # 2. SEED OFFICERS
    if db.query(Officer).count() == 0 and os.path.exists("data/officers.csv"):
        with open("data/officers.csv", mode="r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            officers = [
                Officer(
                    officer_id=row["officer_id"],
                    name=row["name"],
                    department=row["department"],
                    designation=row["designation"],
                    office_location=row["office_location"],
                    verification_status=row["verification_status"],
                    trust_score=float(row["trust_score"]),
                    verified_date=row["verified_date"],
                    photo_url=row["photo_url"]
                ) for row in reader
            ]
            db.add_all(officers)
            db.commit()
            print(f"  ✓ {len(officers)} Officers loaded from CSV.")

    # 3. SEED OFFICES
    if db.query(Office).count() == 0 and os.path.exists("data/offices.csv"):
        with open("data/offices.csv", mode="r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            offices = [
                Office(
                    office_id=row["office_id"],
                    name=row["name"],
                    category=row["category"],
                    address=row["address"],
                    pincode=row["pincode"],
                    city=row["city"],
                    latitude=float(row["latitude"]),
                    longitude=float(row["longitude"]),
                    phone=row["phone"],
                    opening_hours=row["opening_hours"]
                ) for row in reader
            ]
            db.add_all(offices)
            db.commit()
            print(f"  ✓ {len(offices)} Government Offices loaded from CSV.")

    # 4. SEED BUS STOPS
    if db.query(BusStop).count() == 0 and os.path.exists("data/bus_stops.csv"):
        with open("data/bus_stops.csv", mode="r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            stops = [
                BusStop(
                    stop_id=row["stop_id"],
                    stop_name=row["stop_name"],
                    latitude=float(row["latitude"]),
                    longitude=float(row["longitude"])
                ) for row in reader
            ]
            db.add_all(stops)
            db.commit()
            print(f"  ✓ {len(stops)} Bus Stops loaded from CSV.")

    # 5. SEED BUS ROUTES
    if db.query(BusRoute).count() == 0 and os.path.exists("data/bus_routes.csv"):
        with open("data/bus_routes.csv", mode="r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            routes = [
                BusRoute(
                    route_id=row["route_id"],
                    route_code=row["route_code"],
                    origin=row["origin"],
                    destination=row["destination"],
                    distance_km=float(row["distance_km"]),
                    base_fare=float(row["base_fare"]),
                    frequency_mins=int(row["frequency_mins"]),
                    path_stops=row["path_stops"]
                ) for row in reader
            ]
            db.add_all(routes)
            db.commit()
            print(f"  ✓ {len(routes)} Bus Routes loaded from CSV.")

    # 6. SEED VEHICLES
    if db.query(LiveVehicle).count() == 0 and os.path.exists("data/vehicles.csv"):
        with open("data/vehicles.csv", mode="r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            vehicles = [
                LiveVehicle(
                    vehicle_id=row["vehicle_id"],
                    bus_number=row["bus_number"],
                    route_id=row["route_id"],
                    current_lat=float(row["current_lat"]),
                    current_lng=float(row["current_lng"]),
                    speed_kmh=float(row["speed_kmh"]),
                    occupancy_percent=int(row["occupancy_percent"]),
                    next_stop_id=row["next_stop_id"],
                    eta_mins=int(row["eta_mins"])
                ) for row in reader
            ]
            db.add_all(vehicles)
            db.commit()
            print(f"  ✓ {len(vehicles)} Live Vehicles loaded from CSV.")

    # 7. SEED INITIAL GRIEVANCE DEMOS
    if db.query(Grievance).count() == 0:
        grievances = [
            Grievance(complaint_id="CIV-2026-000101", citizen_email="citizen@demo.com", category="Fake Official", description="Unverified individual claiming to be traffic inspector asked for cash fine near Guindy.", location="Guindy Station Road", officer_id="TN-POL-10004", status="Under Review"),
            Grievance(complaint_id="CIV-2026-000102", citizen_email="citizen@demo.com", category="Bus Overcrowding", description="Route 21G severely overcrowded during 8:30 AM peak hour, request extra frequency.", location="SRM Ramapuram Bus Stop", officer_id=None, status="Submitted"),
            Grievance(complaint_id="CIV-2026-000103", citizen_email="citizen@demo.com", category="Wrong Office Info", description="Ramapuram EB office timing updated on board but not reflected accurately.", location="Ramapuram EB", officer_id=None, status="Resolved"),
        ]
        db.add_all(grievances)
        db.commit()
        print("  ✓ Sample Grievance records created.")

    print("✅ Database seeding completed!")
