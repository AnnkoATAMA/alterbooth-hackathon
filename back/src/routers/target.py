from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from db.models.target import Target
from sqlalchemy.orm import selectinload
from db.models.user import User
from db.db import get_db
from pydantic import BaseModel
import logging

target_router = APIRouter()

class TargetCreate(BaseModel):
    user_id: int
    target: str
    parent_id: int | None = None

@target_router.post("/create")
async def create_item(item: TargetCreate, db: AsyncSession = Depends(get_db)):
    try:
        print(f"🌟 [DEBUG] user_id: {item.user_id}, target: {item.target}, parent_id: {item.parent_id}")

        user = await db.get(User, item.user_id)
        if not user:
            print("❌ [ERROR] User not found")
            raise HTTPException(status_code=404, detail="User not found")

        if item.parent_id:
            parent_task = await db.get(Target, item.parent_id)
            if not parent_task:
                raise HTTPException(status_code=400, detail="Parent task not found")

        db_target = Target(user_id=item.user_id, target=item.target, status=False, weight=1, parent_id=item.parent_id)
        db.add(db_target)
        await db.commit()
        await db.refresh(db_target)

        return {"success": True, "target_id": db_target.target_id, "target": db_target.target, "parent_id": db_target.parent_id}

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
    stmt = select(Target).options(selectinload(Target.subtasks)).where(Target.user_id == userId).distinct()
    result = await db.execute(stmt)
    targets = result.unique().scalars().all()

    if not targets:
        raise HTTPException(status_code=404, detail="No targets found")

    tasks_dict = {task.target_id: task for task in targets}
    root_tasks = []

    for task in targets:
        if task.parent_id:
            parent = tasks_dict.get(task.parent_id)
            if parent:
                if not hasattr(parent, "subtasks"):
                    parent.subtasks = []
                if task not in parent.subtasks:
                    parent.subtasks.append(task)
        else:
            root_tasks.append(task)

    def serialize_task(task):
        return {
            "target_id": task.target_id,
            "target": task.target,
            "status": task.status,
            "weight": task.weight,
            "parent_id": task.parent_id,
            "subtasks": [serialize_task(subtask) for subtask in getattr(task, "subtasks", [])]
        }

    return [serialize_task(task) for task in root_tasks]


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
