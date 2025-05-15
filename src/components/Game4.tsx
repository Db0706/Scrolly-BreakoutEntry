// components/BananaDash.tsx
"use client";

import React, { useRef, useEffect, useState } from "react";

const GRAVITY = 0.8;
const JUMP_VELOCITY = -22;

const BASE_BANANA_SPEED = 4;
const BANANA_INTERVAL = 1500; // ms
const BANANA_SIZE = 30;

const BASE_PIPE_SPEED = 6;
const PIPE_INTERVAL = 2000; // ms
const PIPE_WIDTH = 25;
const BASE_PIPE_HEIGHT = 100;
const PIPE_HEIGHT_VARIANCE = 60;

const GROUND_HEIGHT = 180;
const DIFFICULTY_INCREMENT = 0.0000005;
const FLIP_DURATION = 300; // ms

interface Banana { x: number; y: number; }
interface Pipe   { x: number; height: number; }

export default function BananaDash() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [monkeyImg, setMonkeyImg] = useState<HTMLImageElement|null>(null);
  const [gameOver, setGameOver] = useState(false);

  // load the saga sprite
  useEffect(() => {
    const img = new Image();
    img.src = "/saga.png";
    img.onload = () => setMonkeyImg(img);
  }, []);

  // game state refs
  const player = useRef({
    x: 50,
    y: 0,
    vy: 0,
    width: 50,
    height: 50,
  });
  const bananas    = useRef<Banana[]>([]);
  const pipes      = useRef<Pipe[]>([]);
  const lastBanana = useRef(performance.now());
  const lastPipe   = useRef(performance.now());
  const startTime  = useRef<number>();
  const flipStart  = useRef<number|null>(null);

  // reset function
  const resetAll = () => {
    // clear obstacles
    bananas.current = [];
    pipes.current   = [];
    // reset player
    const c = canvasRef.current!;
    player.current.y  = c.height - GROUND_HEIGHT - player.current.height;
    player.current.vy = 0;
    // clear timers
    startTime.current = undefined;
    lastBanana.current = performance.now();
    lastPipe.current   = performance.now();
    flipStart.current  = null;
    setGameOver(false);
  };

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx    = canvas.getContext("2d")!;
    let rafId: number;

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
      player.current.y = canvas.height - GROUND_HEIGHT - player.current.height;
    };
    window.addEventListener("resize", resize);
    resize();

    // banana emoji font
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.font = `${BANANA_SIZE}px serif`;

    const loop = (t: number) => {
      // GAME OVER SCREEN
      if (gameOver) {
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = "white";
        ctx.textAlign = "center";
        ctx.font = "bold 72px monospace";
        ctx.fillText("RUGGED", canvas.width/2, canvas.height/2 - 36);

        return; // skip rest
      }

      // init timer
      if (!startTime.current) startTime.current = t;
      const elapsed = t - startTime.current;
      const factor  = 1 + elapsed * DIFFICULTY_INCREMENT;

      const bananaSpeed    = BASE_BANANA_SPEED * factor;
      const pipeSpeed      = BASE_PIPE_SPEED   * factor;
      const bananaInterval = BANANA_INTERVAL  / factor;
      const pipeInterval   = PIPE_INTERVAL    / factor;

      // spawn bananas
      if (t - lastBanana.current > bananaInterval) {
        lastBanana.current = t;
        bananas.current.push({
          x: canvas.width + BANANA_SIZE,
          y: canvas.height - GROUND_HEIGHT - BANANA_SIZE - Math.random()*canvas.height*0.3,
        });
      }

      // spawn pipes
      if (t - lastPipe.current > pipeInterval) {
        lastPipe.current = t;
        const h = BASE_PIPE_HEIGHT + (Math.random()*2-1)*PIPE_HEIGHT_VARIANCE;
        pipes.current.push({ x: canvas.width + PIPE_WIDTH, height: h });
      }

      // clear
      ctx.clearRect(0,0,canvas.width,canvas.height);

      // sky
      ctx.fillStyle = "#87CEEB";
      ctx.fillRect(0,0,canvas.width,canvas.height-GROUND_HEIGHT);

      // ground
      ctx.fillStyle = "#8B4513";
      ctx.fillRect(0,canvas.height-GROUND_HEIGHT,canvas.width,GROUND_HEIGHT);

      // physics
      player.current.vy += GRAVITY;
      player.current.y  += player.current.vy;
      if (player.current.y > canvas.height - GROUND_HEIGHT - player.current.height) {
        player.current.y = canvas.height - GROUND_HEIGHT - player.current.height;
        player.current.vy = 0;
      }

      // rotation for kickflip
      let angle = 0;
      if (flipStart.current !== null) {
        const since = t - flipStart.current;
        const pct = Math.min(since/FLIP_DURATION,1);
        angle = pct * Math.PI*2;
        if (pct>=1) flipStart.current = null;
      }

      // draw skater+board
      const px=player.current.x, py=player.current.y, pw=player.current.width, ph=player.current.height;
      const cx=px+pw/2, cy=py+ph/2;
      ctx.save();
      ctx.translate(cx,cy);
      ctx.rotate(angle);
      ctx.translate(-cx,-cy);

      // skateboard deck
      ctx.fillStyle="#444";
      ctx.fillRect(px-5, py+ph-4, pw+10, 6);
      ctx.fillStyle="#222";
      ctx.fillRect(px-1, py+ph+2, 4,4);
      ctx.fillRect(px+pw+5-4,py+ph+2,4,4);

      // monkey sprite
      if (monkeyImg) {
        ctx.drawImage(monkeyImg, px, py-5, pw, ph);
      } else {
        ctx.fillStyle="white";
        ctx.fillRect(px,py,pw,ph);
      }
      ctx.restore();

      // bananas
      bananas.current = bananas.current.filter(b=>{
        b.x -= bananaSpeed;
        const hit = b.x < px+pw && b.x+BANANA_SIZE > px && b.y < py+ph && b.y+BANANA_SIZE > py;
        if(hit){
          window.postMessage({score:1},"*");
          return false;
        }
        return b.x+BANANA_SIZE>0;
      });
      ctx.fillStyle="yellow";
      bananas.current.forEach(b=>ctx.fillText("🍌", b.x, b.y));

      // pipes & collisions
      pipes.current = pipes.current.filter(p=>{
        p.x -= pipeSpeed;
        ctx.fillStyle="green";
        ctx.fillRect(p.x, canvas.height-GROUND_HEIGHT-p.height, PIPE_WIDTH, p.height);
        const coll = px+pw > p.x && px < p.x+PIPE_WIDTH && py+ph > canvas.height-GROUND_HEIGHT-p.height;
        if(coll){
          setGameOver(true);
          // flash RUGGED, reset after 1s
          setTimeout(resetAll,1000);
          window.postMessage({score:0,reset:true},"*");
          return false;
        }
        return p.x+PIPE_WIDTH>0;
      });

      rafId = requestAnimationFrame(loop);
    };

    rafId = requestAnimationFrame(loop);
    return ()=>{
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
    };
  },[monkeyImg, gameOver]);

  // jump + flip
  useEffect(()=>{
    const handler = ()=>{
      if(!gameOver && player.current.vy===0){
        player.current.vy = JUMP_VELOCITY;
        flipStart.current = performance.now();
      }
    };
    window.addEventListener("click", handler);
    window.addEventListener("touchstart", handler);
    return ()=>{
      window.removeEventListener("click", handler);
      window.removeEventListener("touchstart", handler);
    };
  },[gameOver]);

  return (
    <canvas
      ref={canvasRef}
      style={{width:"100vw",height:"100vh",display:"block"}}
    />
  );
}
