'use client';

import { useDayCycleStore } from '@/stores/day-cycle-store';
import { motion } from 'framer-motion';

export function DayControls() {
    const { phase, time, startDay, endDay } = useDayCycleStore();

    const formatTime = (t: number) => {
        const h = Math.floor(t);
        const m = Math.floor((t - h) * 60);
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
    };

    return (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center gap-2 pointer-events-auto">
            {/* Time Display */}
            <div className="px-4 py-1 bg-black/40 backdrop-blur rounded border border-white/10 text-white font-mono text-xl font-bold tracking-widest shadow-lg">
                {formatTime(time)}
            </div>

            {/* Action Button */}
            {phase === 'planning' && (
                <motion.button
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={startDay}
                    className="px-6 py-2 bg-white text-black font-bold uppercase tracking-wider rounded shadow-[0_0_15px_rgba(255,255,255,0.3)] hover:bg-white/90"
                >
                    Lancer la journée
                </motion.button>
            )}

            {phase === 'active' && (
                <motion.button
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ scale: 1.05, backgroundColor: 'rgba(239,68,68,0.2)' }}
                    whileTap={{ scale: 0.95 }}
                    onClick={endDay}
                    className="px-4 py-1.5 bg-black/40 border border-white/10 text-white/50 hover:text-red-400 hover:border-red-500/30 font-mono text-xs uppercase tracking-wider rounded transition-colors"
                >
                    Terminer (Force)
                </motion.button>
            )}

            {phase === 'active' && (
                <div className="text-[10px] text-white/30 uppercase tracking-widest mt-1">
                    En cours...
                </div>
            )}
        </div>
    );
}
