import { useNavigate } from 'react-router-dom';
import { Star, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import type { Stock } from '@/types';
import { useWatchlistStore } from '@/stores';

export type SortColumn = 'code' | 'name' | 'price' | 'changePercent' | 'volume' | 'amount';

interface StockTableProps {
  stocks: Stock[];
  loading?: boolean;
  sortBy?: SortColumn;
  sortOrder?: 'asc' | 'desc';
  onSort?: (column: SortColumn) => void;
}

const columns: { key: SortColumn; label: string; align?: 'left' | 'right' }[] = [
  { key: 'code', label: '代码' },
  { key: 'name', label: '名称' },
  { key: 'price', label: '最新价', align: 'right' },
  { key: 'changePercent', label: '涨跌幅', align: 'right' },
  { key: 'volume', label: '成交量', align: 'right' },
  { key: 'amount', label: '成交额', align: 'right' },
];

export default function StockTable({
  stocks,
  loading,
  sortBy,
  sortOrder,
  onSort,
}: StockTableProps) {
  const navigate = useNavigate();
  const { watchlist, addToWatchlist, removeFromWatchlist } = useWatchlistStore();

  const isInWatchlist = (code: string) => watchlist.some((s) => s.code === code);

  const handleToggleWatchlist = (e: React.MouseEvent, stock: Stock) => {
    e.stopPropagation();
    if (isInWatchlist(stock.code)) {
      removeFromWatchlist(stock.code);
    } else {
      addToWatchlist(stock);
    }
  };

  const handleRowClick = (stock: Stock) => {
    navigate(`/stock/${stock.code}`);
  };

  const formatNumber = (num: number, decimals = 2) => {
    return num.toFixed(decimals);
  };

  const formatVolume = (volume: number) => {
    if (volume >= 100000000) return (volume / 100000000).toFixed(2) + '亿';
    if (volume >= 10000) return (volume / 10000).toFixed(2) + '万';
    return volume.toString();
  };

  const renderSortIcon = (column: SortColumn) => {
    if (sortBy !== column) {
      return <ArrowUpDown className="w-3 h-3 text-neutral/40" />;
    }
    return sortOrder === 'asc' ? (
      <ArrowUp className="w-3 h-3 text-accent" />
    ) : (
      <ArrowDown className="w-3 h-3 text-accent" />
    );
  };

  if (loading) {
    return (
      <div className="space-y-3 p-4">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="h-14 rounded-xl bg-surface/50 animate-pulse flex items-center px-4 gap-4"
          >
            <div className="w-16 h-4 bg-border/50 rounded" />
            <div className="flex-1 h-4 bg-border/50 rounded" />
            <div className="w-20 h-4 bg-border/50 rounded" />
            <div className="w-24 h-4 bg-border/50 rounded" />
            <div className="w-20 h-4 bg-border/50 rounded" />
            <div className="w-20 h-4 bg-border/50 rounded" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl bg-surface/60 backdrop-blur-xl border border-border/30">
      {/* 表头 */}
      <div className="grid grid-cols-8 gap-2 px-6 py-4 bg-surface/80 border-b border-border/20">
        {columns.map((col) => (
          <div
            key={col.key}
            onClick={() => onSort?.(col.key)}
            className={`text-xs font-medium text-neutral/70 flex items-center gap-1 cursor-pointer select-none hover:text-white transition-colors ${
              col.align === 'right' ? 'justify-end' : ''
            }`}
          >
            {col.label}
            {renderSortIcon(col.key)}
          </div>
        ))}
        <div className="text-xs font-medium text-neutral/70 text-center">自选</div>
      </div>

      {/* 数据行 */}
      {stocks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-neutral">
          <span className="text-sm">暂无股票数据</span>
        </div>
      ) : (
        <div className="divide-y divide-border/10">
          {stocks.map((stock, index) => (
            <div
              key={stock.code}
              onClick={() => handleRowClick(stock)}
              className={`grid grid-cols-8 gap-2 px-6 py-4 items-center cursor-pointer transition-all duration-200 hover:bg-surface-hover/50 ${
                index % 2 === 0 ? 'bg-transparent' : 'bg-surface/30'
              }`}
            >
              <div className="font-mono text-sm text-neutral/80">{stock.code}</div>
              <div className="text-sm font-medium text-white flex items-center gap-2">
                {stock.name}
                {stock.industry ? (
                  <span className="px-1.5 py-0.5 rounded text-[10px] bg-surface-hover text-neutral/80 border border-border/30">
                    {stock.industry}
                  </span>
                ) : null}
              </div>
              <div className="text-sm font-mono text-white text-right">
                {formatNumber(stock.price)}
              </div>
              <div className="text-right">
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-mono font-medium ${
                    stock.changePercent > 0
                      ? 'bg-gain-bg text-gain'
                      : stock.changePercent < 0
                      ? 'bg-loss-bg text-loss'
                      : 'bg-neutral/10 text-neutral'
                  }`}
                >
                  {stock.changePercent > 0 ? (
                    <svg className="w-3 h-3" viewBox="0 0 12 12" fill="currentColor">
                      <path d="M6 2L10 8H2L6 2Z" />
                    </svg>
                  ) : stock.changePercent < 0 ? (
                    <svg className="w-3 h-3" viewBox="0 0 12 12" fill="currentColor">
                      <path d="M6 10L2 4H10L6 10Z" />
                    </svg>
                  ) : null}
                  {stock.changePercent > 0 ? '+' : ''}
                  {formatNumber(stock.changePercent)}%
                </span>
              </div>
              <div className="text-sm font-mono text-neutral/70 text-right">
                {formatVolume(stock.volume)}
              </div>
              <div className="text-sm font-mono text-neutral/70 text-right">
                {formatVolume(stock.amount)}
              </div>
              <div className="text-center">
                <button
                  onClick={(e) => handleToggleWatchlist(e, stock)}
                  className={`p-2 rounded-lg transition-all duration-200 ${
                    isInWatchlist(stock.code)
                      ? 'bg-accent/10 text-accent'
                      : 'text-neutral/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Star
                    className="w-4 h-4"
                    fill={isInWatchlist(stock.code) ? 'currentColor' : 'none'}
                  />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
