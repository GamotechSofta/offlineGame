import React from 'react';

const HeroSection = () => {
  return (
    <section className="w-full bg-black">
      {/* Desktop Banner */}
      <div className="hidden md:block">
        <div className="overflow-hidden leading-[0] bg-gradient-to-r from-[#1a1a2e] via-[#16213e] to-[#1a1a2e]" style={{ aspectRatio: '1920 / 500' }}>
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <h2 className="text-4xl font-black text-[#d4af37] tracking-wider">MATKA</h2>
              <p className="text-gray-400 text-sm mt-2">Place your bets &amp; win big</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
