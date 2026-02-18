import { XP_THRESHOLDS } from '@/config/constants';

/** Max reachable level (index-based on thresholds array). */
export const MAX_LEVEL = XP_THRESHOLDS.length;

/** Compute the level for a given total XP. */
export function computeLevel(totalXp: number): number {
    for (let i = XP_THRESHOLDS.length - 1; i >= 0; i--) {
        if (totalXp >= XP_THRESHOLDS[i]) return i + 1;
    }
    return 1;
}

/** XP needed to reach the next level from current total XP. */
export function xpToNextLevel(totalXp: number): number {
    const level = computeLevel(totalXp);
    if (level >= MAX_LEVEL) return 0;
    return XP_THRESHOLDS[level] - totalXp;
}

/** XP range for the current level (min, max). */
export function currentLevelRange(totalXp: number): { min: number; max: number } {
    const level = computeLevel(totalXp);
    const min = XP_THRESHOLDS[level - 1] ?? 0;
    const max = level < MAX_LEVEL ? XP_THRESHOLDS[level] : min;
    return { min, max };
}

/** Progress within current level as 0-100. */
export function levelProgress(totalXp: number): number {
    const { min, max } = currentLevelRange(totalXp);
    if (max <= min) return 100;
    return Math.round(((totalXp - min) / (max - min)) * 100);
}
