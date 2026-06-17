"""
回测引擎 - 简化版量化策略回测
"""
from datetime import datetime
from typing import List, Dict, Any
import numpy as np
import pandas as pd
from app.services.data_collector import data_collector


class BacktestEngine:
    """回测引擎"""

    def __init__(
        self,
        stock_code: str,
        start_date: str,
        end_date: str,
        initial_capital: float = 1000000,
        commission_rate: float = 0.0003,
    ):
        self.stock_code = stock_code
        self.start_date = start_date
        self.end_date = end_date
        self.initial_capital = initial_capital
        self.commission_rate = commission_rate
        self.data: List[Dict] = []
        self.trades: List[Dict] = []
        self.equity_curve: List[Dict] = []

    async def load_data(self):
        """加载历史数据"""
        days = (
            datetime.strptime(self.end_date, "%Y-%m-%d")
            - datetime.strptime(self.start_date, "%Y-%m-%d")
        ).days + 30
        self.data = await data_collector.get_kline(self.stock_code, "daily", days)

        # 过滤日期范围
        start_ts = int(datetime.strptime(self.start_date, "%Y-%m-%d").timestamp() * 1000)
        end_ts = int(datetime.strptime(self.end_date, "%Y-%m-%d").timestamp() * 1000)
        self.data = [d for d in self.data if start_ts <= d["timestamp"] <= end_ts]

    def run_dual_ma_strategy(self, short_window: int = 5, long_window: int = 20):
        """双均线策略"""
        if len(self.data) < long_window:
            return self._empty_result()

        closes = np.array([d["close"] for d in self.data])
        timestamps = [d["timestamp"] for d in self.data]

        # 计算均线
        short_ma = pd.Series(closes).rolling(window=short_window).mean().values
        long_ma = pd.Series(closes).rolling(window=long_window).mean().values

        cash = self.initial_capital
        position = 0
        equity_curve = []
        trades = []

        for i in range(long_window, len(self.data)):
            price = self.data[i]["close"]
            ts = timestamps[i]

            # 计算当前总资产
            total_value = cash + position * price
            equity_curve.append({"timestamp": ts, "value": total_value})

            # 金叉买入
            if short_ma[i] > long_ma[i] and short_ma[i - 1] <= long_ma[i - 1] and position == 0:
                # 计算可买数量
                buy_amount = cash * 0.95  # 留5%作为缓冲
                qty = int(buy_amount / (price * (1 + self.commission_rate)) / 100) * 100
                if qty > 0:
                    cost = qty * price
                    fee = cost * self.commission_rate
                    cash -= cost + fee
                    position = qty
                    trades.append({
                        "timestamp": ts,
                        "direction": "buy",
                        "price": price,
                        "quantity": qty,
                        "amount": cost + fee,
                    })

            # 死叉卖出
            elif short_ma[i] < long_ma[i] and short_ma[i - 1] >= long_ma[i - 1] and position > 0:
                revenue = position * price
                fee = revenue * self.commission_rate
                cash += revenue - fee
                trades.append({
                    "timestamp": ts,
                    "direction": "sell",
                    "price": price,
                    "quantity": position,
                    "amount": revenue - fee,
                })
                position = 0

        # 最后一根K线平仓
        if position > 0:
            final_price = self.data[-1]["close"]
            revenue = position * final_price
            fee = revenue * self.commission_rate
            cash += revenue - fee
            trades.append({
                "timestamp": timestamps[-1],
                "direction": "sell",
                "price": final_price,
                "quantity": position,
                "amount": revenue - fee,
            })
            equity_curve.append({"timestamp": timestamps[-1], "value": cash})

        # 如果没有任何交易，补充最后一个权益点
        if not equity_curve:
            for d in self.data[long_window:]:
                equity_curve.append({"timestamp": d["timestamp"], "value": self.initial_capital})

        return self._calculate_metrics(equity_curve, trades)

    def run_rsi_strategy(self, period: int = 14, oversold: int = 30, overbought: int = 70):
        """RSI策略"""
        if len(self.data) < period + 1:
            return self._empty_result()

        closes = np.array([d["close"] for d in self.data])
        timestamps = [d["timestamp"] for d in self.data]

        # 计算RSI
        deltas = np.diff(closes)
        gains = np.where(deltas > 0, deltas, 0)
        losses = np.where(deltas < 0, -deltas, 0)

        rsi_values = [50.0]  # 初始值
        for i in range(period, len(deltas)):
            avg_gain = np.mean(gains[i - period + 1:i + 1])
            avg_loss = np.mean(losses[i - period + 1:i + 1])
            if avg_loss == 0:
                rsi = 100
            else:
                rs = avg_gain / avg_loss
                rsi = 100 - (100 / (1 + rs))
            rsi_values.append(rsi)

        cash = self.initial_capital
        position = 0
        equity_curve = []
        trades = []

        for i in range(period, len(self.data)):
            price = self.data[i]["close"]
            ts = timestamps[i]
            rsi = rsi_values[i - period]

            total_value = cash + position * price
            equity_curve.append({"timestamp": ts, "value": total_value})

            # 超卖买入
            if rsi < oversold and position == 0:
                buy_amount = cash * 0.95
                qty = int(buy_amount / (price * (1 + self.commission_rate)) / 100) * 100
                if qty > 0:
                    cost = qty * price
                    fee = cost * self.commission_rate
                    cash -= cost + fee
                    position = qty
                    trades.append({
                        "timestamp": ts,
                        "direction": "buy",
                        "price": price,
                        "quantity": qty,
                        "amount": cost + fee,
                    })

            # 超买卖出
            elif rsi > overbought and position > 0:
                revenue = position * price
                fee = revenue * self.commission_rate
                cash += revenue - fee
                trades.append({
                    "timestamp": ts,
                    "direction": "sell",
                    "price": price,
                    "quantity": position,
                    "amount": revenue - fee,
                })
                position = 0

        if position > 0:
            final_price = self.data[-1]["close"]
            revenue = position * final_price
            fee = revenue * self.commission_rate
            cash += revenue - fee
            trades.append({
                "timestamp": timestamps[-1],
                "direction": "sell",
                "price": final_price,
                "quantity": position,
                "amount": revenue - fee,
            })
            equity_curve.append({"timestamp": timestamps[-1], "value": cash})

        if not equity_curve:
            for d in self.data[period:]:
                equity_curve.append({"timestamp": d["timestamp"], "value": self.initial_capital})

        return self._calculate_metrics(equity_curve, trades)

    def _calculate_metrics(self, equity_curve: List[Dict], trades: List[Dict]) -> Dict:
        """计算回测指标"""
        if not equity_curve:
            return self._empty_result()

        values = np.array([e["value"] for e in equity_curve])
        initial = self.initial_capital
        final = values[-1]

        # 总收益率
        total_return = (final - initial) / initial * 100

        # 年化收益率
        days = (equity_curve[-1]["timestamp"] - equity_curve[0]["timestamp"]) / (1000 * 60 * 60 * 24)
        if days > 0:
            annual_return = ((final / initial) ** (365 / days) - 1) * 100
        else:
            annual_return = total_return

        # 最大回撤
        peak = values[0]
        max_drawdown = 0
        for v in values:
            if v > peak:
                peak = v
            drawdown = (peak - v) / peak * 100
            if drawdown > max_drawdown:
                max_drawdown = drawdown

        # 夏普比率（简化版：假设无风险利率3%）
        if len(values) > 1:
            daily_returns = np.diff(values) / values[:-1]
            if len(daily_returns) > 0 and np.std(daily_returns) > 0:
                sharpe = (np.mean(daily_returns) * 252 - 0.03) / (np.std(daily_returns) * np.sqrt(252))
            else:
                sharpe = 0
        else:
            sharpe = 0

        # 胜率
        win_count = 0
        total_trades = 0
        for i in range(0, len(trades) - 1, 2):
            if i + 1 < len(trades):
                buy = trades[i]
                sell = trades[i + 1]
                if buy["direction"] == "buy" and sell["direction"] == "sell":
                    total_trades += 1
                    if sell["price"] > buy["price"]:
                        win_count += 1
        win_rate = (win_count / total_trades * 100) if total_trades > 0 else 0

        return {
            "metrics": {
                "total_return": round(total_return, 2),
                "annual_return": round(annual_return, 2),
                "max_drawdown": round(-max_drawdown, 2),
                "sharpe_ratio": round(sharpe, 2),
                "win_rate": round(win_rate, 2),
            },
            "equity_curve": equity_curve,
            "trades": trades,
        }

    def _empty_result(self) -> Dict:
        """空结果"""
        return {
            "metrics": {
                "total_return": 0.0,
                "annual_return": 0.0,
                "max_drawdown": 0.0,
                "sharpe_ratio": 0.0,
                "win_rate": 0.0,
            },
            "equity_curve": [
                {"timestamp": d["timestamp"], "value": self.initial_capital}
                for d in self.data
            ] if self.data else [],
            "trades": [],
        }

    async def run(self, strategy_type: str = "dual_ma", params: Dict = None) -> Dict:
        """执行回测"""
        await self.load_data()

        if not self.data:
            return self._empty_result()

        if strategy_type == "dual_ma":
            return self.run_dual_ma_strategy(**(params or {}))
        elif strategy_type == "rsi":
            return self.run_rsi_strategy(**(params or {}))
        else:
            return self.run_dual_ma_strategy()
