import { useRef, useEffect } from 'react';
import * as monaco from 'monaco-editor';

// 在Vite中配置Monaco Editor worker
self.MonacoEnvironment = {
  getWorker: function () {
    return new Worker(
      new URL('monaco-editor/esm/vs/editor/editor.worker.js', import.meta.url),
      { type: 'module' }
    );
  },
};

interface CodeEditorProps {
  value: string;
  onChange?: (value: string) => void;
  readOnly?: boolean;
  height?: string;
}

// Python代码模板
const defaultCode = `# 量化策略示例
import pandas as pd
import numpy as np

def initialize(context):
    \"\"\"初始化策略参数\"\"\"
    context.stock = context.security('000001.XSHE')
    context.capital_base = 1000000

def handle_data(context, data):
    \"\"\"每日执行逻辑\"\"\"
    # 获取历史数据
    hist = data.history(context.stock, 'close', 20, '1d')
    
    # 计算均线
    ma5 = hist[-5:].mean()
    ma20 = hist.mean()
    
    # 交易逻辑
    current_price = data.current(context.stock, 'price')
    
    if ma5 > ma20 and context.stock not in context.portfolio.positions:
        # 买入信号
        context.order_target(context.stock, 1000)
    elif ma5 < ma20 and context.stock in context.portfolio.positions:
        # 卖出信号
        context.order_target(context.stock, 0)
`;

export default function CodeEditor({
  value = defaultCode,
  onChange,
  readOnly = false,
  height = '400px',
}: CodeEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // 创建编辑器实例
    editorRef.current = monaco.editor.create(containerRef.current, {
      value,
      language: 'python',
      theme: 'vs-dark',
      readOnly,
      automaticLayout: true,
      minimap: { enabled: false },
      fontSize: 13,
      fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
      lineNumbers: 'on',
      scrollBeyondLastLine: false,
      renderLineHighlight: 'line',
      padding: { top: 16, bottom: 16 },
      scrollbar: {
        vertical: 'auto',
        horizontal: 'auto',
        verticalScrollbarSize: 8,
        horizontalScrollbarSize: 8,
      },
    });

    // 监听内容变化
    if (onChange) {
      editorRef.current.onDidChangeModelContent(() => {
        onChange(editorRef.current?.getValue() || '');
      });
    }

    // 清理
    return () => {
      editorRef.current?.dispose();
    };
  }, []);

  // 更新值
  useEffect(() => {
    if (editorRef.current) {
      const currentValue = editorRef.current.getValue();
      if (value !== currentValue) {
        editorRef.current.setValue(value);
      }
    }
  }, [value]);

  return (
    <div
      ref={containerRef}
      className="border border-border rounded-lg overflow-hidden"
      style={{ height }}
    />
  );
}
