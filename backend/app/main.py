from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.api.v1.router import api_router
from app.core.database import Base, init_db

# 导入所有模型，确保 Base.metadata 包含全部表定义
import app.models.user       # noqa
import app.models.baby       # noqa
import app.models.assessment # noqa 
import app.models.scale      # noqa
import app.models.task       # noqa

app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="咿呀智库后端API"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api/v1")

@app.on_event("startup")
async def startup_event():
    print(f"{settings.app_name} v{settings.app_version} 启动中...")
    await init_db()

@app.on_event("shutdown")
async def shutdown_event():
    print(f"{settings.app_name} 关闭中...")

@app.get("/")
async def root():
    return {
        "app": settings.app_name,
        "version": settings.app_version,
        "status": "running"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}