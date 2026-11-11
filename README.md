# TaskFlow

A minimal full-stack task manager built with **React + TypeScript**, **FastAPI**, **SQLAlchemy**, and **SQLite**.

## Features

- Create, list, edit, delete tasks
- Track progress using Todo, In Progress, and Done statuses
- Search and filter tasks
- Input validation and API error handling
- Persistent SQLite storage
- Responsive interface
- Interactive REST API documentation

## Tech stack

- Frontend: React 19, TypeScript, Vite, Lucide icons
- Backend: Python, FastAPI, Pydantic, SQLAlchemy
- Database: SQLite
- Infrastructure: Docker Compose

## Quick start with Docker

```bash
docker compose up --build
```

Open:
- Frontend: http://localhost:5173
- Swagger docs: http://localhost:8000/docs
- Health endpoint: http://localhost:8000/health

SQLite data persists in the `taskflow-data` named Docker volume.

## Local development without Docker

Requires Python 3.10+ and Node.js 20+.

Terminal 1:

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Terminal 2:

```bash
cd frontend
npm install
npm run dev
```

Note: run from **backend/** as shown; entrypoint is `app.main:app`.

## API

| Method | Path | Description |
| --- | --- | --- |
| GET | `/health` | Health check |
| GET | `/tasks` | List tasks |
| GET | `/tasks/{id}` | Get a task |
| POST | `/tasks` | Create task |
| PATCH | `/tasks/{id}` | Update title/description/status |
| DELETE | `/tasks/{id}` | Delete task |

Example POST payload:

```json
{"title":"Learn React","description":"Components and hooks"}
```

Valid task statuses: `todo`, `in_progress`, `done`.

## Tests

```bash
cd backend
python -m pytest -q
```

## Project structure

```text
backend/app/        # FastAPI routes, schemas, SQLAlchemy model and database
backend/tests/      # API tests
frontend/src/       # React UI, typed API client and styles
```

## Limitations / future work

This is a small portfolio MVP. Authentication, user accounts, database migrations, advanced concurrency controls, and production-ready deployment are not included. Docker frontend uses Vite's development server.
