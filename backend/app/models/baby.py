from sqlalchemy import Column, String, Integer, ForeignKey
from sqlalchemy.orm import relationship
from app.models.base import BaseModel

class Baby(BaseModel):
    __tablename__ = "babies"
    
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String(50), nullable=False)
    gender = Column(String(10))
    birth_date = Column(String(20), nullable=False)
    age_months = Column(Integer)