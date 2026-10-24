from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_list_medications():
    res = client.get("/api/medications")
    assert res.status_code == 200
    data = res.json()
    assert len(data) >= 5
    first = data[0]
    assert "name" in first
    assert "common_uses" in first
    assert "important_precautions" in first

def test_search_medications():
    res = client.get("/api/medications?q=paracetamol")
    assert res.status_code == 200
    data = res.json()
    assert len(data) >= 1
    assert "paracetamol" in data[0]["name"].lower() or "acetaminophen" in data[0]["generic_name"].lower()

def test_medication_detail():
    res = client.get("/api/medications/ibuprofen")
    assert res.status_code == 200
    data = res.json()
    assert data["id"] == "ibuprofen"
    assert "NSAID" in data["drug_class"]

def test_medication_not_found():
    res = client.get("/api/medications/nonexistent-compound-xyz")
    assert res.status_code == 404
