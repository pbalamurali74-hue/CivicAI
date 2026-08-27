import os
import pandas as pd
import numpy as np
import joblib
from sklearn.ensemble import RandomForestRegressor, IsolationForest
from sklearn.cluster import KMeans
from sklearn.preprocessing import LabelEncoder

os.makedirs("backend/app/ml/saved_models", exist_ok=True)

print("⚡ Training CivicAI Machine Learning Models...")

# 1. DEMAND PREDICTION MODEL
df_demand = pd.read_csv("data/demand.csv")

le_route = LabelEncoder()
le_stop = LabelEncoder()
le_weather = LabelEncoder()
le_traffic = LabelEncoder()

df_demand['route_enc'] = le_route.fit_transform(df_demand['route_id'])
df_demand['stop_enc'] = le_stop.fit_transform(df_demand['stop_id'])
df_demand['weather_enc'] = le_weather.fit_transform(df_demand['weather'])
df_demand['traffic_enc'] = le_traffic.fit_transform(df_demand['traffic_level'])

X_demand = df_demand[['route_enc', 'stop_enc', 'weather_enc', 'day_of_week', 'hour', 'holiday', 'traffic_enc']]
y_demand = df_demand['passenger_count']

demand_model = RandomForestRegressor(n_estimators=50, random_state=42)
demand_model.fit(X_demand, y_demand)

# Save model and encoders
joblib.dump({
    'model': demand_model,
    'le_route': le_route,
    'le_stop': le_stop,
    'le_weather': le_weather,
    'le_traffic': le_traffic
}, "backend/app/ml/saved_models/demand_model.joblib")
print("  ✓ Passenger Demand Prediction model trained and saved.")

# 2. RATING ANOMALY DETECTION MODEL
df_ratings = pd.read_csv("data/ratings.csv")

# Compute IP frequency feature
ip_counts = df_ratings['ip_address'].value_counts()
df_ratings['ip_freq'] = df_ratings['ip_address'].map(ip_counts)
df_ratings['comment_len'] = df_ratings['comment'].fillna('').apply(len)

X_ratings = df_ratings[['rating_value', 'professionalism', 'behavior', 'transparency', 'service_quality', 'ip_freq', 'comment_len']]

anomaly_model = IsolationForest(contamination=0.15, random_state=42)
anomaly_model.fit(X_ratings)

joblib.dump({
    'model': anomaly_model,
    'features': ['rating_value', 'professionalism', 'behavior', 'transparency', 'service_quality', 'ip_freq', 'comment_len']
}, "backend/app/ml/saved_models/anomaly_model.joblib")
print("  ✓ Rating Anomaly Detection model trained and saved.")

# 3. OD CLUSTERING MODEL
df_od = pd.read_csv("data/od_data.csv")

X_od = df_od[['passenger_count', 'transfers_count', 'preferred_hour']]
kmeans = KMeans(n_clusters=3, random_state=42)
df_od['cluster'] = kmeans.fit_predict(X_od)

joblib.dump({
    'model': kmeans,
    'data': df_od.to_dict(orient='records')
}, "backend/app/ml/saved_models/od_clustering.joblib")
print("  ✓ Origin-Destination Clustering model trained and saved.")

print("🚀 All ML models trained and saved to backend/app/ml/saved_models/")
