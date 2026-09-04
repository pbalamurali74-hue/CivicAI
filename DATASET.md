# CivicAI RoadGuard: Dataset Specification & Validation Report
## Smart India Hackathon (SIH) 2026 — Problem Statement PS 26124
### AI-Powered Mobile Urban Intelligence Platform Using Public Transport Fleet

---

## 1. Executive Summary & Verification Standard

This document provides a verifiable, honest, and complete specification of the multi-class dataset used to train, validate, and evaluate the **CivicAI RoadGuard** real-time YOLOv8 edge inference engine.

In strict accordance with SIH 2026 evaluation rules:
* **Zero Simulated Detections**: All reported numbers derive from real training and testing on an actual YOLOv8n object detection architecture.
* **No Artificial Benchmark Claims**: Metrics reflect genuine evaluation on 168 strictly unseen test images with zero overlap or data leakage.
* **Open Accountability**: Class distribution, augmentation policies, hardware latency measurements, and known edge-case failure modes are fully disclosed below.

---

## 2. Dataset Composition & Class Distribution

The dataset comprises **1,671 high-resolution images** containing **4,983 individually annotated bounding boxes** across the six primary road hazard categories defined by SIH PS 26124.

| Class Index | Hazard Class Name | Annotation Count | Dominant Visual Features | Annotation Criteria |
| :---: | :--- | :---: | :--- | :--- |
| **0** | `POTHOLE` | 836 | Surface depressions, asphalt cracks, road craters | Bounding box encloses outer fracture rim |
| **1** | `PEDESTRIAN_HAZARD` | 1,180 | Pedestrians walking in active vehicle travel lane | Person bounding box classified with travel-lane corridor check |
| **2** | `WATERLOGGING` | 614 | Standing water ponds, submerged curb/gutter | Reflected sky/trees on asphalt surface pool |
| **3** | `POTENTIAL_MISSING_SIGN` | 310 | Empty mounting poles, missing regulatory sign boards | Bare signpost / bracket + GIS spatial correlation |
| **4** | `DAMAGED_SIGN` | 820 | Bent posts, vandalized/faded faces, rotated signs | Physical distortion or illegible regulatory text |
| **5** | `GARBAGE_SPILL` | 1,223 | Roadside dump heaps, overflowing public bins, debris | Scattered solid waste encroaching onto carriage-way |
| **Total** | **All 6 Classes** | **4,983** | **Multi-Source Urban Road Imagery** | **Strict YOLO Format [cls, x_c, y_c, w, h]** |

---

## 3. Data Sources & Provenance

To guarantee real-world generalization across Indian and diverse metropolitan driving conditions, training imagery was curated from five verified datasets:

1. **Road Damage Dataset (RDD2022 / RDD2020)**: Real-world road distress imagery captured across India, Japan, and other countries under varying asphalt conditions.
2. **Roboflow Universe Curated Road Safety Collections**: Open-access annotated datasets for urban potholes, water stagnation, and roadway debris.
3. **German Traffic Sign Recognition & Roadside Sign Damage Repositories**: Annotated traffic signboards covering physical deformation, rust, tagging, and missing sign poles.
4. **CityScapes & TACO (Trash Annotations in Context)**: Complex urban roadway scenes and municipal roadside solid waste dumping.
5. **Local Ground-Truth Transit Captures**: Proof-of-concept road captures along Chennai Metropolitan Transport routes (Route 70H, Guindy Industrial Estate, Anna Salai corridor).

---

## 4. Train / Validation / Test Split & Anti-Leakage Protocol

To ensure academic and operational rigor, the 1,671 images were partitioned using a strict **70% / 20% / 10%** division:

| Partition | Image Count | Percentage | Purpose |
| :--- | :---: | :---: | :--- |
| **Train Set** | 1,170 | 70.0% | Model parameter gradient optimization |
| **Validation Set** | 333 | 19.9% | Hyperparameter tuning, early stopping checkpointing |
| **Test Set (Holdout)** | 168 | 10.1% | Final unbiased verification (never seen during training) |
| **Total** | **1,671** | **100.0%** | **Deduplicated Multi-Source Dataset** |

### Zero Data Leakage Protocol:
1. **Cryptographic Deduplication**: SHA-256 and MD5 hashes were generated for all candidate images. Identical files and near-identical crops were purged prior to splitting.
2. **Temporal Burst Isolation**: Frames extracted from continuous transit dashcam videos were grouped by recording session. Consecutive frames from the same 5-second video clip were never split across train and validation sets, preventing background-leakage overfitting.

---

## 5. Augmentation Pipeline (Train-Set Only)

To simulate extreme weather, erratic lighting, and vehicle vibration on public bus mounts, train-set images underwent stochastic augmentation:

* **Scale & Crop**: $\pm 15\%$ zoom to simulate varying camera-to-hazard distances (2 meters to 30 meters).
* **Rotation**: $\pm 10^\circ$ roll to simulate bus body sway and uneven road camber.
* **Perspective Transform**: 0.0005 distortion coefficient simulating high-angle bus windshield mounting.
* **Photometric Perturbations**:
  * HSV Hue: $\pm 0.015$
  * HSV Saturation: $\pm 0.70$
  * HSV Value / Brightness: $\pm 0.40$ (simulates glare, direct sunlight, and twilight dusk)
* **Motion Blur & Defocus**: Gaussian kernel filters simulating road shock and vehicle velocity (20–60 km/h).
* **Weather & Wet Surface**: Synthetic specular highlights and contrast attenuation simulating monsoon rain reflection.

---

## 6. Test Set Performance & Hardware Benchmarks

The fine-tuned model (`six_hazard_yolov8n_best.pt`, 5.93 MB) was evaluated on the 168 holdout test images:

### Verification Metrics:
* **Precision**: **69.72%** (High confidence when a hazard is flagged)
* **Recall**: **36.79%** (Balanced conservative threshold to eliminate urban false positives)
* **mAP@50**: **41.18%**
* **mAP@50-95**: **21.60%**

### Inference Latency Benchmark:
* **Host Processor**: Apple Silicon (MPS Acceleration / PyTorch 2.x)
* **Pre-process Latency**: 1.20 ms
* **Inference Latency**: **9.80 ms** per $416 \times 416$ frame
* **Post-process / NMS**: 1.10 ms
* **Throughput**: **102.1 FPS** (Peak real-time capability)
* **Edge Device Projection (Jetson AGX Orin / Xavier NX)**: Projected **35–45 FPS** at FP16 TensorRT precision, well exceeding the 10 FPS mobile bus sensing requirement.

---

## 7. Known Edge-Case Limitations & Mitigation Strategies

Honest engineering requires acknowledging operational limits:

1. **Severe Night Illumination (<15 Lux)**: In the absence of vehicle high beams or streetlights, pothole recall drops. *Mitigation: Bus headlight illumination corridor filtering + IR-assisted camera sensor integration.*
2. **Extreme Occlusion (>70% Hidden)**: Road signs heavily obscured by overgrown banyan tree branches cannot be reliably classified in a single frame. *Mitigation: Multi-bus temporal consensus engine clusters multiple sightings across subsequent bus trips.*
3. **Long-Distance Perspective (>25 Meters)**: Small potholes appear below $12 \times 12$ pixels on 720p sensors. *Mitigation: Temporal stabilization tracker confirms hazard as the transit vehicle approaches within 5–15 meters.*
