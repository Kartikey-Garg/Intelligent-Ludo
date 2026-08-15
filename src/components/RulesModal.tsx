import React from 'react';
import { BookOpen, X, CheckCircle2, Shield, Star, Award } from 'lucide-react';

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RulesModal: React.FC<RulesModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="w-full max-w-lg p-6 rounded-3xl glass-panel border border-slate-700 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2 text-indigo-400 font-bold text-lg">
            <BookOpen className="w-5 h-5" />
            <h2>How To Play Ludo</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
          <div className="p-3 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-1">
            <div className="font-bold text-sm text-slate-100 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> 1. Releasing Tokens
            </div>
            <p>Roll a <strong>6</strong> on the dice to move a token out of your Yard onto the board's starting square.</p>
          </div>

          <div className="p-3 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-1">
            <div className="font-bold text-sm text-slate-100 flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-400" /> 2. Safe Star Squares
            </div>
            <p>Tokens standing on <strong>Star squares (⭐)</strong> or starting squares are safe and cannot be captured by opponent tokens.</p>
          </div>

          <div className="p-3 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-1">
            <div className="font-bold text-sm text-slate-100 flex items-center gap-2">
              <Shield className="w-4 h-4 text-blue-400" /> 3. Capturing Opponents
            </div>
            <p>Landing on an opponent's token on a regular track square captures it, sending it back to their Yard and granting you a <strong>bonus dice roll</strong>!</p>
          </div>

          <div className="p-3 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-1">
            <div className="font-bold text-sm text-slate-100 flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" /> 4. Winning The Game
            </div>
            <p>Guide all 4 of your tokens into the central Home triangle. The first player to bring all 4 tokens Home wins!</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 font-bold text-white transition-all text-sm"
        >
          GOT IT!
        </button>
      </div>
    </div>
  );
};
