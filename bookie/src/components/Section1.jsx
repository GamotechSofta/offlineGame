import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import BASE_URL from '../config/api';
import { useRefreshOnMarketReset } from '../hooks/useRefreshOnMarketReset';
import { isPastClosingTime } from '../utils/marketTiming';

const formatTime12 = (timeStr) => {
    if (!timeStr) return '';
    const [h, m] = timeStr.split(':').map(Number);
    if (!Number.isFinite(h)) return timeStr;
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    const min = Number.isFinite(m) ? String(m).padStart(2, '0') : '00';
    return `${h12}:${min} ${ampm}`;
};

const Section1 = () => {
    const [markets, setMarkets] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchMarkets = useCallback(async () => {
        try {
            setLoading(true);
            const res = await fetch(`${BASE_URL}/markets/get-markets`);
            const data = await res.json();
            if (data.success) setMarkets(data.data || []);
        } catch {
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchMarkets(); }, [fetchMarkets]);
    useRefreshOnMarketReset(fetchMarkets);

    const handleMarketClick = (market) => {
        const user = JSON.parse(localStorage.getItem('user') || 'null');
        if (!user) {
            navigate('/players');
            return;
        }
        // Normalize market to always have an `id` field for consistency
        const marketWithId = { ...market, id: market._id || market.id };
        navigate(`/bid-options/${marketWithId.id}`, { state: { market: marketWithId } });
    };

    if (loading) {
        return (
            <div className="px-3 py-8">
                <div className="animate-pulse space-y-3">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-20 bg-blue-100 rounded-xl" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="px-3 py-3">
            <div className="flex items-center justify-between mb-3">
                <h2 className="text-gray-900 font-bold text-lg">Markets</h2>
                <button
                    onClick={() => navigate('/markets-overview')}
                    className="text-blue-600 text-xs font-medium hover:underline flex items-center gap-1"
                >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    Analysis
                </button>
            </div>
            <div className="space-y-3">
                {markets.filter(m => m.isActive !== false && !m.isDeleted).map((market) => {
                    const isClosed = isPastClosingTime(market);
                    const openTime = formatTime12(market.startingTime || market.openingTime);
                    const closeTime = formatTime12(market.closingTime);
                    const result = market.displayResult || '';
                    const mId = market._id || market.id;

                    return (
                        <div
                            key={mId}
                            className="bg-white border border-blue-200 rounded-xl overflow-hidden hover:border-blue-400 transition-all shadow-sm"
                        >
                            <button
                                onClick={() => handleMarketClick(market)}
                                className="w-full p-3 flex items-center justify-between active:scale-[0.99] transition-transform"
                            >
                                <div className="text-left flex-1">
                                    <h3 className="text-gray-900 font-bold text-sm">
                                        {market.marketName || market.gameName}
                                    </h3>
                                    <p className="text-gray-500 text-xs mt-0.5">
                                        {openTime} - {closeTime}
                                    </p>
                                    {result && result !== '***-**-***' && (
                                        <p className="text-blue-600 font-bold text-sm mt-1">{result}</p>
                                    )}
                                </div>
                                <div className={`px-3 py-1 rounded-full text-xs font-bold ${isClosed ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                                    {isClosed ? 'CLOSED' : 'OPEN'}
                                </div>
                            </button>
                            {/* Analysis button at bottom */}
                            <div className="border-t border-blue-100">
                                <button
                                    onClick={(e) => { e.stopPropagation(); navigate(`/market-analysis/${mId}`); }}
                                    className="w-full flex items-center justify-center gap-1.5 py-2 text-[11px] font-medium text-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                                >
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                    </svg>
                                    View Analysis
                                </button>
                            </div>
                        </div>
                    );
                })}
                {markets.length === 0 && (
                    <div className="text-center py-8 text-gray-400">No markets available</div>
                )}
            </div>
        </div>
    );
};

export default Section1;
