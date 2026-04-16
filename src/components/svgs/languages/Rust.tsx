import React from 'react'

const Rust = ({ className }: { className?: string }) => {
    return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={`w-6 h-6 ${className || ''}`}>
            <image href="/svgs/rust.svg" width="24" height="24" />
        </svg>
    );
}

export default Rust;