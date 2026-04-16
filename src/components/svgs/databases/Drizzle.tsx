import React from 'react';

export default function Drizzle({ className }: { className?: string }) {
    return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={`w-6 h-6 ${className || ''}`}>
            <image href="/svgs/drizzle.svg" width="24" height="24" />
        </svg>
    );
}
