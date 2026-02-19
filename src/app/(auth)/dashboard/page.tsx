'use client';

import { useState, useEffect } from 'react';
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
import { useDayCycleStore } from '@/stores/day-cycle-store';
import { DayControls } from '@/ui/hud/DayControls';
import { DayResolveModal } from '@/ui/feedback/DayResolveModal';
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
    const { tick, phase } = useDayCycleStore();
    const [activeItem, setActiveItem] = useState<Item | null>(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const slotSize = useResponsiveSlotSize();

    // Game Loop: Tick every 2.5 seconds = 30 minutes in game
    // => 1 hour = 5 seconds
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (phase === 'active') {
            interval = setInterval(() => {
                tick(0.5); // +30 mins
            }, 2500);
        }
        return () => clearInterval(interval);
    }, [phase, tick]);

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
        setSidebarOpen(false);
    }

    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;
        setActiveItem(null);

        if (!over || over.id !== 'inventory-grid') return;

        const item = active.data.current?.item as Item;
        const isNew = active.data.current?.isNew;
        if (!item) return;

        // Prevent placing tasks if not in PLANNING phase?
        // Actually, user can place tasks during active phase too, but maybe with penalty or cost?
        // For now, let's allow it continuously.

        const activeRect = active.rect.current.translated;
        const overRect = over.rect;
        if (!activeRect || !overRect) return;

        const gridPadding = slotSize < 56 ? 6 : 12;
        const handleHeight = slotSize < 56 ? 20 : 24;
        const gridOffsetX = gridPadding;
        const gridOffsetY = handleHeight + gridPadding;

        const relativeX = activeRect.left - overRect.left - gridOffsetX;
        const relativeY = activeRect.top - overRect.top - gridOffsetY;

        const { col, row } = pixelToGrid(relativeX, relativeY, slotSize);

        console.log('[Dashboard] DragEnd:', { activeId: active.id, overId: over?.id, isNew, item });

        if (isNew) {
            console.log('[Dashboard] Placing NEW item:', item.name, 'at', col, row);
            const success = place(item, col, row);
            if (success) play('drop');
            else play('error');
            return;
        }

        // active.id is now the unique instanceId
        const instanceId = String(active.id);

        const occupiedCells = getOccupiedCells(item, col, row);
        let fused = false;

        for (const cell of occupiedCells) {
            if (cell.row >= 0 && cell.row < grid.length && cell.col >= 0 && cell.col < grid[0].length) {
                const gridCell = grid[cell.row][cell.col];
                // Check against instanceId, not catalog ID
                if (gridCell.occupied && gridCell.itemId && gridCell.itemId !== instanceId) {
                    if (fuse(instanceId, gridCell.itemId)) {
                        fused = true;
                        break;
                    }
                }
            }
        }

        if (!fused) {
            move(instanceId, col, row);
        }
    }

    return (
        <DndContext
            sensors={sensors}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <main className="flex min-h-screen min-h-dvh bg-black overflow-hidden relative">

                {/* Background Texture */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(20,30,40,0.4)_0%,_rgba(0,0,0,1)_80%)] pointer-events-none" />

                <HUD />
                <DayControls />
                <DayResolveModal />

                <div className="flex w-full h-dvh relative z-10">
                    <ModuleSidebar
                        isOpen={sidebarOpen}
                        onToggle={() => setSidebarOpen((o) => !o)}
                        slotSize={slotSize}
                    />

                    <div className="flex-1 flex items-center justify-center p-4 overflow-auto">
                        <InventoryGrid slotSize={slotSize} />
                    </div>
                </div>

                <DragOverlay dropAnimation={dropAnimation} zIndex={100}>
                    {activeItem ? (
                        <div style={{ pointerEvents: 'none' }}>
                            <ItemModuleVisual
                                item={activeItem}
                                isDragging
                                slotSize={slotSize}
                                style={{
                                    width: activeItem.width * slotSize,
                                    height: activeItem.height * slotSize,
                                }}
                            />
                        </div>
                    ) : null}
                </DragOverlay>
                <ToastContainer />
            </main>
        </DndContext>
    );
}
