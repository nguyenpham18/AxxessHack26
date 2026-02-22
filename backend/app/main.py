from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import inspect, text

from app.core.config import settings
from app.db.base import Base
from app.db.session import engine
from app.models import happytummy_schema
from app.models import logs as logs_model
from app.models import meal_info as meal_info_model
from app.models.user import User
from app.routes.auth import router as auth_router
from app.routes.children import router as children_router
from app.routes.logs import router as logs_router
from app.routes.ai import router as ai_router

app = FastAPI(title=settings.app_name, version="0.1.0")

if settings.jwt_secret_key == "change-this-in-production":
	raise RuntimeError("Set JWT_SECRET_KEY in backend/.env before starting the server.")
if len(settings.jwt_secret_key) < 32:
	raise RuntimeError("JWT_SECRET_KEY must be at least 32 characters.")

app.add_middleware(
	CORSMiddleware,
	allow_origins=settings.get_cors_origins(),
	allow_credentials=True,
	allow_methods=["*"],
	allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)


def ensure_schema_compatibility() -> None:
	inspector = inspect(engine)
	table_names = inspector.get_table_names()
	if "DimUser" not in table_names:
		return

	column_names = {column["name"] for column in inspector.get_columns("DimUser")}
	if "ParentConsent" in column_names:
		return

	with engine.begin() as connection:
		connection.execute(
			text('ALTER TABLE "DimUser" ADD COLUMN "ParentConsent" BOOLEAN NOT NULL DEFAULT 0')
		)


ensure_schema_compatibility()

app.include_router(children_router, prefix="/api", tags=["children"])
app.include_router(auth_router, prefix="/api")
app.include_router(ai_router, tags=["ai"])
app.include_router(logs_router, prefix="/api", tags=["logs"])