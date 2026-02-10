import React, { useEffect, useRef, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import AppHeader from '../components/AppHeader';
import Sidebar from '../components/Sidebar';
import Home from '../pages/Home';
import BidOptions from '../pages/BidOptions';
import GameBid from '../pages/GameBid/index';
import Login from '../pages/Login';
import Players from '../pages/Players';
import Transactions from '../pages/Transactions';
import BetHistory from '../pages/BetHistory';
import Settings from '../pages/Settings';
import MarketAnalysis from '../pages/MarketAnalysis';
import MarketsOverview from '../pages/MarketsOverview';

// Scroll to top on route change
const ScrollToTop = () => {
  const { pathname } = useLocation();
  const prevPathRef = useRef(null);

  useEffect(() => {
    try {
      if (prevPathRef.current) {
        sessionStorage.setItem('prevPathname', prevPathRef.current);
      }
    } catch (_) {}
    prevPathRef.current = pathname;

    const scrollToTop = () => {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      if (document.documentElement) document.documentElement.scrollTop = 0;
      if (document.body) document.body.scrollTop = 0;
      setTimeout(() => {
        const scrollableElements = document.querySelectorAll('[class*="overflow-y-auto"], [class*="overflow-y-scroll"], [class*="overflow-auto"]');
        scrollableElements.forEach((el) => {
          if (el.scrollTop > 0) el.scrollTop = 0;
        });
      }, 10);
    };

    scrollToTop();
    const timer = setTimeout(scrollToTop, 50);
    return () => clearTimeout(timer);
  }, [pathname]);

  return null;
};

const PUBLIC_PATHS = ['/login'];
// Pages that only require bookie login (not player selection)
const BOOKIE_ONLY_PATHS = ['/players', '/', '/transactions', '/bet-history', '/settings', '/market-analysis', '/markets-overview'];

const Layout = ({ children }) => {
  const location = useLocation();
  const [hasBookie, setHasBookie] = useState(() => !!localStorage.getItem('bookie'));
  const [hasUser, setHasUser] = useState(() => !!localStorage.getItem('user'));
  const isLoginPage = location.pathname === '/login';
  const isPlayersPage = location.pathname === '/players' || location.pathname === '/';

  useEffect(() => {
    const checkBookie = () => setHasBookie(!!localStorage.getItem('bookie'));
    const checkUser = () => setHasUser(!!localStorage.getItem('user'));
    const checkAll = () => { checkBookie(); checkUser(); };

    window.addEventListener('bookieLogin', checkAll);
    window.addEventListener('bookieLogout', checkAll);
    window.addEventListener('userLogin', checkAll);
    window.addEventListener('userLogout', checkAll);
    window.addEventListener('storage', checkAll);
    return () => {
      window.removeEventListener('bookieLogin', checkAll);
      window.removeEventListener('bookieLogout', checkAll);
      window.removeEventListener('userLogin', checkAll);
      window.removeEventListener('userLogout', checkAll);
      window.removeEventListener('storage', checkAll);
    };
  }, []);

  const isPublicPath = PUBLIC_PATHS.includes(location.pathname);
  const isBookieOnlyPath = BOOKIE_ONLY_PATHS.includes(location.pathname) || location.pathname.startsWith('/market-analysis');

  // Not logged in as bookie → redirect to login
  if (!hasBookie && !isPublicPath) {
    return <Navigate to="/login" replace />;
  }

  // Bookie logged in but no player selected → redirect to players (except for bookie-only pages)
  if (hasBookie && !hasUser && !isPublicPath && !isBookieOnlyPath) {
    return <Navigate to="/players" replace />;
  }

  // Login page: no layout wrapper
  if (isLoginPage) {
    return <>{children}</>;
  }

  // Players page: sidebar + content (no header)
  if (isPlayersPage) {
    return (
      <div className="min-h-screen bg-white w-full max-w-full overflow-x-hidden">
        <Sidebar />
        <div className="ml-56 sm:ml-64 md:ml-72">
          {children}
        </div>
      </div>
    );
  }

  // All other pages: sidebar + header + content
  return (
    <div className="min-h-screen bg-white w-full max-w-full overflow-x-hidden">
      <Sidebar />
      <AppHeader />
      <div className="ml-56 sm:ml-64 md:ml-72 pt-[calc(52px+env(safe-area-inset-top,0px))]">
        {children}
      </div>
    </div>
  );
};

const AppRoutes = () => {
  return (
    <Router>
        <ScrollToTop />
        <Layout>
          <Routes>
            <Route path="/" element={<Players />} />
            <Route path="/login" element={<Login />} />
            <Route path="/players" element={<Players />} />
            <Route path="/home" element={<Home />} />
            <Route path="/bid-options/:marketId" element={<BidOptions />} />
            <Route path="/game-bid" element={<GameBid />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/bet-history" element={<BetHistory />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/market-analysis/:marketId" element={<MarketAnalysis />} />
            <Route path="/markets-overview" element={<MarketsOverview />} />
          </Routes>
        </Layout>
    </Router>
  );
};

export default AppRoutes;
