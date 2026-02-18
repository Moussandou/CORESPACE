import { create } from 'zustand';

interface AudioState {
    muted: boolean;
    volume: number;
    toggleMute: () => void;
    setVolume: (v: number) => void;
}

export const useAudioStore = create<AudioState>((set, get) => ({
    muted: false,
    volume: 0.5,

    toggleMute: () => set({ muted: !get().muted }),
    setVolume: (v) => set({ volume: Math.max(0, Math.min(1, v)) }),
}));
