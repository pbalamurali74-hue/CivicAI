import os
import joblib
import pandas as pd
import numpy as np

MODEL_PATH = "backend/app/ml/saved_models/demand_model.joblib"

def predict_passenger_demand(route_id: str, stop_id: str = "STOP-001", hour: int = 9, day_of_week: int = 1, weather: str = "Sunny", traffic_level: str = "Heavy") -> dict:
    """
    Predicts passenger demand for a route given operational conditions.
    """
    holiday = 1 if day_of_week >= 5 else 0
    predicted_count = 85
    
    if os.path.exists(MODEL_PATH):
        try:
            artifact = joblib.load(MODEL_PATH)
            model = artifact['model']
            le_route = artifact['le_route']
            le_stop = artifact['le_stop']
            le_weather = artifact['le_weather']
            le_traffic = artifact['le_traffic']
            
            # Safe label encoding fallback
            r_enc = le_route.transform([route_id])[0] if route_id in le_route.classes_ else 0
            s_enc = le_stop.transform([stop_id])[0] if stop_id in le_stop.classes_ else 0
            w_enc = le_weather.transform([weather])[0] if weather in le_weather.classes_ else 0
            t_enc = le_traffic.transform([traffic_level])[0] if traffic_level in le_traffic.classes_ else 0
            
            X_in = pd.DataFrame([{
                'route_enc': r_enc,
                'stop_enc': s_enc,
                'weather_enc': w_enc,
                'day_of_week': day_of_week,
                'hour': hour,
                'holiday': holiday,
                'traffic_enc': t_enc
            }])
            
            pred = model.predict(X_in)[0]
            predicted_count = int(round(max(15, pred)))
        except Exception as e:
            print(f"Demand model fallback: {e}")
            
    # Baseline comparison logic
    base_demand = 60
    if 8 <= hour <= 10 or 17 <= hour <= 19:
        status = "HIGH DEMAND"
        action = "Increase bus frequency by 30-50% during peak hour window."
        explanation = f"Passenger demand on {route_id} is predicted to reach {predicted_count} passengers (vs normal baseline {base_demand}) due to peak commuting hours ({hour:02d}:00) and {traffic_level.lower()} traffic."
    elif 11 <= hour <= 16:
        status = "MODERATE DEMAND"
        action = "Maintain standard off-peak schedule."
        explanation = f"Passenger demand on {route_id} is predicted at {predicted_count} passengers. Service is operating within normal capacity limits."
    else:
        status = "LOW DEMAND"
        action = "Reduce frequency or reallocate spare buses to high-demand corridors."
        explanation = f"Night/Early morning demand on {route_id} is projected at {predicted_count} passengers."

    return {
        "route_id": route_id,
        "current_demand": int(predicted_count * 0.75),
        "predicted_demand": int(predicted_count),
        "demand_status": status,
        "recommended_action": action,
        "ai_explanation": explanation
    }
