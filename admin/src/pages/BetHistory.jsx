import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5050/api';

const BetHistory = () => {
    const navigate = useNavigate();
    const [bets, setBets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({ userId: '', marketId: '', status: '', startDate: '', endDate: '' });

    useEffect(() => { fetchBets(); }, [filters]);

    const fetchBets = async () => {
        try {
            setLoading(true);
            const admin = JSON.parse(localStorage.getItem('admin'));
            const password = sessionStorage.getItem('adminPassword') || '';
            const queryParams = new URLSearchParams();
            if (filters.userId) queryParams.append('userId', filters.userId);
            if (filters.marketId) queryParams.append('marketId', filters.marketId);
            if (filters.status) queryParams.append('status', filters.status);
            if (filters.startDate) queryParams.append('startDate', filters.startDate);
            if (filters.endDate) queryParams.append('endDate', filters.endDate);
            const response = await fetch(`${API_BASE_URL}/bets/history?${queryParams}`, {
                headers: { 'Authorization': `Basic ${btoa(`${admin.username}:${password}`)}` },
            });
            const data = await response.json();
            if (data.success) setBets(data.data);
        } catch (err) { console.error('Error fetching bets:', err); }
        finally { setLoading(false); }
    };

    const handleLogout = () => { localStorage.removeItem('admin'); sessionStorage.removeItem('adminPassword'); navigate('/'); };

    return (
        <AdminLayout onLogout={handleLogout} title="Bet History">
            <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-slate-800">Bet History</h1>

            {/* Filters */}
            <div className="bg-white rounded-lg p-4 mb-4 sm:mb-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 border border-slate-200 shadow-sm">
                <input type="text" placeholder="Player ID" value={filters.userId} onChange={(e) => setFilters({ ...filters, userId: e.target.value })} className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none" />
                <input type="text" placeholder="Market ID" value={filters.marketId} onChange={(e) => setFilters({ ...filters, marketId: e.target.value })} className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none" />
                <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })} className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-800 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none">
                    <option value="">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="won">Won</option>
                    <option value="lost">Lost</option>
                    <option value="cancelled">Cancelled</option>
                </select>
                <input type="date" value={filters.startDate} onChange={(e) => setFilters({ ...filters, startDate: e.target.value })} className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-800 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none" />
                <input type="date" value={filters.endDate} onChange={(e) => setFilters({ ...filters, endDate: e.target.value })} className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-800 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none" />
            </div>

            {loading ? (
                <div className="text-center py-12"><p className="text-slate-500">Loading bets...</p></div>
            ) : (
                <div className="overflow-x-auto -mx-4 sm:mx-0">
                    <div className="bg-white rounded-lg overflow-hidden min-w-[640px] border border-slate-200 shadow-sm">
                        <table className="w-full text-sm sm:text-base">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-slate-500 uppercase">ID</th>
                                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-slate-500 uppercase">Player</th>
                                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-slate-500 uppercase">Market</th>
                                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-slate-500 uppercase">Bet Type</th>
                                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-slate-500 uppercase">Amount</th>
                                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
                                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-slate-500 uppercase">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {bets.length === 0 ? (
                                    <tr><td colSpan="7" className="px-6 py-4 text-center text-slate-400">No bets found</td></tr>
                                ) : bets.map((bet) => (
                                    <tr key={bet._id} className="hover:bg-slate-50">
                                        <td className="px-3 sm:px-6 py-3 sm:py-4 text-sm text-slate-600">{bet._id.slice(-8)}</td>
                                        <td className="px-3 sm:px-6 py-3 sm:py-4 text-sm text-slate-800">{bet.userId?.username || bet.userId}</td>
                                        <td className="px-3 sm:px-6 py-3 sm:py-4 text-sm text-slate-800">{bet.marketId?.marketName || bet.marketId}</td>
                                        <td className="px-3 sm:px-6 py-3 sm:py-4 text-sm text-slate-600">{bet.betType}</td>
                                        <td className="px-3 sm:px-6 py-3 sm:py-4 text-sm text-slate-800 font-medium">₹{bet.amount}</td>
                                        <td className="px-3 sm:px-6 py-3 sm:py-4 text-sm">
                                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                                                bet.status === 'won' ? 'bg-green-50 text-green-700 border border-green-200' :
                                                bet.status === 'lost' ? 'bg-red-50 text-red-700 border border-red-200' :
                                                bet.status === 'pending' ? 'bg-orange-50 text-orange-700 border border-orange-200' :
                                                'bg-slate-100 text-slate-600 border border-slate-200'
                                            }`}>{bet.status}</span>
                                        </td>
                                        <td className="px-3 sm:px-6 py-3 sm:py-4 text-sm text-slate-500">{new Date(bet.createdAt).toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
};

export default BetHistory;
