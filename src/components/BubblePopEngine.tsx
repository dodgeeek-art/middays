"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { ArrowLeft, Play, ArrowRight, Volume2 } from "@/components/Icons";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
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

const getCurrentTime = (): number => Date.now();

const getRandomTargetLetter = (): string => {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  return letters[Math.floor(Math.random() * letters.length)];
};

interface ParticleSpawnConfig {
  angle: number;
  speed: number;
  size: number;
}

const getParticleSpawnConfig = (i: number, count: number): ParticleSpawnConfig => {
  const angle = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
  const speed = 2 + Math.random() * 4;
  const size = 8 + Math.random() * 8;
  return { angle, speed, size };
};

interface BubbleSpawnConfig {
  letter: string;
  size: number;
  speed: number;
  x: number;
  color: string;
}

const getBubbleSpawnConfig = (targetLetter: string, forceTarget: boolean): BubbleSpawnConfig => {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const isTarget = forceTarget || Math.random() < 0.35;
  const distractorLetters = letters.replace(targetLetter, "");
  const letter = isTarget ? targetLetter : distractorLetters[Math.floor(Math.random() * distractorLetters.length)];
  
  const size = 75 + Math.random() * 40; // 75px to 115px
  const speed = 0.5 + Math.random() * 0.5; // speed (slower, toddler friendly)
  const x = 10 + Math.random() * 80; // offset percentage
  
  const bubbleColors = [
    "rgba(78, 205, 196, 0.25)", // soft teal
    "rgba(255, 107, 107, 0.25)", // soft red
    "rgba(255, 217, 61, 0.25)", // soft yellow
    "rgba(155, 229, 100, 0.25)", // lime green
    "rgba(228, 216, 248, 0.25)" // soft lavender
  ];
  const color = bubbleColors[Math.floor(Math.random() * bubbleColors.length)];

  return { letter, size, speed, x, color };
};

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
      audioCtxRef.current = new (window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext)();
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

  const playLetterSound = useCallback(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(targetLetter);
      utterance.rate = 0.85;
      utterance.pitch = 1.15;
      window.speechSynthesis.speak(utterance);
    }

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
  }, [targetLetter]);

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
    setTargetLetter(getRandomTargetLetter());
    setBubbles([]);
    setParticles([]);
    setPoppedCount(0);
    setGameState("playing");
    setStartTime(getCurrentTime());
  };

  // Trigger Particle Burst
  const createBurst = (x: number, y: number, color: string) => {
    const newParticles: Particle[] = [];
    const count = 10;
    
    for (let i = 0; i < count; i++) {
      const { angle, speed, size } = getParticleSpawnConfig(i, count);
      newParticles.push({
        id: particleIdCounter.current++,
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed + 1, // slight float up
        color,
        size,
        alpha: 1.0
      });
    }
    setParticles(prev => [...prev, ...newParticles]);
  };

  // Spawn Bubble
  const spawnBubble = useCallback((forceTarget = false) => {
    const { letter, size, speed, x, color } = getBubbleSpawnConfig(targetLetter, forceTarget);

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
  }, [targetLetter]);

  // Tap Handler
  const handleBubbleTap = (bubbleId: number) => {
    initAudio();
    
    const bubble = bubbles.find(b => b.id === bubbleId);
    if (!bubble) return;

    if (bubble.letter === targetLetter) {
      // Correct Match
      playPopSound();
      const isMobile = typeof window !== "undefined" && window.innerWidth < 640;
      const scale = isMobile ? 0.65 : 1.0;
      createBurst(bubble.x, bubble.y + (bubble.size * scale) / 2, "#4ECDC4");
      setBubbles(prev => prev.filter(b => b.id !== bubbleId));
      spawnBubble();
      
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
      colors: ["#a2ea63", "#eaddfc", "#ffc4c0", "#FFFFFF"]
    });

    const elapsed = getCurrentTime() - startTime;

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
    
    // Set up initial bubbles if empty (spawn 12 bubbles for a livelier screen)
    if (bubbles.length === 0) {
      for (let i = 0; i < 12; i++) {
        setTimeout(() => {
          if (gameState === "playing") spawnBubble(i === 0);
        }, i * 250);
      }
    }

    const updateGame = () => {
      // 1. Update bubble positions
      setBubbles(prev => {
        const next = prev.map(b => {
          const yOffset = b.y + b.speed;
          let shakeOffset = b.shakeOffset;
          
          if (b.shaking) {
            // Shake back and forth between -8px and 8px
            shakeOffset = Math.sin(getCurrentTime() / 20) * 8;
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
  }, [gameState, bubbles.length, spawnBubble]);

  // Handle initial sound presentation
  const isPlaying = gameState === "playing";
  useEffect(() => {
    if (isPlaying) {
      // Brief delay before playing target letter audio beep
      const t = setTimeout(playLetterSound, 500);
      return () => clearTimeout(t);
    }
  }, [isPlaying, playLetterSound]);

  // Object associated with target letter
  const targetObject = objectDictionary[targetLetter];

  return (
    <div className="flex flex-col items-center w-full max-w-2xl mx-auto px-4 select-none justify-between h-full min-h-0 py-2">
      {/* Standardized Header */}
      <div className="flex justify-between items-center w-full mb-3 sm:mb-4 z-10 px-1">
        <button 
          onClick={onBack} 
          className="bg-white clay-btn rounded-full w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center toddler-target border border-white/20 shadow-[4px_4px_8px_rgba(0,0,0,0.05)]"
        >
          <ArrowLeft className="w-6 h-6 sm:w-7 sm:h-7 text-[#4A5358]" strokeWidth={3} />
        </button>
        
        {/* Centered Speech/Find Target Sticker */}
        {gameState === "playing" ? (
          <div className="flex items-center gap-1.5 sm:gap-3 bg-white border border-white/25 rounded-2xl px-3 py-1.5 sm:px-5 sm:py-2.5 shadow-[4px_4px_10px_rgba(0,0,0,0.04),_inset_2px_2px_4px_rgba(255,255,255,0.85)] rotate-[-1.5deg]">
            <span className="text-xs sm:text-base font-black text-[#4A5358] uppercase tracking-wide">Find:</span>
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-[var(--light-mint)] border border-white/20 flex items-center justify-center font-black text-lg sm:text-xl text-[#0b4a45] shadow-[2px_2px_5px_rgba(0,0,0,0.04),_inset_2px_2px_4px_rgba(255,255,255,0.8)]">
              {targetLetter}
            </div>
            {/* Progress dots inside header */}
            <div className="flex gap-1 sm:gap-1.5 ml-1 sm:ml-2">
              {Array.from({ length: 5 }).map((_, idx) => (
                <div 
                  key={idx}
                  className={`w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 rounded-full border border-white/25 transition-all duration-300 ${
                    idx < poppedCount 
                      ? "bg-[#4ecdc4] scale-110 shadow-sm" 
                      : "bg-gray-100 shadow-inner"
                  }`}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2.5 bg-white border border-white/25 rounded-2xl px-6 py-2.5 shadow-[4px_4px_10px_rgba(0,0,0,0.04)] opacity-0 pointer-events-none">
            <span className="w-10 h-10" />
          </div>
        )}

        <button 
          onClick={playLetterSound}
          className={`bg-white clay-btn rounded-full w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center toddler-target border border-white/20 shadow-[4px_4px_8px_rgba(0,0,0,0.05)] ${
            gameState !== "playing" ? "opacity-50 pointer-events-none" : ""
          }`}
        >
          <Volume2 className="w-6 h-6 sm:w-7 sm:h-7 text-primary" strokeWidth={3} />
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
            <div className="w-full max-w-sm clay-card p-6 sm:p-8 flex flex-col items-center text-center mt-3 sm:mt-6 bg-[#d2f4e6]/90 backdrop-blur-md border border-white/20">
              <h2 className="text-3xl sm:text-4xl font-black text-[#0b4a45] uppercase tracking-wide mb-2">Bubble Pop!</h2>
              <p className="text-base sm:text-lg font-bold text-[#0b4a45]/70 mb-4 sm:mb-6">Pop the floating letters to find the match!</p>
              
              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-white border border-white/20 flex items-center justify-center shadow-[4px_4px_10px_rgba(0,0,0,0.04),_inset_3px_3px_6px_rgba(255,255,255,0.85),_inset_-3px_-3px_6px_rgba(0,0,0,0.04)] mb-6 sm:mb-8 animate-bounce">
                <span className="text-4xl sm:text-6xl font-black text-slate-dark">🎈</span>
              </div>
              
              <button
                onClick={startNewGame}
                className="w-full py-4 sm:py-5 text-xl sm:text-2xl font-black uppercase tracking-wider bg-[#a2ea63] text-[#0b4a45] rounded-full clay-btn border border-white/10 hover:scale-102 active:scale-96 transition-all flex items-center justify-center gap-3"
              >
                <Play className="w-6 h-6 sm:w-7 sm:h-7" fill="currentColor" />
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
              className="w-full h-[40vh] sm:h-[48vh] md:h-[52vh] relative border border-dashed border-[#4a5358]/20 rounded-[2.5rem] bg-gradient-to-b from-[#f0f9ff]/50 via-white/20 to-[#faf9f5] overflow-hidden shadow-[inset_0_4px_16px_rgba(0,0,0,0.06)] touch-none [--bubble-scale:0.65] sm:[--bubble-scale:1]"
            >
               {/* Render floating bubbles */}
              {bubbles.map(bubble => (
                <button
                  key={bubble.id}
                  onClick={() => handleBubbleTap(bubble.id)}
                  className="absolute rounded-full flex items-center justify-center select-none group focus:outline-none border border-white/20 cursor-pointer"
                  style={{
                    left: `${bubble.x}%`,
                    bottom: `${bubble.y}px`,
                    width: `calc(${bubble.size}px * var(--bubble-scale))`,
                    height: `calc(${bubble.size}px * var(--bubble-scale))`,
                    backgroundImage: `radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.75) 0%, rgba(255, 255, 255, 0.2) 40%, ${bubble.color.replace('0.25', '0.6')} 80%)`,
                    transform: `translateX(-50%) translate3d(${bubble.shakeOffset}px, 0, 0)`,
                    transition: bubble.shaking ? "none" : "transform 0.1s linear",
                    boxShadow: "0 8px 20px -6px rgba(0,0,0,0.12), inset -10px -10px 20px rgba(0,0,0,0.06), inset 10px 10px 20px rgba(255,255,255,0.8)",
                    backdropFilter: "blur(1.5px)"
                  }}
                >
                  {/* Bubble Highlight shine dot */}
                  <div className="absolute top-[18%] left-[18%] w-[15%] h-[15%] rounded-full bg-white/70" />
                  
                  {/* Bubble Highlight Curve */}
                  <div className="absolute top-[12%] left-[12%] w-[25%] h-[12%] bg-white/50 rounded-full rotate-[-35deg]" />
                  
                  {/* Bubble Letter */}
                  <span className="text-2xl sm:text-4xl md:text-5xl font-black text-slate-dark select-none group-active:scale-90 transition-transform">
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
            <div className="w-full max-w-sm clay-card p-6 sm:p-8 flex flex-col items-center text-center mt-3 sm:mt-6 bg-[#eaddfc]/90 backdrop-blur-md border border-white/20">
              <h2 className="text-3xl sm:text-4xl font-black text-[#3c1e70] uppercase tracking-wide mb-1">Awesome!</h2>
              <p className="text-base sm:text-lg font-bold text-[#3c1e70]/70 mb-4 sm:mb-6">You popped all the letter {targetLetter}&apos;s!</p>
              
              {/* Display visual word association illustration */}
              {targetObject && (
                <div className="flex flex-col items-center gap-3 mb-6 sm:mb-8">
                  <div className="w-32 h-32 sm:w-40 sm:h-40 bg-white border border-white/25 rounded-[2rem] flex items-center justify-center shadow-[6px_6px_12px_rgba(0,0,0,0.04),_inset_2px_2px_4px_rgba(255,255,255,0.85)] p-4">
                    <targetObject.icon className="w-20 h-20 sm:w-32 sm:h-32" />
                  </div>
                  <span className="text-xl sm:text-3xl font-black text-[#3c1e70] uppercase tracking-wider">
                    {targetLetter} is for {targetObject.name}
                  </span>
                </div>
              )}
              
              <button
                onClick={startNewGame}
                className="w-full py-4 sm:py-5 text-xl sm:text-2xl font-black uppercase tracking-wider bg-[#a2ea63] text-[#0b4a45] rounded-full clay-btn border border-white/10 hover:scale-102 active:scale-96 transition-all flex items-center justify-center gap-3"
              >
                <span>Play Again</span>
                <ArrowRight className="w-6 h-6 sm:w-7 sm:h-7" strokeWidth={3} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
