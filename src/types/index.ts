// 市场类型
export type Market = 'CN' | 'HK' | 'US';

// 股票信息
export interface Stock {
  code: string;        // 股票代码
  name: string;        // 股票名称
  price: number;       // 当前价格
  change: number;      // 涨跌额
  changePercent: number; // 涨跌幅%
  volume: number;      // 成交量
  amount: number;      // 成交额
  open: number;        // 开盘价
  high: number;        // 最高价
  low: number;         // 最低价
  close: number;       // 昨收价
  market: Market;      // 市场
  industry?: string;   // 所属行业
}

// K线数据
export interface KLineData {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

// K线周期
export type KLinePeriod = '1d' | '1w' | '1m';

// 策略
export interface Strategy {
  id: string;
  name: string;
  code: string;
  description: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

// 回测请求
export interface BacktestRequest {
  strategyId: string;
  stockCode: string;
  startDate: string;
  endDate: string;
  initialCapital: number;
  commissionRate: number;
}

// 回测状态
export type BacktestStatus = 'running' | 'completed' | 'failed';

// 回测指标
export interface BacktestMetrics {
  totalReturn: number;      // 总收益率
  annualReturn: number;     // 年化收益率
  maxDrawdown: number;      // 最大回撤
  sharpeRatio: number;      // 夏普比率
  winRate: number;          // 胜率
}

// 交易记录
export interface TradeRecord {
  timestamp: number;
  direction: 'buy' | 'sell';
  price: number;
  quantity: number;
  amount: number;
}

// 回测结果
export interface BacktestResult {
  id: string;
  status: BacktestStatus;
  metrics: BacktestMetrics;
  equityCurve: Array<{ timestamp: number; value: number }>;
  trades: TradeRecord[];
}

// 订单方向
export type OrderDirection = 'buy' | 'sell';

// 订单类型
export type OrderType = 'market' | 'limit';

// 订单状态
export type OrderStatus = 'pending' | 'filled' | 'cancelled' | 'rejected';

// 订单
export interface Order {
  id: string;
  code: string;
  name: string;
  direction: OrderDirection;
  type: OrderType;
  price: number;
  quantity: number;
  status: OrderStatus;
  filledPrice?: number;
  filledQuantity?: number;
  createdAt: string;
}

// 持仓
export interface Position {
  code: string;
  name: string;
  quantity: number;
  avgCost: number;        // 平均成本
  currentPrice: number;  // 当前价
  marketValue: number;   // 市值
  profitLoss: number;    // 盈亏
  profitLossPercent: number; // 盈亏%
}

// 模拟交易账户
export interface SimulatedAccount {
  cash: number;           // 可用资金
  totalAssets: number;    // 总资产
  positions: Position[];  // 持仓
}
