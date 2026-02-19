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
    // --- Existing ---
    {
        inputA: 'res-coffee',
        inputB: 'res-focus',
        output: findItem('buff-deepwork'),
    },
    {
        inputA: 'res-sleep',
        inputB: 'task-sport',
        output: { ...findItem('res-energy'), id: 'res-energy-max', name: 'Energy Max', rarity: 'rare', effect: { energy: 100, description: 'Full energy restore + boost' } },
    },

    // --- New Recettes Phase C ---
    {
        inputA: 'res-coffee',
        inputB: 'res-coffee',
        output: findItem('res-energy'), // Double coffee = Energy
    },
    {
        inputA: 'task-study',
        inputB: 'res-focus',
        output: findItem('buff-flow'), // Study + Focus = Flow state
    },
    {
        inputA: 'task-sport',
        inputB: 'res-energy',
        output: findItem('buff-motivation'), // Sport + Energy = Motivation
    },
    {
        inputA: 'task-code',
        inputB: 'res-focus',
        output: findItem('buff-discipline'), // Code + Focus = Discipline
    },
    {
        inputA: 'task-meeting',
        inputB: 'res-coffee',
        output: findItem('buff-motivation'), // Meeting + Coffee = Motivation (to survive)
    },
    {
        inputA: 'task-study',
        inputB: 'res-coffee',
        output: findItem('buff-deepwork'), // Alternative path for Deep Work
    },
    // Creative/Easter eggs
    {
        inputA: 'task-chores',
        inputB: 'task-sport',
        output: findItem('buff-discipline'), // Discipline from hard work
    },
    {
        inputA: 'res-money',
        inputB: 'res-coffee',
        output: findItem('buff-motivation'), // Money + Coffee = Corporate Motivation?
    }
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
