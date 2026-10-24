from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_check_endpoint():
    res = client.get("/api/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "online"
    assert data["database"] == "healthy"
    assert "mode" in data

def test_conversation_deletion_and_clear():
    # Create conversation
    res = client.post("/api/chat", json={"message": "Temporary test conversation", "language": "en"})
    conv_id = res.json()["conversation_id"]

    # Delete that conversation
    del_res = client.delete(f"/api/conversations/{conv_id}")
    assert del_res.status_code == 200

    # Ensure 404 on get
    get_res = client.get(f"/api/conversations/{conv_id}")
    assert get_res.status_code == 404

def test_health_tips():
    res = client.get("/api/health-tips")
    assert res.status_code == 200
    data = res.json()
    assert len(data) >= 3
    assert "title" in data[0]
