import React from 'react';

const LatestNews = () => {
    return (
        <div className="mx-3 my-2 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 overflow-hidden">
            <div className="flex items-center gap-2 overflow-hidden">
                <span className="text-blue-600 text-xs font-bold shrink-0">NEWS:</span>
                <div className="overflow-hidden whitespace-nowrap flex-1">
                    <span className="text-gray-500 text-xs animate-scroll-news inline-block">
                        Welcome to the offline betting platform. Place your bets on Matka markets. Good luck!
                    </span>
                </div>
            </div>
        </div>
    );
};

export default LatestNews;
