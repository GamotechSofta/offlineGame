import React from 'react';

const StatusBadge = ({ status, showIcon = true, size = 'md' }) => {
    const config = {
        open: {
            bg: 'bg-emerald-500/10',
            text: 'text-emerald-400',
            border: 'border-emerald-500/30',
            label: 'OPEN',
            pulse: true,
        },
        running: {
            bg: 'bg-blue-500/10',
            text: 'text-blue-400',
            border: 'border-blue-500/30',
            label: 'RUNNING',
            pulse: false,
        },
        closed: {
            bg: 'bg-red-500/10',
            text: 'text-red-500',
            border: 'border-red-500/30',
            label: 'CLOSED',
            pulse: false,
        },
        pending: {
            bg: 'bg-blue-50',
            text: 'text-blue-600',
            border: 'border-blue-600/30',
            label: 'PENDING',
            pulse: true,
        },
        won: {
            bg: 'bg-green-500/10',
            text: 'text-green-600',
            border: 'border-green-500/30',
            label: 'WON',
            pulse: false,
        },
        lost: {
            bg: 'bg-gray-500/10',
            text: 'text-slate-500',
            border: 'border-gray-500/30',
            label: 'LOST',
            pulse: false,
        },
        approved: {
            bg: 'bg-green-500/10',
            text: 'text-green-600',
            border: 'border-green-500/30',
            label: 'APPROVED',
            pulse: false,
        },
        rejected: {
            bg: 'bg-red-500/10',
            text: 'text-red-500',
            border: 'border-red-500/30',
            label: 'REJECTED',
            pulse: false,
        },
        completed: {
            bg: 'bg-green-500/10',
            text: 'text-green-600',
            border: 'border-green-500/30',
            label: 'COMPLETED',
            pulse: false,
        },
        cancelled: {
            bg: 'bg-gray-500/10',
            text: 'text-slate-500',
            border: 'border-gray-500/30',
            label: 'CANCELLED',
            pulse: false,
        },
    };

    const sizes = {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-3 py-1 text-xs',
        lg: 'px-4 py-1.5 text-sm',
    };

    const { bg, text, border, label, pulse } = config[status] || config.pending;

    return (
        <span className={`inline-flex items-center gap-1.5 rounded-full font-semibold border ${bg} ${text} ${border} ${sizes[size]}`}>
            {showIcon && (
                <span className={`w-1.5 h-1.5 rounded-full ${text.replace('text-', 'bg-')} ${pulse ? 'animate-pulse-soft' : ''}`}></span>
            )}
            {label}
        </span>
    );
};

export default StatusBadge;
