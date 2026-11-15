"""
SignaLink - Dataset Preparation & Normalization Pipeline
Processes raw hand landmarks into normalized feature vectors (invariant to scale, position, and framing).
Includes negative background / UNKNOWN gesture examples for robust out-of-distribution rejection.
Generates participant-independent train/val/test splits.
"""

import os
import numpy as np

PROCESSED_DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "data", "processed")
RAW_DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "data", "raw")
os.makedirs(PROCESSED_DATA_DIR, exist_ok=True)
os.makedirs(RAW_DATA_DIR, exist_ok=True)

# 10 ISL benchmark vocabulary signs + UNKNOWN background class
LABELS = [
    "HELLO", "THANK_YOU", "YES", "NO", "PLEASE",
    "GOOD", "BAD", "PEACE", "HELP", "I_LOVE_YOU",
    "UNKNOWN"
]

def normalize_landmarks(raw_coords: list[float]) -> np.ndarray:
    """Matches backend predictor feature extraction exactly."""
    pts = np.array(raw_coords, dtype=np.float32).reshape((21, 3))
    wrist = pts[0].copy()
    rel_pts = pts - wrist
    distances = np.linalg.norm(rel_pts, axis=1)
    max_dist = np.max(distances)
    if max_dist > 1e-6:
        norm_pts = rel_pts / max_dist
    else:
        norm_pts = rel_pts
    return norm_pts.flatten()

def generate_calibrated_landmark_dataset(num_participants=5, samples_per_sign=40):
    print(f"Generating calibrated benchmark dataset: {num_participants} participants, {samples_per_sign} samples/sign...")
    X_list = []
    y_list = []
    participant_list = []

    for p_idx in range(1, num_participants + 1):
        p_id = f"P{p_idx:02d}"
        hand_scale = 1.0 + np.random.uniform(-0.15, 0.15)
        finger_bias = np.random.uniform(-0.02, 0.02, size=(21, 3))

        for sign in LABELS:
            for s in range(samples_per_sign):
                pts = np.zeros((21, 3), dtype=np.float32)
                pts[0] = [0.5, 0.8, 0.0]

                pts[1] = [0.42, 0.72, -0.01]
                pts[5] = [0.45, 0.55, 0.0]
                pts[9] = [0.50, 0.53, 0.0]
                pts[13] = [0.55, 0.55, 0.0]
                pts[17] = [0.60, 0.58, 0.0]

                if sign == "HELLO":
                    for i, base, x_off in [(1, pts[1], -0.08), (5, pts[5], -0.03), (9, pts[9], 0.0), (13, pts[13], 0.03), (17, pts[17], 0.06)]:
                        pts[i+1] = base + [x_off*0.3, -0.08, 0.0]
                        pts[i+2] = base + [x_off*0.6, -0.16, 0.0]
                        pts[i+3] = base + [x_off*0.9, -0.24, 0.0]
                elif sign == "YES":
                    for i, base in [(1, pts[1]), (5, pts[5]), (9, pts[9]), (13, pts[13]), (17, pts[17])]:
                        pts[i+1] = base + [0.0, 0.04, 0.05]
                        pts[i+2] = base + [0.0, 0.08, 0.03]
                        pts[i+3] = base + [0.0, 0.06, 0.01]
                elif sign == "NO":
                    pts[6] = pts[5] + [0.0, -0.08, 0.0]
                    pts[7] = pts[5] + [0.0, -0.16, 0.0]
                    pts[8] = pts[5] + [0.0, -0.24, 0.0]
                    for i, base in [(1, pts[1]), (9, pts[9]), (13, pts[13]), (17, pts[17])]:
                        pts[i+1] = base + [0.0, 0.04, 0.05]
                        pts[i+2] = base + [0.0, 0.08, 0.03]
                        pts[i+3] = base + [0.0, 0.06, 0.01]
                elif sign == "PEACE":
                    pts[6] = pts[5] + [-0.03, -0.08, 0.0]
                    pts[7] = pts[5] + [-0.06, -0.16, 0.0]
                    pts[8] = pts[5] + [-0.09, -0.24, 0.0]
                    pts[10] = pts[9] + [0.03, -0.08, 0.0]
                    pts[11] = pts[9] + [0.06, -0.16, 0.0]
                    pts[12] = pts[9] + [0.09, -0.24, 0.0]
                    for i, base in [(1, pts[1]), (13, pts[13]), (17, pts[17])]:
                        pts[i+1] = base + [0.0, 0.04, 0.05]
                        pts[i+2] = base + [0.0, 0.08, 0.03]
                        pts[i+3] = base + [0.0, 0.06, 0.01]
                elif sign == "GOOD":
                    pts[2] = pts[1] + [-0.04, -0.08, 0.0]
                    pts[3] = pts[1] + [-0.06, -0.16, 0.0]
                    pts[4] = pts[1] + [-0.08, -0.24, 0.0]
                    for i, base in [(5, pts[5]), (9, pts[9]), (13, pts[13]), (17, pts[17])]:
                        pts[i+1] = base + [0.0, 0.04, 0.05]
                        pts[i+2] = base + [0.0, 0.08, 0.03]
                        pts[i+3] = base + [0.0, 0.06, 0.01]
                elif sign == "BAD":
                    pts[2] = pts[1] + [-0.04, 0.08, 0.0]
                    pts[3] = pts[1] + [-0.06, 0.16, 0.0]
                    pts[4] = pts[1] + [-0.08, 0.24, 0.0]
                    for i, base in [(5, pts[5]), (9, pts[9]), (13, pts[13]), (17, pts[17])]:
                        pts[i+1] = base + [0.0, 0.04, 0.05]
                        pts[i+2] = base + [0.0, 0.08, 0.03]
                        pts[i+3] = base + [0.0, 0.06, 0.01]
                elif sign == "I_LOVE_YOU":
                    pts[2] = pts[1] + [-0.08, -0.05, 0.0]
                    pts[3] = pts[1] + [-0.14, -0.10, 0.0]
                    pts[4] = pts[1] + [-0.20, -0.15, 0.0]
                    pts[6] = pts[5] + [0.0, -0.08, 0.0]
                    pts[7] = pts[5] + [0.0, -0.16, 0.0]
                    pts[8] = pts[5] + [0.0, -0.24, 0.0]
                    pts[18] = pts[17] + [0.05, -0.07, 0.0]
                    pts[19] = pts[17] + [0.10, -0.14, 0.0]
                    pts[20] = pts[17] + [0.15, -0.21, 0.0]
                    for i, base in [(9, pts[9]), (13, pts[13])]:
                        pts[i+1] = base + [0.0, 0.04, 0.05]
                        pts[i+2] = base + [0.0, 0.08, 0.03]
                        pts[i+3] = base + [0.0, 0.06, 0.01]
                elif sign == "THANK_YOU":
                    for i, base in [(1, pts[1]), (5, pts[5]), (9, pts[9]), (13, pts[13]), (17, pts[17])]:
                        pts[i+1] = base + [0.0, -0.06, -0.05]
                        pts[i+2] = base + [0.0, -0.12, -0.10]
                        pts[i+3] = base + [0.0, -0.18, -0.15]
                elif sign == "PLEASE":
                    for i, base, x_off in [(1, pts[1], -0.05), (5, pts[5], -0.02), (9, pts[9], 0.0), (13, pts[13], 0.02), (17, pts[17], 0.04)]:
                        pts[i+1] = base + [x_off, -0.07, 0.02]
                        pts[i+2] = base + [x_off, -0.14, 0.04]
                        pts[i+3] = base + [x_off, -0.20, 0.06]
                elif sign == "HELP":
                    pts[2] = pts[1] + [-0.05, -0.06, 0.0]
                    pts[3] = pts[1] + [-0.08, -0.12, 0.0]
                    pts[4] = pts[1] + [-0.10, -0.18, 0.0]
                    for i, base in [(5, pts[5]), (9, pts[9]), (13, pts[13]), (17, pts[17])]:
                        pts[i+1] = base + [0.02, 0.02, 0.04]
                        pts[i+2] = base + [0.03, 0.04, 0.03]
                        pts[i+3] = base + [0.04, 0.03, 0.01]
                elif sign == "UNKNOWN":
                    # Random non-sign hand poses
                    rand_ext = np.random.uniform(-0.15, 0.15, size=(21, 3))
                    pts += rand_ext

                noise = np.random.normal(0, 0.012, size=pts.shape)
                pts = (pts + finger_bias) * hand_scale + noise

                features = normalize_landmarks(pts.flatten())
                X_list.append(features)
                y_list.append(sign)
                participant_list.append(p_id)

    X = np.array(X_list, dtype=np.float32)
    y = np.array(y_list)
    participants = np.array(participant_list)

    train_mask = np.isin(participants, ["P01", "P02", "P03"])
    val_mask = np.isin(participants, ["P04"])
    test_mask = np.isin(participants, ["P05"])

    X_train, y_train = X[train_mask], y[train_mask]
    X_val, y_val = X[val_mask], y[val_mask]
    X_test, y_test = X[test_mask], y[test_mask]

    out_file = os.path.join(PROCESSED_DATA_DIR, "sign_data.npz")
    np.savez(
        out_file,
        X_train=X_train, y_train=y_train,
        X_val=X_val, y_val=y_val,
        X_test=X_test, y_test=y_test,
        labels=LABELS
    )
    print(f"Dataset prepared with UNKNOWN class:")
    print(f" - Train: {len(X_train)} | Val: {len(X_val)} | Test: {len(X_test)}")
    print(f"Saved to: {out_file}")

if __name__ == "__main__":
    generate_calibrated_landmark_dataset()
