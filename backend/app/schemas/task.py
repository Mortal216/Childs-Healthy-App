from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class TaskResponse(BaseModel):
    task_id: str
    title: str
    description: Optional[str]
    task_type: str
    difficulty: str
    duration: Optional[int]
    frequency: Optional[str]
    target_dimensions: List[str]
    age_range: List[int]
    content: Optional[dict]
    action_items: Optional[List[str]]
    expected_improvement: Optional[str]
    time_to_effect: Optional[str]
    popularity: float
    
    class Config:
        from_attributes = True

class TaskRecommendationRequest(BaseModel):
    user_id: int = Field(..., description="用户ID")
    baby_id: int = Field(..., description="宝宝ID")
    count: int = Field(5, description="推荐数量")

class TaskStartRequest(BaseModel):
    user_id: int = Field(..., description="用户ID")
    baby_id: int = Field(..., description="宝宝ID")
    task_id: str = Field(..., description="任务ID")

class TaskCompleteRequest(BaseModel):
    user_task_id: int = Field(..., description="用户任务ID")
    rating: Optional[int] = Field(None, ge=1, le=5, description="评分1-5")
    feedback: Optional[str] = Field(None, description="反馈")

class UserTaskResponse(BaseModel):
    id: int
    user_id: int
    baby_id: int
    task_id: str
    title: str
    status: str
    start_time: Optional[int]
    completion_time: Optional[int]
    rating: Optional[int]
    feedback: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True