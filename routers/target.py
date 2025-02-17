from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import insert
from db.models import target
from db.models.target import Target
from db.db import get_db
from pydantic import BaseModel
from sqlalchemy.engine.result import Result
from sqlalchemy.future import select
from datetime import date

target_router = APIRouter()

class TargetCreate(BaseModel):
    target: str

@target_router.post("/create")
async def create_item(item: TargetCreate, db: AsyncSession = Depends(get_db)):
    db_target = Target(target=item.target)
    
    db.add(db_target)
    await db.commit()
    await db.refresh(db_target)
    
    return db_target




    