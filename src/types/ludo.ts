export type PlayerColor = 'RED' | 'GREEN' | 'YELLOW' | 'BLUE';

export type PlayerType = 'HUMAN' | 'AI';

export type AIDifficulty = 'GRANDMASTER' | 'STRATEGIC' | 'FRIENDLY';

export type ThemeMode = 'DARK' | 'LIGHT';

export interface AIPersonality {
  id: string;
  name: string;
  avatar: string;
  title: string;
  greeting: string;
  difficulty: AIDifficulty;
}

export interface Token {
  id: number; // 0..3 per player
  color: PlayerColor;
  position: number; // -1: Yard, 0..51: Track cell, 52..56: Home path (1..5), 57: Finished Home
  stepCount: number; // Total steps moved along the path (0..57)
  isFinished: boolean;
}

export interface Player {
  color: PlayerColor;
  name: string;
  type: PlayerType;
  personality?: AIPersonality;
  tokens: Token[];
  hasWon: boolean;
  rank?: number;
  sixCount: number; // consecutive bonus rolls counter
}

export interface GameSettings {
  playerCount: 2 | 3 | 4;
  humanPlayerCount: 1 | 2 | 3 | 4;
  aiPlayerCount: 0 | 1 | 2 | 3;
  humanColor: PlayerColor;
  aiDifficulties: Record<PlayerColor, AIDifficulty>;
  gameSpeed: 'RELAXED' | 'NORMAL' | 'FAST'; // Delay in ms
  enableAudio: boolean;
  enableVoice: boolean;
  autoRoll: boolean;
  theme: ThemeMode;
  ruleOneIsSix: boolean; // House rule: 1 opens token & grants extra turn like 6
}

export interface GameLogEntry {
  id: string;
  timestamp: string;
  color: PlayerColor;
  playerName: string;
  message: string;
  type: 'ROLL' | 'MOVE' | 'CAPTURE' | 'HOME' | 'BANTER' | 'SYSTEM';
}

export type GamePhase = 'SETUP' | 'ROLLING' | 'MOVING' | 'ANIMATING' | 'GAME_OVER';

export interface HintRecommendation {
  tokenId: number;
  score: number;
  reason: string;
}
