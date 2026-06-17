"""
回测数据模型
"""
from pydantic import BaseModel, Field
from datetime import date, datetime
from uuid import UUID
from typing import Optional, List, Dict, Any


class BacktestCreate(BaseModel):
    """回测请求"""
    strategy_id: Optional[UUID] = None
    strategy_code: Optional[str] = None  # 可直接传入代码
    stock_code: str
    start_date: date
    end_date: date
    initial_capital: float = Field(1000000, gt=0)
    commission_rate: float = Field(0.0003, ge=0, le=1)


class BacktestMetrics(BaseModel):
    """回测指标"""
    total_return: float = 0.0
    annual_return: float = 0.0
    max_drawdown: float = 0.0
    sharpe_ratio: float = 0.0
    win_rate: float = 0.0


class TradeRecord(BaseModel):
    """交易记录"""
    timestamp: int
    direction: str
    price: float
    quantity: int
    amount: float


class EquityPoint(BaseModel):
    """权益曲线点"""
    timestamp: int
    value: float


class BacktestResult(BaseModel):
    """回测结果"""
    metrics: BacktestMetrics
    equity_curve: List[EquityPoint]
    trades: List[TradeRecord]


class BacktestResponse(BaseModel):
    """回测响应"""
    id: UUID
    stock_code: str
    start_date: date
    end_date: date
    initial_capital: float
    status: str
    result: Optional[BacktestResult] = None
    error: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True
