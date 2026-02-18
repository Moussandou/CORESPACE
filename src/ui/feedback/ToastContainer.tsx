'use client';

import { useToastStore } from '@/stores/toast-store';
import { motion, AnimatePresence } from 'framer-motion';

const TYPE_STYLES = {
    levelup: {
        bg: 'rgba(59,130,246,0.15)',
        border: 'rgba(59,130,246,0.3)',
        glow: '0 0 20px rgba(59,130,246,0.2)',
        icon: '▲',
    },
    info: {
        bg: 'rgba(255,255,255,0.05)',
        border: 'rgba(255,255,255,0.1)',
        glow: 'none',
        icon: '●',
    },
    error: {
        bg: 'rgba(239,68,68,0.1)',
        border: 'rgba(239,68,68,0.2)',
        glow: 'none',
        icon: '✕',
    },
} as const;

export function ToastContainer() {
    const toasts = useToastStore((s) => s.toasts);
    const dismiss = useToastStore((s) => s.dismiss);

    return (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 items-center pointer-events-none">
            <AnimatePresence>
                {toasts.map((toast) => {
                    const style = TYPE_STYLES[toast.type];
                    return (
                        <motion.div
                            key={toast.id}
                            initial={{ opacity: 0, y: 30, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                            className="pointer-events-auto cursor-pointer px-5 py-3 rounded-lg backdrop-blur-md font-mono text-sm text-white flex items-center gap-3"
                            style={{
                                background: style.bg,
                                border: `1px solid ${style.border}`,
                                boxShadow: style.glow,
                            }}
                            onClick={() => dismiss(toast.id)}
                        >
                            <span className="text-base opacity-60">{style.icon}</span>
                            <span>{toast.message}</span>
                        </motion.div>
                    );
                })}
            </AnimatePresence>
        </div>
    );
}
