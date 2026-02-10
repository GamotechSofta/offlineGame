import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BASE_URL from '../config/api';

// ─── Icons ─────────────────────────────────────────────
const Icon = ({ children, className = '' }) => (
    <svg className={`w-5 h-5 ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        {children}
    </svg>
);
const PlusIcon = () => <Icon><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></Icon>;
const WalletPlusIcon = () => <Icon className="w-4 h-4 text-green-600"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m6-6H6" /><rect x="2" y="6" width="20" height="14" rx="2" strokeLinecap="round" strokeLinejoin="round" /></Icon>;
const WalletMinusIcon = () => <Icon className="w-4 h-4 text-red-600"><path strokeLinecap="round" strokeLinejoin="round" d="M18 12H6" /><rect x="2" y="6" width="20" height="14" rx="2" strokeLinecap="round" strokeLinejoin="round" /></Icon>;
const EditIcon = () => <Icon className="w-4 h-4 text-blue-600"><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></Icon>;
const TrashIcon = () => <Icon className="w-4 h-4 text-red-600"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></Icon>;
const HistoryIcon = () => <Icon className="w-4 h-4 text-purple-600"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></Icon>;
const PlayIcon = () => <Icon className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></Icon>;
const BanIcon = () => <Icon className="w-4 h-4 text-yellow-600"><path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></Icon>;
const CheckIcon = () => <Icon className="w-4 h-4 text-green-600"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></Icon>;
const ChevronIcon = ({ open }) => (
    <svg className={`w-4 h-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
);

// ─── Modal ─────────────────────────────────────────────
const Modal = ({ open, onClose, title, children }) => {
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-white border border-blue-200 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between px-4 py-3 bg-blue-900 border-b border-blue-700">
                    <h3 className="text-white font-bold text-sm">{title}</h3>
                    <button onClick={onClose} className="text-blue-200 hover:text-white text-xl leading-none">&times;</button>
                </div>
                <div className="p-4">{children}</div>
            </div>
        </div>
    );
};

// ─── Main Component ────────────────────────────────────
const Players = () => {
    const navigate = useNavigate();
    const bookie = JSON.parse(localStorage.getItem('bookie') || 'null');

    // State
    const [players, setPlayers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedId, setExpandedId] = useState(null);
    const [search, setSearch] = useState('');

    // Create Player
    const [showCreate, setShowCreate] = useState(false);
    const [newName, setNewName] = useState('');
    const [newPhone, setNewPhone] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [createError, setCreateError] = useState('');
    const [creating, setCreating] = useState(false);

    // Add Funds Modal
    const [fundsModal, setFundsModal] = useState(null);
    const [fundsAmount, setFundsAmount] = useState('');
    const [fundsNote, setFundsNote] = useState('');
    const [fundsError, setFundsError] = useState('');
    const [fundsLoading, setFundsLoading] = useState(false);

    // Edit Modal
    const [editModal, setEditModal] = useState(null);
    const [editName, setEditName] = useState('');
    const [editPhone, setEditPhone] = useState('');
    const [editPassword, setEditPassword] = useState('');
    const [editError, setEditError] = useState('');
    const [editLoading, setEditLoading] = useState(false);

    // History Modal
    const [historyModal, setHistoryModal] = useState(null);
    const [historyData, setHistoryData] = useState([]);
    const [historyTab, setHistoryTab] = useState('transactions');
    const [historyLoading, setHistoryLoading] = useState(false);

    // Delete confirm
    const [deleteConfirm, setDeleteConfirm] = useState(null);

    // ─── Fetch Players ────────────────────────────────
    const fetchPlayers = useCallback(async () => {
        if (!bookie?.id) return;
        try {
            setLoading(true);
            const res = await fetch(`${BASE_URL}/bookie/players?bookieId=${encodeURIComponent(bookie.id)}`);
            const data = await res.json();
            if (data.success) setPlayers(data.data || []);
        } catch { } finally {
            setLoading(false);
        }
    }, [bookie?.id]);

    useEffect(() => {
        if (!bookie) { navigate('/login'); return; }
        fetchPlayers();
    }, []);

    // ─── Create Player ────────────────────────────────
    const handleCreatePlayer = async (e) => {
        e.preventDefault();
        if (!newName.trim() || !newPhone.trim()) { setCreateError('Name and phone are required'); return; }
        if (newPhone.length < 10) { setCreateError('Phone must be 10 digits'); return; }
        setCreating(true); setCreateError('');
        try {
            const res = await fetch(`${BASE_URL}/bookie/players`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    bookieId: bookie.id,
                    name: newName.trim(),
                    phone: newPhone.trim(),
                    password: newPassword.trim() || newPhone.trim(),
                }),
            });
            const data = await res.json();
            if (data.success) {
                setNewName(''); setNewPhone(''); setNewPassword(''); setShowCreate(false);
                fetchPlayers();
            } else {
                setCreateError(data.message || 'Failed to create player');
            }
        } catch { setCreateError('Server error'); }
        finally { setCreating(false); }
    };

    // ─── Add / Withdraw Funds ─────────────────────────
    const openFundsModal = (player, type) => {
        setFundsModal({ playerId: player.id, playerName: player.name, type, balance: player.balance || 0 });
        setFundsAmount(''); setFundsNote(''); setFundsError('');
    };

    const handleFunds = async () => {
        const amount = Number(fundsAmount);
        if (!amount || amount <= 0) { setFundsError('Enter a valid amount'); return; }
        setFundsLoading(true); setFundsError('');
        const endpoint = fundsModal.type === 'add' ? 'add-funds' : 'withdraw-funds';
        try {
            const res = await fetch(`${BASE_URL}/bookie/players/${fundsModal.playerId}/${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount, note: fundsNote.trim() }),
            });
            const data = await res.json();
            if (data.success) {
                setFundsModal(null);
                fetchPlayers();
                const currentUser = JSON.parse(localStorage.getItem('user') || 'null');
                if (currentUser && String(currentUser.id) === String(fundsModal.playerId)) {
                    currentUser.balance = data.data.balance;
                    currentUser.wallet = data.data.balance;
                    localStorage.setItem('user', JSON.stringify(currentUser));
                    window.dispatchEvent(new Event('userLogin'));
                }
            } else {
                setFundsError(data.message || 'Failed');
            }
        } catch { setFundsError('Server error'); }
        finally { setFundsLoading(false); }
    };

    // ─── Edit Player ──────────────────────────────────
    const openEditModal = (player) => {
        setEditModal(player);
        setEditName(player.name);
        setEditPhone(player.phone);
        setEditPassword('');
        setEditError('');
    };

    const handleEdit = async () => {
        if (!editName.trim()) { setEditError('Name is required'); return; }
        setEditLoading(true); setEditError('');
        const body = { name: editName.trim(), phone: editPhone.trim() };
        if (editPassword.trim()) body.password = editPassword.trim();
        try {
            const res = await fetch(`${BASE_URL}/bookie/players/${editModal.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });
            const data = await res.json();
            if (data.success) { setEditModal(null); fetchPlayers(); }
            else { setEditError(data.message || 'Failed'); }
        } catch { setEditError('Server error'); }
        finally { setEditLoading(false); }
    };

    // ─── Toggle Status ────────────────────────────────
    const handleToggleStatus = async (player) => {
        try {
            const res = await fetch(`${BASE_URL}/bookie/players/${player.id}/toggle-status`, { method: 'POST' });
            const data = await res.json();
            if (data.success) fetchPlayers();
        } catch { }
    };

    // ─── Delete Player ────────────────────────────────
    const handleDelete = async (playerId) => {
        try {
            const res = await fetch(`${BASE_URL}/bookie/players/${playerId}`, { method: 'DELETE' });
            const data = await res.json();
            if (data.success) {
                setDeleteConfirm(null);
                fetchPlayers();
                const currentUser = JSON.parse(localStorage.getItem('user') || 'null');
                if (currentUser && String(currentUser.id) === String(playerId)) {
                    localStorage.removeItem('user');
                    window.dispatchEvent(new Event('userLogout'));
                }
            }
        } catch { }
    };

    // ─── View History ─────────────────────────────────
    const openHistory = async (player, tab = 'transactions') => {
        setHistoryModal({ playerId: player.id, playerName: player.name });
        setHistoryTab(tab);
        setHistoryLoading(true);
        try {
            const endpoint = tab === 'transactions'
                ? `${BASE_URL}/bookie/players/${player.id}/transactions`
                : `${BASE_URL}/bookie/players/${player.id}/bets`;
            const res = await fetch(endpoint);
            const data = await res.json();
            setHistoryData(data.success ? data.data : []);
        } catch { setHistoryData([]); }
        finally { setHistoryLoading(false); }
    };

    const switchHistoryTab = async (tab) => {
        if (!historyModal) return;
        setHistoryTab(tab);
        setHistoryLoading(true);
        try {
            const endpoint = tab === 'transactions'
                ? `${BASE_URL}/bookie/players/${historyModal.playerId}/transactions`
                : `${BASE_URL}/bookie/players/${historyModal.playerId}/bets`;
            const res = await fetch(endpoint);
            const data = await res.json();
            setHistoryData(data.success ? data.data : []);
        } catch { setHistoryData([]); }
        finally { setHistoryLoading(false); }
    };

    // ─── Select Player to Play ────────────────────────
    const handleSelectPlayer = (player) => {
        if (player.status === 'suspended') return;
        const userData = {
            id: player.id,
            name: player.name,
            phone: player.phone,
            balance: player.balance || 0,
            wallet: player.balance || 0,
        };
        localStorage.setItem('user', JSON.stringify(userData));
        window.dispatchEvent(new Event('userLogin'));
        navigate('/home');
    };

    // ─── Quick Stats ──────────────────────────────────
    const totalPlayers = players.length;
    const activePlayers = players.filter((p) => p.status === 'active').length;
    const totalBalance = players.reduce((sum, p) => sum + (Number(p.balance) || 0), 0);

    // ─── Filter ───────────────────────────────────────
    const filteredPlayers = players.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase()) || p.phone.includes(search)
    );

    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        const d = new Date(dateStr);
        return d.toLocaleString('en-IN', { day: '2-digit', month: 'short', year: '2-digit', hour: '2-digit', minute: '2-digit', hour12: true });
    };

    // ───────────────────────────────────────────────────
    // ─── RENDER ───────────────────────────────────────
    // ───────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-white">
            {/* ─── Header ─── */}
            <header className="sticky top-0 z-30 bg-blue-900 border-b border-blue-200 shadow-lg">
                <div className="flex items-center justify-between px-3 py-3 max-w-7xl mx-auto">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                            <span className="text-white font-black text-sm">B</span>
                        </div>
                        <div>
                            <h1 className="text-white font-bold text-sm">Offline Bookie</h1>
                            <p className="text-blue-200 text-[10px]">{bookie?.name || bookie?.username}</p>
                        </div>
                    </div>
                    <button
                        onClick={() => { localStorage.removeItem('bookie'); localStorage.removeItem('user'); navigate('/login'); }}
                        className="text-red-300 hover:text-red-200 text-xs font-medium px-3 py-1.5 rounded-lg border border-red-400/30 hover:border-red-400/50 transition-colors"
                    >
                        Logout
                    </button>
                </div>
            </header>

            <div className="px-3 py-4 max-w-2xl mx-auto space-y-4">
                {/* ─── Quick Stats ─── */}
                <div className="grid grid-cols-3 gap-2">
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-center">
                        <p className="text-2xl font-black text-gray-900">{totalPlayers}</p>
                        <p className="text-gray-500 text-[10px] mt-0.5">Total Players</p>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-center">
                        <p className="text-2xl font-black text-green-600">{activePlayers}</p>
                        <p className="text-gray-500 text-[10px] mt-0.5">Active</p>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-center">
                        <p className="text-2xl font-black text-blue-600">₹{totalBalance.toLocaleString('en-IN')}</p>
                        <p className="text-gray-500 text-[10px] mt-0.5">Total Balance</p>
                    </div>
                </div>

                {/* ─── Search + Create ─── */}
                <div className="flex items-center gap-2">
                    <div className="flex-1 relative">
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by name or phone..."
                            className="w-full bg-blue-50 border border-blue-200 text-gray-900 placeholder-gray-400 rounded-xl py-2.5 pl-9 pr-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                        />
                        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    </div>
                    <button
                        onClick={() => { setShowCreate(!showCreate); setCreateError(''); }}
                        className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm px-4 py-2.5 rounded-xl shadow transition-all active:scale-[0.98] flex items-center gap-1 shrink-0"
                    >
                        <PlusIcon /> Player
                    </button>
                </div>

                {/* ─── Create Player Form ─── */}
                {showCreate && (
                    <form onSubmit={handleCreatePlayer} className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-3 animate-in">
                        <h3 className="text-gray-900 font-bold text-sm flex items-center gap-2">
                            <span className="w-1.5 h-5 bg-blue-600 rounded-full"></span>
                            Create New Player
                        </h3>
                        {createError && (
                            <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg px-3 py-2 text-xs">{createError}</div>
                        )}
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-gray-600 text-xs font-medium block mb-1">Player Name *</label>
                                <input
                                    type="text"
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                    placeholder="Enter name"
                                    className="w-full bg-white border border-blue-200 text-gray-900 placeholder-gray-400 rounded-lg py-2.5 px-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="text-gray-600 text-xs font-medium block mb-1">Phone Number *</label>
                                <input
                                    type="text"
                                    value={newPhone}
                                    onChange={(e) => setNewPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                                    placeholder="10-digit phone"
                                    inputMode="numeric"
                                    className="w-full bg-white border border-blue-200 text-gray-900 placeholder-gray-400 rounded-lg py-2.5 px-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="text-gray-600 text-xs font-medium block mb-1">Password <span className="text-gray-400">(default: phone number)</span></label>
                            <input
                                type="text"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="Leave blank for phone as password"
                                className="w-full bg-white border border-blue-200 text-gray-900 placeholder-gray-400 rounded-lg py-2.5 px-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                            />
                        </div>
                        <div className="flex gap-2">
                            <button
                                type="submit"
                                disabled={creating}
                                className={`flex-1 bg-blue-600 text-white font-bold py-2.5 rounded-lg shadow transition-all ${creating ? 'opacity-60' : 'hover:bg-blue-500 active:scale-[0.98]'}`}
                            >
                                {creating ? 'Creating...' : 'Create Player'}
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowCreate(false)}
                                className="px-4 py-2.5 rounded-lg border border-blue-200 text-gray-500 hover:text-gray-900 hover:border-blue-400 transition-colors text-sm"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                )}

                {/* ─── Players List ─── */}
                {loading ? (
                    <div className="animate-pulse space-y-3">
                        {[1, 2, 3].map((i) => <div key={i} className="h-20 bg-blue-100 rounded-xl" />)}
                    </div>
                ) : filteredPlayers.length === 0 ? (
                    <div className="text-center py-16 text-gray-400">
                        <svg className="w-16 h-16 mx-auto mb-3 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                        <p className="text-sm">{search ? 'No players matching search' : 'No players yet. Create your first player!'}</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {filteredPlayers.map((p) => {
                            const isExpanded = expandedId === p.id;
                            const isSuspended = p.status === 'suspended';

                            return (
                                <div key={p.id} className={`bg-white border rounded-xl overflow-hidden transition-all shadow-sm ${isSuspended ? 'border-red-200 opacity-75' : 'border-blue-200'}`}>
                                    {/* ─── Player Card Header ─── */}
                                    <div className="flex items-center gap-3 px-3 py-3">
                                        {/* Avatar */}
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-black shrink-0 ${isSuspended ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                                            {p.name.charAt(0).toUpperCase()}
                                        </div>
                                        {/* Info */}
                                        <div className="flex-1 min-w-0" onClick={() => setExpandedId(isExpanded ? null : p.id)} style={{ cursor: 'pointer' }}>
                                            <div className="flex items-center gap-2">
                                                <h3 className="text-gray-900 font-bold text-sm truncate">{p.name}</h3>
                                                {isSuspended && (
                                                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-red-100 text-red-600 font-medium shrink-0">SUSPENDED</span>
                                                )}
                                            </div>
                                            <p className="text-gray-500 text-xs">{p.phone}</p>
                                        </div>
                                        {/* Balance + Actions */}
                                        <div className="flex items-center gap-2 shrink-0">
                                            <p className="text-blue-600 font-black text-sm">₹{Number(p.balance || 0).toLocaleString('en-IN')}</p>
                                            <button onClick={() => setExpandedId(isExpanded ? null : p.id)} className="p-1">
                                                <ChevronIcon open={isExpanded} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* ─── Quick Actions (always visible) ─── */}
                                    <div className="flex border-t border-blue-100 divide-x divide-blue-100">
                                        <button
                                            onClick={() => openFundsModal(p, 'add')}
                                            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium text-green-600 hover:bg-green-50 transition-colors"
                                        >
                                            <WalletPlusIcon /> Add Fund
                                        </button>
                                        <button
                                            onClick={() => openFundsModal(p, 'withdraw')}
                                            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
                                        >
                                            <WalletMinusIcon /> Withdraw
                                        </button>
                                        <button
                                            onClick={() => handleSelectPlayer(p)}
                                            disabled={isSuspended}
                                            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-colors ${isSuspended ? 'text-gray-400 cursor-not-allowed' : 'text-blue-600 hover:bg-blue-50'}`}
                                        >
                                            <PlayIcon /> Play
                                        </button>
                                    </div>

                                    {/* ─── Expanded Actions ─── */}
                                    {isExpanded && (
                                        <div className="border-t border-blue-100 bg-blue-50/50 px-3 py-3 space-y-2">
                                            <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
                                                <div>Joined: <span className="text-gray-700">{formatDate(p.createdAt)}</span></div>
                                                <div>Status: <span className={isSuspended ? 'text-red-600' : 'text-green-600'}>{p.status || 'active'}</span></div>
                                            </div>
                                            <div className="flex flex-wrap gap-2 pt-1">
                                                <button onClick={() => openEditModal(p)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-blue-200 text-blue-600 hover:bg-blue-50 text-xs font-medium transition-colors">
                                                    <EditIcon /> Edit
                                                </button>
                                                <button onClick={() => handleToggleStatus(p)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-yellow-200 text-yellow-600 hover:bg-yellow-50 text-xs font-medium transition-colors">
                                                    {isSuspended ? <><CheckIcon /> Activate</> : <><BanIcon /> Suspend</>}
                                                </button>
                                                <button onClick={() => openHistory(p, 'transactions')} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-purple-200 text-purple-600 hover:bg-purple-50 text-xs font-medium transition-colors">
                                                    <HistoryIcon /> Transactions
                                                </button>
                                                <button onClick={() => openHistory(p, 'bets')} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-cyan-200 text-cyan-600 hover:bg-cyan-50 text-xs font-medium transition-colors">
                                                    <HistoryIcon /> Bet History
                                                </button>
                                                <button onClick={() => setDeleteConfirm(p)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 text-xs font-medium transition-colors">
                                                    <TrashIcon /> Delete
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* ═══ MODALS ══════════════════════════════════════ */}

            {/* ─── Add/Withdraw Funds Modal ─── */}
            <Modal
                open={!!fundsModal}
                onClose={() => setFundsModal(null)}
                title={fundsModal?.type === 'add' ? `Add Fund — ${fundsModal?.playerName}` : `Withdraw Fund — ${fundsModal?.playerName}`}
            >
                <div className="space-y-3">
                    <div className="text-center py-2">
                        <p className="text-gray-500 text-xs">Current Balance</p>
                        <p className="text-blue-600 text-2xl font-black">₹{Number(fundsModal?.balance || 0).toLocaleString('en-IN')}</p>
                    </div>
                    {fundsError && <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg px-3 py-2 text-xs">{fundsError}</div>}
                    <div>
                        <label className="text-gray-600 text-xs font-medium block mb-1">Amount *</label>
                        <input
                            type="text"
                            inputMode="numeric"
                            value={fundsAmount}
                            onChange={(e) => setFundsAmount(e.target.value.replace(/\D/g, ''))}
                            placeholder="Enter amount"
                            autoFocus
                            className="w-full bg-blue-50 border border-blue-200 text-gray-900 placeholder-gray-400 rounded-lg py-3 px-3 text-lg font-bold text-center focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                        />
                    </div>
                    {/* Quick amount buttons */}
                    <div className="flex gap-2 flex-wrap">
                        {[100, 500, 1000, 2000, 5000].map((amt) => (
                            <button
                                key={amt}
                                onClick={() => setFundsAmount(String(amt))}
                                className="px-3 py-1.5 rounded-lg border border-blue-200 text-gray-700 hover:border-blue-400 hover:text-blue-600 text-xs font-medium transition-colors"
                            >
                                ₹{amt.toLocaleString()}
                            </button>
                        ))}
                    </div>
                    <div>
                        <label className="text-gray-600 text-xs font-medium block mb-1">Note <span className="text-gray-400">(optional)</span></label>
                        <input
                            type="text"
                            value={fundsNote}
                            onChange={(e) => setFundsNote(e.target.value)}
                            placeholder="Add a note..."
                            className="w-full bg-blue-50 border border-blue-200 text-gray-900 placeholder-gray-400 rounded-lg py-2 px-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                        />
                    </div>
                    <button
                        onClick={handleFunds}
                        disabled={fundsLoading}
                        className={`w-full py-3 rounded-lg font-bold text-sm shadow transition-all ${fundsModal?.type === 'add'
                            ? 'bg-green-600 text-white hover:bg-green-500'
                            : 'bg-red-600 text-white hover:bg-red-500'
                            } ${fundsLoading ? 'opacity-60' : 'active:scale-[0.98]'}`}
                    >
                        {fundsLoading ? 'Processing...' : fundsModal?.type === 'add' ? `Add ₹${Number(fundsAmount || 0).toLocaleString('en-IN')}` : `Withdraw ₹${Number(fundsAmount || 0).toLocaleString('en-IN')}`}
                    </button>
                </div>
            </Modal>

            {/* ─── Edit Player Modal ─── */}
            <Modal open={!!editModal} onClose={() => setEditModal(null)} title={`Edit Player — ${editModal?.name}`}>
                <div className="space-y-3">
                    {editError && <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg px-3 py-2 text-xs">{editError}</div>}
                    <div>
                        <label className="text-gray-600 text-xs font-medium block mb-1">Player Name *</label>
                        <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="w-full bg-blue-50 border border-blue-200 text-gray-900 placeholder-gray-400 rounded-lg py-2.5 px-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                        />
                    </div>
                    <div>
                        <label className="text-gray-600 text-xs font-medium block mb-1">Phone Number</label>
                        <input
                            type="text"
                            value={editPhone}
                            onChange={(e) => setEditPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                            inputMode="numeric"
                            className="w-full bg-blue-50 border border-blue-200 text-gray-900 placeholder-gray-400 rounded-lg py-2.5 px-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                        />
                    </div>
                    <div>
                        <label className="text-gray-600 text-xs font-medium block mb-1">New Password <span className="text-gray-400">(leave blank to keep current)</span></label>
                        <input
                            type="text"
                            value={editPassword}
                            onChange={(e) => setEditPassword(e.target.value)}
                            placeholder="Enter new password"
                            className="w-full bg-blue-50 border border-blue-200 text-gray-900 placeholder-gray-400 rounded-lg py-2.5 px-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                        />
                    </div>
                    <button
                        onClick={handleEdit}
                        disabled={editLoading}
                        className={`w-full bg-blue-600 text-white font-bold py-2.5 rounded-lg shadow transition-all ${editLoading ? 'opacity-60' : 'hover:bg-blue-500 active:scale-[0.98]'}`}
                    >
                        {editLoading ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </Modal>

            {/* ─── History Modal ─── */}
            <Modal
                open={!!historyModal}
                onClose={() => setHistoryModal(null)}
                title={`${historyModal?.playerName} — History`}
            >
                <div className="space-y-3">
                    {/* Tabs */}
                    <div className="flex border border-blue-200 rounded-lg overflow-hidden">
                        <button
                            onClick={() => switchHistoryTab('transactions')}
                            className={`flex-1 py-2 text-xs font-bold transition-colors ${historyTab === 'transactions' ? 'bg-blue-600 text-white' : 'text-gray-500 hover:text-gray-900'}`}
                        >
                            Transactions
                        </button>
                        <button
                            onClick={() => switchHistoryTab('bets')}
                            className={`flex-1 py-2 text-xs font-bold transition-colors ${historyTab === 'bets' ? 'bg-blue-600 text-white' : 'text-gray-500 hover:text-gray-900'}`}
                        >
                            Bet History
                        </button>
                    </div>
                    {/* Content */}
                    <div className="max-h-72 overflow-y-auto space-y-1.5">
                        {historyLoading ? (
                            <div className="text-center py-8 text-gray-400 text-sm">Loading...</div>
                        ) : historyData.length === 0 ? (
                            <div className="text-center py-8 text-gray-400 text-sm">No {historyTab === 'transactions' ? 'transactions' : 'bets'} yet</div>
                        ) : historyTab === 'transactions' ? (
                            historyData.map((t) => (
                                <div key={t.id} className="flex items-center justify-between bg-blue-50 border border-blue-100 rounded-lg px-3 py-2">
                                    <div>
                                        <p className={`font-bold text-sm ${t.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                                            {t.type === 'credit' ? '+' : '-'}₹{Number(t.amount).toLocaleString('en-IN')}
                                        </p>
                                        <p className="text-gray-500 text-[10px]">{t.note || (t.type === 'credit' ? 'Fund added' : 'Fund withdrawn')}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-gray-500 text-[10px]">{formatDate(t.createdAt)}</p>
                                        <p className="text-gray-400 text-[10px]">Bal: ₹{Number(t.newBalance || 0).toLocaleString('en-IN')}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            historyData.map((b) => (
                                <div key={b.id} className="flex items-center justify-between bg-blue-50 border border-blue-100 rounded-lg px-3 py-2">
                                    <div>
                                        <p className="text-gray-900 font-medium text-xs">{b.marketName}</p>
                                        <p className="text-gray-500 text-[10px]">{b.betType} • {b.betNumber} • {b.betOn}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-blue-600 font-bold text-sm">₹{Number(b.amount).toLocaleString('en-IN')}</p>
                                        <p className={`text-[10px] font-medium ${b.status === 'won' ? 'text-green-600' : b.status === 'lost' ? 'text-red-600' : 'text-yellow-600'}`}>
                                            {b.status || 'pending'}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </Modal>

            {/* ─── Delete Confirmation Modal ─── */}
            <Modal open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Delete Player">
                <div className="space-y-4">
                    <p className="text-gray-600 text-sm">
                        Are you sure you want to delete <strong className="text-gray-900">{deleteConfirm?.name}</strong>?
                        This will permanently remove the player and cannot be undone.
                    </p>
                    {deleteConfirm?.balance > 0 && (
                        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 rounded-lg px-3 py-2 text-xs">
                            ⚠️ This player has a balance of ₹{Number(deleteConfirm.balance).toLocaleString('en-IN')}
                        </div>
                    )}
                    <div className="flex gap-2">
                        <button
                            onClick={() => setDeleteConfirm(null)}
                            className="flex-1 py-2.5 rounded-lg border border-blue-200 text-gray-500 hover:text-gray-900 hover:border-blue-400 transition-colors text-sm font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => handleDelete(deleteConfirm.id)}
                            className="flex-1 bg-red-600 hover:bg-red-500 text-white font-bold py-2.5 rounded-lg shadow transition-all active:scale-[0.98] text-sm"
                        >
                            Delete Player
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default Players;
