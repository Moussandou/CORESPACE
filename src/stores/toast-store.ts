import { create } from 'zustand';

export interface Toast {
    id: string;
    message: string;
    type: 'levelup' | 'info' | 'error';
    duration?: number;
}

interface ToastState {
    toasts: Toast[];
    push: (toast: Omit<Toast, 'id'>) => void;
    dismiss: (id: string) => void;
}

let counter = 0;

export const useToastStore = create<ToastState>((set, get) => ({
    toasts: [],

    push: (toast) => {
        const id = `toast-${++counter}`;
        const duration = toast.duration ?? 4000;
        set({ toasts: [...get().toasts, { ...toast, id }] });

        setTimeout(() => {
            get().dismiss(id);
        }, duration);
    },

    dismiss: (id) => {
        set({ toasts: get().toasts.filter((t) => t.id !== id) });
    },
}));
