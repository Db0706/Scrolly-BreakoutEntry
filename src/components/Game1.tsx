"use client";

import React, { useEffect, useRef, useState } from "react";

const COLS = 10;
const ROWS = 20;
const EMPTY = 0;
const BLOCK = 1;

const createEmptyGrid = () =>
  Array.from({ length: ROWS }, () => Array(COLS).fill(EMPTY));

const SHAPES = [
  [[BLOCK, BLOCK, BLOCK, BLOCK]], // I Shape
  [
    [0, BLOCK, 0],
    [BLOCK, BLOCK, BLOCK],
  ], // T Shape
  [
    [BLOCK, 0],
    [BLOCK, 0],
    [BLOCK, BLOCK],
  ], // L Shape
];

const rotateShape = (shape: number[][]) =>
  shape[0].map((_, i) => shape.map((row) => row[i]).reverse());

export default function Game4() {
  const [grid, setGrid] = useState(createEmptyGrid());
  const [pos, setPos] = useState({ row: 0, col: 3 });
  const [shape, setShape] = useState<number[][]>(SHAPES[0]);
  const [active, setActive] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [speed, setSpeed] = useState(500); // Default speed

  const getMergedGrid = () => {
    const clone = grid.map((row) => [...row]);
    shape.forEach((r, i) =>
      r.forEach((cell, j) => {
        if (cell && clone[pos.row + i]?.[pos.col + j] !== undefined) {
          clone[pos.row + i][pos.col + j] = BLOCK;
        }
      })
    );
    return clone;
  };

  const isCollision = (nextRow: number, nextCol: number, testShape = shape) => {
    return testShape.some((r, i) =>
      r.some((cell, j) => {
        if (!cell) return false;
        const newRow = nextRow + i;
        const newCol = nextCol + j;
        return (
          newRow >= ROWS ||
          newCol < 0 ||
          newCol >= COLS ||
          grid[newRow]?.[newCol] === BLOCK
        );
      })
    );
  };

  const mergeShape = () => {
    const newGrid = grid.map((row) => [...row]);
    shape.forEach((r, i) =>
      r.forEach((cell, j) => {
        if (cell && newGrid[pos.row + i]?.[pos.col + j] !== undefined) {
          newGrid[pos.row + i][pos.col + j] = BLOCK;
        }
      })
    );
    clearRows(newGrid);
  };

  const clearRows = (gridToCheck: number[][]) => {
    const newGrid = gridToCheck.filter((row) => row.some((cell) => cell === EMPTY));
    const cleared = ROWS - newGrid.length;
    if (cleared > 0) {
      const emptyRows = Array.from({ length: cleared }, () => Array(COLS).fill(EMPTY));
      setGrid([...emptyRows, ...newGrid]);

      for (let i = 0; i < cleared; i++) {
        window.postMessage({ score: 1 }, "*");
      }
    } else {
      setGrid(gridToCheck);
    }
  };

  const resetPiece = () => {
    const startPos = { row: 0, col: 3 };
    const nextShape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
    if (isCollision(startPos.row, startPos.col, nextShape)) {
      setGrid(createEmptyGrid());
      setShape(SHAPES[0]);
      setPos(startPos);
    } else {
      setShape(nextShape);
      setPos(startPos);
    }
    setSpeed(500); // Reset speed after placing
  };

  const drop = () => {
    if (!isCollision(pos.row + 1, pos.col)) {
      setPos((p) => ({ ...p, row: p.row + 1 }));
    } else {
      mergeShape();
      resetPiece();
    }
  };

  const move = (dir: "left" | "right") => {
    const offset = dir === "left" ? -1 : 1;
    if (!isCollision(pos.row, pos.col + offset)) {
      setPos((p) => ({ ...p, col: p.col + offset }));
    }
  };

  const rotate = () => {
    const rotated = rotateShape(shape);
    if (!isCollision(pos.row, pos.col, rotated)) {
      setShape(rotated);
    }
  };

  const speedUpDrop = () => {
    setSpeed(100); // Increase speed to 5x faster
  };

  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      if (active) drop();
    }, speed);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [pos, shape, grid, speed]);

  const mergedGrid = getMergedGrid();

  const handleTouch = (e: React.TouchEvent) => {
    const x = e.nativeEvent.touches[0].clientX;
    if (x < window.innerWidth / 2) {
      move("left");
    } else {
      move("right");
    }
  };

  return (
    <div
      className="h-svh w-screen bg-black text-white flex flex-col items-center justify-center relative"
      onTouchStart={handleTouch}
    >
      <div
        className="grid"
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${COLS}, 20px)`,
          marginBottom: "1rem",
        }}
      >
        {mergedGrid.flat().map((cell, i) => (
          <div
            key={i}
            className="w-5 h-5 border border-gray-700"
            style={{
              backgroundColor: cell === BLOCK ? "#33ffbb" : "#111",
            }}
          />
        ))}
      </div>

      <div className="flex gap-4 z-10">
        <button
          onClick={rotate}
          onTouchStart={(e) => e.stopPropagation()}      // ← here
          className="bg-[#33ffbb] text-black text-sm px-4 py-2 rounded"
        >
          Rotate
        </button>
        <button
          onClick={speedUpDrop}
          onTouchStart={(e) => e.stopPropagation()}      // ← and here
          className="bg-[#33ffbb] text-black text-sm px-4 py-2 rounded"
        >
          Drop
        </button>
      </div>
    </div>
  );
}