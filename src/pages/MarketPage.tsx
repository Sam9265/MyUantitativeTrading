import { useState, useEffect } from 'react';
import { useMarketStore } from '@/stores';
import StockTable from '@/components/StockTable';
import { Search, BarChart3 } from 'lucide-react';
import type { Market, Stock } from '@/types';

// 模拟数据
const mockStocks: Record<Market, Stock[]> = {
  CN: [
    { code: '000001', name: '平安银行', price: 12.35, change: 0.23, changePercent: 1.90, volume: 45230000, amount: 556800000, open: 12.12, high: 12.45, low: 12.08, close: 12.12, market: 'CN' },
    { code: '000002', name: '万科A', price: 8.92, change: -0.15, changePercent: -1.65, volume: 32100000, amount: 287500000, open: 9.07, high: 9.10, low: 8.88, close: 9.07, market: 'CN' },
    { code: '600000', name: '浦发银行', price: 7.85, change: 0.08, changePercent: 1.03, volume: 28900000, amount: 226500000, open: 7.77, high: 7.90, low: 7.75, close: 7.77, market: 'CN' },
    { code: '600036', name: '招商银行', price: 35.62, change: 0.45, changePercent: 1.28, volume: 52100000, amount: 1856000000, open: 35.17, high: 35.80, low: 35.10, close: 35.17, market: 'CN' },
    { code: '000858', name: '五粮液', price: 142.50, change: -2.30, changePercent: -1.59, volume: 18500000, amount: 2637000000, open: 144.80, high: 145.20, low: 142.00, close: 144.80, market: 'CN' },
    { code: '601318', name: '中国平安', price: 45.28, change: 0.67, changePercent: 1.50, volume: 67800000, amount: 3065000000, open: 44.61, high: 45.50, low: 44.55, close: 44.61, market: 'CN' },
    { code: '000333', name: '美的集团', price: 58.92, change: 0.34, changePercent: 0.58, volume: 23400000, amount: 1378000000, open: 58.58, high: 59.20, low: 58.40, close: 58.58, market: 'CN' },
    { code: '002594', name: '比亚迪', price: 268.50, change: -4.20, changePercent: -1.54, volume: 15600000, amount: 4188000000, open: 272.70, high: 273.50, low: 267.80, close: 272.70, market: 'CN' },
  ],
  HK: [
    { code: '00700', name: '腾讯控股', price: 378.20, change: 5.60, changePercent: 1.50, volume: 12500000, amount: 4725000000, open: 372.60, high: 380.00, low: 371.80, close: 372.60, market: 'HK' },
    { code: '09988', name: '阿里巴巴', price: 89.45, change: -1.25, changePercent: -1.38, volume: 18900000, amount: 1695000000, open: 90.70, high: 91.20, low: 89.10, close: 90.70, market: 'HK' },
    { code: '03690', name: '美团', price: 172.30, change: 3.80, changePercent: 2.25, volume: 8900000, amount: 1532000000, open: 168.50, high: 173.50, low: 168.00, close: 168.50, market: 'HK' },
    { code: '00941', name: '中国移动', price: 68.90, change: 0.45, changePercent: 0.66, volume: 12300000, amount: 847500000, open: 68.45, high: 69.20, low: 68.30, close: 68.45, market: 'HK' },
    { code: '01698', name: '舜宇光学', price: 92.35, change: -2.15, changePercent: -2.27, volume: 4500000, amount: 415800000, open: 94.50, high: 94.80, low: 91.80, close: 94.50, market: 'HK' },
  ],
  US: [
    { code: 'AAPL', name: 'Apple Inc.', price: 178.52, change: 2.35, changePercent: 1.33, volume: 58234567, amount: 10382567890, open: 176.17, high: 179.00, low: 175.80, close: 176.17, market: 'US' },
    { code: 'MSFT', name: 'Microsoft', price: 378.91, change: 4.12, changePercent: 1.10, volume: 23456789, amount: 8872345670, open: 374.79, high: 380.00, low: 374.00, close: 374.79, market: 'US' },
    { code: 'GOOGL', name: 'Alphabet', price: 141.80, change: -0.95, changePercent: -0.67, volume: 18765432, amount: 2661234560, open: 142.75, high: 143.50, low: 141.20, close: 142.75, market: 'US' },
    { code: 'AMZN', name: 'Amazon', price: 178.25, change: 3.45, changePercent: 1.97, volume: 45678901, amount: 8134567890, open: 174.80, high: 179.00, low: 174.50, close: 174.80, market: 'US' },
    { code: 'TSLA', name: 'Tesla', price: 248.50, change: -5.80, changePercent: -2.28, volume: 98765432, amount: 24523456780, open: 254.30, high: 255.00, low: 247.00, close: 254.30, market: 'US' },
    { code: 'NVDA', name: 'NVIDIA', price: 875.28, change: 15.67, changePercent: 1.82, volume: 34567890, amount: 30234567890, open: 859.61, high: 880.00, low: 858.00, close: 859.61, market: 'US' },
  ],
};

const marketTabs: { key: Market; label: string; icon: string }[] = [
  { key: 'CN', label: 'A股', icon: 'CN' },
  { key: 'HK', label: '港股', icon: 'HK' },
  { key: 'US', label: '美股', icon: 'US' },
];

export default function MarketPage() {
  const { currentMarket, setMarket } = useMarketStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setStocks(mockStocks[currentMarket]);
      setLoading(false);
    }, 500);
  }, [currentMarket]);

  const filteredStocks = stocks.filter(
    (stock) =>
      stock.name.includes(searchQuery) || stock.code.includes(searchQuery)
  );

  const totalGain = stocks.filter((s) => s.change > 0).length;
  const totalLoss = stocks.filter((s) => s.change < 0).length;

  return (
    <div className="h-full flex flex-col">
      {/* 顶部栏 */}
      <header className="px-8 py-5 flex items-center justify-between border-b border-border/20 bg-surface/30">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-accent/10">
              <BarChart3 className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-white">市场行情</h1>
              <div className="flex items-center gap-4 text-xs">
                <span className="text-neutral">
                  {stocks.length} 只股票
                </span>
                <span className="flex items-center gap-1 text-gain">
                  <svg className="w-3 h-3" viewBox="0 0 12 12" fill="currentColor">
                    <path d="M6 2L10 8H2L6 2Z" />
                  </svg>
                  {totalGain} 涨
                </span>
                <span className="flex items-center gap-1 text-loss">
                  <svg className="w-3 h-3" viewBox="0 0 12 12" fill="currentColor">
                    <path d="M6 10L2 4H10L6 10Z" />
                  </svg>
                  {totalLoss} 跌
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 搜索框 */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral/60" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索股票代码或名称"
            className="w-80 bg-surface/60 border border-border/50 rounded-xl pl-11 pr-4 py-2.5 text-sm text-white placeholder-neutral/60 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all duration-200"
          />
        </div>
      </header>

      {/* 市场切换 */}
      <div className="px-8 py-4">
        <div className="inline-flex gap-2 p-1.5 bg-surface/50 rounded-xl border border-border/30">
          {marketTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setMarket(tab.key)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                currentMarket === tab.key
                  ? 'bg-gradient-to-r from-accent/20 to-accent/5 text-accent shadow-lg shadow-accent/10'
                  : 'text-neutral/70 hover:text-white hover:bg-white/5'
              }`}
            >
              <span className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60" />
                {tab.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 行情列表 */}
      <div className="flex-1 overflow-auto px-8 pb-8">
        <StockTable stocks={filteredStocks} loading={loading} />
      </div>
    </div>
  );
}
