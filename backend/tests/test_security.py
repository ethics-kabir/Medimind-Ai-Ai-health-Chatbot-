from fastapi.testclient import TestClient

from app.main import create_app


def test_production_restricts_docs_and_history(monkeypatch):
    monkeypatch.setenv("APP_ENV", "production")
    monkeypatch.delenv("ENABLE_UNAUTHENTICATED_HISTORY", raising=False)
    monkeypatch.delenv("MEDIMIND_ADMIN_TOKEN", raising=False)
    client = TestClient(create_app())

    assert client.get("/docs").status_code == 404
    assert client.get("/api/conversations").status_code == 403
    assert client.get("/api/symptom-checks").status_code == 403


def test_admin_token_allows_restricted_history(monkeypatch):
    monkeypatch.setenv("APP_ENV", "production")
    monkeypatch.setenv("ENABLE_UNAUTHENTICATED_HISTORY", "false")
    monkeypatch.setenv("MEDIMIND_ADMIN_TOKEN", "test-admin-token")
    client = TestClient(create_app())

    create_response = client.post("/api/chat", json={"message": "Security check message", "language": "en"})
    assert create_response.status_code == 200

    denied_response = client.get("/api/conversations")
    assert denied_response.status_code == 403

    allowed_response = client.get("/api/conversations", headers={"X-Admin-Token": "test-admin-token"})
    assert allowed_response.status_code == 200
    assert isinstance(allowed_response.json(), list)


def test_request_size_limit_enforced(monkeypatch):
    monkeypatch.setenv("MAX_REQUEST_BYTES", "64")
    client = TestClient(create_app())

    response = client.post(
        "/api/chat",
        json={"message": "x" * 500, "language": "en"},
    )
    assert response.status_code == 413


def test_global_error_handler_sanitizes_exception_details():
    app = create_app()

    @app.get("/test-boom")
    def test_boom():
        raise RuntimeError("sensitive-internal-error")

    client = TestClient(app, raise_server_exceptions=False)
    response = client.get("/test-boom")

    assert response.status_code == 500
    assert response.json()["detail"] == "Internal server error."


def test_security_headers_present():
    client = TestClient(create_app())
    response = client.get("/api/health")

    assert response.status_code == 200
    assert response.headers["x-content-type-options"] == "nosniff"
    assert response.headers["x-frame-options"] == "DENY"
    assert response.headers["referrer-policy"] == "no-referrer"


def test_cors_allowlist_behavior(monkeypatch):
    monkeypatch.setenv("CORS_ORIGINS", "https://allowed.example")
    client = TestClient(create_app())

    allowed = client.options(
        "/api/health",
        headers={
            "Origin": "https://allowed.example",
            "Access-Control-Request-Method": "GET",
        },
    )
    assert allowed.headers.get("access-control-allow-origin") == "https://allowed.example"

    blocked = client.options(
        "/api/health",
        headers={
            "Origin": "https://blocked.example",
            "Access-Control-Request-Method": "GET",
        },
    )
    assert blocked.headers.get("access-control-allow-origin") is None
