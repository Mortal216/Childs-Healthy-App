from sqlalchemy import Column, String, Integer, Float, ForeignKey, JSON, Text, Boolean
from app.models.base import BaseModel

class Scale(BaseModel):
    __tablename__ = "scales"
    
    scale_id = Column(String(50), nullable=False, unique=True, index=True)
    scale_name = Column(String(100), nullable=False)
    scale_type = Column(String(20), nullable=False)
    min_age = Column(Integer, nullable=False)
    max_age = Column(Integer, nullable=False)
    total_questions = Column(Integer)
    estimated_duration = Column(Integer)
    dimensions = Column(JSON)
    scoring_rules = Column(JSON)
    norm_data = Column(JSON)

class Question(BaseModel):
    __tablename__ = "questions"
    
    question_id = Column(String(50), nullable=False, unique=True, index=True)
    scale_id = Column(String(50), ForeignKey("scales.scale_id"), nullable=False)
    age_group = Column(String(20), nullable=False)
    question_type = Column(String(50), nullable=False)
    question = Column(Text, nullable=False)
    image_url = Column(String(255))
    audio_url = Column(String(255))
    options = Column(JSON)
    dimension = Column(String(50))
    weight = Column(Float, default=1.0)
    time_limit = Column(Integer)
    required = Column(Boolean, default=True)