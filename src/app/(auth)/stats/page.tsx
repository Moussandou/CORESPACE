'use client';

import { useUserStore } from '@/stores/user-store';
import { useActivityStore } from '@/stores/activity-store';
import { useInventoryStore } from '@/stores/inventory-store';
import Link from 'next/link';

const DAY_LABELS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

function WeekChart() {
    const weekHistory = useActivityStore((s) => s.getWeekHistory());
    const maxXp = Math.max(...weekHistory.map((d) => d.xpEarned), 1);

    return (
        <div className="flex items-end gap-1 sm:gap-2 h-32 sm:h-40">
            {weekHistory.map((day, i) => {
                const height = Math.max(4, (day.xpEarned / maxXp) * 100);
                const dayDate = new Date(day.date);
                const label = DAY_LABELS[dayDate.getDay() === 0 ? 6 : dayDate.getDay() - 1];
                const isToday = day.date === new Date().toISOString().slice(0, 10);
                return (
                    <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
                        <span className="text-[9px] text-white/40">{day.xpEarned > 0 ? day.xpEarned : ''}</span>
                        <div
                            className="w-full rounded-sm transition-all duration-500"
                            style={{
                                height: `${height}%`,
                                background: isToday
                                    ? 'linear-gradient(180deg, rgba(59,130,246,0.8), rgba(59,130,246,0.3))'
                                    : 'linear-gradient(180deg, rgba(255,255,255,0.15), rgba(255,255,255,0.05))',
                                boxShadow: isToday ? '0 0 12px rgba(59,130,246,0.3)' : 'none',
                            }}
                        />
                        <span className={`text-[10px] ${isToday ? 'text-blue-400 font-bold' : 'text-white/30'}`}>
                            {label}
                        </span>
                    </div>
                );
            })}
        </div>
    );
}

interface StatCardProps {
    label: string;
    value: string | number;
    accent?: string;
    sub?: string;
}

function StatCard({ label, value, accent = 'rgba(255,255,255,0.08)', sub }: StatCardProps) {
    return (
        <div
            className="rounded-lg p-4 sm:p-5 flex flex-col gap-1 border border-white/5"
            style={{ background: accent }}
        >
            <span className="text-[10px] sm:text-xs uppercase tracking-wider text-white/40">{label}</span>
            <span className="text-2xl sm:text-3xl font-bold text-white tracking-tight">{value}</span>
            {sub && <span className="text-[10px] sm:text-xs text-white/30">{sub}</span>}
        </div>
    );
}

export default function StatsPage() {
    const { stats } = useUserStore();
    const { placedItems } = useInventoryStore();
    const current = useActivityStore((s) => s.current);
    const streak = useActivityStore((s) => s.getStreak());

    const totalSlots = 8 * 6; // day mode grid
    const occupiedSlots = placedItems.reduce((acc, p) => acc + p.item.width * p.item.height, 0);
    const occupancy = Math.round((occupiedSlots / totalSlots) * 100);

    return (
        <main className="min-h-screen min-h-dvh bg-black text-white font-mono">
            {/* Ambient bg */}
            <div className="fixed inset-0 bg-[radial-gradient(circle_at_30%_20%,_rgba(20,30,60,0.4)_0%,_rgba(0,0,0,1)_70%)] pointer-events-none" />

            <div className="relative z-10 max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
                {/* Header */}
                <div className="flex items-center justify-between mb-8 sm:mb-10">
                    <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Statistiques</h1>
                    <Link
                        href="/dashboard"
                        className="text-xs text-white/40 hover:text-white/70 transition-colors border border-white/10 px-3 py-1.5 rounded"
                    >
                        Inventaire
                    </Link>
                </div>

                {/* Primary Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
                    <StatCard label="Niveau" value={stats.level} accent="rgba(59,130,246,0.08)" />
                    <StatCard label="XP Total" value={stats.xp} sub="points" />
                    <StatCard
                        label="Streak"
                        value={`${streak}j`}
                        accent={streak > 0 ? 'rgba(245,158,11,0.08)' : undefined}
                        sub="consecutifs"
                    />
                    <StatCard
                        label="Occupation"
                        value={`${occupancy}%`}
                        sub={`${occupiedSlots}/${totalSlots} slots`}
                    />
                </div>

                {/* Gauges */}
                <div className="grid grid-cols-2 gap-3 mb-8">
                    <GaugeBar label="Energie" value={stats.energy} color="rgb(34,197,94)" />
                    <GaugeBar label="Focus" value={stats.focus} color="rgb(245,158,11)" />
                </div>

                {/* Weekly Chart */}
                <section className="rounded-lg border border-white/5 bg-white/[0.03] p-4 sm:p-6 mb-8">
                    <h2 className="text-sm uppercase tracking-wider text-white/40 mb-4">XP — 7 derniers jours</h2>
                    <WeekChart />
                </section>

                {/* Today Activity */}
                <section className="rounded-lg border border-white/5 bg-white/[0.03] p-4 sm:p-6">
                    <h2 className="text-sm uppercase tracking-wider text-white/40 mb-4">Activite du jour</h2>
                    <div className="grid grid-cols-3 gap-3">
                        <MiniStat label="Fusions" value={current.fusionsDone} />
                        <MiniStat label="Consommes" value={current.itemsConsumed} />
                        <MiniStat label="XP gagne" value={current.xpEarned} />
                    </div>
                </section>
            </div>
        </main>
    );
}

function GaugeBar({ label, value, color }: { label: string; value: number; color: string }) {
    return (
        <div className="rounded-lg border border-white/5 bg-white/[0.03] p-4 flex flex-col gap-2">
            <div className="flex justify-between items-baseline">
                <span className="text-[10px] sm:text-xs uppercase tracking-wider text-white/40">{label}</span>
                <span className="text-sm font-bold" style={{ color }}>{Math.round(value)}%</span>
            </div>
            <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                        width: `${value}%`,
                        background: color,
                        boxShadow: `0 0 12px ${color}40`,
                    }}
                />
            </div>
        </div>
    );
}

function MiniStat({ label, value }: { label: string; value: number }) {
    return (
        <div className="text-center">
            <div className="text-xl sm:text-2xl font-bold text-white">{value}</div>
            <div className="text-[9px] sm:text-[10px] uppercase text-white/30 tracking-wider">{label}</div>
        </div>
    );
}
