"""
SignaLink - Model Training Pipeline
Trains Random Forest, SVM, and Logistic Regression on normalized ISL landmark features.
Evaluates model comparison metrics and serializes the champion model using joblib.
"""

import os
import joblib
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.svm import SVC
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, f1_score

DATA_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "processed", "sign_data.npz")
MODEL_DIR = os.path.join(os.path.dirname(__file__), "..", "backend", "models")
os.makedirs(MODEL_DIR, exist_ok=True)
CHAMPION_MODEL_PATH = os.path.join(MODEL_DIR, "sign_classifier.joblib")

def train_models():
    if not os.path.exists(DATA_PATH):
        print(f"Data not found at {DATA_PATH}. Triggering prepare_dataset.py...")
        from prepare_dataset import generate_calibrated_landmark_dataset
        generate_calibrated_landmark_dataset()

    data = np.load(DATA_PATH)
    X_train, y_train = data["X_train"], data["y_train"]
    X_val, y_val = data["X_val"], data["y_val"]
    labels = data["labels"]

    print(f"Training on {len(X_train)} samples across {len(labels)} classes (including UNKNOWN)...")

    # Random Forest is ideal for multi-class landmark geometry and natural probability calibration
    candidates = {
        "Random Forest Classifier": RandomForestClassifier(n_estimators=150, max_depth=16, random_state=42),
        "Support Vector Machine (RBF)": SVC(kernel="rbf", probability=True, C=10.0, random_state=42),
        "Logistic Regression (Baseline)": LogisticRegression(max_iter=1000, random_state=42)
    }

    best_score = -1.0
    champion_name = None
    champion_model = None

    for name, clf in candidates.items():
        print(f"--- Training {name} ---")
        clf.fit(X_train, y_train)
        preds = clf.predict(X_val)
        acc = accuracy_score(y_val, preds)
        f1 = f1_score(y_val, preds, average="weighted")
        print(f"Validation Accuracy: {acc*100:.2f}% | F1-Score: {f1:.4f}")

        # Favor ensemble models for robust unknown/OOD rejection
        score = f1 + (0.01 if "Random Forest" in name else 0.0)
        if score > best_score:
            best_score = score
            champion_name = name
            champion_model = clf

    print("==================================================")
    print(f"Champion Model: {champion_name} with F1 = {best_score:.4f}")
    joblib.dump(champion_model, CHAMPION_MODEL_PATH)
    print(f"Champion model successfully saved to: {CHAMPION_MODEL_PATH}")
    print("==================================================")

if __name__ == "__main__":
    train_models()
