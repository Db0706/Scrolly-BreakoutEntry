// components/Game10.tsx
"use client";

import React, { useEffect, useRef, useState } from "react";

const ASTEROID_SIZE = 30;
const BULLET_HEIGHT = 10;
const BULLET_WIDTH = 4;
const SHIP_WIDTH = 20;
const SHIP_HEIGHT = 50;
const BULLET_SPEED = 10;
const ASTEROID_SPEED = 1;

interface Bullet { id: number; x: number; y: number; }
interface Asteroid { id: number; x: number; y: number; }

export default function Game10() {
  const [shipX, setShipX] = useState(window.innerWidth / 2 - SHIP_WIDTH / 2);
  const [bullets, setBullets] = useState<Bullet[]>([]);
  const [asteroids, setAsteroids] = useState<Asteroid[]>([]);
  const [gameOver, setGameOver] = useState(false);

  const bulletId = useRef(0);
  const asteroidId = useRef(0);

  // count of destroyed asteroids
  const destroyedCountRef = useRef(0);

  const resetGame = () => {
    setGameOver(false);
    setBullets([]);
    setAsteroids([]);
    destroyedCountRef.current = 0;
    setShipX(window.innerWidth / 2 - SHIP_WIDTH / 2);
  };

  const moveShip = (dir: "left" | "right") => {
    setShipX((x) => {
      const next = dir === "left" ? x - 30 : x + 30;
      return Math.max(0, Math.min(window.innerWidth - SHIP_WIDTH, next));
    });
  };

  // spawn bullets
  useEffect(() => {
    const iv = setInterval(() => {
      if (gameOver) return;
      setBullets((prev) => [
        ...prev,
        {
          id: bulletId.current++,
          x: shipX + SHIP_WIDTH / 2 - BULLET_WIDTH / 2,
          y: window.innerHeight - SHIP_HEIGHT - 10,
        },
      ]);
    }, 300);
    return () => clearInterval(iv);
  }, [shipX, gameOver]);

  // spawn asteroids
  useEffect(() => {
    const iv = setInterval(() => {
      if (gameOver) return;
      const x = Math.random() * (window.innerWidth - ASTEROID_SIZE);
      setAsteroids((prev) => [
        ...prev,
        { id: asteroidId.current++, x, y: -ASTEROID_SIZE },
      ]);
    }, 1000);
    return () => clearInterval(iv);
  }, [gameOver]);

  // game loop
  useEffect(() => {
    const loop = setInterval(() => {
      if (gameOver) return;

      // move bullets up and cull off-screen
      setBullets((prev) =>
        prev
          .map((b) => ({ ...b, y: b.y - BULLET_SPEED }))
          .filter((b) => b.y > 0)
      );

      // move asteroids down and check ship collisions
      setAsteroids((prev) =>
        prev
          .map((a) => ({ ...a, y: a.y + ASTEROID_SPEED }))
          .filter((a) => {
            if (a.y > window.innerHeight - SHIP_HEIGHT) {
              if (a.x < shipX + SHIP_WIDTH && a.x + ASTEROID_SIZE > shipX) {
                setGameOver(true);
                setTimeout(resetGame, 1000);
                return false;
              }
            }
            return a.y < window.innerHeight;
          })
      );

      // handle bullet–asteroid hits
      setAsteroids((current) =>
        current.filter((a) => {
          const hit = bullets.some(
            (b) =>
              b.x < a.x + ASTEROID_SIZE &&
              b.x + BULLET_WIDTH > a.x &&
              b.y < a.y + ASTEROID_SIZE &&
              b.y + BULLET_HEIGHT > a.y
          );
          if (hit) {
            destroyedCountRef.current += 1;
            // only award 1 point every 5 destroys
            if (destroyedCountRef.current % 5 === 0) {
              window.postMessage({ score: 1 }, "*");
            }
          }
          return !hit;
        })
      );
    }, 16);
    return () => clearInterval(loop);
  }, [bullets, shipX, gameOver]);

  return (
    <div
      className="h-dvh w-screen bg-black text-white relative overflow-hidden"
      onTouchStart={(e) => {
        const x = e.touches[0].clientX;
        moveShip(x < window.innerWidth / 2 ? "left" : "right");
      }}
    >
      {/* Ship */}
      <div
        className="absolute bg-blue-400 rounded"
        style={{
          width: SHIP_WIDTH,
          height: SHIP_HEIGHT,
          bottom: 40,
          left: shipX,
        }}
      />

      {/* Bullets */}
      {bullets.map((b) => (
        <div
          key={b.id}
          className="absolute bg-white"
          style={{
            width: BULLET_WIDTH,
            height: BULLET_HEIGHT,
            left: b.x,
            top: b.y,
          }}
        />
      ))}

      {/* Asteroids */}
      {asteroids.map((a) => (
        <div
          key={a.id}
          className="absolute bg-red-500 rounded-full"
          style={{
            width: ASTEROID_SIZE,
            height: ASTEROID_SIZE,
            left: a.x,
            top: a.y,
          }}
        />
      ))}
    </div>
  );
}