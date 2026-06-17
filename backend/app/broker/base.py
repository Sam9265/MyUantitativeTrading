"""
券商适配器基类 - 实盘交易框架预留
"""
from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from typing import List, Optional
from enum import Enum
from datetime import datetime


class OrderType(str, Enum):
    """订单类型"""
    MARKET = "market"
    LIMIT = "limit"


class OrderDirection(str, Enum):
    """订单方向"""
    BUY = "buy"
    SELL = "sell"


class OrderStatus(str, Enum):
    """订单状态"""
    PENDING = "pending"
    FILLED = "filled"
    PARTIALLY_FILLED = "partially_filled"
    CANCELLED = "cancelled"
    REJECTED = "rejected"


@dataclass
class OrderRequest:
    """下单请求"""
    stock_code: str
    direction: OrderDirection
    order_type: OrderType
    price: Optional[float] = None
    quantity: int = 0


@dataclass
class Order:
    """订单"""
    id: str
    stock_code: str
    direction: OrderDirection
    order_type: OrderType
    price: float
    quantity: int
    status: OrderStatus
    filled_price: Optional[float] = None
    filled_quantity: int = 0
    created_at: Optional[datetime] = None
    broker_order_id: Optional[str] = None


@dataclass
class Position:
    """持仓"""
    stock_code: str
    stock_name: str
    quantity: int
    avg_cost: float
    current_price: float = 0.0
    market_value: float = 0.0
    profit_loss: float = 0.0


@dataclass
class Balance:
    """账户余额"""
    cash: float
    total_assets: float
    frozen: float = 0.0
    market_value: float = 0.0


class BrokerAdapter(ABC):
    """
    券商适配器抽象基类
    用于对接实盘券商（Tiger Brokers、Futu等）
    """

    @abstractmethod
    async def connect(self) -> bool:
        """连接券商账户"""
        raise NotImplementedError

    @abstractmethod
    async def disconnect(self) -> bool:
        """断开连接"""
        raise NotImplementedError

    @abstractmethod
    async def get_balance(self) -> Balance:
        """获取账户余额"""
        raise NotImplementedError

    @abstractmethod
    async def get_positions(self) -> List[Position]:
        """获取持仓列表"""
        raise NotImplementedError

    @abstractmethod
    async def get_orders(self) -> List[Order]:
        """获取订单列表"""
        raise NotImplementedError

    @abstractmethod
    async def place_order(self, order: OrderRequest) -> Order:
        """下单"""
        raise NotImplementedError

    @abstractmethod
    async def cancel_order(self, order_id: str) -> bool:
        """撤单"""
        raise NotImplementedError


# 实盘适配器框架 - 待实现
class TigerBrokersAdapter(BrokerAdapter):
    """
    老虎证券适配器 - 待实现
    文档: https://quantapi.tigerbrokers.com/
    """

    def __init__(self, account: str, password: str):
        self.account = account
        self.password = password
        self.connected = False

    async def connect(self) -> bool:
        """实现老虎证券连接"""
        # TODO: 实现Tiger Brokers API连接
        raise NotImplementedError("老虎证券适配器待实现")

    async def disconnect(self) -> bool:
        raise NotImplementedError

    async def get_balance(self) -> Balance:
        raise NotImplementedError

    async def get_positions(self) -> List[Position]:
        raise NotImplementedError

    async def get_orders(self) -> List[Order]:
        raise NotImplementedError

    async def place_order(self, order: OrderRequest) -> Order:
        raise NotImplementedError

    async def cancel_order(self, order_id: str) -> bool:
        raise NotImplementedError


class FutuAdapter(BrokerAdapter):
    """
    富途证券适配器 - 待实现
    文档: https://openapi.futunn.com/
    """

    def __init__(self, account: str, password: str):
        self.account = account
        self.password = password
        self.connected = False

    async def connect(self) -> bool:
        """实现富途连接"""
        # TODO: 实现Futu OpenAPI连接
        raise NotImplementedError("富途适配器待实现")

    async def disconnect(self) -> bool:
        raise NotImplementedError

    async def get_balance(self) -> Balance:
        raise NotImplementedError

    async def get_positions(self) -> List[Position]:
        raise NotImplementedError

    async def get_orders(self) -> List[Order]:
        raise NotImplementedError

    async def place_order(self, order: OrderRequest) -> Order:
        raise NotImplementedError

    async def cancel_order(self, order_id: str) -> bool:
        raise NotImplementedError
