from sqlalchemy import Float, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class FruitInfo(Base):
    __tablename__ = "FruitInfo"

    fruit_id: Mapped[int] = mapped_column("FruitID", Integer, primary_key=True)
    fruit_food: Mapped[str | None] = mapped_column("FruitFood", String(50), nullable=True)
    fruit_fiber: Mapped[float | None] = mapped_column("FruitFiber", Float, nullable=True)
    fruit_calories: Mapped[float | None] = mapped_column("FruitCalories", Float, nullable=True)
    fruit_protein: Mapped[float | None] = mapped_column("FruitProtein", Float, nullable=True)
    fruit_sugar: Mapped[float | None] = mapped_column("FruitSugar", Float, nullable=True)
    quantity_fruit: Mapped[float | None] = mapped_column("QuantityFruit", Float, nullable=True)


class CarbInfo(Base):
    __tablename__ = "CarbInfo"

    carb_id: Mapped[int] = mapped_column("CarbID", Integer, primary_key=True)
    carb_food: Mapped[str | None] = mapped_column("CarbFood", String(50), nullable=True)
    carb_fiber: Mapped[float | None] = mapped_column("CarbFiber", Float, nullable=True)
    carb_calories: Mapped[float | None] = mapped_column("CarbCalories", Float, nullable=True)
    carb_protein: Mapped[float | None] = mapped_column("CarbProtein", Float, nullable=True)
    carb_sugar: Mapped[float | None] = mapped_column("CarbSugar", Float, nullable=True)
    quantity_carb: Mapped[float | None] = mapped_column("QuantityCarb", Float, nullable=True)


class VegInfo(Base):
    __tablename__ = "VegInfo"

    veg_id: Mapped[int] = mapped_column("VegID", Integer, primary_key=True)
    veg_food: Mapped[str | None] = mapped_column("VegFood", String(50), nullable=True)
    veg_fiber: Mapped[float | None] = mapped_column("VegFiber", Float, nullable=True)
    veg_calories: Mapped[float | None] = mapped_column("VegCalories", Float, nullable=True)
    veg_protein: Mapped[float | None] = mapped_column("VegProtein", Float, nullable=True)
    veg_sugar: Mapped[float | None] = mapped_column("VegSugar", Float, nullable=True)
    quantity_veg: Mapped[float | None] = mapped_column("QuantityVeg", Float, nullable=True)


class MeatInfo(Base):
    __tablename__ = "MeatInfo"

    meat_id: Mapped[int] = mapped_column("MeatID", Integer, primary_key=True)
    meat_food: Mapped[str | None] = mapped_column("MeatFood", String(50), nullable=True)
    meat_fiber: Mapped[float | None] = mapped_column("MeatFiber", Float, nullable=True)
    meat_calories: Mapped[float | None] = mapped_column("MeatCalories", Float, nullable=True)
    meat_protein: Mapped[float | None] = mapped_column("MeatProtein", Float, nullable=True)
    meat_sugar: Mapped[float | None] = mapped_column("MeatSugar", Float, nullable=True)
    quantity_meat: Mapped[float | None] = mapped_column("QuantityMeat", Float, nullable=True)


class Milk1(Base):
    __tablename__ = "Milk1"

    milk1_id: Mapped[int] = mapped_column("Milk1ID", Integer, primary_key=True)
    milk1_name: Mapped[str | None] = mapped_column("Milk1Name", String(50), nullable=True)
    milk1_fiber: Mapped[float | None] = mapped_column("Milk1Fiber", Float, nullable=True)
    milk1_calories: Mapped[float | None] = mapped_column("Milk1Calories", Float, nullable=True)
    milk1_protein: Mapped[float | None] = mapped_column("Milk1Protein", Float, nullable=True)
    milk1_sugar: Mapped[float | None] = mapped_column("Milk1Sugar", Float, nullable=True)
    quantity_milk1: Mapped[str | None] = mapped_column("QuantityMilk1", String(50), nullable=True)


class Milk2(Base):
    __tablename__ = "Milk2"

    milk2_id: Mapped[int] = mapped_column("Milk2ID", Integer, primary_key=True)
    milk2_name: Mapped[str | None] = mapped_column("Milk2Name", String(50), nullable=True)
    milk2_fiber: Mapped[float | None] = mapped_column("Milk2Fiber", Float, nullable=True)
    milk2_calories: Mapped[float | None] = mapped_column("Milk2Calories", Float, nullable=True)
    milk2_protein: Mapped[float | None] = mapped_column("Milk2Protein", Float, nullable=True)
    milk2_sugar: Mapped[float | None] = mapped_column("Milk2Sugar", Float, nullable=True)
    quantity_milk2: Mapped[str | None] = mapped_column("QuantityMilk2", String(50), nullable=True)


class MealInfo(Base):
    __tablename__ = "MealInfo"

    meal_id: Mapped[int] = mapped_column("MealID", Integer, primary_key=True, autoincrement=True)
    meal_name: Mapped[str] = mapped_column("MealName", String(120), nullable=False)
    meal_type: Mapped[str] = mapped_column("MealType", String(20), nullable=False)
    min_age_months: Mapped[int] = mapped_column("MinAgeMonths", Integer, nullable=False)
    max_age_months: Mapped[int] = mapped_column("MaxAgeMonths", Integer, nullable=False)
    description: Mapped[str | None] = mapped_column("Description", String(255), nullable=True)
    texture: Mapped[str | None] = mapped_column("Texture", String(20), nullable=True)
    total_calories: Mapped[float | None] = mapped_column("TotalCalories", Float, nullable=True)
    total_protein: Mapped[float | None] = mapped_column("TotalProtein", Float, nullable=True)
    total_fiber: Mapped[float | None] = mapped_column("TotalFiber", Float, nullable=True)
    total_sugar: Mapped[float | None] = mapped_column("TotalSugar", Float, nullable=True)
