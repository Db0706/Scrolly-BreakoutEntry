// components/Game8.tsx
"use client";

import React, { useRef, useEffect } from "react";

// grid dimensions
const ROWS = 10;
const COLS = 12;
// colors & speed
const COLORS = ["red", "orange", "yellow", "green", "cyan", "blue", "magenta"];
const SHOOT_SPEED = 8;

// how many pixels to keep free at the bottom
const BOTTOM_LIFT = 50;

export default function Game8() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gridRef = useRef<(null | { x: number; y: number; color: string })[][]>([]);
  const shooterAngle = useRef(Math.PI / 2);
  const bubble = useRef<{ x: number; y: number; vx: number; vy: number; color: string } | null>(null);
  const frame = useRef<number>();

  let R = 20;      // bubble radius
  let offsetX = 0; // grid X offset
  let offsetY = 0; // grid Y offset

  function initLayout(w: number, h: number) {
    // factor bottom lift out of h
    const usableH = h - BOTTOM_LIFT;
    const maxW = w / (COLS * 2);
    const maxH = (usableH - R * 4) / (ROWS * 2);
    R = Math.floor(Math.min(maxW, maxH));

    offsetX = (w - COLS * R * 2) / 2;
    offsetY = R;

    const grid: typeof gridRef.current = [];
    for (let r = 0; r < ROWS; r++) {
      grid[r] = [];
      for (let c = 0; c < COLS; c++) {
        const x = offsetX + c * 2 * R + R + (r % 2 ? R : 0);
        const y = offsetY + r * 2 * R + R;
        grid[r][c] = r < ROWS / 2
          ? { x, y, color: COLORS[Math.floor(Math.random() * COLORS.length)] }
          : null;
      }
    }
    gridRef.current = grid;
  }

  function findSlot(px: number, py: number) {
    let best = null as any, bestD = Infinity;
    gridRef.current.forEach((row, r) =>
      row.forEach((cell, c) => {
        if (!cell) {
          const cx = offsetX + c * 2 * R + R + (r % 2 ? R : 0);
          const cy = offsetY + r * 2 * R + R;
          const d = Math.hypot(px - cx, py - cy);
          if (d < bestD) {
            bestD = d;
            best = { r, c, x: cx, y: cy };
          }
        }
      })
    );
    return best;
  }

  function removeCluster(r0: number, c0: number, color: string) {
    const seen = new Set<string>();
    const stack: [number, number][] = [[r0, c0]];
    const cluster: [number, number][] = [];

    while (stack.length) {
      const [r, c] = stack.pop()!;
      const key = `${r},${c}`;
      if (r < 0 || r >= ROWS || c < 0 || c >= COLS || seen.has(key)) continue;
      seen.add(key);
      const cell = gridRef.current[r][c];
      if (cell && cell.color === color) {
        cluster.push([r, c]);
        ;[
          [r, c - 1], [r, c + 1],
          [r - 1, c], [r + 1, c],
          [r - 1, c + (r % 2 ? 0 : -1)],
          [r + 1, c + (r % 2 ? 0 : -1)],
        ].forEach(n => stack.push(n as any));
      }
    }

    if (cluster.length >= 3) {
      cluster.forEach(([r, c]) => gridRef.current[r][c] = null);
      window.postMessage({ score: cluster.length }, "*");
    }
  }

  function draw() {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 1) draw grid bubbles
    gridRef.current.forEach(row =>
      row.forEach(cell => {
        if (!cell) return;
        ctx.beginPath();
        ctx.arc(cell.x, cell.y, R, 0, Math.PI * 2);
        ctx.fillStyle = cell.color;
        ctx.fill();
        ctx.strokeStyle = "#222";
        ctx.stroke();
      })
    );

    // 2) dotted aim line
    const cx = canvas.width / 2;
    const cy = canvas.height - R * 2.5 - BOTTOM_LIFT;
    ctx.save();
    ctx.setLineDash([6, 6]);
    ctx.strokeStyle = "rgba(255,255,255,0.5)";
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(shooterAngle.current - Math.PI/2) * 2000,
               cy + Math.sin(shooterAngle.current - Math.PI/2) * 2000);
    ctx.stroke();
    ctx.restore();

    // 3) draw cannon
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(shooterAngle.current - Math.PI / 2);
    ctx.fillStyle = "#666";
    ctx.fillRect(-R * 0.2, 0, R * 0.4, R * 1.2);
    ctx.restore();

    // 4) spawn bubble
    if (!bubble.current) {
      bubble.current = {
        x: cx,
        y: cy - R,
        vx: 0, vy: 0,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
      };
    }

    // 5) draw & move shot
    const b = bubble.current!;
    ctx.beginPath();
    ctx.arc(b.x, b.y, R, 0, Math.PI * 2);
    ctx.fillStyle = b.color;
    ctx.fill();
    ctx.strokeStyle = "#222";
    ctx.stroke();

    if (b.vx || b.vy) {
      b.x += b.vx;
      b.y += b.vy;

      // bounce
      if (b.x < R || b.x > canvas.width - R) b.vx *= -1;

      // collision?
      outer: for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          const cell = gridRef.current[r][c];
          if (cell && Math.hypot(b.x - cell.x, b.y - cell.y) < 2 * R - 1) {
            const slot = findSlot(b.x, b.y);
            if (slot) {
              gridRef.current[slot.r][slot.c] = { x: slot.x, y: slot.y, color: b.color };
              removeCluster(slot.r, slot.c, b.color);
            }
            bubble.current = null;
            break outer;
          }
        }
      }

      // top
      if (b.y < offsetY + R && bubble.current) {
        const slot = findSlot(b.x, b.y);
        if (slot) {
          gridRef.current[slot.r][slot.c] = { x: slot.x, y: slot.y, color: b.color };
          removeCluster(slot.r, slot.c, b.color);
        }
        bubble.current = null;
      }
    }

    frame.current = requestAnimationFrame(draw);
  }

  useEffect(() => {
    const canvas = canvasRef.current!;

    function resize() {
      const p = canvas.parentElement!;
      canvas.width = p.clientWidth;
      canvas.height = p.clientHeight;
      initLayout(canvas.width, canvas.height);
    }
    resize();
    window.addEventListener("resize", resize);

    function onTap(e: PointerEvent) {
      const rect = canvas.getBoundingClientRect();
      const tx = e.clientX - rect.left;
      const ty = e.clientY - rect.top;
      const cx = canvas.width / 2;
      const cy = canvas.height - R * 2.5 - BOTTOM_LIFT;
      const dx = tx - cx;
      const dy = ty - cy;
      const angle = Math.atan2(dy, dx);
      shooterAngle.current = angle + Math.PI / 2;

      const s = bubble.current!;
      if (!s.vx && !s.vy) {
        s.vx = Math.cos(angle) * SHOOT_SPEED;
        s.vy = Math.sin(angle) * SHOOT_SPEED;
      }
    }

    canvas.addEventListener("pointerdown", onTap);

    draw();

    return () => {
      cancelAnimationFrame(frame.current!);
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("pointerdown", onTap);
    };
  }, []);

  return (
    <div className="h-svh w-screen bg-black flex items-center justify-center">
      <canvas
        ref={canvasRef}
        style={{ width: "100%", height: "100%", display: "block" }}
      />
    </div>
  );
}
