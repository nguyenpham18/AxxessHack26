"""AI-powered coach and chat endpoints for baby digestion support."""
import json
import os
from typing import Optional, Any, List, Dict
from fastapi import APIRouter, HTTPException
import httpx
from app.core.config import settings

router = APIRouter(prefix="/api/ai", tags=["ai"])

# Initialize OpenAI client pointing to Featherless
FEATHERLESS_BASE_URL = "https://api.featherless.ai/v1"
FEATHERLESS_API_KEY = settings.featherless_api_key
FEATHERLESS_MODEL = settings.featherless_model
USDA_API_KEY = settings.usda_api_key


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
    baby: Optional[Dict[str, Any]] = None,
    recentLogs: Optional[List[Any]] = None,
    conversation: Optional[List[Dict[str, str]]] = None,
    userMessage: str = None,
) -> Dict[str, str]:
    """Generate a chat reply based on baby profile, logs, and conversation history."""
    if not userMessage or not isinstance(userMessage, str):
        raise HTTPException(status_code=400, detail="Missing userMessage")

    safe_baby = baby or {}
    safe_logs = recentLogs[-7:] if isinstance(recentLogs, list) else []
    safe_conversation = conversation[-10:] if isinstance(conversation, list) else []

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
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chat generation failed: {str(e)}")


@router.get("/nutrition/search")
async def search_nutrition(query: str) -> Dict[str, List[Dict[str, Any]]]:
    """Search USDA FDC database for food nutrition information."""
    if not query:
        raise HTTPException(status_code=400, detail="Missing query")
    
    if not USDA_API_KEY:
        raise HTTPException(status_code=500, detail="USDA API key not configured")

    url = (
        f"https://api.nal.usda.gov/fdc/v1/foods/search"
        f"?query={query}"
        f"&api_key={USDA_API_KEY}"
        f"&dataType=Foundation,SR%20Legacy"
        f"&pageSize=5"
        f"&requireAllWords=true"
    )

    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(url, timeout=10.0)
            
            if response.status_code != 200:
                error_text = response.text
                raise HTTPException(status_code=500, detail=f"USDA API error: {error_text}")
            
            data = response.json()
            foods = data.get("foods", [])

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

            return {"results": results}

    except httpx.RequestError as e:
        raise HTTPException(status_code=500, detail=f"USDA search failed: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Nutrition search error: {str(e)}")
