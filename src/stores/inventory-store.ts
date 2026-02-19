import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { GridCell, GridMode, Item, PlacedItem } from '@/types';
import { createEmptyGrid, canPlace, placeItem, removeItem } from '@/domain/grid';
import { canConsume, getConsumptionEffect } from '@/domain/consumption';
import { findRecipe } from '@/data/fusion-recipes';
import { useUserStore } from '@/stores/user-store';
import { useActivityStore } from '@/stores/activity-store';
import { useToastStore } from '@/stores/toast-store';
import { useBudgetStore } from '@/stores/budget-store';
import { play } from '@/infra/audio/sound-engine';

interface InventoryState {
    mode: GridMode;
    grid: GridCell[][];
    placedItems: PlacedItem[];
    availableItems: Item[];

    setMode: (mode: GridMode) => void;
    place: (item: Item, x: number, y: number) => boolean;
    move: (instanceId: string, newX: number, newY: number) => boolean;
    remove: (instanceId: string) => void;
    consume: (instanceId: string) => void;
    fuse: (sourceId: string, targetId: string) => boolean;
    populateDebugItems: (items: PlacedItem[]) => void;
    forcePlaceItem: (item: Item, x: number, y: number) => boolean;
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

                // Energy gate
                if (item.energyCost && item.energyCost > 0) {
                    const { stats } = useUserStore.getState();
                    if (stats.energy < item.energyCost) {
                        useToastStore.getState().push({
                            message: `Pas assez d'énergie (${item.energyCost} requis)`,
                            type: 'error',
                        });
                        play('error');
                        return false;
                    }
                }

                // Budget gate
                if (!useBudgetStore.getState().canSpend(item.id, item.type)) {
                    useToastStore.getState().push({
                        message: `Limite quotidienne atteinte pour ${item.name}`,
                        type: 'error',
                    });
                    play('error');
                    return false;
                }

                const gridCopy = grid.map((row) => row.map((cell) => ({ ...cell })));

                if (!canPlace(gridCopy, item, x, y)) {
                    play('error');
                    return false;
                }

                // Generate ID
                const instanceId = crypto.randomUUID ? crypto.randomUUID() : `${item.id}-${Date.now()}-${Math.random()}`;

                placeItem(gridCopy, item, x, y, instanceId);

                if (item.energyCost && item.energyCost > 0) {
                    useUserStore.getState().modifyEnergy(-item.energyCost);
                }
                useBudgetStore.getState().spend(item.id, item.type);

                set({
                    grid: gridCopy,
                    placedItems: [...placedItems, { id: instanceId, item, x, y }],
                });
                play('drop');
                return true;
            },

            move: (instanceId, newX, newY) => {
                const { grid, placedItems } = get();
                const itemIndex = placedItems.findIndex((p) => p.id === instanceId);
                if (itemIndex === -1) {
                    console.warn(`[InventoryStore] Move failed: Item ${instanceId} not found.`);
                    return false; // Keep original return type
                }

                const { item, x, y } = placedItems[itemIndex];

                const gridCopy = grid.map((row) => row.map((cell) => ({ ...cell })));
                // Temporarily remove to check placement
                removeItem(gridCopy, instanceId);

                if (canPlace(gridCopy, item, newX, newY)) {
                    placeItem(gridCopy, item, newX, newY, instanceId);

                    const newPlacedItems = [...placedItems];
                    newPlacedItems[itemIndex] = { ...newPlacedItems[itemIndex], x: newX, y: newY };

                    set({
                        grid: gridCopy,
                        placedItems: newPlacedItems,
                    });
                    play('drop');
                    return true; // Keep original return type
                } else {
                    console.warn(`[InventoryStore] Move failed: Cannot place at ${newX},${newY}. Reverting.`);
                    // Revert: place back at old position
                    placeItem(gridCopy, item, x, y, instanceId);
                    play('error');
                    // Grid state didn't change effectively, but we touched it so maybe set it back?
                    // Actually gridCopy was modified by removeItem, so we MUST set it back or discard copy.
                    // Implementation of removeItem modifies in place.
                    // So we must put it back.
                    set({ grid: gridCopy }); // Ensure grid state is reverted if move fails
                    return false; // Keep original return type
                }
            },

            remove: (instanceId) => {
                const { grid, placedItems } = get();
                const gridCopy = grid.map((row) => row.map((cell) => ({ ...cell })));
                removeItem(gridCopy, instanceId);
                set({
                    grid: gridCopy,
                    placedItems: placedItems.filter((p) => p.id !== instanceId),
                });
            },

            consume: (instanceId) => {
                const { grid, placedItems } = get();
                const itemIndex = placedItems.findIndex((p) => p.id === instanceId);
                if (itemIndex === -1) return;

                const placedItem = placedItems[itemIndex];
                const { item, x, y } = placedItem;

                if (!canConsume(item)) return;

                const effect = getConsumptionEffect(item);
                if (effect) {
                    useUserStore.getState().applyEffect(effect);
                }

                const gridCopy = grid.map((row) => row.map((cell) => ({ ...cell })));
                removeItem(gridCopy, instanceId);

                const newPlacedItems = placedItems.filter((_, i) => i !== itemIndex);

                set({
                    grid: gridCopy,
                    placedItems: newPlacedItems,
                });
                play('consume');
                useActivityStore.getState().trackConsume();
            },

            fuse: (sourceId, targetId) => {
                const { grid, placedItems } = get();
                const sourceIndex = placedItems.findIndex((p) => p.id === sourceId);
                const targetIndex = placedItems.findIndex((p) => p.id === targetId);

                if (sourceIndex === -1 || targetIndex === -1) return false;

                const source = placedItems[sourceIndex];
                const target = placedItems[targetIndex];

                // Check recipe using CATALOG IDs
                const recipe = findRecipe(source.item.id, target.item.id);
                if (!recipe) return false;

                const gridCopy = grid.map((row) => row.map((cell) => ({ ...cell })));

                removeItem(gridCopy, sourceId);
                removeItem(gridCopy, targetId);

                // Place output
                const outputItem = recipe.output;
                let finalX = target.x;
                let finalY = target.y;

                if (!canPlace(gridCopy, outputItem, finalX, finalY)) {
                    finalX = source.x;
                    finalY = source.y;
                    if (!canPlace(gridCopy, outputItem, finalX, finalY)) {
                        return false;
                    }
                }

                const newInstanceId = crypto.randomUUID ? crypto.randomUUID() : `${outputItem.id}-${Date.now()}`;
                placeItem(gridCopy, outputItem, finalX, finalY, newInstanceId);

                const newPlacedItems = placedItems.filter((p) => p.id !== sourceId && p.id !== targetId);
                newPlacedItems.push({ id: newInstanceId, item: outputItem, x: finalX, y: finalY });

                set({
                    grid: gridCopy,
                    placedItems: newPlacedItems,
                });
                play('fusion');
                return true;
            },

            populateDebugItems: (items) => {
                const { mode } = get();
                const grid = createEmptyGrid(mode);
                const placedItems: PlacedItem[] = [];

                items.forEach((p) => {
                    const instanceId = p.id || `${p.item.id}-${Date.now()}-${Math.random()}`;
                    if (canPlace(grid, p.item, p.x, p.y)) {
                        placeItem(grid, p.item, p.x, p.y, instanceId);
                        placedItems.push({ ...p, id: instanceId });
                    }
                });
                set({ grid, placedItems });
            },

            forcePlaceItem: (item, x, y) => {
                const { grid, placedItems } = get();
                const gridCopy = grid.map(row => row.map(cell => ({ ...cell })));

                if (!canPlace(gridCopy, item, x, y)) return false;

                const instanceId = crypto.randomUUID ? crypto.randomUUID() : `${item.id}-${Date.now()}-${Math.random()}`;
                placeItem(gridCopy, item, x, y, instanceId);

                set({
                    grid: gridCopy,
                    placedItems: [...placedItems, { id: instanceId, item, x, y }]
                });
                return true;
            },

            reset: () => {
                const { mode } = get();
                set({ grid: createEmptyGrid(mode), placedItems: [] });
            },
        }),
        {
            name: 'corespace-inventory-storage',
            onRehydrateStorage: () => (state) => {
                if (state) {
                    // MIGRATION: Ensure all items have instance IDs and rebuild grid logic
                    // 1. Create fresh grid
                    const newGrid = createEmptyGrid(state.mode);

                    // 2. Process items: ensure ID and place on new grid
                    const validItems: PlacedItem[] = [];

                    state.placedItems.forEach(p => {
                        // Generate ID if missing (legacy data)
                        const id = p.id || (crypto.randomUUID ? crypto.randomUUID() : `${p.item.id}-${Math.random()}`);

                        // Validate placement on new grid (avoids overlaps from corrupted state)
                        if (canPlace(newGrid, p.item, p.x, p.y)) {
                            placeItem(newGrid, p.item, p.x, p.y, id);
                            validItems.push({ ...p, id });
                        }
                    });

                    // 3. Update state
                    state.grid = newGrid;
                    state.placedItems = validItems;
                }
            }
        }
    )
);
