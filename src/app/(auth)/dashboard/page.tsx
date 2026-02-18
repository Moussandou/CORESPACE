'use client';

import { useState } from 'react';
import {
    DndContext,
    DragOverlay,
    useSensor,
    useSensors,
    PointerSensor,
    TouchSensor,
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
import { useResponsiveSlotSize } from '@/utils/use-responsive';
import { play } from '@/infra/audio/sound-engine';
import { ToastContainer } from '@/ui/feedback/ToastContainer';
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
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const slotSize = useResponsiveSlotSize();

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: { distance: 8 },
        }),
        useSensor(TouchSensor, {
            activationConstraint: { delay: 200, tolerance: 5 },
        })
    );

    function handleDragStart(event: DragStartEvent) {
        if (event.active.data.current?.item) {
            setActiveItem(event.active.data.current.item);
            play('drag');
        }
        // Close sidebar on mobile when starting a drag
        setSidebarOpen(false);
    }

    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;
        setActiveItem(null);

        if (!over || over.id !== 'inventory-grid') return;

        const item = active.data.current?.item as Item;
        const isNew = active.data.current?.isNew;
        if (!item) return;

        const activeRect = active.rect.current.translated;
        const overRect = over.rect;
        if (!activeRect || !overRect) return;

        // Offset for internal grid padding (handle + padding)
        const gridPadding = slotSize < 56 ? 6 : 12;
        const handleHeight = slotSize < 56 ? 20 : 24;
        const gridOffsetX = gridPadding;
        const gridOffsetY = handleHeight + gridPadding;

        const relativeX = activeRect.left - overRect.left - gridOffsetX;
        const relativeY = activeRect.top - overRect.top - gridOffsetY;

        const { col, row } = pixelToGrid(relativeX, relativeY);

        if (isNew) {
            place(item, col, row);
            return;
        }

        // Existing item: check fusion then move
        const placedItem = placedItems.find((p) => p.item.id === item.id);
        if (!placedItem) return;

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

    return (
        <DndContext
            sensors={sensors}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <main className="flex min-h-screen min-h-dvh bg-black overflow-hidden relative">

                {/* Ambient Background */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(20,30,40,0.4)_0%,_rgba(0,0,0,1)_80%)]" />

                <HUD />

                {/* Layout: Sidebar + Grid */}
                <div className="flex w-full h-dvh relative z-10">
                    <ModuleSidebar
                        isOpen={sidebarOpen}
                        onToggle={() => setSidebarOpen((o) => !o)}
                        slotSize={slotSize}
                    />

                    {/* Grid Container (centered) */}
                    <div className="flex-1 flex items-center justify-center p-4 overflow-auto">
                        <InventoryGrid slotSize={slotSize} />
                    </div>
                </div>

                <DragOverlay dropAnimation={dropAnimation}>
                    {activeItem ? (
                        <ItemModuleVisual
                            item={activeItem}
                            isDragging
                            style={{
                                cursor: 'grabbing',
                                width: activeItem.width * slotSize,
                                height: activeItem.height * slotSize,
                            }}
                        />
                    ) : null}
                </DragOverlay>
                <ToastContainer />
            </main>
        </DndContext>
    );
}
