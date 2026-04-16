from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.user import User
from app.core.security import get_password_hash

class UserService:
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def get_by_phone(self, phone: str) -> User:
        result = await self.db.execute(
            select(User).where(User.phone == phone)
        )
        return result.scalar_one_or_none()
    
    async def get_by_id(self, user_id: int) -> User:
        result = await self.db.execute(
            select(User).where(User.id == user_id)
        )
        return result.scalar_one_or_none()
    
    async def create(self, user_data) -> User:
        user = User(
            phone=user_data.phone,
            password_hash=get_password_hash(user_data.password),
            nickname=user_data.nickname
        )
        self.db.add(user)
        await self.db.commit()
        await self.db.refresh(user)
        return user
    
    async def create_simple_user(self, phone: str) -> User:
        user = User(
            phone=phone,
            password_hash=get_password_hash("123456"),
            nickname=f"用户{phone[-4:]}"
        )
        self.db.add(user)
        await self.db.commit()
        await self.db.refresh(user)
        return user

    async def create_with_password(self, phone: str, password: str, nickname: Optional[str] = None) -> User:
        user = User(
            phone=phone,
            password_hash=get_password_hash(password),
            nickname=nickname or f"用户{phone[-4:]}"
        )
        self.db.add(user)
        await self.db.commit()
        await self.db.refresh(user)
        return user

    async def update_password(self, user: User, new_password: str) -> None:
        user.password_hash = get_password_hash(new_password)
        await self.db.commit()
        await self.db.refresh(user)
    
    async def authenticate(self, phone: str, password: str) -> Optional[User]:
        user = await self.get_by_phone(phone)
        if not user:
            return None

        from app.core.security import verify_password
        if not verify_password(password, user.password_hash):
            return None

        return user