"""
CLI command to retrain Phase 5 ML prediction pipeline.

Usage:
    python -m disruptions.train_cli
"""

import json
import sys
from pathlib import Path

# Ensure backend package import path
BASE_DIR = Path(__file__).resolve().parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

from disruptions.ml_model import train_and_evaluate


def main():
    print("=" * 60)
    print(" SupplyChainAI - Phase 5 ML Model Retraining Pipeline")
    print(" (Synthetic-Data Demonstration)")
    print("=" * 60)

    try:
        report = train_and_evaluate()
        print("\nModel Training & Evaluation Completed Successfully!")
        print("\nTraining Metrics Summary:")
        print(json.dumps(report, indent=2))
        print("\nArtifact saved to backend/data/models/disruption_model.joblib")
    except Exception as err:
        print(f"\nERROR during model training: {err}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
