import type { GridCell, Item, PlacedItem } from '@/types';
import { GRID_DIMENSIONS } from '@/config/constants';
import type { GridMode } from '@/types';

/** Create an empty grid of the given mode. */
export function createEmptyGrid(mode: GridMode): GridCell[][] {
    const { cols, rows } = GRID_DIMENSIONS[mode];
    return Array.from({ length: rows }, () =>
        Array.from({ length: cols }, () => ({ occupied: false, itemId: null })),
    );
}

/** Check whether an item fits at (x, y) without overlap. */
export function canPlace(
    grid: GridCell[][],
    item: Item,
    x: number,
    y: number,
): boolean {
    const rows = grid.length;
    const cols = grid[0].length;

    if (x < 0 || y < 0 || x + item.width > cols || y + item.height > rows) {
        return false;
    }

    for (let dy = 0; dy < item.height; dy++) {
        for (let dx = 0; dx < item.width; dx++) {
            if (grid[y + dy][x + dx].occupied) {
                return false;
            }
        }
    }

    return true;
}

/** Place an item on the grid. Mutates in place for performance; clone before calling. */
export function placeItem(
    grid: GridCell[][],
    item: Item,
    x: number,
    y: number,
): void {
    for (let dy = 0; dy < item.height; dy++) {
        for (let dx = 0; dx < item.width; dx++) {
            grid[y + dy][x + dx] = { occupied: true, itemId: item.id };
        }
    }
}

/** Remove an item from the grid by id. */
export function removeItem(grid: GridCell[][], itemId: string): void {
    for (let row = 0; row < grid.length; row++) {
        for (let col = 0; col < grid[row].length; col++) {
            if (grid[row][col].itemId === itemId) {
                grid[row][col] = { occupied: false, itemId: null };
            }
        }
    }
}

/** Get all cells occupied by an item placed at (x, y). */
export function getOccupiedCells(
    item: Item,
    x: number,
    y: number,
): Array<{ col: number; row: number }> {
    const cells: Array<{ col: number; row: number }> = [];
    for (let dy = 0; dy < item.height; dy++) {
        for (let dx = 0; dx < item.width; dx++) {
            cells.push({ col: x + dx, row: y + dy });
        }
    }
    return cells;
}
