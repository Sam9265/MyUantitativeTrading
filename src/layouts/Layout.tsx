import { ReactNode } from 'react';
import { useNavStore } from '@/stores';
import {
  Home,
  TrendingUp,
  Star,
  Code,
  FlaskConical,
  Wallet,
  Settings,
} from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
}

const navItems = [
  { key: 'home', label: '首页', icon: Home },
  { key: 'market', label: '行情', icon: TrendingUp },
  { key: 'watchlist', label: '自选', icon: Star },
  { key: 'strategy', label: '策略', icon: Code },
  { key: 'backtest', label: '回测', icon: FlaskConical },
  { key: 'trade', label: '交易', icon: Wallet },
] as const;

export default function Layout({ children }: LayoutProps) {
  const { activeNav, setActiveNav } = useNavStore();

  return (
    <div className="flex h-screen bg-gradient-to-br from-primary via-primary-dark to-primary">
      {/* 侧边栏 */}
      <aside className="w-60 bg-surface/80 backdrop-blur-xl border-r border-border/50 flex flex-col shadow-xl">
        {/* Logo */}
        <div className="h-16 flex items-center px-5 border-b border-border/30">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent to-accent-hover flex items-center justify-center shadow-lg shadow-accent/20">
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
            <div>
              <span className="text-lg font-bold text-white tracking-tight">
                QuantX
              </span>
              <span className="text-xs text-neutral ml-2">量化交易</span>
            </div>
          </div>
        </div>

        {/* 导航菜单 */}
        <nav className="flex-1 py-4 px-3">
          <div className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeNav === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => setActiveNav(item.key)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-accent/20 to-accent/5 text-accent shadow-lg shadow-accent/10'
                      : 'text-neutral hover:bg-surface-hover hover:text-white'
                  }`}
                >
                  <div className={`p-1.5 rounded-lg transition-colors ${
                    isActive ? 'bg-accent/20' : 'hover:bg-white/5'
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span>{item.label}</span>
                  {isActive && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-accent" />
                  )}
                </button>
              );
            })}
          </div>
        </nav>

        {/* 底部设置 */}
        <div className="p-3 border-t border-border/30">
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-neutral hover:text-white hover:bg-surface-hover transition-all duration-200">
            <Settings className="w-5 h-5" />
            <span>设置</span>
          </button>
        </div>
      </aside>

      {/* 主内容区 */}
      <main className="flex-1 overflow-hidden">
        {children}
      </main>
    </div>
  );
}
