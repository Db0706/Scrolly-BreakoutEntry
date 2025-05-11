"use client";

import React, { useEffect, useRef, useState } from "react";

const GRAVITY = 2.5;
const FLAP_STRENGTH = -15;
const PIPE_GAP = 400;
const PIPE_WIDTH = 100;
const PIPE_SPEED = 5;
const BIRD_SIZE = 35;

interface Pipe {
  id: number;
  x: number;
  height: number;
  passed: boolean;
}

export default function Game7() {
  const [birdY, setBirdY] = useState(window.innerHeight / 2);
  const [velocity, setVelocity] = useState(0);
  const [pipes, setPipes] = useState<Pipe[]>([]);
  const [gameOver, setGameOver] = useState(false);
  const pipeId = useRef(0);

  const flap = () => {
    if (!gameOver) setVelocity(FLAP_STRENGTH);
  };

  const resetGame = () => {
    setBirdY(window.innerHeight / 2);
    setVelocity(0);
    setPipes([]);
    setGameOver(false);
    pipeId.current = 0;
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (gameOver) return;

      setVelocity((v) => v + GRAVITY);
      setBirdY((y) => {
        const nextY = y + velocity;
        if (nextY < 0 || nextY > window.innerHeight - BIRD_SIZE) {
          setGameOver(true);
          setTimeout(() => resetGame(), 1000); // ✅ Auto-restart after 1s
          return y;
        }
        return nextY;
      });
    }, 30);

    return () => clearInterval(interval);
  }, [velocity, gameOver]);

  useEffect(() => {
    const spawnInterval = setInterval(() => {
      if (gameOver) return;

      const topHeight =
        Math.floor(Math.random() * (window.innerHeight - PIPE_GAP - 100)) + 50;
      setPipes((prev) => [
        ...prev,
        {
          id: pipeId.current++,
          x: window.innerWidth,
          height: topHeight,
          passed: false,
        },
      ]);
    }, 1800);

    return () => clearInterval(spawnInterval);
  }, [gameOver]);

  useEffect(() => {
    const moveInterval = setInterval(() => {
      if (gameOver) return;

      setPipes((prev) =>
        prev
          .map((p) => {
            const birdX = 100;
            const inPipeX = birdX + BIRD_SIZE > p.x && birdX < p.x + PIPE_WIDTH;
            const inPipeY =
              birdY < p.height || birdY + BIRD_SIZE > p.height + PIPE_GAP;

            if (inPipeX && inPipeY) {
              setGameOver(true);
              setTimeout(() => resetGame(), 1000); // ✅ Auto-restart on hit
            }

            if (p.x + PIPE_WIDTH < birdX && !p.passed) {
              window.postMessage({ score: 1 }, "*"); // ✅ Sync with AppBar
              return { ...p, x: p.x - PIPE_SPEED, passed: true };
            }

            return { ...p, x: p.x - PIPE_SPEED };
          })
          .filter((p) => p.x + PIPE_WIDTH > 0)
      );
    }, 16);

    return () => clearInterval(moveInterval);
  }, [birdY, gameOver]);

  return (
    <div
      className="h-dvh w-screen bg-sky-900 text-white relative overflow-hidden"
      onTouchStart={flap}
    >
      {/* Bird */}
      <div
        className="absolute bg-yellow-400 rounded-full"
        style={{
          width: BIRD_SIZE,
          height: BIRD_SIZE,
          top: birdY,
          left: 100,
        }}
      />

      {/* Pipes */}
      {pipes.map((pipe) => (
        <React.Fragment key={pipe.id}>
          <div
            className="absolute bg-green-700"
            style={{
              width: PIPE_WIDTH,
              height: pipe.height,
              top: 0,
              left: pipe.x,
            }}
          />
          <div
            className="absolute bg-green-700"
            style={{
              width: PIPE_WIDTH,
              height: window.innerHeight - pipe.height - PIPE_GAP,
              top: pipe.height + PIPE_GAP,
              left: pipe.x,
            }}
          />
        </React.Fragment>
      ))}
    </div>
  );
}
