import { useState, useEffect, useCallback, useMemo } from 'react';
import { useMarketStore } from '@/stores';
import StockTable, { type SortColumn } from '@/components/StockTable';
import { getMarketList } from '@/lib/api';
import { Search, BarChart3, TrendingUp, TrendingDown, Minus, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Market, Stock } from '@/types';

const marketTabs: { key: Market; label: string }[] = [
  { key: 'CN', label: 'A股' },
  { key: 'HK', label: '港股' },
  { key: 'US', label: '美股' },
];

const pageSizeOptions = [20, 50, 100];
const REFRESH_INTERVAL = 30000;

export default function MarketPage() {
  const { currentMarket, setMarket } = useMarketStore();

  const [stocks, setStocks] = useState<Stock[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [sortBy, setSortBy] = useState<SortColumn>('code');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery.trim()), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    setPage(1);
  }, [currentMarket, debouncedSearch, pageSize, sortBy, sortOrder]);

  const fetchData = useCallback(async (isBackground = false) => {
    if (!isBackground) setLoading(true);
    setError(null);
    try {
      const response = await getMarketList({
        market: currentMarket,
        page,
        pageSize,
        search: debouncedSearch,
        sortBy,
        sortOrder,
      });
      setStocks(response.stocks);
      setTotal(response.total);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载失败');
    } finally {
      if (!isBackground) setLoading(false);
    }
  }, [currentMarket, page, pageSize, debouncedSearch, sortBy, sortOrder]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    const timer = setInterval(() => {
      fetchData(true);
    }, REFRESH_INTERVAL);
    return () => clearInterval(timer);
  }, [fetchData]);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / pageSize)), [total, pageSize]);

  const summary = useMemo(() => {
    const gainers = stocks.filter((s) => s.change > 0).length;
    const losers = stocks.filter((s) => s.change < 0).length;
    const flat = stocks.length - gainers - losers;
    return { total: stocks.length, gainers, losers, flat };
  }, [stocks]);

  const handleSort = (column: SortColumn) => {
    if (sortBy === column) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  const startItem = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const endItem = Math.min(page * pageSize, total);

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
                <span className="text-neutral">{total} 只股票</span>
                <span className="flex items-center gap-1 text-gain">
                  <TrendingUp className="w-3 h-3" />
                  {summary.gainers} 涨
                </span>
                <span className="flex items-center gap-1 text-loss">
                  <TrendingDown className="w-3 h-3" />
                  {summary.losers} 跌
                </span>
                <span className="flex items-center gap-1 text-neutral">
                  <Minus className="w-3 h-3" />
                  {summary.flat} 平
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {lastUpdated && (
            <span className="text-xs text-neutral/70">
              更新于 {lastUpdated.toLocaleTimeString('zh-CN')}
            </span>
          )}
          <button
            onClick={() => fetchData()}
            disabled={loading}
            className="p-2 rounded-lg bg-surface/60 border border-border/50 text-neutral hover:text-white hover:bg-surface-hover transition-colors disabled:opacity-50"
            title="刷新"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

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

      {/* 错误提示 */}
      {error && (
        <div className="px-8 pb-2">
          <div className="rounded-xl bg-loss/10 border border-loss/20 text-loss px-4 py-3 text-sm">
            加载失败：{error}
          </div>
        </div>
      )}

      {/* 行情列表 */}
      <div className="flex-1 overflow-auto px-8 pb-4">
        <StockTable
          stocks={stocks}
          loading={loading}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSort={handleSort}
        />
      </div>

      {/* 分页 */}
      <div className="px-8 py-4 border-t border-border/20 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="text-xs text-neutral">
            第 {startItem}-{endItem} 条，共 {total} 条
          </span>
          <div className="flex items-center gap-2">
            <span className="text-xs text-neutral">每页</span>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="bg-surface/60 border border-border/50 rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:border-accent"
            >
              {pageSizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="p-2 rounded-lg bg-surface/60 border border-border/50 text-neutral hover:text-white hover:bg-surface-hover disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`min-w-[32px] h-8 px-2 rounded-lg text-xs font-medium transition-colors ${
                  p === page
                    ? 'bg-accent text-primary'
                    : 'bg-surface/60 border border-border/50 text-neutral hover:text-white hover:bg-surface-hover'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="p-2 rounded-lg bg-surface/60 border border-border/50 text-neutral hover:text-white hover:bg-surface-hover disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
