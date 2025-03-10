from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..base import Base

class Target(Base):
    __tablename__ = 'target'

    target_id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    target = Column(String(255), nullable=False)
    status = Column(Boolean, nullable=False)
    weight = Column(Integer, nullable=True, default=1)
    parent_id = Column(Integer, ForeignKey("target.target_id", ondelete="CASCADE"), nullable=True)
    created_at = Column(DateTime, nullable=False, default=datetime.now)
    updated_at = Column(DateTime, nullable=False, default=datetime.now, onupdate=func.now())

    parent = relationship("Target", remote_side=[target_id], backref="subtasks", lazy="selectin")
