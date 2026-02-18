import { forwardRef } from 'react';
import { useDraggable } from '@dnd-kit/core';
import type { Item, PlacedItem } from '@/types';
import { DESIGN } from '@/config/design-tokens';
import { SLOT_SIZE_PX } from '@/config/constants';
import { useInventoryStore } from '@/stores/inventory-store';
import { CSS } from '@dnd-kit/utilities';
import { motion } from 'framer-motion';
import './items.css';

// --- Visual Component (Presentation) ---

interface ItemModuleVisualProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onDrag' | 'onDragStart' | 'onDragEnd' | 'onAnimationStart' | 'onAnimationEnd'> {
    item: Item;
    isDragging?: boolean;
    style?: React.CSSProperties;
}

export const ItemModuleVisual = forwardRef<HTMLDivElement, ItemModuleVisualProps>(
    ({ item, isDragging, style, className, ...props }, ref) => {
        const computedStyle = {
            ...style,
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
                ref={ref}
                style={computedStyle}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: isDragging ? 0.8 : 1, scale: isDragging ? 1.05 : 1 }}
                exit={{ opacity: 0, scale: 0.5, filter: 'blur(4px)' }}
                transition={{ duration: 0.2 }}
                className={`item-module item-type-${item.type} ${className || ''}`}
                {...props}
            >
                {item.type === 'resource' && (
                    <div className="item-content-resource">
                        <div className="item-fill" />
                        <div className="item-glass-glare" />
                    </div>
                )}

                <div className="absolute inset-1 sm:inset-2 flex flex-col justify-center items-center pointer-events-none">
                    <span className="text-[8px] sm:text-[10px] font-bold tracking-tight text-white/80 drop-shadow-md text-center leading-tight">
                        {item.name.toUpperCase()}
                    </span>
                    {item.stackable && (
                        <span className="mt-0.5 text-[7px] sm:text-[9px] text-white/50 bg-black/40 px-1 rounded">
                            x1
                        </span>
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
        id: isSidebar ? `new-${item.id}` : item.id,
        data: { item, fromX: x, fromY: y, isNew: isSidebar },
    });

    const handleDoubleClick = (e: React.MouseEvent) => {
        if (isSidebar) return;
        e.stopPropagation();
        consume(item.id);
    };

    const style = {
        ...(isSidebar ? {} : {
            left: x * size,
            top: y * size,
            position: 'absolute',
        }),
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
            onDoubleClick={handleDoubleClick}
            {...listeners}
            {...attributes}
        />
    );
}
