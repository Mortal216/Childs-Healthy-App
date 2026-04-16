from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.security import create_access_token, decode_access_token
from app.schemas.user import (
    UserCreate,
    UserLogin,
    Token,
    UserResponse,
    PasswordResetRequest,
    PasswordUpdateRequest,
)
from app.services.user_service import UserService
from app.models.user import User

router = APIRouter(prefix="/auth", tags=["认证"])
bearer_scheme = HTTPBearer(auto_error=True)


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: AsyncSession = Depends(get_db),
) -> User:
    payload = decode_access_token(credentials.credentials)
    if not payload or not payload.get("sub"):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="无效凭证",
        )
    try:
        user_id = int(payload["sub"])
    except (TypeError, ValueError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="无效凭证",
        )

    user_service = UserService(db)
    user = await user_service.get_by_id(user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="用户不存在",
        )
    return user


@router.post("/register", response_model=UserResponse)
async def register(user_data: UserCreate, db: AsyncSession = Depends(get_db)):
    user_service = UserService(db)

    existing_user = await user_service.get_by_phone(user_data.phone)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="手机号已注册",
        )

    user = await user_service.create(user_data)
    return user


@router.post("/login", response_model=Token)
async def login(user_data: UserLogin, db: AsyncSession = Depends(get_db)):
    """宽松登录（与项目 A 一致）：不校验密码；新手机号自动建号（默认密码哈希对应 123456）。"""
    user_service = UserService(db)
    user = await user_service.get_by_phone(user_data.phone)
    if not user:
        user = await user_service.create_simple_user(user_data.phone)

    access_token = create_access_token(data={"sub": str(user.id)})

    return Token(
        access_token=access_token,
        token_type="bearer",
        user_id=user.id,
    )


@router.post("/reset-password")
async def reset_password(body: PasswordResetRequest, db: AsyncSession = Depends(get_db)):
    user_service = UserService(db)
    user = await user_service.get_by_phone(body.phone)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="用户不存在",
        )

    await user_service.update_password(user, body.new_password)
    return {"message": "密码重置成功"}


@router.post("/update-password")
async def update_password(
    body: PasswordUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    user_service = UserService(db)
    authenticated = await user_service.authenticate(
        current_user.phone, body.old_password
    )
    if not authenticated:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="原密码不正确",
        )

    await user_service.update_password(current_user, body.new_password)
    return {"message": "密码已更新"}
