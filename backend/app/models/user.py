from sqlalchemy import Column, String, Boolean
from app.models.base import BaseModel

class User(BaseModel):
    __tablename__ = "users"
    
    phone = Column(String(20), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    nickname = Column(String(50))
    avatar = Column(String(255))
    is_active = Column(Boolean, default=True)