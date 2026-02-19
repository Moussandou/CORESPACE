import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/** Daily quotas by item type. Tasks are unlimited. */
const DAILY_QUOTAS: Record<string, number> = {
    resource: 5,
    buff: 2,
    parasite: Infinity, // Not manually placed
};

interface BudgetState {
    date: string;
    spent: Record<string, number>; // itemId → count spent today

    canSpend: (itemId: string, itemType: string) => boolean;
    spend: (itemId: string, itemType: string) => void;
    getRemaining: (itemType: string) => number;
    getSpentByType: (itemType: string) => number;
    reset: () => void;
}

function todayKey(): string {
    return new Date().toISOString().slice(0, 10);
}

export const useBudgetStore = create<BudgetState>()(
    persist(
        (set, get) => {
            function ensureToday(): void {
                if (get().date !== todayKey()) {
                    set({ date: todayKey(), spent: {} });
                }
            }

            return {
                date: todayKey(),
                spent: {},

                canSpend: (_itemId, itemType) => {
                    ensureToday();
                    const quota = DAILY_QUOTAS[itemType] ?? Infinity;
                    if (quota === Infinity) return true;
                    const { spent } = get();
                    const typeSpent = Object.entries(spent)
                        .filter(([key]) => key.startsWith(`${itemType}:`))
                        .reduce((sum, [, v]) => sum + v, 0);
                    return typeSpent < quota;
                },

                spend: (itemId, itemType) => {
                    ensureToday();
                    const key = `${itemType}:${itemId}`;
                    const { spent } = get();
                    set({ spent: { ...spent, [key]: (spent[key] ?? 0) + 1 } });
                },

                getRemaining: (itemType) => {
                    ensureToday();
                    const quota = DAILY_QUOTAS[itemType] ?? Infinity;
                    if (quota === Infinity) return Infinity;
                    const { spent } = get();
                    const typeSpent = Object.entries(spent)
                        .filter(([key]) => key.startsWith(`${itemType}:`))
                        .reduce((sum, [, v]) => sum + v, 0);
                    return Math.max(0, quota - typeSpent);
                },

                getSpentByType: (itemType) => {
                    ensureToday();
                    const { spent } = get();
                    return Object.entries(spent)
                        .filter(([key]) => key.startsWith(`${itemType}:`))
                        .reduce((sum, [, v]) => sum + v, 0);
                },

                reset: () => {
                    set({ date: todayKey(), spent: {} });
                },
            };
        },
        { name: 'corespace-budget-storage' }
    )
);
