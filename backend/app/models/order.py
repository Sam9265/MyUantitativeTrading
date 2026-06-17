"""
订单模型
"""
from datetime import datetime
from uuid import UUID, uuid4
from sqlalchemy import ForeignKey, String, Numeric, Integer, DateTime, Boolean
from sqlalchemy.orm import Mapped, mapped_column
from app.core.database import Base


class Order(Base):
    """订单表（模拟+实盘预留）"""
    __tablename__ = "orders"

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    user_id: Mapped[UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    stock_code: Mapped[str] = mapped_column(String(20), nullable=False, index=True)
    stock_name: Mapped[str] = mapped_column(String(255), nullable=True)
    direction: Mapped[str] = mapped_column(String(10), nullable=False)  # buy / sell
    order_type: Mapped[str] = mapped_column(String(10), nullable=False)  # market / limit
    price: Mapped[float] = mapped_column(Numeric(15, 4), nullable=True)
    quantity: Mapped[int] = mapped_column(Integer, nullable=False)
    status: Mapped[str] = mapped_column(String(20), default="pending")
    filled_price: Mapped[float] = mapped_column(Numeric(15, 4), nullable=True)
    filled_quantity: Mapped[int] = mapped_column(Integer, default=0)
    is_simulated: Mapped[bool] = mapped_column(Boolean, default=True)
    broker_order_id: Mapped[str] = mapped_column(String(100), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)
    filled_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=True)
