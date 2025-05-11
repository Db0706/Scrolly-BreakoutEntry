import { useState } from 'react';
import { Button, Typography } from "@mui/material";
import Head from "next/head";
import Candle from '../components/Candle';  // Updated Candle component with animation

const STOP_LOSS = 60; // Stop Loss at height 60
const TAKE_PROFIT = 150; // Take Profit at height 150

const SpinBot = () => {
  const [chartData, setChartData] = useState<{ height: number; isGreen: boolean }[]>([]);
  const [finalOutcome, setFinalOutcome] = useState<string | null>(null);
  const [spinning, setSpinning] = useState(false);
  const [isCandleAnimating, setIsCandleAnimating] = useState(false);

  const generateInitialCandles = () => {
    const initialCandles = [];
    for (let i = 0; i < 8; i++) {
      const height = Math.floor(Math.random() * 100) + 50;
      const isGreen = Math.random() > 0.5;
      initialCandles.push({ height, isGreen });
    }
    setChartData(initialCandles);
  };

  const handleSpin = async () => {
    setSpinning(true);
    setFinalOutcome(null);
    setIsCandleAnimating(true);
    generateInitialCandles();

    setTimeout(() => {
      setChartData((prevData) => [...prevData, { height: 100, isGreen: Math.random() > 0.5 }]);
    }, 100);
  };

  const handleFinalCandleFinish = (finalHeight: number) => {
    setIsCandleAnimating(false);

    if (finalHeight >= TAKE_PROFIT) {
      setFinalOutcome("Take Profit! You Win!");
    } else if (finalHeight <= STOP_LOSS) {
      setFinalOutcome("Stop Loss! You Lose!");
    } else {
      setFinalOutcome("No significant change! Try again.");
    }
    setSpinning(false);
  };

  return (
    <div className="spinbot-container">
      <Head>
        <title>Spin2Win</title>
      </Head>

      <Typography variant="h4" gutterBottom>
        Spin to Win
      </Typography>

      {/* Chart display */}
      <div className="spinbot-chart">
        <div className="spinbot-line stop-loss-line">
          <Typography variant="caption" style={{ color: 'red', position: 'absolute', right: 0 }}>
            Stop Loss
          </Typography>
        </div>

        <div className="spinbot-line take-profit-line">
          <Typography variant="caption" style={{ color: 'green', position: 'absolute', right: 0 }}>
            Take Profit
          </Typography>
        </div>

        {chartData.slice(0, -1).map((candle, index) => (
          <Candle key={index} height={candle.height} isGreen={candle.isGreen} />
        ))}

        {chartData.length === 9 && (
          <Candle
            height={chartData[8].height}
            isGreen={chartData[8].isGreen}
            isDynamic={isCandleAnimating}
            onFinish={handleFinalCandleFinish}
          />
        )}
      </div>

      <Button onClick={handleSpin} disabled={spinning} style={{ marginTop: '20px' }}>
        {spinning ? 'Spinning...' : 'Spin'}
      </Button>

      {finalOutcome && <Typography variant="h6" style={{ marginTop: "20px" }}>{finalOutcome}</Typography>}
    </div>
  );
};

export default SpinBot;
