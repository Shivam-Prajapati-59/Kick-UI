import React from 'react';

export default function Filecoin({ className }: { className?: string }) {
    return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={`w-12 h-12 ${className || ''}`}>
            <image href="/svgs/filecoin.svg" width="24" height="24" />
        </svg>
    );
}
