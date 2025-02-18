from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.exc import SQLAlchemyError
from pydantic import BaseModel
from db.models.target import Target
from db.db import get_db
weight_router = APIRouter()
importance_mapping = {
    "高い": 1,
    "普通": 2,
    "低い": 3
}
class WeightUpdate(BaseModel):
    target_id: int
    importance: int

@weight_router.put("/weight")
async def update_weight(data: WeightUpdate, db: AsyncSession = Depends(get_db)):

    result = await db.execute(select(Target).where(Target.target_id == data.target_id))
    target_instance = result.scalars().first()
    if not target_instance:
        raise HTTPException(status_code=404, detail="target が見つかりません")

    if data.importance not in [1, 2, 3]:
        raise HTTPException(status_code=400, detail="不正な importance 値です")

    target_instance.weight = data.importance
    try:
        await db.commit()
        await db.refresh(target_instance)
    except SQLAlchemyError:
        await db.rollback()
        raise HTTPException(status_code=500, detail="重要度の更新に失敗しました")

    return {"success": True, "target_id": target_instance.target_id, "new_weight": target_instance.weight}
