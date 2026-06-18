import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from '@/layouts/Layout';
import { useNavStore } from '@/stores';
import Home from '@/pages/Home';
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
      {activeNav === 'home' && <Home />}
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
          path="/home"
          element={
            <Layout>
              <Home />
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
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </Router>
  );
}
