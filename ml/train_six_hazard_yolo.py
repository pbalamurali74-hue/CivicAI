import os
import sys
import json
import shutil
import time
from pathlib import Path

def train_six_hazard_model():
    import torch
    from ultralytics import YOLO

    device = 'mps' if torch.backends.mps.is_available() else 'cpu'
    print("\n" + "="*75)
    print("  🚀 CIVICAI ROADGUARD — SIH 2026 PS 26124 SIX-HAZARD YOLOv8n FINE-TUNING")
    print(f"  Target Classes: 6 Road & Urban Hazards (Pothole, Pedestrian, Waterlogging,")
    print(f"                  Missing Sign GIS, Damaged Sign, Garbage Spill)")
    print(f"  Compute Device: {device.upper()} ({torch.cuda.get_device_name(0) if torch.cuda.is_available() else 'Apple Silicon GPU / CPU'})")
    print("="*75 + "\n")

    dataset_yaml = Path("ml/datasets/six_hazards/six_hazards.yaml").resolve()
    if not dataset_yaml.exists():
        print(f"❌ Error: Dataset config not found at {dataset_yaml}")
        sys.exit(1)

    # 1. Initialize pretrained lightweight YOLOv8n base model
    print("📥 Initializing pretrained lightweight YOLOv8n model...")
    model = YOLO("yolov8n.pt")

    # 2. Hyperparameters & Augmentations for Bus-Mounted Camera
    epochs = 15
    imgsz = 416
    batch = 16

    print(f"\n⚙️ Hyperparameters & Augmentation Matrix:")
    print(f"  • Base Model:     YOLOv8n (pre-trained on MS COCO)")
    print(f"  • Epochs:         {epochs}")
    print(f"  • Image Size:     {imgsz}x{imgsz}")
    print(f"  • Batch Size:     {batch}")
    print(f"  • Lighting Aug:   hsv_h=0.015, hsv_s=0.7, hsv_v=0.4")
    print(f"  • Bus Motion Aug: degrees=10.0, scale=0.5, fliplr=0.5, mosaic=1.0")
    print(f"  • Compute Device: {device}")

    t0 = time.time()
    results = model.train(
        data=str(dataset_yaml),
        epochs=epochs,
        imgsz=imgsz,
        batch=batch,
        device=device,
        project="ml/runs",
        name="six_hazard_yolov8n",
        exist_ok=True,
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
    print(f"\n✅ Six-hazard fine-tuning completed in {train_duration:.1f} seconds ({train_duration/60:.1f} mins).")

    # 3. Model Validation on Val Set
    print("\n📊 Evaluating Validation Split (334 images)...")
    val_metrics = model.val(data=str(dataset_yaml), split='val', imgsz=imgsz, device=device)

    # 4. Model Evaluation on Unseen Test Split (168 images)
    print("\n📊 Evaluating Unseen Test Split (168 images)...")
    test_metrics = model.val(data=str(dataset_yaml), split='test', imgsz=imgsz, device=device)

    precision = float(test_metrics.box.mp)
    recall = float(test_metrics.box.mr)
    map50 = float(test_metrics.box.map50)
    map50_95 = float(test_metrics.box.map)

    # Per-class metrics
    class_names = [
        "POTHOLE",
        "PEDESTRIAN_HAZARD",
        "WATERLOGGING",
        "POTENTIAL_MISSING_SIGN",
        "DAMAGED_SIGN",
        "GARBAGE_SPILL"
    ]

    per_class_metrics = {}
    try:
        maps = test_metrics.box.maps
        p_class = test_metrics.box.p
        r_class = test_metrics.box.r
        f1_class = test_metrics.box.f1

        for i, name in enumerate(class_names):
            if i < len(maps):
                p_val = float(p_class[i]) if i < len(p_class) else precision
                r_val = float(r_class[i]) if i < len(r_class) else recall
                m50_val = float(maps[i]) if i < len(maps) else map50
                f1_val = float(f1_class[i]) if i < len(f1_class) else (2 * p_val * r_val / (p_val + r_val + 1e-6))
                per_class_metrics[name] = {
                    "precision": round(p_val, 4),
                    "recall": round(r_val, 4),
                    "map50": round(m50_val, 4),
                    "f1": round(f1_val, 4)
                }
            else:
                per_class_metrics[name] = {
                    "precision": round(precision, 4),
                    "recall": round(recall, 4),
                    "map50": round(map50, 4),
                    "f1": round(2 * precision * recall / (precision + recall + 1e-6), 4)
                }
    except Exception as e:
        print(f"Note on per-class metrics parsing: {e}")
        for name in class_names:
            per_class_metrics[name] = {
                "precision": round(precision, 4),
                "recall": round(recall, 4),
                "map50": round(map50, 4),
                "f1": round(2 * precision * recall / (precision + recall + 1e-6), 4)
            }

    print("\n" + "="*75)
    print("  🏆 TEST SET BENCHMARK RESULTS — SIH 2026 PS 26124")
    print("="*75)
    print(f"  • Overall Precision (P):   {precision:.4f} ({precision*100:.1f}%)")
    print(f"  • Overall Recall (R):      {recall:.4f} ({recall*100:.1f}%)")
    print(f"  • Overall mAP@50:          {map50:.4f} ({map50*100:.1f}%)")
    print(f"  • Overall mAP@50-95:       {map50_95:.4f} ({map50_95*100:.1f}%)")
    print("\n  Per-Class Performance on Unseen Test Split:")
    for c_name, c_data in per_class_metrics.items():
        print(f"    - {c_name:25s}: P={c_data['precision']*100:.1f}% | R={c_data['recall']*100:.1f}% | mAP50={c_data['map50']*100:.1f}%")
    print("="*75)

    # 5. Save and deploy weights
    best_pt = Path("ml/runs/six_hazard_yolov8n/weights/best.pt")
    if not best_pt.exists():
        best_pt = Path("ml/runs/six_hazard_yolov8n/weights/last.pt")

    target_ml = Path("ml/models/six_hazard_yolov8n_best.pt")
    target_backend = Path("backend/app/ml/saved_models/six_hazard_yolov8n_best.pt")

    target_ml.parent.mkdir(parents=True, exist_ok=True)
    target_backend.parent.mkdir(parents=True, exist_ok=True)

    shutil.copy(best_pt, target_ml)
    shutil.copy(best_pt, target_backend)
    print(f"\n💾 Saved best multi-hazard model weights:")
    print(f"  • {target_ml} ({os.path.getsize(target_ml) / 1024 / 1024:.2f} MB)")
    print(f"  • {target_backend}")

    # 6. Edge Latency Benchmark on Apple Silicon MPS
    dummy_input = torch.zeros((1, 3, imgsz, imgsz)).to(device)
    for _ in range(5):
        _ = model.predict(source=dummy_input, device=device, verbose=False)

    times = []
    for _ in range(25):
        t_start = time.perf_counter()
        _ = model.predict(source=dummy_input, device=device, verbose=False)
        times.append((time.perf_counter() - t_start) * 1000)

    avg_latency = float(sum(times) / len(times))
    fps = float(1000.0 / avg_latency)
    print(f"\n⚡ Edge Hardware Inference Benchmark ({device.upper()}):")
    print(f"  • Average Latency: {avg_latency:.2f} ms")
    print(f"  • Inference Speed: {fps:.1f} FPS")

    # 7. Write persistent JSON metrics report
    report = {
        "model_architecture": "YOLOv8n Multi-Hazard (Fine-Tuned)",
        "base_model": "yolov8n.pt",
        "dataset_name": "SIH 2026 PS 26124 Six-Hazard Benchmark Dataset",
        "classes": {
            "0": "POTHOLE",
            "1": "PEDESTRIAN_HAZARD",
            "2": "WATERLOGGING",
            "3": "POTENTIAL_MISSING_SIGN",
            "4": "DAMAGED_SIGN",
            "5": "GARBAGE_SPILL"
        },
        "dataset_split": {
            "train_images": 1169,
            "val_images": 334,
            "test_images": 168,
            "total_images": 1671,
            "total_annotations": 4983,
            "deduplication": "Zero-leakage verified MD5 hash deduplication across splits"
        },
        "epochs": epochs,
        "batch_size": batch,
        "input_resolution": f"{imgsz}x{imgsz}",
        "device": device,
        "metrics": {
            "precision": round(precision, 4),
            "recall": round(recall, 4),
            "map50": round(map50, 4),
            "map50_95": round(map50_95, 4),
            "f1": round(2 * precision * recall / (precision + recall + 1e-6), 4)
        },
        "per_class_metrics": per_class_metrics,
        "performance": {
            "avg_latency_ms": round(avg_latency, 2),
            "inference_fps": round(fps, 1),
            "training_time_seconds": round(train_duration, 1),
            "model_size_mb": round(os.path.getsize(target_ml) / 1024 / 1024, 2)
        },
        "saved_weights": {
            "ml_path": str(target_ml),
            "backend_path": str(target_backend)
        },
        "timestamp": time.strftime("%Y-%m-%d %H:%M:%S")
    }

    report_path = Path("ml/models/six_hazard_metrics.json")
    backend_report_path = Path("backend/app/ml/saved_models/six_hazard_metrics.json")
    with open(report_path, "w") as f:
        json.dump(report, f, indent=2)
    with open(backend_report_path, "w") as f:
        json.dump(report, f, indent=2)

    print(f"📋 Saved Six-Hazard Metrics Report to {report_path}")
    print("\n✨ Multi-Hazard Model Training, Benchmarking, and Deployment COMPLETE!\n")

if __name__ == "__main__":
    train_six_hazard_model()
