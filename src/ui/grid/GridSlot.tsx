import { DESIGN } from '@/config/design-tokens';

interface GridSlotProps {
    x: number;
    y: number;
    isOccupied: boolean;
    slotSize: number;
}

export function GridSlot({ x, y, isOccupied, slotSize }: GridSlotProps) {
    return (
        <div
            className="relative flex items-center justify-center overflow-hidden"
            style={{
                width: slotSize,
                height: slotSize,
                background: isOccupied ? DESIGN.textures.slotOccupied : DESIGN.textures.slotEmpty,
                borderRight: `1px solid ${DESIGN.colors.grid.line}`,
                borderBottom: `1px solid ${DESIGN.colors.grid.line}`,
            }}
            data-grid-x={x}
            data-grid-y={y}
        >
            {/* Center Crosshair */}
            {!isOccupied && (
                <svg
                    width="100%"
                    height="100%"
                    viewBox={`0 0 ${slotSize} ${slotSize}`}
                    className="pointer-events-none opacity-20"
                >
                    <path
                        d={`M${slotSize * 0.44} ${slotSize * 0.5}H${slotSize * 0.56}M${slotSize * 0.5} ${slotSize * 0.44}V${slotSize * 0.56}`}
                        stroke="white"
                        strokeWidth="0.5"
                        opacity="0.5"
                    />
                </svg>
            )}

            {/* Coordinates (hide on small slots) */}
            {slotSize >= 56 && (
                <span
                    className="absolute bottom-0.5 right-1 text-[8px] font-mono select-none pointer-events-none"
                    style={{ color: 'rgba(255,255,255,0.1)' }}
                >
                    {String.fromCharCode(65 + y)}{x + 1}
                </span>
            )}
        </div>
    );
}
