// components/Game11.tsx
"use client";

import React, { useRef, useEffect, useState } from "react";

const COLORS = ["#e74c3c", "#f1c40f", "#27ae60"];
const BIRD_RADIUS = 12;
const SLING_X = 80;
const SLING_Y = 300;
const MAX_PULL = 100;

export default function Game11() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [pointA, setPointA] = useState({ x: SLING_X, y: SLING_Y });
  const [dragging, setDragging] = useState(false);
  const bird = useRef({ x: SLING_X, y: SLING_Y, vx: 0, vy: 0, color: COLORS[0] });
  const [launched, setLaunched] = useState(false);

  // draw loop
  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    let raf: number;

    const resize = () => {
      canvas.width = canvas.parentElement!.clientWidth;
      canvas.height = canvas.parentElement!.clientHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const step = () => {
      const W = canvas.width;
      const H = canvas.height;
      ctx.clearRect(0, 0, W, H);

      // slingshot base
      ctx.fillStyle = "#654321";
      ctx.fillRect(SLING_X - 5, SLING_Y, 10, 40);

      // draw rubber band
      if (!launched) {
        ctx.beginPath();
        ctx.moveTo(SLING_X, SLING_Y);
        ctx.lineTo(pointA.x, pointA.y);
        ctx.strokeStyle = "#ccc";
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // move bird if launched
      if (launched) {
        bird.current.vy += 0.5;             // gravity
        bird.current.x += bird.current.vx;
        bird.current.y += bird.current.vy;
      } else {
        bird.current.x = pointA.x;
        bird.current.y = pointA.y;
      }

      // draw bird
      ctx.beginPath();
      ctx.arc(bird.current.x, bird.current.y, BIRD_RADIUS, 0, Math.PI * 2);
      ctx.fillStyle = bird.current.color;
      ctx.fill();

      raf = requestAnimationFrame(step);
    };
    step();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [launched, pointA]);

  // input handlers
  useEffect(() => {
    const canvas = canvasRef.current!;
    const onDown = (e: MouseEvent | TouchEvent) => {
      const { left, top } = canvas.getBoundingClientRect();
      const x = (e as any).clientX - left;
      const y = (e as any).clientY - top;
      const d = Math.hypot(x - SLING_X, y - SLING_Y);
      if (d < 30 && !launched) {
        setDragging(true);
      }
    };
    const onMove = (e: MouseEvent | TouchEvent) => {
      if (!dragging) return;
      const { left, top } = canvas.getBoundingClientRect();
      let x = (e as any).clientX - left;
      let y = (e as any).clientY - top;
      const dx = x - SLING_X;
      const dy = y - SLING_Y;
      const dist = Math.min(MAX_PULL, Math.hypot(dx, dy));
      const angle = Math.atan2(dy, dx);
      setPointA({
        x: SLING_X + Math.cos(angle) * dist,
        y: SLING_Y + Math.sin(angle) * dist,
      });
    };
    const onUp = () => {
      if (!dragging) return;
      // launch
      const dx = SLING_X - pointA.x;
      const dy = SLING_Y - pointA.y;
      bird.current.vx = dx * 0.2;
      bird.current.vy = dy * 0.2;
      setLaunched(true);
      setDragging(false);
    };

    canvas.addEventListener("mousedown", onDown);
    canvas.addEventListener("touchstart", onDown);
    canvas.addEventListener("mousemove", onMove);
    canvas.addEventListener("touchmove", onMove);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchend", onUp);

    return () => {
      canvas.removeEventListener("mousedown", onDown);
      canvas.removeEventListener("touchstart", onDown);
      canvas.removeEventListener("mousemove", onMove);
      canvas.removeEventListener("touchmove", onMove);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchend", onUp);
    };
  }, [dragging, pointA]);

  return (
    <div className="relative h-full w-full bg-black">
      <canvas ref={canvasRef} className="block w-full h-full" />
      {!launched && (
        <button
          onClick={() => setLaunched(true)}
          className="absolute bottom-4 right-4 bg-white text-black px-4 py-2 rounded"
        >
          Fire
        </button>
      )}
    </div>
  );
}
