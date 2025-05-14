// components/Game1.tsx
"use client";

import React, { useEffect, useRef, useState } from "react";

export default function Game1() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [tapCount, setTapCount] = useState(0);     // raw taps
  const [score, setScore] = useState(0);           // actual points (every 10 taps)
  const [timeLeft, setTimeLeft] = useState(10);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const handleClick = () => {
    if (!running) {
      // start game
      setTapCount(0);
      setScore(0);
      setTimeLeft(10);
      setRunning(true);

      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            // end game
            clearInterval(intervalRef.current!);
            setRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      // count a tap
      setTapCount((prevTaps) => {
        const newTaps = prevTaps + 1;

        // every 10th tap = +1 score
        if (newTaps % 10 === 0) {
          setScore((prevScore) => {
            const next = prevScore + 1;
            // notify global AppBar
            window.postMessage({ score: 1 }, "*");
            return next;
          });
        }

        return newTaps;
      });
    }
  };

  // cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="h-vh w-screen bg-[#111] text-white flex flex-col justify-evenly items-center p-4"
    >
      <h1 className="text-2xl sm:text-3xl font-semibold">Tapping Game</h1>
      <p className="text-center text-base sm:text-lg">
        Tap the button as many times as you can in 10 seconds!
      </p>

      {/* Show raw tap count for debugging if you like */}
      {/* <div className="text-lg">Taps: {tapCount}</div> */}

      <div className="text-xl sm:text-2xl">Score: {score}</div>
      <div className="text-xl sm:text-2xl">Time: {timeLeft}</div>

      <button
        onClick={handleClick}
        disabled={running && timeLeft === 0}
        className="text-xl sm:text-2xl px-6 py-3 mt-4 rounded-lg bg-blue-500 hover:bg-blue-600 active:bg-blue-700 focus:outline-none disabled:opacity-50"
      >
        {running ? "TAP!" : "Start"}
      </button>
    </div>
  );
}
