import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import HeroSection from '../components/HeroSection';
import WalletSection from '../components/WalletSection';
import LatestNews from '../components/LatestNews';
import Section1 from '../components/Section1';

const Home = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const bookie = JSON.parse(localStorage.getItem('bookie') || 'null');
        if (!bookie) {
            navigate('/login');
            return;
        }
        const user = JSON.parse(localStorage.getItem('user') || 'null');
        if (!user) {
            navigate('/players');
        }
    }, [navigate]);

    return (
        <div className="min-h-screen bg-white pb-4">
            <HeroSection />
            <WalletSection />
            <LatestNews />
            <Section1 />
        </div>
    );
};

export default Home;
