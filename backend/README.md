# Happy Tummy Backend

Minimal FastAPI backend with username/password auth (JWT) and SQLite for local development.

## What is implemented
- User registration and login with JWT tokens.
- Protected endpoints via auth dependency.
- SQLite database for quick local testing.

## Quick start
1) Create and activate a virtual environment

```powershell
cd backend
py -m venv .venv
.\.venv\Scripts\Activate.ps1
```

2) Install dependencies

```powershell
pip install fastapi "uvicorn[standard]" sqlalchemy python-jose[cryptography] bcrypt pydantic-settings
```

3) Run the server

```powershell
python -m uvicorn app.main:app --reload
```

4) Open docs
- http://127.0.0.1:8000/docs

## Environment variables
The backend reads settings from environment variables (or .env if present).

- `DATABASE_URL` (default: `sqlite:///./app.db`)
- `JWT_SECRET_KEY` (default: `change-this-in-production`)
- `JWT_ALGORITHM` (default: `HS256`)
- `ACCESS_TOKEN_EXPIRE_MINUTES` (default: `60`)

Example .env file:
```
DATABASE_URL=sqlite:///./app.db
JWT_SECRET_KEY=replace-me
```

## Auth endpoints
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

## Protected endpoints
- `GET /api/children` requires a valid `Authorization: Bearer <token>` header.

## Notes
- SQLite is used for speed during development. When you move to Supabase/Postgres, update `DATABASE_URL`.
- If you change models, delete `app.db` during development or add migrations later.
