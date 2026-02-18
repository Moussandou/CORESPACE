'use client';

import { useState } from 'react';
import {
    DndContext,
    DragOverlay,
    useSensor,
    useSensors,
    PointerSensor,
    defaultDropAnimationSideEffects,
    DragStartEvent,
    DragEndEvent,
} from '@dnd-kit/core';
import { InventoryGrid } from '@/ui/grid/InventoryGrid';
import { HUD } from '@/ui/hud/HUD';
import { ModuleSidebar } from '@/ui/sidebar/ModuleSidebar';
import { ItemModuleVisual } from '@/ui/items/ItemModule';
import { useInventoryStore } from '@/stores/inventory-store';
import { getOccupiedCells } from '@/domain/grid';
import { pixelToGrid } from '@/utils/grid-math';
import { DESIGN } from '@/config/design-tokens';
import type { Item } from '@/types';

const dropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({
        styles: {
            active: { opacity: '0.5' },
        },
    }),
};

export default function DashboardPage() {
    const { grid, placedItems, move, place, fuse } = useInventoryStore();
    const [activeItem, setActiveItem] = useState<Item | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        })
    );

    function handleDragStart(event: DragStartEvent) {
        if (event.active.data.current?.item) {
            setActiveItem(event.active.data.current.item);
        }
    }

    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;
        setActiveItem(null);

        if (!over) return;

        // Handle Drop on Grid
        if (over.id === 'inventory-grid') {
            const item = active.data.current?.item as Item;
            const isNew = active.data.current?.isNew;

            if (!item) return;

            // Calculate Grid Coordinates
            // We need relative position of the item center (or top-left) to the grid container
            // active.rect.current.translated is the bounding rect of the dragged item
            // over.rect is the bounding rect of the grid droppable

            const activeRect = active.rect.current.translated;
            const overRect = over.rect; // This should be available if we use the right hooks or event data

            if (activeRect && overRect) {
                // InventoryGrid visual offset (Header 24px + Padding 12px = 36y, Padding 12px = 12x)
                // NOTE: Should ideally measure this dynamically or pass defaults. 
                // Hardcoding for MVP based on styles.
                const gridOffsetX = 12;
                const gridOffsetY = 36;

                const relativeX = activeRect.left - overRect.left - gridOffsetX;
                const relativeY = activeRect.top - overRect.top - gridOffsetY;

                const { col, row } = pixelToGrid(relativeX, relativeY);

                // Logic for New Item (Sidebar)
                if (isNew) {
                    place(item, col, row);
                }
                // Logic for Existing Item (Move/Fuse)
                else {
                    // 1. Check Fusion
                    const placedItem = placedItems.find((p) => p.item.id === item.id);
                    if (placedItem) {
                        // Check overlap using domain logic
                        const occupiedCells = getOccupiedCells(item, col, row);
                        let fused = false;

                        for (const cell of occupiedCells) {
                            if (cell.row >= 0 && cell.row < grid.length && cell.col >= 0 && cell.col < grid[0].length) {
                                const gridCell = grid[cell.row][cell.col];
                                if (gridCell.occupied && gridCell.itemId && gridCell.itemId !== item.id) {
                                    if (fuse(item.id, gridCell.itemId)) {
                                        fused = true;
                                        break;
                                    }
                                }
                            }
                        }

                        if (!fused) {
                            move(item.id, col, row);
                        }
                    }
                }
            }
        }
    }

    return (
        <DndContext
            sensors={sensors}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <main className="flex min-h-screen items-center justify-center bg-black overflow-hidden relative">

                {/* Ambient Background */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(20,30,40,0.4)_0%,_rgba(0,0,0,1)_80%)]" />

                <HUD />

                <div className="flex w-full h-full relative z-10 gap-8 items-center">
                    {/* Sidebar */}
                    <ModuleSidebar />

                    {/* Grid Container */}
                    <div className="flex-1 flex justify-center scale-[0.85] md:scale-100">
                        <InventoryGrid />
                    </div>

                    {/* Right Panel Placeholder (Stats in future) */}
                    <div className="w-64 hidden xl:block" />
                </div>

                <DragOverlay dropAnimation={dropAnimation}>
                    {activeItem ? (
                        <ItemModuleVisual
                            item={activeItem}
                            isDragging
                            style={{ cursor: 'grabbing' }}
                        />
                    ) : null}
                </DragOverlay>

            </main>
        </DndContext>
    );
}
