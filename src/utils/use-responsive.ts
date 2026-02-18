import { useState, useEffect } from 'react';
import { SLOT_SIZE_PX } from '@/config/constants';

const BREAKPOINTS = {
    sm: 640,
    md: 768,
    lg: 1024,
} as const;

/**
 * Computes a responsive slot size based on viewport width.
 * Desktop: 72px (default). Tablet: 56px. Mobile: 48px.
 */
export function useResponsiveSlotSize(): number {
    const [slotSize, setSlotSize] = useState(SLOT_SIZE_PX);

    useEffect(() => {
        function compute() {
            const w = window.innerWidth;
            if (w < BREAKPOINTS.sm) return 48;
            if (w < BREAKPOINTS.md) return 56;
            if (w < BREAKPOINTS.lg) return 64;
            return SLOT_SIZE_PX; // 72
        }
        setSlotSize(compute());

        function onResize() {
            setSlotSize(compute());
        }
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);

    return slotSize;
}

/** True when width < 768px. */
export function useIsMobile(): boolean {
    const [mobile, setMobile] = useState(false);
    useEffect(() => {
        function check() {
            setMobile(window.innerWidth < BREAKPOINTS.md);
        }
        check();
        window.addEventListener('resize', check);
        return () => window.removeEventListener('resize', check);
    }, []);
    return mobile;
}
