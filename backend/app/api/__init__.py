"""
API路由
"""
from fastapi import APIRouter
from app.api import market, watchlist, strategy, backtest, trade, auth

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["认证"])
api_router.include_router(market.router, prefix="/market", tags=["行情"])
api_router.include_router(watchlist.router, prefix="/watchlist", tags=["自选股"])
api_router.include_router(strategy.router, prefix="/strategy", tags=["策略"])
api_router.include_router(backtest.router, prefix="/backtest", tags=["回测"])
api_router.include_router(trade.router, prefix="/trade", tags=["交易"])
