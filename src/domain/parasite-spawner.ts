import type { GridCell, Item } from '@/types';
import { findEmptyPosition, placeItem } from './grid';
import { ITEMS_CATALOG } from '@/data/items-catalog';

/**
 * Parasite spawning logic (CDC §7).
 * - Fatigue (common): Spawns late at night (>= 22h).
 * - Distraction (common): Spawns randomly throughout the day.
 * - Stress (improved): Spawns if grid is too full? (Not implemented yet).
 */
export interface SpawnResult {
    parasite: Item;
    x: number;
    y: number;
    reason: string;
}

/**
 * Checks if a parasite should spawn based on current conditions.
 * @param currentHour 0-23
 * @param currentParasiteCount Number of parasites already on grid
 * @returns SpawnResult or null
 */
export function checkParasiteSpawn(
    currentHour: number,
    currentParasiteCount: number
): { parasiteId: string; reason: string } | null {
    // Cap parasites to avoid unplayable state
    if (currentParasiteCount >= 3) return null;

    const rand = Math.random();

    // 1. FATIGUE: High chance after 22h
    if (currentHour >= 22) {
        if (rand < 0.4) return { parasiteId: 'para-fatigue', reason: 'La fatigue s\'installe...' };
    }

    // 2. DISTRACTION: Random chance (5%) every tick
    if (rand < 0.05) {
        return { parasiteId: 'para-distraction', reason: 'Une distraction apparaît !' };
    }

    // 3. PROCRASTINATION: If it's work hours (10-18) and random low chance
    if (currentHour >= 10 && currentHour <= 18) {
        if (rand < 0.02) return { parasiteId: 'para-procrastination', reason: 'Envie de tout remettre à demain...' };
    }

    return null;
}

/**
 * Attempts to spawn a specific parasite on the grid.
 * Mutates grid in place for preview/check, clone before using in store.
 */
export function spawnParasite(
    grid: GridCell[][],
    parasiteId: string
): { x: number; y: number } | null {
    const parasite = ITEMS_CATALOG.find(i => i.id === parasiteId);
    if (!parasite) return null;

    const pos = findEmptyPosition(grid, parasite);
    if (pos) {
        placeItem(grid, parasite, pos.x, pos.y);
        return pos;
    }
    return null;
}
