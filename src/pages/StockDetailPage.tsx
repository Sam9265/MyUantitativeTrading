import { useParams } from 'react-router-dom';
import { useState, useEffect, useMemo } from 'react';
import { useWatchlistStore } from '@/stores';
import KLineChart from '@/components/KLineChart';
import TradePanel from '@/components/TradePanel';
import { getStockQuote, getKLine } from '@/lib/api';
import { ArrowLeft, Star, TrendingUp, TrendingDown, Activity, Building2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Stock, KLineData, KLinePeriod } from '@/types';

const periodMap: Record<KLinePeriod, { label: string; api: 'daily' | 'weekly' | 'monthly'; days: number }> = {
  '1d': { label: '日K', api: 'daily', days: 365 },
  '1w': { label: '周K', api: 'weekly', days: 730 },
  '1m': { label: '月K', api: 'monthly', days: 1825 },
};

export default function StockDetailPage() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();

  const [stock, setStock] = useState<Stock | null>(null);
  const [klineData, setKlineData] = useState<KLineData[]>([]);
  const [period, setPeriod] = useState<KLinePeriod>('1d');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { watchlist, addToWatchlist, removeFromWatchlist } = useWatchlistStore();
  const isInWatchlist = useMemo(
    () => (stock ? watchlist.some((s) => s.code === stock.code) : false),
    [watchlist, stock]
  );

  useEffect(() => {
    if (!code) return;

    let cancelled = false;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        const [quote, kline] = await Promise.all([
          getStockQuote(code),
          getKLine(code, periodMap[period].api, periodMap[period].days),
        ]);
        if (cancelled) return;
        setStock(quote);
        setKlineData(kline.data);
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : '加载失败');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [code, period]);

  const getChangeColor = (change: number) => {
    if (change > 0) return 'text-gain';
    if (change < 0) return 'text-loss';
    return 'text-neutral';
  };

  const formatNumber = (num: number, decimals = 2) => num.toFixed(decimals);

  const formatVolume = (volume: number) => {
    if (volume >= 100000000) return (volume / 100000000).toFixed(2) + '亿';
    if (volume >= 10000) return (volume / 10000).toFixed(2) + '万';
    return volume.toString();
  };

  const computedStats = useMemo(() => {
    if (!klineData.length) return null;
    const highs = klineData.map((d) => d.high);
    const lows = klineData.map((d) => d.low);
    const volumes = klineData.map((d) => d.volume);
    const maxHigh = Math.max(...highs);
    const minLow = Math.min(...lows);
    const avgVolume = volumes.reduce((a, b) => a + b, 0) / volumes.length;
    const amplitude = stock ? ((maxHigh - minLow) / stock.close) * 100 : 0;
    return { maxHigh, minLow, avgVolume, amplitude };
  }, [klineData, stock]);

  const handleToggleWatchlist = () => {
    if (!stock) return;
    if (isInWatchlist) {
      removeFromWatchlist(stock.code);
    } else {
      addToWatchlist(stock);
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center text-neutral">
        <Activity className="w-6 h-6 animate-spin mr-2" />
        加载中...
      </div>
    );
  }

  if (error || !stock) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-neutral gap-4">
        <span className="text-loss">{error || '股票数据不可用'}</span>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 rounded-lg bg-accent/10 text-accent hover:bg-accent/20 transition-colors"
        >
          返回
        </button>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* 顶部栏 */}
      <header className="h-16 border-b border-border flex items-center px-6 justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-lg hover:bg-surface transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-neutral" />
          </button>
          <div>
            <h1 className="text-lg font-semibold text-white">{stock.name}</h1>
            <span className="text-xs text-neutral font-mono">{stock.code}</span>
          </div>
          {stock.industry ? (
            <span className="px-2 py-0.5 rounded-lg text-xs bg-accent/10 text-accent border border-accent/20">
              {stock.industry}
            </span>
          ) : null}
        </div>

        <button
          onClick={handleToggleWatchlist}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
            isInWatchlist
              ? 'bg-accent/10 text-accent'
              : 'bg-surface text-neutral hover:text-white'
          }`}
        >
          <Star className="w-4 h-4" fill={isInWatchlist ? 'currentColor' : 'none'} />
          {isInWatchlist ? '已自选' : '加自选'}
        </button>
      </header>

      <div className="flex-1 overflow-auto p-6">
        <div className="grid grid-cols-4 gap-6">
          {/* 左侧K线图 */}
          <div className="col-span-3 space-y-6">
            {/* 价格概览 */}
            <div className="bg-surface rounded-xl p-4 border border-border">
              <div className="flex items-end gap-6 flex-wrap">
                <div>
                  <div className="text-3xl font-mono text-white">
                    {formatNumber(stock.price)}
                  </div>
                  <div className={`flex items-center gap-2 mt-1 ${getChangeColor(stock.change)}`}>
                    {stock.change >= 0 ? (
                      <TrendingUp className="w-4 h-4" />
                    ) : (
                      <TrendingDown className="w-4 h-4" />
                    )}
                    <span className="text-sm font-mono">
                      {stock.change >= 0 ? '+' : ''}
                      {formatNumber(stock.change)} (
                      {stock.changePercent >= 0 ? '+' : ''}
                      {formatNumber(stock.changePercent)}%)
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-x-8 gap-y-3 text-xs">
                  <div>
                    <div className="text-neutral">开盘</div>
                    <div className="text-white font-mono mt-1">{formatNumber(stock.open)}</div>
                  </div>
                  <div>
                    <div className="text-neutral">最高</div>
                    <div className="text-white font-mono mt-1">{formatNumber(stock.high)}</div>
                  </div>
                  <div>
                    <div className="text-neutral">最低</div>
                    <div className="text-white font-mono mt-1">{formatNumber(stock.low)}</div>
                  </div>
                  <div>
                    <div className="text-neutral">昨收</div>
                    <div className="text-white font-mono mt-1">{formatNumber(stock.close)}</div>
                  </div>
                  <div>
                    <div className="text-neutral">成交量</div>
                    <div className="text-white font-mono mt-1">{formatVolume(stock.volume)}</div>
                  </div>
                  <div>
                    <div className="text-neutral">成交额</div>
                    <div className="text-white font-mono mt-1">{formatVolume(stock.amount)}</div>
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
                      {periodMap[p].label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="h-[400px]">
                {klineData.length > 0 ? (
                  <KLineChart data={klineData} symbol={stock.name} />
                ) : (
                  <div className="h-full flex items-center justify-center text-neutral text-sm">
                    暂无K线数据
                  </div>
                )}
              </div>
            </div>

            {/* 公司概况 */}
            <div className="bg-surface rounded-xl p-4 border border-border">
              <h3 className="text-sm font-medium text-white mb-4 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-accent" />
                公司概况
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-xs">
                <div>
                  <div className="text-neutral">所属行业</div>
                  <div className="text-white mt-1">{stock.industry || '—'}</div>
                </div>
                <div>
                  <div className="text-neutral">所属市场</div>
                  <div className="text-white mt-1">
                    {stock.market === 'CN' ? 'A股' : stock.market === 'HK' ? '港股' : '美股'}
                  </div>
                </div>
                <div>
                  <div className="text-neutral">阶段最高价</div>
                  <div className="text-white mt-1">
                    {computedStats ? formatNumber(computedStats.maxHigh) : '—'}
                  </div>
                </div>
                <div>
                  <div className="text-neutral">阶段最低价</div>
                  <div className="text-white mt-1">
                    {computedStats ? formatNumber(computedStats.minLow) : '—'}
                  </div>
                </div>
                <div>
                  <div className="text-neutral">阶段振幅</div>
                  <div className="text-white mt-1">
                    {computedStats ? `${formatNumber(computedStats.amplitude)}%` : '—'}
                  </div>
                </div>
                <div>
                  <div className="text-neutral">阶段均量</div>
                  <div className="text-white mt-1">
                    {computedStats ? formatVolume(computedStats.avgVolume) : '—'}
                  </div>
                </div>
                <div>
                  <div className="text-neutral">K线数量</div>
                  <div className="text-white mt-1">{klineData.length}</div>
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
