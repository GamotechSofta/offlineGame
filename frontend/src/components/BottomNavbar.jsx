import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const BottomNavbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const scrollToTop = () => {
    try {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      if (document.documentElement) document.documentElement.scrollTop = 0;
      if (document.body) document.body.scrollTop = 0;
      // Also scroll any scrollable containers (match AppRoutes behavior)
      setTimeout(() => {
        const scrollableElements = document.querySelectorAll(
          '[class*="overflow-y-auto"], [class*="overflow-y-scroll"], [class*="overflow-auto"]'
        );
        scrollableElements.forEach((el) => {
          if (el && typeof el.scrollTop === 'number') el.scrollTop = 0;
        });
      }, 10);
    } catch (_) {}
  };

  const navItems = [
    {
      id: 'my-bids',
      label: 'My Bets',
      path: '/bids',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15a2.25 2.25 0 012.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
        </svg>
      )
    },
    {
      id: 'bank',
      label: 'Bank',
      path: '/bank',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z" />
        </svg>
      )
    },
    {
      id: 'home',
      label: 'Home',
      path: '/',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955a1.126 1.126 0 011.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
        </svg>
      ),
      isCenter: true
    },
    {
      id: 'funds',
      label: 'Funds',
      path: '/funds',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 014.5 15h.75M15.75 9a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
        </svg>
      )
    },
    {
      id: 'support',
      label: 'Support',
      path: '/support',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
        </svg>
      )
    }
  ];

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden pt-1"
      style={{
        paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 8px)',
        paddingLeft: 'max(0.75rem, env(safe-area-inset-left))',
        paddingRight: 'max(0.75rem, env(safe-area-inset-right))',
      }}
    >
      {/* Backplate to prevent white background showing behind navbar */}
      <div className="absolute inset-0 bg-black pointer-events-none" />
      <div className="relative bg-black rounded-3xl border border-gray-700 shadow-[0_4px_20px_rgba(0,0,0,0.4)] flex items-end justify-around px-1 py-2 min-h-[64px]">
        {navItems.map((item) => {
          const active = isActive(item.path);
          const isCenter = item.isCenter;

          if (isCenter) {
            return (
              <button
                key={item.id}
                onClick={() => {
                  if (item.path === '/' && location.pathname === '/') {
                    scrollToTop();
                    return;
                  }
                  navigate(item.path);
                }}
                className="flex flex-col items-center justify-center -mt-6 relative z-10 active:scale-90 transition-transform duration-150 touch-manipulation"
              >
                <div
                  className={`w-14 h-14 rounded-full flex items-center justify-center shadow-[0_4px_12px_rgba(0,0,0,0.35)] transition-all duration-200 ${
                    active
                      ? 'bg-[#f3b61b] ring-2 ring-[#f3b61b]/60 ring-offset-2 ring-offset-black scale-105'
                      : 'bg-gray-800 border border-gray-700'
                  }`}
                >
                  {/* Icon: white when inactive, dark when active (on yellow bg) */}
                  <div
                    className={`transition-[filter] duration-200 ${
                      active ? '[filter:brightness(0)]' : '[filter:brightness(0)_invert(1)]'
                    }`}
                  >
                    {item.icon}
                  </div>
                </div>
                <span
                  className={`text-[10px] sm:text-xs font-bold mt-1 transition-colors duration-200 ${
                    active ? 'text-[#f3b61b]' : 'text-white'
                  }`}
                >
                  {item.label}
                </span>
              </button>
            );
          }

          return (
            <button
              key={item.id}
              onClick={() => {
                if (item.path === '/' && location.pathname === '/') {
                  scrollToTop();
                  return;
                }
                navigate(item.path);
              }}
              className="relative flex flex-col items-center justify-center gap-0.5 px-2 py-2 rounded-xl min-w-[56px] active:scale-95 transition-all duration-150 touch-manipulation"
            >
              {/* Icon: white when inactive, golden when active - same as text */}
              <div
                className={`transition-all duration-200 ${
                  active ? 'scale-110 [filter:brightness(0)_invert(0.88)_sepia(0.25)_saturate(8)_hue-rotate(5deg)]' : 'scale-100 [filter:brightness(0)_invert(1)]'
                }`}
              >
                {item.icon}
              </div>
              {/* Active indicator dot below icon */}
              <div className="h-1.5 w-full flex items-center justify-center">
                {active && (
                  <div className="w-1.5 h-1.5 rounded-full bg-[#f3b61b] shadow-[0_0_8px_rgba(0,0,0,0.4)] mx-auto" />
                )}
              </div>
              <span
                className={`text-[10px] sm:text-xs font-bold transition-colors duration-200 ${
                  active ? 'text-[#f3b61b]' : 'text-white'
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNavbar;
