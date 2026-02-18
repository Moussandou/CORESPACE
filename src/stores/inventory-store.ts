import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { GridCell, GridMode, Item, PlacedItem } from '@/types';
import { createEmptyGrid, canPlace, placeItem, removeItem } from '@/domain/grid';
import { canConsume, getConsumptionEffect } from '@/domain/consumption';
import { canFuse } from '@/domain/fusion';
import { useUserStore } from '@/stores/user-store';
import { useActivityStore } from '@/stores/activity-store';
import { play } from '@/infra/audio/sound-engine';

interface InventoryState {
    mode: GridMode;
    grid: GridCell[][];
    placedItems: PlacedItem[];
    availableItems: Item[];

    setMode: (mode: GridMode) => void;
    place: (item: Item, x: number, y: number) => boolean;
    move: (itemId: string, newX: number, newY: number) => boolean;
    remove: (itemId: string) => void;
    consume: (itemId: string) => void;
    fuse: (sourceId: string, targetId: string) => boolean;
    populateDebugItems: (items: PlacedItem[]) => void;
    reset: () => void;
}

export const useInventoryStore = create<InventoryState>()(
    persist(
        (set, get) => ({
            mode: 'day',
            grid: createEmptyGrid('day'),
            placedItems: [],
            availableItems: [],

            setMode: (mode) =>
                set({ mode, grid: createEmptyGrid(mode), placedItems: [] }),

            place: (item, x, y) => {
                const { grid, placedItems } = get();
                const gridCopy = grid.map((row) => row.map((cell) => ({ ...cell })));

                if (!canPlace(gridCopy, item, x, y)) {
                    play('error');
                    return false;
                }

                placeItem(gridCopy, item, x, y);
                set({
                    grid: gridCopy,
                    placedItems: [...placedItems, { item, x, y }],
                });
                play('drop');
                return true;
            },

            move: (itemId, newX, newY) => {
                const { grid, placedItems } = get();
                // 1. Find the item
                const currentPlaced = placedItems.find((p) => p.item.id === itemId);
                if (!currentPlaced) return false;

                // 2. Clone grid for atomic operation
                const gridCopy = grid.map((row) => row.map((cell) => ({ ...cell })));

                // 3. Temporarily remove item from grid copy
                removeItem(gridCopy, itemId);

                // 4. Check if new position is valid
                if (!canPlace(gridCopy, currentPlaced.item, newX, newY)) {
                    // Collision or out of bounds -> Fail
                    return false;
                }

                // 5. Place at new position
                placeItem(gridCopy, currentPlaced.item, newX, newY);

                // 6. Update state
                set({
                    grid: gridCopy,
                    placedItems: placedItems.map((p) =>
                        p.item.id === itemId ? { ...p, x: newX, y: newY } : p
                    ),
                });
                return true;
            },

            fuse: (sourceId, targetId) => {
                const { grid, placedItems } = get();
                const source = placedItems.find(p => p.item.id === sourceId);
                const target = placedItems.find(p => p.item.id === targetId);

                if (!source || !target) return false;

                const recipe = canFuse(source.item, target.item);
                if (!recipe) return false;

                // Calculate output position (prefer target's position)
                // Clone grid for simulation
                const gridCopy = grid.map(row => row.map(cell => ({ ...cell })));

                // Remove inputs
                removeItem(gridCopy, sourceId);
                removeItem(gridCopy, targetId);

                // Try to place output at target position
                if (canPlace(gridCopy, recipe.output, target.x, target.y)) {
                    placeItem(gridCopy, recipe.output, target.x, target.y);

                    // Update state
                    set({
                        grid: gridCopy,
                        placedItems: [
                            ...placedItems.filter(p => p.item.id !== sourceId && p.item.id !== targetId),
                            { item: recipe.output, x: target.x, y: target.y }
                        ]
                    });

                    useUserStore.getState().addXp(15);
                    useActivityStore.getState().trackFusion();
                    useActivityStore.getState().trackXp(15);
                    play('fusion');
                    return true;
                }

                // Fallback: try source position?
                if (canPlace(gridCopy, recipe.output, source.x, source.y)) {
                    placeItem(gridCopy, recipe.output, source.x, source.y);
                    set({
                        grid: gridCopy,
                        placedItems: [
                            ...placedItems.filter(p => p.item.id !== sourceId && p.item.id !== targetId),
                            { item: recipe.output, x: source.x, y: source.y }
                        ]
                    });
                    useUserStore.getState().addXp(15);
                    useActivityStore.getState().trackFusion();
                    useActivityStore.getState().trackXp(15);
                    play('fusion');
                    return true;
                }

                return false; // No space for result
            },

            consume: (itemId) => {
                const { grid, placedItems } = get();
                const placed = placedItems.find((p) => p.item.id === itemId);
                if (!placed) return;

                if (!canConsume(placed.item)) return;

                const effect = getConsumptionEffect(placed.item);
                if (effect) {
                    useUserStore.getState().applyEffect(effect);
                }

                get().remove(itemId);
                useActivityStore.getState().trackConsume();
                play('consume');
            },

            populateDebugItems: (items) => {
                // Clear first
                const { mode } = get();
                let grid = createEmptyGrid(mode);
                const placedItems: PlacedItem[] = [];

                items.forEach((p) => {
                    if (canPlace(grid, p.item, p.x, p.y)) {
                        placeItem(grid, p.item, p.x, p.y);
                        placedItems.push(p);
                    }
                });
                set({ grid, placedItems });
            },

            remove: (itemId) => {
                const { grid, placedItems } = get();
                const gridCopy = grid.map((row) => row.map((cell) => ({ ...cell })));
                removeItem(gridCopy, itemId);
                set({
                    grid: gridCopy,
                    placedItems: placedItems.filter((p) => p.item.id !== itemId),
                });
            },

            reset: () => {
                const { mode } = get();
                set({ grid: createEmptyGrid(mode), placedItems: [] });
            },
        }),
        { name: 'corespace-inventory-storage' }
    )
);
