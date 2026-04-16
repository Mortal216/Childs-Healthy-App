from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class UserBase(BaseModel):
    phone: str = Field(..., description="手机号")
    nickname: Optional[str] = Field(None, description="昵称")

class UserCreate(UserBase):
    password: str = Field(..., min_length=6, description="密码")

class UserLogin(BaseModel):
    phone: str = Field(..., description="手机号")
    password: str = Field(..., description="密码")

class PasswordResetRequest(BaseModel):
    phone: str = Field(..., description="手机号")
    new_password: str = Field(..., min_length=6, description="新密码")

class PasswordUpdateRequest(BaseModel):
    old_password: str = Field(..., description="原密码")
    new_password: str = Field(..., min_length=6, description="新密码")

class UserResponse(UserBase):
    id: int
    nickname: str
    avatar: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: int