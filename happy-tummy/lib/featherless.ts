const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://127.0.0.1:8000';
const LEGACY_AI_BASE_URL = process.env.EXPO_PUBLIC_AI_URL;

function getAiBaseUrl() {
  if (LEGACY_AI_BASE_URL) {
    return LEGACY_AI_BASE_URL;
  }
  return `${API_BASE_URL}/api/ai`;
}

export async function getCoachMessage(payload: {
    
  baby: { ageMonths: number; allergies?: string[]; feedingStage?: string };
  insights: string[];
  recommendations: { try_today: string[]; avoid_today: string[]; habit_tip?: string };
}) {
  const base = getAiBaseUrl();

  const res = await fetch(`${base}/coach`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Coach failed: ${res.status} ${text}`);
  }

  return res.json(); // { result: "..." } (or JSON string if you enforce JSON)
}

export async function getChatReply(payload: {
  baby?: any;
  recentLogs?: any[];
  conversation?: { role: "user" | "assistant"; content: string }[];
  userMessage: string;
}) {
  const base = getAiBaseUrl();

  const res = await fetch(`${base}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Chat failed: ${res.status} ${text}`);
  }

  return res.json() as Promise<{ reply: string }>;
}

export async function searchNutrition(query: string) {
  const base = getAiBaseUrl();

  const res = await fetch(`${base}/nutrition/search?query=${encodeURIComponent(query)}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Nutrition search failed: ${res.status} ${text}`);
  }

  return res.json() as Promise<{ results: any[] }>;
}