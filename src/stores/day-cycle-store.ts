import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useInventoryStore } from '@/stores/inventory-store';
import { useUserStore } from '@/stores/user-store';
import { useBudgetStore } from '@/stores/budget-store';
import { useToastStore } from '@/stores/toast-store';
import { checkParasiteSpawn, spawnParasite } from '@/domain/parasite-spawner';
import { computeAuraMultiplier } from '@/domain/aura';
import { ITEMS_CATALOG } from '@/data/items-catalog';
import { play } from '@/infra/audio/sound-engine';

export type DayPhase = 'planning' | 'active' | 'resolved';

interface DayCycleState {
    phase: DayPhase;
    time: number; // 0 to 24 (float)
    dayCount: number;

    dailyResult: {
        xpGained: number;
        tasksCompleted: number;
        parasitePenalty: number;
    } | null;

    startPlanning: () => void;
    startDay: () => void;
    tick: (deltaHours: number) => void;
    endDay: () => void;
    reset: () => void;
}

export const useDayCycleStore = create<DayCycleState>()(
    persist(
        (set, get) => ({
            phase: 'planning',
            time: 8, // Start at 8:00
            dayCount: 1,
            dailyResult: null,

            startPlanning: () => {
                // Reset for new day
                // Logic handled by budget store internal check for date
                set({ phase: 'planning', time: 8, dailyResult: null });
            },

            startDay: () => {
                if (get().phase !== 'planning') return;
                set({ phase: 'active' });
                play('open-inventory');
            },

            tick: (deltaHours) => {
                const { phase, time } = get();
                if (phase !== 'active') return;

                const newTime = time + deltaHours;

                // End of day check (24h hard limit)
                if (newTime >= 24) {
                    get().endDay();
                    return;
                }

                set({ time: newTime });

                // Parasite Spawning
                const { grid, placedItems, forcePlaceItem } = useInventoryStore.getState();
                const currentParasites = placedItems.filter(p => p.item.type === 'parasite').length;

                const spawnCheck = checkParasiteSpawn(newTime, currentParasites);
                if (spawnCheck) {
                    const parasiteItem = ITEMS_CATALOG.find(i => i.id === spawnCheck.parasiteId);

                    if (parasiteItem) {
                        // Create a temporary grid for the spawner to calculate position
                        const gridCopy = grid.map(row => row.map(cell => ({ ...cell })));

                        // Use domain logic to find position
                        const spawnedPos = spawnParasite(gridCopy, parasiteItem.id);

                        if (spawnedPos) {
                            // Apply to store
                            const success = forcePlaceItem(parasiteItem, spawnedPos.x, spawnedPos.y);
                            if (success) {
                                useToastStore.getState().push({
                                    message: spawnCheck.reason,
                                    type: 'error',
                                    duration: 4000
                                });
                                play('error');
                            }
                        }
                    }
                }
            },

            endDay: () => {
                const { placedItems } = useInventoryStore.getState();
                let totalXp = 0;
                let tasksCount = 0;
                let penalty = 0;

                const tasks = placedItems.filter(p => p.item.type === 'task');

                tasks.forEach(task => {
                    const baseXp = task.item.effect.xp ?? 0;
                    const multiplier = computeAuraMultiplier(task, placedItems);
                    const finalXp = Math.floor(baseXp * multiplier);

                    totalXp += finalXp;
                    tasksCount++;
                });

                const parasites = placedItems.filter(p => p.item.type === 'parasite');
                parasites.forEach(p => {
                    const effect = p.item.effect;
                    if (effect.focus && effect.focus < 0) penalty += 5;
                    else penalty += 20; // Default penalty
                });

                // Net XP can't be negative, but let's apply penalty
                totalXp = Math.max(0, totalXp - penalty);

                useUserStore.getState().addXp(totalXp);

                set({
                    phase: 'resolved',
                    time: 8,
                    dailyResult: { xpGained: totalXp, tasksCompleted: tasksCount, parasitePenalty: penalty },
                    dayCount: get().dayCount + 1
                });

                play('fusion');
            },

            reset: () => {
                set({
                    phase: 'planning',
                    time: 8,
                    dayCount: 1,
                    dailyResult: null
                });
            },
        }),
        { name: 'corespace-day-cycle' }
    )
);
