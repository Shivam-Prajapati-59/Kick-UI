export default function NodeJs({ className }: { className?: string }) {
    return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={`w-6 h-6 ${className || ''}`}>
            <image href="/svgs/nodejs.svg" width="24" height="24" />
        </svg>
    );
}