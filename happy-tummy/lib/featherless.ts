export async function getCoachMessage(payload: {
    
  baby: { ageMonths: number; allergies?: string[]; feedingStage?: string };
  insights: string[];
  recommendations: { try_today: string[]; avoid_today: string[]; habit_tip?: string };
}) {
  const base = process.env.EXPO_PUBLIC_AI_URL;
  if (!base) throw new Error("Missing EXPO_PUBLIC_AI_URL");

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
  const base = process.env.EXPO_PUBLIC_AI_URL;
  if (!base) throw new Error("Missing EXPO_PUBLIC_AI_URL");

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