import os
import joblib
import numpy as np
from typing import Dict, Any, Tuple, Optional

CONFIDENCE_THRESHOLD = 0.65
MODEL_PATH = os.path.join(os.path.dirname(__file__), "..", "models", "sign_classifier.joblib")

SUPPORTED_SIGNS_METADATA = [
    {
        "id": "HELLO",
        "label": "HELLO",
        "name": "Hello / Greetings",
        "description": "Standard greeting sign with open palm facing forward, fingers upright.",
        "gesture_hint": "Raise hand with open palm facing camera, all 5 fingers extended and spread slightly.",
        "category": "Greetings"
    },
    {
        "id": "THANK_YOU",
        "label": "THANK_YOU",
        "name": "Thank You",
        "description": "Expression of gratitude with flat hand touching chin/lips and extending outwards.",
        "gesture_hint": "Flat open hand with fingers together, palm facing inward/forward.",
        "category": "Courtesy"
    },
    {
        "id": "YES",
        "label": "YES",
        "name": "Yes / Affirmation",
        "description": "Nodding fist gesture indicating agreement or affirmation.",
        "gesture_hint": "Closed fist with thumb resting across fingers, facing forward.",
        "category": "Responses"
    },
    {
        "id": "NO",
        "label": "NO",
        "name": "No / Negation",
        "description": "Negative response sign, index finger extended and shaking or index and middle finger closing to thumb.",
        "gesture_hint": "Index finger extended vertically while other fingers are folded into palm.",
        "category": "Responses"
    },
    {
        "id": "PLEASE",
        "label": "PLEASE",
        "name": "Please",
        "description": "Polite request sign with open flat palm over chest area.",
        "gesture_hint": "Flat hand with thumb tucked or aligned, palm flat.",
        "category": "Courtesy"
    },
    {
        "id": "GOOD",
        "label": "GOOD",
        "name": "Good / Approval",
        "description": "Positive appraisal sign indicating good, fine, or well done.",
        "gesture_hint": "Fist with thumb pointed straight upward (thumbs up).",
        "category": "Appraisal"
    },
    {
        "id": "BAD",
        "label": "BAD",
        "name": "Bad / Disapproval",
        "description": "Negative appraisal sign indicating disapproval or unwell.",
        "gesture_hint": "Fist with thumb pointed straight downward (thumbs down).",
        "category": "Appraisal"
    },
    {
        "id": "PEACE",
        "label": "PEACE",
        "name": "Peace / Victory",
        "description": "Peace sign with index and middle fingers forming a V.",
        "gesture_hint": "Extend index and middle fingers upward in a 'V' shape, tucking ring and pinky with thumb.",
        "category": "Expressions"
    },
    {
        "id": "HELP",
        "label": "HELP",
        "name": "Help / Assist",
        "description": "Emergency or assistive sign requesting aid.",
        "gesture_hint": "Open palm flat horizontally serving as base with other hand or upright thumb.",
        "category": "Emergency"
    },
    {
        "id": "I_LOVE_YOU",
        "label": "I_LOVE_YOU",
        "name": "I Love You (ILY)",
        "description": "Universal / ISL informal sign combining I, L, and Y handshapes.",
        "gesture_hint": "Extend thumb, index finger, and pinky finger, while ring and middle fingers remain folded.",
        "category": "Expressions"
    }
]

def normalize_landmarks(raw_coords: list[float]) -> np.ndarray:
    """
    Normalizes 21 3D hand landmarks relative to wrist (landmark 0)
    and scales by maximum distance to ensure translation and scale invariance.
    Accepts 63 floats (21 x 3) or 42 floats (21 x 2).
    """
    coords = np.array(raw_coords, dtype=np.float32)
    if len(coords) == 42:
        # Convert 2D to 3D with z=0
        coords_2d = coords.reshape((21, 2))
        coords_3d = np.zeros((21, 3), dtype=np.float32)
        coords_3d[:, :2] = coords_2d
        coords = coords_3d.flatten()

    if len(coords) != 63:
        raise ValueError(f"Expected 63 coordinates (21 landmarks x 3 coords), but received {len(coords)}")

    pts = coords.reshape((21, 3))
    # Landmark 0 is wrist
    wrist = pts[0].copy()
    rel_pts = pts - wrist

    # Compute maximum Euclidean distance from wrist to any landmark
    distances = np.linalg.norm(rel_pts, axis=1)
    max_dist = np.max(distances)

    if max_dist > 1e-6:
        norm_pts = rel_pts / max_dist
    else:
        norm_pts = rel_pts

    return norm_pts.flatten()

class GesturePredictor:
    def __init__(self, model_path: str = MODEL_PATH):
        self.model_path = model_path
        self.model = None
        self.classes_ = [s["id"] for s in SUPPORTED_SIGNS_METADATA]
        self.load_model()

    def load_model(self):
        if os.path.exists(self.model_path):
            try:
                loaded = joblib.load(self.model_path)
                if hasattr(loaded, "predict"):
                    self.model = loaded
                    if hasattr(loaded, "classes_"):
                        self.classes_ = list(loaded.classes_)
                    print(f"Loaded classifier from {self.model_path} with {len(self.classes_)} classes.")
            except Exception as e:
                print(f"Failed to load model from {self.model_path}: {e}")
                self.model = None
        else:
            print(f"No trained model found at {self.model_path}. Using fallback heuristic classifier.")
            self.model = None

    def predict(self, raw_landmarks: list[float]) -> Dict[str, Any]:
        features = normalize_landmarks(raw_landmarks)
        X = features.reshape(1, -1)

        if self.model is not None:
            try:
                # Use trained scikit-learn classifier
                if hasattr(self.model, "predict_proba"):
                    probs = self.model.predict_proba(X)[0]
                    max_idx = int(np.argmax(probs))
                    confidence = float(probs[max_idx])
                    predicted_label = str(self.classes_[max_idx])
                    all_probs = {str(c): float(p) for c, p in zip(self.classes_, probs)}
                else:
                    pred = self.model.predict(X)[0]
                    predicted_label = str(pred)
                    confidence = 0.90
                    all_probs = {predicted_label: 0.90}

                if confidence < CONFIDENCE_THRESHOLD:
                    return {
                        "label": "UNKNOWN",
                        "confidence": round(confidence, 3),
                        "supported": False,
                        "is_unknown": True,
                        "details": f"Confidence {confidence:.2f} below threshold {CONFIDENCE_THRESHOLD}",
                        "all_probabilities": {k: round(v, 3) for k, v in all_probs.items()}
                    }

                return {
                    "label": predicted_label,
                    "confidence": round(confidence, 3),
                    "supported": True,
                    "is_unknown": False,
                    "details": "Recognized gesture",
                    "all_probabilities": {k: round(v, 3) for k, v in all_probs.items()}
                }
            except Exception as e:
                print(f"Model inference failed: {e}. Falling back.")

        # Robust heuristic fallback classifier when model is training/absent
        return self._heuristic_classify(features)

    def _heuristic_classify(self, features: np.ndarray) -> Dict[str, Any]:
        """
        Geometrical heuristic fallback using landmark finger extensions and relative angles.
        """
        pts = features.reshape((21, 3))
        # Landmark indices:
        # Wrist: 0
        # Thumb: 1, 2, 3, 4 (tip)
        # Index: 5, 6, 7, 8 (tip)
        # Middle: 9, 10, 11, 12 (tip)
        # Ring: 13, 14, 15, 16 (tip)
        # Pinky: 17, 18, 19, 20 (tip)

        # Check which fingers are extended (tip further from wrist than PIP/MCP joints)
        thumb_extended = np.linalg.norm(pts[4] - pts[2]) > np.linalg.norm(pts[3] - pts[2]) and pts[4, 0] > pts[2, 0] if pts[4, 0] > 0 else pts[4, 0] < pts[2, 0]
        # In normalized coords, y decreases going UP in image coordinates (y=0 top, y=1 bottom)
        index_up = pts[8, 1] < pts[6, 1]
        middle_up = pts[12, 1] < pts[10, 1]
        ring_up = pts[16, 1] < pts[14, 1]
        pinky_up = pts[20, 1] < pts[18, 1]
        thumb_up = pts[4, 1] < pts[3, 1]
        thumb_down = pts[4, 1] > pts[3, 1] and pts[4, 1] > pts[0, 1]

        # Finger count extended up
        up_fingers = [index_up, middle_up, ring_up, pinky_up]
        count_up = sum(up_fingers)

        label = "UNKNOWN"
        confidence = 0.50

        # Thumbs up: GOOD
        if thumb_up and not index_up and not middle_up and not ring_up and not pinky_up:
            label = "GOOD"
            confidence = 0.88
        # Thumbs down: BAD
        elif thumb_down and not index_up and not middle_up and not ring_up and not pinky_up:
            label = "BAD"
            confidence = 0.85
        # Index only: NO
        elif index_up and not middle_up and not ring_up and not pinky_up:
            label = "NO"
            confidence = 0.82
        # Index + Middle (V sign): PEACE
        elif index_up and middle_up and not ring_up and not pinky_up:
            label = "PEACE"
            confidence = 0.89
        # Thumb + Index + Pinky: I_LOVE_YOU
        elif index_up and pinky_up and not middle_up and not ring_up:
            label = "I_LOVE_YOU"
            confidence = 0.87
        # All 5 fingers extended: HELLO
        elif count_up >= 4:
            label = "HELLO"
            confidence = 0.86
        # Fist (no fingers up): YES
        elif count_up == 0 and not thumb_up and not thumb_down:
            label = "YES"
            confidence = 0.83
        # Flat hand oriented inward/straight: THANK_YOU or PLEASE
        elif count_up >= 3 and abs(pts[8, 0] - pts[12, 0]) < 0.15:
            label = "THANK_YOU"
            confidence = 0.78

        if confidence < CONFIDENCE_THRESHOLD or label == "UNKNOWN":
            return {
                "label": "UNKNOWN",
                "confidence": round(confidence, 3),
                "supported": False,
                "is_unknown": True,
                "details": "Gesture not clearly recognized with sufficient confidence"
            }

        return {
            "label": label,
            "confidence": round(confidence, 3),
            "supported": True,
            "is_unknown": False,
            "details": "Recognized via geometry classifier"
        }

predictor_instance = GesturePredictor()
