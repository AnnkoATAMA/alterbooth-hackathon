from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from db.models.user import User
from db.db import get_db
from pydantic import BaseModel
from db.models.target import Target


achive_router = APIRouter()

class UserCreate(BaseModel):
    target_id: int
    status: bool

@achive_router.patch("/target/{target_id}/activate")
async def update_target_status(target_id: int, db: AsyncSession = Depends(get_db)):
    stmt = select(Target).where(Target.target_id == target_id)
    result = await db.execute(stmt)
    target_record = result.scalars().first()

    if not target_record:
        raise HTTPException(status_code=404, detail="Target not found")

    if target_record.status:
        return {"success": False, "message": "Target is already active"}

    target_record.status = True
    await db.commit()
    await db.refresh(target_record)
    return {"success": True, "target_id": target_record.target_id, "status": target_record.status}