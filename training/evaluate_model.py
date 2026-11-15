"""
SignaLink - Model Evaluation & Reporting
Evaluates the trained champion classifier on participant-independent test data (P05).
Calculates precision, recall, F1, confusion matrix, and out-of-distribution unknown gesture rejection.
"""

import os
import joblib
import numpy as np
from sklearn.metrics import classification_report, confusion_matrix

DATA_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "processed", "sign_data.npz")
MODEL_PATH = os.path.join(os.path.dirname(__file__), "..", "backend", "models", "sign_classifier.joblib")

def evaluate():
    if not os.path.exists(MODEL_PATH):
        print(f"Model not found at {MODEL_PATH}. Train first using train_classifier.py.")
        return

    data = np.load(DATA_PATH)
    X_test, y_test = data["X_test"], data["y_test"]
    labels = data["labels"]

    model = joblib.load(MODEL_PATH)
    print("Loaded champion model.")

    y_pred = model.predict(X_test)

    print("\n================== INDEPENDENT TEST REPORT (Participant P05) ==================")
    print(classification_report(y_test, y_pred, target_names=labels))
    print("================================================================================")

    cm = confusion_matrix(y_test, y_pred, labels=labels)
    print("\nConfusion Matrix:")
    print("Labels order:", list(labels))
    print(cm)

    # Test Out-Of-Distribution rejection (random noise gesture input)
    print("\nTesting Out-of-Distribution / Unknown Gesture Rejection:")
    random_vectors = np.random.uniform(-1.0, 1.0, size=(100, 63))
    # Normalize random vectors
    for i in range(100):
        norm = np.linalg.norm(random_vectors[i])
        if norm > 0:
            random_vectors[i] /= norm

    probs = model.predict_proba(random_vectors)
    max_probs = np.max(probs, axis=1)
    threshold = 0.65
    rejected = np.sum(max_probs < threshold)
    print(f"Out of 100 random/noisy non-sign inputs, {rejected} ({rejected}%) were successfully flagged as UNKNOWN (< {threshold} confidence).")

if __name__ == "__main__":
    evaluate()
