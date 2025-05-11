"use client";

import React, { useEffect, useRef, useState } from "react";

const ASTEROID_SIZE = 30;
const BULLET_HEIGHT = 10;
const BULLET_WIDTH = 4;
const SHIP_WIDTH = 20;
const SHIP_HEIGHT = 50;
const BULLET_SPEED = 10;
const ASTEROID_SPEED = 1;

interface Bullet {
  id: number;
  x: number;
  y: number;
}

interface Asteroid {
  id: number;
  x: number;
  y: number;
}

export default function Game10() {
  const [shipX, setShipX] = useState(window.innerWidth / 2 - SHIP_WIDTH / 2);
  const [bullets, setBullets] = useState<Bullet[]>([]);
  const [asteroids, setAsteroids] = useState<Asteroid[]>([]);
  const [gameOver, setGameOver] = useState(false);
  const bulletId = useRef(0);
  const asteroidId = useRef(0);

  const resetGame = () => {
    setGameOver(false);
    setAsteroids([]);
    setBullets([]);
    setShipX(window.innerWidth / 2 - SHIP_WIDTH / 2);
  };

  const moveShip = (dir: "left" | "right") => {
    setShipX((x) => {
      const next = dir === "left" ? x - 30 : x + 30;
      return Math.max(0, Math.min(window.innerWidth - SHIP_WIDTH, next));
    });
  };

  useEffect(() => {
    const bulletInterval = setInterval(() => {
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
    return () => clearInterval(bulletInterval);
  }, [shipX, gameOver]);

  useEffect(() => {
    const asteroidInterval = setInterval(() => {
      if (gameOver) return;
      const x = Math.random() * (window.innerWidth - ASTEROID_SIZE);
      setAsteroids((prev) => [
        ...prev,
        { id: asteroidId.current++, x, y: -ASTEROID_SIZE },
      ]);
    }, 1000);
    return () => clearInterval(asteroidInterval);
  }, [gameOver]);

  useEffect(() => {
    const gameLoop = setInterval(() => {
      if (gameOver) return;

      setBullets((prev) =>
        prev
          .map((b) => ({ ...b, y: b.y - BULLET_SPEED }))
          .filter((b) => b.y > 0)
      );

      setAsteroids((prev) =>
        prev
          .map((a) => ({ ...a, y: a.y + ASTEROID_SPEED }))
          .filter((a) => {
            if (a.y > window.innerHeight - SHIP_HEIGHT) {
              if (a.x < shipX + SHIP_WIDTH && a.x + ASTEROID_SIZE > shipX) {
                setGameOver(true);
                setTimeout(() => resetGame(), 1000); // ✅ Auto restart
                return false;
              }
            }
            return a.y < window.innerHeight;
          })
      );

      setAsteroids((ast) => {
        return ast.filter((a) => {
          const hit = bullets.some(
            (b) =>
              b.x < a.x + ASTEROID_SIZE &&
              b.x + BULLET_WIDTH > a.x &&
              b.y < a.y + ASTEROID_SIZE &&
              b.y + BULLET_HEIGHT > a.y
          );
          if (hit) {
            window.postMessage({ score: 1 }, "*");
          }
          return !hit;
        });
      });
    }, 16);
    return () => clearInterval(gameLoop);
  }, [bullets, shipX, gameOver]);

  return (
    <div
      className="h-dvh w-screen bg-black text-white relative overflow-hidden"
      onTouchStart={(e) => {
        const x = e.touches[0].clientX;
        if (x < window.innerWidth / 2) moveShip("left");
        else moveShip("right");
      }}
    >
      <div
        className="absolute bg-blue-400 rounded"
        style={{
          width: SHIP_WIDTH,
          height: SHIP_HEIGHT,
          bottom: 10,
          left: shipX,
        }}
      />

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
