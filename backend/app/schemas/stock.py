"""
股票数据模型
"""
from typing import Optional, List
from pydantic import BaseModel, Field
from datetime import datetime


class StockBase(BaseModel):
    """股票基础信息"""
    code: str = Field(..., description="股票代码")
    name: str = Field(..., description="股票名称")
    market: str = Field(..., description="市场: CN/HK/US")
    industry: Optional[str] = None


class StockResponse(StockBase):
    """股票响应"""
    price: float = 0.0
    change: float = 0.0
    changePercent: float = 0.0
    volume: int = 0
    amount: float = 0.0
    open: float = 0.0
    high: float = 0.0
    low: float = 0.0
    close: float = 0.0

    class Config:
        from_attributes = True
        populate_by_name = True


class StockListResponse(BaseModel):
    """股票列表响应"""
    market: str
    total: int
    page: int = 1
    page_size: int = 50
    stocks: List[StockResponse]


class KLineData(BaseModel):
    """K线数据"""
    timestamp: int
    open: float
    high: float
    low: float
    close: float
    volume: int


class KLineResponse(BaseModel):
    """K线响应"""
    code: str
    period: str
    data: List[KLineData]
