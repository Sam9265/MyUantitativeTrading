import { useState } from 'react';
import { useStrategyStore } from '@/stores';
import CodeEditor from '@/components/CodeEditor';
import { Plus, Play, Trash2, Copy, FileCode } from 'lucide-react';
import type { Strategy } from '@/types';

// 示例策略
const sampleStrategies: Strategy[] = [
  {
    id: '1',
    name: '双均线策略',
    code: `# 双均线策略
import pandas as pd

def initialize(context):
    context.stock = context.security('000001.XSHE')
    context.short_window = 5
    context.long_window = 20

def handle_data(context, data):
    hist = data.history(context.stock, 'close', context.long_window, '1d')
    short_ma = hist[-context.short_window:].mean()
    long_ma = hist.mean()
    
    if short_ma > long_ma and context.stock not in context.portfolio.positions:
        context.order_target(context.stock, 1000)
    elif short_ma < long_ma and context.stock in context.portfolio.positions:
        context.order_target(context.stock, 0)`,
    description: '经典的双均线交叉策略',
    isPublic: true,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
  },
  {
    id: '2',
    name: 'RSI超卖策略',
    code: `# RSI超卖策略
def initialize(context):
    context.stock = context.security('000001.XSHE')
    context.rsi_period = 14
    context.oversold = 30
    context.overbought = 70

def handle_data(context, data):
    hist = data.history(context.stock, 'close', context.rsi_period + 1, '1d')
    delta = hist.diff()
    gain = delta.where(delta > 0, 0).mean()
    loss = (-delta.where(delta < 0, 0)).mean()
    rs = gain / loss if loss != 0 else 0
    rsi = 100 - (100 / (1 + rs))
    
    if rsi < context.oversold and context.stock not in context.portfolio.positions:
        context.order_target(context.stock, 1000)
    elif rsi > context.overbought and context.stock in context.portfolio.positions:
        context.order_target(context.stock, 0)`,
    description: '基于RSI指标的超买超卖策略',
    isPublic: false,
    createdAt: '2024-01-10T08:30:00Z',
    updatedAt: '2024-01-12T14:20:00Z',
  },
];

export default function StrategyPage() {
  const [selectedStrategy, setSelectedStrategy] = useState<Strategy | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editorValue, setEditorValue] = useState('');

  const { strategies, addStrategy, deleteStrategy } = useStrategyStore();

  // 合并示例策略和用户策略
  const allStrategies = [...sampleStrategies, ...strategies];

  const handleNewStrategy = () => {
    const newStrategy: Strategy = {
      id: Date.now().toString(),
      name: '新策略',
      code: '# 新策略\\n\\ndef initialize(context):\\n    pass\\n\\ndef handle_data(context, data):\\n    pass',
      description: '',
      isPublic: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    addStrategy(newStrategy);
    setSelectedStrategy(newStrategy);
    setEditorValue(newStrategy.code);
    setIsEditing(true);
  };

  const handleEdit = (strategy: Strategy) => {
    setSelectedStrategy(strategy);
    setEditorValue(strategy.code);
    setIsEditing(true);
  };

  const handleSave = () => {
    if (selectedStrategy) {
      // 保存逻辑
      setIsEditing(false);
    }
  };

  return (
    <div className="h-full flex">
      {/* 左侧策略列表 */}
      <div className="w-72 border-r border-border flex flex-col">
        <header className="h-16 border-b border-border flex items-center justify-between px-4">
          <h2 className="text-sm font-semibold text-white">策略列表</h2>
          <button
            onClick={handleNewStrategy}
            className="p-2 rounded-lg bg-accent/10 text-accent hover:bg-accent/20 transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </header>

        <div className="flex-1 overflow-auto">
          {allStrategies.map((strategy) => (
            <div
              key={strategy.id}
              onClick={() => handleEdit(strategy)}
              className={`p-4 border-b border-border/50 cursor-pointer transition-colors ${
                selectedStrategy?.id === strategy.id
                  ? 'bg-accent/10'
                  : 'hover:bg-surface-hover'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-sm font-medium text-white">
                  {strategy.name}
                </h3>
                {strategy.isPublic && (
                  <span className="text-xs text-accent">公开</span>
                )}
              </div>
              <p className="text-xs text-neutral truncate">
                {strategy.description || '暂无描述'}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 右侧编辑器 */}
      <div className="flex-1 flex flex-col">
        {isEditing && selectedStrategy ? (
          <>
            <header className="h-16 border-b border-border flex items-center justify-between px-4">
              <div className="flex items-center gap-3">
                <FileCode className="w-5 h-5 text-accent" />
                <input
                  type="text"
                  value={selectedStrategy.name}
                  className="bg-transparent text-white font-medium focus:outline-none"
                />
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-accent text-primary rounded-lg text-sm font-medium hover:bg-accent-hover transition-colors"
                >
                  保存
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 bg-surface-hover text-neutral rounded-lg text-sm font-medium hover:text-white transition-colors"
                >
                  取消
                </button>
              </div>
            </header>

            <div className="flex-1 p-4">
              <CodeEditor
                value={editorValue}
                onChange={setEditorValue}
                height="calc(100% - 0px)"
              />
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-neutral">
            <div className="text-center">
              <FileCode className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <p className="text-lg">选择一个策略开始编辑</p>
              <p className="text-sm mt-2">或点击右上角+创建新策略</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
