from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from db.models.target import Target
from db.models.user import User
from db.db import get_db
from pydantic import BaseModel
import logging

target_router = APIRouter()

class TargetCreate(BaseModel):
    user_id: int
    target: str

@target_router.post("/create")
async def create_item(item: TargetCreate, db: AsyncSession = Depends(get_db)):
    try:
        print(f"🌟 [DEBUG] user_id: {item.user_id}, target: {item.target}")

        user = await db.get(User, item.user_id)
        if not user:
            print("❌ [ERROR] User not found")
            raise HTTPException(status_code=404, detail="User not found")

        db_target = Target(user_id=item.user_id, target=item.target, status=False)
        db.add(db_target)
        await db.commit()
        await db.refresh(db_target)

        return {"success": True, "target_id": db_target.target_id, "target": db_target.target}

    except IntegrityError:
        await db.rollback()
        raise HTTPException(status_code=400, detail="Database Integrity Error")

    except SQLAlchemyError as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail="Internal Server Error")

    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail="Unexpected Error")

@target_router.get("/targets")
async def get_targets(userId: int, db: AsyncSession = Depends(get_db)):
    stmt = select(Target).where(Target.user_id == userId)
    result = await db.execute(stmt)
    targets = result.scalars().all()

    if not targets:
        raise HTTPException(status_code=404, detail="No targets found")

    return targets

@target_router.patch("/{target_id}/toggle")
async def toggle_target_status(target_id: int, db: AsyncSession = Depends(get_db)):
    stmt = select(Target).where(Target.target_id == target_id)
    result = await db.execute(stmt)
    target_record = result.scalars().first()

    if not target_record:
        raise HTTPException(status_code=404, detail="Target not found")

    target_record.status = not target_record.status
    await db.commit()
    await db.refresh(target_record)

    return {"success": True, "target_id": target_record.target_id, "status": target_record.status}
