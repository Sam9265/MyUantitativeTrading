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

    DEFAULT_PAGE_SIZE = 50
    DEFAULT_LIMIT = 500

    @staticmethod
    async def get_market_list(
        market: str,
        page: int = 1,
        page_size: int = DEFAULT_PAGE_SIZE,
        search: Optional[str] = None,
        sort_by: str = "code",
        sort_order: str = "asc",
    ) -> dict:
        """获取市场行情列表（支持分页、搜索、排序）"""
        cache_key = f"market:{market}:all"
        cached = await cache.get(cache_key)
        if cached:
            all_stocks = json.loads(cached)
        else:
            if market == "CN":
                all_stocks = await data_collector.get_a_share_realtime()
            elif market == "HK":
                all_stocks = await data_collector.get_hk_realtime()
            elif market == "US":
                all_stocks = await data_collector.get_us_realtime()
            else:
                all_stocks = []
            await cache.set(cache_key, json.dumps(all_stocks), expire=MarketService.CACHE_EXPIRE)

        # 默认最多返回 500 只，避免一次性传输过大
        all_stocks = all_stocks[: MarketService.DEFAULT_LIMIT]

        # 搜索过滤
        if search:
            query = search.lower()
            all_stocks = [
                s
                for s in all_stocks
                if query in s.get("code", "").lower()
                or query in s.get("name", "").lower()
            ]

        # 排序
        reverse = sort_order.lower() == "desc"
        if sort_by in ("price", "change", "changePercent", "volume", "amount"):
            all_stocks = sorted(
                all_stocks, key=lambda s: s.get(sort_by, 0) or 0, reverse=reverse
            )
        else:
            all_stocks = sorted(all_stocks, key=lambda s: s.get(sort_by, ""), reverse=reverse)

        total = len(all_stocks)
        start = (page - 1) * page_size
        end = start + page_size
        stocks = all_stocks[start:end]

        return {
            "market": market,
            "total": total,
            "page": page,
            "page_size": page_size,
            "stocks": stocks,
        }

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
