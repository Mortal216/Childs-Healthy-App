from fastapi import APIRouter
from app.api.v1 import auth, assessment, tasks, llm, coze

api_router = APIRouter()

api_router.include_router(auth.router)
api_router.include_router(assessment.router)
api_router.include_router(tasks.router)
api_router.include_router(llm.router)
api_router.include_router(coze.router)