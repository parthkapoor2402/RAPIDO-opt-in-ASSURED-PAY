import pytest
from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


@pytest.mark.parametrize(
    "path",
    [
        "/api/booking",
        "/api/ride",
        "/api/settlement",
        "/api/support",
        "/api/analytics",
    ],
)
def test_placeholder_router_returns_not_implemented_stub(path: str) -> None:
    response = client.get(path)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "placeholder"
    assert data["module"] == path.removeprefix("/api/")
