'use client';

import { useBudgetStore } from '@/stores/budget-store';
import { useUserStore } from '@/stores/user-store';
import { DebugResetButton } from '@/ui/debug/DebugResetButton';
import { ItemModuleVisual } from '@/ui/items/ItemModule';
import { ITEMS_CATALOG } from '@/data/items-catalog';
import { SLOT_SIZE_PX } from '@/config/constants';
import { motion, AnimatePresence } from 'framer-motion';
import { useDraggable } from '@dnd-kit/core';
import type { Item } from '@/types';

interface ModuleSidebarProps {
    isOpen: boolean;
    onToggle: () => void;
    slotSize?: number;
}

export function ModuleSidebar({ isOpen, onToggle, slotSize }: ModuleSidebarProps) {
    const size = slotSize ?? SLOT_SIZE_PX;

    // We only need the unique "blueprints" to show in sidebar
    const blueprints = ITEMS_CATALOG.filter(
        (item, index, self) => index === self.findIndex((t) => t.id === item.id)
    );

    const tasks = blueprints.filter((i) => i.type === 'task');
    const resources = blueprints.filter((i) => i.type === 'resource');
    const buffs = blueprints.filter((i) => i.type === 'buff');

    const groups = [
        { label: 'Tâches', items: tasks },
        { label: 'Ressources', items: resources },
        { label: 'Buffs', items: buffs },
    ];

    return (
        <>
            {/* Mobile Toggle Button */}
            <button
                onClick={onToggle}
                className="md:hidden fixed top-4 right-4 z-[90] w-10 h-10 rounded-lg bg-white/10 backdrop-blur border border-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/20 transition-colors"
                style={{ right: isOpen ? '16px' : '16px', top: '16px' }} // Positioning
                aria-label={isOpen ? 'Fermer le panneau' : 'Ouvrir le panneau'}
            >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    {isOpen ? (
                        <path d="M5 5L15 15M15 5L5 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    ) : (
                        <path d="M3 5H17M3 10H17M3 15H17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    )}
                </svg>
            </button>

            {/* Mobile Overlay */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        className="md:hidden fixed inset-0 bg-black/60 z-[80]"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onToggle}
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <aside
                className={`
                    fixed md:relative z-[85] h-full
                    bg-[#0a0e1a]/95 backdrop-blur-md border-r border-white/10
                    overflow-y-auto overflow-x-hidden flex flex-col gap-6
                    transition-transform duration-300 ease-out
                    w-64 p-4
                    ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
                `}
            >
                <div className="pt-12 md:pt-0">
                    <h2 className="text-xl font-bold text-white tracking-tight mb-6">Modules</h2>
                </div>

                {groups.map(({ label, items }) => (
                    <div key={label} className="flex flex-col gap-3">
                        <h3 className="text-xs uppercase text-white/40 tracking-wider font-semibold">{label}</h3>
                        <div className="grid grid-cols-2 gap-3">
                            {items.map((item) => (
                                <SidebarItem key={item.id} item={item} slotSize={size} />
                            ))}
                        </div>
                    </div>
                ))}

                <div className="mt-auto p-4 border-t border-white/10">
                    <DebugResetButton />
                </div>
                <div className="h-20 md:hidden" /> {/* Bottom spacer for mobile */}
            </aside>
        </>
    );
}

function SidebarItem({ item, slotSize }: { item: Item; slotSize: number }) {
    const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
        id: `sidebar-${item.id}`,
        data: { item, isNew: true }, // Pass item data for drag overlay
    });

    const isTask = item.type === 'task';
    const energyCost = item.energyCost ?? 0;

    // Store subscriptions
    const { energy } = useUserStore((s) => s.stats);
    const { getRemaining } = useBudgetStore();

    // Reactive derived state
    const remaining = getRemaining(item.type);
    const unlimited = remaining === Infinity;
    const canAfford = !isTask || energy >= energyCost;
    const hasStock = unlimited || remaining > 0;
    const isDisabled = !canAfford || !hasStock;

    return (
        <div
            ref={hasStock ? setNodeRef : null}
            {...listeners}
            {...attributes}
            className={`
                relative group flex flex-col gap-1
                ${isDragging ? 'opacity-50' : 'opacity-100'}
                ${isDisabled ? 'opacity-40 grayscale pointer-events-none' : 'cursor-grab active:cursor-grabbing'}
            `}
        >
            <div className="relative">
                {/* Preview scaling */}
                <div
                    className="origin-top-left transform scale-75 border border-white/10 rounded overflow-hidden"
                    style={{
                        width: item.width * slotSize,
                        height: item.height * slotSize,
                    }}
                >
                    <ItemModuleVisual item={item} slotSize={slotSize} />
                </div>

                {/* Badges Overlay */}
                <div className="absolute -top-1 -right-1 flex flex-col gap-1 items-end">
                    {/* Energy Cost Badge */}
                    {isTask && energyCost > 0 && (
                        <div className={`
                            text-[10px] px-1.5 py-0.5 rounded font-mono font-bold
                            ${energy >= energyCost ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' : 'bg-red-500/20 text-red-300 border border-red-500/30'}
                        `}>
                            -{energyCost}E
                        </div>
                    )}

                    {/* Stock Badge */}
                    {!unlimited && (
                        <div className={`
                            text-[10px] px-1.5 py-0.5 rounded font-mono font-bold
                            ${remaining > 0 ? 'bg-white/10 text-white/70 border border-white/10' : 'bg-red-900/50 text-red-400 border border-red-500/30'}
                        `}>
                            x{remaining}
                        </div>
                    )}
                </div>
            </div>

            <div className="text-[10px] text-white/50 truncate font-mono w-full px-0.5">
                {item.name}
            </div>
        </div>
    );
}
