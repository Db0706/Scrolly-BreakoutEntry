"use client";

import React, { useEffect, useState } from "react";

const GRID_SIZE = 4;
const TOTAL_CARDS = GRID_SIZE * GRID_SIZE;

type Card = {
  id: number;
  symbol: string;
  flipped: boolean;
  matched: boolean;
};

const SYMBOLS = ["🍕", "🚀", "🐶", "🎮", "💎", "🧠", "🍄", "⚡️"];

function shuffle<T>(array: T[]): T[] {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export default function Game9() {
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedIndexes, setFlippedIndexes] = useState<number[]>([]);
  const [gameWon, setGameWon] = useState(false);

  const resetGame = () => {
    const pairs = [...SYMBOLS, ...SYMBOLS];
    const shuffled = shuffle(pairs).map((symbol, index) => ({
      id: index,
      symbol,
      flipped: false,
      matched: false,
    }));
    setCards(shuffled);
    setFlippedIndexes([]);
    setGameWon(false);
  };

  useEffect(() => {
    resetGame();
  }, []);

  useEffect(() => {
    if (flippedIndexes.length === 2) {
      const [i1, i2] = flippedIndexes;
      const c1 = cards[i1];
      const c2 = cards[i2];

      if (c1.symbol === c2.symbol) {
        // Match
        setTimeout(() => {
          const updated = [...cards];
          updated[i1].matched = true;
          updated[i2].matched = true;
          setCards(updated);
          setFlippedIndexes([]);

          window.postMessage({ score: 1 }, "*"); // ✅ Global score update
        }, 600);
      } else {
        // Not match
        setTimeout(() => {
          const updated = [...cards];
          updated[i1].flipped = false;
          updated[i2].flipped = false;
          setCards(updated);
          setFlippedIndexes([]);
        }, 1000);
      }
    }

    // Win check
    if (cards.length && cards.every((c) => c.matched)) {
      setGameWon(true);
    }
  }, [flippedIndexes]);

  const handleFlip = (index: number) => {
    if (flippedIndexes.length >= 2 || cards[index].flipped || cards[index].matched) return;

    const updated = [...cards];
    updated[index].flipped = true;
    setCards(updated);
    setFlippedIndexes((prev) => [...prev, index]);
  };

  return (
    <div className="h-vh w-screen bg-black text-white flex flex-col items-center justify-center p-4">
      <div
        className="grid gap-2"
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${GRID_SIZE}, 60px)`,
          gridTemplateRows: `repeat(${GRID_SIZE}, 60px)`,
        }}
      >
        {cards.map((card, i) => (
          <div
            key={card.id}
            onClick={() => handleFlip(i)}
            className="bg-gray-800 rounded flex items-center justify-center cursor-pointer text-2xl"
            style={{
              backgroundColor: card.flipped || card.matched ? "#33ffbb" : "#111",
            }}
          >
            {(card.flipped || card.matched) ? card.symbol : "?"}
          </div>
        ))}
      </div>

      {gameWon && (
        <div className="absolute top-1/2 -translate-y-1/2 text-green-400 text-xl text-center">
          🎉 You matched them all!<br />
          <button
            className="mt-4 px-4 py-2 bg-white text-black rounded"
            onClick={resetGame}
          >
            Play Again
          </button>
        </div>
      )}
    </div>
  );
}
