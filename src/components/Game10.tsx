// components/GameSnake.tsx
"use client";

import React, { useRef, useEffect, useState } from "react";

const CELL_SIZE = 20;      // size of one snake segment / apple
const INITIAL_SPEED = 150; // move interval in ms
const INITIAL_LENGTH = 5;  // starting snake length

export default function GameSnake() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);

  const snakeRef = useRef<{ x: number; y: number }[]>([]);
  const dirRef   = useRef<{ dx: number; dy: number }>({ dx: 1, dy: 0 });
  const appleRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const timerRef = useRef<number>();

  // place apple in a free spot
  const placeApple = (cols: number, rows: number) => {
    let ax: number, ay: number;
    do {
      ax = Math.floor(Math.random() * cols);
      ay = Math.floor(Math.random() * rows);
    } while (snakeRef.current.some(s => s.x === ax && s.y === ay));
    appleRef.current = { x: ax, y: ay };
  };

  // reset snake & score
  const reset = (cols: number, rows: number) => {
    const sx = Math.floor(cols / 2);
    const sy = Math.floor(rows / 2);
    snakeRef.current = Array.from({ length: INITIAL_LENGTH }, (_, i) => ({
      x: sx - i,
      y: sy
    }));
    dirRef.current = { dx: 1, dy: 0 };
    placeApple(cols, rows);
    setScore(0);
    window.postMessage({ score: 0 }, "*");
  };

  // one tick
  const step = (cols: number, rows: number) => {
    const snake = snakeRef.current;
    const head  = snake[0];
    let nx = head.x + dirRef.current.dx;
    let ny = head.y + dirRef.current.dy;

    // wrap around edges
    if (nx < 0)       nx = cols - 1;
    else if (nx >= cols) nx = 0;
    if (ny < 0)       ny = rows - 1;
    else if (ny >= rows) ny = 0;

    // self-collision → reset
    if (snake.some(seg => seg.x === nx && seg.y === ny)) {
      reset(cols, rows);
      return;
    }

    snake.unshift({ x: nx, y: ny });

    // ate apple?
    if (nx === appleRef.current.x && ny === appleRef.current.y) {
      setScore(s => {
        const ns = s + 1;
        window.postMessage({ score: ns }, "*");
        return ns;
      });
      placeApple(cols, rows);
    } else {
      snake.pop();
    }
  };

  // draw everything
  const draw = () => {
    const canvas = canvasRef.current!;
    const ctx    = canvas.getContext("2d")!;
    const w      = canvas.width;
    const h      = canvas.height;

    // background
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, w, h);

    // draw apple 🍎
    const ax = appleRef.current.x * CELL_SIZE + CELL_SIZE / 2;
    const ay = appleRef.current.y * CELL_SIZE + CELL_SIZE / 2;
    ctx.font = `${CELL_SIZE}px sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("🍎", ax, ay);

    // draw snake
    ctx.fillStyle = "#3f3";
    snakeRef.current.forEach(seg => {
      ctx.fillRect(
        seg.x * CELL_SIZE,
        seg.y * CELL_SIZE,
        CELL_SIZE - 1,
        CELL_SIZE - 1
      );
    });
  };

  // main setup: resize, controls, loop
  useEffect(() => {
    const canvas = canvasRef.current!;
    const parent = canvas.parentElement!;

    const resize = () => {
      canvas.width  = parent.clientWidth;
      canvas.height = parent.clientHeight;
      const cols = Math.floor(canvas.width  / CELL_SIZE);
      const rows = Math.floor(canvas.height / CELL_SIZE);
      reset(cols, rows);
    };
    resize();
    window.addEventListener("resize", resize);

    // tap to turn (no instant 180°)
    const onPointerDown = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const cx   = Math.floor((e.clientX - rect.left) / CELL_SIZE);
      const cy   = Math.floor((e.clientY - rect.top ) / CELL_SIZE);
      const head = snakeRef.current[0];
      const dx   = cx - head.x;
      const dy   = cy - head.y;
      let ndx = 0, ndy = 0;
      if (Math.abs(dx) > Math.abs(dy)) ndx = dx > 0 ? 1 : -1;
      else                             ndy = dy > 0 ? 1 : -1;
      // ignore reverse
      if (ndx === -dirRef.current.dx && ndy === -dirRef.current.dy) return;
      dirRef.current = { dx: ndx, dy: ndy };
    };
    canvas.addEventListener("pointerdown", onPointerDown);

    // game loop
    timerRef.current = window.setInterval(() => {
      const cols = Math.floor(canvas.width  / CELL_SIZE);
      const rows = Math.floor(canvas.height / CELL_SIZE);
      step(cols, rows);
      draw();
    }, INITIAL_SPEED);

    return () => {
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("pointerdown", onPointerDown);
      clearInterval(timerRef.current);
    };
  }, []);

  return (
    <div className="h-full w-full bg-black">
      <canvas
        ref={canvasRef}
        style={{ width: "100%", height: "100%", display: "block" }}
      />
    </div>
  );
}
