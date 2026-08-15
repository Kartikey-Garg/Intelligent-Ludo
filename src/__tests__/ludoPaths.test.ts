import { describe, it, expect } from 'vitest';
import {
  getTrackIndexForStep,
  getTokenGridCoord,
  SAFE_STAR_INDICES,
  START_TRACK_INDEX,
  TRACK_52
} from '../utils/ludoPaths';

describe('Ludo Paths & Coordinate Calculations', () => {
  it('should return correct start track indices for all 4 colors', () => {
    expect(START_TRACK_INDEX.RED).toBe(0);
    expect(START_TRACK_INDEX.GREEN).toBe(13);
    expect(START_TRACK_INDEX.YELLOW).toBe(26);
    expect(START_TRACK_INDEX.BLUE).toBe(39);
  });

  it('should accurately calculate track indices for steps 1..51', () => {
    // Red step 1 is index 0
    expect(getTrackIndexForStep('RED', 1)).toBe(0);
    // Red step 51 is index 50
    expect(getTrackIndexForStep('RED', 51)).toBe(50);

    // Green step 1 is index 13
    expect(getTrackIndexForStep('GREEN', 1)).toBe(13);
    // Green step 51 is index (13 + 51 - 1) % 52 = 63 % 52 = 11
    expect(getTrackIndexForStep('GREEN', 51)).toBe(11);
  });

  it('should include all 8 safe star indices', () => {
    expect(SAFE_STAR_INDICES).toEqual([0, 8, 13, 21, 26, 34, 39, 47]);
  });

  it('should return valid grid coordinates within 0 to 14 bounds', () => {
    const redStartCoord = getTokenGridCoord('RED', 0, 1);
    expect(redStartCoord.x).toBeGreaterThanOrEqual(0);
    expect(redStartCoord.x).toBeLessThanOrEqual(14);
    expect(redStartCoord.y).toBeGreaterThanOrEqual(0);
    expect(redStartCoord.y).toBeLessThanOrEqual(14);

    const greenYardCoord = getTokenGridCoord('GREEN', 0, 0);
    expect(greenYardCoord.x).toBeGreaterThan(8);
    expect(greenYardCoord.y).toBeLessThan(6);
  });
});
