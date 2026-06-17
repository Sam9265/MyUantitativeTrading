"""
策略API
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from app.core.database import get_db
from app.models.strategy import Strategy
from app.schemas.strategy import StrategyCreate, StrategyUpdate, StrategyResponse

router = APIRouter()


@router.get("/", response_model=List[StrategyResponse])
async def get_strategies(
    user_id: str = "demo-user",
    db: AsyncSession = Depends(get_db),
):
    """获取策略列表"""
    result = await db.execute(
        select(Strategy).where(Strategy.user_id == user_id)
    )
    return result.scalars().all()


@router.post("/", response_model=StrategyResponse)
async def create_strategy(
    data: StrategyCreate,
    user_id: str = "demo-user",
    db: AsyncSession = Depends(get_db),
):
    """创建策略"""
    strategy = Strategy(
        user_id=user_id,
        name=data.name,
        code=data.code,
        description=data.description,
        is_public=data.is_public,
    )
    db.add(strategy)
    await db.commit()
    await db.refresh(strategy)
    return strategy


@router.put("/{strategy_id}", response_model=StrategyResponse)
async def update_strategy(
    strategy_id: str,
    data: StrategyUpdate,
    user_id: str = "demo-user",
    db: AsyncSession = Depends(get_db),
):
    """更新策略"""
    result = await db.execute(
        select(Strategy).where(
            Strategy.id == strategy_id,
            Strategy.user_id == user_id,
        )
    )
    strategy = result.scalar_one_or_none()
    if not strategy:
        raise HTTPException(status_code=404, detail="策略不存在")

    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(strategy, field, value)

    await db.commit()
    await db.refresh(strategy)
    return strategy


@router.delete("/{strategy_id}")
async def delete_strategy(
    strategy_id: str,
    user_id: str = "demo-user",
    db: AsyncSession = Depends(get_db),
):
    """删除策略"""
    result = await db.execute(
        select(Strategy).where(
            Strategy.id == strategy_id,
            Strategy.user_id == user_id,
        )
    )
    strategy = result.scalar_one_or_none()
    if not strategy:
        raise HTTPException(status_code=404, detail="策略不存在")

    await db.delete(strategy)
    await db.commit()
    return {"message": "删除成功"}


@router.get("/{strategy_id}", response_model=StrategyResponse)
async def get_strategy(
    strategy_id: str,
    user_id: str = "demo-user",
    db: AsyncSession = Depends(get_db),
):
    """获取策略详情"""
    result = await db.execute(
        select(Strategy).where(
            Strategy.id == strategy_id,
            Strategy.user_id == user_id,
        )
    )
    strategy = result.scalar_one_or_none()
    if not strategy:
        raise HTTPException(status_code=404, detail="策略不存在")
    return strategy
