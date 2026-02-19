import type { GridCell, Item, PlacedItem } from '@/types';
import { getOccupiedCells } from './grid';

/**
 * Checks if two items are adjacent on the grid.
 * Adjacency includes diagonals? Let's say yes for max fun.
 */
export function areAdjacent(itemA: PlacedItem, itemB: PlacedItem): boolean {
    // Get all cells for A and B
    const cellsA = getOccupiedCells(itemA.item, itemA.x, itemA.y);
    const cellsB = getOccupiedCells(itemB.item, itemB.x, itemB.y);

    // Naive check: if any cell of A is within distance 1 of any cell of B
    return cellsA.some(cA =>
        cellsB.some(cB =>
            Math.abs(cA.col - cB.col) <= 1 && Math.abs(cA.row - cB.row) <= 1
        )
    );
}

/**
 * Computes the XP multiplier for a specific placed task based on surrounding buffs.
 * Buffs provide +0.5x multiplier each (so 1 buff = 1.5x total).
 */
export function computeAuraMultiplier(
    target: PlacedItem,
    allPlacedItems: PlacedItem[]
): number {
    if (target.item.type !== 'task') return 1;

    let multiplier = 1;

    // Find all buffs
    const buffs = allPlacedItems.filter(p => p.item.type === 'buff');

    for (const buff of buffs) {
        if (areAdjacent(target, buff)) {
            // Apply bonus based on rarity?
            // Rare = +0.5, Improved = +0.25, Common = +0.1
            const bonus = buff.item.rarity === 'rare' ? 0.5 :
                buff.item.rarity === 'improved' ? 0.25 : 0.1;
            multiplier += bonus;
        }
    }

    return multiplier;
}
