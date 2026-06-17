import { useState } from 'react';
import { useTradeStore } from '@/stores';
import TradePanel from '@/components/TradePanel';
import {
  Wallet,
  Clock,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';

export default function TradePage() {
  const [activeTab, setActiveTab] = useState<'positions' | 'orders'>('positions');
  const { account, orders, positions } = useTradeStore();

  const getChangeColor = (change: number) => {
    if (change > 0) return 'text-gain';
    if (change < 0) return 'text-loss';
    return 'text-neutral';
  };

  const formatNumber = (num: number, decimals = 2) => {
    return num.toFixed(decimals);
  };

  return (
    <div className="h-full flex flex-col">
      {/* 顶部栏 */}
      <header className="h-16 border-b border-border flex items-center px-6">
        <h1 className="text-lg font-semibold text-white">模拟交易</h1>
      </header>

      <div className="flex-1 overflow-auto p-6">
        <div className="grid grid-cols-4 gap-6">
          {/* 账户概览 */}
          <div className="col-span-1 space-y-6">
            {/* 账户资产 */}
            <div className="bg-surface rounded-xl p-4 border border-border">
              <div className="flex items-center gap-2 mb-4">
                <Wallet className="w-5 h-5 text-accent" />
                <h3 className="text-sm font-medium text-white">账户资产</h3>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-neutral">总资产</span>
                  <span className="text-lg font-mono text-white">
                    ¥{formatNumber(account.totalAssets)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-neutral">可用资金</span>
                  <span className="text-sm font-mono text-white">
                    ¥{formatNumber(account.cash)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-neutral">持仓市值</span>
                  <span className="text-sm font-mono text-white">
                    ¥{formatNumber(
                      account.positions.reduce(
                        (sum, p) => sum + p.marketValue,
                        0
                      )
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* 交易面板 */}
            <TradePanel />

            {/* 快速下单 */}
            <div className="bg-surface rounded-xl p-4 border border-border">
              <h3 className="text-sm font-medium text-white mb-3">闪电下单</h3>
              <div className="text-xs text-neutral">
                输入股票代码后可直接下单
              </div>
            </div>
          </div>

          {/* 持仓和订单 */}
          <div className="col-span-3 space-y-6">
            {/* Tab切换 */}
            <div className="bg-surface rounded-xl border border-border">
              <div className="flex border-b border-border">
                <button
                  onClick={() => setActiveTab('positions')}
                  className={`flex-1 py-3 text-sm font-medium transition-colors ${
                    activeTab === 'positions'
                      ? 'text-accent border-b-2 border-accent'
                      : 'text-neutral hover:text-white'
                  }`}
                >
                  持仓 ({positions.length})
                </button>
                <button
                  onClick={() => setActiveTab('orders')}
                  className={`flex-1 py-3 text-sm font-medium transition-colors ${
                    activeTab === 'orders'
                      ? 'text-accent border-b-2 border-accent'
                      : 'text-neutral hover:text-white'
                  }`}
                >
                  订单 ({orders.length})
                </button>
              </div>

              <div className="p-4">
                {activeTab === 'positions' ? (
                  // 持仓列表
                  positions.length > 0 ? (
                    <div className="space-y-3">
                      {positions.map((position) => (
                        <div
                          key={position.code}
                          className="bg-primary-light rounded-lg p-4"
                        >
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <div className="text-sm font-medium text-white">
                                {position.name}
                              </div>
                              <div className="text-xs text-neutral font-mono">
                                {position.code}
                              </div>
                            </div>
                            <span
                              className={`text-sm font-mono ${
                                position.profitLoss >= 0
                                  ? 'text-gain'
                                  : 'text-loss'
                              }`}
                            >
                              {position.profitLoss >= 0 ? '+' : ''}
                              {formatNumber(position.profitLoss)}
                            </span>
                          </div>
                          <div className="grid grid-cols-4 gap-4 text-xs">
                            <div>
                              <div className="text-neutral">持仓</div>
                              <div className="text-white font-mono">
                                {position.quantity}
                              </div>
                            </div>
                            <div>
                              <div className="text-neutral">成本价</div>
                              <div className="text-white font-mono">
                                {formatNumber(position.avgCost)}
                              </div>
                            </div>
                            <div>
                              <div className="text-neutral">现价</div>
                              <div className="text-white font-mono">
                                {formatNumber(position.currentPrice)}
                              </div>
                            </div>
                            <div>
                              <div className="text-neutral">盈亏%</div>
                              <div
                                className={`font-mono ${
                                  position.profitLossPercent >= 0
                                    ? 'text-gain'
                                    : 'text-loss'
                                }`}
                              >
                                {position.profitLossPercent >= 0 ? '+' : ''}
                                {formatNumber(position.profitLossPercent)}%
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-neutral">
                      <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-30" />
                      <p>暂无持仓</p>
                      <p className="text-xs mt-1">
                        在行情页面选择股票进行交易
                      </p>
                    </div>
                  )
                ) : // 订单列表
                orders.length > 0 ? (
                  <div className="space-y-3">
                    {orders.map((order) => (
                      <div
                        key={order.id}
                        className="bg-primary-light rounded-lg p-4"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2 py-0.5 rounded text-xs font-medium ${
                                order.direction === 'buy'
                                  ? 'bg-gain-bg text-gain'
                                  : 'bg-loss-bg text-loss'
                              }`}
                            >
                              {order.direction === 'buy' ? '买入' : '卖出'}
                            </span>
                            <span className="text-sm font-medium text-white">
                              {order.name}
                            </span>
                            <span className="text-xs text-neutral font-mono">
                              {order.code}
                            </span>
                          </div>
                          <span
                            className={`px-2 py-0.5 rounded text-xs ${
                              order.status === 'filled'
                                ? 'bg-gain-bg text-gain'
                                : order.status === 'pending'
                                ? 'bg-accent/10 text-accent'
                                : 'bg-neutral/10 text-neutral'
                            }`}
                          >
                            {order.status === 'filled'
                              ? '已成交'
                              : order.status === 'pending'
                              ? '待成交'
                              : '已撤销'}
                          </span>
                        </div>
                        <div className="flex justify-between text-xs text-neutral">
                          <span>
                            {order.type === 'market' ? '市价' : '限价'} •{' '}
                            {order.quantity}股 • ¥{formatNumber(order.price)}
                          </span>
                          <span>{order.createdAt}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-neutral">
                    <Clock className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>暂无订单</p>
                    <p className="text-xs mt-1">下 单后将在此显示</p>
                  </div>
                )}
              </div>
            </div>

            {/* 历史成交 */}
            <div className="bg-surface rounded-xl border border-border">
              <div className="p-4 border-b border-border">
                <h3 className="text-sm font-medium text-white">最近成交</h3>
              </div>
              <div className="p-4">
                <div className="text-center py-8 text-neutral">
                  <ArrowUpRight className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p className="text-xs">暂无成交记录</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
