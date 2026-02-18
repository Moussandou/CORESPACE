'use client';

import { useEffect } from 'react';
import { InventoryGrid } from '@/ui/grid/InventoryGrid';
import { HUD } from '@/ui/hud/HUD';
import { useInventoryStore } from '@/stores/inventory-store';
import { ITEMS_CATALOG } from '@/data/items-catalog';

export default function DashboardPage() {
    const { populateDebugItems } = useInventoryStore();

    useEffect(() => {
        // Seed some items for testing (CDCMVP #2 Drag & Drop)
        const codeTask = ITEMS_CATALOG.find((i) => i.id === 'task-code');
        const coffee = ITEMS_CATALOG.find((i) => i.id === 'res-coffee');
        const focus = ITEMS_CATALOG.find((i) => i.id === 'res-focus');
        const fatigue = ITEMS_CATALOG.find((i) => i.id === 'para-fatigue');

        if (codeTask && coffee && focus && fatigue) {
            populateDebugItems([
                { item: codeTask, x: 1, y: 1 },
                { item: coffee, x: 4, y: 1 },
                { item: focus, x: 4, y: 3 }, // Place below coffee for easy drag
                { item: fatigue, x: 1, y: 4 },
            ]);
        }
    }, [populateDebugItems]);

    return (
        <main className="flex min-h-screen items-center justify-center bg-black overflow-hidden relative">

            {/* Ambient Background (Dark Room vibe) */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(20,30,40,0.4)_0%,_rgba(0,0,0,1)_80%)]" />

            <HUD />

            {/* Grid Container */}
            <div className="relative z-10 scale-[0.85] md:scale-100">
                <InventoryGrid />
            </div>

        </main>
    );
}
