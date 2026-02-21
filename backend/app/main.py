from fastapi import FastAPI

from app.core.config import settings
from app.db.base import Base
from app.db.session import engine
from app.models.user import User
from app.routes.auth import router as auth_router
from app.routes.children import router as children_router

app = FastAPI(title=settings.app_name, version="0.1.0")

Base.metadata.create_all(bind=engine)

app.include_router(children_router, prefix="/api", tags=["children"])
app.include_router(auth_router, prefix="/api")