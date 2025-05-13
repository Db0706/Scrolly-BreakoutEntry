// components/Game12.tsx
"use client";

import React, { useRef, useEffect, useState } from "react";

const GRAVITY = 0.6;
const JUMP = -12;
const OBSTACLE_WIDTH = 40;
const OBSTACLE_GAP = 200;
const RUNNER_WIDTH = 40;
const RUNNER_HEIGHT = 40;

export default function Game12() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [jumpRequested, setJumpRequested] = useState(false);
  const runner = useRef({ x: 50, y: 0, vy: 0 });
  const obstacles = useRef<{ x: number }[]>([]);
  const score = useRef(0);
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    let raf: number;

    const resize = () => {
      canvas.width = canvas.parentElement!.clientWidth;
      canvas.height = canvas.parentElement!.clientHeight;
      runner.current.y = canvas.height - RUNNER_HEIGHT - 10;
    };
    resize();
    window.addEventListener("resize", resize);

    const spawnObs = () =>
      obstacles.current.push({ x: canvas.width + OBSTACLE_WIDTH });

    const step = () => {
      const W = canvas.width;
      const H = canvas.height;
      ctx.clearRect(0, 0, W, H);

      // runner physics
      if (jumpRequested) {
        runner.current.vy = JUMP;
        setJumpRequested(false);
      }
      runner.current.vy += GRAVITY;
      runner.current.y = Math.min(
        H - RUNNER_HEIGHT - 10,
        runner.current.y + runner.current.vy
      );

      // obstacles
      if (Math.random() < 0.015) spawnObs();
      obstacles.current.forEach(o => (o.x -= 6));
      // remove offscreen & score
      obstacles.current = obstacles.current.filter(o => {
        if (o.x + OBSTACLE_WIDTH < 0) {
          score.current++;
          setDisplayScore(score.current);
          return false;
        }
        return true;
      });

      // collision
      obstacles.current.forEach(o => {
        if (
          o.x < runner.current.x + RUNNER_WIDTH &&
          o.x + OBSTACLE_WIDTH > runner.current.x &&
          runner.current.y + RUNNER_HEIGHT > H - RUNNER_HEIGHT - 10
        ) {
          // reset
          obstacles.current = [];
          score.current = 0;
          setDisplayScore(0);
          runner.current.y = H - RUNNER_HEIGHT - 10;
          runner.current.vy = 0;
        }
      });

      // draw runner
      ctx.fillStyle = "#fff";
      ctx.fillRect(
        runner.current.x,
        runner.current.y,
        RUNNER_WIDTH,
        RUNNER_HEIGHT
      );

      // draw ground
      ctx.fillStyle = "#555";
      ctx.fillRect(0, H - RUNNER_HEIGHT, W, RUNNER_HEIGHT);

      // draw obstacles
      ctx.fillStyle = "#f00";
      obstacles.current.forEach(o =>
        ctx.fillRect(o.x, H - RUNNER_HEIGHT - 10, OBSTACLE_WIDTH, RUNNER_HEIGHT)
      );

      // score
      ctx.fillStyle = "#0f0";
      ctx.font = "20px monospace";
      ctx.fillText(`Score: ${displayScore}`, 10, 30);

      raf = requestAnimationFrame(step);
    };
    step();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [jumpRequested, displayScore]);

  return (
    <div className="relative h-full w-full bg-black">
      <canvas ref={canvasRef} className="block w-full h-full" />
      <button
        onClick={() => setJumpRequested(true)}
        className="absolute bottom-4 right-4 bg-white text-black px-4 py-2 rounded"
      >
        Jump
      </button>
    </div>
  );
}
