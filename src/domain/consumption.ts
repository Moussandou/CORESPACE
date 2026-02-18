import type { Item, ItemEffect } from '@/types';

/**
 * Validates if an item can be consumed.
 * Resources and Buffs are consumable. Tasks and Parasites are not (directly).
 */
export function canConsume(item: Item): boolean {
    return item.type === 'resource' || item.type === 'buff';
}

/**
 * Calculates the effect of consuming an item.
 * Currently just returns the item's inherent effect.
 * Could include dynamic scaling based on user level/stats in future.
 */
export function getConsumptionEffect(item: Item): ItemEffect | null {
    if (!canConsume(item)) return null;
    return item.effect;
}
