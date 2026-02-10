import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BASE_URL from '../config/api';

const Settings = () => {
    const navigate = useNavigate();
    const bookie = JSON.parse(localStorage.getItem('bookie') || 'null');

    const [stats, setStats] = useState({ players: 0, active: 0, suspended: 0, totalBalance: 0 });
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [pwMsg, setPwMsg] = useState('');

    useEffect(() => {
        if (!bookie) { navigate('/login'); return; }
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const res = await fetch(`${BASE_URL}/bookie/players?bookieId=${encodeURIComponent(bookie.id)}`);
            const data = await res.json();
            if (data.success) {
                const players = data.data || [];
                setStats({
                    players: players.length,
                    active: players.filter(p => p.status === 'active').length,
                    suspended: players.filter(p => p.status !== 'active').length,
                    totalBalance: players.reduce((s, p) => s + (p.balance || 0), 0),
                });
            }
        } catch { }
    };

    const handleChangePassword = async () => {
        if (!newPassword || newPassword.length < 4) { setPwMsg('Password must be at least 4 characters'); return; }
        if (newPassword !== confirmPassword) { setPwMsg('Passwords do not match'); return; }
        try {
            const res = await fetch(`${BASE_URL}/bookie/change-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ bookieId: bookie.id, oldPassword, newPassword }),
            });
            const data = await res.json();
            if (data.success) {
                setPwMsg('Password changed successfully!');
                setOldPassword(''); setNewPassword(''); setConfirmPassword('');
                setTimeout(() => { setShowPasswordModal(false); setPwMsg(''); }, 1500);
            } else {
                setPwMsg(data.message || 'Failed to change password');
            }
        } catch {
            setPwMsg('Network error');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('bookie');
        localStorage.removeItem('user');
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-white">
            <div className="px-3 py-4 max-w-2xl mx-auto space-y-5">
                <h2 className="text-gray-900 font-bold text-xl">Settings</h2>

                {/* ─── Profile Card ─── */}
                <div className="bg-white border border-blue-200 rounded-2xl p-5 shadow-sm">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-14 h-14 rounded-full bg-blue-600 flex items-center justify-center shadow-lg">
                            <span className="text-white font-black text-2xl">
                                {(bookie?.name || bookie?.username || 'B').charAt(0).toUpperCase()}
                            </span>
                        </div>
                        <div>
                            <h3 className="text-gray-900 font-bold text-lg">{bookie?.name || bookie?.username || 'Bookie'}</h3>
                            <p className="text-gray-500 text-sm">{bookie?.phone || '-'}</p>
                            {bookie?.email && <p className="text-gray-400 text-xs">{bookie.email}</p>}
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 gap-2">
                        <div className="bg-blue-50 rounded-xl p-3 text-center">
                            <p className="text-lg font-black text-gray-900">{stats.players}</p>
                            <p className="text-gray-500 text-[10px]">Total Players</p>
                        </div>
                        <div className="bg-blue-50 rounded-xl p-3 text-center">
                            <p className="text-lg font-black text-green-600">{stats.active}</p>
                            <p className="text-gray-500 text-[10px]">Active</p>
                        </div>
                        <div className="bg-blue-50 rounded-xl p-3 text-center">
                            <p className="text-lg font-black text-red-600">{stats.suspended}</p>
                            <p className="text-gray-500 text-[10px]">Suspended</p>
                        </div>
                        <div className="bg-blue-50 rounded-xl p-3 text-center">
                            <p className="text-lg font-black text-blue-600">₹{stats.totalBalance.toLocaleString('en-IN')}</p>
                            <p className="text-gray-500 text-[10px]">Total Balance</p>
                        </div>
                    </div>
                </div>

                {/* ─── Options ─── */}
                <div className="space-y-2">
                    <p className="text-gray-400 text-[10px] uppercase tracking-widest font-bold px-1">Options</p>

                    {/* Change Password */}
                    <button
                        onClick={() => setShowPasswordModal(true)}
                        className="w-full bg-white border border-blue-200 rounded-xl px-4 py-3.5 flex items-center gap-3 hover:border-blue-400 transition-colors shadow-sm"
                    >
                        <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center">
                            <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        </div>
                        <div className="text-left flex-1">
                            <p className="text-gray-900 text-sm font-medium">Change Password</p>
                            <p className="text-gray-500 text-xs">Update your bookie password</p>
                        </div>
                        <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </button>

                    {/* App Info */}
                    <div className="bg-white border border-blue-200 rounded-xl px-4 py-3.5 flex items-center gap-3 shadow-sm">
                        <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center">
                            <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div className="text-left flex-1">
                            <p className="text-gray-900 text-sm font-medium">Offline Bookie App</p>
                            <p className="text-gray-500 text-xs">Version 1.0.0</p>
                        </div>
                    </div>

                    {/* Logout */}
                    <button
                        onClick={handleLogout}
                        className="w-full bg-white border border-red-200 rounded-xl px-4 py-3.5 flex items-center gap-3 hover:border-red-400 transition-colors shadow-sm"
                    >
                        <div className="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center">
                            <svg className="w-4 h-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                        </div>
                        <div className="text-left flex-1">
                            <p className="text-red-600 text-sm font-medium">Logout</p>
                            <p className="text-gray-500 text-xs">Sign out of your bookie account</p>
                        </div>
                    </button>
                </div>
            </div>

            {/* ─── Password Modal ─── */}
            {showPasswordModal && (
                <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
                    <div className="bg-white border border-blue-200 rounded-2xl p-5 w-full max-w-sm shadow-2xl">
                        <h3 className="text-gray-900 font-bold text-lg mb-4">Change Password</h3>
                        <div className="space-y-3">
                            <input
                                type="password"
                                placeholder="Current password"
                                value={oldPassword}
                                onChange={(e) => setOldPassword(e.target.value)}
                                className="w-full bg-blue-50 border border-blue-200 rounded-xl px-4 py-2.5 text-gray-900 text-sm focus:border-blue-500 outline-none"
                            />
                            <input
                                type="password"
                                placeholder="New password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full bg-blue-50 border border-blue-200 rounded-xl px-4 py-2.5 text-gray-900 text-sm focus:border-blue-500 outline-none"
                            />
                            <input
                                type="password"
                                placeholder="Confirm new password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full bg-blue-50 border border-blue-200 rounded-xl px-4 py-2.5 text-gray-900 text-sm focus:border-blue-500 outline-none"
                            />
                            {pwMsg && (
                                <p className={`text-xs font-medium ${pwMsg.includes('success') ? 'text-green-600' : 'text-red-600'}`}>{pwMsg}</p>
                            )}
                        </div>
                        <div className="flex gap-2 mt-4">
                            <button
                                onClick={() => { setShowPasswordModal(false); setPwMsg(''); setOldPassword(''); setNewPassword(''); setConfirmPassword(''); }}
                                className="flex-1 py-2.5 rounded-xl border border-blue-200 text-gray-500 text-sm hover:bg-blue-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleChangePassword}
                                className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-500"
                            >
                                Update
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Settings;
