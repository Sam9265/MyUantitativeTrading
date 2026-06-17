import { create } from 'zustand';
import type { Stock, Market, Strategy, BacktestResult, Position, Order, SimulatedAccount } from '@/types';

// 市场行情Store
interface MarketStore {
  currentMarket: Market;
  stocks: Stock[];
  selectedStock: Stock | null;
  loading: boolean;
  setMarket: (market: Market) => void;
  setStocks: (stocks: Stock[]) => void;
  setSelectedStock: (stock: Stock | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useMarketStore = create<MarketStore>((set) => ({
  currentMarket: 'CN',
  stocks: [],
  selectedStock: null,
  loading: false,
  setMarket: (market) => set({ currentMarket: market }),
  setStocks: (stocks) => set({ stocks }),
  setSelectedStock: (stock) => set({ selectedStock: stock }),
  setLoading: (loading) => set({ loading }),
}));

// 自选股Store
interface WatchlistStore {
  watchlist: Stock[];
  addToWatchlist: (stock: Stock) => void;
  removeFromWatchlist: (code: string) => void;
}

export const useWatchlistStore = create<WatchlistStore>((set) => ({
  watchlist: [],
  addToWatchlist: (stock) =>
    set((state) => ({
      watchlist: state.watchlist.some((s) => s.code === stock.code)
        ? state.watchlist
        : [...state.watchlist, stock],
    })),
  removeFromWatchlist: (code) =>
    set((state) => ({
      watchlist: state.watchlist.filter((s) => s.code !== code),
    })),
}));

// 策略Store
interface StrategyStore {
  strategies: Strategy[];
  currentStrategy: Strategy | null;
  setStrategies: (strategies: Strategy[]) => void;
  setCurrentStrategy: (strategy: Strategy | null) => void;
  addStrategy: (strategy: Strategy) => void;
  updateStrategy: (strategy: Strategy) => void;
  deleteStrategy: (id: string) => void;
}

export const useStrategyStore = create<StrategyStore>((set) => ({
  strategies: [],
  currentStrategy: null,
  setStrategies: (strategies) => set({ strategies }),
  setCurrentStrategy: (strategy) => set({ currentStrategy: strategy }),
  addStrategy: (strategy) =>
    set((state) => ({ strategies: [...state.strategies, strategy] })),
  updateStrategy: (strategy) =>
    set((state) => ({
      strategies: state.strategies.map((s) =>
        s.id === strategy.id ? strategy : s
      ),
    })),
  deleteStrategy: (id) =>
    set((state) => ({
      strategies: state.strategies.filter((s) => s.id !== id),
    })),
}));

// 回测Store
interface BacktestStore {
  results: BacktestResult[];
  currentResult: BacktestResult | null;
  setResults: (results: BacktestResult[]) => void;
  setCurrentResult: (result: BacktestResult | null) => void;
  addResult: (result: BacktestResult) => void;
}

export const useBacktestStore = create<BacktestStore>((set) => ({
  results: [],
  currentResult: null,
  setResults: (results) => set({ results }),
  setCurrentResult: (result) => set({ currentResult: result }),
  addResult: (result) =>
    set((state) => ({ results: [...state.results, result] })),
}));

// 交易Store (模拟交易)
interface TradeStore {
  account: SimulatedAccount;
  orders: Order[];
  positions: Position[];
  setAccount: (account: SimulatedAccount) => void;
  setOrders: (orders: Order[]) => void;
  setPositions: (positions: Position[]) => void;
  addOrder: (order: Order) => void;
  updateOrder: (order: Order) => void;
  updatePosition: (position: Position) => void;
}

export const useTradeStore = create<TradeStore>((set) => ({
  account: {
    cash: 1000000, // 初始100万
    totalAssets: 1000000,
    positions: [],
  },
  orders: [],
  positions: [],
  setAccount: (account) => set({ account }),
  setOrders: (orders) => set({ orders }),
  setPositions: (positions) => set({ positions }),
  addOrder: (order) => set((state) => ({ orders: [order, ...state.orders] })),
  updateOrder: (order) =>
    set((state) => ({
      orders: state.orders.map((o) => (o.id === order.id ? order : o)),
    })),
  updatePosition: (position) =>
    set((state) => ({
      positions: state.positions.map((p) =>
        p.code === position.code ? position : p
      ),
    })),
}));

// 导航Store
type NavKey = 'market' | 'watchlist' | 'strategy' | 'backtest' | 'trade';

interface NavStore {
  activeNav: NavKey;
  setActiveNav: (nav: NavKey) => void;
}

export const useNavStore = create<NavStore>((set) => ({
  activeNav: 'market',
  setActiveNav: (nav) => set({ activeNav: nav }),
}));
