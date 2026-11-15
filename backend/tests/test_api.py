import pytest
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.predictor import normalize_landmarks

client = TestClient(app)

def test_health_check():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["service"] == "SignaLink API"

def test_get_supported_signs():
    response = client.get("/api/signs")
    assert response.status_code == 200
    data = response.json()
    assert "signs" in data
    assert data["count"] >= 5
    # Verify presence of core signs
    sign_ids = [s["id"] for s in data["signs"]]
    assert "HELLO" in sign_ids
    assert "THANK_YOU" in sign_ids
    assert "YES" in sign_ids
    assert "NO" in sign_ids

def test_predict_invalid_dimensions():
    # Sending wrong number of coordinates (e.g. 10 floats instead of 63 or 42)
    response = client.post("/api/predict", json={
        "landmarks": [0.1, 0.2, 0.3],
        "language": "ISL"
    })
    assert response.status_code == 422

def test_predict_valid_structure():
    # 63 floats (21 landmarks x 3)
    dummy_landmarks = [0.0] * 63
    dummy_landmarks[8] = -0.5  # Index tip raised
    response = client.post("/api/predict", json={
        "landmarks": dummy_landmarks,
        "language": "ISL"
    })
    assert response.status_code == 200
    data = response.json()
    assert "label" in data
    assert "confidence" in data
    assert "supported" in data

def test_assistant_rephrase():
    response = client.post("/api/assistant/rephrase", json={
        "text": "HELLO THANK_YOU",
        "mode": "polite"
    })
    assert response.status_code == 200
    data = response.json()
    assert "rephrased" in data
    assert "suggestions" in data
    assert len(data["suggestions"]) > 0

def test_landmark_normalization_invariance():
    # Test that shifting landmarks maintains normalized output
    raw_1 = [float(i) for i in range(63)]
    # Add shift to x, y, z
    raw_2 = []
    for i in range(0, 63, 3):
        raw_2.extend([raw_1[i] + 10.0, raw_1[i+1] - 5.0, raw_1[i+2] + 2.0])

    norm_1 = normalize_landmarks(raw_1)
    norm_2 = normalize_landmarks(raw_2)

    assert pytest.approx(norm_1, abs=1e-4) == norm_2
