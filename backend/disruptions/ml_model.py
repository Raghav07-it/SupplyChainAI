"""
Phase 5 ML Prediction Pipeline for SupplyChainAI.

DEMONSTRATION NOTICE:
This module trains a machine learning classifier on synthetic disruption records
(data/synthetic_disruptions.csv). All predictions, probability scores, and metrics
are intended solely as a synthetic-data demonstration and must not be presented as
real-world operational forecasts.
"""

import os
from pathlib import Path
from typing import Any, Dict, Tuple

import joblib
import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.dummy import DummyClassifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score, precision_recall_fscore_support
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler

# Paths
BASE_DIR = Path(__file__).resolve().parent.parent
DATA_PATH = BASE_DIR.parent / "data" / "synthetic_disruptions.csv"
MODEL_DIR = BASE_DIR / "data" / "models"
MODEL_FILE = MODEL_DIR / "disruption_model.joblib"

FEATURE_COLS_CAT = ["port_code", "disruption_type"]
FEATURE_COLS_NUM = ["capacity_impact_percent", "estimated_delay_hours", "estimated_cost_impact_usd"]
TARGET_COL = "severity"
VALID_SEVERITIES = ["low", "medium", "high", "critical"]

_cached_model_pipeline: Pipeline | None = None


def build_pipeline(random_state: int = 42) -> Pipeline:
    """Build a leakage-free Scikit-Learn processing and classification pipeline."""
    preprocessor = ColumnTransformer(
        transformers=[
            ("cat", OneHotEncoder(handle_unknown="ignore", sparse_output=False), FEATURE_COLS_CAT),
            ("num", StandardScaler(), FEATURE_COLS_NUM),
        ]
    )

    classifier = RandomForestClassifier(
        n_estimators=100,
        max_depth=10,
        random_state=random_state,
        class_weight="balanced",
    )

    pipeline = Pipeline(
        steps=[
            ("preprocessor", preprocessor),
            ("classifier", classifier),
        ]
    )
    return pipeline


def train_and_evaluate(
    csv_path: str | Path = DATA_PATH,
    model_save_path: str | Path = MODEL_FILE,
    random_state: int = 42,
) -> Dict[str, Any]:
    """
    Train the ML pipeline on synthetic data, evaluate against test split and baseline,
    and serialize the model artifact.
    """
    path = Path(csv_path)
    if not path.exists():
        raise FileNotFoundError(f"Synthetic dataset not found at: {path}")

    df = pd.read_csv(path)

    # Validate required columns
    required_cols = FEATURE_COLS_CAT + FEATURE_COLS_NUM + [TARGET_COL]
    for col in required_cols:
        if col not in df.columns:
            raise ValueError(f"Missing required column in dataset: '{col}'")

    # Clean missing values
    clean_df = df.dropna(subset=required_cols).copy()

    X = clean_df[FEATURE_COLS_CAT + FEATURE_COLS_NUM]
    y = clean_df[TARGET_COL]

    # Reproducible train/test split with stratification
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=random_state, stratify=y
    )

    # 1. Fit ML Pipeline
    pipeline = build_pipeline(random_state=random_state)
    pipeline.fit(X_train, y_train)

    # 2. Fit Dummy Baseline (Most Frequent Class)
    dummy_baseline = DummyClassifier(strategy="most_frequent")
    dummy_baseline.fit(X_train, y_train)

    # 3. Predict & Evaluate ML Model
    y_pred = pipeline.predict(X_test)
    y_pred_dummy = dummy_baseline.predict(X_test)

    ml_acc = accuracy_score(y_test, y_pred)
    dummy_acc = accuracy_score(y_test, y_pred_dummy)

    # Detailed metrics
    classes = [c for c in VALID_SEVERITIES if c in np.unique(y)]
    p, r, f1, s = precision_recall_fscore_support(y_test, y_pred, labels=classes, zero_division=0)
    cm = confusion_matrix(y_test, y_pred, labels=classes)

    per_class_metrics = {}
    for idx, cls in enumerate(classes):
        per_class_metrics[cls] = {
            "precision": round(float(p[idx]), 4),
            "recall": round(float(r[idx]), 4),
            "f1_score": round(float(f1[idx]), 4),
            "support": int(s[idx]),
        }

    weighted_p, weighted_r, weighted_f1, _ = precision_recall_fscore_support(
        y_test, y_pred, average="weighted", zero_division=0
    )

    dummy_p, dummy_r, dummy_f1, _ = precision_recall_fscore_support(
        y_test, y_pred_dummy, average="weighted", zero_division=0
    )

    metrics_report = {
        "dataset": {
            "file": str(path.name),
            "is_synthetic": True,
            "total_samples": len(clean_df),
            "train_samples": len(X_train),
            "test_samples": len(X_test),
        },
        "model": {
            "type": "RandomForestClassifier",
            "hyperparameters": {
                "n_estimators": 100,
                "max_depth": 10,
                "random_state": random_state,
                "class_weight": "balanced",
            },
        },
        "evaluation": {
            "overall_accuracy": round(float(ml_acc), 4),
            "weighted_precision": round(float(weighted_p), 4),
            "weighted_recall": round(float(weighted_r), 4),
            "weighted_f1_score": round(float(weighted_f1), 4),
            "per_class_metrics": per_class_metrics,
            "confusion_matrix": {
                "labels": classes,
                "matrix": cm.tolist(),
            },
        },
        "baseline_comparison": {
            "majority_class_accuracy": round(float(dummy_acc), 4),
            "majority_class_weighted_f1": round(float(dummy_f1), 4),
            "f1_improvement_over_baseline": round(float(weighted_f1 - dummy_f1), 4),
        },
        "disclaimer": "Synthetic-data demonstration model only. Not real operational history.",
    }

    # Save model artifact
    save_path = Path(model_save_path)
    save_path.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump({"pipeline": pipeline, "metrics": metrics_report}, save_path)

    global _cached_model_pipeline
    _cached_model_pipeline = pipeline

    return metrics_report


def load_model_pipeline(model_path: str | Path = MODEL_FILE) -> Tuple[Pipeline, Dict[str, Any]]:
    """Load the trained model pipeline and cached metrics."""
    global _cached_model_pipeline
    path = Path(model_path)

    if not path.exists():
        # Train on the fly if model artifact does not exist yet
        train_and_evaluate(model_save_path=path)

    loaded = joblib.load(path)
    pipeline = loaded["pipeline"]
    metrics = loaded.get("metrics", {})
    _cached_model_pipeline = pipeline
    return pipeline, metrics


def predict_disruption_severity(
    port_code: str,
    disruption_type: str,
    capacity_impact_percent: float,
    estimated_delay_hours: float,
    estimated_cost_impact_usd: float,
    model_path: str | Path = MODEL_FILE,
) -> Dict[str, Any]:
    """
    Inference endpoint helper for predicting disruption severity.
    """
    pipeline, metrics = load_model_pipeline(model_path)

    input_df = pd.DataFrame(
        [
            {
                "port_code": str(port_code).upper(),
                "disruption_type": str(disruption_type).lower(),
                "capacity_impact_percent": float(capacity_impact_percent),
                "estimated_delay_hours": float(estimated_delay_hours),
                "estimated_cost_impact_usd": float(estimated_cost_impact_usd),
            }
        ]
    )

    pred_class = str(pipeline.predict(input_df)[0])
    probabilities = pipeline.predict_proba(input_df)[0]
    classes = list(pipeline.classes_)

    confidence_scores = {
        cls: round(float(prob), 4) for cls, prob in zip(classes, probabilities)
    }

    # Deterministic heuristic comparison baseline
    heuristic_risk = "medium"
    if capacity_impact_percent > 70 or estimated_delay_hours > 150:
        heuristic_risk = "critical"
    elif capacity_impact_percent > 40 or estimated_delay_hours > 50:
        heuristic_risk = "high"
    elif capacity_impact_percent < 15 and estimated_delay_hours < 12:
        heuristic_risk = "low"

    return {
        "predicted_severity": pred_class,
        "confidence_scores": confidence_scores,
        "is_synthetic_demo": True,
        "inputs": {
            "port_code": port_code,
            "disruption_type": disruption_type,
            "capacity_impact_percent": capacity_impact_percent,
            "estimated_delay_hours": estimated_delay_hours,
            "estimated_cost_impact_usd": estimated_cost_impact_usd,
        },
        "baseline_comparison": {
            "heuristic_baseline_severity": heuristic_risk,
            "matches_baseline": (pred_class == heuristic_risk),
            "model_type": "RandomForest (Phase 5 ML Pipeline)",
        },
        "disclaimer": "Synthetic-data demonstration forecast only.",
    }
