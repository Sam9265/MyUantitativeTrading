import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from '@/layouts/Layout';
import { useNavStore } from '@/stores';
import MarketPage from '@/pages/MarketPage';
import WatchlistPage from '@/pages/WatchlistPage';
import StrategyPage from '@/pages/StrategyPage';
import BacktestPage from '@/pages/BacktestPage';
import TradePage from '@/pages/TradePage';
import StockDetailPage from '@/pages/StockDetailPage';

function MainContent() {
  const { activeNav } = useNavStore();

  return (
    <>
      {activeNav === 'market' && <MarketPage />}
      {activeNav === 'watchlist' && <WatchlistPage />}
      {activeNav === 'strategy' && <StrategyPage />}
      {activeNav === 'backtest' && <BacktestPage />}
      {activeNav === 'trade' && <TradePage />}
    </>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <Layout>
              <MainContent />
            </Layout>
          }
        />
        <Route
          path="/stock/:code"
          element={
            <Layout>
              <StockDetailPage />
            </Layout>
          }
        />
      </Routes>
    </Router>
  );
}
