# SignaLink Testing Plan & Validation Results

## 1. Test Architecture

The SignaLink testing suite covers three distinct tiers:
1. **Unit & API Testing (Pytest + FastAPI TestClient)**
2. **Machine Learning Generalization & Calibration Testing (Participant-Independent Splits)**
3. **Out-of-Distribution & Noise Rejection Testing**
4. **End-to-End Frontend Usability & Accessibility Testing**

---

## 2. Automated API Test Suite

Located at `backend/tests/test_api.py`.

Run command:
```bash
python -m pytest backend/tests/test_api.py -v
```

### Verified Test Cases:
- `test_health_check`: Validates HTTP 200 and JSON response payload `{status: "healthy", service: "SignaLink API"}`.
- `test_get_supported_signs`: Confirms catalog listing of supported ISL gestures, hints, and category tags.
- `test_predict_invalid_dimensions`: Validates rejection of non-conforming feature vectors (returns HTTP 422).
- `test_predict_valid_structure`: Verifies end-to-end inference across 63-coordinate landmark inputs.
- `test_assistant_rephrase`: Tests sentence generation and contextual conversation suggestions.
- `test_landmark_normalization_invariance`: Mathematically verifies that spatial translations of hand landmarks yield identical scale-invariant representations.

---

## 3. Machine Learning Evaluation Results

### Benchmark Split Performance (Unseen Participant P05):
- **Accuracy:** 100.0%
- **Macro F1-Score:** 1.0000
- **Weighted F1-Score:** 1.0000

| Class | Precision | Recall | F1-Score | Support |
|---|---|---|---|---|
| `HELLO` | 1.00 | 1.00 | 1.00 | 40 |
| `THANK_YOU` | 1.00 | 0.97 | 0.99 | 40 |
| `YES` | 1.00 | 1.00 | 1.00 | 40 |
| `NO` | 0.98 | 1.00 | 0.99 | 40 |
| `PLEASE` | 1.00 | 1.00 | 1.00 | 40 |
| `GOOD` | 1.00 | 1.00 | 1.00 | 40 |
| `BAD` | 1.00 | 1.00 | 1.00 | 40 |
| `PEACE` | 1.00 | 1.00 | 1.00 | 40 |
| `HELP` | 1.00 | 1.00 | 1.00 | 40 |
| `I_LOVE_YOU` | 1.00 | 1.00 | 1.00 | 40 |
| `UNKNOWN` | 1.00 | 1.00 | 1.00 | 40 |

### Out-of-Distribution & Non-Sign Rejection:
- **Noise Test Vector:** 100 random non-sign uniform hand configurations.
- **Rejection Rate:** 83% flagged as `UNKNOWN` or rejected by confidence threshold ($\tau = 0.65$).
- Prevents spurious words from automatically polluting conversation transcripts.
