import argparse
import os
import sqlite3
import sys
import time
from typing import Any, Dict, Iterable, Optional

import httpx

NUTRIENT_IDS = {
    "calories": 1008,
    "protein": 1003,
    "sugar": 2000,
    "fiber": 1079,
}

TABLES = {
    "FruitInfo": {
        "id_col": "FruitID",
        "name_col": "FruitFood",
        "calories_col": "FruitCalories",
        "protein_col": "FruitProtein",
        "sugar_col": "FruitSugar",
    },
    "VegInfo": {
        "id_col": "VegID",
        "name_col": "VegFood",
        "calories_col": "VegCalories",
        "protein_col": "VegProtein",
        "sugar_col": "VegSugar",
    },
    "CarbInfo": {
        "id_col": "CarbID",
        "name_col": "CarbFood",
        "calories_col": "CarbCalories",
        "protein_col": "CarbProtein",
        "sugar_col": "CarbSugar",
    },
    "MeatInfo": {
        "id_col": "MeatID",
        "name_col": "MeatFood",
        "calories_col": "MeatCalories",
        "protein_col": "MeatProtein",
        "sugar_col": "MeatSugar",
    },
    "Milk1": {
        "id_col": "Milk1ID",
        "name_col": "Milk1Name",
        "calories_col": "Milk1Calories",
        "protein_col": "Milk1Protein",
        "sugar_col": "Milk1Sugar",
    },
    "Milk2": {
        "id_col": "Milk2ID",
        "name_col": "Milk2Name",
        "calories_col": "Milk2Calories",
        "protein_col": "Milk2Protein",
        "sugar_col": "Milk2Sugar",
    },
}


def get_foods(client: httpx.Client, api_key: str, query: str) -> Optional[Dict[str, Any]]:
    url = "https://api.nal.usda.gov/fdc/v1/foods/search"
    params = {
        "query": query,
        "api_key": api_key,
        "pageSize": 1,
        "requireAllWords": True,
        "dataType": "Foundation,SR Legacy",
    }
    response = client.get(url, params=params, timeout=20.0)
    response.raise_for_status()
    data = response.json()
    foods = data.get("foods") or []
    return foods[0] if foods else None


def extract_nutrients(food: Dict[str, Any]) -> Dict[str, Optional[float]]:
    nutrients = food.get("foodNutrients") or []
    values: Dict[str, Optional[float]] = {"calories": None, "protein": None, "sugar": None}
    for nutrient in nutrients:
        nutrient_id = nutrient.get("nutrientId")
        value = nutrient.get("value")
        if nutrient_id == NUTRIENT_IDS["calories"]:
            values["calories"] = value
        elif nutrient_id == NUTRIENT_IDS["protein"]:
            values["protein"] = value
        elif nutrient_id == NUTRIENT_IDS["sugar"]:
            values["sugar"] = value
    return values


def fetch_records(conn: sqlite3.Connection, table: str, columns: Iterable[str]) -> list[sqlite3.Row]:
    cols = ", ".join(columns)
    sql = f"SELECT {cols} FROM {table}"
    return conn.execute(sql).fetchall()


def update_record(
    conn: sqlite3.Connection,
    table: str,
    id_col: str,
    record_id: Any,
    updates: Dict[str, Optional[float]],
) -> None:
    set_parts = []
    values: list[Any] = []
    for col, value in updates.items():
        set_parts.append(f"{col} = ?")
        values.append(value)
    values.append(record_id)
    sql = f"UPDATE {table} SET {', '.join(set_parts)} WHERE {id_col} = ?"
    conn.execute(sql, values)


def should_update(record: sqlite3.Row, table_cfg: Dict[str, str], overwrite: bool) -> bool:
    if overwrite:
        return True
    calories_col = table_cfg["calories_col"]
    protein_col = table_cfg["protein_col"]
    sugar_col = table_cfg["sugar_col"]
    return (
        record[calories_col] is None
        or record[protein_col] is None
        or record[sugar_col] is None
    )


def main() -> int:
    parser = argparse.ArgumentParser(description="Populate calories/protein/sugar from USDA.")
    parser.add_argument(
        "--db",
        default=os.getenv("DATABASE_URL", "sqlite:///./app.db"),
        help="Database URL or sqlite file path (default: sqlite:///./app.db)",
    )
    parser.add_argument(
        "--overwrite",
        action="store_true",
        help="Overwrite existing nutrient values",
    )
    parser.add_argument(
        "--sleep",
        type=float,
        default=0.2,
        help="Sleep between USDA requests (seconds)",
    )
    args = parser.parse_args()

    api_key = os.getenv("USDA_API_KEY")
    if not api_key:
        print("Missing USDA_API_KEY in environment.")
        return 1

    db_path = args.db
    if db_path.startswith("sqlite:///"):
        db_path = db_path.replace("sqlite:///", "", 1)

    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row

    with httpx.Client() as client:
        for table, cfg in TABLES.items():
            id_col = cfg["id_col"]
            name_col = cfg["name_col"]
            columns = [
                id_col,
                name_col,
                cfg["calories_col"],
                cfg["protein_col"],
                cfg["sugar_col"],
            ]
            rows = fetch_records(conn, table, columns)
            for row in rows:
                if not should_update(row, cfg, args.overwrite):
                    continue
                name = row[name_col]
                if not name:
                    continue
                try:
                    food = get_foods(client, api_key, name)
                    if not food:
                        print(f"No USDA match for {table} {name}")
                        continue
                    nutrients = extract_nutrients(food)
                    updates = {
                        cfg["calories_col"]: nutrients["calories"],
                        cfg["protein_col"]: nutrients["protein"],
                        cfg["sugar_col"]: nutrients["sugar"],
                    }
                    update_record(conn, table, id_col, row[id_col], updates)
                    conn.commit()
                    print(f"Updated {table} {name}: {updates}")
                    time.sleep(args.sleep)
                except Exception as exc:
                    print(f"Failed {table} {name}: {exc}")

    conn.close()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
