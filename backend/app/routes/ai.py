"""AI-powered coach and chat endpoints for baby digestion support."""
import json
import os
from collections import defaultdict
from typing import Optional, Any, List, Dict
from fastapi import APIRouter, HTTPException, Depends
import httpx
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.core.config import settings
from app.db.session import get_db
from app.models.happytummy_schema import DimUser, ParentChild
from app.models.logs import DailyLog, DailyLogFood
from app.models.meal_info import MealInfo, FruitInfo, VegInfo, CarbInfo, MeatInfo, Milk1, Milk2
from app.models.user import User
from app.routes.auth import get_current_user

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
SPOONACULAR_KEY = settings.spoonacular_key


def _get_child_for_user(db: Session, current_user: User, child_user_key: int) -> DimUser:
    child = (
        db.query(DimUser)
        .join(ParentChild, ParentChild.child_user_key == DimUser.user_key)
        .filter(ParentChild.parent_user_id == current_user.id)
        .filter(DimUser.user_key == child_user_key)
        .first()
    )
    if not child:
        raise HTTPException(status_code=404, detail="Child not found for this user")
    return child


def _nutrition_totals(rows: List[DailyLogFood]) -> Dict[str, float]:
    totals = {"calories": 0.0, "fiber": 0.0, "sugar": 0.0, "protein": 0.0, "water": 0.0}
    for row in rows:
        totals["calories"] += float(row.calories or 0)
        totals["fiber"] += float(row.fiber or 0)
        totals["sugar"] += float(row.sugar or 0)
        totals["protein"] += float(row.protein or 0)
        totals["water"] += float(row.water or 0)
    return totals


def _feeding_guidance(stool_type: Optional[int], hydration: Optional[str]) -> Dict[str, str]:
    hydration_lower = (hydration or "").lower()

    if stool_type is not None and stool_type <= 2:
        return {
            "recommendedType": "hard",
            "message": "Focus on soft, high-fiber foods and extra fluids today.",
        }

    if stool_type is not None and stool_type >= 6:
        return {
            "recommendedType": "solid",
            "message": "Choose gentle binding foods and keep hydration steady.",
        }

    if hydration_lower == "low":
        return {
            "recommendedType": "normal",
            "message": "Add more fluid-rich foods and offer water frequently.",
        }

    return {
        "recommendedType": "normal",
        "message": "Maintain a balanced meal pattern based on age and recent tolerance.",
    }


def _is_fiber_ranking_question(message: str) -> bool:
    text = (message or "").lower()
    patterns = [
        "most fiber",
        "highest fiber",
        "high fiber",
        "rich in fiber",
        "top fiber",
    ]
    return any(pattern in text for pattern in patterns)


def _top_fiber_foods(db: Session, limit: int = 5) -> List[Dict[str, Any]]:
    rows: List[Dict[str, Any]] = []

    for record in db.query(FruitInfo).all():
        if record.fruit_food and record.fruit_fiber is not None:
            rows.append({"name": record.fruit_food, "fiber": float(record.fruit_fiber), "category": "fruit"})

    for record in db.query(VegInfo).all():
        if record.veg_food and record.veg_fiber is not None:
            rows.append({"name": record.veg_food, "fiber": float(record.veg_fiber), "category": "vegetable"})

    for record in db.query(CarbInfo).all():
        if record.carb_food and record.carb_fiber is not None:
            rows.append({"name": record.carb_food, "fiber": float(record.carb_fiber), "category": "carb"})

    for record in db.query(MeatInfo).all():
        if record.meat_food and record.meat_fiber is not None:
            rows.append({"name": record.meat_food, "fiber": float(record.meat_fiber), "category": "protein"})

    for record in db.query(Milk1).all():
        if record.milk1_name and record.milk1_fiber is not None:
            rows.append({"name": record.milk1_name, "fiber": float(record.milk1_fiber), "category": "milk"})

    for record in db.query(Milk2).all():
        if record.milk2_name and record.milk2_fiber is not None:
            rows.append({"name": record.milk2_name, "fiber": float(record.milk2_fiber), "category": "milk"})

    deduped: Dict[str, Dict[str, Any]] = {}
    for item in rows:
        key = str(item["name"]).strip().lower()
        if key not in deduped or float(item["fiber"]) > float(deduped[key]["fiber"]):
            deduped[key] = item

    sorted_rows = sorted(deduped.values(), key=lambda x: x["fiber"], reverse=True)
    return sorted_rows[:limit]


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
                timeout=30.0,
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
    db: Session = Depends(get_db),
) -> Dict[str, str]:
    """Generate a chat reply based on baby profile, logs, and conversation history."""
    userMessage = payload.userMessage
    if not userMessage or not isinstance(userMessage, str):
        raise HTTPException(status_code=400, detail="Missing userMessage")

    safe_baby = payload.baby or {}
    safe_logs = payload.recentLogs[-7:] if isinstance(payload.recentLogs, list) else []
    safe_conversation = payload.conversation[-10:] if isinstance(payload.conversation, list) else []

    if _is_fiber_ranking_question(userMessage):
        top_fiber = _top_fiber_foods(db, limit=5)
        if not top_fiber:
            return {"reply": "I couldn't find fiber data right now. Please try again in a moment."}

        ranked = ", ".join([f"{item['name']} ({item['fiber']:.1f}g/100g)" for item in top_fiber])
        return {
            "reply": (
                f"From our nutrition database, top high-fiber options are: {ranked}. "
                "For babies, introduce fiber gradually with enough fluids to avoid constipation."
            )
        }

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


@router.get("/nutrition/search")
async def search_nutrition(query: str) -> Dict[str, List[Dict[str, Any]]]:
    """Search Spoonacular for food nutrition information."""
    if not query:
        raise HTTPException(status_code=400, detail="Missing query")

    if not SPOONACULAR_KEY:
        raise HTTPException(status_code=500, detail="Spoonacular API key not configured")

    search_url = (
        f"https://api.spoonacular.com/food/ingredients/search"
        f"?query={query}&number=5&apiKey={SPOONACULAR_KEY}"
    )

    def get_available_units(description: str) -> List[str]:
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

    async def fetch_detail(client: httpx.AsyncClient, ingredient_id: int) -> Dict[str, Any]:
        try:
            url = (
                f"https://api.spoonacular.com/food/ingredients/{ingredient_id}/information"
                f"?amount=100&unit=grams&apiKey={SPOONACULAR_KEY}"
            )
            resp = await client.get(url, timeout=4.0)
            if resp.status_code != 200:
                return {}
            info = resp.json()
            nutrients = info.get("nutrition", {}).get("nutrients", [])
            def find(name: str) -> Optional[float]:
                for n in nutrients:
                    if n.get("name", "").lower() == name.lower():
                        return n.get("amount")
                return None
            return {"calories": find("Calories"), "fiber": find("Fiber"), "sugar": find("Sugar"), "protein": find("Protein"), "water": find("Water")}
        except Exception:
            return {}

    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(search_url, timeout=8.0)
            if response.status_code != 200:
                raise HTTPException(status_code=500, detail=f"Spoonacular error: {response.text}")

            data = response.json()
            items = data.get("results", [])

            import asyncio
            nutrition_data = await asyncio.gather(
                *[fetch_detail(client, item.get("id")) for item in items]
            )

            results = [
                {
                    "name": item.get("name", "").capitalize(),
                    "fdcId": item.get("id"),
                    "calories": nutrition_data[i].get("calories"),
                    "fiber": nutrition_data[i].get("fiber"),
                    "sugar": nutrition_data[i].get("sugar"),
                    "protein": nutrition_data[i].get("protein"),
                    "water": nutrition_data[i].get("water"),
                    "availableUnits": get_available_units(item.get("name", "")),
                }
                for i, item in enumerate(items)
            ]

            return {"results": results}

    except httpx.RequestError as e:
        raise HTTPException(status_code=500, detail=f"Spoonacular search failed: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Nutrition search error: {str(e)}")


@router.get("/summary")
def get_summary(
    child_user_key: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Dict[str, Any]:
    _get_child_for_user(db, current_user, child_user_key)

    recent_logs = (
        db.query(DailyLog)
        .filter(DailyLog.child_user_key == child_user_key)
        .order_by(DailyLog.created_at.desc())
        .limit(7)
        .all()
    )

    if not recent_logs:
        return {
            "summary": "No logs yet. Add a daily log to start personalized tracking insights.",
            "nutritionTotals": {
                "calories": 0,
                "fiber": 0,
                "sugar": 0,
                "protein": 0,
                "water": 0,
            },
            "recentLogsCount": 0,
        }

    log_ids = [log.log_id for log in recent_logs]
    foods = db.query(DailyLogFood).filter(DailyLogFood.log_id.in_(log_ids)).all()
    totals = _nutrition_totals(foods)

    latest = recent_logs[0]
    stool_text = "within expected range" if latest.stool_type in {3, 4, 5} else "needs attention"
    hydration_text = (latest.hydration_label or "unknown").lower()

    summary = (
        f"From the last {len(recent_logs)} log(s), digestion trend is {stool_text}. "
        f"Hydration is {hydration_text}, with total fiber {totals['fiber']:.1f}g and protein {totals['protein']:.1f}g recorded."
    )

    return {
        "summary": summary,
        "nutritionTotals": {
            "calories": round(totals["calories"], 1),
            "fiber": round(totals["fiber"], 1),
            "sugar": round(totals["sugar"], 1),
            "protein": round(totals["protein"], 1),
            "water": round(totals["water"], 1),
        },
        "recentLogsCount": len(recent_logs),
    }


@router.get("/daily-insight")
def get_daily_insight(
    child_user_key: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Dict[str, Any]:
    _get_child_for_user(db, current_user, child_user_key)

    logs = (
        db.query(DailyLog)
        .filter(DailyLog.child_user_key == child_user_key)
        .order_by(DailyLog.created_at.desc())
        .limit(2)
        .all()
    )

    if not logs:
        return {
            "childUserKey": child_user_key,
            "currentLogDate": None,
            "comparedLogsCount": 0,
            "status": "watch",
            "title": "No logs yet",
            "description": "Add a daily log so we can start trend tracking.",
            "suggestions": ["Log stool type, hydration, and meals once daily."],
        }

    latest = logs[0]
    if len(logs) == 1:
        return {
            "childUserKey": child_user_key,
            "currentLogDate": latest.log_date,
            "comparedLogsCount": 0,
            "status": "watch",
            "title": "Need one more log for comparison",
            "description": "We saved today’s entry. Add another day to compare trends.",
            "suggestions": ["Continue logging at the same time each day."],
        }

    previous = logs[1]
    score = 0

    if latest.stool_type in {3, 4, 5}:
        score += 1
    else:
        score -= 1

    latest_hydration = (latest.hydration_label or "").lower()
    if latest_hydration in {"normal", "good"}:
        score += 1
    elif latest_hydration == "low":
        score -= 1

    if latest.stool_frequency is not None and previous.stool_frequency is not None:
        if abs(latest.stool_frequency - previous.stool_frequency) <= 1:
            score += 1

    if score >= 2:
        status = "good"
        title = "Digestion trend looks stable"
        description = "Today’s stool and hydration pattern look consistent with a healthy trend."
        suggestions = [
            "Keep meal timing and hydration consistent.",
            "Continue offering fiber-rich fruits and vegetables.",
        ]
    elif score >= 0:
        status = "watch"
        title = "Mild variation detected"
        description = "There are small shifts from the previous log. Keep monitoring tomorrow’s pattern."
        suggestions = [
            "Offer water more frequently through the day.",
            "Keep meals simple and avoid multiple new foods at once.",
        ]
    else:
        status = "caution"
        title = "Digestive pattern needs attention"
        description = "Compared with the previous log, stool and hydration suggest increased digestive stress."
        suggestions = [
            "Prioritize hydration and soft, gentle meals.",
            "If severe symptoms continue, contact your pediatrician.",
        ]

    return {
        "childUserKey": child_user_key,
        "currentLogDate": latest.log_date,
        "comparedLogsCount": 1,
        "status": status,
        "title": title,
        "description": description,
        "suggestions": suggestions,
    }


@router.get("/recommendations")
def get_recommendations(
    child_user_key: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Dict[str, Any]:
    child = _get_child_for_user(db, current_user, child_user_key)

    age_months = int(child.age or 0)
    latest_log = (
        db.query(DailyLog)
        .filter(DailyLog.child_user_key == child_user_key)
        .order_by(DailyLog.created_at.desc())
        .first()
    )

    meals = (
        db.query(MealInfo)
        .filter(MealInfo.min_age_months <= age_months)
        .filter(MealInfo.max_age_months >= age_months)
        .order_by(MealInfo.meal_type.asc(), MealInfo.meal_id.asc())
        .all()
    )

    if not meals:
        meals = (
            db.query(MealInfo)
            .order_by(MealInfo.min_age_months.asc(), MealInfo.meal_type.asc(), MealInfo.meal_id.asc())
            .limit(8)
            .all()
        )

    meal_recommendations = [
        {
            "name": meal.meal_name,
            "mealType": meal.meal_type,
            "description": meal.description,
            "texture": meal.texture,
            "ageRange": {
                "minMonths": meal.min_age_months,
                "maxMonths": meal.max_age_months,
            },
            "reason": "Matched by age profile" if not latest_log else "Matched by age and current digestion pattern",
            "nutrients": {
                "fiber": meal.total_fiber,
                "calories": meal.total_calories,
                "protein": meal.total_protein,
                "sugar": meal.total_sugar,
            },
        }
        for meal in meals
    ]

    grouped: Dict[str, List[Dict[str, Any]]] = defaultdict(list)
    for meal in meal_recommendations:
        grouped[(meal.get("mealType") or "general").title()].append(
            {
                "name": meal.get("name"),
                "quantity": None,
                "unit": None,
                "nutrients": meal.get("nutrients"),
            }
        )

    grouped_recommendations = [
        {
            "category": category,
            "reason": "Age-appropriate meal options",
            "items": items,
        }
        for category, items in grouped.items()
    ]

    feeding_guidance = _feeding_guidance(
        latest_log.stool_type if latest_log else None,
        latest_log.hydration_label if latest_log else None,
    )

    return {
        "child": {
            "id": child.user_key,
            "name": child.name,
            "age": child.age,
        },
        "condition": {
            "stoolType": latest_log.stool_type if latest_log else None,
            "hydration": latest_log.hydration_label if latest_log else None,
        },
        "feedingGuidance": feeding_guidance,
        "mealRecommendations": meal_recommendations,
        "ingredientRecommendations": grouped_recommendations,
        "recommendations": grouped_recommendations,
    }