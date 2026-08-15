import React, { useEffect } from 'react';
import { Player } from '../types/ludo';
import confetti from 'canvas-confetti';
import { Trophy, RotateCcw, Award } from 'lucide-react';
import { audioEngine } from '../utils/audioEngine';

interface VictoryModalProps {
  winner: Player | null;
  onRestart: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({ winner, onRestart }) => {
  useEffect(() => {
    if (winner) {
      audioEngine.playVictory();
      // Launch Confetti
      try {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 }
        });
      } catch (err) {
        // Fallback if canvas-confetti is missing
      }
    }
  }, [winner]);

  if (!winner) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-lg">
      <div className="w-full max-w-md p-6 rounded-3xl glass-panel-golden text-center space-y-5 animate-bounce-gentle">
        <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-tr from-amber-400 to-amber-600 flex items-center justify-center text-4xl shadow-2xl">
          🏆
        </div>

        <div className="space-y-1">
          <h2 className="text-3xl font-extrabold text-amber-300">VICTORY!</h2>
          <p className="text-lg font-bold text-slate-100 flex items-center justify-center gap-2">
            <span>{winner.type === 'AI' ? (winner.personality?.avatar || '🤖') : '👤'}</span>
            <span>{winner.name} Has Won The Match!</span>
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-amber-500/30 text-xs text-slate-300 space-y-2 text-left">
          <div className="flex justify-between">
            <span className="font-semibold text-slate-400">Player Type:</span>
            <span className="font-bold text-white">{winner.type === 'HUMAN' ? 'Human Champion' : winner.personality?.title}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold text-slate-400">Color:</span>
            <span className="font-bold text-white uppercase">{winner.color}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold text-slate-400">Tokens Home:</span>
            <span className="font-bold text-emerald-400">4 / 4</span>
          </div>
        </div>

        <button
          onClick={onRestart}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold text-base shadow-xl flex items-center justify-center gap-2 transition-all transform hover:scale-105"
        >
          <RotateCcw className="w-5 h-5" />
          <span>PLAY AGAIN</span>
        </button>
      </div>
    </div>
  );
};
