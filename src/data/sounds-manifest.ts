/**
 * Sound manifest — maps action names to audio file paths (CDC §20, §23).
 * Files expected in public/sounds/.
 * Placeholder: files do not exist yet; sound engine will handle missing gracefully.
 */
export const SOUNDS = {
    'open-inventory': '/sounds/open-inventory.mp3',
    drag: '/sounds/drag.mp3',
    drop: '/sounds/drop.mp3',
    fusion: '/sounds/fusion.mp3',
    consume: '/sounds/consume.mp3',
    error: '/sounds/error.mp3',
} as const;

export type SoundName = keyof typeof SOUNDS;
