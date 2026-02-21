from fastapi import APIRouter, Depends

from app.models.user import User
from app.routes.auth import get_current_user

router = APIRouter()

@router.get("/children")
def children(current_user: User = Depends(get_current_user)):
    return {"status": "healthy children", "user": current_user.username}