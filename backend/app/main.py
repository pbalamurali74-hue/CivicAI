import asyncio
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from app.config import settings
from app.database.connection import engine, Base, SessionLocal
from app.services.seeder import seed_database
from app.websocket.bus_tracker import bus_manager, simulate_live_bus_movements
from app.services.gemini_service import generate_trip_plan_with_gemini

from app.api import auth, officers, offices, routes, buses, demand, scheduling, grievances, admin, sensing, ml_analytics

# Create Database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Unified Civic Trust & Smart Mobility Platform API",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Startup event: Seed database & start live bus simulation loop
@app.on_event("startup")
async def startup_event():
    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()
    
    # Start live bus movement simulator loop in background
    asyncio.create_task(simulate_live_bus_movements())

# Include API Routers
app.include_router(auth.router)
app.include_router(officers.router)
app.include_router(offices.router)
app.include_router(routes.router)
app.include_router(buses.router)
app.include_router(demand.router)
app.include_router(scheduling.router)
app.include_router(grievances.router)
app.include_router(admin.router)
app.include_router(sensing.router)
app.include_router(ml_analytics.router)

class AssistantQuery(BaseModel):
    query: str
    context: Optional[str] = ""

@app.get("/")
def root():
    return {
        "platform": settings.PROJECT_NAME,
        "status": "ONLINE",
        "version": "1.0.0",
        "city": "Chennai, Tamil Nadu",
        "documentation": "/docs"
    }

@app.get("/api/city-pulse")
def get_city_pulse():
    return {
        "city": "Chennai, Tamil Nadu",
        "overall_status": "NORMAL",
        "transport_status": "GOOD",
        "verification_status": "SAFE",
        "services_status": "NORMAL",
        "traffic_status": "HIGH DEMAND",
        "active_alerts_count": 7,
        "telemetry": {
            "active_buses": 100,
            "on_time_performance_percent": 94.2,
            "today_verifications": 142,
            "suspicious_reports": 2,
            "open_grievances": 12
        },
        "ai_insights": [
            "3 routes experiencing high peak demand (Route 21G, 70H, 18B).",
            "12 suspicious verification reports requiring routine review.",
            "4 government offices experiencing high visitor volume (SRO T. Nagar).",
            "Peak congestion expected on Kathipara & Anna Salai between 17:00–19:30."
        ]
    }

@app.post("/api/assistant/query")
def process_assistant_query(payload: AssistantQuery):
    prompt = payload.query
    res = generate_trip_plan_with_gemini(prompt)
    return {
        "query": prompt,
        "answer": res.get("summary", "CivicAI Assistant is ready to help you navigate Chennai governance and transit services."),
        "details": res
    }

@app.websocket("/ws/buses")
async def websocket_buses(websocket: WebSocket):
    await bus_manager.connect(websocket)
    try:
        while True:
            # Keep socket alive
            data = await websocket.receive_text()
    except WebSocketDisconnect:
        bus_manager.disconnect(websocket)
