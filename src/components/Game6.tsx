import React, { useEffect, useRef, useState } from "react";

export default function Game1() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(10);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const handleClick = () => {
    if (!running) {
      setScore(0);
      setTimeLeft(10);
      setRunning(true);
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current!);
            setRunning(false);
            alert("Time's up! Your score: " + score);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      setScore((prev) => prev + 1);
      window.postMessage({ score: 1 }, "*"); // ✅ Update global AppBar score
    }
  };

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
      <div className="text-xl sm:text-2xl">Score: {score}</div>
      <div className="text-xl sm:text-2xl">Time: {timeLeft}</div>
      <button
        className="text-xl sm:text-2xl px-6 py-3 mt-4 rounded-lg bg-blue-500 hover:bg-blue-600 active:bg-blue-700 focus:outline-none disabled:opacity-50"
        onClick={handleClick}
        disabled={running && timeLeft === 0}
      >
        {running ? "TAP!" : "Start"}
      </button>
    </div>
  );
}
