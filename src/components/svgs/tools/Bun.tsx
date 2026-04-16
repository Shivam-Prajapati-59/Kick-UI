export default function Bun({ className }: { className?: string }) {
    return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={`w-6 h-6 ${className || ''}`}>
            <image href="/svgs/bun.svg" width="24" height="24" />
        </svg>
    );
}