import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Player, PlayerColor, Token, ThemeMode } from '../types/ludo';
import { getTokenGridCoord, SAFE_STAR_INDICES, TRACK_52 } from '../utils/ludoPaths';

interface LudoBoardCanvasProps {
  players: Player[];
  activeColor: PlayerColor;
  movableTokenIds: number[];
  onTokenClick: (tokenId: number) => void;
  hintTokenId: number | null;
  theme: ThemeMode;
}

const COLOR_HEX: Record<PlayerColor, { main: string; dark: string; light: string; border: string }> = {
  RED: { main: '#ef4444', dark: '#991b1b', light: '#fca5a5', border: '#7f1d1d' },
  GREEN: { main: '#10b981', dark: '#065f46', light: '#6ee7b7', border: '#047857' },
  YELLOW: { main: '#f59e0b', dark: '#78350f', light: '#fde047', border: '#b45309' },
  BLUE: { main: '#3b82f6', dark: '#1e3a8a', light: '#93c5fd', border: '#1d4ed8' }
};

export const LudoBoardCanvas: React.FC<LudoBoardCanvasProps> = ({
  players,
  activeColor,
  movableTokenIds,
  onTokenClick,
  hintTokenId,
  theme
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [boardSize, setBoardSize] = useState<number>(600);

  // Resize listener for responsive layout
  useEffect(() => {
    const handleResize = () => {
      const parent = canvasRef.current?.parentElement;
      if (parent) {
        const size = Math.min(parent.clientWidth - 16, window.innerHeight * 0.65, 620);
        setBoardSize(Math.max(size, 320));
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const cellSize = boardSize / 15;

  // Render loop using requestAnimationFrame for GPU accelerated rendering
  const renderBoard = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = boardSize * dpr;
    canvas.height = boardSize * dpr;
    ctx.scale(dpr, dpr);

    const isLight = theme === 'LIGHT';

    // 1. Draw Background
    ctx.fillStyle = isLight ? '#f1f5f9' : '#0f172a';
    ctx.fillRect(0, 0, boardSize, boardSize);

    // 2. Draw 4 Yards (Red, Green, Yellow, Blue)
    ctx.fillStyle = COLOR_HEX.RED.main;
    ctx.fillRect(0, 0, 6 * cellSize, 6 * cellSize);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(1 * cellSize, 1 * cellSize, 4 * cellSize, 4 * cellSize);

    ctx.fillStyle = COLOR_HEX.GREEN.main;
    ctx.fillRect(9 * cellSize, 0, 6 * cellSize, 6 * cellSize);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(10 * cellSize, 1 * cellSize, 4 * cellSize, 4 * cellSize);

    ctx.fillStyle = COLOR_HEX.YELLOW.main;
    ctx.fillRect(9 * cellSize, 9 * cellSize, 6 * cellSize, 6 * cellSize);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(10 * cellSize, 10 * cellSize, 4 * cellSize, 4 * cellSize);

    ctx.fillStyle = COLOR_HEX.BLUE.main;
    ctx.fillRect(0, 9 * cellSize, 6 * cellSize, 6 * cellSize);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(1 * cellSize, 10 * cellSize, 4 * cellSize, 4 * cellSize);

    // Inner Yard Base Circles
    const drawYardBaseCircles = (cx: number, cy: number, color: PlayerColor) => {
      [
        { x: cx + 0.5, y: cy + 0.5 }, { x: cx + 2.5, y: cy + 0.5 },
        { x: cx + 0.5, y: cy + 2.5 }, { x: cx + 2.5, y: cy + 2.5 }
      ].forEach(pos => {
        ctx.beginPath();
        ctx.arc((pos.x + 1) * cellSize, (pos.y + 1) * cellSize, cellSize * 0.55, 0, Math.PI * 2);
        ctx.fillStyle = COLOR_HEX[color].light;
        ctx.fill();
        ctx.lineWidth = 3;
        ctx.strokeStyle = COLOR_HEX[color].main;
        ctx.stroke();
      });
    };
    drawYardBaseCircles(0, 0, 'RED');
    drawYardBaseCircles(9, 0, 'GREEN');
    drawYardBaseCircles(9, 9, 'YELLOW');
    drawYardBaseCircles(0, 9, 'BLUE');

    // 3. Draw Track Cells
    for (let r = 0; r < 15; r++) {
      for (let c = 0; c < 15; c++) {
        if ((r < 6 && c < 6) || (r < 6 && c > 8) || (r > 8 && c < 6) || (r > 8 && c > 8) || (r >= 6 && r <= 8 && c >= 6 && c <= 8)) {
          continue;
        }

        ctx.fillStyle = isLight ? '#ffffff' : '#1e293b';
        ctx.fillRect(c * cellSize, r * cellSize, cellSize, cellSize);
        ctx.lineWidth = 1;
        ctx.strokeStyle = isLight ? 'rgba(0, 0, 0, 0.15)' : 'rgba(255, 255, 255, 0.15)';
        ctx.strokeRect(c * cellSize, r * cellSize, cellSize, cellSize);
      }
    }

    // 4. Draw Colored Home Stretches
    for (let c = 1; c <= 5; c++) {
      ctx.fillStyle = COLOR_HEX.RED.main;
      ctx.fillRect(c * cellSize, 7 * cellSize, cellSize, cellSize);
      ctx.strokeStyle = '#ffffff';
      ctx.strokeRect(c * cellSize, 7 * cellSize, cellSize, cellSize);
    }
    for (let r = 1; r <= 5; r++) {
      ctx.fillStyle = COLOR_HEX.GREEN.main;
      ctx.fillRect(7 * cellSize, r * cellSize, cellSize, cellSize);
      ctx.strokeStyle = '#ffffff';
      ctx.strokeRect(7 * cellSize, r * cellSize, cellSize, cellSize);
    }
    for (let c = 9; c <= 13; c++) {
      ctx.fillStyle = COLOR_HEX.YELLOW.main;
      ctx.fillRect(c * cellSize, 7 * cellSize, cellSize, cellSize);
      ctx.strokeStyle = '#ffffff';
      ctx.strokeRect(c * cellSize, 7 * cellSize, cellSize, cellSize);
    }
    for (let r = 9; r <= 13; r++) {
      ctx.fillStyle = COLOR_HEX.BLUE.main;
      ctx.fillRect(7 * cellSize, r * cellSize, cellSize, cellSize);
      ctx.strokeStyle = '#ffffff';
      ctx.strokeRect(7 * cellSize, r * cellSize, cellSize, cellSize);
    }

    // 5. Draw Start Cells
    const drawStartCell = (x: number, y: number, color: PlayerColor) => {
      ctx.fillStyle = COLOR_HEX[color].main;
      ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.strokeRect(x * cellSize, y * cellSize, cellSize, cellSize);
    };
    drawStartCell(1, 6, 'RED');
    drawStartCell(8, 1, 'GREEN');
    drawStartCell(13, 8, 'YELLOW');
    drawStartCell(6, 13, 'BLUE');

    // 6. Draw Safe Stars (⭐)
    const drawStar = (cx: number, cy: number) => {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      const rOuter = cellSize * 0.35;
      const rInner = cellSize * 0.15;
      for (let i = 0; i < 5; i++) {
        ctx.lineTo(Math.cos((18 + i * 72) * Math.PI / 180) * rOuter, -Math.sin((18 + i * 72) * Math.PI / 180) * rOuter);
        ctx.lineTo(Math.cos((54 + i * 72) * Math.PI / 180) * rInner, -Math.sin((54 + i * 72) * Math.PI / 180) * rInner);
      }
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.restore();
    };

    SAFE_STAR_INDICES.forEach(trackIdx => {
      const coord = TRACK_52[trackIdx];
      drawStar((coord.x + 0.5) * cellSize, (coord.y + 0.5) * cellSize);
    });

    // 7. Draw Home Center Triangles
    const cX = 7.5 * cellSize;
    const cY = 7.5 * cellSize;

    ctx.beginPath();
    ctx.moveTo(6 * cellSize, 6 * cellSize);
    ctx.lineTo(6 * cellSize, 9 * cellSize);
    ctx.lineTo(cX, cY);
    ctx.fillStyle = COLOR_HEX.RED.main;
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(6 * cellSize, 6 * cellSize);
    ctx.lineTo(9 * cellSize, 6 * cellSize);
    ctx.lineTo(cX, cY);
    ctx.fillStyle = COLOR_HEX.GREEN.main;
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(9 * cellSize, 6 * cellSize);
    ctx.lineTo(9 * cellSize, 9 * cellSize);
    ctx.lineTo(cX, cY);
    ctx.fillStyle = COLOR_HEX.YELLOW.main;
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(6 * cellSize, 9 * cellSize);
    ctx.lineTo(9 * cellSize, 9 * cellSize);
    ctx.lineTo(cX, cY);
    ctx.fillStyle = COLOR_HEX.BLUE.main;
    ctx.fill();

    ctx.font = `${cellSize * 0.8}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🏆', cX, cY);

    // 8. Draw Tokens & Stacking Badges
    const cellTokenMap: Record<string, { token: Token; player: Player }[]> = {};

    players.forEach(p => {
      p.tokens.forEach(t => {
        const coord = getTokenGridCoord(p.color, t.id, t.stepCount);
        const key = `${coord.x.toFixed(1)},${coord.y.toFixed(1)}`;
        if (!cellTokenMap[key]) cellTokenMap[key] = [];
        cellTokenMap[key].push({ token: t, player: p });
      });
    });

    Object.entries(cellTokenMap).forEach(([_, group]) => {
      const sameColorGroups: Record<PlayerColor, { token: Token; player: Player }[]> = {
        RED: [], GREEN: [], YELLOW: [], BLUE: []
      };
      group.forEach(item => sameColorGroups[item.player.color].push(item));

      group.forEach((item, idx) => {
        const { token, player } = item;
        const coord = getTokenGridCoord(player.color, token.id, token.stepCount);

        let offsetX = 0;
        let offsetY = 0;
        if (group.length > 1 && token.stepCount > 0 && token.stepCount < 57) {
          const angle = (idx / group.length) * Math.PI * 2;
          offsetX = Math.cos(angle) * (cellSize * 0.22);
          offsetY = Math.sin(angle) * (cellSize * 0.22);
        }

        const px = (coord.x + 0.5) * cellSize + offsetX;
        const py = (coord.y + 0.5) * cellSize + offsetY;
        const radius = cellSize * 0.38;

        const isMovable = player.color === activeColor && movableTokenIds.includes(token.id);
        const isHint = player.color === activeColor && hintTokenId === token.id;

        // 8a. Pulse Glow
        if (isMovable || isHint) {
          ctx.save();
          ctx.beginPath();
          ctx.arc(px, py, radius * 1.4, 0, Math.PI * 2);
          ctx.fillStyle = isHint ? 'rgba(245, 158, 11, 0.45)' : 'rgba(239, 68, 68, 0.4)';
          ctx.fill();
          ctx.restore();
        }

        // 8b. Shadow
        ctx.beginPath();
        ctx.arc(px + 2, py + 3, radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.fill();

        // 8c. Token Body Gradient
        const grad = ctx.createRadialGradient(px - radius * 0.3, py - radius * 0.3, radius * 0.1, px, py, radius);
        grad.addColorStop(0, '#ffffff');
        grad.addColorStop(0.3, COLOR_HEX[player.color].light);
        grad.addColorStop(0.8, COLOR_HEX[player.color].main);
        grad.addColorStop(1, COLOR_HEX[player.color].dark);

        ctx.beginPath();
        ctx.arc(px, py, radius, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();

        ctx.lineWidth = isMovable ? 3 : 2;
        ctx.strokeStyle = isHint ? '#f59e0b' : (isMovable ? '#ffffff' : COLOR_HEX[player.color].border);
        ctx.stroke();

        // 8d. Token Number
        ctx.fillStyle = '#ffffff';
        ctx.font = `bold ${radius * 0.9}px Outfit, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${token.id + 1}`, px, py + 1);

        // 8e. Stack Badge (x2, x3)
        const sameColorCount = sameColorGroups[player.color].length;
        if (sameColorCount > 1 && idx === 0 && token.stepCount > 0 && token.stepCount < 57) {
          ctx.save();
          ctx.beginPath();
          ctx.arc(px + radius * 0.7, py - radius * 0.7, radius * 0.55, 0, Math.PI * 2);
          ctx.fillStyle = '#0f172a';
          ctx.fill();
          ctx.strokeStyle = '#f59e0b';
          ctx.lineWidth = 1.5;
          ctx.stroke();

          ctx.fillStyle = '#f59e0b';
          ctx.font = `bold ${radius * 0.65}px Outfit, sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(`x${sameColorCount}`, px + radius * 0.7, py - radius * 0.7 + 1);
          ctx.restore();
        }
      });
    });
  }, [players, activeColor, movableTokenIds, boardSize, cellSize, hintTokenId, theme]);

  useEffect(() => {
    let animId: number;
    const loop = () => {
      renderBoard();
      animId = requestAnimationFrame(loop);
    };
    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [renderBoard]);

  // Canvas Click Handler (Direct token click selection)
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const activePlayer = players.find(p => p.color === activeColor);
    if (!activePlayer || movableTokenIds.length === 0) return;

    for (const tokenId of movableTokenIds) {
      const token = activePlayer.tokens[tokenId];
      const coord = getTokenGridCoord(activeColor, token.id, token.stepCount);
      const px = (coord.x + 0.5) * cellSize;
      const py = (coord.y + 0.5) * cellSize;
      const dist = Math.hypot(clickX - px, clickY - py);

      if (dist <= cellSize * 0.8) {
        onTokenClick(tokenId);
        return;
      }
    }
  };

  return (
    <div className="relative flex justify-center items-center p-2 rounded-2xl glass-panel shadow-2xl">
      <canvas
        ref={canvasRef}
        onClick={handleCanvasClick}
        style={{ width: boardSize, height: boardSize }}
        className="rounded-xl cursor-pointer touch-none shadow-inner"
      />
    </div>
  );
};
