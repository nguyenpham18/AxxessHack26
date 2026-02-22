from sqlalchemy import Column, ForeignKey, Integer, String, Table
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class DimCarb(Base):
    __tablename__ = "DimCarb"

    carb_key: Mapped[int] = mapped_column("CarbKey", Integer, primary_key=True, autoincrement=True)
    carb_id: Mapped[int | None] = mapped_column("CarbID", Integer, nullable=True)
    carb_food: Mapped[str | None] = mapped_column("CarbFood", String(50), nullable=True)
    carb_fiber: Mapped[int | None] = mapped_column("CarbFiber", Integer, nullable=True)


class DimFruit(Base):
    __tablename__ = "DimFruit"

    fruit_key: Mapped[int] = mapped_column("FruitKey", Integer, primary_key=True, autoincrement=True)
    fruit_id: Mapped[int | None] = mapped_column("FruitID", Integer, nullable=True)
    fruit_food: Mapped[str | None] = mapped_column("FruitFood", String(50), nullable=True)
    fruit_fiber: Mapped[int | None] = mapped_column("FruitFiber", Integer, nullable=True)


class DimMeat(Base):
    __tablename__ = "DimMeat"

    meat_key: Mapped[int] = mapped_column("MeatKey", Integer, primary_key=True, autoincrement=True)
    meat_id: Mapped[int | None] = mapped_column("MeatID", Integer, nullable=True)
    meat_food: Mapped[str | None] = mapped_column("MeatFood", String(50), nullable=True)
    meat_fiber: Mapped[int | None] = mapped_column("MeatFiber", Integer, nullable=True)


class DimMilk1(Base):
    __tablename__ = "DimMilk1"

    milk1_key: Mapped[int] = mapped_column("Milk1Key", Integer, primary_key=True, autoincrement=True)
    milk1_id: Mapped[int | None] = mapped_column("Milk1ID", Integer, nullable=True)
    milk1_food: Mapped[str | None] = mapped_column("Milk1Food", String(50), nullable=True)
    milk1_fiber: Mapped[int | None] = mapped_column("Milk1Fiber", Integer, nullable=True)


class DimMilk2(Base):
    __tablename__ = "DimMilk2"

    milk2_key: Mapped[int] = mapped_column("Milk2Key", Integer, primary_key=True, autoincrement=True)
    milk2_id: Mapped[int | None] = mapped_column("MILK2ID", Integer, nullable=True)
    milk2_food: Mapped[str | None] = mapped_column("Milk2Food", String(50), nullable=True)
    milk2_fiber: Mapped[int | None] = mapped_column("Milk2Fiber", Integer, nullable=True)


class DimSymptom1(Base):
    __tablename__ = "DimSymptom1"

    symptom1_key: Mapped[int] = mapped_column("Symptom1Key", Integer, primary_key=True, autoincrement=True)
    symptom1_id: Mapped[int | None] = mapped_column("Symptom1ID", Integer, nullable=True)
    water_oz1: Mapped[int | None] = mapped_column("WaterOz1", Integer, nullable=True)
    fruit_intake1: Mapped[int | None] = mapped_column("FruitIntake1", Integer, nullable=True)
    stool1: Mapped[int | None] = mapped_column("Stool1", Integer, nullable=True)


class DimSymptom2(Base):
    __tablename__ = "DimSymptom2"

    symptom2_key: Mapped[int] = mapped_column("Symptom2Key", Integer, primary_key=True, autoincrement=True)
    symptom2_id: Mapped[int | None] = mapped_column("Symptom2ID", Integer, nullable=True)
    water_oz2: Mapped[int | None] = mapped_column("WaterOz2", Integer, nullable=True)
    fruit_intake2: Mapped[int | None] = mapped_column("FruitIntake2", Integer, nullable=True)
    stool2: Mapped[int | None] = mapped_column("Stool2", Integer, nullable=True)


class DimUser(Base):
    __tablename__ = "DimUser"

    user_key: Mapped[int] = mapped_column("UserKey", Integer, primary_key=True, autoincrement=True)
    use_id: Mapped[int | None] = mapped_column("UseID", Integer, nullable=True)
    name: Mapped[str | None] = mapped_column("Name", String(50), nullable=True)
    age: Mapped[int | None] = mapped_column("Age", Integer, nullable=True)
    gender: Mapped[str | None] = mapped_column("Gender", String(50), nullable=True)
    weight: Mapped[int | None] = mapped_column("Weight", Integer, nullable=True)
    allergies: Mapped[int | None] = mapped_column("Allergies", Integer, nullable=True)
    early_born: Mapped[int | None] = mapped_column("EarlyBorn", Integer, nullable=True)
    delivery_method: Mapped[int | None] = mapped_column("DeliveryMethod", Integer, nullable=True)
    envi_change: Mapped[int | None] = mapped_column("EnviChange", Integer, nullable=True)


class ParentChild(Base):
    __tablename__ = "ParentChild"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    parent_user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    child_user_key: Mapped[int] = mapped_column(ForeignKey("DimUser.UserKey"), nullable=False)


class DimVeg(Base):
    __tablename__ = "DimVeg"

    veg_key: Mapped[int] = mapped_column("VegKey", Integer, primary_key=True, autoincrement=True)
    veg_id: Mapped[int | None] = mapped_column("VegID", Integer, nullable=True)
    veg_food: Mapped[str | None] = mapped_column("VegFood", String(50), nullable=True)
    veg_fiber: Mapped[int | None] = mapped_column("VegFiber", Integer, nullable=True)


FactSystem = Table(
    "FactSystem",
    Base.metadata,
    Column("CarbKey", Integer, ForeignKey("DimCarb.CarbKey"), nullable=True),
    Column("MeatKey", Integer, ForeignKey("DimMeat.MeatKey"), nullable=True),
    Column("FruitKey", Integer, ForeignKey("DimFruit.FruitKey"), nullable=True),
    Column("VegKey", Integer, ForeignKey("DimVeg.VegKey"), nullable=True),
    Column("Milk1Key", Integer, ForeignKey("DimMilk1.Milk1Key"), nullable=True),
    Column("Milk2Key", Integer, ForeignKey("DimMilk2.Milk2Key"), nullable=True),
    Column("UserKey", Integer, ForeignKey("DimUser.UserKey"), nullable=True),
    Column("Symptom1Key", Integer, ForeignKey("DimSymptom1.Symptom1Key"), nullable=True),
    Column("Symptom2Key", Integer, ForeignKey("DimSymptom2.Symptom2Key"), nullable=True),
    Column("QuantityCarb", Integer, nullable=True),
    Column("QuantityMeat", Integer, nullable=True),
    Column("QuantityFruit", Integer, nullable=True),
    Column("QuantityVeg", Integer, nullable=True),
    Column("QuantityMilk1", String(50), nullable=True),
    Column("QuantityMilk2", String(50), nullable=True),
)
