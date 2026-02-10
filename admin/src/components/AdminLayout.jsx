import React from 'react';
import Sidebar from './Sidebar';

const AdminLayout = ({ children, onLogout, title }) => {
    return (
        <div className="min-h-screen bg-slate-50 text-slate-800">
            {/* Sidebar — always visible */}
            <Sidebar onLogout={onLogout} />

            {/* Main content */}
            <main className="ml-56 sm:ml-64 md:ml-72 min-h-screen overflow-x-hidden">
                <div className="p-3 sm:p-4 md:p-6 lg:p-8 lg:pl-10 min-w-0 max-w-full box-border">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
