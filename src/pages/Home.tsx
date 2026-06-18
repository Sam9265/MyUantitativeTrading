import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMarketList } from '@/lib/api';
import { useWatchlistStore, useNavStore } from '@/stores';
import {
  TrendingUp,
  Globe,
  RefreshCw,
  ArrowRight,
  Activity,
  BarChart3,
  Star,
} from 'lucide-react';
import type { Stock, Market } from '@/types';

const MARKETS: { key: Market; label: string }[] = [
  { key: 'CN', label: 'A股' },
  { key: 'HK', label: '港股' },
  { key: 'US', label: '美股' },
];

export default function Home() {
  const navigate = useNavigate();
  const { setActiveNav } = useNavStore();
  const { watchlist } = useWatchlistStore();

  const [movers, setMovers] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    (async () => {
      try {
        const results = await Promise.all(
          MARKETS.map((m) => getMarketList({ market: m.key, pageSize: 100 }))
        );
        if (cancelled) return;
        const allStocks = results.flatMap((r) => r.stocks);
        setMovers(allStocks);
        setLastUpdated(new Date());
      } catch {
        if (cancelled) return;
        setMovers([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const topGainers = useMemo(
    () =>
      [...movers]
        .filter((s) => s.changePercent > 0)
        .sort((a, b) => b.changePercent - a.changePercent)
        .slice(0, 5),
    [movers]
  );

  const topLosers = useMemo(
    () =>
      [...movers]
        .filter((s) => s.changePercent < 0)
        .sort((a, b) => a.changePercent - b.changePercent)
        .slice(0, 5),
    [movers]
  );

  const refresh = () => {
    setLoading(true);
    Promise.all(MARKETS.map((m) => getMarketList({ market: m.key, pageSize: 100 })))
      .then((results) => {
        setMovers(results.flatMap((r) => r.stocks));
        setLastUpdated(new Date());
      })
      .finally(() => setLoading(false));
  };

  const goToMarket = () => setActiveNav('market');
  const goToWatchlist = () => setActiveNav('watchlist');

  return (
    <div className="h-full overflow-auto p-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-accent/10 via-surface to-primary-dark border border-accent/20 p-8 mb-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="relative">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white mb-2">欢迎来到 QuantX</h1>
              <p className="text-neutral max-w-xl">
                专业的量化交易平台，实时行情、策略回测、模拟交易一站式体验。
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-neutral">
              {lastUpdated && <span>更新于 {lastUpdated.toLocaleTimeString('zh-CN')}</span>}
              <button
                onClick={refresh}
                disabled={loading}
                className="p-2 rounded-lg bg-surface/60 border border-border/50 text-neutral hover:text-white transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="rounded-2xl bg-surface/60 backdrop-blur-xl border border-border/30 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 rounded-xl bg-accent/10">
              <Globe className="w-5 h-5 text-accent" />
            </div>
            <span className="text-xs text-neutral">覆盖市场</span>
          </div>
          <div className="text-2xl font-bold text-white mb-1">{MARKETS.length}</div>
          <div className="text-xs text-neutral">A股 / 港股 / 美股</div>
        </div>

        <div className="rounded-2xl bg-surface/60 backdrop-blur-xl border border-border/30 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 rounded-xl bg-gain-bg text-gain">
              <TrendingUp className="w-5 h-5" />
            </div>
            <span className="text-xs text-neutral">今日领涨</span>
          </div>
          <div className="text-2xl font-bold text-white mb-1">{topGainers.length}</div>
          <div className="text-xs text-neutral">涨幅前 5 的股票</div>
        </div>

        <div className="rounded-2xl bg-surface/60 backdrop-blur-xl border border-border/30 p-6 cursor-pointer hover:bg-surface-hover/50 transition-colors"
          onClick={goToWatchlist}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 rounded-xl bg-accent/10">
              <Star className="w-5 h-5 text-accent" />
            </div>
            <span className="text-xs text-neutral">我的自选</span>
          </div>
          <div className="text-2xl font-bold text-white mb-1">{watchlist.length}</div>
          <div className="text-xs text-neutral flex items-center gap-1">
            查看自选 <ArrowRight className="w-3 h-3" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Market Movers */}
        <div className="lg:col-span-2 rounded-2xl bg-surface/60 backdrop-blur-xl border border-border/30 overflow-hidden">
          <div className="px-6 py-4 border-b border-border/20 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-accent" />
              <h2 className="text-sm font-semibold text-white">市场异动</h2>
            </div>
            <button
              onClick={goToMarket}
              className="text-xs text-neutral hover:text-accent flex items-center gap-1 transition-colors"
            >
              全部行情 <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="grid grid-cols-2">
            {/* Gainers */}
            <div className="border-r border-border/20">
              <div className="px-6 py-3 bg-surface/40 text-xs font-medium text-gain">涨幅榜 TOP5</div>
              {loading ? (
                <div className="p-4 space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-10 rounded-lg bg-surface/50 animate-pulse" />
                  ))}
                </div>
              ) : topGainers.length === 0 ? (
                <div className="p-6 text-center text-neutral text-sm">暂无数据</div>
              ) : (
                <div className="divide-y divide-border/10">
                  {topGainers.map((stock) => (
                    <div
                      key={stock.code}
                      onClick={() => navigate(`/stock/${stock.code}`)}
                      className="px-6 py-3 flex items-center justify-between cursor-pointer hover:bg-surface-hover/30 transition-colors"
                    >
                      <div>
                        <div className="text-sm font-medium text-white">{stock.name}</div>
                        <div className="text-xs text-neutral font-mono">{stock.code}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-mono text-gain">+{stock.changePercent.toFixed(2)}%</div>
                        <div className="text-xs text-neutral">{stock.price.toFixed(2)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Losers */}
            <div>
              <div className="px-6 py-3 bg-surface/40 text-xs font-medium text-loss">跌幅榜 TOP5</div>
              {loading ? (
                <div className="p-4 space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-10 rounded-lg bg-surface/50 animate-pulse" />
                  ))}
                </div>
              ) : topLosers.length === 0 ? (
                <div className="p-6 text-center text-neutral text-sm">暂无数据</div>
              ) : (
                <div className="divide-y divide-border/10">
                  {topLosers.map((stock) => (
                    <div
                      key={stock.code}
                      onClick={() => navigate(`/stock/${stock.code}`)}
                      className="px-6 py-3 flex items-center justify-between cursor-pointer hover:bg-surface-hover/30 transition-colors"
                    >
                      <div>
                        <div className="text-sm font-medium text-white">{stock.name}</div>
                        <div className="text-xs text-neutral font-mono">{stock.code}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-mono text-loss">{stock.changePercent.toFixed(2)}%</div>
                        <div className="text-xs text-neutral">{stock.price.toFixed(2)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="rounded-2xl bg-surface/60 backdrop-blur-xl border border-border/30 overflow-hidden">
          <div className="px-6 py-4 border-b border-border/20 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-accent" />
            <h2 className="text-sm font-semibold text-white">快速导航</h2>
          </div>
          <div className="p-4 space-y-2">
            {[
              { key: 'market', label: '市场行情', desc: '浏览全部股票行情' },
              { key: 'watchlist', label: '自选股', desc: '管理我的关注列表' },
              { key: 'strategy', label: '策略中心', desc: '编写和运行量化策略' },
              { key: 'backtest', label: '回测分析', desc: '历史数据验证策略' },
              { key: 'trade', label: '模拟交易', desc: '零风险模拟下单' },
            ].map((item) => (
              <button
                key={item.key}
                onClick={() => setActiveNav(item.key as Parameters<typeof setActiveNav>[0])}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-surface/40 hover:bg-surface-hover/50 transition-colors text-left"
              >
                <div>
                  <div className="text-sm font-medium text-white">{item.label}</div>
                  <div className="text-xs text-neutral">{item.desc}</div>
                </div>
                <ArrowRight className="w-4 h-4 text-neutral" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
