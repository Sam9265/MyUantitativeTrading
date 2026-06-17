"""
模拟券商 - 用于模拟交易
"""
import uuid
from datetime import datetime
from typing import List, Dict
from app.broker.base import (
    BrokerAdapter,
    OrderRequest,
    Order,
    Position,
    Balance,
    OrderStatus,
)


class SimulatedBroker(BrokerAdapter):
    """模拟券商实现"""

    def __init__(self, initial_cash: float = 1000000):
        self.cash = initial_cash
        self.initial_cash = initial_cash
        self.positions: Dict[str, Position] = {}
        self.orders: Dict[str, Order] = {}

    async def connect(self) -> bool:
        """模拟券商始终连接成功"""
        return True

    async def disconnect(self) -> bool:
        return True

    async def get_balance(self) -> Balance:
        """获取账户余额"""
        market_value = sum(p.market_value for p in self.positions.values())
        return Balance(
            cash=self.cash,
            total_assets=self.cash + market_value,
            market_value=market_value,
        )

    async def get_positions(self) -> List[Position]:
        """获取持仓列表"""
        return list(self.positions.values())

    async def get_orders(self) -> List[Order]:
        """获取订单列表"""
        return list(self.orders.values())

    async def place_order(self, request: OrderRequest) -> Order:
        """下单（市价单立即成交）"""
        order_id = str(uuid.uuid4())
        price = request.price or 0.0

        # 模拟市价单立即成交
        if request.order_type.value == "market":
            # 简化：使用固定价格
            cost = request.quantity * price
            fee = cost * 0.0003  # 万三手续费

            if request.direction.value == "buy":
                if self.cash >= cost + fee:
                    self.cash -= cost + fee
                    if request.stock_code in self.positions:
                        pos = self.positions[request.stock_code]
                        new_cost = (pos.avg_cost * pos.quantity + cost) / (pos.quantity + request.quantity)
                        pos.quantity += request.quantity
                        pos.avg_cost = new_cost
                    else:
                        self.positions[request.stock_code] = Position(
                            stock_code=request.stock_code,
                            stock_name=request.stock_code,
                            quantity=request.quantity,
                            avg_cost=price,
                            current_price=price,
                            market_value=price * request.quantity,
                        )
                else:
                    # 资金不足
                    return Order(
                        id=order_id,
                        stock_code=request.stock_code,
                        direction=request.direction,
                        order_type=request.order_type,
                        price=price,
                        quantity=request.quantity,
                        status=OrderStatus.REJECTED,
                    )

            else:  # sell
                if request.stock_code in self.positions:
                    pos = self.positions[request.stock_code]
                    if pos.quantity >= request.quantity:
                        pos.quantity -= request.quantity
                        self.cash += request.quantity * price - fee
                        if pos.quantity == 0:
                            del self.positions[request.stock_code]
                    else:
                        return Order(
                            id=order_id,
                            stock_code=request.stock_code,
                            direction=request.direction,
                            order_type=request.order_type,
                            price=price,
                            quantity=request.quantity,
                            status=OrderStatus.REJECTED,
                        )
                else:
                    return Order(
                        id=order_id,
                        stock_code=request.stock_code,
                        direction=request.direction,
                        order_type=request.order_type,
                        price=price,
                        quantity=request.quantity,
                        status=OrderStatus.REJECTED,
                    )

            order = Order(
                id=order_id,
                stock_code=request.stock_code,
                direction=request.direction,
                order_type=request.order_type,
                price=price,
                quantity=request.quantity,
                status=OrderStatus.FILLED,
                filled_price=price,
                filled_quantity=request.quantity,
                created_at=datetime.utcnow(),
            )
        else:
            # 限价单 - 简化为立即以指定价格成交
            order = Order(
                id=order_id,
                stock_code=request.stock_code,
                direction=request.direction,
                order_type=request.order_type,
                price=price,
                quantity=request.quantity,
                status=OrderStatus.PENDING,
                created_at=datetime.utcnow(),
            )

        self.orders[order_id] = order
        return order

    async def cancel_order(self, order_id: str) -> bool:
        """撤单"""
        if order_id in self.orders:
            order = self.orders[order_id]
            if order.status == OrderStatus.PENDING:
                order.status = OrderStatus.CANCELLED
                return True
        return False
