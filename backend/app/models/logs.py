from datetime import datetime
from sqlalchemy import DateTime, Float, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class DailyLog(Base):
    __tablename__ = "DailyLog"

    log_id: Mapped[int] = mapped_column("LogID", Integer, primary_key=True, autoincrement=True)
    child_user_key: Mapped[int] = mapped_column(
        "ChildUserKey", Integer, ForeignKey("DimUser.UserKey"), nullable=False
    )
    symptom1_key: Mapped[int | None] = mapped_column(
        "Symptom1Key", Integer, ForeignKey("DimSymptom1.Symptom1Key"), nullable=True
    )
    symptom2_key: Mapped[int | None] = mapped_column(
        "Symptom2Key", Integer, ForeignKey("DimSymptom2.Symptom2Key"), nullable=True
    )
    log_date: Mapped[str] = mapped_column("LogDate", String(20), nullable=False)
    stool_type: Mapped[int | None] = mapped_column("StoolType", Integer, nullable=True)
    stool_frequency: Mapped[int | None] = mapped_column("StoolFrequency", Integer, nullable=True)
    hydration_label: Mapped[str | None] = mapped_column("HydrationLabel", String(20), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        "CreatedAt", DateTime, default=datetime.utcnow, nullable=False
    )


class DailyLogFood(Base):
    __tablename__ = "DailyLogFood"

    log_food_id: Mapped[int] = mapped_column("LogFoodID", Integer, primary_key=True, autoincrement=True)
    log_id: Mapped[int] = mapped_column(
        "LogID", Integer, ForeignKey("DailyLog.LogID"), nullable=False
    )
    name: Mapped[str] = mapped_column("Name", String(100), nullable=False)
    quantity: Mapped[float | None] = mapped_column("Quantity", Float, nullable=True)
    unit: Mapped[str | None] = mapped_column("Unit", String(20), nullable=True)
    grams_est: Mapped[float | None] = mapped_column("GramsEst", Float, nullable=True)
    calories: Mapped[float | None] = mapped_column("Calories", Float, nullable=True)
    fiber: Mapped[float | None] = mapped_column("Fiber", Float, nullable=True)
    sugar: Mapped[float | None] = mapped_column("Sugar", Float, nullable=True)
    protein: Mapped[float | None] = mapped_column("Protein", Float, nullable=True)
    water: Mapped[float | None] = mapped_column("Water", Float, nullable=True)
