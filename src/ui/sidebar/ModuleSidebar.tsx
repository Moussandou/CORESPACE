'use client';

import { useState } from 'react';
import { ItemModule } from '@/ui/items/ItemModule';
import { ITEMS_CATALOG } from '@/data/items-catalog';
import { SLOT_SIZE_PX } from '@/config/constants';
import { motion, AnimatePresence } from 'framer-motion';

interface ModuleSidebarProps {
    isOpen: boolean;
    onToggle: () => void;
    slotSize?: number;
}

export function ModuleSidebar({ isOpen, onToggle, slotSize }: ModuleSidebarProps) {
    const size = slotSize ?? SLOT_SIZE_PX;
    const blueprints = ITEMS_CATALOG.filter(
        (item, index, self) =>
            index === self.findIndex((t) => t.id === item.id)
    );

    const tasks = blueprints.filter((i) => i.type === 'task');
    const resources = blueprints.filter((i) => i.type === 'resource');
    const buffs = blueprints.filter((i) => i.type === 'buff');

    const groups = [
        { label: 'Tasks', items: tasks },
        { label: 'Resources', items: resources },
        { label: 'Buffs', items: buffs },
    ];

    return (
        <>
            {/* Mobile Toggle Button */}
            <button
                onClick={onToggle}
                className="md:hidden fixed top-4 left-4 z-[60] w-10 h-10 rounded-lg bg-white/10 backdrop-blur border border-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/20 transition-colors"
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
                        className="md:hidden fixed inset-0 bg-black/60 z-40"
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
                    fixed md:relative z-50
                    h-full bg-[#0a0e1a]/95 backdrop-blur-md border-r border-white/10
                    overflow-y-auto flex flex-col gap-4 sm:gap-6
                    transition-transform duration-300 ease-out
                    w-56 sm:w-64 p-3 sm:p-4
                    ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
                `}
            >
                <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight pt-8 md:pt-0">Modules</h2>

                {groups.map(({ label, items }) => (
                    <div key={label} className="flex flex-col gap-3">
                        <h3 className="text-[11px] sm:text-sm uppercase text-white/50 tracking-wider">{label}</h3>
                        <div className="flex flex-wrap gap-2 sm:gap-3">
                            {items.map((item) => (
                                <div key={item.id} className="relative">
                                    <ItemModule item={item} isSidebar slotSize={size} />
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </aside>
        </>
    );
}
