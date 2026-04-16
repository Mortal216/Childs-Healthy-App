from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from app.core.database import get_db
from app.schemas.task import (
    TaskResponse,
    TaskRecommendationRequest,
    TaskStartRequest,
    TaskCompleteRequest,
    UserTaskResponse
)
from app.services.task_service import TaskService
from app.services.assessment_service import AssessmentService
from app.algorithms.task_recommendation import TaskRecommendationAlgorithm

router = APIRouter(prefix="/tasks", tags=["干预任务"])

@router.get("", response_model=List[TaskResponse])
async def get_all_tasks(db: AsyncSession = Depends(get_db)):
    task_service = TaskService(db)
    tasks = await task_service.get_all_tasks()
    return tasks

@router.get("/{task_id}", response_model=TaskResponse)
async def get_task_detail(
    task_id: str,
    db: AsyncSession = Depends(get_db)
):
    task_service = TaskService(db)
    task = await task_service.get_task_by_id(task_id)
    
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="任务不存在"
        )
    
    return task

@router.post("/recommend", response_model=List[TaskResponse])
async def recommend_tasks(
    request: TaskRecommendationRequest,
    db: AsyncSession = Depends(get_db)
):
    task_service = TaskService(db)
    assessment_service = AssessmentService(db)
    
    all_tasks = await task_service.get_all_tasks()
    latest_assessment = await task_service.get_latest_assessment(
        request.user_id,
        request.baby_id
    )
    
    if not latest_assessment:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="请先完成测评"
        )
    
    assessment_result = {
        'dimension_scores': latest_assessment.dimension_scores
    }
    
    user_profile = await assessment_service.get_user_profile(request.user_id)
    
    task_dict_list = []
    for task in all_tasks:
        task_dict_list.append({
            'task_id': task.task_id,
            'title': task.title,
            'description': task.description,
            'task_type': task.task_type,
            'difficulty': task.difficulty,
            'duration': task.duration,
            'frequency': task.frequency,
            'target_dimensions': task.target_dimensions,
            'age_range': task.age_range,
            'content': task.content,
            'action_items': task.action_items,
            'expected_improvement': task.expected_improvement,
            'time_to_effect': task.time_to_effect,
            'popularity': task.popularity
        })
    
    recommendation_algorithm = TaskRecommendationAlgorithm()
    recommended_tasks = recommendation_algorithm.recommend_tasks(
        assessment_result=assessment_result,
        user_profile=user_profile,
        all_tasks=task_dict_list,
        count=request.count
    )
    
    return recommended_tasks

@router.post("/start", response_model=UserTaskResponse)
async def start_task(
    request: TaskStartRequest,
    db: AsyncSession = Depends(get_db)
):
    task_service = TaskService(db)
    
    task = await task_service.get_task_by_id(request.task_id)
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="任务不存在"
        )
    
    user_task = await task_service.start_task(
        user_id=request.user_id,
        baby_id=request.baby_id,
        task_id=request.task_id
    )
    
    return UserTaskResponse(
        id=user_task.id,
        user_id=user_task.user_id,
        baby_id=user_task.baby_id,
        task_id=user_task.task_id,
        title=task.title,
        status=user_task.status,
        start_time=user_task.start_time,
        completion_time=user_task.completion_time,
        rating=user_task.rating,
        feedback=user_task.feedback,
        created_at=user_task.created_at
    )

@router.post("/complete", response_model=UserTaskResponse)
async def complete_task(
    request: TaskCompleteRequest,
    db: AsyncSession = Depends(get_db)
):
    task_service = TaskService(db)
    
    user_task = await task_service.complete_task(
        user_task_id=request.user_task_id,
        rating=request.rating,
        feedback=request.feedback
    )
    
    if not user_task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="用户任务不存在"
        )
    
    return user_task

@router.get("/user/{user_id}/baby/{baby_id}", response_model=List[UserTaskResponse])
async def get_user_tasks(
    user_id: int,
    baby_id: int,
    db: AsyncSession = Depends(get_db)
):
    task_service = TaskService(db)
    user_tasks = await task_service.get_user_tasks(user_id, baby_id)
    return user_tasks