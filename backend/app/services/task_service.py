from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.task import InterventionTask, UserTask
from app.models.assessment import Assessment
from typing import List, Dict

class TaskService:
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def get_all_tasks(self) -> List[InterventionTask]:
        result = await self.db.execute(
            select(InterventionTask)
        )
        return result.scalars().all()
    
    async def get_task_by_id(self, task_id: str) -> InterventionTask:
        result = await self.db.execute(
            select(InterventionTask).where(InterventionTask.task_id == task_id)
        )
        return result.scalar_one_or_none()
    
    async def get_user_tasks(self, user_id: int, baby_id: int) -> List[UserTask]:
        result = await self.db.execute(
            select(UserTask)
            .where(UserTask.user_id == user_id)
            .where(UserTask.baby_id == baby_id)
            .order_by(UserTask.created_at.desc())
        )
        return result.scalars().all()
    
    async def start_task(
        self,
        user_id: int,
        baby_id: int,
        task_id: str
    ) -> UserTask:
        import time
        user_task = UserTask(
            user_id=user_id,
            baby_id=baby_id,
            task_id=task_id,
            status="in_progress",
            start_time=int(time.time())
        )
        
        self.db.add(user_task)
        await self.db.commit()
        await self.db.refresh(user_task)
        
        return user_task
    
    async def complete_task(
        self,
        user_task_id: int,
        rating: int = None,
        feedback: str = None
    ) -> UserTask:
        import time
        result = await self.db.execute(
            select(UserTask).where(UserTask.id == user_task_id)
        )
        user_task = result.scalar_one_or_none()
        
        if user_task:
            user_task.status = "completed"
            user_task.completion_time = int(time.time())
            user_task.rating = rating
            user_task.feedback = feedback
            
            await self.db.commit()
            await self.db.refresh(user_task)
        
        return user_task
    
    async def get_latest_assessment(
        self,
        user_id: int,
        baby_id: int
    ) -> Assessment:
        result = await self.db.execute(
            select(Assessment)
            .where(Assessment.user_id == user_id)
            .where(Assessment.baby_id == baby_id)
            .order_by(Assessment.created_at.desc())
            .limit(1)
        )
        return result.scalar_one_or_none()