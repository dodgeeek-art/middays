"use client";

import React, { useState, useEffect, useRef } from "react";
import { ArrowLeft, Play, ArrowRight, Volume2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { alphabetData } from "@/lib/alphabetData";
import { objectDictionary } from "@/lib/svgDictionary";

interface Bubble {
  id: number;
  letter: string;
  x: number; // horizontal offset percentage (10% to 90%)
  y: number; // vertical offset pixels from bottom
  size: number;
  speed: number;
  color: string;
  shaking: boolean;
  shakeOffset: number;
}

interface Particle {
  id: number;
  x: number; // percentage
  y: number; // px from bottom
  vx: number; // velocity x
  vy: number; // velocity y
  color: string;
  size: number;
  alpha: number;
}

interface BubblePopEngineProps {
  childId: string;
  onBack: () => void;
}

export default function BubblePopEngine({ childId, onBack }: BubblePopEngineProps) {
  const [gameState, setGameState] = useState<"start" | "playing" | "victory">("start");
  const [targetLetter, setTargetLetter] = useState("A");
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [poppedCount, setPoppedCount] = useState(0);
  const [startTime, setStartTime] = useState<number>(0);

  const bubbleContainerRef = useRef<HTMLDivElement>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const bubbleIdCounter = useRef(0);
  const particleIdCounter = useRef(0);

  // Initialize Web Audio API
  const initAudio = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioCtxRef.current.state === "suspended") {
      audioCtxRef.current.resume();
    }
  };

  // Sound Synthesizers
  const playPopSound = () => {
    if (!audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = "sine";
    osc.frequency.setValueAtTime(300, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(900, ctx.currentTime + 0.1);
    
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.12);
  };

  const playBoingSound = () => {
    if (!audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = "sine";
    osc.frequency.setValueAtTime(180, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.25);
    
    gain.gain.setValueAtTime(0.5, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.25);
  };

  const playLetterSound = () => {
    if (!audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    
    // Synthesize a cute toddler "beep beep" sound for letter presentation
    const playTone = (freq: number, start: number, duration: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.15, ctx.currentTime + start);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + start + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + start);
      osc.stop(ctx.currentTime + start + duration);
    };

    // Play a friendly major arpeggio based on target letter's alphabet position
    const charCode = targetLetter.charCodeAt(0) - 65; // 0 to 25
    const baseFreq = 261.63 + (charCode * 8); // scaling note
    playTone(baseFreq, 0, 0.15);
    playTone(baseFreq * 1.25, 0.1, 0.15);
    playTone(baseFreq * 1.5, 0.2, 0.25);
  };

  const playSuccessSound = () => {
    if (!audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    
    const playNote = (freq: number, start: number, duration: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, ctx.currentTime + start);
      gain.gain.setValueAtTime(0.25, ctx.currentTime + start);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + start + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + start);
      osc.stop(ctx.currentTime + start + duration);
    };

    playNote(523.25, 0, 0.25); // C5
    playNote(659.25, 0.15, 0.25); // E5
    playNote(783.99, 0.3, 0.25); // G5
    playNote(1046.50, 0.45, 0.5); // C6
  };

  // Start the Game
  const startNewGame = () => {
    initAudio();
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const randomLetter = letters[Math.floor(Math.random() * letters.length)];
    setTargetLetter(randomLetter);
    setBubbles([]);
    setParticles([]);
    setPoppedCount(0);
    setGameState("playing");
    setStartTime(Date.now());
  };

  // Trigger Particle Burst
  const createBurst = (x: number, y: number, color: string) => {
    const newParticles: Particle[] = [];
    const count = 10;
    
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
      const speed = 2 + Math.random() * 4;
      newParticles.push({
        id: particleIdCounter.current++,
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed + 1, // slight float up
        color,
        size: 8 + Math.random() * 8,
        alpha: 1.0
      });
    }
    setParticles(prev => [...prev, ...newParticles]);
  };

  // Spawn Bubble
  const spawnBubble = (forceTarget = false) => {
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    // 45% chance to spawn target letter, otherwise random distractor
    const isTarget = forceTarget || Math.random() < 0.45;
    const letter = isTarget ? targetLetter : letters[Math.floor(Math.random() * letters.length)];
    
    const size = 75 + Math.random() * 40; // 75px to 115px
    const speed = 1.2 + Math.random() * 1.8; // speed
    const x = 10 + Math.random() * 80; // offset percentage
    
    const bubbleColors = [
      "rgba(78, 205, 196, 0.25)", // soft teal
      "rgba(255, 107, 107, 0.25)", // soft red
      "rgba(255, 217, 61, 0.25)", // soft yellow
      "rgba(155, 229, 100, 0.25)", // lime green
      "rgba(228, 216, 248, 0.25)" // soft lavender
    ];
    const color = bubbleColors[Math.floor(Math.random() * bubbleColors.length)];

    setBubbles(prev => [
      ...prev,
      {
        id: bubbleIdCounter.current++,
        letter,
        x,
        y: -100, // starts below bottom boundary
        size,
        speed,
        color,
        shaking: false,
        shakeOffset: 0
      }
    ]);
  };

  // Tap Handler
  const handleBubbleTap = (bubbleId: number) => {
    initAudio();
    
    const bubble = bubbles.find(b => b.id === bubbleId);
    if (!bubble) return;

    if (bubble.letter === targetLetter) {
      // Correct Match
      playPopSound();
      createBurst(bubble.x, bubble.y + bubble.size / 2, "#4ECDC4");
      setBubbles(prev => prev.filter(b => b.id !== bubbleId));
      
      const nextCount = poppedCount + 1;
      setPoppedCount(nextCount);

      if (nextCount >= 5) {
        completeGame();
      }
    } else {
      // Incorrect Match
      playBoingSound();
      
      // Make the clicked bubble shake
      setBubbles(prev =>
        prev.map(b => (b.id === bubbleId ? { ...b, shaking: true, shakeOffset: 0 } : b))
      );
      
      // Stop shaking after animation
      setTimeout(() => {
        setBubbles(prev =>
          prev.map(b => (b.id === bubbleId ? { ...b, shaking: false } : b))
        );
      }, 400);
    }
  };

  // Victory flow
  const completeGame = async () => {
    setGameState("victory");
    playSuccessSound();
    
    confetti({
      particleCount: 150,
      spread: 90,
      origin: { y: 0.6 },
      colors: ["#9be564", "#e4d8f8", "#ffc3c0", "#FFFFFF"]
    });

    const elapsed = Date.now() - startTime;

    if (childId) {
      try {
        // Telemetry save
        await fetch(`/api/progress/${childId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            targetLetter,
            tracingScore: 100,
            phonemicScore: 100,
            timeSpentMs: elapsed
          })
        });

        // Award badge
        await fetch(`/api/badges/${childId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            badgeName: `Bubble Master ${targetLetter}`
          })
        });
      } catch (err) {
        console.error("Telemetry failed:", err);
      }
    }
  };

  // Main game update loop
  useEffect(() => {
    if (gameState !== "playing") {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      return;
    }

    const containerHeight = bubbleContainerRef.current?.clientHeight || 600;
    
    // Set up initial bubbles if empty
    if (bubbles.length === 0) {
      for (let i = 0; i < 4; i++) {
        setTimeout(() => {
          if (gameState === "playing") spawnBubble(i === 0);
        }, i * 600);
      }
    }

    const updateGame = () => {
      // 1. Update bubble positions
      setBubbles(prev => {
        const next = prev.map(b => {
          let yOffset = b.y + b.speed;
          let shakeOffset = b.shakeOffset;
          
          if (b.shaking) {
            // Shake back and forth between -8px and 8px
            shakeOffset = Math.sin(Date.now() / 20) * 8;
          } else {
            shakeOffset = 0;
          }
          
          return {
            ...b,
            y: yOffset,
            shakeOffset
          };
        });

        // Filter bubbles that go off-screen and trigger respawn
        const inside = next.filter(b => b.y < containerHeight + 100);
        if (inside.length < next.length) {
          // One or more went off screen, spawn replacements
          const diff = next.length - inside.length;
          for (let d = 0; d < diff; d++) {
            spawnBubble();
          }
        }
        return inside;
      });

      // 2. Update particles
      setParticles(prev => {
        return prev
          .map(p => ({
            ...p,
            x: p.x + p.vx * 0.1,
            y: p.y + p.vy,
            vy: p.vy - 0.1, // gravity drag
            alpha: p.alpha - 0.02,
            size: Math.max(0.1, p.size - 0.1)
          }))
          .filter(p => p.alpha > 0);
      });

      // Repeat loop
      animationFrameRef.current = requestAnimationFrame(updateGame);
    };

    animationFrameRef.current = requestAnimationFrame(updateGame);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [gameState, bubbles.length]);

  // Handle initial sound presentation
  useEffect(() => {
    if (gameState === "playing") {
      // Brief delay before playing target letter audio beep
      const t = setTimeout(playLetterSound, 500);
      return () => clearTimeout(t);
    }
  }, [targetLetter, gameState]);

  // Object associated with target letter
  const targetObject = objectDictionary[targetLetter];

  return (
    <div className="flex flex-col items-center w-full max-w-2xl mx-auto px-4 select-none">
      {/* Standardized Header */}
      <div className="flex justify-between items-center w-full mb-8 z-10 px-1">
        <button 
          onClick={onBack} 
          className="btn-white btn-squishy rounded-full w-14 h-14 flex items-center justify-center toddler-target border-2 border-slate-dark shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
        >
          <ArrowLeft size={28} strokeWidth={3} />
        </button>
        
        {/* Centered Speech/Find Target Sticker */}
        {gameState === "playing" ? (
          <div className="flex items-center gap-3 bg-white border-2 border-slate-dark rounded-full px-5 py-2.5 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
            <span className="text-base font-black text-slate-dark uppercase tracking-wide">Find:</span>
            <div className="w-10 h-10 rounded-full bg-[var(--light-mint)] border-2 border-slate-dark flex items-center justify-center font-black text-xl text-slate-dark shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
              {targetLetter}
            </div>
            {/* Progress dots inside header */}
            <div className="flex gap-1.5 ml-2">
              {Array.from({ length: 5 }).map((_, idx) => (
                <div 
                  key={idx}
                  className={`w-3.5 h-3.5 rounded-full border border-slate-dark transition-all duration-300 ${
                    idx < poppedCount 
                      ? "bg-[#9be564] scale-110 shadow-sm" 
                      : "bg-gray-100"
                  }`}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2.5 bg-white border-2 border-slate-dark rounded-full px-6 py-2.5 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] opacity-0 pointer-events-none">
            <span className="w-10 h-10" />
          </div>
        )}

        <button 
          onClick={playLetterSound}
          className={`btn-white btn-squishy rounded-full w-14 h-14 flex items-center justify-center toddler-target border-2 border-slate-dark shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] ${
            gameState !== "playing" ? "opacity-50 pointer-events-none" : ""
          }`}
        >
          <Volume2 size={28} strokeWidth={3} className="text-primary" />
        </button>
      </div>

      <AnimatePresence mode="wait">
        {gameState === "start" && (
          <motion.div
            key="start-screen"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="w-full flex flex-col items-center gap-6"
          >
            {/* Giant bouncy sticker */}
            <div className="w-full max-w-sm card-organic card-wavy-1 bg-[var(--light-mint)] border-2 border-slate-dark p-8 flex flex-col items-center text-center shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] mt-8">
              <h2 className="text-4xl font-black text-slate-dark uppercase tracking-wide mb-2">Bubble Pop!</h2>
              <p className="text-lg font-bold text-slate-dark/70 mb-6">Pop the floating letters to find the match!</p>
              
              <div className="w-32 h-32 rounded-full bg-white border-2 border-slate-dark flex items-center justify-center shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] mb-8 animate-bounce">
                <span className="text-6xl font-black text-slate-dark">🎈</span>
              </div>
              
              <button
                onClick={startNewGame}
                className="w-full py-5 text-2xl font-black uppercase tracking-wider bg-[#9be564] text-slate-dark rounded-full border-2 border-slate-dark shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all flex items-center justify-center gap-3"
              >
                <Play size={28} fill="currentColor" />
                <span>Play</span>
              </button>
            </div>
          </motion.div>
        )}

        {gameState === "playing" && (
          <motion.div
            key="play-screen"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full flex flex-col items-center gap-4 relative"
          >
            {/* Bubble Canvas/Floating Area */}
            <div 
              ref={bubbleContainerRef}
              className="w-full h-[65vh] relative border-2 border-dashed border-slate-dark/30 rounded-[2.5rem] bg-gradient-to-b from-[#f0f9ff]/40 to-white/10 overflow-hidden shadow-inner touch-none"
            >
              {/* Render floating bubbles */}
              {bubbles.map(bubble => (
                <button
                  key={bubble.id}
                  onClick={() => handleBubbleTap(bubble.id)}
                  className="absolute rounded-full flex items-center justify-center shadow-lg border-2 select-none group focus:outline-none"
                  style={{
                    left: `${bubble.x}%`,
                    bottom: `${bubble.y}px`,
                    width: `${bubble.size}px`,
                    height: `${bubble.size}px`,
                    backgroundColor: bubble.color,
                    borderColor: "rgba(255, 255, 255, 0.65)",
                    transform: `translateX(-50%) translate3d(${bubble.shakeOffset}px, 0, 0)`,
                    transition: bubble.shaking ? "none" : "transform 0.1s linear",
                    boxShadow: "inset -8px -8px 24px rgba(0,0,0,0.05), inset 8px 8px 24px rgba(255,255,255,0.7)",
                    backdropFilter: "blur(1.5px)"
                  }}
                >
                  {/* Bubble Highlight Curve */}
                  <div className="absolute top-[12%] left-[12%] w-[25%] h-[12%] bg-white/60 rounded-full rotate-[-35deg]" />
                  
                  {/* Bubble Letter */}
                  <span className="text-4xl md:text-5xl font-black text-slate-dark select-none group-active:scale-90 transition-transform">
                    {bubble.letter}
                  </span>
                </button>
              ))}

              {/* Render popping particles */}
              {particles.map(p => (
                <div
                  key={p.id}
                  className="absolute rounded-full pointer-events-none"
                  style={{
                    left: `${p.x}%`,
                    bottom: `${p.y}px`,
                    width: `${p.size}px`,
                    height: `${p.size}px`,
                    backgroundColor: p.color,
                    opacity: p.alpha,
                    transform: "translate(-50%, 50%)"
                  }}
                />
              ))}
            </div>
          </motion.div>
        )}

        {gameState === "victory" && (
          <motion.div
            key="victory-screen"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="w-full flex flex-col items-center gap-6"
          >
            {/* Victory Sticker */}
            <div className="w-full max-w-sm card-organic card-wavy-2 bg-[var(--light-purple)] border-2 border-slate-dark p-8 flex flex-col items-center text-center shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] mt-8">
              <h2 className="text-4xl font-black text-slate-dark uppercase tracking-wide mb-1">Awesome!</h2>
              <p className="text-lg font-bold text-slate-dark/70 mb-6">You popped all the letter {targetLetter}'s!</p>
              
              {/* Display visual word association illustration */}
              {targetObject && (
                <div className="flex flex-col items-center gap-3 mb-8">
                  <div className="w-40 h-40 bg-white border-2 border-slate-dark rounded-[2rem] flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-4">
                    <targetObject.icon size={130} />
                  </div>
                  <span className="text-3xl font-black text-slate-dark uppercase tracking-wider">
                    {targetLetter} is for {targetObject.name}
                  </span>
                </div>
              )}
              
              <button
                onClick={startNewGame}
                className="w-full py-5 text-2xl font-black uppercase tracking-wider bg-[#9be564] text-slate-dark rounded-full border-2 border-slate-dark shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all flex items-center justify-center gap-3"
              >
                <span>Play Again</span>
                <ArrowRight size={28} strokeWidth={3} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
