from pydantic import BaseModel, Field, field_validator


class UserCreate(BaseModel):
    first_name: str = Field(min_length=1, max_length=100)
    username: str = Field(min_length=3, max_length=50, pattern=r"^[a-z0-9_.-]+$")
    password: str = Field(min_length=8, max_length=128)

    @field_validator("first_name")
    @classmethod
    def normalize_first_name(cls, value: str) -> str:
        trimmed = value.strip()
        if not trimmed:
            raise ValueError("First name cannot be empty")
        return trimmed

    @field_validator("username")
    @classmethod
    def normalize_username(cls, value: str) -> str:
        return value.strip().lower()


class UserLogin(BaseModel):
    username: str = Field(min_length=3, max_length=50, pattern=r"^[a-z0-9_.-]+$")
    password: str

    @field_validator("username")
    @classmethod
    def normalize_username(cls, value: str) -> str:
        return value.strip().lower()


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserOut(BaseModel):
    id: int
    first_name: str
    username: str

    model_config = {"from_attributes": True}
