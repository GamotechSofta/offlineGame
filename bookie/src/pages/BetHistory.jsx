import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BASE_URL from '../config/api';

const BetHistory = () => {
    const navigate = useNavigate();
    const bookie = JSON.parse(localStorage.getItem('bookie') || 'null');
    const [bets, setBets] = useState([]);
    const [players, setPlayers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('all');

    useEffect(() => {
        if (!bookie) { navigate('/login'); return; }
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const pRes = await fetch(`${BASE_URL}/bookie/players?bookieId=${encodeURIComponent(bookie.id)}`);
            const pData = await pRes.json();
            const playerList = pData.success ? (pData.data || []) : [];
            setPlayers(playerList);

            const allBets = [];
            for (const p of playerList) {
                try {
                    const bRes = await fetch(`${BASE_URL}/bookie/players/${p._id || p.id}/bets`);
                    const bData = await bRes.json();
                    if (bData.success && bData.data) {
                        bData.data.forEach((b) => allBets.push({ ...b, playerName: p.name }));
                    }
                } catch { }
            }
            allBets.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            setBets(allBets);
        } catch { } finally {
            setLoading(false);
        }
    };

    const filtered = statusFilter === 'all' ? bets : bets.filter((b) => b.status === statusFilter);

    const totalBets = bets.length;
    const totalAmount = bets.reduce((s, b) => s + (b.amount || 0), 0);
    const totalWin = bets.filter((b) => b.status === 'won').reduce((s, b) => s + (b.winAmount || 0), 0);

    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        const d = new Date(dateStr);
        return d.toLocaleString('en-IN', { day: '2-digit', month: 'short', year: '2-digit', hour: '2-digit', minute: '2-digit', hour12: true });
    };

    const statusColor = (status) => {
        switch (status) {
            case 'won': return 'text-green-600 bg-green-100';
            case 'lost': return 'text-red-600 bg-red-100';
            default: return 'text-yellow-600 bg-yellow-100';
        }
    };

    return (
        <div className="min-h-screen bg-white">
            <div className="px-3 py-4 max-w-2xl mx-auto space-y-4">
                <h2 className="text-gray-900 font-bold text-xl">Bet History</h2>

                {/* Summary Cards */}
                <div className="grid grid-cols-3 gap-2">
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-center">
                        <p className="text-lg font-black text-gray-900">{totalBets}</p>
                        <p className="text-gray-500 text-[10px]">Total Bets</p>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-center">
                        <p className="text-lg font-black text-blue-600">₹{totalAmount.toLocaleString('en-IN')}</p>
                        <p className="text-gray-500 text-[10px]">Wagered</p>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-center">
                        <p className="text-lg font-black text-green-600">₹{totalWin.toLocaleString('en-IN')}</p>
                        <p className="text-gray-500 text-[10px]">Won</p>
                    </div>
                </div>

                {/* Status Filter */}
                <div className="flex border border-blue-200 rounded-xl overflow-hidden">
                    {[
                        { key: 'all', label: 'All' },
                        { key: 'pending', label: 'Pending' },
                        { key: 'won', label: 'Won' },
                        { key: 'lost', label: 'Lost' },
                    ].map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setStatusFilter(tab.key)}
                            className={`flex-1 py-2.5 text-xs font-bold transition-colors ${statusFilter === tab.key ? 'bg-blue-600 text-white' : 'text-gray-500 hover:text-gray-900'}`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Bet List */}
                {loading ? (
                    <div className="animate-pulse space-y-2">
                        {[1, 2, 3, 4].map((i) => <div key={i} className="h-20 bg-blue-100 rounded-xl" />)}
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-16 text-gray-400">
                        <svg className="w-16 h-16 mx-auto mb-3 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-sm">No bets found</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {filtered.map((b, idx) => (
                            <div key={b.id || b._id || idx} className="bg-white border border-blue-200 rounded-xl px-4 py-3 shadow-sm">
                                <div className="flex items-start justify-between mb-2">
                                    <div>
                                        <p className="text-gray-900 text-sm font-bold">{b.marketName || 'Unknown Market'}</p>
                                        <p className="text-gray-500 text-xs">{b.playerName || 'Unknown Player'}</p>
                                    </div>
                                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${statusColor(b.status)}`}>
                                        {b.status || 'pending'}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between text-xs">
                                    <div className="flex gap-3">
                                        <span className="text-gray-500">Type: <span className="text-gray-700">{b.betType || '-'}</span></span>
                                        <span className="text-gray-500">No: <span className="text-blue-600 font-bold">{b.betNumber || '-'}</span></span>
                                        <span className="text-gray-500">On: <span className="text-gray-700">{b.betOn || 'open'}</span></span>
                                    </div>
                                    <p className="text-blue-600 font-bold">₹{Number(b.amount).toLocaleString('en-IN')}</p>
                                </div>
                                <p className="text-gray-400 text-[10px] mt-1">{formatDate(b.createdAt)}</p>
                                {b.status === 'won' && b.winAmount > 0 && (
                                    <p className="text-green-600 text-xs font-bold mt-1">Won: ₹{Number(b.winAmount).toLocaleString('en-IN')}</p>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default BetHistory;
