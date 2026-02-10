import React, { useEffect, useState } from 'react';

const WalletSection = () => {
    const [balance, setBalance] = useState(0);

    useEffect(() => {
        const loadBalance = () => {
            try {
                const user = JSON.parse(localStorage.getItem('user') || 'null');
                const val = user?.balance || user?.wallet || user?.points || 0;
                setBalance(Number(val) || 0);
            } catch { }
        };
        loadBalance();
        window.addEventListener('userLogin', loadBalance);
        return () => window.removeEventListener('userLogin', loadBalance);
    }, []);

    return (
        <div className="mx-3 my-3 bg-blue-900 border border-blue-700 rounded-xl p-4">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-blue-200 text-xs">Player Wallet Balance</p>
                    <p className="text-white font-bold text-2xl">
                        ₹{Number(balance).toLocaleString('en-IN')}
                    </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-blue-700 flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
            </div>
        </div>
    );
};

export default WalletSection;
