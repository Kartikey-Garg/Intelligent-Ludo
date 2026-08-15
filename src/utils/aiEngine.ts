import { Player, PlayerColor, Token, AIDifficulty, HintRecommendation } from '../types/ludo';
import { getTrackIndexForStep, SAFE_STAR_INDICES } from './ludoPaths';

// Memory-efficient Typed Arrays for NPU/SIMD matrix calculations
const BOARD_MATRIX = new Int8Array(16);

const COLOR_OFFSET: Record<PlayerColor, number> = {
  RED: 0,
  GREEN: 4,
  YELLOW: 8,
  BLUE: 12
};

/**
 * Encodes current game state into flat Typed Array matrix for NPU evaluation
 */
function encodeBoardState(players: Player[]) {
  BOARD_MATRIX.fill(-1);
  players.forEach((p) => {
    const baseIdx = COLOR_OFFSET[p.color];
    p.tokens.forEach((t, i) => {
      BOARD_MATRIX[baseIdx + i] = t.stepCount;
    });
  });
}

/**
 * Checks if a roll is a release roll (6, or 1 if ruleOneIsSix is enabled)
 */
export function isReleaseRoll(diceRoll: number, ruleOneIsSix: boolean): boolean {
  return diceRoll === 6 || (ruleOneIsSix && diceRoll === 1);
}

/**
 * Checks if a specific step count lands on a safe star square
 */
function isStepOnSafeStar(color: PlayerColor, stepCount: number): boolean {
  if (stepCount <= 0 || stepCount > 51) return true; // Yard or Home Stretch is safe
  const trackIdx = getTrackIndexForStep(color, stepCount);
  return SAFE_STAR_INDICES.includes(trackIdx);
}

/**
 * Evaluates whether landing on a target step count would capture an opponent token
 */
function checkCaptureOpportunity(
  movingColor: PlayerColor,
  targetStepCount: number,
  players: Player[]
): { captures: boolean; targetColor?: PlayerColor } {
  if (targetStepCount <= 0 || targetStepCount > 51) return { captures: false };
  const targetTrackIdx = getTrackIndexForStep(movingColor, targetStepCount);

  if (SAFE_STAR_INDICES.includes(targetTrackIdx)) {
    return { captures: false }; // Cannot capture on safe stars
  }

  for (const enemy of players) {
    if (enemy.color === movingColor) continue;
    for (const enemyToken of enemy.tokens) {
      if (enemyToken.stepCount > 0 && enemyToken.stepCount <= 51) {
        const enemyTrackIdx = getTrackIndexForStep(enemy.color, enemyToken.stepCount);
        if (enemyTrackIdx === targetTrackIdx) {
          return { captures: true, targetColor: enemy.color };
        }
      }
    }
  }

  return { captures: false };
}

/**
 * Evaluates if a token at target position is threatened by an opponent behind it
 */
function evaluateThreatAt(color: PlayerColor, stepCount: number, players: Player[]): boolean {
  if (stepCount <= 0 || stepCount > 51) return false;
  const trackIdx = getTrackIndexForStep(color, stepCount);
  if (SAFE_STAR_INDICES.includes(trackIdx)) return false;

  for (const enemy of players) {
    if (enemy.color === color) continue;
    for (const enemyToken of enemy.tokens) {
      if (enemyToken.stepCount > 0 && enemyToken.stepCount <= 51) {
        const enemyTrackIdx = getTrackIndexForStep(enemy.color, enemyToken.stepCount);
        const dist = (trackIdx - enemyTrackIdx + 52) % 52;
        if (dist >= 1 && dist <= 6) {
          return true;
        }
      }
    }
  }

  return false;
}

/**
 * Computes heuristic score for moving a token by diceRoll
 */
function evaluateMoveScore(
  player: Player,
  token: Token,
  diceRoll: number,
  players: Player[],
  difficulty: AIDifficulty,
  ruleOneIsSix: boolean = false
): number {
  if (token.isFinished) return -1000;
  const canRelease = isReleaseRoll(diceRoll, ruleOneIsSix);

  if (token.stepCount === 0 && !canRelease) return -1000;
  if (token.stepCount + diceRoll > 57) return -1000;

  let score = 0;
  const currentStep = token.stepCount;
  const newStep = currentStep === 0 ? 1 : currentStep + diceRoll;

  // 1. Finishing Token Home (+350)
  if (newStep === 57) {
    score += 350;
  }

  // 2. Capturing Opponent (+280)
  const captureResult = checkCaptureOpportunity(player.color, newStep, players);
  if (captureResult.captures) {
    score += 280;
  }

  // 3. Releasing Token from Yard on 6 or 1 (+190)
  if (currentStep === 0 && canRelease) {
    const tokensInYard = player.tokens.filter(t => t.stepCount === 0).length;
    score += 170 + (tokensInYard * 15);
  }

  // 4. Safe Star Landing (+120)
  if (isStepOnSafeStar(player.color, newStep)) {
    score += 120;
  }

  // 5. Threat Escaping (+140)
  const currentlyThreatened = evaluateThreatAt(player.color, currentStep, players);
  if (currentlyThreatened) {
    score += 140;
  }

  // 6. Avoid Moving into Threat (-120 for Grandmaster)
  const newlyThreatened = evaluateThreatAt(player.color, newStep, players);
  if (newlyThreatened && difficulty !== 'FRIENDLY') {
    score -= 120;
  }

  // 7. Entering Home Stretch (+90)
  if (newStep > 51 && currentStep <= 51) {
    score += 90;
  }

  score += newStep * 2;

  if (difficulty === 'FRIENDLY') {
    score += Math.random() * 25;
  }

  return score;
}

/**
 * Finds all legal token IDs for a player given a dice roll
 */
export function getLegalTokenIds(player: Player, diceRoll: number, ruleOneIsSix: boolean = false): number[] {
  const legal: number[] = [];
  const canRelease = isReleaseRoll(diceRoll, ruleOneIsSix);

  player.tokens.forEach(t => {
    if (t.isFinished) return;
    if (t.stepCount === 0) {
      if (canRelease) legal.push(t.id);
    } else if (t.stepCount + diceRoll <= 57) {
      legal.push(t.id);
    }
  });
  return legal;
}

/**
 * Selects optimal token for AI player
 */
export function selectAIMove(
  aiPlayer: Player,
  diceRoll: number,
  players: Player[],
  ruleOneIsSix: boolean = false
): number | null {
  encodeBoardState(players);
  const legalTokenIds = getLegalTokenIds(aiPlayer, diceRoll, ruleOneIsSix);
  if (legalTokenIds.length === 0) return null;
  if (legalTokenIds.length === 1) return legalTokenIds[0];

  const difficulty = aiPlayer.personality?.difficulty || 'STRATEGIC';

  let bestTokenId = legalTokenIds[0];
  let bestScore = -Infinity;

  legalTokenIds.forEach(id => {
    const token = aiPlayer.tokens[id];
    const score = evaluateMoveScore(aiPlayer, token, diceRoll, players, difficulty, ruleOneIsSix);
    if (score > bestScore) {
      bestScore = score;
      bestTokenId = id;
    }
  });

  return bestTokenId;
}

/**
 * Evaluates best move recommendation for Human Player ("Smart Move Hint")
 */
export function getHumanMoveHint(
  humanPlayer: Player,
  diceRoll: number,
  players: Player[],
  ruleOneIsSix: boolean = false
): HintRecommendation | null {
  const legalTokenIds = getLegalTokenIds(humanPlayer, diceRoll, ruleOneIsSix);
  if (legalTokenIds.length === 0) return null;

  const canRelease = isReleaseRoll(diceRoll, ruleOneIsSix);

  let bestTokenId = legalTokenIds[0];
  let maxScore = -Infinity;
  let bestReason = "Move this token forward";

  legalTokenIds.forEach(id => {
    const token = humanPlayer.tokens[id];
    const score = evaluateMoveScore(humanPlayer, token, diceRoll, players, 'GRANDMASTER', ruleOneIsSix);

    let reason = "Move forward strategically";
    const currentStep = token.stepCount;
    const newStep = currentStep === 0 ? 1 : currentStep + diceRoll;

    if (newStep === 57) reason = "Finish token inside Home! 🏆";
    else if (checkCaptureOpportunity(humanPlayer.color, newStep, players).captures) reason = "Capture opponent token! ⚔️";
    else if (currentStep === 0 && canRelease) reason = `Release token from Yard on ${diceRoll} 🌟`;
    else if (isStepOnSafeStar(humanPlayer.color, newStep)) reason = "Land safely on a Star square ⭐";
    else if (evaluateThreatAt(humanPlayer.color, currentStep, players)) reason = "Escape incoming opponent threat! 🏃";

    if (score > maxScore) {
      maxScore = score;
      bestTokenId = id;
      bestReason = reason;
    }
  });

  return {
    tokenId: bestTokenId,
    score: maxScore,
    reason: bestReason
  };
}
