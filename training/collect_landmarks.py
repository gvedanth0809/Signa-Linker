"""
SignaLink - Landmark Collection Utility
Extracts 21 3D hand landmarks using MediaPipe from webcam stream or video feeds
and saves structured records with participant metadata.
"""

import os
import json
import time
import cv2
import mediapipe as mp
import numpy as np

RAW_DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "data", "raw")
os.makedirs(RAW_DATA_DIR, exist_ok=True)

def collect_from_camera(sign_label: str, participant_id: str = "P01", num_samples: int = 50):
    print(f"Starting data collection for sign '{sign_label}' - Participant: {participant_id}")
    print(f"Target samples: {num_samples}. Press 's' to start/save, 'q' to quit.")

    mp_hands = mp.solutions.hands
    mp_draw = mp.solutions.drawing_utils

    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        print("Error: Could not open webcam.")
        return

    samples = []
    recording = False
    count = 0

    with mp_hands.Hands(
        max_num_hands=1,
        min_detection_confidence=0.7,
        min_tracking_confidence=0.7
    ) as hands:
        while cap.isOpened() and count < num_samples:
            ret, frame = cap.read()
            if not ret:
                break

            # Flip for selfie-view
            frame = cv2.flip(frame, 1)
            h, w, _ = frame.shape
            rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            results = hands.process(rgb_frame)

            if results.multi_hand_landmarks:
                for hand_landmarks in results.multi_hand_landmarks:
                    mp_draw.draw_landmarks(frame, hand_landmarks, mp_hands.HAND_CONNECTIONS)
                    coords = []
                    for lm in hand_landmarks.landmark:
                        coords.extend([lm.x, lm.y, lm.z])

                    if recording:
                        samples.append({
                            "label": sign_label,
                            "participant_id": participant_id,
                            "timestamp": time.time(),
                            "landmarks": coords
                        })
                        count += 1
                        time.sleep(0.05)

            # Overlay information
            status_text = f"Recording: {recording} [{count}/{num_samples}]"
            cv2.putText(frame, f"Sign: {sign_label} | {status_text}", (10, 30),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0) if recording else (0, 0, 255), 2)
            cv2.putText(frame, "Press 's' to toggle capture, 'q' to stop", (10, 60),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1)

            cv2.imshow("SignaLink Landmark Collector", frame)
            key = cv2.waitKey(1) & 0xFF
            if key == ord('s'):
                recording = not recording
            elif key == ord('q'):
                break

    cap.release()
    cv2.destroyAllWindows()

    if samples:
        filename = f"{sign_label}_{participant_id}_{int(time.time())}.json"
        out_path = os.path.join(RAW_DATA_DIR, filename)
        with open(out_path, "w") as f:
            json.dump(samples, f, indent=2)
        print(f"Saved {len(samples)} samples to {out_path}")

if __name__ == "__main__":
    import sys
    label = sys.argv[1] if len(sys.argv) > 1 else "HELLO"
    pid = sys.argv[2] if len(sys.argv) > 2 else "P01"
    collect_from_camera(label, pid)
