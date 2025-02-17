from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from db.models.user import User
from db.models.room import Room
from db.models.roomuser import RoomUser
from db.db import get_db
from pydantic import BaseModel

room_router = APIRouter()

class GroupCreate(BaseModel):
    name: str
    user_id: int
    
class AddUserToGroup(BaseModel):
    room_id: int
    user_id: int

@room_router.post("/create")
async def create_group(item: GroupCreate, db: AsyncSession = Depends(get_db)):
    
    room = Room(name=item.name)
    db.add(room)
  
    await db.flush()

    room_user = RoomUser(room_id=room.room_id, user_id=item.user_id)
    db.add(room_user)
    
    await db.commit()
    await db.refresh(room)
    
    return {"success": True, "groupId": room.room_id}

@room_router.post("/add_user")
async def add_user_to_group(item: AddUserToGroup, db: AsyncSession = Depends(get_db)):
   
    stmt = select(Room).where(Room.room_id == item.room_id)
    result = await db.execute(stmt)
    group = result.scalars().first()
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")


    stmt = select(User).where(User.user_id == item.user_id)
    result = await db.execute(stmt)
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

   
    stmt = select(RoomUser).where(
        RoomUser.room_id == item.room_id,
        RoomUser.user_id == item.user_id
    )
    result = await db.execute(stmt)
    existing_relation = result.scalars().first()
    if existing_relation:
        raise HTTPException(status_code=400, detail="User already in group")

    group_user = RoomUser(room_id=item.room_id, user_id=item.user_id)
    db.add(group_user)
    await db.commit()
    return {"success": True}