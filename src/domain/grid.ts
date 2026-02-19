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

/** Place an item on the grid. Mutates in place. */
export function placeItem(
    grid: GridCell[][],
    item: Item,
    x: number,
    y: number,
    instanceId: string,
): void {
    for (let dy = 0; dy < item.height; dy++) {
        for (let dx = 0; dx < item.width; dx++) {
            grid[y + dy][x + dx] = { occupied: true, itemId: instanceId };
        }
    }
}

/** Remove an item from the grid by instanceId. */
export function removeItem(grid: GridCell[][], instanceId: string): void {
    for (let row = 0; row < grid.length; row++) {
        for (let col = 0; col < grid[row].length; col++) {
            if (grid[row][col].itemId === instanceId) {
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

/** 
 * Try to find a valid position for an item on the grid.
 * Scans row by row. Returns coordinates or null if no space.
 */
export function findEmptyPosition(
    grid: GridCell[][],
    item: Item
): { x: number; y: number } | null {
    const rows = grid.length;
    const cols = grid[0].length;

    for (let y = 0; y <= rows - item.height; y++) {
        for (let x = 0; x <= cols - item.width; x++) {
            if (canPlace(grid, item, x, y)) {
                return { x, y };
            }
        }
    }
    return null;
}
