import { useState } from 'react';
import { useTradeStore, useMarketStore } from '@/stores';
import type { OrderDirection, OrderType, Stock } from '@/types';

interface TradePanelProps {
  stock?: Stock;
}

export default function TradePanel({ stock }: TradePanelProps) {
  const [direction, setDirection] = useState<OrderDirection>('buy');
  const [orderType, setOrderType] = useState<OrderType>('market');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');

  const { account, addOrder } = useTradeStore();
  const { selectedStock } = useMarketStore();

  const tradeStock = stock || selectedStock;

  const handleSubmit = () => {
    if (!tradeStock || !quantity) return;

    const orderPrice =
      orderType === 'limit' ? parseFloat(price) : tradeStock.price;
    const orderQuantity = parseInt(quantity);

    if (orderPrice <= 0 || orderQuantity <= 0) return;

    const order = {
      id: Date.now().toString(),
      code: tradeStock.code,
      name: tradeStock.name,
      direction,
      type: orderType,
      price: orderPrice,
      quantity: orderQuantity,
      status: 'pending' as const,
      createdAt: new Date().toISOString(),
    };

    addOrder(order);
    setQuantity('');
    setPrice('');
  };

  const estimatedAmount = (parseFloat(price) || tradeStock?.price || 0) *
    (parseInt(quantity) || 0);

  return (
    <div className="rounded-2xl bg-surface/80 backdrop-blur-xl border border-border/30 overflow-hidden shadow-xl">
      {/* 标题栏 */}
      <div className="px-5 py-4 border-b border-border/20">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-accent" />
          交易下单
        </h3>
      </div>

      <div className="p-5 space-y-5">
        {/* 交易方向 */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setDirection('buy')}
            className={`relative py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
              direction === 'buy'
                ? 'bg-gradient-to-r from-gain/20 to-gain/5 text-gain border border-gain/30'
                : 'bg-surface-hover text-neutral/70 hover:text-white'
            }`}
          >
            {direction === 'buy' && (
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-gain" />
            )}
            <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 2L14 8H2L8 2Z" />
            </svg>
            买入
          </button>
          <button
            onClick={() => setDirection('sell')}
            className={`relative py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
              direction === 'sell'
                ? 'bg-gradient-to-r from-loss/20 to-loss/5 text-loss border border-loss/30'
                : 'bg-surface-hover text-neutral/70 hover:text-white'
            }`}
          >
            {direction === 'sell' && (
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-loss" />
            )}
            <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 14L2 8H14L8 14Z" />
            </svg>
            卖出
          </button>
        </div>

        {/* 股票信息 */}
        {tradeStock && (
          <div className="bg-primary-light/50 rounded-xl p-4 border border-border/20">
            <div className="flex justify-between items-start mb-3">
              <div>
                <div className="text-white font-medium">{tradeStock.name}</div>
                <div className="text-xs text-neutral/60 font-mono">{tradeStock.code}</div>
              </div>
              <div className="text-right">
                <div className={`text-lg font-mono font-semibold ${
                  tradeStock.change >= 0 ? 'text-gain' : 'text-loss'
                }`}>
                  {tradeStock.price.toFixed(2)}
                </div>
                <div className={`text-xs ${
                  tradeStock.change >= 0 ? 'text-gain' : 'text-loss'
                }`}>
                  {tradeStock.change >= 0 ? '+' : ''}
                  {tradeStock.changePercent.toFixed(2)}%
                </div>
              </div>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-neutral/60">开盘 {tradeStock.open.toFixed(2)}</span>
              <span className="text-neutral/60">最高 {tradeStock.high.toFixed(2)}</span>
              <span className="text-neutral/60">最低 {tradeStock.low.toFixed(2)}</span>
            </div>
          </div>
        )}

        {/* 订单类型 */}
        <div>
          <label className="text-xs text-neutral/70 mb-2 block">订单类型</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setOrderType('market')}
              className={`py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                orderType === 'market'
                  ? 'bg-accent text-primary'
                  : 'bg-surface-hover text-neutral/70 hover:text-white'
              }`}
            >
              市价
            </button>
            <button
              onClick={() => setOrderType('limit')}
              className={`py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                orderType === 'limit'
                  ? 'bg-accent text-primary'
                  : 'bg-surface-hover text-neutral/70 hover:text-white'
              }`}
            >
              限价
            </button>
          </div>
        </div>

        {/* 价格输入 */}
        {orderType === 'limit' && (
          <div>
            <label className="text-xs text-neutral/70 mb-2 block">委托价格</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="请输入价格"
              className="w-full bg-primary-light/50 border border-border/30 rounded-xl px-4 py-3 text-sm text-white placeholder-neutral/50 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all duration-200"
            />
          </div>
        )}

        {/* 数量输入 */}
        <div>
          <label className="text-xs text-neutral/70 mb-2 block">委托数量</label>
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="请输入数量"
            className="w-full bg-primary-light/50 border border-border/30 rounded-xl px-4 py-3 text-sm text-white placeholder-neutral/50 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all duration-200"
          />
          <div className="flex gap-2 mt-2">
            {[100, 500, 1000, 5000].map((qty) => (
              <button
                key={qty}
                onClick={() => setQuantity(qty.toString())}
                className="flex-1 py-2 bg-surface-hover/50 rounded-lg text-xs font-medium text-neutral/70 hover:text-white hover:bg-surface-hover transition-all duration-200"
              >
                {qty}
              </button>
            ))}
          </div>
        </div>

        {/* 预估金额 */}
        {estimatedAmount > 0 && (
          <div className="bg-primary-light/30 rounded-xl p-4 border border-border/20">
            <div className="flex justify-between items-center">
              <span className="text-sm text-neutral/70">预估金额</span>
              <span className="text-lg font-mono font-semibold text-white">
                ¥{estimatedAmount.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        )}

        {/* 账户余额 */}
        <div className="bg-gradient-to-r from-accent/5 to-transparent rounded-xl p-4 border border-accent/20">
          <div className="flex justify-between items-center">
            <span className="text-sm text-neutral/70">可用资金</span>
            <span className="text-lg font-mono font-semibold text-accent">
              ¥{account.cash.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* 提交按钮 */}
        <button
          onClick={handleSubmit}
          disabled={!tradeStock || !quantity}
          className={`w-full py-4 rounded-xl text-sm font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
            direction === 'buy'
              ? 'bg-gradient-to-r from-gain to-gain-light text-white shadow-lg shadow-gain/20 hover:shadow-gain/30'
              : 'bg-gradient-to-r from-loss to-loss-light text-white shadow-lg shadow-loss/20 hover:shadow-loss/30'
          }`}
        >
          {direction === 'buy' ? '确认买入' : '确认卖出'}
          {tradeStock && (
            <span className="ml-2 text-opacity-70">
              {tradeStock.name}
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
