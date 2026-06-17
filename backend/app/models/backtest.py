"""
回测模型
"""
from datetime import datetime, date
from uuid import UUID, uuid4
from sqlalchemy import ForeignKey, String, Text, DateTime, Date, Numeric
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column
from app.core.database import Base


class Backtest(Base):
    """回测记录表"""
    __tablename__ = "backtests"

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    user_id: Mapped[UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    strategy_id: Mapped[UUID] = mapped_column(ForeignKey("strategies.id", ondelete="SET NULL"), nullable=True)
    stock_code: Mapped[str] = mapped_column(String(20), nullable=False, index=True)
    start_date: Mapped[date] = mapped_column(Date, nullable=False)
    end_date: Mapped[date] = mapped_column(Date, nullable=False)
    initial_capital: Mapped[float] = mapped_column(Numeric(15, 2), nullable=False)
    commission_rate: Mapped[float] = mapped_column(Numeric(5, 4), default=0.0003)
    result: Mapped[dict] = mapped_column(JSONB, nullable=True)
    status: Mapped[str] = mapped_column(String(20), default="pending")
    error: Mapped[str] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
