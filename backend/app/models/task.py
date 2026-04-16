from sqlalchemy import Column, String, Integer, Float, ForeignKey, JSON, Text, Boolean
from app.models.base import BaseModel

class InterventionTask(BaseModel):
    __tablename__ = "intervention_tasks"
    
    task_id = Column(String(50), nullable=False, unique=True, index=True)
    title = Column(String(100), nullable=False)
    description = Column(Text)
    task_type = Column(String(20), nullable=False)
    difficulty = Column(String(20), nullable=False)
    duration = Column(Integer)
    frequency = Column(String(20))
    target_dimensions = Column(JSON)
    age_range = Column(JSON)
    content = Column(JSON)
    action_items = Column(JSON)
    expected_improvement = Column(String(50))
    time_to_effect = Column(String(20))
    popularity = Column(Float, default=0.0)

class UserTask(BaseModel):
    __tablename__ = "user_tasks"
    
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    baby_id = Column(Integer, ForeignKey("babies.id"), nullable=False)
    task_id = Column(String(50), ForeignKey("intervention_tasks.task_id"), nullable=False)
    status = Column(String(20), default="pending")
    start_time = Column(Integer)
    completion_time = Column(Integer)
    rating = Column(Integer)
    feedback = Column(Text)