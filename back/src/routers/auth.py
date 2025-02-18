from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession
from db.models.user import User
from db.db import get_db

auth_router = APIRouter()

@auth_router.get("/check-auth")
async def check_auth(request: Request, db: AsyncSession = Depends(get_db)):
    user_id = request.cookies.get("user_id")
    print(user_id)

    if not user_id:
        raise HTTPException(status_code=401, detail="Unauthorized")

    user = await db.get(User, int(user_id))
    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    return {"userId": user.user_id, "name": user.name}