import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const GAME_OPTIONS = [
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

const Sidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const bookie = JSON.parse(localStorage.getItem('bookie') || 'null');
    const player = JSON.parse(localStorage.getItem('user') || 'null');

    // Detect if we're on bid-options or game-bid page
    const isBidPage = location.pathname.startsWith('/bid-options') || location.pathname === '/game-bid';
    const market = location.state?.market || null;
    const currentBetType = location.state?.betType || null;

    const handleLogout = () => {
        localStorage.removeItem('bookie');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const handleSwitchPlayer = () => {
        localStorage.removeItem('user');
        window.dispatchEvent(new Event('userLogout'));
        navigate('/players');
    };

    const handleGameClick = (option) => {
        if (!market) return;
        navigate('/game-bid', {
            state: {
                market,
                betType: option.title,
                gameMode: option.title.toLowerCase().includes('bulk') ? 'bulk' : 'easy',
            },
        });
    };

    const isActive = (path) => location.pathname === path;

    const menuItems = [
        {
            section: 'Main',
            items: [
                {
                    label: 'Players',
                    path: '/players',
                    icon: (
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    ),
                },
                {
                    label: 'Markets',
                    path: '/home',
                    icon: (
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    ),
                },
                {
                    label: 'Market Analysis',
                    path: '/markets-overview',
                    icon: (
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    ),
                },
            ],
        },
        {
            section: 'Finance',
            items: [
                {
                    label: 'Transactions',
                    path: '/transactions',
                    icon: (
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                    ),
                },
                {
                    label: 'Bet History',
                    path: '/bet-history',
                    icon: (
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    ),
                },
            ],
        },
        {
            section: 'Account',
            items: [
                {
                    label: 'Settings',
                    path: '/settings',
                    icon: (
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    ),
                    icon2: (
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    ),
                },
            ],
        },
    ];

    return (
        <aside className="fixed left-0 top-0 h-screen w-56 sm:w-64 md:w-72 bg-blue-800 border-r border-blue-700 shadow-2xl flex flex-col z-50">
            {/* ─── Profile Section ─── */}
            <div className="px-3 sm:px-5 pt-4 sm:pt-6 pb-3 sm:pb-4 border-b border-blue-700 shrink-0">
                <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white flex items-center justify-center shadow-lg shrink-0">
                        <span className="text-blue-800 font-black text-sm sm:text-lg">
                            {(bookie?.name || bookie?.username || 'B').charAt(0).toUpperCase()}
                        </span>
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="text-white font-bold text-xs sm:text-sm truncate">{bookie?.name || bookie?.username || 'Bookie'}</h3>
                        <p className="text-blue-200 text-[10px] sm:text-xs truncate">{bookie?.phone || 'Bookie Panel'}</p>
                    </div>
                </div>

                {/* Active Player Pill */}
                {player && (
                    <div className="mt-2 sm:mt-3 bg-blue-700/50 border border-blue-600 rounded-xl px-2 sm:px-3 py-1.5 sm:py-2 flex items-center justify-between">
                        <div className="min-w-0">
                            <p className="text-[9px] sm:text-[10px] text-blue-300 uppercase tracking-wider font-medium">Playing as</p>
                            <p className="text-white text-xs sm:text-sm font-bold truncate">{player.name}</p>
                        </div>
                        <div className="text-right shrink-0 ml-2">
                            <p className="text-blue-100 font-black text-xs sm:text-sm">₹{Number(player.balance || player.wallet || 0).toLocaleString('en-IN')}</p>
                            <button
                                onClick={handleSwitchPlayer}
                                className="text-[9px] sm:text-[10px] text-blue-300 hover:text-white transition-colors"
                            >
                                Switch →
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* ─── Navigation ─── */}
            <div className="flex-1 overflow-y-auto py-2 sm:py-3 px-2 sm:px-3">
                {isBidPage && market ? (
                    /* ─── Game Types ONLY (on bid-options / game-bid pages) ─── */
                    <>
                        {/* Back to markets link */}
                        <button
                            onClick={() => navigate('/home')}
                            className="w-full flex items-center gap-2 px-2 sm:px-3 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-medium text-blue-300 hover:bg-blue-700 hover:text-white transition-all mb-2"
                        >
                            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            <span>Back to Markets</span>
                        </button>

                        <div className="mb-3 sm:mb-4">
                            <p className="text-blue-300 text-[9px] sm:text-[10px] uppercase tracking-widest font-bold px-2 sm:px-3 mb-1.5">
                                {market.marketName || market.gameName || 'Games'}
                            </p>
                            <div className="space-y-0.5">
                                {GAME_OPTIONS.map((option) => {
                                    const active = currentBetType === option.title;
                                    return (
                                        <button
                                            key={option.id}
                                            onClick={() => handleGameClick(option)}
                                            className={`w-full flex items-center gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-xl text-xs font-medium transition-all ${
                                                active
                                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                                                    : 'text-blue-200 hover:bg-blue-700 hover:text-white'
                                            }`}
                                        >
                                            <span className="text-base sm:text-lg shrink-0 w-6 text-center">{option.icon}</span>
                                            <span className="truncate">{option.title}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </>
                ) : (
                    /* ─── Normal menu (all other pages) ─── */
                    menuItems.map((section) => (
                        <div key={section.section} className="mb-3 sm:mb-4">
                            <p className="text-blue-300 text-[9px] sm:text-[10px] uppercase tracking-widest font-bold px-2 sm:px-3 mb-1 sm:mb-1.5">{section.section}</p>
                            {section.items.map((item) => (
                                <button
                                    key={item.path}
                                    onClick={() => navigate(item.path)}
                                    className={`w-full flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all ${isActive(item.path)
                                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                                        : 'text-blue-200 hover:bg-blue-700 hover:text-white'
                                        }`}
                                >
                                    <svg className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                                        {item.icon}
                                        {item.icon2 && item.icon2}
                                    </svg>
                                    <span className="truncate">{item.label}</span>
                                </button>
                            ))}
                        </div>
                    ))
                )}
            </div>

            {/* ─── Footer ─── */}
            <div className="border-t border-blue-700 p-2 sm:p-3 shrink-0">
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 py-2 sm:py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm font-medium transition-colors"
                >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Logout
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
