from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from db.models.user import User
from db.models.room import Room
from db.models.roomuser import RoomUser
from db.db import get_db
from pydantic import BaseModel
from routers.auth import check_auth
from db.models.target import Target
from sqlalchemy.orm import selectinload
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
    
    return {"success": True, "groupId": room.room_id, "roomName": room.name}

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

@room_router.get("/my_rooms")
async def get_my_rooms(db: AsyncSession = Depends(get_db)):
    """ログイン中のユーザーが所属するルーム一覧を取得"""
    stmt = (
        select(Room.room_id, Room.name)
        .join(RoomUser, Room.room_id == RoomUser.room_id)
        .where(RoomUser.user_id == User.user_id)
    )
    result = await db.execute(stmt)
    rooms = result.all()

    return [{"room_id": room_id, "name": name} for room_id, name in rooms]

@room_router.get("/room_users/{room_id}")
async def get_room_users(room_id: int, db: AsyncSession = Depends(get_db)):
    """指定したルームに所属するユーザー一覧を取得"""
    stmt = (
        select(User.user_id, User.name)
        .join(RoomUser, User.user_id == RoomUser.user_id)
        .where(RoomUser.room_id == room_id)
    )
    result = await db.execute(stmt)
    users = result.all()

    return [{"user_id": user_id, "name": name} for user_id, name in users]
@room_router.get("/room_tasks/{room_id}")
async def get_room_tasks(room_id: int, db: AsyncSession = Depends(get_db)):
    """
    指定したルームに所属するユーザー全員のタスク一覧を取得
    """
    # ルームに所属するユーザーを取得
    stmt_users = select(User.user_id).join(RoomUser, User.user_id == RoomUser.user_id).where(RoomUser.room_id == room_id)
    result_users = await db.execute(stmt_users)
    user_ids = [row[0] for row in result_users.all()]

    if not user_ids:
        raise HTTPException(status_code=404, detail="No users found in the room")

    # 取得したユーザーIDに紐づくタスクを取得
    stmt_tasks = (
        select(Target)
        .options(selectinload(Target.subtasks))
        .where(Target.user_id.in_(user_ids))
    )
    result_tasks = await db.execute(stmt_tasks)
    tasks = result_tasks.unique().scalars().all()

    if not tasks:
        return []

    # タスクを親子構造に整理
    tasks_dict = {task.target_id: task for task in tasks}
    root_tasks = []

    for task in tasks:
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
