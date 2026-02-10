import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const BidOptions = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const market = location.state?.market;
  // Redirect to home if no market (direct URL access or refresh)
  useEffect(() => {
    if (!market) {
      navigate('/', { replace: true });
    }
  }, [market, navigate]);

  const BidIcon = ({ label }) => {
    const cls = "w-full h-full text-[#d4af37]";
    if (label.includes('Single Digit')) return <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5.25 7.5A2.25 2.25 0 017.5 5.25h9a2.25 2.25 0 012.25 2.25v9a2.25 2.25 0 01-2.25 2.25h-9a2.25 2.25 0 01-2.25-2.25v-9z" /><text x="12" y="14" textAnchor="middle" fill="#d4af37" fontSize="8" fontWeight="bold">1</text></svg>;
    if (label.includes('Jodi')) return <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><rect x="3" y="5" width="7" height="14" rx="1.5" /><rect x="14" y="5" width="7" height="14" rx="1.5" /></svg>;
    if (label.includes('Single Pana')) return <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><rect x="2" y="5" width="6" height="14" rx="1.5" /><rect x="9" y="5" width="6" height="14" rx="1.5" /><rect x="16" y="5" width="6" height="14" rx="1.5" /></svg>;
    if (label.includes('Double Pana')) return <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><rect x="2" y="5" width="6" height="14" rx="1.5" /><rect x="9" y="5" width="6" height="14" rx="1.5" /><rect x="16" y="5" width="6" height="14" rx="1.5" /><line x1="5" y1="12" x2="19" y2="12" strokeWidth={1} /></svg>;
    if (label.includes('Triple Pana')) return <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><rect x="2" y="5" width="6" height="14" rx="1.5" /><rect x="9" y="5" width="6" height="14" rx="1.5" /><rect x="16" y="5" width="6" height="14" rx="1.5" /><line x1="5" y1="9" x2="19" y2="9" strokeWidth={1} /><line x1="5" y1="15" x2="19" y2="15" strokeWidth={1} /></svg>;
    if (label.includes('Full Sangam')) return <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" /></svg>;
    if (label.includes('Half Sangam')) return <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" /><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 8.25l3 5.25" /></svg>;
    return <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" /></svg>;
  };

  const options = [
    { id: 1, title: 'Single Digit', icon: <BidIcon label="Single Digit" /> },
    { id: 2, title: 'Single Digit Bulk', icon: <BidIcon label="Single Digit Bulk" /> },
    { id: 3, title: 'Jodi', icon: <BidIcon label="Jodi" /> },
    { id: 4, title: 'Jodi Bulk', icon: <BidIcon label="Jodi Bulk" /> },
    { id: 5, title: 'Single Pana', icon: <BidIcon label="Single Pana" /> },
    { id: 6, title: 'Single Pana Bulk', icon: <BidIcon label="Single Pana Bulk" /> },
    { id: 7, title: 'Double Pana', icon: <BidIcon label="Double Pana" /> },
    { id: 8, title: 'Double Pana Bulk', icon: <BidIcon label="Double Pana Bulk" /> },
    { id: 9, title: 'Triple Pana', icon: <BidIcon label="Triple Pana" /> },
    { id: 10, title: 'Full Sangam', icon: <BidIcon label="Full Sangam" /> },
    { id: 11, title: 'Half Sangam (O)', icon: <BidIcon label="Half Sangam" /> },
  ];

  if (!market) {
    return null; // Will redirect via useEffect
  }

  // When market is "CLOSED IS RUNNING", hide options that require OPEN session.
  const isRunning = market.status === 'running';

  const visibleOptions = isRunning
    ? options.filter((opt) => {
        const t = (opt.title || '').toLowerCase().trim();
        const hideWhenRunning = new Set([
          'jodi',
          'jodi bulk',
          'full sangam',
          'half sangam (o)',
          'half sangam (a)',
        ]);
        return !hideWhenRunning.has(t);
      })
    : options;

  return (
    <div className="min-h-screen bg-black flex flex-col items-center">
      {/* Header */}
      <div className="w-full flex items-center px-3 sm:px-4 pt-4 sm:pt-5 pb-3 sm:pb-4 bg-black border-b border-gray-800 relative">
        <button
          onClick={() => navigate('/')}
          className="absolute left-3 sm:left-4 flex items-center justify-center min-w-[44px] min-h-[44px] -ml-1 text-gray-400 hover:text-white active:scale-95 touch-manipulation"
          aria-label="Back"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        <div className="w-full text-center pr-12 pl-12 min-w-0">
          {/* Dynamic market name from selected market */}
          <h1 className="text-white font-bold text-base sm:text-lg tracking-wider uppercase inline-block border-b-2 border-yellow-500 pb-1 px-2 py-1 truncate max-w-full">
            {market?.gameName || 'SELECT MARKET'}
          </h1>
        </div>
      </div>

      {/* Grid Content */}
      <div className="w-full max-w-md lg:max-w-none px-3 sm:px-4 pt-3 sm:pt-4 pb-[calc(5rem+env(safe-area-inset-bottom,0px))] md:pb-6 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
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
            className="relative rounded-2xl bg-gradient-to-br from-[#1b1d22] via-[#15171b] to-[#0f1013] border border-white/10 p-3.5 sm:p-4 flex flex-col items-center justify-center gap-2 sm:gap-2.5 hover:from-[#23262d] hover:via-[#1a1d22] hover:to-[#121418] active:scale-[0.98] transition-all cursor-pointer shadow-[0_12px_30px_rgba(0,0,0,0.38)] group touch-manipulation min-h-[104px] sm:min-h-[120px] md:min-h-[132px]"
          >
            {/* Icon Container with subtle glow effect */}
            <div className="flex items-center justify-center w-[72px] h-[72px] sm:w-[84px] sm:h-[84px] md:w-[96px] md:h-[96px] group-hover:scale-[1.03] transition-transform duration-300">
              {option.icon}
            </div>

            {/* Title */}
            <span className="text-white text-[10px] sm:text-[11px] md:text-sm font-semibold tracking-[0.14em] sm:tracking-[0.18em] uppercase text-center line-clamp-2 leading-tight">
              {option.title}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BidOptions;
