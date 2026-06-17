"""
行情时序数据模型 - TimescaleDB
"""
from datetime import datetime
from sqlalchemy import String, Numeric, BigInteger, DateTime, Index
from sqlalchemy.orm import Mapped, mapped_column
from app.core.database import Base


class StockPrice(Base):
    """股票行情时序数据表（使用TimescaleDB hypertable）"""
    __tablename__ = "stock_prices"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    stock_code: Mapped[str] = mapped_column(String(20), nullable=False, index=True)
    timestamp: Mapped[datetime] = mapped_column(DateTime, nullable=False, index=True)
    open: Mapped[float] = mapped_column(Numeric(15, 4), nullable=False)
    high: Mapped[float] = mapped_column(Numeric(15, 4), nullable=False)
    low: Mapped[float] = mapped_column(Numeric(15, 4), nullable=False)
    close: Mapped[float] = mapped_column(Numeric(15, 4), nullable=False)
    volume: Mapped[int] = mapped_column(BigInteger, nullable=False)
    amount: Mapped[float] = mapped_column(Numeric(20, 4), nullable=True)

    __table_args__ = (
        Index("ix_stock_prices_code_time", "stock_code", "timestamp"),
    )
