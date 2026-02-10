import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const BidOptions = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const market = location.state?.market;

  useEffect(() => {
    if (!market) {
      navigate('/home', { replace: true });
    }
  }, [market, navigate]);

  const options = [
    { id: 1, title: 'Single Digit', icon: '🎯' },
    { id: 2, title: 'Single Digit Bulk', icon: '🎯' },
    { id: 3, title: 'Jodi', icon: '🎲' },
    { id: 4, title: 'Jodi Bulk', icon: '🎲' },
    { id: 5, title: 'Single Pana', icon: '🃏' },
    { id: 6, title: 'Single Pana Bulk', icon: '🃏' },
    { id: 7, title: 'Double Pana', icon: '🃏' },
    { id: 8, title: 'Double Pana Bulk', icon: '🃏' },
    { id: 9, title: 'Triple Pana', icon: '🎰' },
    { id: 10, title: 'Full Sangam', icon: '💎' },
    { id: 11, title: 'Half Sangam (O)', icon: '💎' },
  ];

  if (!market) return null;

  // When market has an active open session, hide close-only bet types
  const isRunning = market.status === 'running';
  const visibleOptions = isRunning
    ? options.filter((opt) => {
        const t = (opt.title || '').toLowerCase().trim();
        const hideWhenRunning = new Set([
          'jodi', 'jodi bulk', 'full sangam', 'half sangam (o)', 'half sangam (a)',
        ]);
        return !hideWhenRunning.has(t);
      })
    : options;

  return (
    <div className="min-h-screen bg-white flex flex-col items-center">
      {/* Header */}
      <div className="w-full flex items-center px-3 sm:px-4 pt-4 sm:pt-5 pb-3 sm:pb-4 bg-white border-b border-blue-200 relative">
        <button
          onClick={() => navigate('/home')}
          className="absolute left-3 sm:left-4 flex items-center justify-center min-w-[44px] min-h-[44px] -ml-1 text-gray-400 hover:text-gray-900 active:scale-95"
          aria-label="Back"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        <div className="w-full text-center pr-12 pl-12 min-w-0">
          <h1 className="text-gray-900 font-bold text-base sm:text-lg tracking-wider uppercase inline-block border-b-2 border-blue-600 pb-1 px-2 py-1 truncate max-w-full">
            {market?.marketName || market?.gameName || 'SELECT MARKET'}
          </h1>
        </div>
      </div>

      {/* Grid Content */}
      <div className="w-full max-w-md lg:max-w-none px-3 sm:px-4 pt-3 sm:pt-4 pb-24 md:pb-6 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
        {visibleOptions.map((option) => (
          <div
            key={option.id}
            onClick={() => navigate('/game-bid', {
              state: {
                market,
                betType: option.title,
                gameMode: option.title.toLowerCase().includes('bulk') ? 'bulk' : 'easy'
              }
            })}
            className="relative rounded-2xl bg-white border border-blue-200 p-3.5 sm:p-4 flex flex-col items-center justify-center gap-2 sm:gap-2.5 hover:bg-blue-50 hover:border-blue-400 active:scale-[0.98] transition-all cursor-pointer shadow-sm group min-h-[104px] sm:min-h-[120px]"
          >
            <div className="text-4xl sm:text-5xl">{option.icon}</div>
            <span className="text-gray-900 text-[10px] sm:text-[11px] md:text-sm font-semibold tracking-[0.14em] uppercase text-center line-clamp-2 leading-tight">
              {option.title}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BidOptions;
