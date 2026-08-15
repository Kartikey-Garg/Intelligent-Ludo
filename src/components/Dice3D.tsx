import React from 'react';
import { PlayerColor } from '../types/ludo';
import { Play } from 'lucide-react';

interface Dice3DProps {
  value: number;
  isRolling: boolean;
  canRoll: boolean;
  activeColor: PlayerColor;
  onRoll: () => void;
  autoRoll: boolean;
}

const COLOR_GLOW: Record<PlayerColor, string> = {
  RED: 'shadow-[0_0_25px_rgba(239,68,68,0.6)] border-red-500 bg-red-600',
  GREEN: 'shadow-[0_0_25px_rgba(16,185,129,0.6)] border-emerald-500 bg-emerald-600',
  YELLOW: 'shadow-[0_0_25px_rgba(245,158,11,0.6)] border-amber-500 bg-amber-600',
  BLUE: 'shadow-[0_0_25px_rgba(59,130,246,0.6)] border-blue-500 bg-blue-600'
};

export const Dice3D: React.FC<Dice3DProps> = ({
  value,
  isRolling,
  canRoll,
  activeColor,
  onRoll,
  autoRoll
}) => {
  const renderDots = (num: number) => {
    const dotsMap: Record<number, string[]> = {
      1: ['center'],
      2: ['top-left', 'bottom-right'],
      3: ['top-left', 'center', 'bottom-right'],
      4: ['top-left', 'top-right', 'bottom-left', 'bottom-right'],
      5: ['top-left', 'top-right', 'center', 'bottom-left', 'bottom-right'],
      6: ['top-left', 'top-right', 'middle-left', 'middle-right', 'bottom-left', 'bottom-right']
    };

    const dots = dotsMap[num] || ['center'];

    return (
      <div className="w-full h-full relative p-2.5 grid grid-cols-3 grid-rows-3 items-center justify-items-center">
        {dots.includes('top-left') && <span className="col-start-1 row-start-1 dice-dot" />}
        {dots.includes('top-right') && <span className="col-start-3 row-start-1 dice-dot" />}
        {dots.includes('middle-left') && <span className="col-start-1 row-start-2 dice-dot" />}
        {dots.includes('center') && <span className="col-start-2 row-start-2 dice-dot" />}
        {dots.includes('middle-right') && <span className="col-start-3 row-start-2 dice-dot" />}
        {dots.includes('bottom-left') && <span className="col-start-1 row-start-3 dice-dot" />}
        {dots.includes('bottom-right') && <span className="col-start-3 row-start-3 dice-dot" />}
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center gap-3">
      {/* 3D Rolling Dice Cube */}
      <div className="dice-container">
        <div className={`dice-cube ${isRolling ? 'dice-rolling' : `show-${value}`}`}>
          <div className="dice-face dice-face-1">{renderDots(1)}</div>
          <div className="dice-face dice-face-2">{renderDots(2)}</div>
          <div className="dice-face dice-face-3">{renderDots(3)}</div>
          <div className="dice-face dice-face-4">{renderDots(4)}</div>
          <div className="dice-face dice-face-5">{renderDots(5)}</div>
          <div className="dice-face dice-face-6">{renderDots(6)}</div>
        </div>
      </div>

      {/* Action Button */}
      <button
        onClick={onRoll}
        disabled={!canRoll || isRolling || autoRoll}
        className={`px-6 py-3.5 rounded-2xl font-bold text-lg text-white transition-all transform duration-200 flex items-center gap-2 border-2 ${
          canRoll && !isRolling
            ? `${COLOR_GLOW[activeColor]} hover:scale-105 active:scale-95 cursor-pointer`
            : 'bg-slate-800 border-slate-700 text-slate-500 cursor-not-allowed opacity-60'
        }`}
      >
        <Play className={`w-5 h-5 ${isRolling ? 'animate-spin' : ''}`} />
        <span>{isRolling ? 'Rolling...' : 'ROLL DICE'}</span>
      </button>
    </div>
  );
};
