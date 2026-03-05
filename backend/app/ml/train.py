"""
Train the XGBoost fault diagnosis classifier.

Usage:
    python -m app.ml.train

Output:
    app/ml/models/fault_classifier.pkl
    app/ml/models/feature_scaler.pkl
    app/ml/models/label_encoder.pkl
    app/ml/models/model_metadata.json
"""

import json
import time
from pathlib import Path

import joblib
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.metrics import accuracy_score, f1_score
from xgboost import XGBClassifier

from app.ml.dataset import generate_dataset, FAULT_CLASSES

FEATURE_COLS = [
    "voltage_ab", "voltage_bc", "voltage_ac",
    "current_a", "current_b", "current_c",
    "active_power", "reactive_power",
    "frequency", "temperature", "irradiance",
    "voltage_imbalance", "current_imbalance",
    "power_factor", "power_to_irradiance",
]

MODELS_DIR = Path(__file__).parent / "models"


def train():
    MODELS_DIR.mkdir(exist_ok=True)
    print("📊 Generating synthetic dataset...")
    t0 = time.time()
    df = generate_dataset()
    print(f"   {len(df)} samples generated in {time.time() - t0:.1f}s")

    X = df[FEATURE_COLS].values
    y = df["fault_class"].values

    le = LabelEncoder()
    y_enc = le.fit_transform(y)

    X_train, X_test, y_train, y_test = train_test_split(
        X, y_enc, test_size=0.2, random_state=42, stratify=y_enc
    )

    print("🏋️  Training XGBoost classifier...")
    t1 = time.time()

    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    clf = XGBClassifier(
        n_estimators=300,
        max_depth=6,
        learning_rate=0.1,
        subsample=0.8,
        colsample_bytree=0.8,
        use_label_encoder=False,
        eval_metric="mlogloss",
        random_state=42,
        n_jobs=-1,
    )
    clf.fit(
        X_train_scaled, y_train,
        eval_set=[(X_test_scaled, y_test)],
        verbose=False,
    )
    train_time = time.time() - t1
    print(f"   Training done in {train_time:.1f}s")

    # Evaluate
    y_pred = clf.predict(X_test_scaled)
    acc = accuracy_score(y_test, y_pred)
    f1 = f1_score(y_test, y_pred, average="weighted")
    print(f"✅ Test Accuracy : {acc:.4f} ({acc*100:.2f}%)")
    print(f"✅ Weighted F1   : {f1:.4f}")

    # Save artifacts
    joblib.dump(clf, MODELS_DIR / "fault_classifier.pkl")
    joblib.dump(scaler, MODELS_DIR / "feature_scaler.pkl")
    joblib.dump(le, MODELS_DIR / "label_encoder.pkl")

    metadata = {
        "version": "1.0.0",
        "model_type": "XGBClassifier",
        "n_estimators": 300,
        "feature_cols": FEATURE_COLS,
        "fault_classes": FAULT_CLASSES,
        "test_accuracy": round(acc, 4),
        "weighted_f1": round(f1, 4),
        "train_samples": len(X_train),
        "test_samples": len(X_test),
        "training_time_sec": round(train_time, 1),
    }
    with open(MODELS_DIR / "model_metadata.json", "w") as f:
        json.dump(metadata, f, indent=2)

    print(f"\n📦 Models saved to: {MODELS_DIR.resolve()}")
    print(f"   fault_classifier.pkl | feature_scaler.pkl | label_encoder.pkl")
    return acc


if __name__ == "__main__":
    train()
