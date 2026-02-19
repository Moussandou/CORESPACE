'use client';

import { useInventoryStore } from '@/stores/inventory-store';
import { useUserStore } from '@/stores/user-store';
import { useBudgetStore } from '@/stores/budget-store';
import { useDayCycleStore } from '@/stores/day-cycle-store';
import { useActivityStore } from '@/stores/activity-store';
import { useToastStore } from '@/stores/toast-store';
import { play } from '@/infra/audio/sound-engine';

export function DebugResetButton() {
    const resetInventory = useInventoryStore((s) => s.reset);
    const resetUser = useUserStore((s) => s.reset);
    const resetBudget = useBudgetStore((s) => s.reset);
    const resetDayCycle = useDayCycleStore((s) => s.reset);
    const resetActivity = useActivityStore((s) => s.reset);

    const handleReset = () => {
        if (confirm('⚠️ Réinitialiser TOUTE la progression ? (Irréversible)')) {
            resetInventory();
            resetUser();
            resetBudget();
            resetDayCycle();
            resetActivity();

            useToastStore.getState().push({
                message: 'Jeu réinitialisé avec succès.',
                type: 'info',
            });
            play('error'); // Recycle error sound as click for now, or use valid sound

            // Force reload to ensure clean state
            window.location.reload();
        }
    };

    return (
        <button
            onClick={handleReset}
            className="px-3 py-1 bg-red-900/50 hover:bg-red-800/80 text-red-200 text-xs rounded border border-red-700/50 backdrop-blur-sm transition-colors"
            title="Reset All Data"
        >
            RESET DATA
        </button>
    );
}
