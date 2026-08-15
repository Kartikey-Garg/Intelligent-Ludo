import React from 'react';
import { Player, PlayerColor } from '../types/ludo';
import { Bot, User, Home, Shield, Award } from 'lucide-react';

interface PlayerCardProps {
  player: Player;
  isActive: boolean;
  latestBanter?: string;
}

const COLOR_BORDER: Record<PlayerColor, string> = {
  RED: 'border-red-500/50 bg-red-950/20 text-red-400',
  GREEN: 'border-emerald-500/50 bg-emerald-950/20 text-emerald-400',
  YELLOW: 'border-amber-500/50 bg-amber-950/20 text-amber-400',
  BLUE: 'border-blue-500/50 bg-blue-950/20 text-blue-400'
};

const COLOR_BADGE: Record<PlayerColor, string> = {
  RED: 'bg-red-500 text-white',
  GREEN: 'bg-emerald-500 text-white',
  YELLOW: 'bg-amber-500 text-black',
  BLUE: 'bg-blue-500 text-white'
};

export const PlayerCard: React.FC<PlayerCardProps> = ({ player, isActive, latestBanter }) => {
  const homeCount = player.tokens.filter(t => t.isFinished).length;
  const yardCount = player.tokens.filter(t => t.stepCount === 0).length;
  const trackCount = 4 - homeCount - yardCount;

  return (
    <div
      className={`relative p-3.5 rounded-2xl glass-panel transition-all duration-300 border-2 ${
        isActive
          ? `scale-105 shadow-xl ${COLOR_BORDER[player.color]} ring-2 ring-white/30`
          : 'border-slate-800 opacity-80'
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        {/* Left: Avatar & Info */}
        <div className="flex items-center gap-3">
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl font-bold shadow-md ${COLOR_BADGE[player.color]}`}>
            {player.type === 'AI' ? (player.personality?.avatar || '🤖') : '👤'}
          </div>
          <div>
            <div className="flex items-center gap-1.5 font-bold text-base text-slate-100">
              <span>{player.name}</span>
              {player.type === 'AI' ? (
                <Bot className="w-4 h-4 text-indigo-400" />
              ) : (
                <User className="w-4 h-4 text-emerald-400" />
              )}
            </div>
            <div className="text-xs text-slate-400 font-medium">
              {player.type === 'AI' ? player.personality?.title || 'AI Agent' : 'Human Player'}
            </div>
          </div>
        </div>

        {/* Right: Token Progress Badges */}
        <div className="flex items-center gap-2 text-xs font-semibold">
          <div className="flex items-center gap-1 bg-slate-900/80 px-2.5 py-1 rounded-lg border border-slate-800 text-amber-400">
            <Home className="w-3.5 h-3.5" />
            <span>{homeCount}/4</span>
          </div>
          <div className="flex items-center gap-1 bg-slate-900/80 px-2.5 py-1 rounded-lg border border-slate-800 text-blue-400">
            <Shield className="w-3.5 h-3.5" />
            <span>{trackCount}</span>
          </div>
        </div>
      </div>

      {/* AI Speech Bubble Banter */}
      {latestBanter && isActive && (
        <div className="mt-2.5 p-2 bg-indigo-950/70 border border-indigo-500/30 rounded-xl text-xs text-indigo-200 animate-pulse-slow flex items-start gap-1.5">
          <span className="text-sm">💬</span>
          <span className="italic">"{latestBanter}"</span>
        </div>
      )}

      {/* Winner Ribbon */}
      {player.hasWon && (
        <div className="absolute -top-2 -right-2 bg-gradient-to-r from-amber-400 to-amber-600 text-slate-950 text-xs font-extrabold px-2.5 py-0.5 rounded-full shadow-lg flex items-center gap-1">
          <Award className="w-3.5 h-3.5" />
          <span>WINNER #{player.rank}</span>
        </div>
      )}
    </div>
  );
};
