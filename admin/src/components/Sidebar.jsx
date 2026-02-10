import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    FaTachometerAlt,
    FaChartBar,
    FaHistory,
    FaChartLine,
    FaCreditCard,
    FaWallet,
    FaLifeRing,
    FaSignOutAlt,
    FaUsers,
    FaUserFriends,
    FaEdit,
    FaClipboardList,
    FaCoins,
    FaCog
} from 'react-icons/fa';

const Sidebar = ({ onLogout }) => {
    const navigate = useNavigate();
    const location = useLocation();

    const menuItems = [
        { path: '/dashboard', label: 'Dashboard', icon: FaTachometerAlt },
        { path: '/all-users', label: 'All Players', icon: FaUserFriends },
        { path: '/bookie-management', label: 'Bookie Accounts', icon: FaUsers },
        { path: '/markets', label: 'Markets', icon: FaChartBar },
        { path: '/add-result', label: 'Add Result', icon: FaEdit },
        { path: '/update-rate', label: 'Update Rate', icon: FaCoins },
        { path: '/bet-history', label: 'Bet History', icon: FaHistory },
        { path: '/reports', label: 'Report', icon: FaChartLine },
        { path: '/payment-management', label: 'Payments', icon: FaCreditCard },
        { path: '/wallet', label: 'Wallet', icon: FaWallet },
        { path: '/help-desk', label: 'Help Desk', icon: FaLifeRing },
        { path: '/logs', label: 'Logs', icon: FaClipboardList },
        { path: '/settings', label: 'Settings', icon: FaCog },
    ];

    const isActive = (path) => {
        if (path === '/all-users' || path === '/markets') {
            return location.pathname === path || location.pathname.startsWith(path + '/');
        }
        return location.pathname === path;
    };

    return (
        <aside className="fixed left-0 top-0 h-screen w-56 sm:w-64 md:w-72 bg-[#0f172a] flex flex-col z-50 shadow-xl">
            {/* Logo */}
            <div className="p-4 sm:p-6 border-b border-white/10 shrink-0">
                <h2 className="text-lg sm:text-xl font-bold text-white">Super Admin</h2>
            </div>

            {/* Menu Items */}
            <nav className="flex-1 p-2 sm:p-3 md:p-4 space-y-1 overflow-y-auto">
                {menuItems.map((item) => (
                    <button
                        key={item.path}
                        onClick={() => navigate(item.path)}
                        className={`w-full flex items-center gap-2 sm:gap-3 px-2.5 sm:px-3 md:px-4 py-2 sm:py-2.5 md:py-3 rounded-xl transition-all duration-200 text-xs sm:text-sm md:text-base ${isActive(item.path)
                            ? 'bg-blue-600 text-white font-semibold shadow-lg shadow-blue-600/20'
                            : 'text-slate-300 hover:bg-white/10 hover:text-white'
                            }`}
                    >
                        <item.icon className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
                        <span className="truncate">{item.label}</span>
                    </button>
                ))}
            </nav>

            {/* Logout */}
            <div className="p-2 sm:p-3 md:p-4 border-t border-white/10 shrink-0">
                <button
                    onClick={onLogout}
                    className="w-full flex items-center gap-2 sm:gap-3 px-2.5 sm:px-3 md:px-4 py-2 sm:py-2.5 md:py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold transition-all duration-200 text-xs sm:text-sm md:text-base"
                >
                    <FaSignOutAlt className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
                    <span>Logout</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
