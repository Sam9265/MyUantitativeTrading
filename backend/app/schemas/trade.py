"""
交易数据模型
"""
from pydantic import BaseModel, Field
from datetime import datetime
from uuid import UUID
from typing import Optional, List


class OrderCreate(BaseModel):
    """下单请求"""
    stock_code: str
    stock_name: Optional[str] = None
    direction: str = Field(..., pattern="^(buy|sell)$")
    order_type: str = Field("limit", pattern="^(market|limit)$")
    price: Optional[float] = None
    quantity: int = Field(..., gt=0)


class OrderResponse(BaseModel):
    """订单响应"""
    id: UUID
    stock_code: str
    stock_name: Optional[str] = None
    direction: str
    order_type: str
    price: Optional[float] = None
    quantity: int
    status: str
    filled_price: Optional[float] = None
    filled_quantity: int = 0
    is_simulated: bool
    created_at: datetime
    filled_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class PositionResponse(BaseModel):
    """持仓响应"""
    stock_code: str
    stock_name: Optional[str] = None
    quantity: int
    avg_cost: float
    current_price: float = 0.0
    market_value: float = 0.0
    profit_loss: float = 0.0
    profit_loss_percent: float = 0.0


class AccountResponse(BaseModel):
    """账户响应"""
    cash: float
    total_assets: float
    market_value: float
    profit_loss: float
    profit_loss_percent: float
    positions: List[PositionResponse]
