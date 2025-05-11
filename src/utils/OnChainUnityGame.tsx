'use client';

import { useState } from 'react';

interface UnityGameProps {
  gameId: string;
  canvasId: string;
  activeGame: string | null;
  setActiveGame: (gameId: string) => void;
  onReload: () => void;
}

export const UnityGame = ({
  gameId,
  canvasId,
  activeGame,
  setActiveGame,
  onReload,
}: UnityGameProps) => {
  const [isLoaded, setIsLoaded] = useState(false);

  // Function to simulate game loading (you can replace this with real logic later)
  const handleLoadGame = () => {
    setIsLoaded(true); // Simulate game loaded after a delay
  };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        height: '80vh',
        margin: '0 auto',
        flexDirection: 'column',
        border: '2px solid #ccc',
      }}
    >
      {/* Placeholder content */}
      {!isLoaded && (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#f0f0f0',
          }}
        >
          <p>Placeholder for {gameId}</p>
        </div>
      )}

      {/* Load Game Button */}
      <div className="text-center mt-4">
        <button
          className="btn btn-lg btn-primary"
          onClick={handleLoadGame}
          disabled={isLoaded}
        >
          {isLoaded ? 'Game Loaded' : `Load ${gameId}`}
        </button>

        {/* Reload Button */}
        <button
          className="btn btn-lg btn-warning mt-2"
          onClick={onReload}
          disabled={!isLoaded}
        >
          Reload {gameId}
        </button>
      </div>
    </div>
  );
};
