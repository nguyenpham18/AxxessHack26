from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.happytummy_schema import DimUser, ParentChild
from app.models.user import User
from app.routes.auth import get_current_user
from app.schemas.children import ChildCreate, ChildOut

router = APIRouter()

@router.get("/children", response_model=list[ChildOut])
def list_children(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return (
        db.query(DimUser)
        .join(ParentChild, ParentChild.child_user_key == DimUser.user_key)
        .filter(ParentChild.parent_user_id == current_user.id)
        .all()
    )


@router.post("/children", response_model=ChildOut)
def create_child(
    payload: ChildCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if payload.parent_consent is not True:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Parental consent is required",
        )

    child = DimUser(
        use_id=payload.use_id,
        name=payload.name,
        age=payload.age,
        gender=payload.gender,
        weight=payload.weight,
        allergies=payload.allergies,
        early_born=payload.early_born,
        delivery_method=payload.delivery_method,
        envi_change=payload.envi_change,
        parent_consent=payload.parent_consent
    )
    db.add(child)
    db.flush()

    link = ParentChild(parent_user_id=current_user.id, child_user_key=child.user_key)
    db.add(link)
    db.commit()
    db.refresh(child)
    return child