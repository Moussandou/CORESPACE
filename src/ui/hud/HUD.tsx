'use client';

import { useUserStore } from '@/stores/user-store';
import { levelProgress, xpToNextLevel } from '@/domain/progression';
import { motion } from 'framer-motion';

export function HUD() {
    const { stats } = useUserStore();
    const progress = levelProgress(stats.xp);
    const remaining = xpToNextLevel(stats.xp);

    return (
        <div className="absolute top-3 right-3 sm:top-6 sm:right-6 z-50 flex flex-col gap-3 sm:gap-4 pointer-events-none select-none font-mono items-end">
            {/* Level & XP */}
            <div className="flex items-center gap-2 sm:gap-3">
                <div className="flex flex-col gap-0.5 sm:gap-1 items-end">
                    <span className="text-[9px] sm:text-[10px] uppercase text-white/50 tracking-wider">Experience</span>
                    <div className="w-20 sm:w-32 h-1 sm:h-1.5 bg-white/10 rounded-full overflow-hidden border border-white/5">
                        <motion.div
                            className="h-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ type: "spring", stiffness: 100, damping: 20 }}
                        />
                    </div>
                    <span className="text-[9px] sm:text-[10px] text-white/30">
                        {remaining > 0 ? `${remaining} XP restant` : 'MAX'}
                    </span>
                </div>
                <div className="w-9 h-9 sm:w-12 sm:h-12 border border-white/20 bg-black/50 backdrop-blur rounded flex items-center justify-center font-bold text-base sm:text-xl text-white shadow-lg">
                    {stats.level}
                </div>
            </div>

            {/* Stats Bars */}
            <div className="flex flex-col gap-1.5 sm:gap-2">
                {/* Energy */}
                <div className="flex flex-col gap-0.5 items-end">
                    <div className="flex justify-between items-end w-28 sm:w-48">
                        <span className="text-[9px] sm:text-[10px] uppercase text-white/50 tracking-wider">Energy</span>
                        <span className="text-[9px] sm:text-[10px] text-green-400">{Math.round(stats.energy)}%</span>
                    </div>
                    <div className="w-28 sm:w-48 h-1.5 sm:h-2 bg-white/10 rounded-sm overflow-hidden border border-white/5 relative">
                        <motion.div
                            className="h-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.6)]"
                            animate={{ width: `${stats.energy}%` }}
                            transition={{ type: "spring", stiffness: 100, damping: 20 }}
                        />
                    </div>
                </div>

                {/* Focus */}
                <div className="flex flex-col gap-0.5 items-end">
                    <div className="flex justify-between items-end w-28 sm:w-48">
                        <span className="text-[9px] sm:text-[10px] uppercase text-white/50 tracking-wider">Focus</span>
                        <span className="text-[9px] sm:text-[10px] text-amber-400">{Math.round(stats.focus)}%</span>
                    </div>
                    <div className="w-28 sm:w-48 h-1.5 sm:h-2 bg-white/10 rounded-sm overflow-hidden border border-white/5">
                        <motion.div
                            className="h-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.6)]"
                            animate={{ width: `${stats.focus}%` }}
                            transition={{ type: "spring", stiffness: 100, damping: 20 }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
