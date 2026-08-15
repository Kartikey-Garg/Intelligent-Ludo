import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Player,
  PlayerColor,
  GameSettings,
  GameLogEntry,
  GamePhase,
  HintRecommendation
} from './types/ludo';
import { AI_PERSONALITIES, BANTER_RESPONSES, speakText } from './utils/aiCompanionData';
import { getLegalTokenIds, selectAIMove, getHumanMoveHint, isReleaseRoll } from './utils/aiEngine';
import { audioEngine } from './utils/audioEngine';
import { getTrackIndexForStep, SAFE_STAR_INDICES } from './utils/ludoPaths';

// Components
import { LudoBoardCanvas } from './components/LudoBoardCanvas';
import { Dice3D } from './components/Dice3D';
import { PlayerCard } from './components/PlayerCard';
import { CompanionBanter } from './components/CompanionBanter';
import { SetupModal } from './components/SetupModal';
import { VictoryModal } from './components/VictoryModal';
import { HeaderControls } from './components/HeaderControls';
import { RulesModal } from './components/RulesModal';

const ALL_COLORS: PlayerColor[] = ['RED', 'GREEN', 'YELLOW', 'BLUE'];

export function App() {
  const [isSetupOpen, setIsSetupOpen] = useState<boolean>(true);
  const [isRulesOpen, setIsRulesOpen] = useState<boolean>(false);
  const [settings, setSettings] = useState<GameSettings>({
    playerCount: 4,
    humanPlayerCount: 1,
    aiPlayerCount: 3,
    humanColor: 'RED',
    aiDifficulties: { RED: 'STRATEGIC', GREEN: 'STRATEGIC', YELLOW: 'GRANDMASTER', BLUE: 'FRIENDLY' },
    gameSpeed: 'NORMAL',
    enableAudio: true,
    enableVoice: true,
    autoRoll: false,
    theme: 'DARK',
    ruleOneIsSix: false
  });

  const [players, setPlayers] = useState<Player[]>([]);
  const [turnIndex, setTurnIndex] = useState<number>(0);
  const [diceRoll, setDiceRoll] = useState<number | null>(null);
  const [isRolling, setIsRolling] = useState<boolean>(false);
  const [phase, setPhase] = useState<GamePhase>('SETUP');
  const [movableTokenIds, setMovableTokenIds] = useState<number[]>([]);
  const [winner, setWinner] = useState<Player | null>(null);
  const [logs, setLogs] = useState<GameLogEntry[]>([]);
  const [latestBanter, setLatestBanter] = useState<string>('');
  const [hint, setHint] = useState<HintRecommendation | null>(null);

  const aiBusyRef = useRef<boolean>(false);

  // Sync Audio synthesizer mute state
  useEffect(() => {
    audioEngine.setMuted(!settings.enableAudio);
  }, [settings.enableAudio]);

  // Sync Body Theme Class (Light vs Dark mode)
  useEffect(() => {
    if (settings.theme === 'LIGHT') {
      document.body.classList.remove('theme-dark');
      document.body.classList.add('theme-light');
    } else {
      document.body.classList.remove('theme-light');
      document.body.classList.add('theme-dark');
    }
  }, [settings.theme]);

  const addLog = useCallback((color: PlayerColor, name: string, message: string, type: GameLogEntry['type']) => {
    const entry: GameLogEntry = {
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      color,
      playerName: name,
      message,
      type
    };
    setLogs(prev => [...prev.slice(-40), entry]);
  }, []);

  /**
   * Initializes match with chosen settings
   */
  const handleStartGame = (newSettings: GameSettings) => {
    setSettings(newSettings);

    let activeColors: PlayerColor[] = [];
    if (newSettings.playerCount === 2) {
      activeColors = [newSettings.humanColor, ALL_COLORS.find(c => c !== newSettings.humanColor) || 'GREEN'];
    } else if (newSettings.playerCount === 3) {
      activeColors = ALL_COLORS.slice(0, 3);
      if (!activeColors.includes(newSettings.humanColor)) {
        activeColors[0] = newSettings.humanColor;
      }
    } else {
      activeColors = [...ALL_COLORS];
    }

    const initPlayers: Player[] = activeColors.map((color, idx) => {
      const isHuman = idx < newSettings.humanPlayerCount;
      const personality = !isHuman ? AI_PERSONALITIES[color] : undefined;
      const name = isHuman
        ? (newSettings.humanPlayerCount > 1 ? `Player ${idx + 1} (${color})` : 'Human Player')
        : (personality?.name || `${color} Bot`);

      return {
        color,
        name,
        type: isHuman ? 'HUMAN' : 'AI',
        personality,
        tokens: [0, 1, 2, 3].map(id => ({ id, color, position: -1, stepCount: 0, isFinished: false })),
        hasWon: false,
        sixCount: 0
      };
    });

    setPlayers(initPlayers);
    setTurnIndex(0);
    setDiceRoll(null);
    setIsRolling(false);
    setPhase('ROLLING');
    setMovableTokenIds([]);
    setWinner(null);
    setLogs([]);
    setLatestBanter('');
    setHint(null);
    setIsSetupOpen(false);
    aiBusyRef.current = false;

    const firstPlayer = initPlayers[0];
    addLog(firstPlayer.color, firstPlayer.name, `Match started! ${firstPlayer.name}'s turn.`, 'SYSTEM');
    if (firstPlayer.personality) {
      setLatestBanter(firstPlayer.personality.greeting);
      speakText(firstPlayer.personality.greeting, newSettings.enableVoice);
    }
  };

  /**
   * Resets Match (Fix for PLAY AGAIN button)
   */
  const handleRestartMatch = () => {
    setWinner(null);
    setPhase('SETUP');
    setIsSetupOpen(true);
  };

  const activePlayer = players[turnIndex] || players[0];

  /**
   * Advance turn to next active player
   */
  const advanceTurn = useCallback((extraTurn: boolean = false) => {
    aiBusyRef.current = false;
    setHint(null);

    setPlayers(currentPlayers => {
      if (currentPlayers.length === 0) return currentPlayers;

      let nextIndex = turnIndex;
      if (!extraTurn) {
        currentPlayers = currentPlayers.map((p, idx) => idx === turnIndex ? { ...p, sixCount: 0 } : p);

        nextIndex = (turnIndex + 1) % currentPlayers.length;
        let attempts = 0;
        while (currentPlayers[nextIndex]?.hasWon && attempts < currentPlayers.length) {
          nextIndex = (nextIndex + 1) % currentPlayers.length;
          attempts++;
        }
      }

      setTurnIndex(nextIndex);
      return currentPlayers;
    });

    setMovableTokenIds([]);
    setDiceRoll(null);
    setPhase('ROLLING');
  }, [turnIndex]);

  /**
   * Step-by-step token movement animation & turn advancement
   */
  const executeTokenMove = useCallback((tokenId: number) => {
    if (!activePlayer || diceRoll === null || (phase !== 'MOVING' && phase !== 'ANIMATING')) return;

    setPhase('ANIMATING');

    const rollValue = diceRoll;
    const movingToken = activePlayer.tokens[tokenId];
    const initialStep = movingToken.stepCount;
    const targetStep = initialStep === 0 ? 1 : initialStep + rollValue;

    const totalStepsToAnimate = initialStep === 0 ? 1 : rollValue;
    let currentStepTick = 0;

    const animInterval = setInterval(() => {
      currentStepTick++;
      const intermediateStep = initialStep === 0 ? 1 : initialStep + currentStepTick;

      audioEngine.playTokenMove();

      setPlayers(prev => prev.map((p, idx) => {
        if (idx !== turnIndex) return p;
        return {
          ...p,
          tokens: p.tokens.map(t => t.id === tokenId ? { ...t, stepCount: intermediateStep } : t)
        };
      }));

      if (currentStepTick >= totalStepsToAnimate) {
        clearInterval(animInterval);

        let captureOccurred = false;
        let homeOccurred = false;

        setPlayers(prevPlayers => {
          const movingPlayer = prevPlayers[turnIndex];
          if (!movingPlayer) return prevPlayers;

          // 1. Check Captures
          let updatedPlayers = prevPlayers.map(p => {
            if (p.color === movingPlayer.color) return p;

            if (targetStep > 0 && targetStep <= 51) {
              const targetTrackIdx = getTrackIndexForStep(movingPlayer.color, targetStep);
              const isSafeStar = SAFE_STAR_INDICES.includes(targetTrackIdx);

              if (!isSafeStar) {
                const updatedEnemyTokens = p.tokens.map(t => {
                  if (t.stepCount > 0 && t.stepCount <= 51) {
                    const enemyTrackIdx = getTrackIndexForStep(p.color, t.stepCount);
                    if (enemyTrackIdx === targetTrackIdx) {
                      captureOccurred = true;
                      addLog(movingPlayer.color, movingPlayer.name, `Captured ${p.name}'s token! ⚔️ Extra Turn!`, 'CAPTURE');
                      return { ...t, stepCount: 0 };
                    }
                  }
                  return t;
                });
                return { ...p, tokens: updatedEnemyTokens };
              }
            }
            return p;
          });

          // 2. Update Moving Player tokens & Victory check
          updatedPlayers = updatedPlayers.map((p, idx) => {
            if (idx !== turnIndex) return p;

            const updatedTokens = p.tokens.map(t => {
              if (t.id === tokenId) {
                const isFinished = targetStep === 57;

                if (isFinished) {
                  homeOccurred = true;
                  addLog(p.color, p.name, `Token #${t.id + 1} reached HOME! 🏆 Extra Turn!`, 'HOME');
                } else if (isStepOnSafeStar(p.color, targetStep)) {
                  audioEngine.playSafeLanding();
                }

                return { ...t, stepCount: targetStep, isFinished };
              }
              return t;
            });

            const won = updatedTokens.every(t => t.isFinished);
            if (won) {
              setWinner(p);
              setPhase('GAME_OVER');
              addLog(p.color, p.name, `VICTORY! ${p.name} has finished all 4 tokens! 👑`, 'SYSTEM');
            }

            return { ...p, tokens: updatedTokens, hasWon: won };
          });

          return updatedPlayers;
        });

        if (captureOccurred) audioEngine.playCapture();

        const isRelease = isReleaseRoll(rollValue, settings.ruleOneIsSix);
        const extraRollGranted = isRelease || captureOccurred || homeOccurred;

        const speedDelay = settings.gameSpeed === 'FAST' ? 250 : (settings.gameSpeed === 'NORMAL' ? 650 : 1000);
        setTimeout(() => {
          advanceTurn(extraRollGranted);
        }, speedDelay);
      }
    }, settings.gameSpeed === 'FAST' ? 60 : (settings.gameSpeed === 'NORMAL' ? 120 : 180));
  }, [activePlayer, turnIndex, phase, diceRoll, settings, addLog, advanceTurn]);

  /**
   * Executes Dice Roll
   */
  const handleRollDice = useCallback(() => {
    if (isRolling || phase !== 'ROLLING' || !activePlayer) return;

    setIsRolling(true);
    audioEngine.playDiceRoll();

    setTimeout(() => {
      const rolled = Math.floor(Math.random() * 6) + 1;
      setIsRolling(false);
      setDiceRoll(rolled);

      const isRelease = isReleaseRoll(rolled, settings.ruleOneIsSix);
      addLog(activePlayer.color, activePlayer.name, `Rolled a ${rolled} 🎲`, 'ROLL');

      let currentSixCount = activePlayer.sixCount;
      if (isRelease) {
        currentSixCount++;
        setPlayers(prev => prev.map((p, idx) => idx === turnIndex ? { ...p, sixCount: currentSixCount } : p));
      } else {
        setPlayers(prev => prev.map((p, idx) => idx === turnIndex ? { ...p, sixCount: 0 } : p));
      }

      if (currentSixCount >= 3) {
        addLog(activePlayer.color, activePlayer.name, `3 consecutive bonus rolls! Turn skipped. 🚫`, 'SYSTEM');
        setPlayers(prev => prev.map((p, idx) => idx === turnIndex ? { ...p, sixCount: 0 } : p));
        setTimeout(() => advanceTurn(false), 700);
        return;
      }

      const legalIds = getLegalTokenIds(activePlayer, rolled, settings.ruleOneIsSix);
      setMovableTokenIds(legalIds);

      if (legalIds.length === 0) {
        addLog(activePlayer.color, activePlayer.name, `No legal moves available. Passing turn.`, 'SYSTEM');
        const speedDelay = settings.gameSpeed === 'FAST' ? 300 : 800;
        setTimeout(() => advanceTurn(isRelease), speedDelay);
        return;
      }

      setPhase('MOVING');

      // Single Remaining Token Auto-Play Rule:
      const activeUnfinishedTokens = activePlayer.tokens.filter(t => !t.isFinished);
      if (legalIds.length === 1 && activeUnfinishedTokens.length === 1 && !isRelease) {
        addLog(activePlayer.color, activePlayer.name, `Single remaining token auto-playing move...`, 'SYSTEM');
        setTimeout(() => executeTokenMove(legalIds[0]), 300);
      }
    }, 700);
  }, [isRolling, phase, activePlayer, turnIndex, settings.ruleOneIsSix, addLog, advanceTurn, executeTokenMove]);

  // AI Auto-Roll trigger when it's AI turn in ROLLING phase
  useEffect(() => {
    if (phase === 'ROLLING' && activePlayer?.type === 'AI' && !isRolling && !winner && !aiBusyRef.current) {
      aiBusyRef.current = true;
      const delay = settings.gameSpeed === 'FAST' ? 300 : (settings.gameSpeed === 'NORMAL' ? 700 : 1200);
      const timer = setTimeout(() => {
        handleRollDice();
      }, delay);
      return () => clearTimeout(timer);
    }
  }, [phase, activePlayer, isRolling, winner, settings.gameSpeed, handleRollDice]);

  // AI Move Selection trigger in MOVING phase
  useEffect(() => {
    if (phase === 'MOVING' && activePlayer?.type === 'AI' && diceRoll !== null && !winner) {
      const aiChoiceId = selectAIMove(activePlayer, diceRoll, players, settings.ruleOneIsSix);
      if (aiChoiceId !== null) {
        const delay = settings.gameSpeed === 'FAST' ? 250 : (settings.gameSpeed === 'NORMAL' ? 650 : 950);
        const timer = setTimeout(() => {
          executeTokenMove(aiChoiceId);
        }, delay);
        return () => clearTimeout(timer);
      }
    }
  }, [phase, activePlayer, diceRoll, players, winner, settings.gameSpeed, settings.ruleOneIsSix, executeTokenMove]);

  /**
   * Smart Move Hint Trigger for Human Player
   */
  const handleGetHint = () => {
    if (activePlayer?.type === 'HUMAN' && phase === 'MOVING' && diceRoll !== null) {
      const rec = getHumanMoveHint(activePlayer, diceRoll, players, settings.ruleOneIsSix);
      setHint(rec);
      if (rec) {
        addLog(activePlayer.color, 'AI Assistant', `Hint: ${rec.reason}`, 'SYSTEM');
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-between p-2 md:p-6 space-y-4 max-w-7xl mx-auto selection:bg-indigo-500">
      {/* Top Header */}
      <HeaderControls
        onOpenSettings={() => setIsSetupOpen(true)}
        onOpenRules={() => setIsRulesOpen(true)}
        onGetHint={handleGetHint}
        enableAudio={settings.enableAudio}
        onToggleAudio={() => setSettings(s => ({ ...s, enableAudio: !s.enableAudio }))}
        canHint={activePlayer?.type === 'HUMAN' && phase === 'MOVING'}
        theme={settings.theme}
        onToggleTheme={() => setSettings(s => ({ ...s, theme: s.theme === 'DARK' ? 'LIGHT' : 'DARK' }))}
      />

      {/* Smart Hint Banner */}
      {hint && (
        <div className="w-full p-3 rounded-2xl glass-panel-golden border border-amber-500/40 text-xs font-semibold flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2">
            <span className="text-base">💡</span>
            <span><strong>Recommended Move:</strong> {hint.reason} (Token #{hint.tokenId + 1})</span>
          </div>
          <button onClick={() => setHint(null)} className="text-amber-500 hover:opacity-80 text-xs font-bold">✕</button>
        </div>
      )}

      {/* Main Grid Layout */}
      <main className="w-full grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
        {/* Left Side: 2 Player Cards */}
        <div className="lg:col-span-3 flex flex-col gap-3 order-2 lg:order-1">
          {players.slice(0, 2).map((player) => (
            <PlayerCard
              key={player.color}
              player={player}
              isActive={activePlayer?.color === player.color}
              latestBanter={activePlayer?.color === player.color ? latestBanter : undefined}
            />
          ))}

          {/* 3D Rolling Dice Controls */}
          <div className="p-4 rounded-2xl glass-panel flex flex-col items-center justify-center">
            <div className="text-xs font-bold uppercase tracking-wider opacity-70 mb-2">
              Turn: <span className="font-extrabold opacity-100">{activePlayer?.name}</span>
            </div>
            <Dice3D
              value={diceRoll || 1}
              isRolling={isRolling}
              canRoll={phase === 'ROLLING' && activePlayer?.type === 'HUMAN'}
              activeColor={activePlayer?.color || 'RED'}
              onRoll={handleRollDice}
              autoRoll={settings.autoRoll}
            />
          </div>
        </div>

        {/* Center: Canvas Ludo Board */}
        <div className="lg:col-span-6 flex justify-center order-1 lg:order-2">
          <LudoBoardCanvas
            players={players}
            activeColor={activePlayer?.color || 'RED'}
            movableTokenIds={phase === 'MOVING' ? movableTokenIds : []}
            onTokenClick={(tokenId) => {
              if (activePlayer?.type === 'HUMAN' && phase === 'MOVING') {
                executeTokenMove(tokenId);
              }
            }}
            hintTokenId={hint?.tokenId ?? null}
            theme={settings.theme}
          />
        </div>

        {/* Right Side: Remaining Player Cards + Live Companion Chat */}
        <div className="lg:col-span-3 flex flex-col gap-3 order-3">
          {players.slice(2, 4).map((player) => (
            <PlayerCard
              key={player.color}
              player={player}
              isActive={activePlayer?.color === player.color}
              latestBanter={activePlayer?.color === player.color ? latestBanter : undefined}
            />
          ))}

          {/* AI Live Companion Log Feed */}
          <div className="flex-1 min-h-[220px]">
            <CompanionBanter
              logs={logs}
              enableVoice={settings.enableVoice}
              onToggleVoice={() => setSettings(s => ({ ...s, enableVoice: !s.enableVoice }))}
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center text-xs opacity-60 pt-2 border-t border-slate-700/20 w-full">
        Intelligent Ludo Game &bull; Senior Friendly &bull; Hardware Accelerated GPU/NPU Engine &bull; Antigravity AI
      </footer>

      {/* Modals */}
      <SetupModal isOpen={isSetupOpen} onStartGame={handleStartGame} currentTheme={settings.theme} />
      <RulesModal isOpen={isRulesOpen} onClose={() => setIsRulesOpen(false)} />
      <VictoryModal winner={winner} onRestart={handleRestartMatch} />
    </div>
  );
}

function isStepOnSafeStar(color: PlayerColor, stepCount: number): boolean {
  if (stepCount <= 0 || stepCount > 51) return true;
  const trackIdx = getTrackIndexForStep(color, stepCount);
  return SAFE_STAR_INDICES.includes(trackIdx);
}
