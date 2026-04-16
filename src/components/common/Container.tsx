import React from 'react';

export default function Container({
    children,
    className,
    ...props
}: {
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <div
            className={`container mx-auto px-3 animate-fade-in-blur ${className}`}
            {...props}
        >
            {children}
        </div>
    );
}