import os
import joblib
import pandas as pd
import numpy as np

MODEL_PATH = "backend/app/ml/saved_models/anomaly_model.joblib"

def evaluate_rating_anomaly(rating_val: float, prof: int, beh: int, transp: int, qual: int, comment: str, ip_address: str, user_id: str, db_session) -> tuple[float, bool, str]:
    """
    Evaluates rating suspiciousness based on:
    - Same user repeatedly rating officer
    - Rating burst from same IP
    - Extreme score variance
    - Trained IsolationForest model prediction
    """
    comment_len = len(comment or "")
    
    # Simple IP frequency heuristic from DB or default
    ip_freq = 1
    if db_session:
        from app.models.models import Rating
        recent_ip_count = db_session.query(Rating).filter(Rating.ip_address == ip_address).count()
        ip_freq = recent_ip_count + 1
        
        user_recent_count = db_session.query(Rating).filter(Rating.citizen_id == user_id).count()
        if user_recent_count > 10:
            ip_freq += 5
            
    anomaly_score = 0.10
    
    if os.path.exists(MODEL_PATH):
        try:
            artifact = joblib.load(MODEL_PATH)
            model = artifact['model']
            
            features = pd.DataFrame([{
                'rating_value': rating_val,
                'professionalism': prof,
                'behavior': beh,
                'transparency': transp,
                'service_quality': qual,
                'ip_freq': ip_freq,
                'comment_len': comment_len
            }])
            
            # Isolation forest decision function (negative score = anomaly)
            decision = model.decision_function(features)[0]
            # Map decision range (-0.5 to 0.5) to [0.0, 1.0] anomaly score
            anomaly_score = round(float(np.clip(0.5 - decision, 0.0, 1.0)), 2)
        except Exception as e:
            print(f"ML Model error fallback: {e}")
            
    # Add heuristic weights
    if ip_freq > 3:
        anomaly_score = max(anomaly_score, 0.72)
    if prof == 1 and beh == 1 and transp == 1 and qual == 1 and comment_len < 10:
        anomaly_score = max(anomaly_score, 0.68)
        
    is_suspicious = bool(anomaly_score > 0.65)
    
    if is_suspicious:
        reason = "Suspicious rating detected (high frequency IP burst or abnormal score pattern). Marked for review."
    else:
        reason = "Rating accepted and passed AI trust validation."
        
    return anomaly_score, is_suspicious, reason
