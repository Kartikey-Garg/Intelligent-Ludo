import { PlayerColor } from '../types/ludo';

export interface GridCoord {
  x: number; // 0 to 14
  y: number; // 0 to 14
}

// 52 Outer Track cell coordinates mapped on a 15x15 Ludo grid
// Grid 0,0 is top-left, 14,14 is bottom-right.
export const OUTER_TRACK_COORDS: GridCoord[] = [
  // 0..5 (Red start stretch going right)
  { x: 1, y: 6 }, { x: 2, y: 6 }, { x: 3, y: 6 }, { x: 4, y: 6 }, { x: 5, y: 6 },
  // 5..10 (Going up towards green)
  { x: 6, y: 5 }, { x: 6, y: 4 }, { x: 6, y: 3 }, { x: 6, y: 2 }, { x: 6, y: 1 }, { x: 6, y: 0 },
  // 11..12 (Top turn)
  { x: 7, y: 0 }, { x: 8, y: 0 },
  // 13..18 (Green start stretch going down)
  { x: 8, y: 1 }, { x: 8, y: 2 }, { x: 8, y: 3 }, { x: 8, y: 4 }, { x: 8, y: 5 },
  // 19..23 (Going right towards yellow)
  { x: 9, y: 6 }, { x: 10, y: 6 }, { x: 11, y: 6 }, { x: 12, y: 6 }, { x: 13, y: 6 }, { x: 14, y: 6 },
  // 24..25 (Right turn)
  { x: 14, y: 7 }, { x: 14, y: 8 },
  // 26..31 (Yellow start stretch going left)
  { x: 13, y: 8 }, { x: 12, y: 8 }, { x: 11, y: 8 }, { x: 10, y: 8 }, { x: 9, y: 8 },
  // 32..36 (Going down towards blue)
  { x: 8, y: 9 }, { x: 8, y: 10 }, { x: 8, y: 11 }, { x: 8, y: 12 }, { x: 8, y: 13 }, { x: 8, y: 14 },
  // 37..38 (Bottom turn)
  { x: 7, y: 14 }, { x: 6, y: 14 },
  // 39..44 (Blue start stretch going up)
  { x: 6, y: 13 }, { x: 6, y: 12 }, { x: 6, y: 11 }, { x: 6, y: 10 }, { x: 6, y: 9 },
  // 45..50 (Going left towards red)
  { x: 5, y: 8 }, { x: 4, y: 8 }, { x: 3, y: 8 }, { x: 2, y: 8 }, { x: 1, y: 8 }, { x: 0, y: 8 },
  // 51 (Left turn back to 0)
  { x: 0, y: 7 }, { x: 0, y: 6 }
];

// Re-adjust exact length to 52 elements
export const TRACK_52: GridCoord[] = OUTER_TRACK_COORDS.slice(0, 52);

// Starting index on outer track for each color
export const START_TRACK_INDEX: Record<PlayerColor, number> = {
  RED: 0,
  GREEN: 13,
  YELLOW: 26,
  BLUE: 39
};

// Safe star cells (indices on outer track)
// Includes the 4 start cells (0, 13, 26, 39) + 4 star safe cells (8, 21, 34, 47)
export const SAFE_STAR_INDICES: number[] = [0, 8, 13, 21, 26, 34, 39, 47];

// Home path coordinates (5 squares each leading to center 7,7)
export const HOME_STRETCH_COORDS: Record<PlayerColor, GridCoord[]> = {
  RED: [
    { x: 1, y: 7 }, { x: 2, y: 7 }, { x: 3, y: 7 }, { x: 4, y: 7 }, { x: 5, y: 7 }
  ],
  GREEN: [
    { x: 7, y: 1 }, { x: 7, y: 2 }, { x: 7, y: 3 }, { x: 7, y: 4 }, { x: 7, y: 5 }
  ],
  YELLOW: [
    { x: 13, y: 7 }, { x: 12, y: 7 }, { x: 11, y: 7 }, { x: 10, y: 7 }, { x: 9, y: 7 }
  ],
  BLUE: [
    { x: 7, y: 13 }, { x: 7, y: 12 }, { x: 7, y: 11 }, { x: 7, y: 10 }, { x: 7, y: 9 }
  ]
};

// Home Center coordinate
export const HOME_CENTER: Record<PlayerColor, GridCoord> = {
  RED: { x: 6.2, y: 7 },
  GREEN: { x: 7, y: 6.2 },
  YELLOW: { x: 7.8, y: 7 },
  BLUE: { x: 7, y: 7.8 }
};

// Yard positions for each of 4 tokens per color
export const YARD_COORDS: Record<PlayerColor, GridCoord[]> = {
  RED: [
    { x: 1.5, y: 1.5 }, { x: 3.5, y: 1.5 },
    { x: 1.5, y: 3.5 }, { x: 3.5, y: 3.5 }
  ],
  GREEN: [
    { x: 10.5, y: 1.5 }, { x: 12.5, y: 1.5 },
    { x: 10.5, y: 3.5 }, { x: 12.5, y: 3.5 }
  ],
  YELLOW: [
    { x: 10.5, y: 10.5 }, { x: 12.5, y: 10.5 },
    { x: 10.5, y: 12.5 }, { x: 12.5, y: 12.5 }
  ],
  BLUE: [
    { x: 1.5, y: 10.5 }, { x: 3.5, y: 10.5 },
    { x: 1.5, y: 12.5 }, { x: 3.5, y: 12.5 }
  ]
};

/**
 * Calculates absolute board track index for a given step count (0 to 56) for a player.
 * Step 0: Yard (-1)
 * Step 1..51: Track cell (offset by start index)
 * Step 52..56: Home stretch (1..5)
 * Step 57: Finished Home
 */
export function getTrackIndexForStep(color: PlayerColor, stepCount: number): number {
  if (stepCount <= 0) return -1; // Yard
  if (stepCount > 51) return 100 + (stepCount - 51); // Home stretch indicator
  const startIndex = START_TRACK_INDEX[color];
  return (startIndex + stepCount - 1) % 52;
}

/**
 * Gets exact 2D Grid Coordinate (x, y) for a token given step count and token ID
 */
export function getTokenGridCoord(color: PlayerColor, tokenId: number, stepCount: number): GridCoord {
  if (stepCount <= 0) {
    return YARD_COORDS[color][tokenId];
  }
  if (stepCount >= 57) {
    return HOME_CENTER[color];
  }
  if (stepCount > 51) {
    const stretchIndex = stepCount - 52; // 0 to 4
    return HOME_STRETCH_COORDS[color][stretchIndex];
  }
  const trackIdx = getTrackIndexForStep(color, stepCount);
  return TRACK_52[trackIdx];
}
