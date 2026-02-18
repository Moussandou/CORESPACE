'use client';

import { useDroppable } from '@dnd-kit/core';
import { useInventoryStore } from '@/stores/inventory-store';
import { GridSlot } from './GridSlot';
import { ItemModule } from '@/ui/items/ItemModule';
import { motion, AnimatePresence } from 'framer-motion';
import { DESIGN } from '@/config/design-tokens';

interface InventoryGridProps {
    slotSize: number;
}

export function InventoryGrid({ slotSize }: InventoryGridProps) {
    const { grid, placedItems } = useInventoryStore();
    const cols = grid[0].length;

    const { setNodeRef } = useDroppable({
        id: 'inventory-grid',
    });

    return (
        <div className="relative flex flex-col items-center w-full">
            {/* BRIEFCASE CONTAINER */}
            <motion.div
                ref={setNodeRef}
                className="relative rounded-xl overflow-hidden shadow-2xl max-w-full"
                style={{
                    background: DESIGN.colors.bg.surface,
                    boxShadow: '0 20px 50px -10px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.05)',
                    border: '4px solid rgba(255,255,255,0.05)',
                }}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
                {/* Top Handle */}
                <div className="h-5 sm:h-6 w-full bg-[#151922] border-b border-white/5 flex items-center justify-center">
                    <div className="w-1/3 h-full border-x border-white/5 bg-[#1a1f29]" />
                </div>

                {/* Inner Grid Container */}
                <div
                    className="relative"
                    style={{
                        padding: slotSize < 56 ? 6 : 12,
                        background: DESIGN.textures.briefcase,
                    }}
                >
                    <div
                        className="grid relative"
                        style={{
                            gridTemplateColumns: `repeat(${cols}, ${slotSize}px)`,
                            gap: 0,
                        }}
                    >
                        <div className="absolute inset-0 border-t border-l border-[rgba(255,255,255,0.08)] pointer-events-none z-0" />

                        {grid.map((row, y) =>
                            row.map((cell, x) => (
                                <GridSlot
                                    key={`${x}-${y}`}
                                    x={x}
                                    y={y}
                                    isOccupied={cell.occupied}
                                    slotSize={slotSize}
                                />
                            ))
                        )}

                        <AnimatePresence>
                            {placedItems.map((placed) => (
                                <ItemModule key={placed.item.id} placedItem={placed} slotSize={slotSize} />
                            ))}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Bottom Latch */}
                <div className="h-6 sm:h-8 w-full bg-[#151922] border-t border-white/5 flex justify-between px-4 sm:px-8 items-center">
                    <div className="w-6 sm:w-8 h-3 sm:h-4 bg-[#2a303e] rounded-[1px] shadow-sm" />
                    <div className="w-6 sm:w-8 h-3 sm:h-4 bg-[#2a303e] rounded-[1px] shadow-sm" />
                </div>
            </motion.div>
        </div>
    );
}
