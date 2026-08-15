import React from 'react';
import { GameLogEntry } from '../types/ludo';
import { MessageSquare, Volume2, VolumeX, Sparkles } from 'lucide-react';

interface CompanionBanterProps {
  logs: GameLogEntry[];
  enableVoice: boolean;
  onToggleVoice: () => void;
}

export const CompanionBanter: React.FC<CompanionBanterProps> = ({
  logs,
  enableVoice,
  onToggleVoice
}) => {
  return (
    <div className="flex flex-col h-full rounded-2xl glass-panel p-4 border border-slate-800">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-400" />
          <h3 className="font-bold text-base text-slate-100">AI Companions Chat</h3>
        </div>
        <button
          onClick={onToggleVoice}
          title={enableVoice ? 'Disable Voice Commentary' : 'Enable Voice Commentary'}
          className={`p-2 rounded-xl transition-all ${
            enableVoice
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'bg-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          {enableVoice ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>
      </div>

      {/* Log Feed */}
      <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 max-h-[380px]">
        {logs.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-sm italic">
            Game started! Roll the dice to begin the match.
          </div>
        ) : (
          logs.slice().reverse().map(log => (
            <div
              key={log.id}
              className={`p-2.5 rounded-xl text-xs transition-all ${
                log.type === 'BANTER'
                  ? 'bg-indigo-950/60 border border-indigo-500/30 text-indigo-200'
                  : log.type === 'CAPTURE'
                  ? 'bg-red-950/60 border border-red-500/30 text-red-200'
                  : log.type === 'HOME'
                  ? 'bg-amber-950/60 border border-amber-500/30 text-amber-200'
                  : 'bg-slate-900/60 border border-slate-800 text-slate-300'
              }`}
            >
              <div className="flex items-center justify-between font-semibold mb-1 text-[11px] opacity-80">
                <span>{log.playerName}</span>
                <span>{log.timestamp}</span>
              </div>
              <div>{log.message}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
