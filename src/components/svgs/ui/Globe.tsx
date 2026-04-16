import React from 'react'

const Globe = ({ className }: { className?: string }) => {
    return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={`w-6 h-6 ${className || ''}`}>
            <image href="/svgs/globe.svg" width="24" height="24" />
        </svg>
    );
}

export default Globe;