"use client";

import React, { useEffect, useRef, useState } from "react";

const FRUIT_LAUNCH_INTERVAL = 1000;
const FRUIT_FALL_SPEED = 3;
const FRUIT_SIZE = 60;

interface Fruit {
  id: number;
  x: number;
  y: number;
  sliced: boolean;
}

export default function Game5() {
  const [fruits, setFruits] = useState<Fruit[]>([]);
  const [score, setScore] = useState(0);
  const [misses, setMisses] = useState(0);
  const fruitId = useRef(0);

  const launchFruit = () => {
    const x = Math.random() * (window.innerWidth - FRUIT_SIZE);
    setFruits((prev) => [
      ...prev,
      { id: fruitId.current++, x, y: window.innerHeight, sliced: false },
    ]);
  };

  const resetGame = () => {
    setScore(0);
    setMisses(0);
    setFruits([]);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (misses < 3) {
        launchFruit();
      }
    }, FRUIT_LAUNCH_INTERVAL);
    return () => clearInterval(interval);
  }, [misses]);

  useEffect(() => {
    const fallInterval = setInterval(() => {
      setFruits((prev) =>
        prev
          .map((fruit) => {
            if (!fruit.sliced) {
              return { ...fruit, y: fruit.y - FRUIT_FALL_SPEED };
            }
            return fruit;
          })
          .filter((fruit) => {
            if (fruit.y < -FRUIT_SIZE && !fruit.sliced) {
              setMisses((m) => {
                const newMisses = m + 1;
                if (newMisses >= 3) {
                  setTimeout(() => resetGame(), 1000);
                }
                return newMisses;
              });
              return false;
            }
            return true;
          })
      );
    }, 16);
    return () => clearInterval(fallInterval);
  }, []);

  const handleSlice = (id: number) => {
    setFruits((prev) =>
      prev.map((fruit) =>
        fruit.id === id ? { ...fruit, sliced: true } : fruit
      )
    );
    window.postMessage({ score: 1 }, "*");
  };

  return (
    <div className="h-dvh w-screen bg-black relative overflow-hidden text-white flex flex-col items-center justify-center">
      {/* <div className="absolute top-4 left-4 text-sm z-10">
        Misses: {misses}/3
      </div> */}

      {fruits.map((fruit) => (
        <div
          key={fruit.id}
          onClick={() => handleSlice(fruit.id)}
          className={`absolute rounded-full ${
            fruit.sliced ? "opacity-20" : "opacity-100"
          }`}
          style={{
            width: FRUIT_SIZE,
            height: FRUIT_SIZE,
            backgroundColor: "#ff4d4f",
            top: fruit.y,
            left: fruit.x,
            transition: "opacity 0.2s",
          }}
        />
      ))}
    </div>
  );
}
