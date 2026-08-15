import React from 'react';
import { Volume2, VolumeX, Lightbulb, Settings, BookOpen, Sparkles, Sun, Moon } from 'lucide-react';
import { ThemeMode } from '../types/ludo';

interface HeaderControlsProps {
  onOpenSettings: () => void;
  onOpenRules: () => void;
  onGetHint: () => void;
  enableAudio: boolean;
  onToggleAudio: () => void;
  canHint: boolean;
  theme: ThemeMode;
  onToggleTheme: () => void;
}

export const HeaderControls: React.FC<HeaderControlsProps> = ({
  onOpenSettings,
  onOpenRules,
  onGetHint,
  enableAudio,
  onToggleAudio,
  canHint,
  theme,
  onToggleTheme
}) => {
  return (
    <header className="w-full flex items-center justify-between p-3 md:p-4 rounded-2xl glass-panel border">
      {/* Title Logo */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-400 to-indigo-600 flex items-center justify-center text-xl shadow-lg">
          🎲
        </div>
        <div>
          <h1 className="font-extrabold text-lg md:text-xl flex items-center gap-2">
            <span>Intelligent Ludo</span>
            <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
          </h1>
          <p className="text-[11px] opacity-70 hidden sm:block">AI Companions & GPU Accelerated Gameplay</p>
        </div>
      </div>

      {/* Control Action Buttons */}
      <div className="flex items-center gap-2">
        {/* Smart Hint Button */}
        <button
          onClick={onGetHint}
          disabled={!canHint}
          title="Get AI Best Move Hint"
          className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
            canHint
              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 hover:bg-amber-500/30 cursor-pointer shadow-md'
              : 'opacity-40 cursor-not-allowed border border-slate-700'
          }`}
        >
          <Lightbulb className="w-4 h-4 text-amber-400" />
          <span className="hidden sm:inline">Hint</span>
        </button>

        {/* Theme Mode Toggle (Sun/Moon) */}
        <button
          onClick={onToggleTheme}
          title={theme === 'DARK' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          className="p-2.5 rounded-xl border border-slate-700/50 hover:scale-105 transition-all flex items-center justify-center"
        >
          {theme === 'DARK' ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-indigo-600" />}
        </button>

        {/* Audio Toggle */}
        <button
          onClick={onToggleAudio}
          title={enableAudio ? 'Mute Sound Effects' : 'Enable Sound Effects'}
          className={`p-2.5 rounded-xl border transition-all ${
            enableAudio
              ? 'bg-indigo-600/30 border-indigo-500/40 text-indigo-300'
              : 'opacity-50 border-slate-700'
          }`}
        >
          {enableAudio ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>

        {/* Rules Guide */}
        <button
          onClick={onOpenRules}
          title="Game Rules"
          className="p-2.5 rounded-xl border border-slate-700/50 hover:scale-105 transition-all"
        >
          <BookOpen className="w-4 h-4" />
        </button>

        {/* New Game / Settings */}
        <button
          onClick={onOpenSettings}
          title="Match Settings"
          className="p-2.5 rounded-xl border border-slate-700/50 hover:scale-105 transition-all"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
