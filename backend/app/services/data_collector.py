"""
行情数据采集服务 - 使用akshare
"""
import asyncio
from datetime import datetime, timedelta
from typing import List, Dict, Optional
import akshare as ak
import pandas as pd
from app.core.config import settings


class DataCollector:
    """数据采集器"""

    @staticmethod
    async def get_a_share_realtime() -> List[Dict]:
        """获取A股实时行情"""
        try:
            loop = asyncio.get_event_loop()
            df = await loop.run_in_executor(
                None,
                lambda: ak.stock_zh_a_spot_em()
            )
            return DataCollector._format_a_share(df)
        except Exception as e:
            print(f"获取A股行情失败: {e}")
            return []

    @staticmethod
    def _format_a_share(df: pd.DataFrame) -> List[Dict]:
        """格式化A股数据"""
        if df is None or df.empty:
            return []

        result = []
        # akshare返回的字段: 序号, 代码, 名称, 最新价, 涨跌幅, 涨跌额, 成交量, 成交额, 振幅, 最高, 最低, 今开, 昨收, 量比, etc.
        for _, row in df.iterrows():
            try:
                result.append({
                    "code": str(row.get("代码", "")),
                    "name": str(row.get("名称", "")),
                    "price": float(row.get("最新价", 0)),
                    "change": float(row.get("涨跌额", 0)),
                    "changePercent": float(row.get("涨跌幅", 0)),
                    "volume": int(row.get("成交量", 0)),
                    "amount": float(row.get("成交额", 0)),
                    "open": float(row.get("今开", 0)),
                    "high": float(row.get("最高", 0)),
                    "low": float(row.get("最低", 0)),
                    "close": float(row.get("昨收", 0)),
                    "market": "CN",
                    "industry": str(row.get("所属行业", "")) or None,
                })
            except (ValueError, TypeError):
                continue
        return result

    @staticmethod
    async def get_hk_realtime() -> List[Dict]:
        """获取港股实时行情"""
        try:
            loop = asyncio.get_event_loop()
            df = await loop.run_in_executor(
                None,
                lambda: ak.stock_hk_spot_em()
            )
            return DataCollector._format_hk_share(df)
        except Exception as e:
            print(f"获取港股行情失败: {e}")
            return []

    @staticmethod
    def _format_hk_share(df: pd.DataFrame) -> List[Dict]:
        """格式化港股数据"""
        if df is None or df.empty:
            return []

        result = []
        for _, row in df.iterrows():
            try:
                result.append({
                    "code": str(row.get("代码", "")),
                    "name": str(row.get("名称", "")),
                    "price": float(row.get("最新价", 0)),
                    "change": float(row.get("涨跌额", 0)),
                    "changePercent": float(row.get("涨跌幅", 0)),
                    "volume": int(row.get("成交量", 0)),
                    "amount": float(row.get("成交额", 0)),
                    "open": float(row.get("今开", 0)),
                    "high": float(row.get("最高", 0)),
                    "low": float(row.get("最低", 0)),
                    "close": float(row.get("昨收", 0)),
                    "market": "HK",
                    "industry": str(row.get("所属行业", "")) or None,
                })
            except (ValueError, TypeError):
                continue
        return result

    @staticmethod
    async def get_us_realtime() -> List[Dict]:
        """获取美股实时行情"""
        try:
            loop = asyncio.get_event_loop()
            df = await loop.run_in_executor(
                None,
                lambda: ak.stock_us_spot_em()
            )
            return DataCollector._format_us_share(df)
        except Exception as e:
            print(f"获取美股行情失败: {e}")
            return []

    @staticmethod
    def _format_us_share(df: pd.DataFrame) -> List[Dict]:
        """格式化美股数据"""
        if df is None or df.empty:
            return []

        result = []
        for _, row in df.iterrows():
            try:
                result.append({
                    "code": str(row.get("代码", "")),
                    "name": str(row.get("名称", "")),
                    "price": float(row.get("最新价", 0)),
                    "change": float(row.get("涨跌额", 0)),
                    "changePercent": float(row.get("涨跌幅", 0)),
                    "volume": int(row.get("成交量", 0)),
                    "amount": float(row.get("成交额", 0)),
                    "open": float(row.get("今开", 0)),
                    "high": float(row.get("最高", 0)),
                    "low": float(row.get("最低", 0)),
                    "close": float(row.get("昨收", 0)),
                    "market": "US",
                    "industry": str(row.get("所属行业", "")) or None,
                })
            except (ValueError, TypeError):
                continue
        return result

    @staticmethod
    async def get_kline(code: str, period: str = "daily", days: int = 365) -> List[Dict]:
        """
        获取K线数据
        period: daily/weekly/monthly
        """
        try:
            loop = asyncio.get_event_loop()
            end_date = datetime.now().strftime("%Y%m%d")
            start_date = (datetime.now() - timedelta(days=days)).strftime("%Y%m%d")

            # A股
            if code.startswith(("0", "3", "6")) and len(code) == 6:
                df = await loop.run_in_executor(
                    None,
                    lambda: ak.stock_zh_a_hist(
                        symbol=code,
                        period=period,
                        start_date=start_date,
                        end_date=end_date,
                        adjust="qfq"
                    )
                )
            # 港股
            elif len(code) == 5:
                df = await loop.run_in_executor(
                    None,
                    lambda: ak.stock_hk_hist(
                        symbol=code,
                        period=period,
                        start_date=start_date,
                        end_date=end_date,
                        adjust="qfq"
                    )
                )
            # 美股
            else:
                df = await loop.run_in_executor(
                    None,
                    lambda: ak.stock_us_hist(
                        symbol=code,
                        period=period,
                        start_date=start_date,
                        end_date=end_date,
                        adjust="qfq"
                    )
                )

            return DataCollector._format_kline(df)
        except Exception as e:
            print(f"获取K线数据失败 {code}: {e}")
            return []

    @staticmethod
    def _format_kline(df: pd.DataFrame) -> List[Dict]:
        """格式化K线数据"""
        if df is None or df.empty:
            return []

        result = []
        for _, row in df.iterrows():
            try:
                date_str = str(row.get("日期", ""))
                if not date_str:
                    continue
                dt = pd.to_datetime(date_str)
                result.append({
                    "timestamp": int(dt.timestamp() * 1000),
                    "open": float(row.get("开盘", 0)),
                    "high": float(row.get("最高", 0)),
                    "low": float(row.get("最低", 0)),
                    "close": float(row.get("收盘", 0)),
                    "volume": int(row.get("成交量", 0)),
                })
            except (ValueError, TypeError):
                continue
        return result


data_collector = DataCollector()
