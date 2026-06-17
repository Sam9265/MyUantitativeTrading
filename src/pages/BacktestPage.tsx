import { useState } from 'react';
import { useBacktestStore } from '@/stores';
import ReactECharts from 'echarts-for-react';
import { Play, Calendar, TrendingUp, TrendingDown, Activity } from 'lucide-react';

export default function BacktestPage() {
  const [stockCode, setStockCode] = useState('000001');
  const [startDate, setStartDate] = useState('2023-01-01');
  const [endDate, setEndDate] = useState('2024-01-01');
  const [initialCapital, setInitialCapital] = useState('1000000');
  const [isRunning, setIsRunning] = useState(false);

  const { addResult } = useBacktestStore();

  // 模拟回测结果
  const mockEquityCurve = [
    { timestamp: 1672531200000, value: 1000000 },
    { timestamp: 1675209600000, value: 1025000 },
    { timestamp: 1677628800000, value: 1058000 },
    { timestamp: 1680307200000, value: 1032000 },
    { timestamp: 1682899200000, value: 1085000 },
    { timestamp: 1685577600000, value: 1123000 },
    { timestamp: 1688169600000, value: 1156000 },
    { timestamp: 1690848000000, value: 1134000 },
    { timestamp: 1693526400000, value: 1182000 },
    { timestamp: 1696118400000, value: 1225000 },
    { timestamp: 1698796800000, value: 1208000 },
    { timestamp: 1701388800000, value: 1256000 },
  ];

  const handleRunBacktest = () => {
    setIsRunning(true);
    setTimeout(() => {
      const result = {
        id: Date.now().toString(),
        status: 'completed' as const,
        metrics: {
          totalReturn: 25.6,
          annualReturn: 22.3,
          maxDrawdown: -8.5,
          sharpeRatio: 1.85,
          winRate: 58.5,
        },
        equityCurve: mockEquityCurve,
        trades: [],
      };
      addResult(result);
      setIsRunning(false);
    }, 2000);
  };

  const equityChartOption = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#0D1B2A',
      borderColor: '#1E3A5F',
      textStyle: { color: '#fff' },
    },
    grid: {
      left: '5%',
      right: '5%',
      top: '10%',
      bottom: '10%',
    },
    xAxis: {
      type: 'time',
      axisLine: { lineStyle: { color: '#1E3A5F' } },
      axisLabel: { color: '#868D94' },
    },
    yAxis: {
      type: 'value',
      scale: true,
      splitLine: { lineStyle: { color: '#1E3A5F', type: 'dashed' } },
      axisLine: { show: false },
      axisLabel: {
        color: '#868D94',
        formatter: (value: number) => (value / 1000000).toFixed(1) + 'M',
      },
    },
    series: [
      {
        name: '权益曲线',
        type: 'line',
        data: mockEquityCurve.map((d) => [d.timestamp, d.value]),
        smooth: true,
        lineStyle: { color: '#00D4FF', width: 2 },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(0, 212, 255, 0.3)' },
              { offset: 1, color: 'rgba(0, 212, 255, 0.05)' },
            ],
          },
        },
      },
    ],
  };

  const metrics = [
    {
      label: '总收益率',
      value: '+25.60%',
      icon: TrendingUp,
      color: 'text-gain',
      bg: 'bg-gain-bg',
    },
    {
      label: '年化收益率',
      value: '+22.30%',
      icon: Activity,
      color: 'text-gain',
      bg: 'bg-gain-bg',
    },
    {
      label: '最大回撤',
      value: '-8.50%',
      icon: TrendingDown,
      color: 'text-loss',
      bg: 'bg-loss-bg',
    },
    {
      label: '夏普比率',
      value: '1.85',
      icon: Activity,
      color: 'text-accent',
      bg: 'bg-accent/10',
    },
    {
      label: '胜率',
      value: '58.50%',
      icon: TrendingUp,
      color: 'text-gain',
      bg: 'bg-gain-bg',
    },
  ];

  return (
    <div className="h-full flex flex-col">
      {/* 顶部栏 */}
      <header className="h-16 border-b border-border flex items-center px-6">
        <h1 className="text-lg font-semibold text-white">策略回测</h1>
      </header>

      <div className="flex-1 overflow-auto p-6">
        <div className="grid grid-cols-3 gap-6">
          {/* 左侧配置 */}
          <div className="col-span-1 space-y-6">
            {/* 回测参数 */}
            <div className="bg-surface rounded-xl p-4 border border-border">
              <h3 className="text-sm font-medium text-white mb-4">
                回测参数
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="text-xs text-neutral mb-2 block">
                    股票代码
                  </label>
                  <input
                    type="text"
                    value={stockCode}
                    onChange={(e) => setStockCode(e.target.value)}
                    placeholder="如: 000001"
                    className="w-full bg-primary-light border border-border rounded-lg px-3 py-2.5 text-sm text-white placeholder-neutral focus:outline-none focus:border-accent"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-neutral mb-2 block">
                      开始日期
                    </label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full bg-primary-light border border-border rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-accent"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-neutral mb-2 block">
                      结束日期
                    </label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full bg-primary-light border border-border rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-accent"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-neutral mb-2 block">
                    初始资金
                  </label>
                  <input
                    type="text"
                    value={initialCapital}
                    onChange={(e) => setInitialCapital(e.target.value)}
                    placeholder="如: 1000000"
                    className="w-full bg-primary-light border border-border rounded-lg px-3 py-2.5 text-sm text-white placeholder-neutral focus:outline-none focus:border-accent"
                  />
                </div>

                <button
                  onClick={handleRunBacktest}
                  disabled={isRunning}
                  className="w-full py-3 bg-accent text-primary rounded-lg text-sm font-medium hover:bg-accent-hover transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Play className="w-4 h-4" />
                  {isRunning ? '回测中...' : '开始回测'}
                </button>
              </div>
            </div>

            {/* 绩效指标 */}
            <div className="bg-surface rounded-xl p-4 border border-border">
              <h3 className="text-sm font-medium text-white mb-4">绩效指标</h3>
              <div className="space-y-3">
                {metrics.map((metric) => {
                  const Icon = metric.icon;
                  return (
                    <div
                      key={metric.label}
                      className="flex items-center justify-between p-3 rounded-lg bg-primary-light"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={`p-1.5 rounded ${metric.bg}`}
                        >
                          <Icon className={`w-4 h-4 ${metric.color}`} />
                        </div>
                        <span className="text-xs text-neutral">
                          {metric.label}
                        </span>
                      </div>
                      <span className={`text-sm font-mono font-medium ${metric.color}`}>
                        {metric.value}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 右侧权益曲线 */}
          <div className="col-span-2">
            <div className="bg-surface rounded-xl p-4 border border-border h-full">
              <h3 className="text-sm font-medium text-white mb-4">权益曲线</h3>
              <div className="h-[400px]">
                <ReactECharts
                  option={equityChartOption}
                  style={{ height: '100%', width: '100%' }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
