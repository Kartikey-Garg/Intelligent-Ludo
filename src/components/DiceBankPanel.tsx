import React from 'react';
import { PlayerColor } from '../types/ludo';
import { Dices, Play, ArrowRightLeft, Sparkles } from 'lucide-react';

interface DiceBankPanelProps {
  phase: string;
  diceBank: number[];
  selectedRoll: number | null;
  activeColor: PlayerColor;
  activePlayerName: string;
  isHuman: boolean;
  onChooseHold: () => void;
  onChooseUseNow: () => void;
  onSelectBankedRoll: (index: number) => void;
}

export const DiceBankPanel: React.FC<DiceBankPanelProps> = ({
  phase,
  diceBank,
  selectedRoll,
  activeColor,
  activePlayerName,
  isHuman,
  onChooseHold,
  onChooseUseNow,
  onSelectBankedRoll
}) => {
  if (phase === 'HOLD_CHOICE') {
    const rolledVal = diceBank[0] || 6;
    return (
      <div className="w-full p-4 rounded-2xl glass-panel-golden border border-amber-500/50 shadow-xl space-y-3 animate-bounce-gentle">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-amber-300 font-extrabold text-sm">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <span>Bonus Roll ({rolledVal})! Choose Your Tactic</span>
          </div>
          <span className="text-xs bg-amber-500/20 text-amber-300 px-2.5 py-0.5 rounded-full font-bold">
            {activePlayerName}
          </span>
        </div>

        <p className="text-xs text-amber-100 opacity-90">
          You rolled a <strong>{rolledVal}</strong>! You can use it now, or hold it in your bank and roll another dice to decide your move order!
        </p>

        {isHuman && (
          <div className="grid grid-cols-2 gap-3 pt-1">
            <button
              onClick={onChooseUseNow}
              className="py-3 px-4 rounded-xl bg-slate-900 border border-slate-700 hover:border-slate-500 text-slate-100 font-bold text-xs flex items-center justify-center gap-2 transition-all transform hover:scale-105"
            >
              <Play className="w-4 h-4 text-emerald-400" />
              <span>Use {rolledVal} Now</span>
            </button>

            <button
              onClick={onChooseHold}
              className="py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg hover:from-amber-400 hover:to-amber-500 transition-all transform hover:scale-105"
            >
              <Dices className="w-4 h-4" />
              <span>Hold & Roll Again 🎲</span>
            </button>
          </div>
        )}
      </div>
    );
  }

  if (phase === 'BANK_SELECT' || (diceBank.length > 1 && phase === 'MOVING')) {
    return (
      <div className="w-full p-4 rounded-2xl glass-panel border border-indigo-500/40 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-extrabold text-sm text-indigo-300">
            <ArrowRightLeft className="w-4 h-4 text-indigo-400" />
            <span>Select Move Order</span>
          </div>
          <span className="text-xs opacity-75">{activePlayerName}'s Bank</span>
        </div>

        <p className="text-xs opacity-80">
          Select which banked number you want to play first:
        </p>

        <div className="flex items-center gap-3 pt-1">
          {diceBank.map((num, idx) => {
            const isSelected = selectedRoll === num;
            return (
              <button
                key={idx}
                onClick={() => onSelectBankedRoll(idx)}
                className={`flex-1 py-3 rounded-2xl border font-extrabold text-lg flex items-center justify-center gap-2 transition-all ${
                  isSelected
                    ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white border-indigo-400 ring-4 ring-indigo-500/30 scale-105 shadow-lg'
                    : 'bg-slate-900/80 border-slate-700 hover:border-slate-500 opacity-80'
                }`}
              >
                <span>🎲</span>
                <span>{num}</span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return null;
};
