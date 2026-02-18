import { Howl } from 'howler';
import { SOUNDS, type SoundName } from '@/data/sounds-manifest';

const cache = new Map<SoundName, Howl>();

let globalVolume = 0.5;
let muted = false;

function getHowl(name: SoundName): Howl | null {
    if (cache.has(name)) return cache.get(name)!;

    const src = SOUNDS[name];
    if (!src) return null;

    const howl = new Howl({
        src: [src],
        volume: globalVolume,
        preload: false,
        onloaderror: () => {
            // Graceful degradation: missing audio files just log once
            console.warn(`[sound-engine] Failed to load: ${src}`);
        },
    });
    cache.set(name, howl);
    return howl;
}

export function play(name: SoundName): void {
    if (muted) return;
    const howl = getHowl(name);
    if (!howl) return;
    howl.volume(globalVolume);
    howl.play();
}

export function setVolume(v: number): void {
    globalVolume = Math.max(0, Math.min(1, v));
    cache.forEach((h) => h.volume(globalVolume));
}

export function getVolume(): number {
    return globalVolume;
}

export function setMuted(m: boolean): void {
    muted = m;
}

export function isMuted(): boolean {
    return muted;
}

/** Preload common sounds to avoid delay on first interaction. */
export function preloadAll(): void {
    (Object.keys(SOUNDS) as SoundName[]).forEach((name) => {
        const howl = getHowl(name);
        howl?.load();
    });
}
