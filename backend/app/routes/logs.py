from datetime import datetime
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.happytummy_schema import (
    DimCarb,
    DimFruit,
    DimMeat,
    DimMilk1,
    DimMilk2,
    DimSymptom1,
    DimSymptom2,
    DimUser,
    DimVeg,
    FactSystem,
    ParentChild,
)
from app.models.logs import DailyLog, DailyLogFood
from app.models.user import User
from app.routes.auth import get_current_user
from app.schemas.logs import DailyLogCreate, DailyLogOut, DailyLogFoodOut

router = APIRouter()


def hydration_score(label: str | None) -> int | None:
    if not label:
        return None
    lookup = {
        "low": 1,
        "normal": 2,
        "good": 3,
    }
    return lookup.get(label.lower())


def find_food_match(db: Session, food_name: str) -> dict[str, int] | None:
    # Try exact name matches first, in a stable order.
    for model, field in [
        (DimFruit, "fruit_food"),
        (DimVeg, "veg_food"),
        (DimCarb, "carb_food"),
        (DimMeat, "meat_food"),
        (DimMilk1, "milk1_food"),
        (DimMilk2, "milk2_food"),
    ]:
        column = getattr(model, field)
        record = (
            db.query(model)
            .filter(func.lower(column) == food_name.lower())
            .first()
        )
        if record:
            key_attr = field.replace("_food", "_key")
            key_lookup = {
                "fruit_key": "FruitKey",
                "veg_key": "VegKey",
                "carb_key": "CarbKey",
                "meat_key": "MeatKey",
                "milk1_key": "Milk1Key",
                "milk2_key": "Milk2Key",
            }
            fact_key = key_lookup.get(key_attr)
            if fact_key:
                return {fact_key: getattr(record, key_attr)}
    return None


@router.post("/logs", response_model=DailyLogOut)
def create_daily_log(
    payload: DailyLogCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # Ensure child belongs to the current user
    child = (
        db.query(DimUser)
        .join(ParentChild, ParentChild.child_user_key == DimUser.user_key)
        .filter(ParentChild.parent_user_id == current_user.id)
        .filter(DimUser.user_key == payload.childUserKey)
        .first()
    )
    if not child:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Child not found for this user",
        )

    hydration_value = hydration_score(payload.hydration)

    symptom1 = DimSymptom1(
        water_oz1=hydration_value,
        fruit_intake1=None,
        stool1=payload.stoolType,
    )
    db.add(symptom1)
    db.flush()

    symptom2 = DimSymptom2(
        water_oz2=hydration_value,
        fruit_intake2=None,
        stool2=payload.stoolFrequency,
    )
    db.add(symptom2)
    db.flush()

    log = DailyLog(
        child_user_key=payload.childUserKey,
        symptom1_key=symptom1.symptom1_key,
        symptom2_key=symptom2.symptom2_key,
        log_date=payload.logDate,
        stool_type=payload.stoolType,
        stool_frequency=payload.stoolFrequency,
        hydration_label=payload.hydration,
    )
    db.add(log)
    db.flush()

    food_out: list[DailyLogFoodOut] = []

    for item in payload.foodIntake:
        nutrition = item.nutrition
        db.add(
            DailyLogFood(
                log_id=log.log_id,
                name=item.name,
                quantity=item.quantity,
                unit=item.unit,
                grams_est=item.gramsEst,
                calories=nutrition.calories if nutrition else None,
                fiber=nutrition.fiber if nutrition else None,
                sugar=nutrition.sugar if nutrition else None,
                protein=nutrition.protein if nutrition else None,
                water=nutrition.water if nutrition else None,
            )
        )

        # Insert into FactSystem if we can map the food to a dimension
        match = find_food_match(db, item.name)
        if match:
            values = {
                "UserKey": payload.childUserKey,
                "Symptom1Key": symptom1.symptom1_key,
                "Symptom2Key": symptom2.symptom2_key,
                "QuantityCarb": None,
                "QuantityMeat": None,
                "QuantityFruit": None,
                "QuantityVeg": None,
                "QuantityMilk1": None,
                "QuantityMilk2": None,
            }
            values.update(match)

            quantity_value = item.gramsEst if item.gramsEst is not None else item.quantity
            if "CarbKey" in match:
                values["QuantityCarb"] = int(quantity_value or 0)
            if "MeatKey" in match:
                values["QuantityMeat"] = int(quantity_value or 0)
            if "FruitKey" in match:
                values["QuantityFruit"] = int(quantity_value or 0)
            if "VegKey" in match:
                values["QuantityVeg"] = int(quantity_value or 0)
            if "Milk1Key" in match:
                values["QuantityMilk1"] = f"{item.quantity or ''} {item.unit or ''}".strip()
            if "Milk2Key" in match:
                values["QuantityMilk2"] = f"{item.quantity or ''} {item.unit or ''}".strip()

            db.execute(FactSystem.insert().values(**values))

    db.commit()
    db.refresh(log)

    foods = (
        db.query(DailyLogFood)
        .filter(DailyLogFood.log_id == log.log_id)
        .all()
    )

    return DailyLogOut(
        logId=log.log_id,
        childUserKey=log.child_user_key,
        logDate=log.log_date,
        stoolType=log.stool_type,
        stoolFrequency=log.stool_frequency,
        hydration=log.hydration_label,
        createdAt=log.created_at,
        foodIntake=[
            DailyLogFoodOut(
                name=food.name,
                quantity=food.quantity,
                unit=food.unit,
                gramsEst=food.grams_est,
                calories=food.calories,
                fiber=food.fiber,
                sugar=food.sugar,
                protein=food.protein,
                water=food.water,
            )
            for food in foods
        ],
    )


@router.get("/logs", response_model=list[DailyLogOut])
def list_daily_logs(
    child_user_key: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    child = (
        db.query(DimUser)
        .join(ParentChild, ParentChild.child_user_key == DimUser.user_key)
        .filter(ParentChild.parent_user_id == current_user.id)
        .filter(DimUser.user_key == child_user_key)
        .first()
    )
    if not child:
        raise HTTPException(status_code=404, detail="Child not found for this user")

    logs = (
        db.query(DailyLog)
        .filter(DailyLog.child_user_key == child_user_key)
        .order_by(DailyLog.created_at.desc())
        .all()
    )

    results: list[DailyLogOut] = []
    for log in logs:
        foods = (
            db.query(DailyLogFood)
            .filter(DailyLogFood.log_id == log.log_id)
            .all()
        )
        results.append(
            DailyLogOut(
                logId=log.log_id,
                childUserKey=log.child_user_key,
                logDate=log.log_date,
                stoolType=log.stool_type,
                stoolFrequency=log.stool_frequency,
                hydration=log.hydration_label,
                createdAt=log.created_at,
                foodIntake=[
                    DailyLogFoodOut(
                        name=food.name,
                        quantity=food.quantity,
                        unit=food.unit,
                        gramsEst=food.grams_est,
                        calories=food.calories,
                        fiber=food.fiber,
                        sugar=food.sugar,
                        protein=food.protein,
                        water=food.water,
                    )
                    for food in foods
                ],
            )
        )

    return results
