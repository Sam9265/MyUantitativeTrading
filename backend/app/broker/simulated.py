"""
模拟券商 - 用于模拟交易
"""
import uuid
from datetime import datetime
from typing import List, Dict, Optional
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

    def __init__(self, initial_cash: float = 1000000, commission_rate: float = 0.0003):
        self.cash = initial_cash
        self.initial_cash = initial_cash
        self.commission_rate = commission_rate
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

    def _create_order(
        self,
        order_id: str,
        request: OrderRequest,
        price: float,
        status: OrderStatus,
        filled_price: Optional[float] = None,
        filled_quantity: int = 0,
    ) -> Order:
        return Order(
            id=order_id,
            stock_code=request.stock_code,
            direction=request.direction,
            order_type=request.order_type,
            price=price,
            quantity=request.quantity,
            status=status,
            filled_price=filled_price,
            filled_quantity=filled_quantity,
            created_at=datetime.utcnow(),
        )

    async def place_order(self, request: OrderRequest) -> Order:
        """下单（市价单立即成交）"""
        order_id = str(uuid.uuid4())
        price = request.price or 0.0

        # 基本校验
        if request.quantity <= 0:
            order = self._create_order(order_id, request, price, OrderStatus.REJECTED)
            self.orders[order_id] = order
            return order

        # 市价单必须带价格（模拟环境无法实时取行情）
        if request.order_type == OrderType.MARKET and price <= 0:
            order = self._create_order(order_id, request, price, OrderStatus.REJECTED)
            self.orders[order_id] = order
            return order

        # 限价单直接挂单
        if request.order_type == OrderType.LIMIT:
            order = self._create_order(order_id, request, price, OrderStatus.PENDING)
            self.orders[order_id] = order
            return order

        # 市价单成交逻辑
        cost = request.quantity * price
        fee = cost * self.commission_rate

        if request.direction == OrderDirection.BUY:
            if self.cash < cost + fee:
                order = self._create_order(order_id, request, price, OrderStatus.REJECTED)
                self.orders[order_id] = order
                return order

            self.cash -= cost + fee
            if request.stock_code in self.positions:
                pos = self.positions[request.stock_code]
                total_quantity = pos.quantity + request.quantity
                new_cost = (pos.avg_cost * pos.quantity + cost) / total_quantity
                pos.quantity = total_quantity
                pos.avg_cost = new_cost
                pos.current_price = price
                pos.market_value = price * pos.quantity
            else:
                self.positions[request.stock_code] = Position(
                    stock_code=request.stock_code,
                    stock_name=request.stock_code,
                    quantity=request.quantity,
                    avg_cost=price,
                    current_price=price,
                    market_value=price * request.quantity,
                )

        else:  # SELL
            if request.stock_code not in self.positions:
                order = self._create_order(order_id, request, price, OrderStatus.REJECTED)
                self.orders[order_id] = order
                return order

            pos = self.positions[request.stock_code]
            if pos.quantity < request.quantity:
                order = self._create_order(order_id, request, price, OrderStatus.REJECTED)
                self.orders[order_id] = order
                return order

            pos.quantity -= request.quantity
            self.cash += request.quantity * price - fee
            if pos.quantity == 0:
                del self.positions[request.stock_code]
            else:
                pos.current_price = price
                pos.market_value = price * pos.quantity

        order = self._create_order(
            order_id,
            request,
            price,
            OrderStatus.FILLED,
            filled_price=price,
            filled_quantity=request.quantity,
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
