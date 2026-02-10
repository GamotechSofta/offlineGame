import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import { useNavigate, Link } from 'react-router-dom';
import { FaUserSlash, FaUserCheck, FaUserPlus, FaSearch } from 'react-icons/fa';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5050/api';
const ONLINE_THRESHOLD_MS = 5 * 60 * 1000;

const computeIsOnline = (item) => {
    const lastActive = item?.lastActiveAt ? new Date(item.lastActiveAt).getTime() : 0;
    return lastActive > 0 && Date.now() - lastActive < ONLINE_THRESHOLD_MS;
};

const TABS = [
    { id: 'all', label: 'All Players', value: 'all' },
    { id: 'super_admins', label: 'All Super Admins', value: 'super_admins' },
    { id: 'all_bookies', label: 'All Bookies', value: 'all_bookies' },
    { id: 'bookie_users', label: 'All Bookies Players', value: 'bookie_users' },
    { id: 'super_admin_users', label: 'Super Admin Players', value: 'super_admin_users' },
];

const AllUsers = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('all');
    const [expandedBookieId, setExpandedBookieId] = useState(null);
    const [allUsers, setAllUsers] = useState([]);
    const [superAdminUsersList, setSuperAdminUsersList] = useState([]);
    const [bookieUsersList, setBookieUsersList] = useState([]);
    const [allBookies, setAllBookies] = useState([]);
    const [superAdminsList, setSuperAdminsList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [togglingId, setTogglingId] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [, setTick] = useState(0);
    const [hasSecretDeclarePassword, setHasSecretDeclarePassword] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [secretPassword, setSecretPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [pendingAction, setPendingAction] = useState(null);

    const getAuthHeaders = () => {
        const admin = JSON.parse(localStorage.getItem('admin'));
        const password = sessionStorage.getItem('adminPassword') || '';
        return {
            'Content-Type': 'application/json',
            'Authorization': `Basic ${btoa(`${admin.username}:${password}`)}`,
        };
    };

    const fetchData = async (showLoader = true) => {
        if (showLoader) setLoading(true);
        if (showLoader) setError('');
        try {
            const [allRes, superAdminRes, bookieRes, bookiesRes, adminsRes] = await Promise.all([
                fetch(`${API_BASE_URL}/users`, { headers: getAuthHeaders() }),
                fetch(`${API_BASE_URL}/users?filter=super_admin`, { headers: getAuthHeaders() }),
                fetch(`${API_BASE_URL}/users?filter=bookie`, { headers: getAuthHeaders() }),
                fetch(`${API_BASE_URL}/admin/bookies`, { headers: getAuthHeaders() }),
                fetch(`${API_BASE_URL}/admin/super-admins`, { headers: getAuthHeaders() }),
            ]);
            const allData = await allRes.json();
            const superAdminData = await superAdminRes.json();
            const bookieData = await bookieRes.json();
            const bookiesData = await bookiesRes.json();
            const adminsData = await adminsRes.json();
            if (allData.success) setAllUsers(allData.data || []);
            if (superAdminData.success) setSuperAdminUsersList(superAdminData.data || []);
            if (bookieData.success) setBookieUsersList(bookieData.data || []);
            if (bookiesData.success) setAllBookies(bookiesData.data || []);
            if (adminsData.success) setSuperAdminsList(adminsData.data || []);
        } catch (err) {
            if (showLoader) setError('Failed to fetch data');
        } finally {
            if (showLoader) setLoading(false);
        }
    };

    useEffect(() => {
        const admin = localStorage.getItem('admin');
        if (!admin) {
            navigate('/');
            return;
        }
        fetchData(true);
        fetch(`${API_BASE_URL}/admin/me/secret-declare-password-status`, { headers: getAuthHeaders() })
            .then((res) => res.json())
            .then((json) => {
                if (json.success) setHasSecretDeclarePassword(json.hasSecretDeclarePassword || false);
            })
            .catch(() => setHasSecretDeclarePassword(false));

        const refreshInterval = setInterval(() => fetchData(false), 15000);
        const tickInterval = setInterval(() => setTick((t) => t + 1), 5000);
        return () => {
            clearInterval(refreshInterval);
            clearInterval(tickInterval);
        };
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('admin');
        sessionStorage.removeItem('adminPassword');
        navigate('/');
    };

    const performTogglePlayerStatus = async (userId, secretDeclarePasswordValue) => {
        setTogglingId(userId);
        setError('');
        setSuccess('');
        setPasswordError('');
        try {
            const opts = { method: 'PATCH', headers: getAuthHeaders() };
            if (secretDeclarePasswordValue) opts.body = JSON.stringify({ secretDeclarePassword: secretDeclarePasswordValue });
            const res = await fetch(`${API_BASE_URL}/users/${userId}/toggle-status`, opts);
            const data = await res.json();
            if (data.success) {
                setShowPasswordModal(false);
                setPendingAction(null);
                setSecretPassword('');
                setSuccess(`Player ${data.data.isActive ? 'unsuspended' : 'suspended'} successfully`);
                fetchData(false);
                setTimeout(() => setSuccess(''), 3000);
            } else {
                if (data.code === 'INVALID_SECRET_DECLARE_PASSWORD') {
                    setPasswordError(data.message || 'Invalid secret password');
                } else {
                    setError(data.message || 'Failed to update status');
                }
            }
        } catch (err) {
            setError('Network error. Please try again.');
        } finally {
            setTogglingId(null);
        }
    };

    const performToggleBookieStatus = async (bookieId, secretDeclarePasswordValue) => {
        setTogglingId(bookieId);
        setError('');
        setSuccess('');
        setPasswordError('');
        try {
            const opts = { method: 'PATCH', headers: getAuthHeaders() };
            if (secretDeclarePasswordValue) opts.body = JSON.stringify({ secretDeclarePassword: secretDeclarePasswordValue });
            const res = await fetch(`${API_BASE_URL}/admin/bookies/${bookieId}/toggle-status`, opts);
            const data = await res.json();
            if (data.success) {
                setShowPasswordModal(false);
                setPendingAction(null);
                setSecretPassword('');
                setSuccess(`Bookie ${data.data.status === 'active' ? 'unsuspended' : 'suspended'} successfully`);
                fetchData(false);
                setTimeout(() => setSuccess(''), 3000);
            } else {
                if (data.code === 'INVALID_SECRET_DECLARE_PASSWORD') {
                    setPasswordError(data.message || 'Invalid secret password');
                } else {
                    setError(data.message || 'Failed to update status');
                }
            }
        } catch (err) {
            setError('Network error. Please try again.');
        } finally {
            setTogglingId(null);
        }
    };

    const handleTogglePlayerStatus = (userId) => {
        if (hasSecretDeclarePassword) {
            setPendingAction({ type: 'player', id: userId });
            setShowPasswordModal(true);
            setSecretPassword('');
            setPasswordError('');
        } else {
            performTogglePlayerStatus(userId, '');
        }
    };

    const handleToggleBookieStatus = (bookieId) => {
        if (hasSecretDeclarePassword) {
            setPendingAction({ type: 'bookie', id: bookieId });
            setShowPasswordModal(true);
            setSecretPassword('');
            setPasswordError('');
        } else {
            performToggleBookieStatus(bookieId, '');
        }
    };

    const handlePasswordSubmit = (e) => {
        e.preventDefault();
        const val = secretPassword.trim();
        if (hasSecretDeclarePassword && !val) {
            setPasswordError('Please enter the secret declare password');
            return;
        }
        if (pendingAction?.type === 'player') performTogglePlayerStatus(pendingAction.id, val);
        else if (pendingAction?.type === 'bookie') performToggleBookieStatus(pendingAction.id, val);
    };

    const getCurrentList = () => {
        if (activeTab === 'all') return allUsers;
        if (activeTab === 'super_admin_users') return superAdminUsersList;
        if (activeTab === 'bookie_users') return bookieUsersList;
        if (activeTab === 'all_bookies') return allBookies;
        if (activeTab === 'super_admins') return superAdminsList;
        return [];
    };

    const list = getCurrentList();
    const isUserList = ['all', 'super_admin_users', 'bookie_users'].includes(activeTab);

    const q = searchQuery.trim().toLowerCase();
    const filteredList = q
        ? list.filter((item) => {
            const username = (item.username || '').toLowerCase();
            const email = (item.email || '').toLowerCase();
            const phone = (item.phone || '').toString();
            return username.includes(q) || email.includes(q) || phone.includes(q);
        })
        : list;

    const getUsersForBookie = (bookieId) => {
        return bookieUsersList.filter(
            (u) => u.referredBy && (u.referredBy._id === bookieId || u.referredBy === bookieId)
        );
    };

    return (
        <AdminLayout onLogout={handleLogout} title="All Players">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 sm:mb-6">
                <h1 className="text-2xl sm:text-3xl font-bold">All Players</h1>
                <button
                    type="button"
                    onClick={() => navigate('/add-user')}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-600 text-white font-semibold transition-colors text-sm sm:text-base shrink-0"
                >
                    <FaUserPlus className="w-5 h-5" />
                    Add Player
                </button>
            </div>

            {/* Fixed top notification - no layout shift */}
            {(success || error) && (
                <div className="fixed top-14 lg:top-4 left-0 right-0 lg:left-72 lg:right-0 flex justify-center px-4 z-50 pointer-events-none">
                    <div className={`px-3 py-2 rounded-lg flex items-center gap-2 shadow-lg border text-sm max-w-md ${
                        success
                            ? 'bg-green-900/95 border-green-200 text-green-600'
                            : 'bg-red-900/95 border-red-200 text-red-600'
                    }`}>
                        <span className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs ${
                            success ? 'bg-green-600/50 text-green-300' : 'bg-red-600/50 text-red-300'
                        }`}>
                            {success ? '✓' : '✕'}
                        </span>
                        <span className="flex-1">{success || error}</span>
                    </div>
                </div>
            )}

            {/* Tabs */}
            <div className="flex flex-wrap gap-2 mb-4">
                {TABS.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-4 py-2 rounded-lg font-semibold transition-colors text-sm sm:text-base ${
                            activeTab === tab.id
                                ? 'bg-blue-600 text-white'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Search */}
            <div className="mb-4 sm:mb-6">
                <div className="relative max-w-md">
                    <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search by name, email or phone..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className={`w-full pl-10 py-2.5 bg-slate-100 border border-slate-300 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-600 transition-all text-sm sm:text-base ${searchQuery ? 'pr-10' : 'pr-4'}`}
                    />
                    {searchQuery && (
                        <button
                            type="button"
                            onClick={() => setSearchQuery('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-900 text-sm"
                        >
                            ✕
                        </button>
                    )}
                </div>
            </div>

            {/* Table - overflow-x-auto so Action column is visible when table is wide */}
            <div className="bg-white rounded-lg overflow-x-auto overflow-y-hidden border border-slate-200 min-w-0 max-w-full">
                {loading ? (
                    <div className="p-8 text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
                        <p className="mt-4 text-slate-500">Loading...</p>
                    </div>
                ) : list.length === 0 ? (
                    <div className="p-8 text-center text-slate-500">
                        No {TABS.find(t => t.id === activeTab)?.label?.toLowerCase()} found.
                    </div>
                ) : filteredList.length === 0 ? (
                    <div className="p-8 text-center text-slate-500">
                        No results match your search. Try a different term.
                    </div>
                ) : activeTab === 'all_bookies' ? (
                    <div>
                        {/* Header */}
                        <div className="px-4 sm:px-6 py-3 sm:py-4 bg-slate-50 border-b border-slate-300">
                            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                                <span className="font-semibold text-blue-600">All Bookies</span>
                                <span className="hidden sm:inline"> — Bookie accounts who can add players via their link.</span>
                                <span className="block sm:inline mt-1 sm:mt-0 sm:ml-1">Click <span className="font-medium text-slate-800">View Players</span> to see players under each bookie.</span>
                            </p>
                        </div>

                        {/* Desktop table */}
                        <div className="hidden md:block">
                            <table className="w-full text-sm">
                                <thead className="bg-slate-100">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider w-10">#</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Username</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Email</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider hidden lg:table-cell">Phone</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Status</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider hidden lg:table-cell">Created</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200">
                                    {filteredList.map((bookie, index) => {
                                        const bookieUsers = getUsersForBookie(bookie._id);
                                        const isExpanded = expandedBookieId === bookie._id;
                                        return (
                                            <React.Fragment key={bookie._id}>
                                                <tr className="hover:bg-slate-50 transition-colors">
                                                    <td className="px-4 py-3 text-slate-500">{index + 1}</td>
                                                    <td className="px-4 py-3 font-medium text-slate-800">{bookie.username}</td>
                                                    <td className="px-4 py-3 text-slate-600 truncate max-w-[140px] lg:max-w-[180px]">{bookie.email || '—'}</td>
                                                    <td className="px-4 py-3 text-slate-600 hidden lg:table-cell">{bookie.phone || '—'}</td>
                                                    <td className="px-4 py-3">
                                                        <span className={`inline-flex px-2.5 py-1 rounded-md text-xs font-medium ${
                                                            bookie.status === 'active'
                                                                ? 'bg-green-50 text-green-600 border border-green-200'
                                                                : 'bg-red-50 text-red-500 border border-red-200'
                                                        }`}>
                                                            {bookie.status === 'active' ? 'Active' : 'Suspended'}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-slate-500 text-xs hidden lg:table-cell">
                                                        {bookie.createdAt ? new Date(bookie.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            <button
                                                                type="button"
                                                                onClick={() => handleToggleBookieStatus(bookie._id)}
                                                                disabled={togglingId === bookie._id}
                                                                className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all disabled:opacity-50 ${
                                                                    bookie.status === 'active'
                                                                        ? 'bg-red-600/80 hover:bg-red-600 text-white'
                                                                        : 'bg-green-600/80 hover:bg-green-600 text-white'
                                                                }`}
                                                            >
                                                                {togglingId === bookie._id ? '⏳' : bookie.status === 'active' ? <><FaUserSlash className="w-3.5 h-3.5" /> Suspend</> : <><FaUserCheck className="w-3.5 h-3.5" /> Unsuspend</>}
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => setExpandedBookieId(isExpanded ? null : bookie._id)}
                                                                className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-600 text-white transition-colors"
                                                            >
                                                                {isExpanded ? 'Hide Players' : 'View Players'}
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                                {isExpanded && (
                                                    <tr>
                                                        <td colSpan="7" className="px-0 py-0 bg-slate-50">
                                                            <div className="px-6 py-4 sm:py-5 border-l-4 border-blue-600 ml-4 sm:ml-6">
                                                                <p className="text-blue-600 font-semibold mb-3 text-sm">
                                                                    Players under <span className="text-slate-800">{bookie.username}</span>
                                                                </p>
                                                                {bookieUsers.length === 0 ? (
                                                                    <p className="text-slate-400 text-sm py-2">No players yet.</p>
                                                                ) : (
                                                                    <div className="rounded-lg border border-slate-300 overflow-hidden bg-white">
                                                                        <table className="w-full text-sm">
                                                                            <thead className="bg-slate-100">
                                                                                <tr>
                                                                                    <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-500 uppercase w-10">#</th>
                                                                                    <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-500 uppercase">Name</th>
                                                                                    <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-500 uppercase">Email</th>
                                                                                    <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-500 uppercase hidden lg:table-cell">Phone</th>
                                                                                    <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
                                                                                    <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-500 uppercase">Wallet</th>
                                                                                    <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-500 uppercase hidden sm:table-cell">Account</th>
                                                                                    <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-500 uppercase hidden lg:table-cell">Created</th>
                                                                                    <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-500 uppercase">Action</th>
                                                                                </tr>
                                                                            </thead>
                                                                            <tbody className="divide-y divide-slate-200">
                                                                                {bookieUsers.map((u, i) => (
                                                                                    <tr key={u._id} className="hover:bg-slate-50 transition-colors">
                                                                                        <td className="px-4 py-2.5 text-slate-500">{i + 1}</td>
                                                                                        <td className="px-4 py-2.5 font-medium">
                                                                                            <Link to={`/all-users/${u._id}`} className="text-blue-600 hover:text-blue-500 hover:underline">{u.username}</Link>
                                                                                        </td>
                                                                                        <td className="px-4 py-2.5 text-slate-600 truncate max-w-[120px] lg:max-w-[160px]">{u.email || '—'}</td>
                                                                                        <td className="px-4 py-2.5 text-slate-600 hidden lg:table-cell">{u.phone || '—'}</td>
                                                                                        <td className="px-4 py-2.5">
                                                                                            {(() => {
                                                                                                const isOnline = computeIsOnline(u);
                                                                                                return (
                                                                                                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs ${isOnline ? 'text-green-600' : 'text-slate-400'}`}>
                                                                                                        <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-green-500' : 'bg-gray-500'}`} />
                                                                                                        {isOnline ? 'Online' : 'Offline'}
                                                                                                    </span>
                                                                                                );
                                                                                            })()}
                                                                                        </td>
                                                                                        <td className="px-4 py-2.5 text-green-600 font-mono text-xs">₹{Number(u.walletBalance ?? 0).toLocaleString('en-IN')}</td>
                                                                                        <td className="px-4 py-2.5 hidden sm:table-cell">
                                                                                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${u.isActive !== false ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>
                                                                                                {u.isActive !== false ? 'Active' : 'Suspended'}
                                                                                            </span>
                                                                                        </td>
                                                                                        <td className="px-4 py-2.5 text-slate-500 text-xs hidden lg:table-cell">
                                                                                            {u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                                                                                        </td>
                                                                                        <td className="px-4 py-2.5">
                                                                                            <button
                                                                                                type="button"
                                                                                                onClick={() => handleTogglePlayerStatus(u._id)}
                                                                                                disabled={togglingId === u._id}
                                                                                                className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50 ${
                                                                                                    u.isActive !== false ? 'bg-red-600/80 hover:bg-red-600 text-white' : 'bg-green-600/80 hover:bg-green-600 text-white'
                                                                                                }`}
                                                                                            >
                                                                                                {togglingId === u._id ? '⏳' : u.isActive !== false ? <><FaUserSlash className="w-3 h-3" /> Suspend</> : <><FaUserCheck className="w-3 h-3" /> Unsuspend</>}
                                                                                            </button>
                                                                                        </td>
                                                                                    </tr>
                                                                                ))}
                                                                            </tbody>
                                                                        </table>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </React.Fragment>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile cards */}
                        <div className="md:hidden divide-y divide-slate-200">
                            {filteredList.map((bookie, index) => {
                                const bookieUsers = getUsersForBookie(bookie._id);
                                const isExpanded = expandedBookieId === bookie._id;
                                return (
                                    <div key={bookie._id} className="p-4 hover:bg-slate-50 transition-colors">
                                        <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                                            <div className="flex items-center gap-2 min-w-0">
                                                <span className="text-slate-500 text-sm shrink-0">{index + 1}.</span>
                                                <span className="font-semibold text-slate-800 truncate">{bookie.username}</span>
                                                <span className={`shrink-0 px-2 py-0.5 rounded-md text-xs font-medium ${
                                                    bookie.status === 'active'
                                                        ? 'bg-green-50 text-green-600 border border-green-200'
                                                        : 'bg-red-50 text-red-500 border border-red-200'
                                                }`}>
                                                    {bookie.status === 'active' ? 'Active' : 'Suspended'}
                                                </span>
                                            </div>
                                            <div className="flex flex-wrap gap-2 shrink-0">
                                                <button
                                                    type="button"
                                                    onClick={() => handleToggleBookieStatus(bookie._id)}
                                                    disabled={togglingId === bookie._id}
                                                    className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold disabled:opacity-50 ${
                                                        bookie.status === 'active'
                                                            ? 'bg-red-600 hover:bg-red-500 text-white'
                                                            : 'bg-green-600 hover:bg-green-500 text-white'
                                                    }`}
                                                >
                                                    {togglingId === bookie._id ? '⏳' : bookie.status === 'active' ? <><FaUserSlash className="w-3.5 h-3.5" /> Suspend</> : <><FaUserCheck className="w-3.5 h-3.5" /> Unsuspend</>}
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setExpandedBookieId(isExpanded ? null : bookie._id)}
                                                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-600 text-white"
                                                >
                                                    {isExpanded ? 'Hide' : 'View'} Players
                                                </button>
                                            </div>
                                        </div>
                                        <div className="text-xs text-slate-500 space-y-0.5">
                                            {bookie.email && <p className="truncate">📧 {bookie.email}</p>}
                                            {bookie.phone && <p>📱 {bookie.phone}</p>}
                                            <p>{bookie.createdAt ? new Date(bookie.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : ''}</p>
                                        </div>
                                        {isExpanded && (
                                            <div className="mt-4 pl-3 border-l-2 border-blue-600/70 space-y-3">
                                                <p className="text-blue-600/90 font-medium text-sm">Players ({bookieUsers.length})</p>
                                                {bookieUsers.length === 0 ? (
                                                    <p className="text-slate-400 text-xs">No players yet.</p>
                                                ) : (
                                                    bookieUsers.map((u, i) => (
                                                        <div key={u._id} className="p-3 rounded-lg bg-white border border-slate-200">
                                                            <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                                                                <Link to={`/all-users/${u._id}`} className="font-medium text-blue-600 hover:text-blue-500 hover:underline text-sm">{u.username}</Link>
                                                                <div className="flex items-center gap-1.5">
                                                                    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs ${computeIsOnline(u) ? 'text-green-600' : 'text-slate-400'}`}>
                                                                        <span className={`w-1.5 h-1.5 rounded-full ${computeIsOnline(u) ? 'bg-green-500' : 'bg-gray-500'}`} />
                                                                        {computeIsOnline(u) ? 'Online' : 'Offline'}
                                                                    </span>
                                                                    <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${u.isActive !== false ? 'text-green-600 bg-green-50' : 'text-red-500 bg-red-50'}`}>
                                                                        {u.isActive !== false ? 'Active' : 'Suspended'}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <p className="text-slate-500 text-xs truncate mb-2">{u.email || '—'}</p>
                                                            <div className="flex items-center justify-between text-xs">
                                                                <span className="text-green-600 font-mono">₹{Number(u.walletBalance ?? 0).toLocaleString('en-IN')}</span>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleTogglePlayerStatus(u._id)}
                                                                    disabled={togglingId === u._id}
                                                                    className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold disabled:opacity-50 ${
                                                                        u.isActive !== false ? 'bg-red-600 text-white' : 'bg-green-600 text-white'
                                                                    }`}
                                                                >
                                                                    {togglingId === u._id ? '⏳' : u.isActive !== false ? <><FaUserSlash className="w-3 h-3" /> Suspend</> : <><FaUserCheck className="w-3 h-3" /> Unsuspend</>}
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ) : (
                    <div>
                        {(activeTab === 'bookie_users' || activeTab === 'super_admin_users') && (
                            <div className="px-4 py-3 bg-slate-50 border-b border-slate-300 text-sm text-slate-600">
                                {activeTab === 'bookie_users' ? (
                                    <><strong className="text-blue-600">All Bookies Players</strong> – Players who signed up via a bookie&apos;s link.</>
                                ) : (
                                    <><strong className="text-blue-600">Super Admin Players</strong> – Players who signed up directly or were created by super admin.</>
                                )}
                            </div>
                        )}
                        <div className="overflow-x-auto">
                        <table className="w-full text-sm min-w-[800px]">
                            <thead className="bg-slate-100">
                                <tr>
                                    <th className="px-2 sm:px-3 py-2 sm:py-3 text-left text-xs font-medium text-slate-600 uppercase w-8">#</th>
                                    <th className="px-2 sm:px-3 py-2 sm:py-3 text-left text-xs font-medium text-slate-600 uppercase">Name</th>
                                    <th className="px-2 sm:px-3 py-2 sm:py-3 text-left text-xs font-medium text-slate-600 uppercase">Email</th>
                                    <th className="px-2 sm:px-3 py-2 sm:py-3 text-left text-xs font-medium text-slate-600 uppercase">Phone</th>
                                    <th className="px-2 sm:px-3 py-2 sm:py-3 text-left text-xs font-medium text-slate-600 uppercase">Role</th>
                                    <th className="px-2 sm:px-3 py-2 sm:py-3 text-left text-xs font-medium text-slate-600 uppercase">Wallet</th>
                                    <th className="px-2 sm:px-3 py-2 sm:py-3 text-left text-xs font-medium text-slate-600 uppercase">Status</th>
                                    <th className="px-2 sm:px-3 py-2 sm:py-3 text-left text-xs font-medium text-slate-600 uppercase">Account</th>
                                    <th className="px-2 sm:px-3 py-2 sm:py-3 text-left text-xs font-medium text-slate-600 uppercase">Created</th>
                                    <th className="px-2 sm:px-3 py-2 sm:py-3 text-left text-xs font-medium text-slate-600 uppercase w-28 whitespace-nowrap">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {filteredList.map((item, index) => (
                                    <tr key={item._id} className="hover:bg-slate-50">
                                        <td className="px-2 sm:px-3 py-2 sm:py-3 text-slate-600">{index + 1}</td>
                                        <td className="px-2 sm:px-3 py-2 sm:py-3 font-medium">
                                            {isUserList ? (
                                                <Link to={`/all-users/${item._id}`} className="text-blue-600 hover:text-blue-500 hover:underline truncate block max-w-[120px]">{item.username}</Link>
                                            ) : (
                                                <span className="text-slate-800 truncate block max-w-[120px]">{item.username}</span>
                                            )}
                                        </td>
                                        <td className="px-2 sm:px-3 py-2 sm:py-3 text-slate-600 truncate max-w-[140px]">{item.email || '—'}</td>
                                        <td className="px-2 sm:px-3 py-2 sm:py-3 text-slate-600">{item.phone || '—'}</td>
                                        <td className="px-2 sm:px-3 py-2 sm:py-3">
                                            {(activeTab === 'super_admins') ? (
                                                <span className="px-2 py-1 rounded text-xs font-medium bg-slate-200 text-slate-700">Super Admin</span>
                                            ) : (
                                                <span className="px-2 py-1 rounded text-xs font-medium bg-slate-200 text-slate-700 capitalize">
                                                    {item.role === 'user' ? 'Player' : (item.role || 'Player')}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-2 sm:px-3 py-2 sm:py-3">
                                            {(activeTab === 'super_admins') ? (
                                                <span className="text-slate-500">—</span>
                                            ) : (
                                                <span className="font-mono font-medium text-green-600 text-xs sm:text-sm">
                                                    ₹{Number(item.walletBalance ?? 0).toLocaleString('en-IN')}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-2 sm:px-3 py-2 sm:py-3">
                                            {(activeTab === 'super_admins') ? (
                                                <span className={`px-2 py-1 rounded text-xs font-medium ${
                                                    item.status === 'active' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'
                                                }`}>
                                                    {item.status || '—'}
                                                </span>
                                            ) : (
                                                (() => {
                                                    const isOnline = computeIsOnline(item);
                                                    return (
                                                        <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${
                                                            isOnline
                                                                ? 'bg-green-50 text-green-600 border border-green-200'
                                                                : 'bg-slate-100 text-slate-500 border border-slate-300'
                                                        }`}>
                                                            <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-gray-500'}`} />
                                                            {isOnline ? 'Online' : 'Offline'}
                                                        </span>
                                                    );
                                                })()
                                            )}
                                        </td>
                                        <td className="px-2 sm:px-3 py-2 sm:py-3">
                                            {(activeTab === 'super_admins') ? (
                                                <span className="text-slate-500">—</span>
                                            ) : (
                                                <span className={`px-2 py-1 rounded text-xs font-medium ${
                                                    item.isActive !== false
                                                        ? 'bg-green-50 text-green-600 border border-green-200'
                                                        : 'bg-red-50 text-red-500 border border-red-200'
                                                }`}>
                                                    {item.isActive !== false ? 'Active' : 'Suspended'}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-2 sm:px-3 py-2 sm:py-3 text-slate-600 text-xs">
                                            {item.createdAt ? new Date(item.createdAt).toLocaleDateString('en-IN', {
                                                day: '2-digit',
                                                month: 'short',
                                                year: 'numeric',
                                            }) : '—'}
                                        </td>
                                        <td className="px-2 sm:px-3 py-2 sm:py-3 whitespace-nowrap">
                                            {(activeTab === 'super_admins') ? (
                                                <span className="text-slate-500">—</span>
                                            ) : (
                                                <button
                                                    type="button"
                                                    onClick={() => handleTogglePlayerStatus(item._id)}
                                                    disabled={togglingId === item._id}
                                                    className={`inline-flex items-center gap-1 sm:gap-1.5 px-2 py-1.5 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                                                        item.isActive !== false
                                                            ? 'bg-red-600 hover:bg-red-500 text-white'
                                                            : 'bg-green-600 hover:bg-green-500 text-white'
                                                    }`}
                                                    title={item.isActive !== false ? 'Suspend' : 'Unsuspend'}
                                                >
                                                    {togglingId === item._id ? (
                                                        <span className="animate-spin">⏳</span>
                                                    ) : item.isActive !== false ? (
                                                        <>
                                                            <FaUserSlash className="w-3.5 h-3.5 shrink-0" />
                                                            Suspend
                                                        </>
                                                    ) : (
                                                        <>
                                                            <FaUserCheck className="w-3.5 h-3.5 shrink-0" />
                                                            Unsuspend
                                                        </>
                                                    )}
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        </div>
                    </div>
                )}
            </div>

            {!loading && list.length > 0 && (
                <p className="mt-4 text-slate-500 text-sm">
                    Showing {filteredList.length} {TABS.find(t => t.id === activeTab)?.label?.toLowerCase()}
                    {searchQuery && filteredList.length !== list.length && (
                        <span> (filtered from {list.length})</span>
                    )}
                </p>
            )}

            {showPasswordModal && pendingAction && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/30">
                    <div className="bg-white rounded-xl border border-slate-300 shadow-xl w-full max-w-md">
                        <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-blue-600">
                                Confirm {pendingAction.type === 'player' ? 'Suspend/Unsuspend Player' : 'Suspend/Unsuspend Bookie'}
                            </h3>
                            <button type="button" onClick={() => { setShowPasswordModal(false); setPendingAction(null); setSecretPassword(''); setPasswordError(''); }} className="text-slate-500 hover:text-slate-900 p-1">×</button>
                        </div>
                        <form onSubmit={handlePasswordSubmit} className="p-4 space-y-4">
                            <p className="text-slate-600 text-sm">
                                Enter secret declare password to proceed.
                            </p>
                            <input
                                type="password"
                                placeholder="Secret declare password"
                                value={secretPassword}
                                onChange={(e) => { setSecretPassword(e.target.value); setPasswordError(''); }}
                                className="w-full px-3 py-2 rounded-lg bg-slate-100 border border-slate-300 text-slate-800 placeholder-slate-400"
                                autoFocus
                            />
                            {passwordError && (
                                <div className="rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm px-3 py-2">{passwordError}</div>
                            )}
                            <div className="flex gap-2 justify-end">
                                <button type="button" onClick={() => { setShowPasswordModal(false); setPendingAction(null); setSecretPassword(''); setPasswordError(''); }} className="px-4 py-2 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold">Cancel</button>
                                <button type="submit" disabled={togglingId !== null} className="px-4 py-2 rounded-lg bg-blue-700 hover:bg-blue-600 text-white font-semibold disabled:opacity-50">
                                    {togglingId ? <span className="animate-spin">⏳</span> : 'Confirm'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
};

export default AllUsers;
