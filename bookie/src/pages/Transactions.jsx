import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BASE_URL from '../config/api';

const Transactions = () => {
    const navigate = useNavigate();
    const bookie = JSON.parse(localStorage.getItem('bookie') || 'null');
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        if (!bookie) { navigate('/login'); return; }
        fetchTransactions();
    }, []);

    const fetchTransactions = async () => {
        try {
            setLoading(true);
            const res = await fetch(`${BASE_URL}/bookie/transactions?bookieId=${encodeURIComponent(bookie.id)}`);
            const data = await res.json();
            if (data.success) setTransactions(data.data || []);
        } catch { } finally {
            setLoading(false);
        }
    };

    const filtered = filter === 'all' ? transactions : transactions.filter((t) => t.type === filter);

    const totalCredit = transactions.filter((t) => t.type === 'credit').reduce((s, t) => s + (t.amount || 0), 0);
    const totalDebit = transactions.filter((t) => t.type === 'debit').reduce((s, t) => s + (t.amount || 0), 0);

    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        const d = new Date(dateStr);
        return d.toLocaleString('en-IN', { day: '2-digit', month: 'short', year: '2-digit', hour: '2-digit', minute: '2-digit', hour12: true });
    };

    return (
        <div className="min-h-screen bg-white">
            <div className="px-3 py-4 max-w-2xl mx-auto space-y-4">
                <h2 className="text-gray-900 font-bold text-xl">Transactions</h2>

                {/* Summary Cards */}
                <div className="grid grid-cols-3 gap-2">
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-center">
                        <p className="text-lg font-black text-gray-900">{transactions.length}</p>
                        <p className="text-gray-500 text-[10px]">Total</p>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-center">
                        <p className="text-lg font-black text-green-600">₹{totalCredit.toLocaleString('en-IN')}</p>
                        <p className="text-gray-500 text-[10px]">Credited</p>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-center">
                        <p className="text-lg font-black text-red-600">₹{totalDebit.toLocaleString('en-IN')}</p>
                        <p className="text-gray-500 text-[10px]">Withdrawn</p>
                    </div>
                </div>

                {/* Filter Tabs */}
                <div className="flex border border-blue-200 rounded-xl overflow-hidden">
                    {[
                        { key: 'all', label: 'All' },
                        { key: 'credit', label: 'Credits' },
                        { key: 'debit', label: 'Debits' },
                    ].map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setFilter(tab.key)}
                            className={`flex-1 py-2.5 text-xs font-bold transition-colors ${filter === tab.key ? 'bg-blue-600 text-white' : 'text-gray-500 hover:text-gray-900'}`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Transaction List */}
                {loading ? (
                    <div className="animate-pulse space-y-2">
                        {[1, 2, 3, 4].map((i) => <div key={i} className="h-16 bg-blue-100 rounded-xl" />)}
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-16 text-gray-400">
                        <svg className="w-16 h-16 mx-auto mb-3 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        <p className="text-sm">No transactions yet</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {filtered.map((t) => (
                            <div key={t.id || t._id} className="bg-white border border-blue-200 rounded-xl px-4 py-3 flex items-center justify-between shadow-sm">
                                <div className="flex items-center gap-3">
                                    <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${t.type === 'credit' ? 'bg-green-100' : 'bg-red-100'}`}>
                                        <svg className={`w-4 h-4 ${t.type === 'credit' ? 'text-green-600' : 'text-red-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            {t.type === 'credit'
                                                ? <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m6-6H6" />
                                                : <path strokeLinecap="round" strokeLinejoin="round" d="M18 12H6" />
                                            }
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-gray-900 text-sm font-medium">{t.playerName || 'Unknown'}</p>
                                        <p className="text-gray-500 text-[10px]">{t.note || (t.type === 'credit' ? 'Fund added' : 'Fund withdrawn')}</p>
                                        <p className="text-gray-400 text-[10px]">{formatDate(t.createdAt)}</p>
                                    </div>
                                </div>
                                <div className="text-right shrink-0">
                                    <p className={`font-bold text-sm ${t.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                                        {t.type === 'credit' ? '+' : '-'}₹{Number(t.amount).toLocaleString('en-IN')}
                                    </p>
                                    <p className="text-gray-400 text-[10px]">Bal: ₹{Number(t.newBalance || 0).toLocaleString('en-IN')}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Transactions;
