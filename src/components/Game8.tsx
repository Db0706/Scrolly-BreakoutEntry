"use client";

import React, { useEffect, useRef, useState } from "react";

const SPRITE_SIZE = 80;
const TARGET_SPEED = 5; // ✅ Adjust this to change target speed
const BOMB_SPEED = 10;   // ✅ Adjust this to change bomb speed

export default function Game3() {
  const [visible, setVisible] = useState(true);
  const [bombVisible, setBombVisible] = useState(true);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [bombPosition, setBombPosition] = useState({ x: 0, y: 0 });

  const directionRef = useRef({ dx: 1, dy: 1 });
  const bombDirectionRef = useRef({ dx: -1, dy: -1 });

  useEffect(() => {
    // Initial spawn
    setPosition({
      x: Math.random() * (window.innerWidth - SPRITE_SIZE),
      y: Math.random() * (window.innerHeight - SPRITE_SIZE),
    });

    setBombPosition({
      x: Math.random() * (window.innerWidth - SPRITE_SIZE),
      y: Math.random() * (window.innerHeight - SPRITE_SIZE),
    });

    const interval = setInterval(() => {
      setPosition((prev) => {
        let newX = prev.x + directionRef.current.dx * TARGET_SPEED;
        let newY = prev.y + directionRef.current.dy * TARGET_SPEED;

        if (newX < 0 || newX > window.innerWidth - SPRITE_SIZE)
          directionRef.current.dx *= -1;
        if (newY < 0 || newY > window.innerHeight - SPRITE_SIZE)
          directionRef.current.dy *= -1;

        return {
          x: Math.max(0, Math.min(window.innerWidth - SPRITE_SIZE, newX)),
          y: Math.max(0, Math.min(window.innerHeight - SPRITE_SIZE, newY)),
        };
      });

      setBombPosition((prev) => {
        let newX = prev.x + bombDirectionRef.current.dx * BOMB_SPEED;
        let newY = prev.y + bombDirectionRef.current.dy * BOMB_SPEED;

        if (newX < 0 || newX > window.innerWidth - SPRITE_SIZE)
          bombDirectionRef.current.dx *= -1;
        if (newY < 0 || newY > window.innerHeight - SPRITE_SIZE)
          bombDirectionRef.current.dy *= -1;

        return {
          x: Math.max(0, Math.min(window.innerWidth - SPRITE_SIZE, newX)),
          y: Math.max(0, Math.min(window.innerHeight - SPRITE_SIZE, newY)),
        };
      });
    }, 16);

    return () => clearInterval(interval);
  }, []);

  const handleTargetTap = () => {
    window.postMessage({ score: 1 }, "*");
    setVisible(false);
    setTimeout(() => {
      setVisible(true);
      setPosition({
        x: Math.random() * (window.innerWidth - SPRITE_SIZE),
        y: Math.random() * (window.innerHeight - SPRITE_SIZE),
      });
    }, 300);
  };

  const handleBombTap = () => {
    setBombVisible(false);
    setTimeout(() => {
      setBombVisible(true);
      setBombPosition({
        x: Math.random() * (window.innerWidth - SPRITE_SIZE),
        y: Math.random() * (window.innerHeight - SPRITE_SIZE),
      });
    }, 300);
  };

  return (
    <div className="h-dvh w-screen bg-[#111] relative overflow-hidden">
      {visible && (
        <div
          onClick={handleTargetTap}
          className="absolute"
          style={{
            top: position.y,
            left: position.x,
            width: SPRITE_SIZE,
            height: SPRITE_SIZE,
            cursor: "pointer",
          }}
        >
          <img
            src="/superteamuk_logo.jpeg"
            alt="Target"
            className="w-full h-full object-contain pointer-events-none"
          />
        </div>
      )}

      {bombVisible && (
        <div
          onClick={handleBombTap}
          className="absolute"
          style={{
            top: bombPosition.y,
            left: bombPosition.x,
            width: SPRITE_SIZE,
            height: SPRITE_SIZE,
            cursor: "pointer",
          }}
        >
          <img
            src="/bomb.png"
            alt="Bomb"
            className="w-full h-full object-contain pointer-events-none"
          />
        </div>
      )}
    </div>
  );
}
