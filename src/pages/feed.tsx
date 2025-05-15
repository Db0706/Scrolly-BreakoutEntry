import React from "react";
import { ScrollFeed } from "../components/ScrollFeed";
import Game1 from "../components/Game1";
import Game2 from "../components/Game2";
import Game3 from "../components/Game3";
import Game4 from "../components/Game4";
import Game6 from "../components/Game6";
import Game7 from "../components/Game7";
import Game8 from "../components/Game8";
import Game9 from "../components/Game9";


export default function FeedPage() {
  return (
    <ScrollFeed>
      {[<Game4 key="g4" />,<Game1 key="g1" />,
        <Game2 key="g2" />,
        <Game3 key="g3" />,
        <Game6 key="g6" />,
        <Game7 key="g7" />,
        <Game8 key="g8" />,
        <Game9 key="g9" />]}
    </ScrollFeed>
  );
}
