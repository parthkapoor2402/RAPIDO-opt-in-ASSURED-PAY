from fastapi.testclient import TestClient

from app.core.config import get_settings
from app.main import app

client = TestClient(app)


def test_version_endpoint_returns_metadata() -> None:
    settings = get_settings()
    response = client.get("/api/version")
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == settings.app_name
    assert data["version"] == settings.app_version
    assert data["environment"] == settings.environment
    assert data["settlement_policy_version"] == settings.settlement_policy_version
