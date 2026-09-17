import { BoardConfig, TileSpecialInfo, Snake, Ladder } from '../types';

export interface TileCoordinate {
  tileNumber: number;
  row: number; // 0 (bottom) to 9 (top)
  col: number; // 0 (left) to 9 (right)
  xPercent: number; // 0 to 100% center
  yPercent: number; // 0 to 100% center
}

export class BoardEngine {
  /**
   * Convert tile number (1-100) to grid coordinates & percentages
   */
  public static getTileCoordinate(tileNumber: number): TileCoordinate {
    const clamped = Math.max(1, Math.min(100, tileNumber));
    const zeroIndexed = clamped - 1;
    const row = Math.floor(zeroIndexed / 10); // 0 (bottom row) to 9 (top row)
    const remainder = zeroIndexed % 10;

    // Even rows (0, 2, 4, 6, 8) go Left-to-Right (0 to 9)
    // Odd rows (1, 3, 5, 7, 9) go Right-to-Left (9 down to 0)
    const isEvenRow = row % 2 === 0;
    const col = isEvenRow ? remainder : 9 - remainder;

    // In SVG / CSS percentage:
    // y goes from 0% (top) to 100% (bottom)
    // Row 9 is top -> y centered at 5%
    // Row 0 is bottom -> y centered at 95%
    const xPercent = (col + 0.5) * 10;
    const yPercent = (9 - row + 0.5) * 10;

    return {
      tileNumber: clamped,
      row,
      col,
      xPercent,
      yPercent
    };
  }

  /**
   * Check if a tile has a snake head, ladder start, material, or bonus
   */
  public static getTileEvents(
    tileNumber: number,
    boardConfig: BoardConfig
  ): {
    snakeHead?: Snake;
    snakeTail?: Snake;
    ladderStart?: Ladder;
    ladderEnd?: Ladder;
    special?: TileSpecialInfo;
  } {
    const snakeHead = boardConfig.snakes.find(s => s.head === tileNumber);
    const snakeTail = boardConfig.snakes.find(s => s.tail === tileNumber);
    const ladderStart = boardConfig.ladders.find(l => l.start === tileNumber);
    const ladderEnd = boardConfig.ladders.find(l => l.end === tileNumber);
    const special = boardConfig.specialTiles.find(t => t.boxNumber === tileNumber);

    return {
      snakeHead,
      snakeTail,
      ladderStart,
      ladderEnd,
      special
    };
  }

  /**
   * Vibrant, playful color palette for board tiles
   */
  public static getTileStyle(tileNumber: number): {
    bg: string;
    border: string;
    badgeBg: string;
    textColor: string;
  } {
    if (tileNumber === 100) {
      return {
        bg: 'bg-gradient-to-br from-amber-400/80 via-yellow-500/85 to-amber-600/90 backdrop-blur-md',
        border: 'border-amber-300/90',
        badgeBg: 'bg-amber-600/90 text-white border border-white/40',
        textColor: 'text-amber-100 font-black'
      };
    }
    if (tileNumber === 1) {
      return {
        bg: 'bg-gradient-to-br from-emerald-500/70 to-teal-600/80 backdrop-blur-md',
        border: 'border-emerald-300/80',
        badgeBg: 'bg-emerald-600/90 text-white border border-white/40',
        textColor: 'text-emerald-100 font-black'
      };
    }

    const mod = tileNumber % 5;
    switch (mod) {
      case 0:
        return {
          bg: 'bg-rose-500/20 hover:bg-rose-500/35 backdrop-blur-xs',
          border: 'border-rose-400/30',
          badgeBg: 'bg-rose-500/80 text-white border border-rose-300/30',
          textColor: 'text-rose-100'
        };
      case 1:
        return {
          bg: 'bg-sky-500/20 hover:bg-sky-500/35 backdrop-blur-xs',
          border: 'border-sky-400/30',
          badgeBg: 'bg-sky-500/80 text-white border border-sky-300/30',
          textColor: 'text-sky-100'
        };
      case 2:
        return {
          bg: 'bg-amber-500/20 hover:bg-amber-500/35 backdrop-blur-xs',
          border: 'border-amber-400/30',
          badgeBg: 'bg-amber-500/80 text-white border border-amber-300/30',
          textColor: 'text-amber-100'
        };
      case 3:
        return {
          bg: 'bg-emerald-500/20 hover:bg-emerald-500/35 backdrop-blur-xs',
          border: 'border-emerald-400/30',
          badgeBg: 'bg-emerald-500/80 text-white border border-emerald-300/30',
          textColor: 'text-emerald-100'
        };
      case 4:
      default:
        return {
          bg: 'bg-purple-500/20 hover:bg-purple-500/35 backdrop-blur-xs',
          border: 'border-purple-400/30',
          badgeBg: 'bg-purple-500/80 text-white border border-purple-300/30',
          textColor: 'text-purple-100'
        };
    }
  }
}
