import { SLOT_SIZE_PX } from '@/config/constants';

/** Convert grid coordinates to pixel position. */
export function gridToPixel(col: number, row: number, slotSize: number = SLOT_SIZE_PX): { x: number; y: number } {
    return { x: col * slotSize, y: row * slotSize };
}

/** Convert pixel position to the nearest grid coordinates. */
export function pixelToGrid(x: number, y: number, slotSize: number = SLOT_SIZE_PX): { col: number; row: number } {
    return {
        col: Math.round(x / slotSize),
        row: Math.round(y / slotSize),
    };
}

/** Clamp a value between min and max. */
export function clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
}
