import type { FusionRecipe } from '@/types';
import { ITEMS_CATALOG } from './items-catalog';

function findItem(id: string) {
    const item = ITEMS_CATALOG.find((i) => i.id === id);
    if (!item) throw new Error(`Unknown item ID in fusion recipe: ${id}`);
    return item;
}

/**
 * Fusion recipes (CDC §6).
 * Key = sorted pair of item IDs joined with '+'.
 */
export const FUSION_RECIPES: FusionRecipe[] = [
    {
        inputA: 'res-coffee',
        inputB: 'res-focus',
        output: findItem('buff-deepwork'),
    },
    {
        inputA: 'res-sleep',
        inputB: 'task-sport',
        output: { ...findItem('res-energy'), id: 'res-energy-max', name: 'Energy Max', rarity: 'rare' },
    },
];

/** Lookup key for a pair of items. */
export function fusionKey(idA: string, idB: string): string {
    return [idA, idB].sort().join('+');
}

const RECIPE_MAP = new Map(
    FUSION_RECIPES.map((r) => [fusionKey(r.inputA, r.inputB), r]),
);

/** Try to find a fusion recipe for two items. */
export function findRecipe(idA: string, idB: string): FusionRecipe | null {
    return RECIPE_MAP.get(fusionKey(idA, idB)) ?? null;
}
