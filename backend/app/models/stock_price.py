"""
行情时序数据模型 - TimescaleDB
"""
from datetime import datetime
from decimal import Decimal
from sqlalchemy import String, Numeric, BigInteger, DateTime, Index, PrimaryKeyConstraint, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column
from app.core.database import Base


class StockPrice(Base):
    """股票行情时序数据表（使用TimescaleDB hypertable）"""
    __tablename__ = "stock_prices"

    stock_code: Mapped[str] = mapped_column(
        String(20), ForeignKey("stocks.code", ondelete="CASCADE"), nullable=False
    )
    timestamp: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False
    )
    open: Mapped[Decimal] = mapped_column(Numeric(15, 4), nullable=False)
    high: Mapped[Decimal] = mapped_column(Numeric(15, 4), nullable=False)
    low: Mapped[Decimal] = mapped_column(Numeric(15, 4), nullable=False)
    close: Mapped[Decimal] = mapped_column(Numeric(15, 4), nullable=False)
    volume: Mapped[int] = mapped_column(BigInteger, nullable=False)
    amount: Mapped[Decimal] = mapped_column(Numeric(20, 4), nullable=True)

    __table_args__ = (
        PrimaryKeyConstraint("stock_code", "timestamp"),
        Index("ix_stock_prices_code_time", "stock_code", "timestamp", postgresql_using="btree"),
    )
