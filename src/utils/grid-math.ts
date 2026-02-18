import { SLOT_SIZE_PX } from '@/config/constants';

/** Convert grid coordinates to pixel position. */
export function gridToPixel(col: number, row: number): { x: number; y: number } {
    return { x: col * SLOT_SIZE_PX, y: row * SLOT_SIZE_PX };
}

/** Convert pixel position to the nearest grid coordinates. */
export function pixelToGrid(x: number, y: number): { col: number; row: number } {
    return {
        col: Math.round(x / SLOT_SIZE_PX),
        row: Math.round(y / SLOT_SIZE_PX),
    };
}

/** Clamp a value between min and max. */
export function clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
}
