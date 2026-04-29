const JsRepoIcon = ({ className }: { className?: string }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        className={`w-6 h-6 ${className || ''}`}
    >
        <rect x="3" y="3" width="18" height="18" rx="3" fill="#0EA5E9" />
        <path
            d="M8.5 15.5c0 .828.448 1.5 1 1.5s1-.672 1-1.5"
            stroke="#fff"
            strokeWidth="1.5"
            strokeLinecap="round"
        />
        <path
            d="M13 11.5c.552 0 1.5.224 1.5 1s-.948 1-1.5 1 1.5.224 1.5 1-.948 1-1.5 1"
            stroke="#fff"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <path
            d="M7 8h10"
            stroke="#fff"
            strokeWidth="1.5"
            strokeLinecap="round"
            opacity="0.5"
        />
    </svg>
);

export default JsRepoIcon;
