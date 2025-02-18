from datetime import datetime
from sqlalchemy import Column, Integer, String, TIMESTAMP
from ..base import Base

class Room(Base):
    __tablename__ = 'rooms'
    room_id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(255), nullable=False)
    created_at = Column(TIMESTAMP, nullable=False, default=datetime.now)