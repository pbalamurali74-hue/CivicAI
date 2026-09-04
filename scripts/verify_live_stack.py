import json
import base64
import numpy as np
import cv2
import urllib.request
import urllib.parse
import time

def verify_live_stack():
    print("\n" + "="*70)
    print("  🌐 VERIFYING FULL MULTI-TIER LIVE ROADGUARD STACK")
    print("="*70)

    # 1. Check FastAPI YOLO Metrics Endpoint
    try:
        req = urllib.request.Request("http://127.0.0.1:8000/api/hazard/metrics")
        with urllib.request.urlopen(req, timeout=3) as resp:
            data = json.loads(resp.read().decode())
            print("\n1️⃣ FastAPI YOLO Service (Port 8000):")
            print(f"   ✓ Status:       {data.get('status')}")
            print(f"   ✓ Active Model: {data.get('model_loaded')}")
            print(f"   ✓ Device:       {data.get('device')}")
            print(f"   ✓ Fine-Tuned:   {data.get('is_fine_tuned')}")
            print(f"   ✓ 6-Hazard:     {data.get('is_six_hazard_model')}")
            print(f"   ✓ Precision:    {data.get('training_report', {}).get('metrics', {}).get('precision')}")
            print(f"   ✓ Recall:       {data.get('training_report', {}).get('metrics', {}).get('recall')}")
            print(f"   ✓ mAP50:        {data.get('training_report', {}).get('metrics', {}).get('map50')}")
    except Exception as e:
        print(f"   ❌ FastAPI check failed: {e}")

    # 2. Check RoadGuard Server Status
    try:
        req = urllib.request.Request("http://127.0.0.1:3001/api/status")
        with urllib.request.urlopen(req, timeout=3) as resp:
            data = json.loads(resp.read().decode())
            print("\n2️⃣ Standalone RoadGuard Server (Port 3001):")
            print(f"   ✓ Status:       {data.get('status')}")
            print(f"   ✓ App Name:     {data.get('app_name')}")
            print(f"   ✓ Fleet Bus:    {data.get('primary_bus')}")
            print(f"   ✓ Route:        {data.get('route')}")
            print(f"   ✓ Classes:      {len(data.get('target_classes', []))} classes")
    except Exception as e:
        print(f"   ❌ RoadGuard server check failed: {e}")

    # 3. Test End-to-End Frame Forwarding (3001 -> 8000)
    try:
        # Create a sample test frame with high contrast cavity
        test_frame = np.full((320, 320, 3), 80, dtype=np.uint8)
        cv2.circle(test_frame, (160, 200), 30, (20, 20, 20), -1)
        _, buf = cv2.imencode('.jpg', test_frame, [int(cv2.IMWRITE_JPEG_QUALITY), 75])
        b64_str = base64.b64encode(buf).decode('utf-8')

        payload = json.dumps({
            "image_base64": b64_str,
            "threshold": 0.35,
            "lat": 13.0067,
            "lng": 80.2025
        }).encode('utf-8')

        t0 = time.perf_counter()
        req = urllib.request.Request(
            "http://127.0.0.1:3001/api/pothole/detect-frame",
            data=payload,
            headers={'Content-Type': 'application/json'}
        )
        with urllib.request.urlopen(req, timeout=4) as resp:
            data = json.loads(resp.read().decode())
            lat_ms = (time.perf_counter() - t0) * 1000
            print("\n3️⃣ End-to-End Loopback Inference (Client -> 3001 -> 8000):")
            print(f"   ✓ Status:           {data.get('status')}")
            print(f"   ✓ Inference Engine: {data.get('inference_engine')}")
            print(f"   ✓ Round-trip Lat:   {lat_ms:.1f} ms (Server: {data.get('latency_ms')} ms)")
            print(f"   ✓ Detections Count: {data.get('count')}")
            for d in data.get('detections', []):
                print(f"     • {d.get('class')}: {d.get('confidence_percent')}% (Risk: {d.get('risk_score')}, Source: {d.get('source')})")
    except Exception as e:
        print(f"   ❌ End-to-end inference test failed: {e}")

    print("\n" + "="*70)
    print("  🏆 VERIFICATION COMPLETE")
    print("="*70 + "\n")

if __name__ == "__main__":
    verify_live_stack()
