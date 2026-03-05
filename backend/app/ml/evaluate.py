"""
Evaluate the trained fault diagnosis model.

Usage:
    python -m app.ml.evaluate
"""

from pathlib import Path
import joblib
import numpy as np
from sklearn.metrics import (
    classification_report, confusion_matrix, accuracy_score
)
from app.ml.dataset import generate_dataset, FAULT_CLASSES
from app.ml.train import FEATURE_COLS
from sklearn.model_selection import train_test_split

MODELS_DIR = Path(__file__).parent / "models"


def evaluate():
    print("📊 Loading model artifacts...")
    clf = joblib.load(MODELS_DIR / "fault_classifier.pkl")
    scaler = joblib.load(MODELS_DIR / "feature_scaler.pkl")
    le = joblib.load(MODELS_DIR / "label_encoder.pkl")

    print("📊 Generating evaluation dataset...")
    df = generate_dataset()

    X = df[FEATURE_COLS].values
    y = df["fault_class"].values

    y_enc = le.transform(y)
    _, X_test, _, y_test = train_test_split(
        X, y_enc, test_size=0.2, random_state=42, stratify=y_enc
    )
    X_test_scaled = scaler.transform(X_test)

    y_pred = clf.predict(X_test_scaled)

    acc = accuracy_score(y_test, y_pred)
    target_names = [FAULT_CLASSES[i] for i in range(len(FAULT_CLASSES))]

    print(f"\n{'='*60}")
    print(f"  Test Accuracy: {acc*100:.2f}%")
    print(f"{'='*60}")
    print("\n📋 Classification Report:")
    print(classification_report(y_test, y_pred, target_names=target_names))

    print("📊 Confusion Matrix:")
    cm = confusion_matrix(y_test, y_pred)
    header = [f"{n[:8]:>8}" for n in target_names]
    print("         " + " ".join(header))
    for i, row in enumerate(cm):
        print(f"{target_names[i][:8]:>8}  " + "  ".join([f"{v:8d}" for v in row]))


if __name__ == "__main__":
    evaluate()
