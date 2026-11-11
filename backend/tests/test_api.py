import os
import tempfile

fd, path = tempfile.mkstemp(suffix=".db")
os.close(fd)
os.environ["DATABASE_URL"] = f"sqlite:///{path}"

from fastapi.testclient import TestClient  # noqa: E402
from app.main import app  # noqa: E402


def test_crud_flow():
    with TestClient(app) as client:
        assert client.get("/health").json()["status"] == "ok"
        assert client.get("/tasks").json() == []
        created = client.post("/tasks", json={"title": "Write tests", "description": "API"})
        assert created.status_code == 201
        task_id = created.json()["id"]
        assert created.json()["status"] == "todo"
        assert len(client.get("/tasks").json()) == 1
        updated = client.patch(f"/tasks/{task_id}", json={"status": "done"})
        assert updated.status_code == 200
        assert updated.json()["status"] == "done"
        assert client.get(f"/tasks/{task_id}").status_code == 200
        assert client.delete(f"/tasks/{task_id}").status_code == 204
        assert client.get(f"/tasks/{task_id}").status_code == 404


def test_validation():
    with TestClient(app) as client:
        assert client.post("/tasks", json={"title": " ", "description": ""}).status_code == 422
        assert client.post("/tasks", json={"title": ""}).status_code == 422
        created = client.post("/tasks", json={"title": "Valid task"})
        task_id = created.json()["id"]
        assert client.patch(f"/tasks/{task_id}", json={"status": "invalid"}).status_code == 422
        assert client.patch(f"/tasks/{task_id}", json={"title": None}).status_code == 422
