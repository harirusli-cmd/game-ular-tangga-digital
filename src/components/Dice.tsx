import React from 'react';
import { motion } from 'motion/react';
import { sound } from '../utils/audio';

interface DiceProps {
  value: number;
  isRolling: boolean;
  disabled: boolean;
  onRoll: () => void;
  playerName?: string;
  playerColor?: string;
}

export const Dice: React.FC<DiceProps> = ({
  value,
  isRolling,
  disabled,
  onRoll,
  playerName,
  playerColor = '#2563eb'
}) => {
  const handleClick = () => {
    if (disabled || isRolling) return;
    sound.playDiceRoll();
    onRoll();
  };

  const renderDots = (num: number) => {
    switch (num) {
      case 1:
        return <div className="w-5 h-5 rounded-full bg-red-500 shadow-inner" />;
      case 2:
        return (
          <div className="flex justify-between w-full h-full p-2">
            <div className="w-3.5 h-3.5 rounded-full bg-slate-800 self-start" />
            <div className="w-3.5 h-3.5 rounded-full bg-slate-800 self-end" />
          </div>
        );
      case 3:
        return (
          <div className="flex justify-between w-full h-full p-2">
            <div className="w-3.5 h-3.5 rounded-full bg-slate-800 self-start" />
            <div className="w-3.5 h-3.5 rounded-full bg-slate-800 self-center" />
            <div className="w-3.5 h-3.5 rounded-full bg-slate-800 self-end" />
          </div>
        );
      case 4:
        return (
          <div className="grid grid-cols-2 gap-3 p-2 w-full h-full place-items-center">
            <div className="w-3.5 h-3.5 rounded-full bg-slate-800" />
            <div className="w-3.5 h-3.5 rounded-full bg-slate-800" />
            <div className="w-3.5 h-3.5 rounded-full bg-slate-800" />
            <div className="w-3.5 h-3.5 rounded-full bg-slate-800" />
          </div>
        );
      case 5:
        return (
          <div className="relative w-full h-full p-2">
            <div className="absolute top-2 left-2 w-3.5 h-3.5 rounded-full bg-slate-800" />
            <div className="absolute top-2 right-2 w-3.5 h-3.5 rounded-full bg-slate-800" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-red-500" />
            <div className="absolute bottom-2 left-2 w-3.5 h-3.5 rounded-full bg-slate-800" />
            <div className="absolute bottom-2 right-2 w-3.5 h-3.5 rounded-full bg-slate-800" />
          </div>
        );
      case 6:
      default:
        return (
          <div className="grid grid-cols-2 gap-2 p-2 w-full h-full place-items-center">
            <div className="w-3.5 h-3.5 rounded-full bg-slate-800" />
            <div className="w-3.5 h-3.5 rounded-full bg-slate-800" />
            <div className="w-3.5 h-3.5 rounded-full bg-slate-800" />
            <div className="w-3.5 h-3.5 rounded-full bg-slate-800" />
            <div className="w-3.5 h-3.5 rounded-full bg-slate-800" />
            <div className="w-3.5 h-3.5 rounded-full bg-slate-800" />
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <motion.button
        id="btn-roll-dice"
        onClick={handleClick}
        disabled={disabled || isRolling}
        whileHover={!disabled && !isRolling ? { scale: 1.06 } : {}}
        whileTap={!disabled && !isRolling ? { scale: 0.94 } : {}}
        className={`relative flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white/90 backdrop-blur-xl border-2 border-white/40 shadow-2xl transition-all ${
          disabled ? 'opacity-50 cursor-not-allowed grayscale' : 'cursor-pointer hover:border-amber-300 hover:shadow-2xl'
        }`}
        style={{
          boxShadow: disabled ? 'none' : `0 10px 25px -3px ${playerColor}60, 0 4px 6px -4px ${playerColor}40`
        }}
      >
        <motion.div
          animate={
            isRolling
              ? {
                  rotate: [0, 90, 180, 270, 360],
                  scale: [1, 1.2, 0.9, 1.15, 1],
                  x: [0, -8, 8, -4, 0],
                  y: [0, -12, 4, -8, 0]
                }
              : { rotate: 0, scale: 1, x: 0, y: 0 }
          }
          transition={isRolling ? { repeat: Infinity, duration: 0.25 } : { duration: 0.2 }}
          className="w-full h-full flex items-center justify-center p-1"
        >
          {renderDots(value || 1)}
        </motion.div>

        {/* Pulse glow when waiting for roll */}
        {!disabled && !isRolling && (
          <span className="absolute -top-2 -right-2 flex h-5 w-5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-5 w-5 bg-amber-500 text-[10px] text-white font-bold items-center justify-center border border-white/40">!</span>
          </span>
        )}
      </motion.button>

      <button
        id="btn-roll-dice-text"
        onClick={handleClick}
        disabled={disabled || isRolling}
        className={`px-5 py-2.5 rounded-full text-base sm:text-lg font-bold shadow-lg transition-all flex items-center gap-2 backdrop-blur-md border ${
          disabled
            ? 'bg-white/10 text-slate-400 border-white/10 cursor-not-allowed'
            : 'bg-gradient-to-r from-amber-500/90 via-orange-500/90 to-amber-500/90 border-white/30 text-white hover:brightness-110 active:scale-95 cursor-pointer shadow-orange-950/40'
        }`}
      >
        <span>🎲</span>
        <span>{isRolling ? 'Mengocok...' : 'LEMPAR DADU'}</span>
      </button>

      {playerName && (
        <span className="text-xs sm:text-sm font-bold text-slate-200">
          Giliran: <span className="text-amber-300 underline font-extrabold">{playerName}</span>
        </span>
      )}
    </div>
  );
};
