import React from 'react';

export default function TSDW({ className }: { className?: string }) {
    return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={`w-full h-full bg-black dark:bg-transparent rounded-sm pr-1 ${className || ''}`}>
            <image href="/svgs/TSDW.svg" x="0" y="0" width="28" height="28" />
        </svg>
    );
}
