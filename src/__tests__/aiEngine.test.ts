import { describe, it, expect } from 'vitest';
import {
  isReleaseRoll,
  getLegalTokenIds,
  selectAIMove,
  getHumanMoveHint
} from '../utils/aiEngine';
import { Player, Token } from '../types/ludo';

describe('AI Decision Engine & Hint Calculator', () => {
  it('should evaluate release rolls correctly based on ruleOneIsSix flag', () => {
    expect(isReleaseRoll(6, false)).toBe(true);
    expect(isReleaseRoll(1, false)).toBe(false);
    expect(isReleaseRoll(1, true)).toBe(true);
    expect(isReleaseRoll(4, true)).toBe(false);
  });

  it('should find legal tokens for yard and track tokens', () => {
    const mockPlayer: Player = {
      color: 'RED',
      name: 'Test Red',
      type: 'AI',
      sixCount: 0,
      hasWon: false,
      tokens: [
        { id: 0, color: 'RED', position: -1, stepCount: 0, isFinished: false }, // In Yard
        { id: 1, color: 'RED', position: 10, stepCount: 10, isFinished: false }, // On Track
        { id: 2, color: 'RED', position: 55, stepCount: 55, isFinished: false }, // Near Home (55+4 = 59 > 57 illegal)
        { id: 3, color: 'RED', position: 57, stepCount: 57, isFinished: true }  // Finished
      ]
    };

    // Roll 4 (cannot release yard token #0, cannot over-roll #2, can move #1)
    const legalFor4 = getLegalTokenIds(mockPlayer, 4, false);
    expect(legalFor4).toEqual([1]);

    // Roll 6 (can release yard token #0, can move #1)
    const legalFor6 = getLegalTokenIds(mockPlayer, 6, false);
    expect(legalFor6).toEqual([0, 1]);
  });

  it('should prioritize capturing an opponent token over standard move', () => {
    // Red token at step 5 (track idx 4).
    // Green token at step 40 (track idx 51).
    // Red rolls 4 -> step 5 + 4 = 9 (track idx 8 is safe star - no capture).
    // If enemy is at track idx 8 - no capture on safe star.
    // If enemy is at track idx 7 (non-safe) -> Red step 5 + 3 = 8 (track idx 7) -> CAPTURE!

    const redPlayer: Player = {
      color: 'RED',
      name: 'Red AI',
      type: 'AI',
      sixCount: 0,
      hasWon: false,
      tokens: [
        { id: 0, color: 'RED', position: 5, stepCount: 5, isFinished: false },
        { id: 1, color: 'RED', position: 20, stepCount: 20, isFinished: false }
      ]
    };

    const greenPlayer: Player = {
      color: 'GREEN',
      name: 'Green Enemy',
      type: 'AI',
      sixCount: 0,
      hasWon: false,
      tokens: [
        // Green start is 13. Step count 47 -> (13 + 47 - 1) % 52 = 7 (same as Red step 8 = 0 + 8 - 1 = 7)
        { id: 0, color: 'GREEN', position: 47, stepCount: 47, isFinished: false }
      ]
    };

    // Red rolls 3: moving Token #0 lands on step 8 (track idx 7) -> captures Green #0!
    const bestMoveTokenId = selectAIMove(redPlayer, 3, [redPlayer, greenPlayer], false);
    expect(bestMoveTokenId).toBe(0);
  });

  it('should generate intelligent move hints for human players', () => {
    const humanPlayer: Player = {
      color: 'RED',
      name: 'Human',
      type: 'HUMAN',
      sixCount: 0,
      hasWon: false,
      tokens: [
        { id: 0, color: 'RED', position: 55, stepCount: 55, isFinished: false }, // Can finish home on 2!
        { id: 1, color: 'RED', position: 10, stepCount: 10, isFinished: false }
      ]
    };

    const hint = getHumanMoveHint(humanPlayer, 2, [humanPlayer], false);
    expect(hint).not.toBeNull();
    expect(hint?.tokenId).toBe(0);
    expect(hint?.reason).toContain('Finish token inside Home');
  });
});
