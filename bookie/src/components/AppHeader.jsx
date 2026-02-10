import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AppHeader = () => {
    const navigate = useNavigate();
    const [bookie, setBookie] = useState(null);
    const [player, setPlayer] = useState(null);

    useEffect(() => {
        const loadData = () => {
            try {
                const b = JSON.parse(localStorage.getItem('bookie') || 'null');
                const u = JSON.parse(localStorage.getItem('user') || 'null');
                setBookie(b);
                setPlayer(u);
            } catch { }
        };
        loadData();
        window.addEventListener('userLogin', loadData);
        window.addEventListener('storage', loadData);
        return () => {
            window.removeEventListener('userLogin', loadData);
            window.removeEventListener('storage', loadData);
        };
    }, []);

    const balance = player?.balance ?? player?.wallet ?? 0;

    const handleBackToPlayers = () => {
        localStorage.removeItem('user');
        window.dispatchEvent(new Event('userLogin'));
        navigate('/players');
    };

    return (
        <header className="fixed top-0 left-56 sm:left-64 md:left-72 right-0 z-30 bg-blue-900 border-b border-blue-200 shadow-lg">
            <div className="flex items-center justify-between px-3 py-2.5">
                {/* Left: Logo */}
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center shadow-md">
                        <span className="text-white font-black text-sm">B</span>
                    </div>
                    <div>
                        <h1 className="text-white font-bold text-sm leading-tight">Offline Bookie</h1>
                        {bookie && (
                            <p className="text-blue-200 text-[10px] leading-tight">{bookie.name || bookie.username}</p>
                        )}
                    </div>
                </div>

                {/* Center: Player info */}
                {player && (
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleBackToPlayers}
                            className="text-blue-200 text-xs font-medium hover:underline"
                        >
                            ← Players
                        </button>
                        <div className="bg-blue-800 border border-blue-600 rounded-full px-3 py-1 flex items-center gap-2">
                            <span className="text-blue-100 text-xs">{player.name}</span>
                            <span className="text-white font-bold text-xs">₹{Number(balance).toLocaleString('en-IN')}</span>
                        </div>
                    </div>
                )}

                {/* Right: empty space to balance */}
                <div className="w-8" />
            </div>
        </header>
    );
};

export default AppHeader;
