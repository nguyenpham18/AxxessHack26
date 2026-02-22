import { getAccessToken } from '@/lib/session';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://127.0.0.1:8000';
const API_ROOT = `${API_BASE_URL}/api`;

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = await getAccessToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> | undefined),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_ROOT}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let message = 'Request failed';
    try {
      const data = (await response.json()) as { detail?: unknown };
      if (typeof data?.detail === 'string') {
        message = data.detail;
      } else if (Array.isArray(data?.detail)) {
        message = data.detail.map((e: any) => e.msg ?? JSON.stringify(e)).join(', ');
      }
    } catch {
      // ignore parse errors
    }
    throw new Error(message);
  }

  return (await response.json()) as T;
}

export type TokenResponse = { access_token: string; token_type: string };
export type UserResponse = { id: number; username: string; first_name: string };
export type ChildResponse = {
  user_key: number;
  use_id: number | null;
  name: string | null;
  age: number | null;
  gender: string | null;
  weight: number | null;
  allergies: number | null;
  early_born: number | null;
  delivery_method: number | null;
  envi_change: number | null;
  parent_consent: boolean
};

export async function registerUser(payload: {
  first_name: string;
  username: string;
  password: string;
}) {
  return request<UserResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function loginUser(payload: { username: string; password: string }) {
  return request<TokenResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function getMe() {
  return request<UserResponse>('/auth/me');
}

export async function listChildren() {
  return request<ChildResponse[]>('/children');
}

export async function createChild(payload: {
  use_id?: number | null;
  name: string;
  age?: number | null;
  gender?: string | null;
  weight?: number | null;
  allergies?: number | null;
  early_born?: number | null;
  delivery_method?: number | null;
  envi_change?: number | null;
  parent_consent?: boolean
}) {
  return request<ChildResponse>('/children', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export type NutritionInfo = {
  calories: number | null;
  fiber: number | null;
  sugar: number | null;
  protein: number | null;
  water?: number | null;
};

export type DailyLogFood = {
  name: string;
  quantity: number | null;
  unit: string | null;
  gramsEst: number | null;
  nutrition: NutritionInfo | null;
};

export type DailyLogCreate = {
  childUserKey: number;
  logDate: string;
  stoolType: number | null;
  stoolFrequency: number | null;
  hydration: string | null;
  foodIntake: DailyLogFood[];
};

export type DailyLogResponse = {
  logId: number;
  childUserKey: number;
  logDate: string;
  stoolType: number | null;
  stoolFrequency: number | null;
  hydration: string | null;
  createdAt: string;
  foodIntake: DailyLogFood[];
};

export async function createDailyLog(payload: DailyLogCreate) {
  return request<DailyLogResponse>('/logs', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function listDailyLogs(childUserKey: number) {
  return request<DailyLogResponse[]>(`/logs?child_user_key=${childUserKey}`);
}

export type ChildSummaryResponse = {
  summary: string;
  nutritionTotals: {
    calories: number;
    fiber: number;
    sugar: number;
    protein: number;
    water: number;
  };
  recentLogsCount: number;
};

export async function getChildSummary(childUserKey: number) {
  return request<ChildSummaryResponse>(`/ai/summary?child_user_key=${childUserKey}`);
}

export type MealRecommendationItem = {
  name: string | null;
  nutrients: {
    fiber: number | null;
    calories: number | null;
    protein: number | null;
    sugar: number | null;
  };
  quantity: number | string | null;
  unit: string | null;
};

export type MealRecommendationCategory = {
  category: string;
  reason: string;
  items: MealRecommendationItem[];
};

export type MealRecommendationsResponse = {
  child: {
    id: number;
    name: string | null;
    age: number | null;
  };
  condition: {
    stoolType: number | null;
    hydration: string | null;
  };
  feedingGuidance?: {
    recommendedType: 'solid' | 'hard' | 'normal';
    message: string;
  };
  mealRecommendations?: Array<{
    name: string | null;
    mealType: string | null;
    description: string | null;
    texture: string | null;
    ageRange: {
      minMonths: number | null;
      maxMonths: number | null;
    };
    reason: string;
    nutrients: {
      fiber: number | null;
      calories: number | null;
      protein: number | null;
      sugar: number | null;
    };
  }>;
  ingredientRecommendations?: MealRecommendationCategory[];
  recommendations: MealRecommendationCategory[];
};

export async function getMealRecommendations(childUserKey: number) {
  return request<MealRecommendationsResponse>(`/ai/recommendations?child_user_key=${childUserKey}`);
}

export type DailyInsightStatus = 'good' | 'watch' | 'caution';

export type DailyInsightResponse = {
  childUserKey: number;
  currentLogDate: string | null;
  comparedLogsCount: number;
  status: DailyInsightStatus;
  title: string;
  description: string;
  suggestions: string[];
};

export async function getDailyInsight(childUserKey: number) {
  return request<DailyInsightResponse>(`/ai/daily-insight?child_user_key=${childUserKey}`);
}
