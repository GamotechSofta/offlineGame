import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getBalance, updateUserBalance } from '../api/bets';

const MENU_ICONS = {
  'Home': <svg className="w-6 h-6 sm:w-7 sm:h-7 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955a1.126 1.126 0 011.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" /></svg>,
  'My Bets': <svg className="w-6 h-6 sm:w-7 sm:h-7 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15a2.25 2.25 0 012.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" /></svg>,
  'Bank': <svg className="w-6 h-6 sm:w-7 sm:h-7 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z" /></svg>,
  'Funds': <svg className="w-6 h-6 sm:w-7 sm:h-7 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 014.5 15h.75M15.75 9a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" /></svg>,
  'Top Winners': <svg className="w-6 h-6 sm:w-7 sm:h-7 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M18.75 4.236c.982.143 1.954.317 2.916.52A6.003 6.003 0 0016.27 9.728M18.75 4.236V4.5c0 2.108-.966 3.99-2.48 5.228m0 0a6.003 6.003 0 01-5.54 0" /></svg>,
  'Telegram Channel': <svg className="w-6 h-6 sm:w-7 sm:h-7 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" /></svg>,
  'Notification': <svg className="w-6 h-6 sm:w-7 sm:h-7 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" /></svg>,
  'Game Chart': <svg className="w-6 h-6 sm:w-7 sm:h-7 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" /></svg>,
  'Game Rate': <svg className="w-6 h-6 sm:w-7 sm:h-7 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  'Time Table': <svg className="w-6 h-6 sm:w-7 sm:h-7 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  'Notice board / Rules': <svg className="w-6 h-6 sm:w-7 sm:h-7 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M11.35 3.836c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15a2.25 2.25 0 012.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m8.9-4.414c.376.023.75.05 1.124.08 1.131.094 1.976 1.057 1.976 2.192V16.5A2.25 2.25 0 0118 18.75h-2.25m-7.5-10.5H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V18.75m-7.5-10.5h6.375c.621 0 1.125.504 1.125 1.125v9.375m-8.25-3l1.5 1.5 3-3.75" /></svg>,
  'Help Desk': <svg className="w-6 h-6 sm:w-7 sm:h-7 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" /></svg>,
  'Settings': <svg className="w-6 h-6 sm:w-7 sm:h-7 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
  'How to play': <svg className="w-6 h-6 sm:w-7 sm:h-7 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" /></svg>,
  'Share App': <svg className="w-6 h-6 sm:w-7 sm:h-7 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" /></svg>,
  'Logout': <svg className="w-6 h-6 sm:w-7 sm:h-7 text-red-400/70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" /></svg>,
  'Profile': <svg className="w-6 h-6 sm:w-7 sm:h-7 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>,
};

const MenuIcon = ({ label }) => {
  return MENU_ICONS[label] || <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 border-white/40"></div>;
};

const AppHeader = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [balance, setBalance] = useState(null);

  const menuItems = [
    { label: 'My Bets', path: '/bids' },
    { label: 'Bank', path: '/funds?tab=bank-detail' },
    { label: 'Funds', path: '/funds' },
    { label: 'Home', path: '/' },
    { label: 'Profile', path: '/profile' },
    { label: 'Top Winners', path: '/top-winners' },
    { label: 'Telegram Channel', path: '/support' },
    { label: 'Notification', path: '/support' },
    { label: 'Game Chart', path: '/support' },
    { label: 'Game Rate', path: '/support' },
    { label: 'Time Table', path: '/support' },
    { label: 'Notice board / Rules', path: '/support' },
    { label: 'Help Desk', path: '/support' },
    { label: 'Settings', path: '/profile' },
    { label: 'How to play', path: '/support' },
    { label: 'Share App', path: '/support' },
    { label: 'Logout', path: '/login' }
  ];

  const loadStoredBalance = () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const b = user?.balance ?? user?.walletBalance ?? user?.wallet ?? 0;
      setBalance(Number(b));
    } catch (_) {
      setBalance(0);
    }
  };

  useEffect(() => {
    // Check if user is logged in
    const checkUser = () => {
      const userData = localStorage.getItem('user');
      if (userData) {
        try {
          setUser(JSON.parse(userData));
        } catch (e) {
          setUser(null);
        }
      } else {
        setUser(null);
      }
      loadStoredBalance();
    };

    checkUser();

    // Fetch balance from server
    const fetchAndUpdateBalance = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('user') || 'null');
        const userId = user?.id || user?._id;
        if (!userId) return;
        const res = await getBalance();
        if (res.success && res.data?.balance != null) {
          updateUserBalance(res.data.balance);
          setBalance(res.data.balance);
        }
      } catch (_) {}
    };

    fetchAndUpdateBalance();

    // Listen for storage changes (when user logs in/out in another tab)
    window.addEventListener('storage', checkUser);
    
    // Listen for custom login event
    window.addEventListener('userLogin', checkUser);
    window.addEventListener('userLogout', checkUser);

    return () => {
      window.removeEventListener('storage', checkUser);
      window.removeEventListener('userLogin', checkUser);
      window.removeEventListener('userLogout', checkUser);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    window.dispatchEvent(new Event('userLogout'));
    navigate('/login');
  };

  const displayName = user?.username || 'Sign In';
  const displayPhone =
    user?.phone ||
    user?.mobile ||
    user?.mobileNumber ||
    user?.phoneNumber ||
    user?.phone_number ||
    user?.mobilenumber ||
    user?.email ||
    '-';
  const sinceDateRaw = user?.createdAt || user?.created_at || user?.createdOn;
  const sinceDate = sinceDateRaw ? new Date(sinceDateRaw) : null;
  const sinceText = sinceDate && !Number.isNaN(sinceDate.getTime())
    ? `Since ${sinceDate.toLocaleDateString('en-GB')}`
    : 'Since -';
  const avatarInitial = displayName ? displayName.charAt(0).toUpperCase() : 'U';

  const handleProfileClick = () => {
    navigate(user ? '/profile' : '/login');
  };

  const displayBalance = balance != null ? Number(balance) : 0;
  const formattedBalance = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0, minimumFractionDigits: 0 }).format(displayBalance);

  return (
    <>
      <div
        className="fixed top-0 left-0 right-0 z-50 w-full bg-gradient-to-b from-black to-[#0a0a0a] border-b border-white/5 shadow-lg pl-[max(0.75rem,env(safe-area-inset-left))] pr-[max(0.75rem,env(safe-area-inset-right))] sm:pl-[max(1.25rem,env(safe-area-inset-left))] sm:pr-[max(1.25rem,env(safe-area-inset-right))] md:pl-[max(1.5rem,env(safe-area-inset-left))] md:pr-[max(1.5rem,env(safe-area-inset-right))] py-2.5 sm:py-2 md:py-2.5 pt-[calc(0.625rem+env(safe-area-inset-top,0px))] sm:pt-[calc(0.5rem+env(safe-area-inset-top,0px))] md:pt-[calc(0.625rem+env(safe-area-inset-top,0px))]"
      >
        <div className="flex items-center justify-between gap-2 sm:gap-2 md:gap-3">
          {/* Hamburger Menu and Logo together on the left */}
          <div className="flex items-center gap-2.5 sm:gap-3 md:gap-4">
            <button
              type="button"
              onClick={() => setIsMenuOpen(true)}
              className="w-10 h-10 sm:w-9 sm:h-9 md:w-10 md:h-10 shrink-0 rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700/50 flex items-center justify-center cursor-pointer active:scale-95 hover:bg-gray-700/50 transition-all duration-200 shadow-md"
              aria-label="Open menu"
            >
            <div className="flex flex-col gap-1.5 sm:gap-1.5">
              <div className="w-5 sm:w-5 md:w-5 h-[2.5px] bg-white rounded-full"></div>
              <div className="w-4 sm:w-4 md:w-4 h-[2.5px] bg-white rounded-full"></div>
              <div className="w-3.5 sm:w-3 md:w-3 h-[2.5px] bg-white rounded-full"></div>
            </div>
            </button>

            {/* Logo - aligned next to hamburger */}
            <Link
              to="/"
              className="flex items-center cursor-pointer active:scale-95 transition-transform duration-200"
            >
              <span className="text-[#d4af37] font-black text-lg sm:text-xl md:text-2xl tracking-wider drop-shadow-md">MATKA</span>
            </Link>
          </div>

        {/* Right side buttons - Download App, Wallet, Profile */}
        <div className="flex items-center gap-2 sm:gap-2.5 md:gap-3">
          {/* Download App - icon only on mobile, text on larger screens */}
          <button
            onClick={() => navigate('/download')}
            className="shrink-0 rounded-xl md:rounded-xl bg-gradient-to-r from-[#f3b61b] to-[#e5a914] px-3 sm:px-3 md:px-4 lg:px-5 py-2 sm:py-2 md:py-2.5 text-xs sm:text-sm md:text-base font-bold text-black shadow-[0_4px_12px_rgba(243,182,27,0.4)] active:scale-95 hover:from-[#e5a914] hover:to-[#d49a13] transition-all duration-200 flex items-center gap-1.5 sm:gap-1.5 md:gap-2 min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 justify-center"
          >
            <svg className="w-5 h-5 sm:w-4 sm:h-4 md:w-5 md:h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span className="hidden sm:inline">Download</span>
            <span className="hidden md:inline"> App</span>
          </button>

          {/* Wallet - desktop only, responsive size */}
          <button
            onClick={() => navigate('/funds?tab=add-fund')}
            className="hidden md:flex shrink-0 items-center gap-1.5 md:gap-2 lg:gap-2.5 rounded-lg bg-[#202124] border border-white/5 px-2.5 md:px-3 lg:px-4 py-1.5 md:py-2 hover:bg-[#2a2b2e] transition-colors"
          >
            <svg className="w-7 h-7 md:w-8 md:h-8 lg:w-9 lg:h-9 text-[#d4af37]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 013 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 013 6v3" />
            </svg>
            <span className="text-sm md:text-base lg:text-lg font-bold text-white">{formattedBalance}</span>
          </button>

          {/* Profile Icon - improved mobile touch target */}
          <button
            type="button"
            onClick={handleProfileClick}
            className={`w-10 h-10 sm:w-9 sm:h-9 md:w-10 md:h-10 shrink-0 rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 border flex items-center justify-center cursor-pointer active:scale-95 transition-all duration-200 shadow-md ${
              user ? 'border-yellow-500/60 hover:bg-yellow-500/20 hover:border-yellow-500/80' : 'border-gray-700/50 hover:bg-gray-700/50'
            }`}
            title={user ? `${user.username} - View Profile` : 'Sign In / Sign Up'}
            aria-label="Profile"
          >
            <svg
              className={`w-5 h-5 sm:w-5 sm:h-5 md:w-5 md:h-5 ${user ? 'text-yellow-400' : 'text-white'}`}
              fill={user ? 'currentColor' : 'none'}
              stroke={user ? 'none' : 'currentColor'}
              strokeWidth={user ? 0 : 1.5}
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
        </div>
      </div>
      {isMenuOpen && (
        <div className="fixed inset-0 z-[60]">
          <button
            type="button"
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsMenuOpen(false)}
            aria-label="Close menu overlay"
          />
          <aside className="relative h-full w-[86%] max-w-[360px] sm:w-[70%] sm:max-w-[380px] md:w-[420px] md:max-w-none bg-gradient-to-b from-[#0a0a0a] via-black to-[#0a0a0a] shadow-[6px_0_24px_rgba(0,0,0,0.8)] border-r border-white/5">
            {/* User Profile Section */}
            <div className="px-5 sm:px-6 pt-6 pb-5 border-b border-white/10 bg-gradient-to-b from-[#1a1a1a]/50 to-transparent">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  {/* Avatar */}
                  <div className="relative shrink-0">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-[#1e1e1e] to-[#2a2a2a] border-2 border-yellow-500/30 flex items-center justify-center text-white text-xl sm:text-2xl font-bold shadow-[0_4px_12px_rgba(212,175,55,0.3)]">
                      {avatarInitial}
                    </div>
                    {user && (
                      <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 rounded-full border-2 border-black"></div>
                    )}
                  </div>
                  
                  {/* User Info */}
                  <div className="flex-1 min-w-0">
                    <div className="text-base sm:text-lg font-bold text-white truncate">{displayName}</div>
                    <div className="text-xs sm:text-sm text-gray-400 mt-0.5 truncate">{displayPhone}</div>
                    <div className="text-xs sm:text-sm text-gray-500 mt-0.5">{sinceText}</div>
                  </div>
                </div>
                
                {/* Close Button */}
                <button
                  type="button"
                  onClick={() => setIsMenuOpen(false)}
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#1a1a1a] border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-[#222] hover:border-white/20 active:scale-95 transition-all duration-200 shrink-0"
                  aria-label="Close menu"
                >
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Menu Items */}
            <div className="px-4 sm:px-5 py-4 space-y-2.5 overflow-y-auto h-[calc(100%-140px)] scrollbar-hidden">
              {menuItems.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => {
                    setIsMenuOpen(false);
                    if (item.label === 'Logout') {
                      handleLogout();
                    } else {
                      navigate(item.path);
                    }
                  }}
                  className="group w-full bg-gradient-to-r from-[#1a1a1a] to-[#1e1e1e] rounded-xl sm:rounded-2xl px-4 py-3.5 sm:py-4 flex items-center gap-4 border border-white/5 hover:border-yellow-500/30 hover:from-[#222] hover:to-[#252525] hover:shadow-[0_4px_16px_rgba(212,175,55,0.15)] active:scale-[0.98] transition-all duration-200"
                >
                  {/* Icon Container */}
                  <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-[#2a2a2a] to-[#1e1e1e] border border-white/10 flex items-center justify-center shrink-0 group-hover:border-yellow-500/30 group-hover:shadow-[0_4px_12px_rgba(212,175,55,0.2)] transition-all duration-200">
                    <MenuIcon label={item.label} />
                  </div>
                  
                  {/* Menu Text */}
                  <span className="text-sm sm:text-base font-semibold text-white group-hover:text-yellow-400 transition-colors duration-200 flex-1 text-left">
                    {item.label}
                  </span>
                  
                  {/* Arrow Indicator */}
                  <svg className="w-5 h-5 text-white/20 group-hover:text-yellow-500/60 group-hover:translate-x-1 transition-all duration-200 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              ))}
              
              {/* Version Footer */}
              <div className="text-center text-xs text-gray-600 pt-4 pb-2">Version: 1.0.0</div>
            </div>
          </aside>
        </div>
      )}
    </>
  );
};

export default AppHeader;
