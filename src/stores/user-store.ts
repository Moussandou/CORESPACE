import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserStats, ItemEffect } from '@/types';
import { XP_THRESHOLDS } from '@/config/constants';

interface UserState {
    stats: UserStats;

    // Actions
    addXp: (amount: number) => void;
    modifyEnergy: (amount: number) => void;
    modifyFocus: (amount: number) => void;
    applyEffect: (effect: ItemEffect) => void;
    reset: () => void;
}

const INITIAL_STATS: UserStats = {
    xp: 0,
    level: 1,
    streak: 0,
    energy: 100,
    focus: 100,
};

export const useUserStore = create<UserState>()(
    persist(
        (set, get) => ({
            stats: INITIAL_STATS,

            addXp: (amount) => {
                const { stats } = get();
                const newXp = stats.xp + amount;
                // Simple level up logic (CDC §8)
                // logic here...
                set({ stats: { ...stats, xp: newXp } });
            },

            modifyEnergy: (amount) => {
                const { stats } = get();
                const newEnergy = Math.max(0, Math.min(100, stats.energy + amount));
                set({ stats: { ...stats, energy: newEnergy } });
            },

            modifyFocus: (amount) => {
                const { stats } = get();
                const newFocus = Math.max(0, Math.min(100, stats.focus + amount));
                set({ stats: { ...stats, focus: newFocus } });
            },

            applyEffect: (effect) => {
                const { addXp, modifyEnergy, modifyFocus } = get();
                if (effect.xp) addXp(effect.xp);
                if (effect.energy) modifyEnergy(effect.energy);
                if (effect.focus) modifyFocus(effect.focus);
            },

            reset: () => set({ stats: INITIAL_STATS }),
        }),
        { name: 'corespace-user-storage' }
    )
);
