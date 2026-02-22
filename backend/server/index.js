import "dotenv/config";
import express from "express";
import cors from "cors";
import OpenAI from "openai";

const app = express();
app.use(cors());
app.use(express.json());

const client = new OpenAI({
  baseURL: "https://api.featherless.ai/v1",
  apiKey: process.env.FEATHERLESS_API_KEY,
});

app.get("/health", (req, res) => {
  res.json({ status: "Server running" });
});

app.post("/coach", async (req, res) => {
  try {
    const { baby, insights, recommendations } = req.body || {};

    // Basic validation so the model gets clean inputs
    if (!baby || !recommendations) {
      return res.status(400).json({ error: "Missing baby or recommendations" });
    }

    const system = `
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
`.trim();

    const user = `
BABY:
${JSON.stringify(baby)}

INSIGHTS (from tracking):
${JSON.stringify(insights || [])}

RECOMMENDATIONS (deterministic mapping):
${JSON.stringify(recommendations)}
`.trim();

    const completion = await client.chat.completions.create({
      model: process.env.FEATHERLESS_MODEL,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      temperature: 0.2,
      max_tokens: 350,
    });

    const text = completion.choices?.[0]?.message?.content || "{}";

    // Try to parse JSON; if it fails, return raw text for debugging
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch (e) {
      return res.json({ result: text, parseError: true });
    }

    // Return parsed JSON so frontend can render nicely
    return res.json({ result: parsed });
  } catch (error) {
    console.error("Coach error:", error);
    return res.status(500).json({ error: "coach_failed" });
  }
});

app.post("/chat", async (req, res) => {
  try {
    const { baby, recentLogs, conversation, userMessage } = req.body || {};

    if (!userMessage || typeof userMessage !== "string") {
      return res.status(400).json({ error: "Missing userMessage" });
    }

    // Optional but recommended: keep these small so the model stays fast
    const safeBaby = baby || {};
    const safeLogs = Array.isArray(recentLogs) ? recentLogs.slice(-7) : [];

    // conversation is your chat history from the app:
    // [{ role: "user" | "assistant", content: "..." }, ...]
    const safeConversation = Array.isArray(conversation) ? conversation.slice(-10) : [];

    const system = `
You are Happy Tummy AI, a friendly digestion support assistant for babies age 6–24 months.

Boundaries:
- Do NOT diagnose or claim medical certainty. No “you have X”.
- Provide supportive, practical guidance and explain patterns based on the data provided.
- Be concise, empathetic, and actionable for a busy parent.
- If the parent describes severe symptoms, list red flags and recommend contacting a pediatrician.

Personalization rules:
- Use baby profile + recent logs to personalize.
- If data is missing, ask 1 short question before giving long advice.

Output format:
Return plain text (no markdown), 3–6 short sentences max.
`.trim();

    const context = `
BABY PROFILE:
${JSON.stringify(safeBaby)}

RECENT DIGESTION LOGS (most recent last):
${JSON.stringify(safeLogs)}
`.trim();

    const completion = await client.chat.completions.create({
      model: process.env.FEATHERLESS_MODEL,
      temperature: 0.2,
      max_tokens: 220,
      messages: [
        { role: "system", content: system },
        { role: "system", content: context },
        ...safeConversation,
        { role: "user", content: userMessage },
      ],
    });

    const answer = completion.choices?.[0]?.message?.content ?? "Sorry — I couldn’t generate a response.";
    return res.json({ reply: answer });
  } catch (err) {
    console.error("Chat error:", err);
    return res.status(500).json({ error: "chat_failed" });
  }
});

app.get('/nutrition/search', async (req, res) => {
  const { query } = req.query;
  console.log('Search query received:', query);
  
  if (!query) return res.status(400).json({ error: 'Missing query' });

  try {
    const url = `https://api.nal.usda.gov/fdc/v1/foods/search` +
      `?query=${encodeURIComponent(query)}` +
      `&api_key=${process.env.USDA_API_KEY}` +
      `&dataType=Foundation,SR%20Legacy` +
      `&pageSize=5` +
      `&requireAllWords=true`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('USDA API error:', errorText);
      return res.status(500).json({ error: 'USDA API failed', details: errorText });
    }
    
    const data = await response.json();

    const results = (data.foods || []).map((food) => {
      const getNutrient = (id) =>
        food.foodNutrients?.find((n) => n.nutrientId === id)?.value ?? null;

      // Extract serving size information
      const servingSize = food.servingSize || 100; // Default to 100g if no serving size
      const servingSizeUnit = food.servingSizeUnit || 'g'; // Default to grams
      
      // Common serving size mappings for baby foods
      const getDefaultServing = (description) => {
        const desc = description.toLowerCase();
        if (desc.includes('babyfood') || desc.includes('baby')) {
          return { size: 113, unit: 'g' }; // Standard baby food jar
        }
        if (desc.includes('juice')) {
          return { size: 240, unit: 'ml' }; // 1 cup
        }
        if (desc.includes('cereal')) {
          return { size: 15, unit: 'g' }; // 1 tbsp
        }
        if (desc.includes('fruit')) {
          return { size: 28, unit: 'g' }; // 1 oz
        }
        return { size: servingSize, unit: servingSizeUnit };
      };

      const defaultServing = getDefaultServing(food.description);

      const result = {
        name: food.description,
        fdcId: food.fdcId,
        calories: getNutrient(1008),
        fiber: getNutrient(1079),
        sugar: getNutrient(2000),
        protein: getNutrient(1003),
        water: getNutrient(1051),
        // Add serving information
        defaultServingSize: defaultServing.size,
        defaultUnit: defaultServing.unit,
        // Alternative common units for this food
        availableUnits: getAvailableUnits(food.description)
      };
      
      return result;
    });

    return res.json({ results });
  } catch (err) {
    console.error('USDA search error:', err.message);
    return res.status(500).json({ error: 'nutrition_search_failed', details: err.message });
  }
});

// Helper function to suggest appropriate units based on food type
function getAvailableUnits(description) {
  const desc = description.toLowerCase();
  
  if (desc.includes('juice') || desc.includes('milk') || desc.includes('water')) {
    return ['ml', 'fl oz', 'cup'];
  }
  
  if (desc.includes('cereal') || desc.includes('powder')) {
    return ['g', 'tbsp', 'tsp'];
  }
  
  if (desc.includes('fruit') || desc.includes('vegetable')) {
    return ['g', 'oz', 'piece', 'slice'];
  }
  
  if (desc.includes('babyfood')) {
    return ['g', 'jar', 'tbsp'];
  }
  
  // Default units
  return ['g', 'oz', 'tbsp', 'tsp'];
}

app.listen(3333, () => console.log("Server running on http://localhost:3333"));