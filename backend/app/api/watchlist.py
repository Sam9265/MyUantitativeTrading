"""
自选股API
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from app.core.database import get_db
from app.models.watchlist import Watchlist
from app.schemas.watchlist import WatchlistCreate, WatchlistResponse

router = APIRouter()


@router.get("/", response_model=List[WatchlistResponse])
async def get_watchlist(
    user_id: str = "demo-user",  # TODO: 从token获取
    db: AsyncSession = Depends(get_db),
):
    """获取自选股列表"""
    result = await db.execute(
        select(Watchlist).where(Watchlist.user_id == user_id)
    )
    return result.scalars().all()


@router.post("/", response_model=WatchlistResponse)
async def add_to_watchlist(
    data: WatchlistCreate,
    user_id: str = "demo-user",  # TODO: 从token获取
    db: AsyncSession = Depends(get_db),
):
    """添加自选股"""
    # 检查是否已存在
    existing = await db.execute(
        select(Watchlist).where(
            Watchlist.user_id == user_id,
            Watchlist.stock_code == data.stock_code,
        )
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="已存在自选股")

    watchlist = Watchlist(
        user_id=user_id,
        stock_code=data.stock_code,
        stock_name=data.stock_name,
    )
    db.add(watchlist)
    await db.commit()
    await db.refresh(watchlist)
    return watchlist


@router.delete("/{code}")
async def remove_from_watchlist(
    code: str,
    user_id: str = "demo-user",  # TODO: 从token获取
    db: AsyncSession = Depends(get_db),
):
    """删除自选股"""
    result = await db.execute(
        select(Watchlist).where(
            Watchlist.user_id == user_id,
            Watchlist.stock_code == code,
        )
    )
    watchlist = result.scalar_one_or_none()
    if not watchlist:
        raise HTTPException(status_code=404, detail="自选股不存在")

    await db.delete(watchlist)
    await db.commit()
    return {"message": "删除成功"}
