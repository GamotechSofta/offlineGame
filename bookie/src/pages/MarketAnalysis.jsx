import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import BASE_URL from '../config/api';

// ─── Helpers ────────────────────────────────────────
const formatINR = (v) => `₹${Number(v || 0).toLocaleString('en-IN')}`;
const formatDate = (d) => d ? new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', hour12: true }) : '-';
const formatTime12 = (t) => {
    if (!t) return '';
    const [h, m] = t.split(':').map(Number);
    if (!Number.isFinite(h)) return t;
    return `${h % 12 || 12}:${String(m ?? 0).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
};

const statusColor = (s) => {
    switch (s) {
        case 'won': return 'text-green-600 bg-green-100';
        case 'lost': return 'text-red-600 bg-red-100';
        default: return 'text-yellow-600 bg-yellow-100';
    }
};

// ─── Stat Card ──────────────────────────────────────
const StatCard = ({ label, value, color = 'text-gray-900', sub }) => (
    <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-center">
        <p className={`text-lg font-black ${color}`}>{value}</p>
        <p className="text-gray-500 text-[10px] mt-0.5">{label}</p>
        {sub && <p className="text-gray-400 text-[9px]">{sub}</p>}
    </div>
);

// ─── Collapsible Section ────────────────────────────
const Section = ({ title, badge, defaultOpen = false, children }) => {
    const [open, setOpen] = useState(defaultOpen);
    return (
        <div className="bg-white border border-blue-200 rounded-xl overflow-hidden shadow-sm">
            <button
                onClick={() => setOpen(!open)}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-blue-50 transition-colors"
            >
                <div className="flex items-center gap-2">
                    <h3 className="text-gray-900 font-bold text-sm">{title}</h3>
                    {badge != null && (
                        <span className="bg-blue-100 text-blue-600 text-[10px] font-bold px-2 py-0.5 rounded-full">{badge}</span>
                    )}
                </div>
                <svg className={`w-4 h-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
            </button>
            {open && <div className="px-4 pb-4 border-t border-blue-100">{children}</div>}
        </div>
    );
};

// ─── Progress Bar ───────────────────────────────────
const ProgressBar = ({ label, value, max, color = 'bg-blue-600', suffix = '' }) => {
    const pct = max > 0 ? (value / max) * 100 : 0;
    return (
        <div className="mb-2">
            <div className="flex justify-between text-xs mb-0.5">
                <span className="text-gray-700">{label}</span>
                <span className="text-gray-500">{value}{suffix}</span>
            </div>
            <div className="h-2 bg-blue-100 rounded-full overflow-hidden">
                <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${Math.min(pct, 100)}%` }} />
            </div>
        </div>
    );
};

// ═══════════════════════════════════════════════════════
// ─── MAIN COMPONENT ──────────────────────────────────
// ═══════════════════════════════════════════════════════
const MarketAnalysis = () => {
    const { marketId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const bookie = JSON.parse(localStorage.getItem('bookie') || 'null');

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState('overview');
    const [dateFilter, setDateFilter] = useState('');

    const fetchAnalysis = useCallback(async () => {
        if (!marketId || !bookie?.id) return;
        try {
            setLoading(true);
            const params = new URLSearchParams({ bookieId: bookie.id });
            if (dateFilter) params.set('date', dateFilter);
            const res = await fetch(`${BASE_URL}/markets/${marketId}/analysis?${params}`);
            const json = await res.json();
            if (json.success) setData(json.data);
        } catch { } finally {
            setLoading(false);
        }
    }, [marketId, bookie?.id, dateFilter]);

    useEffect(() => {
        if (!bookie) { navigate('/login'); return; }
        fetchAnalysis();
    }, [fetchAnalysis]);

    if (loading) {
        return (
            <div className="min-h-screen bg-white px-3 py-4">
                <div className="animate-pulse space-y-3 max-w-2xl mx-auto">
                    <div className="h-10 bg-blue-100 rounded-xl w-40" />
                    <div className="grid grid-cols-3 gap-2">{[1, 2, 3].map(i => <div key={i} className="h-20 bg-blue-100 rounded-xl" />)}</div>
                    <div className="h-64 bg-blue-100 rounded-xl" />
                </div>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-400 text-sm mb-3">Market not found or no data available</p>
                    <button onClick={() => navigate(-1)} className="text-blue-600 text-sm font-medium hover:underline">← Go Back</button>
                </div>
            </div>
        );
    }

    const { market, summary, openCloseBreakdown, byBetType, byPlayer, topNumbers, recentBets } = data;

    return (
        <div className="min-h-screen bg-white">
            <div className="px-3 py-4 max-w-3xl mx-auto space-y-4 pb-24">

                {/* ─── Header ─── */}
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-gray-900 p-1.5 rounded-lg hover:bg-blue-50 transition-colors">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                    </button>
                    <div className="flex-1">
                        <h1 className="text-gray-900 font-bold text-lg">{market.marketName}</h1>
                        <p className="text-gray-500 text-xs">
                            {formatTime12(market.startingTime)} - {formatTime12(market.closingTime)}
                            {market.displayResult && market.displayResult !== '***-**-***' && (
                                <span className="text-blue-600 ml-2 font-bold">{market.displayResult}</span>
                            )}
                        </p>
                    </div>
                    {/* Date Filter */}
                    <input
                        type="date"
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value)}
                        className="bg-blue-50 border border-blue-200 text-gray-700 text-xs rounded-lg px-2 py-1.5 focus:border-blue-500 outline-none"
                    />
                </div>

                {/* ─── Summary Cards ─── */}
                <div className="grid grid-cols-3 gap-2">
                    <StatCard label="Total Bets" value={summary.totalBets} />
                    <StatCard label="Total Wagered" value={formatINR(summary.totalAmount)} color="text-blue-600" />
                    <StatCard
                        label="Profit / Loss"
                        value={formatINR(Math.abs(summary.profitLoss))}
                        color={summary.profitLoss >= 0 ? 'text-green-600' : 'text-red-600'}
                        sub={summary.profitLoss >= 0 ? 'Profit' : 'Loss'}
                    />
                </div>
                <div className="grid grid-cols-4 gap-2">
                    <StatCard label="Pending" value={summary.pendingBets} color="text-yellow-600" />
                    <StatCard label="Won" value={summary.wonBets} color="text-green-600" />
                    <StatCard label="Lost" value={summary.lostBets} color="text-red-600" />
                    <StatCard label="Win Payout" value={formatINR(summary.totalWinPayout)} color="text-green-600" />
                </div>

                {/* ─── Open vs Close Bar ─── */}
                <div className="bg-white border border-blue-200 rounded-xl p-4 shadow-sm">
                    <h3 className="text-gray-900 font-bold text-sm mb-3">Open vs Close</h3>
                    <div className="flex gap-4 mb-3">
                        <div className="flex-1 text-center">
                            <p className="text-blue-600 font-bold text-lg">{openCloseBreakdown.open.count}</p>
                            <p className="text-gray-500 text-[10px]">Open Bets</p>
                            <p className="text-blue-500 text-xs">{formatINR(openCloseBreakdown.open.totalAmount)}</p>
                        </div>
                        <div className="w-px bg-blue-200" />
                        <div className="flex-1 text-center">
                            <p className="text-purple-600 font-bold text-lg">{openCloseBreakdown.close.count}</p>
                            <p className="text-gray-500 text-[10px]">Close Bets</p>
                            <p className="text-purple-500 text-xs">{formatINR(openCloseBreakdown.close.totalAmount)}</p>
                        </div>
                    </div>
                    {summary.totalBets > 0 && (
                        <div className="h-3 bg-blue-100 rounded-full overflow-hidden flex">
                            <div className="bg-blue-500 h-full transition-all" style={{ width: `${(openCloseBreakdown.open.count / summary.totalBets) * 100}%` }} />
                            <div className="bg-purple-500 h-full transition-all" style={{ width: `${(openCloseBreakdown.close.count / summary.totalBets) * 100}%` }} />
                        </div>
                    )}
                </div>

                {/* ─── Tabs ─── */}
                <div className="flex border border-blue-200 rounded-xl overflow-hidden">
                    {[
                        { key: 'overview', label: 'By Game Type' },
                        { key: 'byPlayer', label: 'By Player' },
                        { key: 'topNumbers', label: 'Top Numbers' },
                        { key: 'bets', label: 'All Bets' },
                    ].map(t => (
                        <button
                            key={t.key}
                            onClick={() => setTab(t.key)}
                            className={`flex-1 py-2.5 text-xs font-bold transition-colors ${tab === t.key ? 'bg-blue-600 text-white' : 'text-gray-500 hover:text-gray-900'}`}
                        >
                            {t.label}
                        </button>
                    ))}
                </div>

                {/* ─── Tab: By Game Type ─── */}
                {tab === 'overview' && (
                    <div className="space-y-2">
                        {byBetType.length === 0 ? (
                            <div className="text-center py-10 text-gray-400 text-sm">No bets placed yet</div>
                        ) : byBetType.map((bt) => (
                            <Section key={bt.betType} title={bt.betType} badge={`${bt.count} bets • ${formatINR(bt.totalAmount)}`} defaultOpen={byBetType.length <= 4}>
                                <div className="space-y-3 pt-2">
                                    <div className="grid grid-cols-4 gap-2 text-center">
                                        <div>
                                            <p className="text-gray-900 font-bold text-sm">{bt.count}</p>
                                            <p className="text-gray-400 text-[9px]">Bets</p>
                                        </div>
                                        <div>
                                            <p className="text-blue-600 font-bold text-sm">{formatINR(bt.totalAmount)}</p>
                                            <p className="text-gray-400 text-[9px]">Amount</p>
                                        </div>
                                        <div>
                                            <p className="text-green-600 font-bold text-sm">{bt.wonCount}</p>
                                            <p className="text-gray-400 text-[9px]">Won</p>
                                        </div>
                                        <div>
                                            <p className="text-red-600 font-bold text-sm">{formatINR(bt.winPayout)}</p>
                                            <p className="text-gray-400 text-[9px]">Payout</p>
                                        </div>
                                    </div>

                                    {bt.numbers.length > 0 && (
                                        <div>
                                            <p className="text-gray-400 text-[10px] font-bold uppercase mb-1.5">Number Breakdown</p>
                                            <div className="max-h-48 overflow-y-auto space-y-1">
                                                {bt.numbers.map((n) => (
                                                    <ProgressBar
                                                        key={n.number}
                                                        label={n.number}
                                                        value={n.count}
                                                        max={bt.count}
                                                        suffix={` (${formatINR(n.totalAmount)})`}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </Section>
                        ))}
                    </div>
                )}

                {/* ─── Tab: By Player ─── */}
                {tab === 'byPlayer' && (
                    <div className="space-y-2">
                        {byPlayer.length === 0 ? (
                            <div className="text-center py-10 text-gray-400 text-sm">No bets placed yet</div>
                        ) : byPlayer.map((p) => (
                            <div key={p.playerId} className="bg-white border border-blue-200 rounded-xl px-4 py-3 shadow-sm">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-600">
                                            {(p.playerName || '?').charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="text-gray-900 font-bold text-sm">{p.playerName}</p>
                                            <p className="text-gray-500 text-[10px]">{p.phone}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-blue-600 font-black text-sm">{formatINR(p.totalAmount)}</p>
                                        <p className="text-gray-500 text-[10px]">{p.count} bets</p>
                                    </div>
                                </div>
                                <div className="flex gap-4 text-xs text-gray-500 border-t border-blue-100 pt-2">
                                    <span>Won: <span className="text-green-600 font-bold">{p.wonCount}</span></span>
                                    <span>Payout: <span className="text-green-600 font-bold">{formatINR(p.winPayout)}</span></span>
                                    <span>Net: <span className={`font-bold ${(p.totalAmount - p.winPayout) >= 0 ? 'text-green-600' : 'text-red-600'}`}>{formatINR(p.totalAmount - p.winPayout)}</span></span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* ─── Tab: Top Numbers ─── */}
                {tab === 'topNumbers' && (
                    <div className="bg-white border border-blue-200 rounded-xl p-4 shadow-sm">
                        {topNumbers.length === 0 ? (
                            <div className="text-center py-10 text-gray-400 text-sm">No bets placed yet</div>
                        ) : (
                            <div className="space-y-1">
                                <p className="text-gray-400 text-[10px] font-bold uppercase mb-2">Most Bet Numbers (by amount)</p>
                                {topNumbers.map((n, i) => (
                                    <div key={n.number} className="flex items-center gap-3 py-1.5 border-b border-blue-100 last:border-0">
                                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${i < 3 ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>
                                            {i + 1}
                                        </span>
                                        <span className="text-gray-900 font-bold text-sm min-w-[60px]">{n.number}</span>
                                        <div className="flex-1 h-2 bg-blue-100 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full ${i < 3 ? 'bg-blue-600' : 'bg-gray-400'}`}
                                                style={{ width: `${(n.totalAmount / (topNumbers[0]?.totalAmount || 1)) * 100}%` }}
                                            />
                                        </div>
                                        <div className="text-right shrink-0">
                                            <p className="text-gray-700 text-xs font-medium">{formatINR(n.totalAmount)}</p>
                                            <p className="text-gray-400 text-[9px]">{n.count} bets</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* ─── Tab: All Bets ─── */}
                {tab === 'bets' && (
                    <div className="space-y-2">
                        {recentBets.length === 0 ? (
                            <div className="text-center py-10 text-gray-400 text-sm">No bets placed yet</div>
                        ) : recentBets.map((b, i) => (
                            <div key={b.id || i} className="bg-white border border-blue-200 rounded-xl px-4 py-3 shadow-sm">
                                <div className="flex items-start justify-between mb-1.5">
                                    <div>
                                        <p className="text-gray-900 text-sm font-bold">{b.playerName}</p>
                                        <p className="text-gray-500 text-[10px]">{formatDate(b.createdAt)}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${statusColor(b.status)}`}>
                                            {b.status}
                                        </span>
                                        <p className="text-blue-600 font-bold text-sm">{formatINR(b.amount)}</p>
                                    </div>
                                </div>
                                <div className="flex gap-3 text-xs text-gray-500">
                                    <span>Type: <span className="text-gray-700">{b.betType}</span></span>
                                    <span>No: <span className="text-blue-600 font-bold">{b.betNumber}</span></span>
                                    <span>On: <span className="text-gray-700">{b.betOn}</span></span>
                                    {b.status === 'won' && b.winAmount > 0 && (
                                        <span>Won: <span className="text-green-600 font-bold">{formatINR(b.winAmount)}</span></span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

            </div>
        </div>
    );
};

export default MarketAnalysis;
