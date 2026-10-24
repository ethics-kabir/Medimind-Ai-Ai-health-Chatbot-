from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_symptom_checker_routine():
    payload = {
        "main_symptom": "Mild dry cough",
        "duration": "2 days",
        "severity": 3,
        "age_group": "Adult",
        "associated_symptoms": ["Sore throat"],
        "existing_conditions": [],
        "current_medications": "None",
        "allergies": "None",
        "language": "en"
    }
    response = client.post("/api/symptom-check", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["is_emergency"] is False
    assert data["risk_level"] in ["Low", "Moderate"]
    assert len(data["possible_explanations"]) > 0
    assert len(data["self_care_steps"]) > 0
    assert len(data["red_flag_symptoms"]) > 0
    assert "disclaimer" in data

def test_symptom_checker_emergency_trigger():
    payload = {
        "main_symptom": "Crushing chest pain radiating to left arm",
        "duration": "20 minutes",
        "severity": 10,
        "age_group": "Adult",
        "associated_symptoms": ["Shortness of breath", "Sweating"],
        "existing_conditions": ["Hypertension"],
        "language": "en"
    }
    response = client.post("/api/symptom-check", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["is_emergency"] is True
    assert "Emergency" in data["risk_level"]
    assert data["emergency_alert"] is not None

def test_symptom_checker_history():
    # Fetch symptom checks list
    res = client.get("/api/symptom-checks")
    assert res.status_code == 200
    data = res.json()
    assert isinstance(data, list)
    assert len(data) >= 1
