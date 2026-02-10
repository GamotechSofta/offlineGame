import React from 'react';

const HeroSection = () => {
    const player = JSON.parse(localStorage.getItem('user') || 'null');

    return (
        <div className="mx-3 mt-3 bg-blue-50 border border-blue-200 rounded-xl p-4">
            <h2 className="text-gray-900 font-bold text-lg">
                Welcome{player ? `, ${player.name}` : ''}!
            </h2>
            <p className="text-gray-500 text-sm mt-1">
                Select a market below to place bets
            </p>
        </div>
    );
};

export default HeroSection;
