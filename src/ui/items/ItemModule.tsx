import { useDraggable } from '@dnd-kit/core';
import type { Item, PlacedItem } from '@/types';
import { DESIGN } from '@/config/design-tokens';
import { CSS } from '@dnd-kit/utilities';
import { useInventoryStore } from '@/stores/inventory-store';
import { motion } from 'framer-motion';
import './items.css';

interface ItemModuleProps {
    placedItem: PlacedItem;
}

export function ItemModule({ placedItem }: ItemModuleProps) {
    const { item, x, y } = placedItem;
    const { consume } = useInventoryStore();

    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: item.id,
        data: { item, fromX: x, fromY: y },
    });

    const handleDoubleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        consume(item.id);
    };

    const style = {
        // Grid positioning
        left: x * DESIGN.layout.slotSize,
        top: y * DESIGN.layout.slotSize,
        width: item.width * DESIGN.layout.slotSize,
        height: item.height * DESIGN.layout.slotSize,

        // Drag transform priority
        transform: CSS.Translate.toString(transform),

        // Type-specific color var for CSS
        '--item-color':
            item.type === 'resource' ? DESIGN.colors.accent.green :
                item.type === 'buff' ? DESIGN.colors.state.rare :
                    item.type === 'parasite' ? DESIGN.colors.state.danger :
                        DESIGN.colors.bg.surface,

        zIndex: isDragging ? 100 : 10,
        cursor: isDragging ? 'grabbing' : 'grab',
    } as React.CSSProperties;

    return (
        <motion.div
            ref={setNodeRef}
            style={style}
            onDoubleClick={handleDoubleClick}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: isDragging ? 0.8 : 1, scale: isDragging ? 1.05 : 1 }}
            exit={{ opacity: 0, scale: 0.5, filter: 'blur(4px)' }}
            transition={{ duration: 0.2 }}
            {...listeners}
            {...attributes}
            className={`item-module item-type-${item.type}`}
        >
            {/* Visual Content based on type */}
            {item.type === 'resource' && (
                <div className="item-content-resource">
                    <div className="item-fill" />
                    <div className="item-glass-glare" />
                </div>
            )}

            <div className="absolute inset-2 flex flex-col justify-center items-center pointer-events-none">
                <span className="text-[10px] font-bold tracking-tight text-white/80 drop-shadow-md text-center leading-tight">
                    {item.name.toUpperCase()}
                </span>
                {item.stackable && (
                    <span className="mt-1 text-[9px] text-white/50 bg-black/40 px-1 rounded">
                        x1
                    </span>
                )}
            </div>
        </motion.div>
    );
}
