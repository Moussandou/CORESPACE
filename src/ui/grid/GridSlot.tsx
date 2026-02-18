import { DESIGN } from '@/config/design-tokens';
import { motion } from 'framer-motion';

interface GridSlotProps {
    x: number;
    y: number;
    isOccupied: boolean;
    isHovered?: boolean;
}

export function GridSlot({ x, y, isOccupied }: GridSlotProps) {
    return (
        <div
            className="relative flex items-center justify-center overflow-hidden"
            style={{
                width: DESIGN.layout.slotSize,
                height: DESIGN.layout.slotSize,
                background: isOccupied ? DESIGN.textures.slotOccupied : DESIGN.textures.slotEmpty,
                borderRight: `1px solid ${DESIGN.colors.grid.line}`,
                borderBottom: `1px solid ${DESIGN.colors.grid.line}`,
                // Border Top/Left handled by container properties or specific logic if needed, 
                // but simple right/bottom usually suffices for internal grid.
            }}
            data-grid-x={x}
            data-grid-y={y}
        >
            {/* Croix "X" subtile dans les slots vides (Style Resident Evil) */}
            {!isOccupied && (
                <svg
                    width="100%"
                    height="100%"
                    viewBox="0 0 72 72"
                    className="pointer-events-none opacity-20"
                >
                    {/* Center Crosshair small */}
                    <path d="M32 36H40M36 32V40" stroke="white" strokeWidth="0.5" opacity="0.5" />
                    {/* Diagonal full X (optional, maybe too busy? keeping it simple for now) */}
                </svg>
            )}

            {/* Coordonnées très discrètes */}
            <span
                className="absolute bottom-0.5 right-1 text-[8px] font-mono select-none pointer-events-none"
                style={{ color: 'rgba(255,255,255,0.1)' }}
            >
                {String.fromCharCode(65 + y)}{x + 1}
            </span>
        </div>
    );
}
