from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.exc import IntegrityError, SQLAlchemyError  # ✅ ここで `IntegrityError` をインポート
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

        # ✅ ユーザーの存在確認
        user = await db.get(User, item.user_id)
        if not user:
            print("❌ [ERROR] User not found")
            raise HTTPException(status_code=404, detail="User not found")

        print("✅ [DEBUG] ユーザーが存在しています")

        # ✅ 新しい目標の追加
        db_target = Target(user_id=item.user_id, target=item.target, status=False)
        db.add(db_target)  # 🔥 まず `add` してから
        await db.commit()  # 🔥 ここで `commit` する
        await db.refresh(db_target)  # 🔥 `commit` の後に `refresh`

        print(f"🎯 [DEBUG] 目標が正常に追加されました: {db_target}")

        return {"success": True, "target_id": db_target.target_id, "target": db_target.target}

    except IntegrityError:
        await db.rollback()
        print("💥 [ERROR] IntegrityError: データベースの一意制約違反が発生しました")
        raise HTTPException(status_code=400, detail="Database Integrity Error")

    except SQLAlchemyError as e:
        await db.rollback()
        print(f"💥 [ERROR] SQLAlchemyError: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal Server Error")

    except Exception as e:
        await db.rollback()
        print(f"💥 [ERROR] 予期せぬエラー: {str(e)}")
        raise HTTPException(status_code=500, detail="Unexpected Error")
