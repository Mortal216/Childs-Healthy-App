from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy import text
from app.config import settings
import re

Base = declarative_base()

def _parse_db_name(url: str) -> str:
    """从数据库 URL 中提取数据库名"""
    match = re.search(r"/([^/?]+)(\?|$)", url)
    if match:
        return match.group(1)
    raise ValueError(f"无法从 URL 中解析数据库名: {url}")

def _get_server_url(url: str, db_name: str) -> str:
    """将数据库 URL 中的库名替换为空，用于连接 MySQL 服务器本身"""
    return url.replace(f"/{db_name}", "/")

async def init_db():
    """
    启动时检查数据库是否存在，不存在则自动创建，
    然后根据所有 ORM 模型建表。
    """
    db_name = _parse_db_name(settings.database_url)
    server_url = _get_server_url(settings.database_url, db_name)

    # 连接到 MySQL 服务器（不指定库），创建数据库
    server_engine = create_async_engine(server_url, echo=settings.debug)
    async with server_engine.begin() as conn:
        await conn.execute(
            text(f"CREATE DATABASE IF NOT EXISTS `{db_name}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci")
        )
        print(f"[DB] 数据库 `{db_name}` 已就绪")
    await server_engine.dispose()

    # 连接到目标数据库，创建所有表
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        print("[DB] 所有数据表已就绪")

engine = create_async_engine(
    settings.database_url,
    echo=settings.debug,
    pool_pre_ping=True,
    pool_recycle=3600
)

AsyncSessionLocal = sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False
)

async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()