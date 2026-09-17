import React from 'react';
import { Snake, Ladder } from '../types';
import { BoardEngine } from '../services/boardEngine';

interface BoardGraphicsProps {
  snakes: Snake[];
  ladders: Ladder[];
}

export const BoardGraphics: React.FC<BoardGraphicsProps> = ({ snakes, ladders }) => {
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none z-10"
      viewBox="0 0 1000 1000"
      preserveAspectRatio="none"
    >
      <defs>
        {/* Snake Gradients */}
        <linearGradient id="snakeGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="50%" stopColor="#059669" />
          <stop offset="100%" stopColor="#047857" />
        </linearGradient>
        <linearGradient id="snakeGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f97316" />
          <stop offset="50%" stopColor="#ea580c" />
          <stop offset="100%" stopColor="#c2410c" />
        </linearGradient>
        <linearGradient id="snakeGrad3" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8b5cf6" />
          <stop offset="50%" stopColor="#7c3aed" />
          <stop offset="100%" stopColor="#6d28d9" />
        </linearGradient>

        {/* Ladder Gradients */}
        <linearGradient id="ladderPoleGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#d97706" />
          <stop offset="50%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#b45309" />
        </linearGradient>
        <linearGradient id="ladderRungGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#d97706" />
        </linearGradient>

        {/* Drop Shadows */}
        <filter id="shadow" x="-10%" y="-10%" width="130%" height="130%">
          <feDropShadow dx="3" dy="5" stdDeviation="4" floodOpacity="0.3" />
        </filter>
        <filter id="snakeShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="4" dy="6" stdDeviation="5" floodOpacity="0.35" />
        </filter>
      </defs>

      {/* LADDERS RENDERING */}
      {ladders.map((ladder, idx) => {
        const startCoord = BoardEngine.getTileCoordinate(ladder.start);
        const endCoord = BoardEngine.getTileCoordinate(ladder.end);

        // Convert percentage to 1000x1000 coordinate system
        const x1 = (startCoord.xPercent / 100) * 1000;
        const y1 = (startCoord.yPercent / 100) * 1000;
        const x2 = (endCoord.xPercent / 100) * 1000;
        const y2 = (endCoord.yPercent / 100) * 1000;

        const dx = x2 - x1;
        const dy = y2 - y1;
        const length = Math.sqrt(dx * dx + dy * dy);
        if (length === 0) return null;

        // Normal perpendicular vector for ladder width
        const nx = -dy / length;
        const ny = dx / length;
        const ladderWidth = 22; // width in SVG units

        // Left pole coords
        const lx1 = x1 + nx * (ladderWidth / 2);
        const ly1 = y1 + ny * (ladderWidth / 2);
        const lx2 = x2 + nx * (ladderWidth / 2);
        const ly2 = y2 + ny * (ladderWidth / 2);

        // Right pole coords
        const rx1 = x1 - nx * (ladderWidth / 2);
        const ry1 = y1 - ny * (ladderWidth / 2);
        const rx2 = x2 - nx * (ladderWidth / 2);
        const ry2 = y2 - ny * (ladderWidth / 2);

        // Rungs
        const rungsCount = Math.max(3, Math.floor(length / 45));
        const rungs = [];
        for (let i = 1; i < rungsCount; i++) {
          const t = i / rungsCount;
          const rxA = lx1 + (lx2 - lx1) * t;
          const ryA = ly1 + (ly2 - ly1) * t;
          const rxB = rx1 + (rx2 - rx1) * t;
          const ryB = ry1 + (ry2 - ry1) * t;
          rungs.push({ rxA, ryA, rxB, ryB, key: `rung-${ladder.id}-${i}` });
        }

        return (
          <g key={`ladder-${ladder.id || idx}`} filter="url(#shadow)" opacity="0.95">
            {/* Rungs */}
            {rungs.map(r => (
              <line
                key={r.key}
                x1={r.rxA}
                y1={r.ryA}
                x2={r.rxB}
                y2={r.ryB}
                stroke="url(#ladderRungGrad)"
                strokeWidth="7"
                strokeLinecap="round"
              />
            ))}
            {/* Left pole */}
            <line
              x1={lx1}
              y1={ly1}
              x2={lx2}
              y2={ly2}
              stroke="url(#ladderPoleGrad)"
              strokeWidth="9"
              strokeLinecap="round"
            />
            {/* Right pole */}
            <line
              x1={rx1}
              y1={ry1}
              x2={rx2}
              y2={ry2}
              stroke="url(#ladderPoleGrad)"
              strokeWidth="9"
              strokeLinecap="round"
            />
          </g>
        );
      })}

      {/* SNAKES RENDERING */}
      {snakes.map((snake, idx) => {
        const headCoord = BoardEngine.getTileCoordinate(snake.head);
        const tailCoord = BoardEngine.getTileCoordinate(snake.tail);

        const hx = (headCoord.xPercent / 100) * 1000;
        const hy = (headCoord.yPercent / 100) * 1000;
        const tx = (tailCoord.xPercent / 100) * 1000;
        const ty = (tailCoord.yPercent / 100) * 1000;

        const dx = tx - hx;
        const dy = ty - hy;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Control points for organic, friendly S-curve
        const midX = (hx + tx) / 2;
        const midY = (hy + ty) / 2;
        const perpX = -dy / dist;
        const perpY = dx / dist;

        const curveMagnitude = Math.min(80, dist * 0.25) * (idx % 2 === 0 ? 1 : -1);

        const cp1x = hx + dx * 0.25 + perpX * curveMagnitude;
        const cp1y = hy + dy * 0.25 + perpY * curveMagnitude;
        const cp2x = hx + dx * 0.75 - perpX * curveMagnitude;
        const cp2y = hy + dy * 0.75 - perpY * curveMagnitude;

        const pathD = `M ${hx} ${hy} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${tx} ${ty}`;
        const gradId = idx % 3 === 0 ? 'url(#snakeGrad1)' : idx % 3 === 1 ? 'url(#snakeGrad2)' : 'url(#snakeGrad3)';

        // Angle for head face
        const headAngle = Math.atan2(cp1y - hy, cp1x - hx) * (180 / Math.PI);

        return (
          <g key={`snake-${snake.id || idx}`} filter="url(#snakeShadow)">
            {/* Snake Body Outer Border */}
            <path
              d={pathD}
              fill="none"
              stroke="#0f172a"
              strokeWidth="26"
              strokeLinecap="round"
              opacity="0.3"
            />

            {/* Snake Body Main */}
            <path
              d={pathD}
              fill="none"
              stroke={gradId}
              strokeWidth="20"
              strokeLinecap="round"
            />

            {/* Snake Pattern / Belly Stripes */}
            <path
              d={pathD}
              fill="none"
              stroke="#fef08a"
              strokeWidth="7"
              strokeDasharray="14 18"
              strokeLinecap="round"
              opacity="0.9"
            />

            {/* Snake Tail tip */}
            <circle cx={tx} cy={ty} r="8" fill="#facc15" stroke="#ca8a04" strokeWidth="2" />

            {/* Cute Cartoon Snake Head */}
            <g transform={`translate(${hx}, ${hy}) rotate(${headAngle + 180})`}>
              {/* Head Base */}
              <ellipse cx="0" cy="0" rx="20" ry="17" fill={idx % 3 === 0 ? '#10b981' : idx % 3 === 1 ? '#f97316' : '#8b5cf6'} stroke="#ffffff" strokeWidth="2.5" />
              
              {/* Cute Smiling Cheeks */}
              <circle cx="-10" cy="-6" r="4" fill="#fb7185" opacity="0.8" />
              <circle cx="10" cy="-6" r="4" fill="#fb7185" opacity="0.8" />

              {/* Big Googly Eyes */}
              <circle cx="-8" cy="-5" r="5.5" fill="#ffffff" />
              <circle cx="8" cy="-5" r="5.5" fill="#ffffff" />
              <circle cx="-7" cy="-5" r="3" fill="#0f172a" />
              <circle cx="9" cy="-5" r="3" fill="#0f172a" />
              {/* Eye sparkle */}
              <circle cx="-8" cy="-6.5" r="1.5" fill="#ffffff" />
              <circle cx="8" cy="-6.5" r="1.5" fill="#ffffff" />

              {/* Cute Tongue */}
              <path d="M 0 14 Q -2 22 -6 25 M 0 14 Q 2 22 6 25" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            </g>
          </g>
        );
      })}
    </svg>
  );
};
