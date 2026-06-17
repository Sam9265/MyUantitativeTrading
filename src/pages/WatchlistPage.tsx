import { useWatchlistStore } from '@/stores';
import StockTable from '@/components/StockTable';
import { Star } from 'lucide-react';

export default function WatchlistPage() {
  const { watchlist } = useWatchlistStore();

  return (
    <div className="h-full flex flex-col">
      {/* 顶部栏 */}
      <header className="h-16 border-b border-border flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <Star className="w-5 h-5 text-accent" />
          <h1 className="text-lg font-semibold text-white">我的自选</h1>
          <span className="text-sm text-neutral">({watchlist.length})</span>
        </div>
      </header>

      {/* 自选股列表 */}
      <div className="flex-1 overflow-auto p-6">
        {watchlist.length > 0 ? (
          <div className="bg-surface rounded-xl border border-border">
            <StockTable stocks={watchlist} />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-neutral">
            <Star className="w-16 h-16 mb-4 opacity-30" />
            <p className="text-lg">暂无自选股</p>
            <p className="text-sm mt-2">在行情页面点击⭐添加自选</p>
          </div>
        )}
      </div>
    </div>
  );
}
