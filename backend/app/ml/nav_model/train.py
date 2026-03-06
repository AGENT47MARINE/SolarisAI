"""
XGBoost training script for the navigation suggestion model.
Trains a multi-class classifier to predict the next view in a session.
"""

import json
import argparse
from pathlib import Path

import numpy as np
import joblib
from sklearn.model_selection import cross_val_score
from xgboost import XGBClassifier

from app.ml.nav_model.features import (
    build_feature_vector,
    get_view_encoder,
    FEATURE_NAMES,
    ALL_VIEWS,
)

MODELS_DIR = Path(__file__).parent.parent / "models"
DATA_DIR = Path(__file__).parent.parent / "data"


def load_training_data(data_path: str = None) -> tuple:
    """Load sequences and build (X, y) arrays."""
    if data_path is None:
        data_path = str(DATA_DIR / "nav_sequences.jsonl")

    X_list = []
    y_list = []
    view_encoder = get_view_encoder()

    with open(data_path) as f:
        for line in f:
            record = json.loads(line.strip())
            events = record["events"]

            for i in range(len(events) - 1):
                current = events[i]
                next_event = events[i + 1]

                history = events[:i + 1]
                feature_vec = build_feature_vector(
                    current_view=current["to_view"],
                    last_intent=current["intent"],
                    history=history,
                    hour_of_day=current.get("hour_of_day", 12),
                    day_of_week=current.get("day_of_week", 1),
                )

                # Target: next view
                try:
                    target = int(view_encoder.transform([next_event["to_view"]])[0])
                except ValueError:
                    target = len(view_encoder.classes_) - 1

                X_list.append(feature_vec)
                y_list.append(target)

    X = np.array(X_list)
    y_raw = np.array(y_list)

    # Remap labels to contiguous 0..N-1 (XGBoost requires this)
    unique_labels = sorted(set(y_raw))
    label_map = {int(old): int(new) for new, old in enumerate(unique_labels)}
    reverse_map = {int(new): int(old) for old, new in label_map.items()}
    y = np.array([label_map[int(v)] for v in y_raw])

    print(f"Training data: {X.shape[0]} samples, {X.shape[1]} features, {len(unique_labels)} classes")
    return X, y, label_map, reverse_map


def train(
    data_path: str = None,
    output_dir: str = None,
    n_estimators: int = 200,
    max_depth: int = 4,
    learning_rate: float = 0.05,
    cv_folds: int = 5,
):
    """Train the navigation suggestion XGBoost model."""
    if output_dir is None:
        output_dir = str(MODELS_DIR)

    Path(output_dir).mkdir(parents=True, exist_ok=True)

    # Load data
    X, y, label_map, reverse_map = load_training_data(data_path)
    num_classes = len(ALL_VIEWS)

    # Create model (XGBoost 3.x auto-detects num_class from labels)
    model = XGBClassifier(
        n_estimators=n_estimators,
        max_depth=max_depth,
        learning_rate=learning_rate,
        subsample=0.8,
        colsample_bytree=0.7,
        objective="multi:softprob",
        eval_metric="mlogloss",
        random_state=42,
        verbosity=0,
    )

    # Cross-validation
    print(f"Running {cv_folds}-fold cross-validation...")
    cv_scores = cross_val_score(model, X, y, cv=cv_folds, scoring="accuracy")
    print(f"   CV Accuracy: {cv_scores.mean():.4f} +/- {cv_scores.std():.4f}")

    # Train on full dataset
    print("Training on full dataset...")
    model.fit(X, y)

    # Save artifacts
    model_path = Path(output_dir) / "nav_suggester.pkl"
    joblib.dump(model, model_path)

    # Save label maps for inference
    joblib.dump({"label_map": label_map, "reverse_map": reverse_map},
                Path(output_dir) / "nav_label_maps.pkl")

    metadata = {
        "model_type": "XGBClassifier",
        "n_estimators": n_estimators,
        "max_depth": max_depth,
        "learning_rate": learning_rate,
        "num_classes": num_classes,
        "num_training_classes": len(set(y)),
        "num_features": int(X.shape[1]),
        "feature_names": FEATURE_NAMES,
        "cv_accuracy": float(cv_scores.mean()),
        "cv_std": float(cv_scores.std()),
        "num_samples": int(X.shape[0]),
        "views": ALL_VIEWS,
        "version": "1.0.0",
    }

    with open(Path(output_dir) / "nav_metadata.json", "w") as f:
        json.dump(metadata, f, indent=2)

    print(f"Nav suggestion model saved -> {model_path}")
    print(f"   Accuracy: {cv_scores.mean()*100:.1f}%")
    return model, metadata


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Train navigation suggestion model")
    parser.add_argument("--data", type=str, default=None)
    parser.add_argument("--output", type=str, default=None)
    parser.add_argument("--n-estimators", type=int, default=200)
    parser.add_argument("--max-depth", type=int, default=4)
    parser.add_argument("--learning-rate", type=float, default=0.05)
    parser.add_argument("--cv-folds", type=int, default=5)
    args = parser.parse_args()

    train(
        data_path=args.data,
        output_dir=args.output,
        n_estimators=args.n_estimators,
        max_depth=args.max_depth,
        learning_rate=args.learning_rate,
        cv_folds=args.cv_folds,
    )
