import type { Item, FusionRecipe } from '@/types';
import { findRecipe } from '@/data/fusion-recipes';

/**
 * Checks if two items can be fused together.
 * Returns the recipe if valid, null otherwise.
 */
export function canFuse(itemA: Item, itemB: Item): FusionRecipe | null {
    // Prevent self-fusion if IDs are same (though store handles this check)
    if (itemA.id === itemB.id) return null;

    return findRecipe(itemA.id, itemB.id);
}
