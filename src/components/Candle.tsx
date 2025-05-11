import { useEffect, useState } from "react";

interface CandleProps {
  height: number;
  isGreen: boolean;
  isDynamic?: boolean;
  onFinish?: (finalHeight: number) => void;
}

const Candle = ({ height, isGreen, isDynamic = false, onFinish }: CandleProps) => {
  const [dynamicHeight, setDynamicHeight] = useState(height);

  // If it's a dynamic candle, start growing/shrinking it
  useEffect(() => {
    if (isDynamic) {
      const growCandle = () => {
        let currentHeight = dynamicHeight;
        const interval = setInterval(() => {
          // Randomly grow/shrink the candle
          const change = Math.floor(Math.random() * 10) - 5; // Change height between -5 to +5
          currentHeight = Math.max(0, currentHeight + change); // Ensure it doesn't go below 0
          setDynamicHeight(currentHeight);

          // Stop growing/shrinking if the limit is reached
          if (currentHeight <= 60 || currentHeight >= 150) {
            clearInterval(interval);
            onFinish?.(currentHeight); // Call the onFinish callback
          }
        }, 200); // Change height every 200ms
      };
      growCandle();
    }
  }, [isDynamic, dynamicHeight, onFinish]);

  return (
    <div
      style={{
        width: '30px',
        height: `${isDynamic ? dynamicHeight : height}px`,
        backgroundColor: isGreen ? 'green' : 'red',
        marginRight: '4px',
        transition: 'height 0.2s ease', // Smooth transition for dynamic candle
      }}
    ></div>
  );
};

export default Candle;
