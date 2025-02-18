from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from db.models.user import User
from db.db import get_db

user_router = APIRouter()

@user_router.get("/get")
async def get_user(db: AsyncSession = Depends(get_db)):
    stmt = select(User.user_id, User.name)
    result = await db.execute(stmt)
    rows = result.all()  
    return [{"user_id": user_id, "name": name} for user_id, name in rows]