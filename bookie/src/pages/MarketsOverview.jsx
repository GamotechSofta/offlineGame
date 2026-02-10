import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import BASE_URL from '../config/api';
import { isPastClosingTime } from '../utils/marketTiming';

const formatTime12 = (t) => {
    if (!t) return '';
    const [h, m] = t.split(':').map(Number);
    if (!Number.isFinite(h)) return t;
    return `${h % 12 || 12}:${String(m ?? 0).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
};

const MarketsOverview = () => {
    const navigate = useNavigate();
    const bookie = JSON.parse(localStorage.getItem('bookie') || 'null');
    const [markets, setMarkets] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchMarkets = useCallback(async () => {
        try {
            setLoading(true);
            const res = await fetch(`${BASE_URL}/markets/get-markets`);
            const data = await res.json();
            if (data.success) setMarkets(data.data || []);
        } catch { } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (!bookie) { navigate('/login'); return; }
        fetchMarkets();
    }, []);

    const activeMarkets = markets.filter(m => m.isActive !== false && !m.isDeleted);
    const openCount = activeMarkets.filter(m => !isPastClosingTime(m)).length;
    const closedCount = activeMarkets.length - openCount;

    return (
        <div className="min-h-screen bg-white">
            <div className="px-3 py-4 max-w-2xl mx-auto space-y-4 pb-24">
                <h2 className="text-gray-900 font-bold text-xl">Markets Overview</h2>

                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-2">
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-center">
                        <p className="text-lg font-black text-gray-900">{activeMarkets.length}</p>
                        <p className="text-gray-500 text-[10px]">Total Markets</p>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-center">
                        <p className="text-lg font-black text-green-600">{openCount}</p>
                        <p className="text-gray-500 text-[10px]">Open Now</p>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-center">
                        <p className="text-lg font-black text-red-600">{closedCount}</p>
                        <p className="text-gray-500 text-[10px]">Closed</p>
                    </div>
                </div>

                {/* Markets List */}
                {loading ? (
                    <div className="animate-pulse space-y-2">
                        {[1, 2, 3].map(i => <div key={i} className="h-24 bg-blue-100 rounded-xl" />)}
                    </div>
                ) : activeMarkets.length === 0 ? (
                    <div className="text-center py-16 text-gray-400">
                        <svg className="w-16 h-16 mx-auto mb-3 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                        <p className="text-sm">No markets available</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {activeMarkets.map((market) => {
                            const isClosed = isPastClosingTime(market);
                            const mId = market._id || market.id;
                            const result = market.displayResult || '';

                            return (
                                <div key={mId} className="bg-white border border-blue-200 rounded-xl overflow-hidden shadow-sm">
                                    {/* Market Info */}
                                    <div className="flex items-center justify-between px-4 py-3">
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-gray-900 font-bold text-sm truncate">{market.marketName}</h3>
                                            <p className="text-gray-500 text-xs mt-0.5">
                                                {formatTime12(market.startingTime)} - {formatTime12(market.closingTime)}
                                            </p>
                                            {result && result !== '***-**-***' && (
                                                <p className="text-blue-600 font-bold text-sm mt-0.5">{result}</p>
                                            )}
                                        </div>
                                        <div className={`px-3 py-1 rounded-full text-xs font-bold shrink-0 ${isClosed ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                                            {isClosed ? 'CLOSED' : 'OPEN'}
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex border-t border-blue-100 divide-x divide-blue-100">
                                        <button
                                            onClick={() => navigate(`/market-analysis/${mId}`)}
                                            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium text-blue-600 hover:bg-blue-50 transition-colors"
                                        >
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                            </svg>
                                            Analysis
                                        </button>
                                        <button
                                            onClick={() => {
                                                const user = JSON.parse(localStorage.getItem('user') || 'null');
                                                if (!user) {
                                                    navigate('/players');
                                                    return;
                                                }
                                                navigate(`/bid-options/${mId}`, { state: { market: { ...market, id: mId } } });
                                            }}
                                            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium text-green-600 hover:bg-green-50 transition-colors"
                                        >
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            Play
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MarketsOverview;
