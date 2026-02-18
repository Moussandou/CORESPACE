/**
 * CORESPACE Design Reference (CDC §12-23 + User Feedback "Mallette/Briefcase")
 * Centralizes all visual constants for consistency.
 */

export const DESIGN = {
    colors: {
        bg: {
            deep: '#05070a',             // Noir très profond
            surface: '#0f1219',          // Fond mallette
            glass: 'rgba(15, 18, 25, 0.85)', // Glassmorphism container
        },
        accent: {
            green: '#4ade80',            // Vert laser (sélection)
            amber: '#fbbf24',            // Attention
        },
        grid: {
            line: 'rgba(255, 255, 255, 0.08)', // Lignes très fines
            crosshair: 'rgba(255, 255, 255, 0.05)', // Croix dans les slots vides
        },
        state: {
            danger: '#ef4444',
            rare: '#f59e0b',
        },
    },

    textures: {
        // Fond mallette : texture bruitée subtile + vignette
        briefcase: `
      radial-gradient(circle at center, rgba(30, 35, 45, 1) 0%, rgba(10, 12, 16, 1) 100%)
    `,
        // Slot vide : juste les lignes, pas de fond plein
        slotEmpty: 'transparent',

        // Slot occupé : fond sombre translucide
        slotOccupied: 'rgba(255, 255, 255, 0.03)',
    },

    anims: {
        hover: { scale: 1.02, transition: { duration: 0.2 } },
        tap: { scale: 0.98 },
        snap: { scale: [1.05, 1], transition: { type: "spring", stiffness: 300, damping: 20 } },
    },

    layout: {
        slotSize: 72, // px
        gap: 2,       // px (très serré pour effet grille unifiée)
        radius: '2px', // Coins quasi vifs
    },
} as const;
