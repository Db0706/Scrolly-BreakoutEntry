"use client";

import React, { useEffect, useRef, useState } from "react";

const GRAVITY = 2.5;
const FLAP_STRENGTH = -15;
const PIPE_GAP = 400;
const PIPE_WIDTH = 100;
const PIPE_SPEED = 5;
const BIRD_SIZE = 35; // also used as fontSize for emoji
const FUEL_SIZE = 30; // size of the fuel emoji

interface Pipe {
  id: number;
  x: number;
  height: number;
  passed: boolean;
}

interface Fuel {
  id: number;
  x: number;
  y: number;
}

export default function Game7() {
  const [birdY, setBirdY] = useState(window.innerHeight / 2);
  const [velocity, setVelocity] = useState(0);
  const [pipes, setPipes] = useState<Pipe[]>([]);
  const [fuels, setFuels] = useState<Fuel[]>([]);
  const [gameOver, setGameOver] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);

  const pipeId = useRef(0);
  const fuelId = useRef(0);

  // Hide instructions after 5s
  useEffect(() => {
    const timer = setTimeout(() => setShowInstructions(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  const flap = () => {
    if (!gameOver) setVelocity(FLAP_STRENGTH);
  };

  const resetGame = () => {
    setBirdY(window.innerHeight / 2);
    setVelocity(0);
    setPipes([]);
    setFuels([]);
    setGameOver(false);
    pipeId.current = 0;
    fuelId.current = 0;
    setShowInstructions(true);
  };

  // gravity & bird movement
  useEffect(() => {
    const iv = setInterval(() => {
      if (gameOver) return;
      setVelocity((v) => v + GRAVITY);
      setBirdY((y) => {
        const nextY = y + velocity;
        if (nextY < 0 || nextY > window.innerHeight - BIRD_SIZE) {
          setGameOver(true);
          setTimeout(resetGame, 1000);
          return y;
        }
        return nextY;
      });
    }, 30);
    return () => clearInterval(iv);
  }, [velocity, gameOver]);

  // spawn pipes & fuel
  useEffect(() => {
    const iv = setInterval(() => {
      if (gameOver) return;

      // spawn a pipe
      const topHeight =
        Math.floor(Math.random() * (window.innerHeight - PIPE_GAP - 100)) + 50;
      setPipes((prev) => [
        ...prev,
        { id: pipeId.current++, x: window.innerWidth, height: topHeight, passed: false },
      ]);

      // spawn a fuel pickup somewhere in the gap
      const yFuel =
        topHeight + Math.random() * (PIPE_GAP - FUEL_SIZE);
      setFuels((prev) => [
        ...prev,
        { id: fuelId.current++, x: window.innerWidth + PIPE_WIDTH / 2 - FUEL_SIZE / 2, y: yFuel },
      ]);
    }, 1800);
    return () => clearInterval(iv);
  }, [gameOver]);

  // move pipes, move fuel, handle collisions
  useEffect(() => {
    const iv = setInterval(() => {
      if (gameOver) return;

      const birdX = 100;

      // move pipes & detect pipe collisions / scoring
      setPipes((prev) =>
        prev
          .map((p) => {
            const inPipeX = birdX + BIRD_SIZE > p.x && birdX < p.x + PIPE_WIDTH;
            const inPipeY = birdY < p.height || birdY + BIRD_SIZE > p.height + PIPE_GAP;

            if (inPipeX && inPipeY) {
              setGameOver(true);
              setTimeout(resetGame, 1000);
            }

            if (p.x + PIPE_WIDTH < birdX && !p.passed) {
              window.postMessage({ score: 1 }, "*");
              return { ...p, x: p.x - PIPE_SPEED, passed: true };
            }

            return { ...p, x: p.x - PIPE_SPEED };
          })
          .filter((p) => p.x + PIPE_WIDTH > 0)
      );

      // move fuels & detect fuel collisions
      setFuels((prev) =>
        prev
          .map((f) => ({ ...f, x: f.x - PIPE_SPEED }))
          .filter((f) => {
            // collision?
            const hitX = f.x < birdX + BIRD_SIZE && f.x + FUEL_SIZE > birdX;
            const hitY = f.y < birdY + BIRD_SIZE && f.y + FUEL_SIZE > birdY;
            if (hitX && hitY) {
              window.postMessage({ score: 10 }, "*");
              return false; // remove on collect
            }
            return f.x + FUEL_SIZE > 0; // remove off-screen
          })
      );
    }, 16);
    return () => clearInterval(iv);
  }, [birdY, gameOver]);

  // compute tilt angle based on velocity
  const angle = Math.max(Math.min(velocity * 3, 45), -45); // clamp between -45° and +45°

  return (
    <div
      className="h-dvh w-screen bg-sky-900 text-white relative overflow-hidden"
      onTouchStart={flap}
    >
      {/* Instructions */}
      {showInstructions && (
        <div className="absolute top-0 left-0 w-full p-4 bg-black bg-opacity-60 text-center z-20">
          <h2 className="text-2xl font-bold mb-1">ROCKET MAN</h2>
          <p className="text-sm">
            Tap to make the rocket flap, dodge pipes, and collect fuel ⛽️ for +10!
          </p>
        </div>
      )}

      {/* Rocket Emoji */}
      <span
        className="absolute"
        style={{
          fontSize: BIRD_SIZE,
          width: BIRD_SIZE,
          height: BIRD_SIZE,
          top: birdY,
          left: 100,
          transform: `rotate(${angle}deg)`,
          transformOrigin: "center center",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        🚀
      </span>

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

      {/* Fuel pickups */}
      {fuels.map((f) => (
        <span
          key={f.id}
          className="absolute"
          style={{
            fontSize: FUEL_SIZE,
            width: FUEL_SIZE,
            height: FUEL_SIZE,
            top: f.y,
            left: f.x,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          ⛽️
        </span>
      ))}
    </div>
  );
}
