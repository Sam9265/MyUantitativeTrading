"""
交易API - 模拟交易 + 实盘框架预留
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from app.core.database import get_db
from app.models.order import Order
from app.schemas.trade import (
    OrderCreate,
    OrderResponse,
    AccountResponse,
    PositionResponse,
)
from app.broker import (
    SimulatedBroker,
    OrderRequest,
    OrderType,
    OrderDirection,
    OrderStatus,
)

router = APIRouter()

# 全局模拟券商实例 - 实际项目应该用会话管理
simulated_broker = SimulatedBroker(initial_cash=1000000)


@router.post("/order", response_model=OrderResponse)
async def place_order(
    data: OrderCreate,
    user_id: str = "demo-user",
    db: AsyncSession = Depends(get_db),
):
    """下单"""
    # 调用券商接口下单（实盘时切换为真实adapter）
    order_request = OrderRequest(
        stock_code=data.stock_code,
        direction=OrderDirection(data.direction),
        order_type=OrderType(data.order_type),
        price=data.price,
        quantity=data.quantity,
    )
    order = await simulated_broker.place_order(order_request)

    # 保存订单到数据库
    db_order = Order(
        id=order.id,
        user_id=user_id,
        stock_code=data.stock_code,
        stock_name=data.stock_name,
        direction=data.direction,
        order_type=data.order_type,
        price=data.price,
        quantity=data.quantity,
        status=order.status.value,
        filled_price=order.filled_price,
        filled_quantity=order.filled_quantity,
        is_simulated=True,
    )
    db.add(db_order)
    await db.commit()
    await db.refresh(db_order)

    return db_order


@router.delete("/order/{order_id}")
async def cancel_order(
    order_id: str,
    db: AsyncSession = Depends(get_db),
):
    """撤单"""
    result = await db.execute(
        select(Order).where(Order.id == order_id)
    )
    order = result.scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=404, detail="订单不存在")

    success = await simulated_broker.cancel_order(order_id)
    if success:
        order.status = "cancelled"
        await db.commit()

    return {"success": success}


@router.get("/orders", response_model=List[OrderResponse])
async def get_orders(
    user_id: str = "demo-user",
    db: AsyncSession = Depends(get_db),
):
    """获取订单列表"""
    result = await db.execute(
        select(Order).where(Order.user_id == user_id).order_by(Order.created_at.desc())
    )
    return result.scalars().all()


@router.get("/account", response_model=AccountResponse)
async def get_account():
    """获取账户信息"""
    balance = await simulated_broker.get_balance()
    positions = await simulated_broker.get_positions()

    position_responses = [
        PositionResponse(
            stock_code=p.stock_code,
            stock_name=p.stock_name,
            quantity=p.quantity,
            avg_cost=p.avg_cost,
            current_price=p.current_price,
            market_value=p.market_value,
            profit_loss=p.profit_loss,
            profit_loss_percent=(p.profit_loss / (p.avg_cost * p.quantity) * 100) if p.quantity > 0 else 0,
        )
        for p in positions
    ]

    total_profit = sum(p.profit_loss for p in positions)
    total_market_value = sum(p.market_value for p in positions)
    initial_total = 1000000

    return AccountResponse(
        cash=balance.cash,
        total_assets=balance.total_assets,
        market_value=total_market_value,
        profit_loss=total_profit,
        profit_loss_percent=(total_profit / initial_total * 100),
        positions=position_responses,
    )
