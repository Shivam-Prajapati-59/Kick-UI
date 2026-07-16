import React from "react";

export default function Bun({ className }: { className?: string }) {
    return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
            <image href="/assets/svgs/bun.svg" width="24" height="24" />
        </svg>
    );
}
