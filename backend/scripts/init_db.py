import asyncio
import sys
from pathlib import Path

backend_dir = Path(__file__).parent.parent
sys.path.insert(0, str(backend_dir))

from sqlalchemy.ext.asyncio import create_async_engine
from app.models.base import Base
from app.models import user, baby, assessment, scale, task
from app.config import settings

async def init_db():
    engine = create_async_engine(settings.database_url, echo=True)
    
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    print("数据库表创建成功！")

if __name__ == "__main__":
    asyncio.run(init_db())