from pydantic import AliasChoices, Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "HappyTummy"
    database_url: str = Field(default="sqlite:///./app.db", validation_alias=AliasChoices("database_url", "DATABASE_URL"))
    cors_origins: str = Field(
        default="http://localhost:8081,http://127.0.0.1:8081,http://localhost:19006,http://127.0.0.1:19006",
        validation_alias=AliasChoices("cors_origins", "CORS_ORIGINS"),
    )
    jwt_secret_key: str = "change-this-in-production"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    def get_cors_origins(self) -> list[str]:
        items = [item.strip() for item in self.cors_origins.split(",")]
        return [item for item in items if item]

settings = Settings()
