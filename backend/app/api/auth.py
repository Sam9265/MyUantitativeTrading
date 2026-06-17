"""
认证API - 简化版
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime, timedelta
from jose import jwt
from app.core.config import settings

router = APIRouter()


class RegisterRequest(BaseModel):
    """注册请求"""
    email: EmailStr
    password: str = Field(..., min_length=6)


class LoginRequest(BaseModel):
    """登录请求"""
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    """Token响应"""
    access_token: str
    token_type: str = "bearer"
    user: dict


def create_token(user_id: str) -> str:
    """生成JWT token"""
    expire = datetime.utcnow() + timedelta(minutes=settings.JWT_EXPIRE_MINUTES)
    payload = {
        "sub": user_id,
        "exp": expire,
    }
    return jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)


@router.post("/register", response_model=TokenResponse)
async def register(data: RegisterRequest):
    """注册（简化版 - 实际应保存到数据库）"""
    # TODO: 实际实现应检查重复并保存到数据库
    user_id = f"user_{datetime.utcnow().timestamp()}"
    token = create_token(user_id)
    return TokenResponse(
        access_token=token,
        user={"id": user_id, "email": data.email},
    )


@router.post("/login", response_model=TokenResponse)
async def login(data: LoginRequest):
    """登录（简化版）"""
    # TODO: 实际实现应验证密码
    user_id = f"user_{data.email}"
    token = create_token(user_id)
    return TokenResponse(
        access_token=token,
        user={"id": user_id, "email": data.email},
    )
