/** Rarity levels for items — drives visual treatment (CDC §17). */
export type Rarity = 'common' | 'improved' | 'rare' | 'unique';

/** Item categories (CDC §5). */
export type ItemType = 'task' | 'resource' | 'buff' | 'parasite';

/** Effects applied when an item is consumed or a buff is active. */
export interface ItemEffect {
    energy?: number;
    focus?: number;
    xp?: number;
    description: string;
}

/** Core item definition (CDC §11). */
export interface Item {
    id: string;
    name: string;
    type: ItemType;
    width: number;
    height: number;
    rarity: Rarity;
    effect: ItemEffect;
    stackable: boolean;
    craftable: boolean;
    icon?: string;
}

/** An item placed on the grid at a specific position. */
export interface PlacedItem {
    item: Item;
    x: number;
    y: number;
}

/** A single cell in the inventory grid. */
export interface GridCell {
    occupied: boolean;
    itemId: string | null;
}

/** Grid mode determines dimensions (CDC §5). */
export type GridMode = 'day' | 'week';

/** Fusion recipe definition (CDC §6). */
export interface FusionRecipe {
    inputA: string;
    inputB: string;
    output: Item;
}

/** User centralized state (CDC §8 & §17). */
export interface UserStats {
    xp: number;
    level: number;
    streak: number;
    energy: number; // 0-100
    focus: number;  // 0-100
}
