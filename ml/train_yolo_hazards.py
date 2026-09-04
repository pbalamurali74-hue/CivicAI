import os
import sys
import json
import shutil
import time
from pathlib import Path

def train_roadguard_model():
    import torch
    from ultralytics import YOLO

    device = 'mps' if torch.backends.mps.is_available() else 'cpu'
    print("\n" + "="*70)
    print("  🚀 CIVICAI ROADGUARD — SIH 2026 PS 26124 YOLOv8n FINE-TUNING")
    print(f"  Target Classes: POTHOLE (Road Defect Hazard)")
    print(f"  Compute Device: {device.upper()} ({torch.cuda.get_device_name(0) if torch.cuda.is_available() else 'Apple Silicon GPU / CPU'})")
    print("="*70 + "\n")

    dataset_yaml = Path("ml/datasets/road_hazards_clean/road_hazards.yaml").resolve()
    if not dataset_yaml.exists():
        print(f"❌ Error: Dataset config not found at {dataset_yaml}")
        sys.exit(1)

    # 1. Initialize pretrained lightweight YOLOv8n model
    print("📥 Loading pretrained lightweight YOLOv8n base model...")
    model = YOLO("yolov8n.pt")

    # 2. Fine-tune model with comprehensive augmentations for moving vehicle / bus camera
    epochs = 15
    imgsz = 416
    batch = 16

    print(f"\n⚙️ Hyperparameters & Augmentation Configuration:")
    print(f"  • Base Model:     YOLOv8n (pre-trained on MS COCO)")
    print(f"  • Epochs:         {epochs}")
    print(f"  • Image Size:     {imgsz}x{imgsz}")
    print(f"  • Batch Size:     {batch}")
    print(f"  • Lighting Aug:   hsv_h=0.015, hsv_s=0.7, hsv_v=0.4")
    print(f"  • Bus Motion Aug: degrees=10.0, scale=0.5, fliplr=0.5, mosaic=1.0")
    print(f"  • Device:         {device}")

    t0 = time.time()
    results = model.train(
        data=str(dataset_yaml),
        epochs=epochs,
        imgsz=imgsz,
        batch=batch,
        device=device,
        project="ml/runs",
        name="roadguard_yolov8n",
        exist_ok=True,
        # Augmentations for road vibration, daylight, weather & camera distance
        hsv_h=0.015,
        hsv_s=0.7,
        hsv_v=0.4,
        degrees=10.0,
        scale=0.5,
        fliplr=0.5,
        mosaic=1.0,
        plots=True,
        verbose=True
    )
    train_duration = time.time() - t0
    print(f"\n✅ Fine-tuning completed in {train_duration:.1f} seconds.")

    # 3. Model Validation
    print("\n📊 Running Validation on Unseen Test/Validation Set...")
    val_metrics = model.val(data=str(dataset_yaml), imgsz=imgsz, device=device)

    precision = float(val_metrics.box.mp)
    recall = float(val_metrics.box.mr)
    map50 = float(val_metrics.box.map50)
    map50_95 = float(val_metrics.box.map)

    print("\n" + "="*70)
    print("  🏆 VALIDATION METRICS — SIH 2026 PS 26124 BENCHMARK")
    print("="*70)
    print(f"  • Precision (P):   {precision:.4f} ({precision*100:.1f}%)")
    print(f"  • Recall (R):      {recall:.4f} ({recall*100:.1f}%)")
    print(f"  • mAP@50:          {map50:.4f} ({map50*100:.1f}%)")
    print(f"  • mAP@50-95:       {map50_95:.4f} ({map50_95*100:.1f}%)")
    print("="*70)

    # 4. Save and export weights
    best_pt = Path("ml/runs/roadguard_yolov8n/weights/best.pt")
    if not best_pt.exists():
        best_pt = Path("ml/runs/roadguard_yolov8n/weights/last.pt")

    target_ml = Path("ml/models/roadguard_yolov8n_best.pt")
    target_backend = Path("backend/app/ml/saved_models/roadguard_yolov8n_best.pt")

    target_ml.parent.mkdir(parents=True, exist_ok=True)
    target_backend.parent.mkdir(parents=True, exist_ok=True)

    shutil.copy(best_pt, target_ml)
    shutil.copy(best_pt, target_backend)
    print(f"\n💾 Saved best model weights:")
    print(f"  • {target_ml}")
    print(f"  • {target_backend}")

    # 5. Measure latency benchmark
    dummy_input = torch.zeros((1, 3, imgsz, imgsz)).to(device)
    # Warmup
    for _ in range(5):
        _ = model.predict(source=dummy_input, device=device, verbose=False)
    
    times = []
    for _ in range(20):
        t_start = time.perf_counter()
        _ = model.predict(source=dummy_input, device=device, verbose=False)
        times.append((time.perf_counter() - t_start) * 1000)

    avg_latency = float(sum(times) / len(times))
    fps = float(1000.0 / avg_latency)
    print(f"\n⚡ Edge Inference Benchmark:")
    print(f"  • Average Latency: {avg_latency:.2f} ms")
    print(f"  • Inference Speed: {fps:.1f} FPS")

    # 6. Save persistent JSON metrics report
    report = {
        "model_architecture": "YOLOv8n (Fine-Tuned)",
        "base_model": "yolov8n.pt",
        "dataset_name": "SIH 2026 PS 26124 Road Hazard Benchmark (RDD2022/Roboflow)",
        "dataset_split": {
            "train_images": 544,
            "val_images": 137,
            "total_images": 681
        },
        "target_class": "POTHOLE",
        "epochs": epochs,
        "batch_size": batch,
        "input_resolution": f"{imgsz}x{imgsz}",
        "device": device,
        "metrics": {
            "precision": round(precision, 4),
            "recall": round(recall, 4),
            "map50": round(map50, 4),
            "map50_95": round(map50_95, 4)
        },
        "performance": {
            "avg_latency_ms": round(avg_latency, 2),
            "inference_fps": round(fps, 1),
            "training_time_seconds": round(train_duration, 1)
        },
        "saved_weights": {
            "ml_path": str(target_ml),
            "backend_path": str(target_backend)
        },
        "timestamp": time.strftime("%Y-%m-%d %H:%M:%S")
    }

    report_path = Path("ml/models/training_metrics.json")
    backend_report_path = Path("backend/app/ml/saved_models/training_metrics.json")
    with open(report_path, "w") as f:
        json.dump(report, f, indent=2)
    with open(backend_report_path, "w") as f:
        json.dump(report, f, indent=2)

    print(f"📋 Saved Training Metrics Report to {report_path}")
    print("\n✨ Model training, evaluation, and deployment ready!\n")

if __name__ == "__main__":
    train_roadguard_model()
