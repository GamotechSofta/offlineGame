import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5050/api';

const Wallet = () => {
    const navigate = useNavigate();
    const [wallets, setWallets] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('wallets');

    useEffect(() => { if (activeTab === 'wallets') fetchWallets(); else fetchTransactions(); }, [activeTab]);

    const getAuth = () => { const admin = JSON.parse(localStorage.getItem('admin')); const password = sessionStorage.getItem('adminPassword') || ''; return { 'Authorization': `Basic ${btoa(`${admin.username}:${password}`)}` }; };

    const fetchWallets = async () => { try { setLoading(true); const r = await fetch(`${API_BASE_URL}/wallet/all`, { headers: getAuth() }); const d = await r.json(); if (d.success) setWallets(d.data); } catch (e) { console.error(e); } finally { setLoading(false); } };
    const fetchTransactions = async () => { try { setLoading(true); const r = await fetch(`${API_BASE_URL}/wallet/transactions`, { headers: getAuth() }); const d = await r.json(); if (d.success) setTransactions(d.data); } catch (e) { console.error(e); } finally { setLoading(false); } };

    const handleAdjustBalance = async (userId, amount, type) => {
        try { const admin = JSON.parse(localStorage.getItem('admin')); const password = sessionStorage.getItem('adminPassword') || ''; const r = await fetch(`${API_BASE_URL}/wallet/adjust`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Basic ${btoa(`${admin.username}:${password}`)}` }, body: JSON.stringify({ userId, amount, type }) }); const d = await r.json(); if (d.success) fetchWallets(); } catch (e) { console.error(e); }
    };

    const handleLogout = () => { localStorage.removeItem('admin'); sessionStorage.removeItem('adminPassword'); navigate('/'); };

    return (
        <AdminLayout onLogout={handleLogout} title="Wallet">
            <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-slate-800">Wallet Management</h1>

            <div className="flex gap-2 sm:gap-4 mb-4 sm:mb-6 border-b border-slate-200 overflow-x-auto">
                <button onClick={() => setActiveTab('wallets')} className={`pb-4 px-4 font-semibold ${activeTab === 'wallets' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-400'}`}>Player Wallets</button>
                <button onClick={() => setActiveTab('transactions')} className={`pb-4 px-4 font-semibold ${activeTab === 'transactions' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-400'}`}>Transactions</button>
            </div>

            {loading ? (
                <div className="text-center py-12"><p className="text-slate-500">Loading...</p></div>
            ) : activeTab === 'wallets' ? (
                <div className="overflow-x-auto -mx-4 sm:mx-0">
                    <div className="bg-white rounded-lg overflow-hidden min-w-[400px] border border-slate-200 shadow-sm">
                        <table className="w-full text-sm sm:text-base">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Player</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Balance</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {wallets.length === 0 ? (
                                    <tr><td colSpan="3" className="px-6 py-4 text-center text-slate-400">No wallets found</td></tr>
                                ) : wallets.map((wallet) => (
                                    <tr key={wallet._id} className="hover:bg-slate-50">
                                        <td className="px-6 py-4 text-sm text-slate-800">{wallet.userId?.username || wallet.userId}</td>
                                        <td className="px-6 py-4 text-sm font-semibold text-blue-700">₹{wallet.balance}</td>
                                        <td className="px-6 py-4 text-sm">
                                            <div className="flex gap-2">
                                                <button onClick={() => { const amount = prompt('Enter amount to add:'); if (amount) handleAdjustBalance(wallet.userId._id || wallet.userId, parseFloat(amount), 'credit'); }} className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs">Add</button>
                                                <button onClick={() => { const amount = prompt('Enter amount to deduct:'); if (amount) handleAdjustBalance(wallet.userId._id || wallet.userId, parseFloat(amount), 'debit'); }} className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs">Deduct</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="overflow-x-auto -mx-4 sm:mx-0">
                    <div className="bg-white rounded-lg overflow-hidden min-w-[400px] border border-slate-200 shadow-sm">
                        <table className="w-full text-sm sm:text-base">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Player</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Type</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Amount</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {transactions.length === 0 ? (
                                    <tr><td colSpan="4" className="px-6 py-4 text-center text-slate-400">No transactions found</td></tr>
                                ) : transactions.map((t) => (
                                    <tr key={t._id} className="hover:bg-slate-50">
                                        <td className="px-6 py-4 text-sm text-slate-800">{t.userId?.username || t.userId}</td>
                                        <td className="px-6 py-4 text-sm"><span className={`px-2 py-1 rounded text-xs font-medium ${t.type === 'credit' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>{t.type}</span></td>
                                        <td className="px-6 py-4 text-sm text-slate-800 font-medium">₹{t.amount}</td>
                                        <td className="px-6 py-4 text-sm text-slate-500">{new Date(t.createdAt).toLocaleString()}</td>
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

export default Wallet;
