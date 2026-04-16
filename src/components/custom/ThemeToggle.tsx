'use client';

import { Moon, Sun } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { flushSync } from 'react-dom';

export interface ThemeToggleButtonProps {
    showLabel?: boolean;
    className?: string;
}

export const ThemeToggleButton = ({
    showLabel = false,
    className,
}: ThemeToggleButtonProps) => {
    const [mounted, setMounted] = useState(false);
    const { setTheme, resolvedTheme } = useTheme();

    useEffect(() => {
        setMounted(true);
    }, []);

    const toggleTheme = useCallback(() => {
        setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
    }, [resolvedTheme, setTheme]);

    const handleClick = async (event: React.MouseEvent<HTMLButtonElement>) => {
        if (!document.startViewTransition) {
            toggleTheme();
            return;
        }
        const x = event.clientX;
        const y = event.clientY;
        const endRadius = Math.hypot(
            Math.max(x, innerWidth - x),
            Math.max(y, innerHeight - y)
        );

        const transition = document.startViewTransition(async () => {
            flushSync(() => {
                toggleTheme();
            });
        });

        await transition.ready;

        const clipPath = [
            `circle(0px at ${x}px ${y}px)`,
            `circle(${endRadius}px at ${x}px ${y}px)`,
        ];

        document.documentElement.animate(
            {
                clipPath: clipPath,
            },
            {
                duration: 500,
                easing: 'ease-in-out',
                pseudoElement: '::view-transition-new(root)',
            }
        );
    };

    if (!mounted) {
        return (
            <Button variant="outline" size="icon" className={className} disabled>
                <div className="h-[1.2rem] w-[1.2rem] shrink-0" />
            </Button>
        );
    }

    return (
        <Button
            variant="outline"
            size={showLabel ? 'default' : 'icon'}
            onClick={handleClick}
            className={cn(
                'relative group overflow-hidden transition-colors hover:bg-accent',
                showLabel && 'gap-2 px-4',
                className
            )}
            aria-label="Toggle theme"
        >
            <motion.div
                initial={false}
                animate={{ rotate: resolvedTheme === 'dark' ? 0 : 90 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                className="relative h-[1.2rem] w-[1.2rem] flex items-center justify-center"
            >
                <AnimatePresence mode="wait" initial={false}>
                    {resolvedTheme === 'light' ? (
                        <motion.div
                            key="sun"
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            <Sun className="h-full w-full" />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="moon"
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            <Moon className="h-full w-full" />
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            {showLabel && (
                <motion.span
                    layout
                    className="text-sm font-medium"
                >
                    {resolvedTheme === 'light' ? 'Light' : 'Dark'}
                </motion.span>
            )}
        </Button>
    );
};