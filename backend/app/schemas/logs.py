from datetime import datetime
from pydantic import BaseModel


class NutritionInfo(BaseModel):
    calories: float | None = None
    fiber: float | None = None
    sugar: float | None = None
    protein: float | None = None
    water: float | None = None


class FoodIntakeItem(BaseModel):
    name: str
    quantity: float | None = None
    unit: str | None = None
    gramsEst: float | None = None
    nutrition: NutritionInfo | None = None


class DailyLogCreate(BaseModel):
    childUserKey: int
    logDate: str
    stoolType: int | None = None
    stoolFrequency: int | None = None
    hydration: str | None = None
    foodIntake: list[FoodIntakeItem]


class DailyLogFoodOut(BaseModel):
    name: str
    quantity: float | None = None
    unit: str | None = None
    gramsEst: float | None = None
    calories: float | None = None
    fiber: float | None = None
    sugar: float | None = None
    protein: float | None = None
    water: float | None = None


class DailyLogOut(BaseModel):
    logId: int
    childUserKey: int
    logDate: str
    stoolType: int | None = None
    stoolFrequency: int | None = None
    hydration: str | None = None
    createdAt: datetime
    foodIntake: list[DailyLogFoodOut]
