import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useMarketStore } from '@/stores';
import KLineChart from '@/components/KLineChart';
import TradePanel from '@/components/TradePanel';
import { ArrowLeft, Star, Share2, TrendingUp, TrendingDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function StockDetailPage() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const { stocks, selectedStock, setSelectedStock } = useMarketStore();
  const [period, setPeriod] = useState<'1d' | '1w' | '1m'>('1d');

  // 模拟K线数据
  const klineData = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    const basePrice = 12 + Math.random() * 2;
    const change = (Math.random() - 0.5) * 0.5;
    return {
      timestamp: date.getTime(),
      open: basePrice,
      high: basePrice + Math.random() * 0.3,
      low: basePrice - Math.random() * 0.3,
      close: basePrice + change,
      volume: Math.floor(Math.random() * 10000000),
    };
  });

  useEffect(() => {
    if (code) {
      const stock = stocks.find((s) => s.code === code);
      if (stock) {
        setSelectedStock(stock);
      }
    }
  }, [code, stocks, setSelectedStock]);

  // 模拟选中股票
  const stock = selectedStock || {
    code: code || '000001',
    name: '平安银行',
    price: 12.35,
    change: 0.23,
    changePercent: 1.90,
    volume: 45230000,
    amount: 556800000,
    open: 12.12,
    high: 12.45,
    low: 12.08,
    close: 12.12,
    market: 'CN' as const,
  };

  const getChangeColor = (change: number) => {
    if (change > 0) return 'text-gain';
    if (change < 0) return 'text-loss';
    return 'text-neutral';
  };

  return (
    <div className="h-full flex flex-col">
      {/* 顶部栏 */}
      <header className="h-16 border-b border-border flex items-center px-6">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-lg hover:bg-surface transition-colors mr-4"
        >
          <ArrowLeft className="w-5 h-5 text-neutral" />
        </button>
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-lg font-semibold text-white">{stock.name}</h1>
            <span className="text-xs text-neutral font-mono">{stock.code}</span>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-lg hover:bg-surface text-neutral hover:text-accent transition-colors">
              <Star className="w-5 h-5" />
            </button>
            <button className="p-2 rounded-lg hover:bg-surface text-neutral hover:text-accent transition-colors">
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-auto p-6">
        <div className="grid grid-cols-4 gap-6">
          {/* 左侧K线图 */}
          <div className="col-span-3 space-y-6">
            {/* 价格概览 */}
            <div className="bg-surface rounded-xl p-4 border border-border">
              <div className="flex items-end gap-6">
                <div>
                  <div className="text-3xl font-mono text-white">
                    {stock.price.toFixed(2)}
                  </div>
                  <div className={`flex items-center gap-2 mt-1 ${getChangeColor(stock.change)}`}>
                    {stock.change >= 0 ? (
                      <TrendingUp className="w-4 h-4" />
                    ) : (
                      <TrendingDown className="w-4 h-4" />
                    )}
                    <span className="text-sm font-mono">
                      {stock.change >= 0 ? '+' : ''}
                      {stock.change.toFixed(2)} (
                      {stock.changePercent >= 0 ? '+' : ''}
                      {stock.changePercent.toFixed(2)}%)
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-8 text-xs">
                  <div>
                    <div className="text-neutral">开盘</div>
                    <div className="text-white font-mono mt-1">
                      {stock.open.toFixed(2)}
                    </div>
                  </div>
                  <div>
                    <div className="text-neutral">最高</div>
                    <div className="text-white font-mono mt-1">
                      {stock.high.toFixed(2)}
                    </div>
                  </div>
                  <div>
                    <div className="text-neutral">最低</div>
                    <div className="text-white font-mono mt-1">
                      {stock.low.toFixed(2)}
                    </div>
                  </div>
                  <div>
                    <div className="text-neutral">成交量</div>
                    <div className="text-white font-mono mt-1">
                      {(stock.volume / 1000000).toFixed(2)}M
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* K线图 */}
            <div className="bg-surface rounded-xl p-4 border border-border">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-medium text-white">K线走势</h3>
                <div className="flex gap-2">
                  {(['1d', '1w', '1m'] as const).map((p) => (
                    <button
                      key={p}
                      onClick={() => setPeriod(p)}
                      className={`px-3 py-1.5 rounded text-xs transition-colors ${
                        period === p
                          ? 'bg-accent text-primary'
                          : 'bg-surface-hover text-neutral hover:text-white'
                      }`}
                    >
                      {p === '1d' ? '日K' : p === '1w' ? '周K' : '月K'}
                    </button>
                  ))}
                </div>
              </div>
              <div className="h-[400px]">
                <KLineChart data={klineData} symbol={stock.name} />
              </div>
            </div>

            {/* 基本面 */}
            <div className="bg-surface rounded-xl p-4 border border-border">
              <h3 className="text-sm font-medium text-white mb-4">公司概况</h3>
              <div className="grid grid-cols-3 gap-6 text-xs">
                <div>
                  <div className="text-neutral">所属行业</div>
                  <div className="text-white mt-1">银行</div>
                </div>
                <div>
                  <div className="text-neutral">总市值</div>
                  <div className="text-white mt-1">1892.56亿</div>
                </div>
                <div>
                  <div className="text-neutral">流通市值</div>
                  <div className="text-white mt-1">1892.56亿</div>
                </div>
                <div>
                  <div className="text-neutral">市盈率(TTM)</div>
                  <div className="text-white mt-1">5.82</div>
                </div>
                <div>
                  <div className="text-neutral">市净率</div>
                  <div className="text-white mt-1">0.68</div>
                </div>
                <div>
                  <div className="text-neutral">换手率</div>
                  <div className="text-white mt-1">1.25%</div>
                </div>
              </div>
            </div>
          </div>

          {/* 右侧交易面板 */}
          <div className="col-span-1">
            <div className="sticky top-6">
              <TradePanel stock={stock} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
