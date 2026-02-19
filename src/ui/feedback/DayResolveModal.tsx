'use client';

import { useDayCycleStore } from '@/stores/day-cycle-store';
import { motion, AnimatePresence } from 'framer-motion';

export function DayResolveModal() {
    const { phase, dailyResult, startPlanning } = useDayCycleStore();

    if (phase !== 'resolved' || !dailyResult) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="w-full max-w-md bg-[#0f1219] border border-white/10 rounded-lg p-6 sm:p-8 flex flex-col items-center gap-6 shadow-2xl relative overflow-hidden"
                >
                    {/* Ambient Glow */}
                    <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50" />
                    <div className="absolute inset-0 bg-blue-500/5 pointer-events-none" />

                    <h2 className="text-2xl font-bold text-white tracking-tight uppercase">Bilan de la journée</h2>

                    <div className="w-full grid gap-4 font-mono text-sm">
                        <div className="flex justify-between items-center p-3 bg-white/5 rounded border border-white/5">
                            <span className="text-white/60">Tâches complétées</span>
                            <span className="text-white font-bold">{dailyResult.tasksCompleted}</span>
                        </div>

                        <div className="flex justify-between items-center p-3 bg-white/5 rounded border border-white/5">
                            <span className="text-white/60">XP Gagné (avec bonus)</span>
                            <span className="text-blue-400 font-bold">+{dailyResult.xpGained} XP</span>
                        </div>

                        {dailyResult.parasitePenalty > 0 && (
                            <div className="flex justify-between items-center p-3 bg-red-500/10 rounded border border-red-500/20">
                                <span className="text-red-300/80">Pénalité Parasites</span>
                                <span className="text-red-400 font-bold">-{dailyResult.parasitePenalty} XP</span>
                            </div>
                        )}

                        <div className="h-px bg-white/10 my-2" />

                        <div className="flex justify-between items-center text-lg">
                            <span className="uppercase tracking-wider text-white/50">Total</span>
                            <span className="text-white font-bold">{Math.max(0, dailyResult.xpGained - dailyResult.parasitePenalty)} XP</span>
                        </div>
                    </div>

                    <button
                        onClick={startPlanning}
                        className="w-full py-3 bg-white text-black font-bold uppercase tracking-wider rounded hover:bg-white/90 transition-colors"
                    >
                        Planifier demain
                    </button>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
