"""
行情API
"""
from fastapi import APIRouter, Query, HTTPException
from typing import Optional
from app.services.market_service import market_service
from app.schemas.stock import StockListResponse, KLineResponse

router = APIRouter()


@router.get("/list", response_model=StockListResponse)
async def get_market_list(
    market: str = Query(..., pattern="^(CN|HK|US)$", description="市场类型"),
):
    """获取市场行情列表"""
    stocks = await market_service.get_market_list(market)
    return StockListResponse(
        market=market,
        total=len(stocks),
        stocks=stocks,
    )


@router.get("/stock/{code}")
async def get_stock_quote(code: str):
    """获取个股实时行情"""
    stock = await market_service.get_stock_quote(code)
    if not stock:
        raise HTTPException(status_code=404, detail="股票不存在")
    return stock


@router.get("/stock/{code}/kline", response_model=KLineResponse)
async def get_kline(
    code: str,
    period: str = Query("daily", pattern="^(daily|weekly|monthly)$"),
    days: int = Query(365, ge=1, le=2000),
):
    """获取K线数据"""
    data = await market_service.get_kline(code, period, days)
    return KLineResponse(code=code, period=period, data=data)
