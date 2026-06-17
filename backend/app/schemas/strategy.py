"""
策略数据模型
"""
from pydantic import BaseModel, Field
from datetime import datetime
from uuid import UUID
from typing import Optional


class StrategyCreate(BaseModel):
    """创建策略请求"""
    name: str = Field(..., min_length=1, max_length=255)
    code: str = Field(..., min_length=1)
    description: Optional[str] = None
    is_public: bool = False


class StrategyUpdate(BaseModel):
    """更新策略请求"""
    name: Optional[str] = None
    code: Optional[str] = None
    description: Optional[str] = None
    is_public: Optional[bool] = None


class StrategyResponse(BaseModel):
    """策略响应"""
    id: UUID
    name: str
    code: str
    description: Optional[str] = None
    is_public: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
