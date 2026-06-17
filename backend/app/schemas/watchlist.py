"""
自选股数据模型
"""
from typing import Optional
from pydantic import BaseModel, Field
from datetime import datetime
from uuid import UUID


class WatchlistCreate(BaseModel):
    """添加自选请求"""
    stock_code: str = Field(..., description="股票代码")
    stock_name: Optional[str] = None


class WatchlistResponse(BaseModel):
    """自选股响应"""
    id: UUID
    stock_code: str
    stock_name: Optional[str] = None
    added_at: datetime

    class Config:
        from_attributes = True
