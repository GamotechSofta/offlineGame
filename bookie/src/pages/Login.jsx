import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BASE_URL from '../config/api';

const Login = () => {
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // If already logged in, redirect
    React.useEffect(() => {
        const bookie = localStorage.getItem('bookie');
        if (bookie) navigate('/players', { replace: true });
    }, [navigate]);

    const handleLogin = async (e) => {
        e.preventDefault();
        if (!phone.trim() || !password.trim()) {
            setError('Please enter phone number and password');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const res = await fetch(`${BASE_URL}/bookie/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: phone.trim(), password: password.trim() }),
            });
            const data = await res.json();

            if (data.success) {
                localStorage.setItem('bookie', JSON.stringify(data.data));
                navigate('/players');
            } else {
                setError(data.message || 'Login failed');
            }
        } catch (err) {
            setError('Server error. Make sure the backend is running.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-blue-950 flex items-center justify-center px-4">
            <div className="w-full max-w-sm">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                        <span className="text-white font-black text-2xl">B</span>
                    </div>
                    <h1 className="text-white text-2xl font-bold">Offline Bookie</h1>
                    <p className="text-blue-300 text-sm mt-1">Login to manage your players</p>
                </div>

                {/* Form */}
                <form onSubmit={handleLogin} className="space-y-4">
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/30 text-red-300 rounded-xl px-4 py-3 text-sm">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="text-blue-200 text-sm font-medium block mb-1.5">Phone Number</label>
                        <input
                            type="tel"
                            inputMode="numeric"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                            placeholder="Enter your phone number"
                            maxLength={10}
                            className="w-full bg-blue-900/50 border border-blue-700/50 text-white placeholder-blue-300 rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 focus:outline-none"
                        />
                    </div>

                    <div>
                        <label className="text-blue-200 text-sm font-medium block mb-1.5">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
                            className="w-full bg-blue-900/50 border border-blue-700/50 text-white placeholder-blue-300 rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 focus:outline-none"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-xl shadow-lg transition-all ${
                            loading ? 'opacity-60 cursor-not-allowed' : 'active:scale-[0.98]'
                        }`}
                    >
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>

                <p className="text-blue-400 text-xs text-center mt-6">
                    Use the phone number and password given by your admin
                </p>
            </div>
        </div>
    );
};

export default Login;
