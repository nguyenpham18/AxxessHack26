"""AI-powered coach and chat endpoints for baby digestion support."""
import json
import os
import time
from typing import Optional, Any, List, Dict
from fastapi import APIRouter, Depends, HTTPException
import httpx
from pydantic import BaseModel
from app.core.config import settings
from app.db.session import get_db
from app.models.happytummy_schema import DimUser, ParentChild
from app.models.logs import DailyLog, DailyLogFood
from app.models.meal_info import FruitInfo, VegInfo, CarbInfo, MeatInfo, Milk1, Milk2, MealInfo
from app.models.user import User
from app.routes.auth import get_current_user
from sqlalchemy.orm import Session

router = APIRouter(prefix="/api/ai", tags=["ai"])


class ChatRequest(BaseModel):
    baby: Optional[Dict[str, Any]] = None
    recentLogs: Optional[List[Any]] = None
    conversation: Optional[List[Dict[str, str]]] = None
    userMessage: Optional[str] = None

# Initialize OpenAI client pointing to Featherless
FEATHERLESS_BASE_URL = "https://api.featherless.ai/v1"
FEATHERLESS_API_KEY = settings.featherless_api_key
FEATHERLESS_MODEL = settings.featherless_model
USDA_API_KEY = settings.usda_api_key
NUTRITION_CACHE: Dict[str, Dict[str, Any]] = {}


@router.get("/health")
async def health_check() -> Dict[str, str]:
    """Health check endpoint"""
    return {
        "status": "ok",
        "usda_api_key_present": "yes" if USDA_API_KEY else "no",
        "featherless_key_present": "yes" if FEATHERLESS_API_KEY else "no",
    }


async def call_featherless(messages: List[Dict[str, str]], max_tokens: int = 350, temperature: float = 0.2) -> str:
    """Call Featherless API with OpenAI-compatible interface."""
    if not FEATHERLESS_API_KEY or not FEATHERLESS_MODEL:
        raise HTTPException(status_code=500, detail="Featherless API key or model not configured")
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                f"{FEATHERLESS_BASE_URL}/chat/completions",
                headers={
                    "Authorization": f"Bearer {FEATHERLESS_API_KEY}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": FEATHERLESS_MODEL,
                    "messages": messages,
                    "temperature": temperature,
                    "max_tokens": max_tokens,
                },
                timeout=settings.featherless_timeout_seconds,
            )
            
            if response.status_code != 200:
                raise HTTPException(status_code=500, detail=f"Featherless API error: {response.text}")
            
            result = response.json()
            return result.get("choices", [{}])[0].get("message", {}).get("content", "")
        except httpx.RequestError as e:
            raise HTTPException(status_code=500, detail=f"Featherless API request failed: {str(e)}")


@router.post("/coach")
async def get_coach_message(
    baby: Optional[Dict[str, Any]] = None,
    insights: Optional[List[Any]] = None,
    recommendations: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    """Generate personalized coaching message based on baby profile and recommendations."""
    if not baby or not recommendations:
        raise HTTPException(status_code=400, detail="Missing baby or recommendations")

    system_prompt = """
You are Happy Tummy, a baby digestion support coach for ages 6–24 months.
You do NOT diagnose, predict diseases, or provide medical advice.
You only explain patterns and give wellness guidance based on the provided data.
IMPORTANT RULES:
- Only mention foods that appear in recommendations.try_today or recommendations.avoid_today.
- Respect allergies: if baby.allergies includes an item related to a food, do not recommend it.
- Keep it short, friendly, and actionable for a parent.
- Always include a safety disclaimer and red flags.
Output MUST be valid JSON ONLY (no markdown, no extra text).
Return exactly this shape:
{
  "summary": string,
  "why": string[],
  "tryToday": string[],
  "avoidToday": string[],
  "next24hPlan": string[],
  "redFlags": string[]
}
""".strip()

    user_content = f"""
BABY:
{json.dumps(baby)}

INSIGHTS (from tracking):
{json.dumps(insights or [])}

RECOMMENDATIONS (deterministic mapping):
{json.dumps(recommendations)}
""".strip()

    try:
        text = await call_featherless(
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_content},
            ],
            max_tokens=350,
            temperature=0.2,
        )

        # Try to parse JSON response
        try:
            parsed = json.loads(text)
            return {"result": parsed}
        except json.JSONDecodeError:
            # Return raw text if JSON parsing fails (for debugging)
            return {"result": text, "parseError": True}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Coach generation failed: {str(e)}")


@router.post("/chat")
async def get_chat_reply(
    payload: ChatRequest,
) -> Dict[str, str]:
    """Generate a chat reply based on baby profile, logs, and conversation history."""
    userMessage = payload.userMessage
    if not userMessage or not isinstance(userMessage, str):
        raise HTTPException(status_code=400, detail="Missing userMessage")

    safe_baby = payload.baby or {}
    safe_logs = payload.recentLogs[-7:] if isinstance(payload.recentLogs, list) else []
    safe_conversation = payload.conversation[-10:] if isinstance(payload.conversation, list) else []

    system_prompt = """
You are Happy Tummy AI, a friendly digestion support assistant for babies age 6–24 months.

Boundaries:
- Do NOT diagnose or claim medical certainty. No "you have X".
- Provide supportive, practical guidance and explain patterns based on the data provided.
- Be concise, empathetic, and actionable for a busy parent.
- If the parent describes severe symptoms, list red flags and recommend contacting a pediatrician.

Personalization rules:
- Use baby profile + recent logs to personalize.
- If data is missing, ask 1 short question before giving long advice.

Output format:
Return plain text (no markdown), 3–6 short sentences max.
""".strip()

    context_prompt = f"""
BABY PROFILE:
{json.dumps(safe_baby)}

RECENT DIGESTION LOGS (most recent last):
{json.dumps(safe_logs)}
""".strip()

    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "system", "content": context_prompt},
        *safe_conversation,
        {"role": "user", "content": userMessage},
    ]

    try:
        answer = await call_featherless(
            messages=messages,
            max_tokens=220,
            temperature=0.2,
        )
        return {"reply": answer or "Sorry — I couldn't generate a response."}
    except HTTPException as e:
        detail_text = str(e.detail).lower()
        if "model_pending_deploy" in detail_text or "not ready for inference" in detail_text:
            return {
                "reply": "I\u2019m waking up my AI model right now. Please try again in about 10\u201320 seconds, and I\u2019ll respond right away."
            }
        raise HTTPException(status_code=500, detail=f"Chat generation failed: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chat generation failed: {str(e)}")


@router.get("/summary")
async def get_child_summary(
    child_user_key: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Dict[str, Any]:
    child = (
        db.query(DimUser)
        .join(ParentChild, ParentChild.child_user_key == DimUser.user_key)
        .filter(ParentChild.parent_user_id == current_user.id)
        .filter(DimUser.user_key == child_user_key)
        .first()
    )
    if not child:
        raise HTTPException(status_code=404, detail="Child not found for this user")

    logs = (
        db.query(DailyLog)
        .filter(DailyLog.child_user_key == child_user_key)
        .order_by(DailyLog.created_at.desc())
        .limit(7)
        .all()
    )

    if not logs:
        return {
            "summary": "No logs yet. Start logging meals and digestion to see insights.",
            "nutritionTotals": {
                "calories": 0,
                "fiber": 0,
                "sugar": 0,
                "protein": 0,
                "water": 0,
            },
            "recentLogsCount": 0,
        }

    log_ids = [log.log_id for log in logs]
    foods = (
        db.query(DailyLogFood)
        .filter(DailyLogFood.log_id.in_(log_ids))
        .all()
    )

    totals = {
        "calories": sum((food.calories or 0) for food in foods),
        "fiber": sum((food.fiber or 0) for food in foods),
        "sugar": sum((food.sugar or 0) for food in foods),
        "protein": sum((food.protein or 0) for food in foods),
        "water": sum((food.water or 0) for food in foods),
    }

    recent_logs = [
        {
            "date": log.log_date,
            "stoolType": log.stool_type,
            "stoolFrequency": log.stool_frequency,
            "hydration": log.hydration_label,
        }
        for log in logs
    ]

    system_prompt = """
You are Happy Tummy AI. Summarize a child's current digestion and hydration status based on recent logs.
Rules:
- Do not diagnose or provide medical advice.
- Use a friendly tone for parents.
- Keep it concise: 2-4 sentences.
- Mention any notable patterns (constipation, diarrhea, low hydration).
""".strip()

    user_content = json.dumps(
        {
            "child": {
                "name": child.name,
                "age": child.age,
                "allergies": child.allergies,
            },
            "recentLogs": recent_logs,
            "nutritionTotals": totals,
        }
    )

    try:
        summary = await call_featherless(
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_content},
            ],
            max_tokens=180,
            temperature=0.2,
        )
    except Exception:
        summary = "Unable to generate summary right now. Please try again later."

    return {
        "summary": summary,
        "nutritionTotals": totals,
        "recentLogsCount": len(logs),
    }


@router.get("/daily-insight")
async def get_daily_insight(
    child_user_key: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Dict[str, Any]:
    child = (
        db.query(DimUser)
        .join(ParentChild, ParentChild.child_user_key == DimUser.user_key)
        .filter(ParentChild.parent_user_id == current_user.id)
        .filter(DimUser.user_key == child_user_key)
        .first()
    )
    if not child:
        raise HTTPException(status_code=404, detail="Child not found for this user")

    logs = (
        db.query(DailyLog)
        .filter(DailyLog.child_user_key == child_user_key)
        .order_by(DailyLog.created_at.desc())
        .limit(8)
        .all()
    )

    if not logs:
        return {
            "childUserKey": child_user_key,
            "currentLogDate": None,
            "comparedLogsCount": 0,
            "status": "watch",
            "title": "No digestion logs yet",
            "description": "Start today\'s log to generate an AI comparison and suggestions.",
            "suggestions": [
                "Log stool type, hydration, and meals daily for better trend insights.",
            ],
        }

    current_log = logs[0]
    previous_logs = logs[1:4]

    log_ids = [log.log_id for log in logs]
    foods = (
        db.query(DailyLogFood)
        .filter(DailyLogFood.log_id.in_(log_ids))
        .all()
    )

    foods_by_log: Dict[int, List[DailyLogFood]] = {}
    for food in foods:
        foods_by_log.setdefault(food.log_id, []).append(food)

    def nutrition_totals_for(log_id: int) -> Dict[str, float]:
        entries = foods_by_log.get(log_id, [])
        return {
            "calories": float(sum((row.calories or 0) for row in entries)),
            "fiber": float(sum((row.fiber or 0) for row in entries)),
            "sugar": float(sum((row.sugar or 0) for row in entries)),
            "protein": float(sum((row.protein or 0) for row in entries)),
            "water": float(sum((row.water or 0) for row in entries)),
        }

    current_payload = {
        "date": current_log.log_date,
        "stoolType": current_log.stool_type,
        "stoolFrequency": current_log.stool_frequency,
        "hydration": current_log.hydration_label,
        "nutrition": nutrition_totals_for(current_log.log_id),
    }

    previous_payload = []
    for log in previous_logs:
        previous_payload.append(
            {
                "date": log.log_date,
                "stoolType": log.stool_type,
                "stoolFrequency": log.stool_frequency,
                "hydration": log.hydration_label,
                "nutrition": nutrition_totals_for(log.log_id),
            }
        )

    system_prompt = """
You are Happy Tummy AI. Compare the latest digestion log against previous logs and produce a parent-friendly insight.
Rules:
- Do not diagnose or provide medical advice.
- Focus on trends: stool consistency, stool frequency, hydration, and meal nutrient pattern changes.
- Keep language concise and actionable.
- Output must be valid JSON only with this exact shape:
{
  "status": "good" | "watch" | "caution",
  "title": string,
  "description": string,
  "suggestions": string[]
}
- Return 1-2 suggestions max.
""".strip()

    user_content = json.dumps(
        {
            "child": {
                "name": child.name,
                "age": child.age,
                "allergies": child.allergies,
                "earlyBorn": child.early_born,
            },
            "currentLog": current_payload,
            "previousLogs": previous_payload,
        }
    )

    default_result = {
        "status": "watch",
        "title": f"{child.name or 'Baby'} digestion trend updated",
        "description": "Today\'s entry has been compared with recent logs. Continue consistent hydration and meal tracking.",
        "suggestions": [
            "Keep meals balanced and monitor stool pattern for the next 24 hours.",
        ],
    }

    try:
        raw = await call_featherless(
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_content},
            ],
            max_tokens=220,
            temperature=0.2,
        )
        parsed = json.loads(raw)
        status = parsed.get("status")
        if status not in {"good", "watch", "caution"}:
            status = "watch"
        result = {
            "status": status,
            "title": str(parsed.get("title") or default_result["title"]),
            "description": str(parsed.get("description") or default_result["description"]),
            "suggestions": [
                str(item) for item in (parsed.get("suggestions") or default_result["suggestions"])[:2]
            ],
        }
    except Exception:
        result = default_result

    return {
        "childUserKey": child_user_key,
        "currentLogDate": current_log.log_date,
        "comparedLogsCount": len(previous_logs),
        **result,
    }


def determine_digestive_need(stool_type: int | None) -> str:
    if stool_type is None:
        return "balanced"
    if stool_type <= 2:
        return "increase_fiber"
    if stool_type >= 6:
        return "decrease_fiber"
    return "balanced"


def build_reason(need: str, hydration: str | None) -> str:
    reason = {
        "increase_fiber": "Higher fiber choices can help soften stools and improve regularity.",
        "decrease_fiber": "Gentler, lower fiber foods may help while stools are loose.",
        "balanced": "Balanced fiber supports steady digestion.",
    }[need]
    if hydration and hydration.lower() == "low":
        return f"{reason} Hydration looks low, so include fluids with meals."
    return reason


def pick_items(query, model, fiber_attr: str, need: str, limit: int = 3):
    column = getattr(model, fiber_attr)
    if need == "decrease_fiber":
        return query.order_by(column.asc()).limit(limit).all()
    return query.order_by(column.desc()).limit(limit).all()


def pick_meals(query, need: str, limit: int = 2):
    if need == "decrease_fiber":
        return query.order_by(MealInfo.total_fiber.asc()).limit(limit).all()
    if need == "increase_fiber":
        return query.order_by(MealInfo.total_fiber.desc()).limit(limit).all()
    return query.order_by(MealInfo.total_protein.desc()).limit(limit).all()


def determine_food_style(age_months: int, stool_type: int | None, need: str) -> tuple[str, str, List[str]]:
    if stool_type is not None and stool_type >= 6:
        return (
            "solid",
            "Recommend solid-soft foods for now and avoid hard textures until stools are more stable.",
            ["liquid", "pureed", "mashed", "soft"],
        )

    if age_months <= 8:
        return (
            "solid",
            "Recommend solid-soft foods (pureed or mashed) that are easy to digest at this stage.",
            ["liquid", "pureed", "mashed", "soft"],
        )

    if age_months <= 11:
        return (
            "hard",
            "Recommend introducing harder textures gradually (soft finger foods first) with close supervision.",
            ["soft", "regular"],
        )

    if need == "increase_fiber":
        return (
            "normal",
            "Recommend normal foods with more fiber and hydration support.",
            ["regular", "soft"],
        )

    return (
        "normal",
        "Recommend normal foods for this age while keeping portions balanced.",
        ["regular", "soft"],
    )


@router.get("/recommendations")
async def get_meal_recommendations(
    child_user_key: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Dict[str, Any]:
    child = (
        db.query(DimUser)
        .join(ParentChild, ParentChild.child_user_key == DimUser.user_key)
        .filter(ParentChild.parent_user_id == current_user.id)
        .filter(DimUser.user_key == child_user_key)
        .first()
    )
    if not child:
        raise HTTPException(status_code=404, detail="Child not found for this user")

    latest_log = (
        db.query(DailyLog)
        .filter(DailyLog.child_user_key == child_user_key)
        .order_by(DailyLog.created_at.desc())
        .first()
    )

    stool_type = latest_log.stool_type if latest_log else None
    hydration = latest_log.hydration_label if latest_log else None
    need = determine_digestive_need(stool_type)

    fruits = pick_items(db.query(FruitInfo), FruitInfo, "fruit_fiber", need)
    veggies = pick_items(db.query(VegInfo), VegInfo, "veg_fiber", need)
    carbs = pick_items(db.query(CarbInfo), CarbInfo, "carb_fiber", need)
    meats = pick_items(db.query(MeatInfo), MeatInfo, "meat_fiber", need)
    milk1 = db.query(Milk1).limit(2).all()
    milk2 = db.query(Milk2).limit(2).all()

    age_months = int(child.age or 0)
    meal_base = (
        db.query(MealInfo)
        .filter(MealInfo.min_age_months <= age_months)
        .filter(MealInfo.max_age_months >= age_months)
    )

    food_style, feeding_message, allowed_textures = determine_food_style(age_months, stool_type, need)

    filtered_meals_query = meal_base.filter(MealInfo.texture.in_(allowed_textures))
    selected_meals = pick_meals(filtered_meals_query, need, limit=2)

    def map_items(items, name_attr, fiber_attr, calories_attr, protein_attr, sugar_attr, qty_attr, unit: str | None = None):
        mapped = []
        for item in items:
            mapped.append(
                {
                    "name": getattr(item, name_attr),
                    "nutrients": {
                        "fiber": getattr(item, fiber_attr),
                        "calories": getattr(item, calories_attr),
                        "protein": getattr(item, protein_attr),
                        "sugar": getattr(item, sugar_attr),
                    },
                    "quantity": getattr(item, qty_attr),
                    "unit": unit,
                }
            )
        return mapped

    reason = build_reason(need, hydration)

    meal_recommendations = [
        {
            "name": meal.meal_name,
            "mealType": meal.meal_type,
            "description": meal.description,
            "texture": meal.texture,
            "ageRange": {"minMonths": meal.min_age_months, "maxMonths": meal.max_age_months},
            "reason": reason,
            "nutrients": {
                "calories": meal.total_calories,
                "protein": meal.total_protein,
                "fiber": meal.total_fiber,
                "sugar": meal.total_sugar,
            },
        }
        for meal in selected_meals
    ]

    ingredient_recommendations = [
        {
            "category": "Fruits",
            "reason": reason,
            "items": map_items(
                fruits,
                "fruit_food",
                "fruit_fiber",
                "fruit_calories",
                "fruit_protein",
                "fruit_sugar",
                "quantity_fruit",
                "g",
            ),
        },
        {
            "category": "Vegetables",
            "reason": reason,
            "items": map_items(
                veggies,
                "veg_food",
                "veg_fiber",
                "veg_calories",
                "veg_protein",
                "veg_sugar",
                "quantity_veg",
                "g",
            ),
        },
        {
            "category": "Carbs",
            "reason": reason,
            "items": map_items(
                carbs,
                "carb_food",
                "carb_fiber",
                "carb_calories",
                "carb_protein",
                "carb_sugar",
                "quantity_carb",
                "g",
            ),
        },
        {
            "category": "Protein",
            "reason": reason,
            "items": map_items(
                meats,
                "meat_food",
                "meat_fiber",
                "meat_calories",
                "meat_protein",
                "meat_sugar",
                "quantity_meat",
                "g",
            ),
        },
        {
            "category": "Milk (0-12 mo)",
            "reason": "Use age-appropriate milk guidance from your plan.",
            "items": map_items(
                milk1,
                "milk1_name",
                "milk1_fiber",
                "milk1_calories",
                "milk1_protein",
                "milk1_sugar",
                "quantity_milk1",
                None,
            ),
        },
        {
            "category": "Milk (12+ mo)",
            "reason": "Use age-appropriate milk guidance from your plan.",
            "items": map_items(
                milk2,
                "milk2_name",
                "milk2_fiber",
                "milk2_calories",
                "milk2_protein",
                "milk2_sugar",
                "quantity_milk2",
                None,
            ),
        },
    ]

    return {
        "child": {
            "id": child.user_key,
            "name": child.name,
            "age": child.age,
        },
        "condition": {
            "stoolType": stool_type,
            "hydration": hydration,
        },
        "feedingGuidance": {
            "recommendedType": food_style,
            "message": feeding_message,
        },
        "mealRecommendations": meal_recommendations,
        "ingredientRecommendations": ingredient_recommendations,
        "recommendations": ingredient_recommendations,
    }


@router.get("/nutrition/search")
async def search_nutrition(query: str, db: Session = Depends(get_db)) -> Dict[str, List[Dict[str, Any]]]:
    """Search USDA FDC database for food nutrition information."""
    if not query:
        raise HTTPException(status_code=400, detail="Missing query")

    normalized_query = query.strip().lower()
    if len(normalized_query) < 2:
        return {"results": []}

    cached = NUTRITION_CACHE.get(normalized_query)
    now_ts = time.time()
    if cached and (now_ts - cached.get("ts", 0)) <= settings.nutrition_cache_ttl_seconds:
        return {"results": cached.get("results", [])}

    local_results: List[Dict[str, Any]] = []

    def add_local_item(name: Any, calories: Any, fiber: Any, sugar: Any, protein: Any, quantity: Any, unit: str | None = None) -> None:
        if not isinstance(name, str):
            return
        if normalized_query not in name.lower():
            return
        if len(local_results) >= 5:
            return
        qty_numeric: float | None = None
        if isinstance(quantity, (int, float)):
            qty_numeric = float(quantity)
        local_results.append(
            {
                "name": name,
                "fdcId": None,
                "calories": calories,
                "fiber": fiber,
                "sugar": sugar,
                "protein": protein,
                "water": None,
                "defaultServingSize": qty_numeric or 100,
                "defaultUnit": unit or ("g" if qty_numeric is not None else None),
                "availableUnits": [unit] if unit else ["g"],
                "source": "local",
            }
        )

    for item in db.query(FruitInfo).all():
        add_local_item(item.fruit_food, item.fruit_calories, item.fruit_fiber, item.fruit_sugar, item.fruit_protein, item.quantity_fruit, "g")
    for item in db.query(VegInfo).all():
        add_local_item(item.veg_food, item.veg_calories, item.veg_fiber, item.veg_sugar, item.veg_protein, item.quantity_veg, "g")
    for item in db.query(CarbInfo).all():
        add_local_item(item.carb_food, item.carb_calories, item.carb_fiber, item.carb_sugar, item.carb_protein, item.quantity_carb, "g")
    for item in db.query(MeatInfo).all():
        add_local_item(item.meat_food, item.meat_calories, item.meat_fiber, item.meat_sugar, item.meat_protein, item.quantity_meat, "g")
    for item in db.query(Milk1).all():
        add_local_item(item.milk1_name, item.milk1_calories, item.milk1_fiber, item.milk1_sugar, item.milk1_protein, item.quantity_milk1, None)
    for item in db.query(Milk2).all():
        add_local_item(item.milk2_name, item.milk2_calories, item.milk2_fiber, item.milk2_sugar, item.milk2_protein, item.quantity_milk2, None)

    if len(local_results) >= 3:
        NUTRITION_CACHE[normalized_query] = {"ts": now_ts, "results": local_results[:5]}
        return {"results": local_results[:5]}
    
    if not USDA_API_KEY:
        NUTRITION_CACHE[normalized_query] = {"ts": now_ts, "results": local_results[:5]}
        return {"results": local_results[:5]}

    url = (
        f"https://api.nal.usda.gov/fdc/v1/foods/search"
        f"?query={query}"
        f"&api_key={USDA_API_KEY}"
        f"&dataType=Foundation,SR%20Legacy"
        f"&pageSize=5"
        f"&requireAllWords=true"
    )
    
    print(f"[NUTRITION] Searching USDA API with query: {query}")
    print(f"[NUTRITION] URL: {url[:80]}...")

    try:
        async with httpx.AsyncClient() as client:
            print(f"[NUTRITION] Making request to USDA API (timeout: {settings.usda_timeout_seconds:.0f}s)...")
            response = await client.get(url, timeout=settings.usda_timeout_seconds)
            
            print(f"[NUTRITION] Response status: {response.status_code}")
            
            if response.status_code != 200:
                error_text = response.text
                print(f"[NUTRITION] USDA API error: {error_text}")
                raise HTTPException(status_code=500, detail=f"USDA API error: {error_text}")
            
            data = response.json()
            foods = data.get("foods", [])
            print(f"[NUTRITION] Found {len(foods)} foods")

            def get_nutrient(food: Dict, nutrient_id: int) -> Optional[float]:
                """Extract nutrient value by ID."""
                nutrients = food.get("foodNutrients", [])
                for n in nutrients:
                    if n.get("nutrientId") == nutrient_id:
                        return n.get("value")
                return None

            def get_default_serving(description: str) -> Dict[str, Any]:
                """Get default serving size based on food description."""
                desc = description.lower()
                if "babyfood" in desc or "baby" in desc:
                    return {"size": 113, "unit": "g"}  # Standard baby food jar
                if "juice" in desc:
                    return {"size": 240, "unit": "ml"}  # 1 cup
                if "cereal" in desc:
                    return {"size": 15, "unit": "g"}  # 1 tbsp
                if "fruit" in desc:
                    return {"size": 28, "unit": "g"}  # 1 oz
                return {"size": food.get("servingSize", 100), "unit": food.get("servingSizeUnit", "g")}

            def get_available_units(description: str) -> List[str]:
                """Get appropriate serving units based on food type."""
                desc = description.lower()
                if any(x in desc for x in ["juice", "milk", "water"]):
                    return ["ml", "fl oz", "cup"]
                if any(x in desc for x in ["cereal", "powder"]):
                    return ["g", "tbsp", "tsp"]
                if any(x in desc for x in ["fruit", "vegetable"]):
                    return ["g", "oz", "piece", "slice"]
                if "babyfood" in desc:
                    return ["g", "jar", "tbsp"]
                return ["g", "oz", "tbsp", "tsp"]

            results = []
            for food in foods:
                default_serving = get_default_serving(food.get("description", ""))
                
                result = {
                    "name": food.get("description"),
                    "fdcId": food.get("fdcId"),
                    "calories": get_nutrient(food, 1008),
                    "fiber": get_nutrient(food, 1079),
                    "sugar": get_nutrient(food, 2000),
                    "protein": get_nutrient(food, 1003),
                    "water": get_nutrient(food, 1051),
                    "defaultServingSize": default_serving["size"],
                    "defaultUnit": default_serving["unit"],
                    "availableUnits": get_available_units(food.get("description", "")),
                }
                results.append(result)

            merged = (local_results + results)[:5]
            NUTRITION_CACHE[normalized_query] = {"ts": now_ts, "results": merged}
            return {"results": merged}

    except httpx.ConnectError as e:
        print(f"[NUTRITION] ❌ Connection Error: {str(e)}")
        raise HTTPException(status_code=503, detail=f"USDA API unreachable: {str(e)}")
    except httpx.TimeoutException as e:
        print(f"[NUTRITION] ❌ Timeout Error: {str(e)}")
        if local_results:
            NUTRITION_CACHE[normalized_query] = {"ts": now_ts, "results": local_results[:5]}
            return {"results": local_results[:5]}
        raise HTTPException(status_code=504, detail=f"USDA API timeout: {str(e)}")
    except httpx.RequestError as e:
        print(f"[NUTRITION] ❌ Request Error: {str(e)}")
        if local_results:
            NUTRITION_CACHE[normalized_query] = {"ts": now_ts, "results": local_results[:5]}
            return {"results": local_results[:5]}
        raise HTTPException(status_code=500, detail=f"USDA search failed: {str(e)}")
    except Exception as e:
        print(f"[NUTRITION] ❌ Unexpected Error ({type(e).__name__}): {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Nutrition search error: {type(e).__name__}: {str(e)}")
