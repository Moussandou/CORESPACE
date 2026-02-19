import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface DailyRecord {
    date: string; // ISO date (YYYY-MM-DD)
    tasksCompleted: number;
    fusionsDone: number;
    itemsConsumed: number;
    xpEarned: number;
}

interface ActivityState {
    history: DailyRecord[];
    current: DailyRecord;

    trackTask: () => void;
    trackFusion: () => void;
    trackConsume: () => void;
    trackXp: (amount: number) => void;
    getStreak: () => number;
    getWeekHistory: () => DailyRecord[];
    reset: () => void;
}

function todayKey(): string {
    return new Date().toISOString().slice(0, 10);
}

function ensureToday(state: ActivityState): DailyRecord {
    const today = todayKey();
    if (state.current.date === today) return state.current;
    return { date: today, tasksCompleted: 0, fusionsDone: 0, itemsConsumed: 0, xpEarned: 0 };
}

export const useActivityStore = create<ActivityState>()(
    persist(
        (set, get) => ({
            history: [],
            current: { date: todayKey(), tasksCompleted: 0, fusionsDone: 0, itemsConsumed: 0, xpEarned: 0 },

            trackTask: () => {
                const state = get();
                const current = { ...ensureToday(state), tasksCompleted: ensureToday(state).tasksCompleted + 1 };
                set({ current, history: mergeHistory(state.history, current) });
            },

            trackFusion: () => {
                const state = get();
                const current = { ...ensureToday(state), fusionsDone: ensureToday(state).fusionsDone + 1 };
                set({ current, history: mergeHistory(state.history, current) });
            },

            trackConsume: () => {
                const state = get();
                const current = { ...ensureToday(state), itemsConsumed: ensureToday(state).itemsConsumed + 1 };
                set({ current, history: mergeHistory(state.history, current) });
            },

            trackXp: (amount) => {
                const state = get();
                const current = { ...ensureToday(state), xpEarned: ensureToday(state).xpEarned + amount };
                set({ current, history: mergeHistory(state.history, current) });
            },

            getStreak: () => {
                const { history } = get();
                if (history.length === 0) return 0;

                let streak = 0;
                const today = new Date();
                today.setHours(0, 0, 0, 0);

                for (let i = 0; i < 365; i++) {
                    const checkDate = new Date(today);
                    checkDate.setDate(checkDate.getDate() - i);
                    const key = checkDate.toISOString().slice(0, 10);
                    const record = history.find((r) => r.date === key);
                    const hasActivity = record && (record.tasksCompleted > 0 || record.fusionsDone > 0 || record.itemsConsumed > 0);
                    if (hasActivity) {
                        streak++;
                    } else if (i > 0) {
                        break; // Allow today to have no activity yet
                    }
                }
                return streak;
            },

            getWeekHistory: () => {
                const { history } = get();
                const days: DailyRecord[] = [];
                const today = new Date();
                today.setHours(0, 0, 0, 0);

                for (let i = 6; i >= 0; i--) {
                    const d = new Date(today);
                    d.setDate(d.getDate() - i);
                    const key = d.toISOString().slice(0, 10);
                    const existing = history.find((r) => r.date === key);
                    days.push(existing ?? { date: key, tasksCompleted: 0, fusionsDone: 0, itemsConsumed: 0, xpEarned: 0 });
                }
                return days;
            },

            reset: () => {
                set({
                    history: [],
                    current: { date: todayKey(), tasksCompleted: 0, fusionsDone: 0, itemsConsumed: 0, xpEarned: 0 }
                });
            },
        }),
        { name: 'corespace-activity-storage' }
    )
);
/** Replace or append the current day's record in history. Keep last 30 days. */
function mergeHistory(history: DailyRecord[], current: DailyRecord): DailyRecord[] {
    const filtered = history.filter((r) => r.date !== current.date);
    return [...filtered, current].slice(-30);
}
