import React from 'react';
import { motion } from 'motion/react';
import { BoardConfig, Player } from '../types';
import { BoardEngine } from '../services/boardEngine';
import { BoardGraphics } from './BoardGraphics';

interface BoardProps {
  boardConfig: BoardConfig;
  players: Player[];
  activePlayerIndex: number;
  onTileClick?: (tileNumber: number) => void;
}

export const Board: React.FC<BoardProps> = ({
  boardConfig,
  players,
  activePlayerIndex,
  onTileClick
}) => {
  // Generate tiles array 1 to 100
  const tiles = Array.from({ length: 100 }, (_, i) => i + 1);

  // Group tiles into rows of 10 from top (row 9 = 100-91) to bottom (row 0 = 1-10)
  const rows: number[][] = [];
  for (let r = 9; r >= 0; r--) {
    const rowTiles: number[] = [];
    const isEven = r % 2 === 0;
    for (let c = 0; c < 10; c++) {
      const tileNum = isEven ? r * 10 + c + 1 : r * 10 + (9 - c) + 1;
      rowTiles.push(tileNum);
    }
    rows.push(rowTiles);
  }

  return (
    <div className="relative w-full aspect-square max-w-[650px] mx-auto bg-white/10 backdrop-blur-2xl rounded-3xl p-2.5 sm:p-3.5 shadow-2xl border-2 sm:border-4 border-white/30 select-none">
      {/* 1. Grid of 100 Tiles */}
      <div className="grid grid-rows-10 grid-cols-10 w-full h-full gap-0.5 sm:gap-1 rounded-2xl overflow-hidden bg-white/5 backdrop-blur-md border border-white/15">
        {rows.map((rowTiles, rIdx) =>
          rowTiles.map((tileNum) => {
            const style = BoardEngine.getTileStyle(tileNum);
            const events = BoardEngine.getTileEvents(tileNum, boardConfig);

            return (
              <div
                key={tileNum}
                id={`tile-${tileNum}`}
                onClick={() => onTileClick?.(tileNum)}
                className={`relative flex flex-col justify-between p-0.5 sm:p-1 border ${style.border} ${style.bg} transition-colors cursor-pointer group`}
              >
                {/* Tile Number Badge */}
                <div className="flex items-center justify-between w-full">
                  <span
                    className={`text-[8px] sm:text-xs font-black px-1 rounded-md leading-tight ${style.badgeBg}`}
                  >
                    {tileNum}
                  </span>

                  {/* Top-Right Special Icons */}
                  <div className="flex items-center gap-0.5 text-[8px] sm:text-xs">
                    {events.snakeHead && <span title="Kepala Ular">🐍</span>}
                    {events.ladderStart && <span title="Bawah Tangga">🪜</span>}
                    {events.special?.type === 'material' && <span title="Materi">📚</span>}
                    {events.special?.type === 'bonus' && <span title="Bonus">⭐</span>}
                    {events.special?.type === 'trivia' && <span title="Trivia">💡</span>}
                  </div>
                </div>

                {/* Center / Goal Highlight */}
                {tileNum === 100 && (
                  <div className="text-center font-black text-[9px] sm:text-sm text-amber-900 animate-pulse">
                    🏆 FINISH
                  </div>
                )}
                {tileNum === 1 && (
                  <div className="text-center font-black text-[9px] sm:text-xs text-emerald-800">
                    🚩 START
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* 2. SVG Overlay for Snakes and Ladders */}
      <BoardGraphics snakes={boardConfig.snakes} ladders={boardConfig.ladders} />

      {/* 3. Player Pawns Layer */}
      <div className="absolute inset-0 pointer-events-none p-2.5 sm:p-3">
        <div className="relative w-full h-full">
          {players.map((player, pIdx) => {
            const coord = BoardEngine.getTileCoordinate(player.position);
            const isActive = pIdx === activePlayerIndex;

            // Offset if multiple players are on the exact same tile
            const sameTilePlayers = players.filter(p => p.position === player.position);
            let offsetX = 0;
            let offsetY = 0;
            if (sameTilePlayers.length > 1) {
              const myOrder = sameTilePlayers.findIndex(p => p.id === player.id);
              offsetX = (myOrder === 0 ? -10 : 10);
              offsetY = (myOrder === 0 ? -6 : 6);
            }

            return (
              <motion.div
                key={player.id}
                id={`pawn-${player.id}`}
                layout
                animate={{
                  left: `calc(${coord.xPercent}% + ${offsetX}px)`,
                  top: `calc(${coord.yPercent}% + ${offsetY}px)`
                }}
                transition={{
                  type: 'spring',
                  stiffness: 280,
                  damping: 24
                }}
                className="absolute -translate-x-1/2 -translate-y-1/2 z-30"
              >
                <div className="relative flex flex-col items-center">
                  {/* Active Player Halo Indicator */}
                  {isActive && (
                    <motion.div
                      animate={{ scale: [1, 1.25, 1], opacity: [0.8, 0.3, 0.8] }}
                      transition={{ repeat: Infinity, duration: 1.2 }}
                      className="absolute -inset-1.5 rounded-full bg-amber-400 blur-xs"
                    />
                  )}

                  {/* Character Avatar Pawn Circle */}
                  <motion.div
                    whileHover={{ scale: 1.2 }}
                    animate={isActive ? { y: [0, -6, 0] } : { y: 0 }}
                    transition={isActive ? { repeat: Infinity, duration: 0.8 } : {}}
                    className={`w-7 h-7 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-sm sm:text-lg border-2 border-white shadow-lg bg-gradient-to-br ${player.character.bgGradient}`}
                    style={{
                      boxShadow: `0 4px 10px ${player.character.shadowColor}`
                    }}
                  >
                    <span>{player.character.avatar}</span>
                  </motion.div>

                  {/* Mini Name Pill */}
                  <span
                    className="mt-0.5 px-1.5 py-0.2 rounded-full text-[8px] sm:text-[10px] font-black text-white bg-slate-900/80 shadow whitespace-nowrap"
                  >
                    {player.name.split(' ')[0]}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
