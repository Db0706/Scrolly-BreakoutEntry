import React, { useEffect } from "react";

interface TurboGameProps {
  gamePath: string;
  canvasId: string;
}

export const TurboGame: React.FC<TurboGameProps> = ({ gamePath, canvasId }) => {
  useEffect(() => {
    const nippleScript = document.createElement("script");
    nippleScript.src =
      "https://cdn.jsdelivr.net/npm/nipplejs@0.8.6/dist/nipplejs.min.js";
    nippleScript.onload = () => console.log("nipplejs loaded successfully");
    nippleScript.onerror = () => console.error("Failed to load nipplejs.");
    document.body.appendChild(nippleScript);

    const script = document.createElement("script");
    script.src = gamePath;
    script.type = "module";
    script.onload = () => console.log("Game script loaded successfully");
    script.onerror = () => console.error(`Failed to load game: ${gamePath}`);
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
      document.body.removeChild(nippleScript);
    };
  }, [gamePath]);

  useEffect(() => {
    const player = document.getElementById("player");
    if (!player) {
      console.error("Player element (#player) not found!");
      return;
    }

    player.style.display = "flex";
    player.style.justifyContent = "center";
    player.style.alignItems = "center";
    player.style.width = "100%";
    player.style.height = "100%";
    player.style.position = "relative";

    const existingCanvas = document.getElementById(canvasId);
    if (!existingCanvas) {
      const canvas = document.createElement("canvas");
      canvas.id = canvasId;
      canvas.width = 800;
      canvas.height = 400;
      canvas.style.border = "2px solid blue"; // Debug border for canvas
      canvas.style.width = "100%";
      canvas.style.height = "100%";
      canvas.style.maxWidth = "1px";
      canvas.style.maxHeight = "1px";
      player.appendChild(canvas);
    }
  }, [canvasId]);

  return (
    <div
      id="player"
      className="relative flex justify-center items-center w-[800px] h-[400px] bg-black"
      style={{
        border: "2px solid green", // Debug border for player
        margin: "0 auto",
      }}
    ></div>
  );
};
