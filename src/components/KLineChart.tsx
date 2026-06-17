import ReactECharts from 'echarts-for-react';
import type { KLineData } from '@/types';

interface KLineChartProps {
  data: KLineData[];
  symbol?: string;
}

export default function KLineChart({ data, symbol }: KLineChartProps) {
  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
      },
      backgroundColor: '#0D1B2A',
      borderColor: '#1E3A5F',
      textStyle: {
        color: '#fff',
      },
    },
    grid: {
      left: '10%',
      right: '10%',
      top: '10%',
      bottom: '15%',
    },
    xAxis: {
      type: 'category',
      data: data.map((d) =>
        new Date(d.timestamp).toLocaleDateString('zh-CN')
      ),
      axisLine: {
        lineStyle: { color: '#1E3A5F' },
      },
      axisLabel: {
        color: '#868D94',
        fontSize: 10,
      },
    },
    yAxis: {
      type: 'value',
      scale: true,
      splitLine: {
        lineStyle: { color: '#1E3A5F', type: 'dashed' },
      },
      axisLine: { show: false },
      axisLabel: {
        color: '#868D94',
        fontSize: 10,
      },
    },
    dataZoom: [
      {
        type: 'inside',
        start: 0,
        end: 100,
      },
      {
        type: 'slider',
        backgroundColor: '#0D1B2A',
        dataBackground: {
          lineStyle: { color: '#1E3A5F' },
          areaStyle: { color: '#1E3A5F' },
        },
        selectedDataBackground: {
          lineStyle: { color: '#00D4FF' },
          areaStyle: { color: 'rgba(0, 212, 255, 0.2)' },
        },
        fillerColor: 'rgba(0, 212, 255, 0.1)',
        borderColor: '#1E3A5F',
        handleStyle: { color: '#00D4FF' },
        textStyle: { color: '#868D94' },
      },
    ],
    series: [
      {
        name: symbol || 'K线',
        type: 'candlestick',
        data: data.map((d) => [d.open, d.close, d.low, d.high]),
        itemStyle: {
          color: '#00C853',
          color0: '#FF1744',
          borderColor: '#00C853',
          borderColor0: '#FF1744',
        },
      },
    ],
  };

  return (
    <ReactECharts
      option={option}
      style={{ height: '100%', width: '100%' }}
      opts={{ renderer: 'canvas' }}
    />
  );
}
