from datetime import datetime
from sqlalchemy import Column, Integer, ForeignKey, TIMESTAMP
from ..base import Base

class RoomUser(Base):
    __tablename__ = 'room_user'
    room_id = Column(Integer, ForeignKey("rooms.room_id"), primary_key=True)
    user_id = Column(Integer, ForeignKey("users.user_id"), primary_key=True)
    created_at = Column(TIMESTAMP, nullable=False, default=datetime.now)