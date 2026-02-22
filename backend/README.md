# Happy Tummy Backend

FastAPI backend with JWT authentication, SQLite database, and integrated AI services (Featherless LLM + USDA nutrition API).

## What is implemented

- User registration and login with JWT tokens
- Protected endpoints via auth dependency
- SQLite database for quick local testing
- AI coach and chat endpoints (powered by Featherless API)
- Nutrition/food search endpoint (powered by USDA FoodData Central API)

## Quick start

1. Create and activate a virtual environment

```powershell
cd backend
py -m venv .venv
.\.venv\Scripts\Activate.ps1
```

2. Install dependencies

```powershell
pip install -r requirements.txt
```

Or manually:

```powershell
pip install fastapi uvicorn sqlalchemy python-jose[cryptography] bcrypt pydantic-settings httpx
```

3. Set up environment variables (add in the `.env` file with the credentials in backend directory)

4. Run the server

```powershell
python -m uvicorn app.main:app --reload
```

5. Open docs

- http://127.0.0.1:8000/docs

## Environment variables

The backend reads settings from environment variables (or .env if present).

**Authentication & Database:**

- `DATABASE_URL` (default: `sqlite:///./app.db`)
- `JWT_SECRET_KEY` (default: `change-this-in-production`)
- `JWT_ALGORITHM` (default: `HS256`)
- `ACCESS_TOKEN_EXPIRE_MINUTES` (default: `60`)

**AI Services:**

- `FEATHERLESS_API_KEY` - API key for Featherless LLM service
- `FEATHERLESS_MODEL` - Model name to use (e.g., `meta-llama/Llama-2-70b-chat-hf`)
- `USDA_API_KEY` - API key for USDA FoodData Central API (for nutrition data)

Example .env file:

```
DATABASE_URL=sqlite:///./app.db
JWT_SECRET_KEY=replace-me
FEATHERLESS_API_KEY=your-api-key
FEATHERLESS_MODEL=meta-llama/Llama-2-70b-chat-hf
USDA_API_KEY=your-usda-key
```

## Auth endpoints

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

## AI & Nutrition endpoints

- `GET /api/coaching/coach` - Get coaching advice (requires query parameter `message`)
- `POST /api/coaching/chat` - Chat with AI coach (requires JSON: `{ "message": "...", "conversation_history": [] }`)
- `GET /api/nutrition/search` - Search for food nutrition data (requires query parameter `query`)

### Coach endpoint

```
GET /api/coaching/coach?message=Your%20question%20here
```

Returns: `{ "response": "coaching advice from AI" }`

### Chat endpoint

```
POST /api/coaching/chat
Content-Type: application/json

{
  "message": "How do I introduce solids?",
  "conversation_history": []
}
```

Returns: `{ "reply": "AI response" }`

### Nutrition Search endpoint

```
GET /api/nutrition/search?query=banana
```

Returns:

```json
{
  "results": [
    {
      "name": "Bananas, raw",
      "fdcId": 123456,
      "calories": 89,
      "fiber": 2.6,
      "sugar": 12,
      "protein": 1.1,
      "water": 74.3,
      "defaultServingSize": 100,
      "defaultUnit": "g",
      "availableUnits": ["g", "oz", "tbsp", "tsp"]
    }
  ]
}
```

## Protected endpoints

- `GET /api/children` requires a valid `Authorization: Bearer <token>` header

## Notes

- SQLite is used for speed during development. When you move to Supabase/Postgres, update `DATABASE_URL`.
- If you change models, delete `app.db` during development or add migrations later.
- AI services use Featherless API which requires a valid API key (free tier available at featherless.ai)
- Nutrition data comes from USDA FoodData Central API (free tier available)
