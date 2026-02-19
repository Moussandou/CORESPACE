'use client';

import { forwardRef } from 'react';
import { useDraggable } from '@dnd-kit/core';
import type { Item, PlacedItem } from '@/types';
import { DESIGN } from '@/config/design-tokens';
import { SLOT_SIZE_PX } from '@/config/constants';
import { useInventoryStore } from '@/stores/inventory-store';
import { CSS } from '@dnd-kit/utilities';
import { motion, HTMLMotionProps } from 'framer-motion';
import './items.css';

// --- Visual Component (Presentation) ---

interface ItemModuleVisualProps extends HTMLMotionProps<"div"> {
    item: Item;
    isDragging?: boolean;
    style?: React.CSSProperties;
    slotSize?: number;
}

export const ItemModuleVisual = forwardRef<HTMLDivElement, ItemModuleVisualProps>(
    ({ item, isDragging, style, className, slotSize, ...props }, ref) => {
        const computedStyle = {
            ...style,
            '--item-color':
                item.type === 'resource' ? DESIGN.colors.accent.green :
                    item.type === 'buff' ? DESIGN.colors.state.rare :
                        item.type === 'parasite' ? DESIGN.colors.state.danger :
                            item.type === 'task' ? DESIGN.colors.accent.blue :
                                DESIGN.colors.bg.surface,
            zIndex: isDragging ? 100 : 10,
            cursor: isDragging ? 'grabbing' : 'grab',
        } as React.CSSProperties;

        return (
            <motion.div
                ref={ref}
                style={computedStyle}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: isDragging ? 0.8 : 1, scale: isDragging ? 1.05 : 1 }}
                exit={{ opacity: 0, scale: 0.5, filter: 'blur(4px)' }}
                transition={{ duration: 0.2 }}
                className={`item-module item-type-${item.type} ${className || ''}`}
                {...props}
            >
                {/* Type-specific backgrounds */}
                {item.type === 'resource' && (
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
                )}
                {item.type === 'buff' && (
                    <div className="absolute inset-0 bg-gradient-to-t from-purple-500/20 to-transparent pointer-events-none" />
                )}

                <div className="absolute inset-1 sm:inset-2 flex flex-col justify-center items-center pointer-events-none z-20">
                    <span className="text-[8px] sm:text-[10px] font-bold tracking-tight text-white/90 drop-shadow-md text-center leading-tight">
                        {item.name}
                    </span>
                    {item.energyCost && (
                        <span className="mt-0.5 text-[7px] text-blue-200/80">-{item.energyCost}E</span>
                    )}
                </div>
            </motion.div>
        );
    }
);
ItemModuleVisual.displayName = 'ItemModuleVisual';

// --- Container Component (Logic) ---

interface ItemModuleProps {
    placedItem?: PlacedItem;
    item?: Item;
    isSidebar?: boolean;
    slotSize?: number;
}

export function ItemModule({ placedItem, item: itemProp, isSidebar, slotSize }: ItemModuleProps) {
    const item = placedItem?.item || itemProp!;
    const x = placedItem?.x ?? 0;
    const y = placedItem?.y ?? 0;
    const size = slotSize ?? SLOT_SIZE_PX;
    const { consume } = useInventoryStore();

    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: isSidebar ? `new-${item.id}` : placedItem!.id,
        data: { item, fromX: x, fromY: y, isNew: isSidebar },
    });

    const handleDoubleClick = (e: React.MouseEvent) => {
        if (isSidebar) return;
        e.stopPropagation();
        consume(item.id);
    };

    // Sidebar items shouldn't have absolute positioning here, handled by parent
    if (isSidebar) {
        return (
            <div ref={setNodeRef} {...listeners} {...attributes}>
                <ItemModuleVisual item={item} slotSize={size} />
            </div>
        )
    }

    const style = {
        left: x * size,
        top: y * size,
        position: 'absolute',
        width: item.width * size,
        height: item.height * size,
        transform: CSS.Translate.toString(transform),
    } as React.CSSProperties;

    return (
        <ItemModuleVisual
            ref={setNodeRef}
            item={item}
            isDragging={isDragging}
            style={style}
            slotSize={size}
            onDoubleClick={handleDoubleClick}
            {...listeners}
            {...attributes}
        />
    );
}
