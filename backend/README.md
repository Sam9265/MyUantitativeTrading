# QuantX 量化交易平台 - 后端

## 技术栈

- **框架**: FastAPI (Python 3.11)
- **数据库**: PostgreSQL 15 + TimescaleDB
- **缓存**: Redis 7
- **数据源**: akshare / tushare
- **ORM**: SQLAlchemy 2.0 (async)
- **认证**: JWT

## 项目结构

```
backend/
├── app/
│   ├── api/                # API路由
│   │   ├── auth.py         # 认证
│   │   ├── market.py       # 行情
│   │   ├── watchlist.py    # 自选股
│   │   ├── strategy.py     # 策略
│   │   ├── backtest.py     # 回测
│   │   └── trade.py        # 交易
│   ├── core/               # 核心配置
│   │   ├── config.py       # 配置
│   │   ├── database.py     # 数据库
│   │   └── redis_client.py # Redis
│   ├── models/             # 数据库模型
│   ├── schemas/            # Pydantic schemas
│   ├── services/           # 业务服务
│   │   ├── data_collector.py  # 数据采集
│   │   ├── market_service.py  # 行情服务
│   │   └── backtest_engine.py # 回测引擎
│   ├── broker/             # 券商适配器
│   │   ├── base.py         # 抽象基类（含Tiger/Futu框架）
│   │   └── simulated.py    # 模拟券商
│   └── main.py             # 主入口
├── scripts/
│   └── collect_data.py     # 数据采集脚本
├── migrations/
│   └── init.sql            # 数据库初始化
├── requirements.txt
└── Dockerfile
```

## 快速开始

### 使用 Docker (推荐)

```bash
# 启动PostgreSQL + Redis + Backend
docker-compose up -d

# 查看日志
docker-compose logs -f backend
```

### 本地开发

```bash
# 1. 安装依赖
cd backend
pip install -r requirements.txt

# 2. 启动PostgreSQL + TimescaleDB
docker run -d --name quantx-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=quantx \
  -p 5432:5432 \
  timescale/timescaledb:latest-pg15

# 3. 初始化数据库
psql -h localhost -U postgres -d quantx -f migrations/init.sql

# 4. 启动Redis
docker run -d --name quantx-redis -p 6379:6379 redis:7-alpine

# 5. 启动API
python -m app.main

# 或使用uvicorn
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## API文档

启动后访问: http://localhost:8000/docs

## 核心API

### 行情
- `GET /api/v1/market/list?market=CN|HK|US` - 市场行情列表
- `GET /api/v1/market/stock/{code}` - 个股行情
- `GET /api/v1/market/stock/{code}/kline?period=daily&days=365` - K线数据

### 自选股
- `GET /api/v1/watchlist/` - 自选股列表
- `POST /api/v1/watchlist/` - 添加自选
- `DELETE /api/v1/watchlist/{code}` - 删除自选

### 策略
- `GET /api/v1/strategy/` - 策略列表
- `POST /api/v1/strategy/` - 创建策略
- `PUT /api/v1/strategy/{id}` - 更新策略
- `DELETE /api/v1/strategy/{id}` - 删除策略

### 回测
- `POST /api/v1/backtest/` - 发起回测
- `GET /api/v1/backtest/{id}` - 查看回测结果
- `GET /api/v1/backtest/` - 回测列表

### 交易
- `POST /api/v1/trade/order` - 下单
- `DELETE /api/v1/trade/order/{id}` - 撤单
- `GET /api/v1/trade/orders` - 订单列表
- `GET /api/v1/trade/account` - 账户信息

## 实盘交易集成

在 [broker/base.py](app/broker/base.py) 中已预留 `TigerBrokersAdapter` 和 `FutuAdapter` 框架，需实现具体API对接逻辑。

切换到实盘时，修改 `app/api/trade.py` 中的 `simulated_broker` 实例化即可。

## 数据采集

```bash
# 手动采集数据
python scripts/collect_data.py
```

定时采集可通过APScheduler集成（待实现）。
