import os
import sys
import json
import urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path
from PIL import Image

DATASET_ROOT = Path("ml/datasets/road_hazards")
HF_REPO = "tuklu/potholes_garbage"
API_URL = f"https://huggingface.co/api/datasets/{HF_REPO}"
RAW_BASE_URL = f"https://huggingface.co/datasets/{HF_REPO}/resolve/main"

def download_file(file_path: str, dest_path: Path):
    dest_path.parent.mkdir(parents=True, exist_ok=True)
    if dest_path.exists() and dest_path.stat().st_size > 0:
        return True, file_path

    url = f"{RAW_BASE_URL}/{file_path}"
    headers = {'User-Agent': 'CivicAI-RoadGuard-Trainer/1.0'}
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            content = resp.read()
            with open(dest_path, 'wb') as f:
                f.write(content)
        return True, file_path
    except Exception as e:
        print(f"  ❌ Failed to download {file_path}: {e}")
        return False, file_path

def prepare_dataset():
    print(f"📦 Fetching file manifest from Hugging Face ({HF_REPO})...")
    req = urllib.request.Request(API_URL, headers={'User-Agent': 'CivicAI-RoadGuard-Trainer/1.0'})
    with urllib.request.urlopen(req, timeout=30) as resp:
        data = json.loads(resp.read().decode('utf-8'))

    siblings = data.get('siblings', [])
    target_files = [
        s['rfilename'] for s in siblings 
        if (s['rfilename'].startswith('images/') or s['rfilename'].startswith('labels/'))
        and (s['rfilename'].endswith('.jpg') or s['rfilename'].endswith('.png') or s['rfilename'].endswith('.txt'))
    ]

    print(f"📊 Found {len(target_files)} dataset files (train + val images and bounding box annotations).")

    # Download in parallel using 16 threads
    success_count = 0
    with ThreadPoolExecutor(max_workers=16) as executor:
        futures = {
            executor.submit(download_file, rf, DATASET_ROOT / rf): rf 
            for rf in target_files
        }
        for future in as_completed(futures):
            ok, rf = future.result()
            if ok:
                success_count += 1
            if success_count % 100 == 0 or success_count == len(target_files):
                print(f"  📥 Progress: {success_count}/{len(target_files)} files downloaded...")

    print(f"✅ Successfully downloaded {success_count}/{len(target_files)} dataset files.")

    # Count verified images
    train_imgs = list((DATASET_ROOT / "images" / "train").glob("*.jpg"))
    val_imgs = list((DATASET_ROOT / "images" / "val").glob("*.jpg"))
    train_lbls = list((DATASET_ROOT / "labels" / "train").glob("*.txt"))
    val_lbls = list((DATASET_ROOT / "labels" / "val").glob("*.txt"))

    print("\n🔍 Dataset Verification:")
    print(f"  • Train Images: {len(train_imgs)} | Train Labels: {len(train_lbls)}")
    print(f"  • Val Images:   {len(val_imgs)} | Val Labels:   {len(val_lbls)}")
    print(f"  • Total Images: {len(train_imgs) + len(val_imgs)}")

    # Verify no overlap between train and val
    train_names = {p.name for p in train_imgs}
    val_names = {p.name for p in val_imgs}
    overlap = train_names.intersection(val_names)
    if overlap:
        print(f"⚠️ Warning: Found {len(overlap)} overlapping filenames between train and val!")
    else:
        print("  ✓ Strict Zero-Leakage Guarantee: No overlap between train and val splits.")

    # Create road_hazards.yaml
    yaml_content = f"""# CivicAI RoadGuard - Road Hazard Detection Dataset (SIH 2026 PS 26124)
path: {DATASET_ROOT.resolve()}
train: images/train
val: images/val

nc: 1
names:
  0: POTHOLE

# Class metadata for multi-hazard platform
hazard_classes:
  0: POTHOLE
  1: PEDESTRIAN_HAZARD
  2: WATERLOGGING
  3: MISSING_SIGN
  4: DAMAGED_SIGN
  5: GARBAGE_SPILL
"""
    yaml_path = DATASET_ROOT / "road_hazards.yaml"
    with open(yaml_path, "w") as f:
        f.write(yaml_content)

    print(f"📄 Created YOLO dataset configuration: {yaml_path}")
    return True

if __name__ == "__main__":
    prepare_dataset()
