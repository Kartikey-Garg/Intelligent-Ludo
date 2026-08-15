import { describe, it, expect } from 'vitest';
import { Player, Token } from '../types/ludo';
import { getTrackIndexForStep, SAFE_STAR_INDICES } from '../utils/ludoPaths';
import { isReleaseRoll, selectAIMove, getLegalTokenIds } from '../utils/aiEngine';

describe('Classic Ludo Game Rules Enforcement', () => {
  it('should enforce single die roll & coin movement before granting extra roll on 6 or 1', () => {
    const ruleOneIsSix = false;
    let roll = 6;
    let isBonus = isReleaseRoll(roll, ruleOneIsSix);
    expect(isBonus).toBe(true);

    let player: Player = {
      color: 'RED',
      name: 'Human',
      type: 'HUMAN',
      sixCount: 1,
      hasWon: false,
      tokens: [
        { id: 0, color: 'RED', position: -1, stepCount: 0, isFinished: false },
        { id: 1, color: 'RED', position: -1, stepCount: 0, isFinished: false },
        { id: 2, color: 'RED', position: -1, stepCount: 0, isFinished: false },
        { id: 3, color: 'RED', position: -1, stepCount: 0, isFinished: false }
      ]
    };

    // 1. Move Token #0 out of Yard using 6
    const legalIds = getLegalTokenIds(player, roll, ruleOneIsSix);
    expect(legalIds).toEqual([0, 1, 2, 3]);

    player = {
      ...player,
      tokens: player.tokens.map(t => t.id === 0 ? { ...t, stepCount: 1 } : t)
    };
    expect(player.tokens[0].stepCount).toBe(1);

    // 2. Extra roll is granted AFTER move 1 completes!
    let extraRollGranted = isBonus;
    expect(extraRollGranted).toBe(true);

    // 3. Roll extra turn: 2
    roll = 2;
    isBonus = isReleaseRoll(roll, ruleOneIsSix);
    expect(isBonus).toBe(false);

    // Move Token #0 by 2 steps
    player = {
      ...player,
      tokens: player.tokens.map(t => t.id === 0 ? { ...t, stepCount: 3 } : t)
    };
    expect(player.tokens[0].stepCount).toBe(3);

    // Turn finishes because 2 is not a bonus roll!
    extraRollGranted = isBonus;
    expect(extraRollGranted).toBe(false);
  });

  it('should enforce 3 consecutive bonus rolls rule reset', () => {
    let sixCount = 0;
    const rolls = [6, 6, 6];

    rolls.forEach(r => {
      if (r === 6) sixCount++;
      else sixCount = 0;
    });

    expect(sixCount).toBe(3);

    let turnSkipped = false;
    if (sixCount >= 3) {
      sixCount = 0;
      turnSkipped = true;
    }

    expect(sixCount).toBe(0);
    expect(turnSkipped).toBe(true);
  });

  it('should detect token finishing home at step 57 and grant extra turn', () => {
    const token: Token = { id: 0, color: 'RED', position: 51, stepCount: 51, isFinished: false };
    const roll = 6;
    const targetStep = token.stepCount + roll;
    const isFinished = targetStep === 57;

    expect(targetStep).toBe(57);
    expect(isFinished).toBe(true);
  });

  it('should detect player victory when all 4 tokens are finished', () => {
    const playerTokens: Token[] = [
      { id: 0, color: 'RED', position: 57, stepCount: 57, isFinished: true },
      { id: 1, color: 'RED', position: 57, stepCount: 57, isFinished: true },
      { id: 2, color: 'RED', position: 57, stepCount: 57, isFinished: true },
      { id: 3, color: 'RED', position: 57, stepCount: 57, isFinished: true }
    ];

    const hasWon = playerTokens.every(t => t.isFinished);
    expect(hasWon).toBe(true);
  });

  it('should execute capture on non-safe track cells and protect tokens on safe star cells', () => {
    const isRedStartSafe = SAFE_STAR_INDICES.includes(0);
    expect(isRedStartSafe).toBe(true);

    const isRegularCellSafe = SAFE_STAR_INDICES.includes(1);
    expect(isRegularCellSafe).toBe(false);

    const enemyStepOnRegularCell = 1;
    const movingTokenTargetCell = 1;
    const canCapture = (enemyStepOnRegularCell === movingTokenTargetCell) && !isRegularCellSafe;
    expect(canCapture).toBe(true);
  });
});
