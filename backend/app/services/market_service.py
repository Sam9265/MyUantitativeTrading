"""
行情服务
"""
import json
from typing import List, Optional
from app.services.data_collector import data_collector
from app.core.redis_client import cache


class MarketService:
    """行情服务"""

    CACHE_EXPIRE = 60  # 缓存60秒

    @staticmethod
    async def get_market_list(market: str) -> List[dict]:
        """获取市场行情列表"""
        cache_key = f"market:{market}"
        cached = await cache.get(cache_key)
        if cached:
            return json.loads(cached)

        if market == "CN":
            stocks = await data_collector.get_a_share_realtime()
        elif market == "HK":
            stocks = await data_collector.get_hk_realtime()
        elif market == "US":
            stocks = await data_collector.get_us_realtime()
        else:
            stocks = []

        # 限制返回数量
        stocks = stocks[:100]

        # 缓存
        await cache.set(cache_key, json.dumps(stocks), expire=MarketService.CACHE_EXPIRE)
        return stocks

    @staticmethod
    async def get_stock_quote(code: str) -> Optional[dict]:
        """获取个股行情"""
        # 先从缓存获取
        cache_key = f"stock:quote:{code}"
        cached = await cache.get(cache_key)
        if cached:
            return json.loads(cached)

        # 根据代码判断市场
        if code.startswith(("0", "3", "6")) and len(code) == 6:
            stocks = await data_collector.get_a_share_realtime()
        elif len(code) == 5:
            stocks = await data_collector.get_hk_realtime()
        else:
            stocks = await data_collector.get_us_realtime()

        for stock in stocks:
            if stock["code"] == code:
                await cache.set(cache_key, json.dumps(stock), expire=MarketService.CACHE_EXPIRE)
                return stock
        return None

    @staticmethod
    async def get_kline(code: str, period: str = "daily", days: int = 365) -> List[dict]:
        """获取K线数据"""
        cache_key = f"kline:{code}:{period}:{days}"
        cached = await cache.get(cache_key)
        if cached:
            return json.loads(cached)

        data = await data_collector.get_kline(code, period, days)
        await cache.set(cache_key, json.dumps(data), expire=MarketService.CACHE_EXPIRE * 5)
        return data


market_service = MarketService()
