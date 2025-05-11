// ScoreContext.tsx
import { createContext, useState, FC, ReactNode, useContext, useEffect } from "react";

interface ScoreContextType {
  score: number;
  setScore: (value: number | ((prevScore: number) => number)) => void; // Updated to support functional updates
  resetScore: () => void;
}

export const ScoreContext = createContext<ScoreContextType>({
  score: 0,
  setScore: () => {},
  resetScore: () => {},
});

export const ScoreProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [score, setScore] = useState<number>(0);

  useEffect(() => {
    console.log("Score Updated: ", score);
  }, [score]);

  const resetScore = () => {
    console.log("Resetting score to 0...");
    setScore(0);
  };

  return (
    <ScoreContext.Provider value={{ score, setScore, resetScore }}>
      {children}
    </ScoreContext.Provider>
  );
};

export const useScore = (): ScoreContextType => {
  const context = useContext(ScoreContext);
  if (!context) {
    throw new Error("useScore must be used within a ScoreProvider");
  }
  return context;
};