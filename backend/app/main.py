from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.db.base import Base
from app.db.session import engine
from app.models import happytummy_schema
from app.models.user import User
from app.routes.auth import router as auth_router
from app.routes.children import router as children_router

app = FastAPI(title=settings.app_name, version="0.1.0")

if settings.jwt_secret_key == "change-this-in-production":
	raise RuntimeError("Set JWT_SECRET_KEY in backend/.env before starting the server.")

app.add_middleware(
	CORSMiddleware,
	allow_origins=settings.get_cors_origins(),
	allow_credentials=True,
	allow_methods=["*"],
	allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)

app.include_router(children_router, prefix="/api", tags=["children"])
app.include_router(auth_router, prefix="/api")