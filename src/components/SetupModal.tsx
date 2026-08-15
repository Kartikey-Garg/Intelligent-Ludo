import React, { useState } from 'react';
import { GameSettings, PlayerColor, AIDifficulty, ThemeMode } from '../types/ludo';
import { Users, Bot, Palette, Zap, Volume2, Sparkles, Sun, Moon, Dices, UserCheck, User } from 'lucide-react';

interface SetupModalProps {
  isOpen: boolean;
  onStartGame: (settings: GameSettings) => void;
  currentTheme: ThemeMode;
}

export const SetupModal: React.FC<SetupModalProps> = ({ isOpen, onStartGame, currentTheme }) => {
  const [playerCount, setPlayerCount] = useState<2 | 3 | 4>(4);
  const [humanPlayerCount, setHumanPlayerCount] = useState<1 | 2 | 3 | 4>(1);
  const [humanColor, setHumanColor] = useState<PlayerColor>('RED');
  const [difficulty, setDifficulty] = useState<AIDifficulty>('STRATEGIC');
  const [gameSpeed, setGameSpeed] = useState<'RELAXED' | 'NORMAL' | 'FAST'>('NORMAL');
  const [enableAudio, setEnableAudio] = useState<boolean>(true);
  const [enableVoice, setEnableVoice] = useState<boolean>(true);
  const [ruleOneIsSix, setRuleOneIsSix] = useState<boolean>(false);
  const [theme, setTheme] = useState<ThemeMode>(currentTheme);

  if (!isOpen) return null;

  const aiPlayerCount = Math.max(0, playerCount - humanPlayerCount) as 0 | 1 | 2 | 3;

  const handleStart = () => {
    const aiDifficulties: Record<PlayerColor, AIDifficulty> = {
      RED: difficulty,
      GREEN: difficulty,
      YELLOW: difficulty,
      BLUE: difficulty
    };

    onStartGame({
      playerCount,
      humanPlayerCount,
      aiPlayerCount,
      humanColor,
      aiDifficulties,
      gameSpeed,
      enableAudio,
      enableVoice,
      autoRoll: false,
      theme,
      ruleOneIsSix
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="w-full max-w-xl p-6 rounded-3xl glass-panel border border-slate-700 shadow-2xl space-y-5 my-auto max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="text-center space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-4 h-4" /> Senior Friendly AI Ludo
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight">Intelligent Ludo</h2>
          <p className="opacity-70 text-sm">Select single player vs AI or local multiplayer!</p>
        </div>

        {/* 1. Quick Presets for Single Player vs AI */}
        <div className="space-y-2">
          <label className="text-xs font-bold opacity-80 uppercase tracking-wider flex items-center gap-2">
            <Bot className="w-4 h-4 text-indigo-400" /> Play Alone Vs AI Agents
          </label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { total: 2, human: 1, label: 'Vs 1 AI Agent', desc: '1 Human + 1 AI (2 Players)' },
              { total: 3, human: 1, label: 'Vs 2 AI Agents', desc: '1 Human + 2 AI (3 Players)' },
              { total: 4, human: 1, label: 'Vs 3 AI Agents', desc: '1 Human + 3 AI (4 Players)' }
            ].map((p) => {
              const isSelected = playerCount === p.total && humanPlayerCount === p.human;
              return (
                <button
                  key={p.total}
                  type="button"
                  onClick={() => {
                    setPlayerCount(p.total as 2 | 3 | 4);
                    setHumanPlayerCount(p.human as 1 | 2 | 3 | 4);
                  }}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    isSelected
                      ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg shadow-indigo-600/30 scale-105'
                      : 'border-slate-700/50 hover:border-slate-600'
                  }`}
                >
                  <div className="font-extrabold text-sm">{p.label}</div>
                  <div className="text-[10px] opacity-70 mt-0.5">{p.desc}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Pass & Play Local Multiplayer (No AI / Manual Players) */}
        <div className="space-y-2">
          <label className="text-xs font-bold opacity-80 uppercase tracking-wider flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-emerald-400" /> Pass & Play (No AI / Local Friends)
          </label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { total: 2, human: 2, label: '2 Human Players', desc: '2 Manual (0 AI)' },
              { total: 3, human: 3, label: '3 Human Players', desc: '3 Manual (0 AI)' },
              { total: 4, human: 4, label: '4 Human Players', desc: '4 Manual (0 AI)' }
            ].map((p) => {
              const isSelected = playerCount === p.total && humanPlayerCount === p.human;
              return (
                <button
                  key={p.total}
                  type="button"
                  onClick={() => {
                    setPlayerCount(p.total as 2 | 3 | 4);
                    setHumanPlayerCount(p.human as 1 | 2 | 3 | 4);
                  }}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    isSelected
                      ? 'bg-emerald-600 border-emerald-400 text-white shadow-lg shadow-emerald-600/30 scale-105'
                      : 'border-slate-700/50 hover:border-slate-600'
                  }`}
                >
                  <div className="font-extrabold text-sm">{p.label}</div>
                  <div className="text-[10px] opacity-70 mt-0.5">{p.desc}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Primary Player Color */}
        <div className="space-y-2">
          <label className="text-xs font-bold opacity-80 uppercase tracking-wider flex items-center gap-2">
            <Palette className="w-4 h-4 text-emerald-400" /> Player 1 Color
          </label>
          <div className="grid grid-cols-4 gap-3">
            {[
              { color: 'RED' as PlayerColor, name: 'Red', hex: 'bg-red-600 border-red-400 text-white' },
              { color: 'GREEN' as PlayerColor, name: 'Green', hex: 'bg-emerald-600 border-emerald-400 text-white' },
              { color: 'YELLOW' as PlayerColor, name: 'Yellow', hex: 'bg-amber-500 border-amber-300 text-black' },
              { color: 'BLUE' as PlayerColor, name: 'Blue', hex: 'bg-blue-600 border-blue-400 text-white' }
            ].map((c) => (
              <button
                key={c.color}
                type="button"
                onClick={() => setHumanColor(c.color)}
                className={`p-2.5 rounded-xl border text-center font-bold text-sm transition-all flex items-center justify-center gap-2 ${c.hex} ${
                  humanColor === c.color ? 'ring-4 ring-white/40 scale-105 shadow-md' : 'opacity-70 hover:opacity-100'
                }`}
              >
                <span>{c.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 4. House Rules Toggle (1 behaves like 6) */}
        <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Dices className="w-5 h-5 text-amber-400" />
            <div>
              <div className="text-xs font-bold text-amber-300">House Rule: "1" Behaves Like "6"</div>
              <div className="text-[11px] opacity-75">Rolling a 1 can open a token from Yard AND grant an extra chance!</div>
            </div>
          </div>
          <input
            type="checkbox"
            checked={ruleOneIsSix}
            onChange={(e) => setRuleOneIsSix(e.target.checked)}
            className="w-5 h-5 rounded border-amber-500 text-amber-500 focus:ring-amber-400 cursor-pointer"
          />
        </div>

        {/* 5. AI Difficulty */}
        {aiPlayerCount > 0 && (
          <div className="space-y-2">
            <label className="text-xs font-bold opacity-80 uppercase tracking-wider flex items-center gap-2">
              <Bot className="w-4 h-4 text-amber-400" /> AI Agent Difficulty
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { level: 'FRIENDLY' as AIDifficulty, label: 'Friendly Companion' },
                { level: 'STRATEGIC' as AIDifficulty, label: 'Strategic' },
                { level: 'GRANDMASTER' as AIDifficulty, label: 'Grandmaster' }
              ].map((d) => (
                <button
                  key={d.level}
                  type="button"
                  onClick={() => setDifficulty(d.level)}
                  className={`p-2.5 rounded-xl border text-center font-bold text-xs transition-all ${
                    difficulty === d.level
                      ? 'bg-amber-600 border-amber-400 text-white shadow-lg scale-105'
                      : 'border-slate-700/50 hover:border-slate-600'
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 6. Theme & Audio Toggles */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-[11px] font-bold opacity-80 uppercase flex items-center gap-1">
              <Sun className="w-3.5 h-3.5 text-amber-400" /> Theme Mode
            </label>
            <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-900 border border-slate-700">
              <button
                type="button"
                onClick={() => setTheme('DARK')}
                className={`flex-1 py-1 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-all ${
                  theme === 'DARK' ? 'bg-indigo-600 text-white' : 'text-slate-400'
                }`}
              >
                <Moon className="w-3 h-3" /> Dark
              </button>
              <button
                type="button"
                onClick={() => setTheme('LIGHT')}
                className={`flex-1 py-1 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-all ${
                  theme === 'LIGHT' ? 'bg-amber-500 text-black' : 'text-slate-400'
                }`}
              >
                <Sun className="w-3 h-3" /> Light
              </button>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold opacity-80 uppercase flex items-center gap-1">
              <Volume2 className="w-3.5 h-3.5 text-purple-400" /> Sound & Speech
            </label>
            <div className="flex items-center gap-3 pt-1.5">
              <label className="flex items-center gap-1 text-xs font-semibold cursor-pointer">
                <input
                  type="checkbox"
                  checked={enableAudio}
                  onChange={(e) => setEnableAudio(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-indigo-600 w-4 h-4"
                />
                <span>Audio</span>
              </label>
              <label className="flex items-center gap-1 text-xs font-semibold cursor-pointer">
                <input
                  type="checkbox"
                  checked={enableVoice}
                  onChange={(e) => setEnableVoice(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-indigo-600 w-4 h-4"
                />
                <span>Voice</span>
              </label>
            </div>
          </div>
        </div>

        {/* Start Button */}
        <button
          type="button"
          onClick={handleStart}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-indigo-600 text-white font-extrabold text-lg shadow-xl hover:from-emerald-400 hover:to-indigo-500 transform hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          START MATCH ({humanPlayerCount} Human vs {aiPlayerCount} AI)
        </button>
      </div>
    </div>
  );
};
