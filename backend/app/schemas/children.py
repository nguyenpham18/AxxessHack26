from pydantic import BaseModel, Field


class ChildCreate(BaseModel):
    use_id: int | None = None
    name: str = Field(min_length=1, max_length=50)
    age: int | None = None
    gender: str | None = None
    weight: int | None = None
    allergies: int | None = None
    early_born: int | None = None
    delivery_method: int | None = None
    envi_change: int | None = None


class ChildOut(BaseModel):
    user_key: int
    use_id: int | None
    name: str | None
    age: int | None
    gender: str | None
    weight: int | None
    allergies: int | None
    early_born: int | None
    delivery_method: int | None
    envi_change: int | None

    model_config = {"from_attributes": True}
