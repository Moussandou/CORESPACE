'use client';

import {
    DndContext,
    useSensor,
    useSensors,
    PointerSensor,
    DragEndEvent,
} from '@dnd-kit/core';
import { useInventoryStore } from '@/stores/inventory-store';
import { GridSlot } from './GridSlot';
import { ItemModule } from '@/ui/items/ItemModule'; // Assume this export exists
import { DESIGN } from '@/config/design-tokens';
import { pixelToGrid } from '@/utils/grid-math';
import { getOccupiedCells } from '@/domain/grid';
import { motion, AnimatePresence } from 'framer-motion';

export function InventoryGrid() {
    const { grid, placedItems, move, fuse } = useInventoryStore();

    const cols = grid[0].length;
    // const rows = grid.length;

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5, // Prevent accidental drags
            },
        })
    );

    function handleDragEnd(event: DragEndEvent) {
        const { active, delta } = event;
        const placedItem = placedItems.find((p) => p.item.id === active.id);
        if (!placedItem) return;

        // Convert pixel delta to grid delta
        const { col: dCol, row: dRow } = pixelToGrid(delta.x, delta.y);

        // Calculate new target position based on original position + delta
        const newX = placedItem.x + dCol;
        const newY = placedItem.y + dRow;

        // Check for fusion opportunities (overlap with another item)
        const occupiedCells = getOccupiedCells(placedItem.item, newX, newY);
        for (const cell of occupiedCells) {
            // Boundary check
            if (cell.row >= 0 && cell.row < grid.length && cell.col >= 0 && cell.col < grid[0].length) {
                const gridCell = grid[cell.row][cell.col];
                // If cell occupied by another item
                if (gridCell.occupied && gridCell.itemId && gridCell.itemId !== placedItem.item.id) {
                    // Attempt fusion
                    const success = fuse(placedItem.item.id, gridCell.itemId);
                    if (success) return; // Fusion consumed items, stop logic
                }
            }
        }

        // Attempt to move (store handles collision/bounds check)
        if (dCol !== 0 || dRow !== 0) {
            move(placedItem.item.id, newX, newY);
        }
    }

    return (
        <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
            <div className="relative flex flex-col items-center">

                {/* BRIEFCASE CONTAINER */}
                <motion.div
                    className="relative rounded-xl overflow-hidden shadow-2xl"
                    style={{
                        background: DESIGN.colors.bg.surface,
                        boxShadow: '0 20px 50px -10px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.05)',
                        border: '4px solid rgba(255,255,255,0.05)',
                    }}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                >
                    {/* Top Handle visual hint */}
                    <div className="h-6 w-full bg-[#151922] border-b border-white/5 flex items-center justify-center">
                        <div className="w-1/3 h-full border-x border-white/5 bg-[#1a1f29]" />
                    </div>

                    {/* Inner Grid Container */}
                    <div
                        className="relative"
                        style={{
                            padding: 12,
                            background: DESIGN.textures.briefcase,
                        }}
                    >
                        <div
                            className="grid relative"
                            style={{
                                gridTemplateColumns: `repeat(${cols}, ${DESIGN.layout.slotSize}px)`,
                                gap: 0,
                            }}
                        >
                            {/* Top/Left outer borders for the grid specifically */}
                            <div className="absolute inset-0 border-t border-l border-[rgba(255,255,255,0.08)] pointer-events-none z-0" />

                            {/* Grid Slots Layer */}
                            {grid.map((row, y) =>
                                row.map((cell, x) => (
                                    <GridSlot
                                        key={`${x}-${y}`}
                                        x={x}
                                        y={y}
                                        isOccupied={cell.occupied}
                                    />
                                ))
                            )}

                            {/* Items Layer (Absolute over grid) */}
                            <AnimatePresence>
                                {placedItems.map((placed) => (
                                    <ItemModule key={placed.item.id} placedItem={placed} />
                                ))}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Bottom Latch visual hint */}
                    <div className="h-8 w-full bg-[#151922] border-t border-white/5 flex justify-between px-8 items-center">
                        <div className="w-8 h-4 bg-[#2a303e] rounded-[1px] shadow-sm transform translate-y-[-50%]" />
                        <div className="w-8 h-4 bg-[#2a303e] rounded-[1px] shadow-sm transform translate-y-[-50%]" />
                    </div>

                </motion.div>
            </div>
        </DndContext>
    );
}
