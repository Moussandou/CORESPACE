import type { GridMode, Rarity } from '@/types';

// ---------------------------------------------------------------------------
// Grid dimensions (CDC §5)
// ---------------------------------------------------------------------------

export const GRID_DIMENSIONS: Record<GridMode, { cols: number; rows: number }> = {
    day: { cols: 8, rows: 6 },
    week: { cols: 12, rows: 10 },
};

export const SLOT_SIZE_PX = 72;

// ---------------------------------------------------------------------------
// XP thresholds (CDC §8)
// ---------------------------------------------------------------------------

export const XP_PER_LEVEL = [
    0, 100, 250, 500, 900, 1500, 2300, 3400, 4800, 6500,
] as const;

export const XP_THRESHOLDS = XP_PER_LEVEL;

export const XP_REWARDS = {
    taskPlaced: 5,
    taskCompleted: 20,
    fusion: 15,
    inventoryOptim: 10,
} as const;

// ---------------------------------------------------------------------------
// Rarity colors (CDC §13 / §17)
// ---------------------------------------------------------------------------

export const RARITY_COLORS: Record<Rarity, string> = {
    common: 'var(--color-surface-light)',
    improved: 'var(--color-accent-green)',
    rare: 'var(--color-accent-amber)',
    unique: 'var(--color-rare-gold)',
};
