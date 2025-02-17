from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from db.models.user import User
from db.db import get_db
from pydantic import BaseModel, EmailStr

login_router = APIRouter()

class UserCreate(BaseModel):
    name: str
    email: str
    password: str

@login_router.post("/register")
async def create_user(item: UserCreate, db: AsyncSession = Depends(get_db)):
    stmt = select(User).where(User.email == item.email)
    result = await db.execute(stmt)
    existing_user = result.scalars().first()
    if existing_user:
        return {"success": True, "userId": existing_user.user_id}

    db_user = User(name=item.name, email=item.email, password=item.password)
    db.add(db_user)
    await db.commit()
    await db.refresh(db_user)

    return db_user