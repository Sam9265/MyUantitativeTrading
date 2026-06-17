"""
回测API
"""
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from app.core.database import get_db
from app.core.config import settings
from app.models.backtest import Backtest
from app.schemas.backtest import BacktestCreate, BacktestResponse
from app.services.backtest_engine import BacktestEngine

router = APIRouter()


async def run_backtest_task(backtest_id: str, request: BacktestCreate, db_url: str):
    """异步执行回测任务"""
    from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker

    engine = create_async_engine(db_url)
    SessionLocal = async_sessionmaker(engine, expire_on_commit=False)

    async with SessionLocal() as session:
        backtest = None
        try:
            result = await session.execute(
                select(Backtest).where(Backtest.id == backtest_id)
            )
            backtest = result.scalar_one_or_none()
            if not backtest:
                return

            # 创建回测引擎
            engine_obj = BacktestEngine(
                stock_code=backtest.stock_code,
                start_date=str(backtest.start_date),
                end_date=str(backtest.end_date),
                initial_capital=float(backtest.initial_capital),
                commission_rate=float(backtest.commission_rate),
            )

            # 执行回测
            strategy_type = request.strategy_code or "dual_ma"
            result_data = await engine_obj.run(strategy_type)

            backtest.result = result_data
            backtest.status = "completed"
            await session.commit()
        except Exception as e:
            if backtest:
                backtest.status = "failed"
                backtest.error = str(e)
                await session.commit()
        finally:
            await engine.dispose()


@router.post("/", response_model=BacktestResponse)
async def create_backtest(
    data: BacktestCreate,
    background_tasks: BackgroundTasks,
    user_id: str = "demo-user",
    db: AsyncSession = Depends(get_db),
):
    """创建回测任务"""
    backtest = Backtest(
        user_id=user_id,
        strategy_id=data.strategy_id,
        stock_code=data.stock_code,
        start_date=data.start_date,
        end_date=data.end_date,
        initial_capital=data.initial_capital,
        commission_rate=data.commission_rate,
        status="running",
    )
    db.add(backtest)
    await db.commit()
    await db.refresh(backtest)

    # 异步执行回测
    background_tasks.add_task(
        run_backtest_task,
        str(backtest.id),
        data,
        settings.database_url,
    )

    return backtest


@router.get("/{backtest_id}", response_model=BacktestResponse)
async def get_backtest(
    backtest_id: str,
    user_id: str = "demo-user",
    db: AsyncSession = Depends(get_db),
):
    """获取回测结果"""
    result = await db.execute(
        select(Backtest).where(
            Backtest.id == backtest_id,
            Backtest.user_id == user_id,
        )
    )
    backtest = result.scalar_one_or_none()
    if not backtest:
        raise HTTPException(status_code=404, detail="回测记录不存在")
    return backtest


@router.get("/", response_model=List[BacktestResponse])
async def get_backtests(
    user_id: str = "demo-user",
    db: AsyncSession = Depends(get_db),
):
    """获取回测列表"""
    result = await db.execute(
        select(Backtest).where(Backtest.user_id == user_id).order_by(Backtest.created_at.desc())
    )
    return result.scalars().all()
