import asyncio
import json
import random
from typing import List
from fastapi import WebSocket
from sqlalchemy.orm import Session
from app.database.connection import SessionLocal
from app.models.models import LiveVehicle

class BusConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        print(f"🔌 WebSocket client connected. Active connections: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
            print(f"🔌 WebSocket client disconnected. Active connections: {len(self.active_connections)}")

    async def broadcast(self, message: str):
        for connection in list(self.active_connections):
            try:
                await connection.send_text(message)
            except Exception as e:
                print(f"WebSocket send error: {e}")
                self.disconnect(connection)

bus_manager = BusConnectionManager()

async def simulate_live_bus_movements():
    """
    Background worker loop that simulates bus movement in Chennai every 3 seconds.
    """
    while True:
        try:
            db: Session = SessionLocal()
            vehicles = db.query(LiveVehicle).limit(30).all()
            
            updated_buses = []
            for bus in vehicles:
                # Slight coordinate jitter to simulate live driving
                lat_delta = (random.random() - 0.5) * 0.0006
                lng_delta = (random.random() - 0.5) * 0.0006
                
                bus.current_lat = round(bus.current_lat + lat_delta, 4)
                bus.current_lng = round(bus.current_lng + lng_delta, 4)
                bus.speed_kmh = round(random.uniform(18.0, 42.0), 1)
                
                updated_buses.append({
                    "vehicle_id": bus.vehicle_id,
                    "bus_number": bus.bus_number,
                    "route_id": bus.route_id,
                    "current_lat": bus.current_lat,
                    "current_lng": bus.current_lng,
                    "speed_kmh": bus.speed_kmh,
                    "occupancy_percent": bus.occupancy_percent,
                    "next_stop_id": bus.next_stop_id,
                    "eta_mins": max(1, bus.eta_mins + random.choice([-1, 0, 1]))
                })
                
            db.commit()
            db.close()
            
            if bus_manager.active_connections:
                payload = json.dumps({
                    "type": "bus_position_update",
                    "timestamp": asyncio.get_event_loop().time(),
                    "buses": updated_buses
                })
                await bus_manager.broadcast(payload)
        except Exception as e:
            print(f"Bus simulation error: {e}")
            
        await asyncio.sleep(3)
