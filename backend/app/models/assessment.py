from sqlalchemy import Column, String, Integer, Float, ForeignKey, JSON, Boolean
from sqlalchemy.orm import relationship
from app.models.base import BaseModel

class Assessment(BaseModel):
    __tablename__ = "assessments"
    
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    baby_id = Column(Integer, ForeignKey("babies.id"), nullable=False)
    scale_id = Column(String(50), nullable=False)
    age_group = Column(String(20))
    total_score = Column(Float)
    max_score = Column(Float)
    percent = Column(Float)
    level = Column(String(20))
    dimension_scores = Column(JSON)
    suggestions = Column(JSON)
    test_duration = Column(Integer)

class AssessmentAnswer(BaseModel):
    __tablename__ = "assessment_answers"
    
    assessment_id = Column(Integer, ForeignKey("assessments.id"), nullable=False)
    question_id = Column(String(50), nullable=False)
    selected_option = Column(String(10))
    is_correct = Column(Boolean)
    score = Column(Float)
    time_spent = Column(Integer)