# CivicShield — AI-Enabled Verified Official Identity & Mobile Urban Sensing Platform

> **SIH 2026 Problem Statement PS 26124:** *"AI-Powered Mobile Urban Intelligence Platform Using Public Transport Fleet"*  
> **Tagline:** *"Trusted Officials. Safer Citizens. Smarter Mobility."*

CivicShield is an enterprise-grade Smart Governance and Mobile Urban Intelligence platform developed for the **Smart India Hackathon 2026 (PS 26124)**. It transforms public transport buses into continuous mobile urban sensing units detecting road potholes, damaged signs, traffic bottlenecks, pedestrian hazards, and license plate extraction, while providing cryptographic official identity verification and multimodal transit planning.

---

## 🌟 Key Platform Capabilities

### 1. 🚌 Mobile Fleet AI Sensing Dashboard (`/sih-sensing`) — SIH PS 26124 Primary Showcase
- **Onboard Multi-Camera Inspector**: Switch between 4 onboard video streams (Front Road Camera 🎥, Rear Traffic Camera 🎥, Side Obstacle Camera 🎥, Passenger Cabin Safety Camera 🎥).
- **Edge AI Bounding Box Overlays**: Real-time simulated computer vision detection tagging `POTHOLE_SEVERE` (94.8%), `DAMAGED_SIGN` (91.2%), `PEDESTRIAN_DANGER` (96.4%), and `ANPR_LICENSE_PLATE` (`TN-09-AB-1234`).
- **NVIDIA Jetson AGX Orin Edge AI Architecture**: Local onboard inference (45 FPS) filtering 99.98% of silent video frames and transmitting only 800-byte JSON event alerts to save cellular bandwidth.
- **Central GIS Command Map**: Live Leaflet GIS map auto-pinning hazards with automated Municipal Repair Work Orders (e.g. Ticket `#GCC-ROAD-4092` dispatched to Greater Chennai Corporation).
- **11-Step Interactive Evaluator Story Controller**: Step-by-step interactive walkthrough featuring **BUS 104A** (`TN-01-N-9842`).

### 2. 🛡️ Official Identity Verification (`/verify`)
- **QR Identity Scanner**: Instant camera scanner, manual Officer ID lookup, or QR image upload using `html5-qrcode`.
- **Verification Badges**:
  - 🟢 **✓ OFFICIAL VERIFIED** (`TN-POL-10001` - R. K. Selvam, Traffic Inspector).
  - 🔴 **✕ NOT VERIFIED / DO NOT PAY** (`INVALID-999` fake official warning).
  - ⚠️ **OFFICIAL SUSPENDED** (`TN-POL-10004` suspended officer alert).
- **Anti-Extortion Warning Cards**: Instant visual advice alerting citizens against extortion.
- **Official Badge Generator (`/official/qr`)**: Instant QR badge printing for government officers.

### 3. 🤖 Machine Learning Anti-Abuse Trust Engine (`/ratings`)
- **IsolationForest Anomaly Model (`ml/rating_anomaly.py`)**: Evaluates multi-metric citizen feedback (Professionalism, Behavior, Transparency, Service Quality) and detects rating manipulation bursts from duplicate IP/device IDs.

### 4. 🗺️ Multimodal Travel Planner & Gemini AI Trip Manager (`/mobility`, `/trip-manager`)
- **Route Fare & Time Solver**: Weighted utility scoring comparing bus, cab, auto, and metro modes.
- **Google Gemini 1.5 Flash API Integration**: Natural language conversational trip manager generating multi-stop itineraries with traffic avoidance advice.

### 5. 🏢 Government Office Locator & Queue Prediction (`/offices`)
- **Haversine Distance Calculator**: Locates nearby Police, Hospital, EB, SRO, and Municipal offices.
- **Linear Regression Queue Predictor**: Estimates office wait times and suggests optimal arrival hours.

### 6. 🧠 AI / ML Analytics & Prediction Engine (`/ml-analytics`)
- **Multiclass Transit Delay Classifier**: Evaluates and benchmarks Random Forest (Winner: 89.2% Test F1), Gradient Boosting, and Logistic Regression on 1,200 real Tamil Nadu Kaggle transit records.
- **Interactive ML Visualizations**: Dynamic Confusion Matrix Heatmap, Multi-Class ROC-AUC Curves (One-vs-Rest), Feature Importance ranking bar chart, and Train vs Test generalization metrics.
- **Live Inference Pipeline**: Interactive feature sliders (Route, Weather, Traffic Density, Occupancy, Peak Hours) producing real-time delay classifications, confidence scores, and automated fleet dispatch directives.
- **Citizen Rating Anti-Abuse Classifier**: Supervised classification model trained on 500 records to detect and quarantine review-bombing bursts and fake officer extortion retaliations.

---

## 🔑 Demo Role Accounts

| Role | Email | Password | Access Portal |
| :--- | :--- | :--- | :--- |
| **Citizen** | `citizen@demo.com` | `Demo@123` | `/dashboard`, `/verify`, `/sih-sensing`, `/offices`, `/mobility`, `/trip-manager`, `/help` |
| **Official** | `officer@demo.com` | `Demo@123` | `/official/dashboard`, `/official/qr` |
| **Transport Authority** | `authority@demo.com` | `Demo@123` | `/authority/dashboard`, `/authority/scheduling` |
| **Admin** | `admin@demo.com` | `Demo@123` | `/admin`, `/admin/officers`, `/admin/offices`, `/admin/analytics` |

---

## 🏃 Local Execution Instructions

### Prerequisites
- Python 3.10+
- Node.js 18+

### 1. Start FastAPI Backend Server
```bash
cd /Users/purushothambalamurali/Desktop/civicAI
python3 -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

### 2. Start Next.js Web Application
```bash
cd /Users/purushothambalamurali/Desktop/civicAI/frontend
npm run dev
```

* **Frontend Application**: [http://localhost:3000](http://localhost:3000)
* **SIH PS 26124 Dashboard**: [http://localhost:3000/sih-sensing](http://localhost:3000/sih-sensing)
* **Backend API Docs**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

---

## 🧪 SIH Evaluator 11-Step Walkthrough (BUS 104A)

1. Open **CivicShield** at `http://localhost:3000/sih-sensing`.
2. Observe **BUS 104A** (`TN-01-N-9842`) telemetry on Route 70H.
3. Click **Step 1** to select BUS 104A.
4. Click **Step 2** to inspect the 4 onboard camera streams (Front, Rear, Side, Cabin).
5. Click **Step 3** to watch computer vision detect a **Severe Asphalt Pothole** on the Front camera.
6. Observe the yellow bounding box overlay with `POTHOLE_SEVERE (94.8%)` confidence.
7. Click **Step 5** to view Edge AI GPS tagging (`13.0067°N, 80.2020°E`) and ISO timestamp.
8. Observe the hazard auto-pinning onto the central Leaflet GIS map.
9. Click **Step 8** to inspect real-time vehicle counting (1,420 Bikes, 580 Autos, 1,120 Cars) and Kathipara bottleneck delay (+14 mins).
10. Click **Step 10** to inspect ANPR license plate extraction (`TN-09-AB-1234`) on the Rear camera feed.
11. Observe automated Municipal Work Order `#GCC-ROAD-4092` dispatched to repair crews.

---

## 🛠️ Technology Stack

* **Frontend**: Next.js 14.2.35 (App Router), React 18, TypeScript, Tailwind CSS, Leaflet 1.9.4 GIS, HTML5-QRCode.
* **Backend**: Python FastAPI, Uvicorn, WebSockets, SQLAlchemy ORM.
* **AI / ML**: Scikit-Learn (IsolationForest, RandomForestRegressor, DBSCAN), Google Gemini 1.5 Flash API, TensorRT/YOLOv8 Edge AI Simulator.
* **Database**: SQLite (`civicai.db`).
