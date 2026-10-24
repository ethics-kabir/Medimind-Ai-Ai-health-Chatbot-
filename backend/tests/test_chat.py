import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_chat_normal_query():
    response = client.post("/api/chat", json={
        "message": "I have a mild fever and headache since yesterday.",
        "language": "en"
    })
    assert response.status_code == 200
    data = response.json()
    assert "conversation_id" in data
    assert "message_id" in data
    assert data["is_emergency"] is False
    assert data["structured_data"] is not None
    assert len(data["structured_data"]["possible_causes"]) > 0
    assert len(data["structured_data"]["what_to_do"]) > 0
    assert len(data["structured_data"]["things_to_watch"]) > 0
    assert len(data["structured_data"]["when_to_see_doctor"]) > 0
    assert "educational" in data["structured_data"]["disclaimer"].lower()

def test_chat_emergency_interception():
    response = client.post("/api/chat", json={
        "message": "My chest hurts and I am having difficulty breathing.",
        "language": "en"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["is_emergency"] is True
    assert data["emergency_alert"] is not None
    assert data["mode"] == "safety_interceptor"
    assert "112" in data["reply"] or "911" in data["reply"]

def test_chat_empty_message():
    response = client.post("/api/chat", json={
        "message": "   ",
        "language": "en"
    })
    assert response.status_code == 400
    assert "empty" in response.json()["detail"].lower()

def test_chat_conversation_continuation():
    # Message 1
    res1 = client.post("/api/chat", json={"message": "I feel tired all the time.", "language": "en"})
    assert res1.status_code == 200
    conv_id = res1.json()["conversation_id"]

    # Message 2 in same conversation
    res2 = client.post("/api/chat", json={
        "message": "What tests might a doctor run?",
        "conversation_id": conv_id,
        "language": "en"
    })
    assert res2.status_code == 200
    assert res2.json()["conversation_id"] == conv_id

    # Retrieve conversation detail
    detail_res = client.get(f"/api/conversations/{conv_id}")
    assert detail_res.status_code == 200
    conv_data = detail_res.json()
    assert len(conv_data["messages"]) == 4 # 2 user + 2 assistant
