"use client";

import React, { useState, useEffect, useRef } from "react";
import { ArrowLeft, ArrowRight, Volume2, HelpCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { objectDictionary } from "@/lib/svgDictionary";

interface Choice {
  letter: string;
  name: string;
  icon: React.FC<any>;
}

interface Crumb {
  id: number;
  x: number; // relative to monster center
  y: number; // relative to monster center
  vx: number;
  vy: number;
  color: string;
  size: number;
}

interface FeedMonsterEngineProps {
  childId: string;
  onBack: () => void;
}

export default function FeedMonsterEngine({ childId, onBack }: FeedMonsterEngineProps) {
  const [gameState, setGameState] = useState<"playing" | "chewing" | "success" | "wrong">("playing");
  const [targetLetter, setTargetLetter] = useState("C");
  const [choices, setChoices] = useState<Choice[]>([]);
  const [feedingIndex, setFeedingIndex] = useState<number | null>(null);
  const [crumbs, setCrumbs] = useState<Crumb[]>([]);
  const [roundStartTime, setRoundStartTime] = useState<number>(0);
  
  const audioCtxRef = useRef<AudioContext | null>(null);
  const crumbsAnimationRef = useRef<number | null>(null);
  const crumbIdCounter = useRef(0);

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
  const playChewSound = () => {
    if (!audioCtxRef.current) return;
    const ctx = audioCtxRef.current;

    const playCrunch = (delay: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = "triangle";
      osc.frequency.setValueAtTime(140, ctx.currentTime + delay);
      osc.frequency.exponentialRampToValueAtTime(30, ctx.currentTime + delay + 0.08);
      
      gain.gain.setValueAtTime(0.2, ctx.currentTime + delay);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + delay + 0.08);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(ctx.currentTime + delay);
      osc.stop(ctx.currentTime + delay + 0.08);
    };

    playCrunch(0);
    playCrunch(0.12);
    playCrunch(0.24);
    playCrunch(0.36);
  };

  const playYuckSound = () => {
    if (!audioCtxRef.current) return;
    const ctx = audioCtxRef.current;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(90, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(45, ctx.currentTime + 0.35);

    gain.gain.setValueAtTime(0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.35);
  };

  const playGiggleSound = () => {
    if (!audioCtxRef.current) return;
    const ctx = audioCtxRef.current;

    // Upward playful chirp
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(350, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(750, ctx.currentTime + 0.2);

    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.2);
  };

  const playNoteSound = () => {
    if (!audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    
    // Friendly arpeggio representing target letter
    const charCode = targetLetter.charCodeAt(0) - 65;
    const baseFreq = 220 + (charCode * 6);
    
    const playTone = (freq: number, start: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, ctx.currentTime + start);
      gain.gain.setValueAtTime(0.12, ctx.currentTime + start);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + start + 0.15);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + start);
      osc.stop(ctx.currentTime + start + 0.15);
    };

    playTone(baseFreq, 0);
    playTone(baseFreq * 1.5, 0.1);
  };

  // Generate round contents
  const startNewRound = () => {
    initAudio();
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const randomTarget = letters[Math.floor(Math.random() * letters.length)];
    setTargetLetter(randomTarget);
    
    // Find options
    const correctObject = objectDictionary[randomTarget];
    
    // Choose 2 distinct wrong letters
    const wrongList: string[] = [];
    while (wrongList.length < 2) {
      const wrong = letters[Math.floor(Math.random() * letters.length)];
      if (wrong !== randomTarget && !wrongList.includes(wrong)) {
        wrongList.push(wrong);
      }
    }

    const wrongObject1 = objectDictionary[wrongList[0]];
    const wrongObject2 = objectDictionary[wrongList[1]];

    const roundChoices: Choice[] = [
      { letter: randomTarget, name: correctObject.name, icon: correctObject.icon },
      { letter: wrongList[0], name: wrongObject1.name, icon: wrongObject1.icon },
      { letter: wrongList[1], name: wrongObject2.name, icon: wrongObject2.icon }
    ];

    // Shuffle
    const shuffled = roundChoices.sort(() => Math.random() - 0.5);
    
    setChoices(shuffled);
    setFeedingIndex(null);
    setCrumbs([]);
    setGameState("playing");
    setRoundStartTime(Date.now());
  };

  useEffect(() => {
    startNewRound();
  }, []);

  // Play instruction sound on target letter load
  useEffect(() => {
    if (gameState === "playing") {
      const t = setTimeout(playNoteSound, 500);
      return () => clearTimeout(t);
    }
  }, [targetLetter, gameState === "playing"]);

  // Create Crumb Particles
  const spawnCrumbs = () => {
    const newCrumbs: Crumb[] = [];
    const colors = ["#ffca28", "#ff7043", "#8d6e63", "#e0e0e0"];
    
    for (let i = 0; i < 12; i++) {
      const angle = Math.random() * Math.PI + Math.PI / 4; // scatter downwards/outwards
      const speed = 1.2 + Math.random() * 3;
      newCrumbs.push({
        id: crumbIdCounter.current++,
        x: 0, // centered relative to mouth
        y: 0, // centered relative to mouth
        vx: Math.cos(angle) * speed * 0.7,
        vy: Math.abs(Math.sin(angle) * speed) * 0.7, // drop downwards
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 3 + Math.random() * 4
      });
    }
    setCrumbs(prev => [...prev, ...newCrumbs]);
  };

  // Run crumbs animation
  useEffect(() => {
    if (crumbs.length === 0) return;

    const tickCrumbs = () => {
      setCrumbs(prev => {
        return prev
          .map(c => ({
            ...c,
            x: c.x + c.vx,
            y: c.y + c.vy,
            vy: c.vy + 0.15, // gravity pulls down
            size: Math.max(0.1, c.size - 0.1) // shrinks
          }))
          .filter(c => c.size > 0.5 && c.y < 350);
      });
      crumbsAnimationRef.current = requestAnimationFrame(tickCrumbs);
    };

    crumbsAnimationRef.current = requestAnimationFrame(tickCrumbs);
    return () => {
      if (crumbsAnimationRef.current) cancelAnimationFrame(crumbsAnimationRef.current);
    };
  }, [crumbs.length]);

  // Feed Handler
  const handleCardTap = (index: number) => {
    if (gameState !== "playing" || feedingIndex !== null) return;
    initAudio();

    const selectedChoice = choices[index];
    setFeedingIndex(index);

    if (selectedChoice.letter === targetLetter) {
      // Correct Item!
      setTimeout(() => {
        setGameState("chewing");
        playChewSound();
        spawnCrumbs();
        
        // After chewing, go to success
        setTimeout(() => {
          setGameState("success");
          playGiggleSound();
          confetti({
            particleCount: 80,
            spread: 60,
            origin: { y: 0.55 },
            colors: ["#FF7043", "#ffc3c0", "#9be564", "#FFFFFF"]
          });
          
          saveProgressTelemetry();

          // Auto-advance to the next round after 2.2 seconds
          setTimeout(() => {
            startNewRound();
          }, 2200);
        }, 1200);
      }, 500); // delay during slide motion
    } else {
      // Wrong Item
      setTimeout(() => {
        setGameState("wrong");
        playYuckSound();
        
        // Return card back and reset state
        setTimeout(() => {
          setFeedingIndex(null);
          setGameState("playing");
        }, 1200);
      }, 500);
    }
  };

  const saveProgressTelemetry = async () => {
    const timeSpent = Date.now() - roundStartTime;
    if (childId) {
      try {
        await fetch(`/api/progress/${childId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            targetLetter,
            tracingScore: 100,
            phonemicScore: 100,
            timeSpentMs: timeSpent
          })
        });

        await fetch(`/api/badges/${childId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            badgeName: `Feeder Master ${targetLetter}`
          })
        });
      } catch (e) {
        console.error("Telemetry error:", e);
      }
    }
  };

  const getCardAnimation = (idx: number): any => {
    if (feedingIndex !== idx) return {};
    
    if (gameState === "playing" || gameState === "chewing" || gameState === "success") {
      // Slide into monster's mouth
      // Mouth is at top center relative to cards
      let offsetPercentX = 0;
      if (idx === 0) offsetPercentX = 110;
      if (idx === 2) offsetPercentX = -110;
      
      return {
        x: `${offsetPercentX}%`,
        y: -210,
        scale: 0.15,
        opacity: 0,
        transition: { duration: 0.5, ease: "easeIn" }
      };
    }
    
    if (gameState === "wrong") {
      // Shake and return
      return {
        x: [0, -12, 12, -8, 8, 0],
        y: [0, -10, -10, 0, 0, 0],
        transition: { duration: 0.6 }
      };
    }
    
    return {};
  };

  const currentObject = objectDictionary[targetLetter];

  return (
    <div className="flex flex-col items-center w-full max-w-2xl mx-auto px-4 select-none justify-between min-h-[72vh] md:min-h-[78vh] py-2">
      {/* Standardized Header */}
      <div className="flex justify-between items-center w-full mb-3 sm:mb-4 z-10 px-1">
        <button 
          onClick={onBack} 
          className="bg-white squishy-press rounded-full w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center toddler-target border-2 border-slate-dark"
        >
          <ArrowLeft className="w-5.5 h-5.5 sm:w-7 sm:h-7 text-foreground" strokeWidth={3} />
        </button>
        
        {/* Centered Speech/Feed Target Sticker */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 bg-white border-2 border-slate-dark rounded-xl px-4 sm:px-5 py-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rotate-[1deg]">
          <span className="text-xs sm:text-base font-black text-slate-dark uppercase tracking-wide">Feed me:</span>
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-[var(--light-peach)] border-2 border-slate-dark flex items-center justify-center font-black text-base sm:text-xl text-slate-dark shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            {targetLetter}
          </div>
        </div>

        <button 
          onClick={playNoteSound}
          className={`bg-white squishy-press rounded-full w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center toddler-target border-2 border-slate-dark ${
            gameState !== "playing" ? "opacity-50 pointer-events-none" : ""
          }`}
        >
          <Volume2 className="w-5.5 h-5.5 sm:w-7 sm:h-7 text-primary" strokeWidth={3} />
        </button>
      </div>

      {/* Main Board */}
      <div className="w-full relative flex flex-col items-center gap-4 sm:gap-6 mt-2">
        {/* Dynamic Monster Canvas Area */}
        <div className="w-full h-[160px] sm:h-[200px] md:h-[220px] relative flex justify-center items-center overflow-visible">
          <div className="absolute bg-[var(--secondary-container)] w-44 h-44 rounded-full blur-[40px] opacity-40 -z-10 animate-pulse pointer-events-none" />
          
          {/* SVG Animated Monster */}
          <motion.div
            animate={
              gameState === "chewing"
                ? { y: [0, -8, 4, -4, 2, 0], rotate: [0, -2, 2, -1, 1, 0] }
                : gameState === "wrong"
                ? { x: [0, -10, 10, -10, 10, 0] }
                : { y: [0, -3, 0] }
            }
            transition={
              gameState === "chewing"
                ? { duration: 0.6, repeat: 1 }
                : gameState === "wrong"
                ? { duration: 0.5 }
                : { duration: 4, repeat: Infinity, ease: "easeInOut" }
            }
            className="w-44 h-44 sm:w-54 sm:h-54 md:w-64 md:h-64 relative overflow-visible"
          >
            {/* Animated crumbs wrapper nested inside the monster container */}
            <div className="absolute top-[68%] left-[50%] w-12 h-12 pointer-events-none overflow-visible z-20">
              {crumbs.map(crumb => (
                <div 
                  key={crumb.id}
                  className="absolute rounded-full"
                  style={{
                    left: `calc(50% + ${crumb.x}px)`,
                    top: `${crumb.y}px`,
                    width: `${crumb.size}px`,
                    height: `${crumb.size}px`,
                    backgroundColor: crumb.color,
                    transform: "translate(-50%, -50%)"
                  }}
                />
              ))}
            </div>

            <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible drop-shadow-lg">
              {/* Little stubby feet */}
              <ellipse cx="35" cy="92" rx="10" ry="6" fill="#6a1b9a" stroke="#111" strokeWidth="4" />
              <ellipse cx="65" cy="92" rx="10" ry="6" fill="#6a1b9a" stroke="#111" strokeWidth="4" />

              {/* Stubby arms */}
              <motion.path 
                animate={gameState === "success" ? { rotate: [0, 45, 0] } : {}}
                transition={{ duration: 0.5, repeat: 3 }}
                d="M 12 60 Q 2 55 5 45 Q 12 50 16 58" 
                fill="#ab47bc" 
                stroke="#111" 
                strokeWidth="4" 
              />
              <motion.path 
                animate={gameState === "success" ? { rotate: [0, -45, 0] } : {}}
                transition={{ duration: 0.5, repeat: 3 }}
                d="M 88 60 Q 98 55 95 45 Q 88 50 84 58" 
                fill="#ab47bc" 
                stroke="#111" 
                strokeWidth="4" 
              />

              {/* Yellow horns */}
              <path d="M 28 22 Q 16 8 12 18 Q 22 28 32 24" fill="#ffd54f" stroke="#111" strokeWidth="4" />
              <path d="M 72 22 Q 84 8 88 18 Q 78 28 68 24" fill="#ffd54f" stroke="#111" strokeWidth="4" />

              {/* Fluffy body */}
              <path 
                d="M 50 18 C 22 18, 14 42, 14 68 C 14 88, 30 90, 50 90 C 70 90, 86 88, 86 68 C 86 42, 78 18, 50 18 Z" 
                fill="#ab47bc" 
                stroke="#111" 
                strokeWidth="4" 
              />

              {/* Cute yellow spots */}
              <circle cx="28" cy="74" r="5" fill="#ffd54f" opacity="0.8" />
              <circle cx="72" cy="74" r="5" fill="#ffd54f" opacity="0.8" />
              <circle cx="50" cy="28" r="4" fill="#ffd54f" opacity="0.8" />

              {/* Dynamic Eyes */}
              {gameState === "success" ? (
                // Happy closed laughing eyes
                <>
                  <path d="M 28 42 Q 38 32 44 42" fill="none" stroke="#111" strokeWidth="4" strokeLinecap="round" />
                  <path d="M 56 42 Q 62 32 72 42" fill="none" stroke="#111" strokeWidth="4" strokeLinecap="round" />
                </>
              ) : gameState === "wrong" ? (
                // Squinting angry/sad eyes
                <>
                  <path d="M 30 36 L 42 44 M 30 44 L 42 36" stroke="#111" strokeWidth="4" strokeLinecap="round" />
                  <path d="M 58 36 L 70 44 M 58 44 L 70 36" stroke="#111" strokeWidth="4" strokeLinecap="round" />
                </>
              ) : (
                // Googly neutral eyes
                <>
                  {/* Outer whites */}
                  <circle cx="37" cy="40" r="11" fill="#FFF" stroke="#111" strokeWidth="4" />
                  <circle cx="63" cy="40" r="11" fill="#FFF" stroke="#111" strokeWidth="4" />
                  
                  {/* Pupils with slight squint or looking down towards food */}
                  <circle cx="37" cy="42" r="5" fill="#111" />
                  <circle cx="63" cy="42" r="5" fill="#111" />
                  
                  {/* Highlights */}
                  <circle cx="35" cy="40" r="1.5" fill="#FFF" />
                  <circle cx="61" cy="40" r="1.5" fill="#FFF" />
                </>
              )}

              {/* Dynamic Mouth */}
              {gameState === "chewing" ? (
                // Chew opening & closing: alternate dynamically based on loop
                <ellipse cx="50" cy="67" rx="14" ry={Math.sin(Date.now() / 30) > 0 ? 3 : 11} fill="#111" stroke="#111" strokeWidth="2" />
              ) : gameState === "success" ? (
                // Big open laughing mouth
                <>
                  <path d="M 32 64 Q 50 88 68 64 Z" fill="#111" stroke="#111" strokeWidth="4" />
                  {/* Tongue */}
                  <path d="M 40 76 Q 50 67 60 76 Z" fill="#ff8a80" />
                  {/* Cute single tooth */}
                  <path d="M 46 64 L 54 64 L 50 69 Z" fill="#FFF" />
                </>
              ) : gameState === "wrong" ? (
                // Closed wiggly mouth or sticking tongue out yuckily
                <>
                  <path d="M 45 66 Q 50 82 55 66 Z" fill="#ff5252" stroke="#111" strokeWidth="4" />
                  <path d="M 34 66 L 66 66" stroke="#111" strokeWidth="4" strokeLinecap="round" />
                </>
              ) : feedingIndex !== null ? (
                // Mouth opens wide preparing to receive food
                <>
                  <ellipse cx="50" cy="68" rx="16" ry="12" fill="#111" stroke="#111" strokeWidth="4" />
                  <path d="M 42 75 Q 50 66 58 75 Z" fill="#ff8a80" />
                </>
              ) : (
                // Idle cute smile
                <path d="M 36 64 Q 50 74 64 64" fill="none" stroke="#111" strokeWidth="4" strokeLinecap="round" />
              )}
            </svg>
          </motion.div>
        </div>

        {/* Choice Tray */}
        <div className="w-full grid grid-cols-3 gap-3 sm:gap-6 mt-4 sm:mt-5">
          <AnimatePresence>
            {choices.map((choice, idx) => {
              const Icon = choice.icon;
              const isSelected = feedingIndex === idx;
              const wavyClass = idx === 1 ? "card-wavy-1" : "card-wavy-2";
              
              const cardGradients = [
                "from-emerald-200 via-emerald-100 to-lime-50",
                "from-violet-200 via-violet-100 to-fuchsia-50",
                "from-rose-200 via-rose-100 to-orange-50"
              ];
              const textColors = [
                "text-emerald-950",
                "text-violet-950",
                "text-rose-950"
              ];
              
              return (
                <motion.button
                  key={choice.letter}
                  style={{
                    boxShadow: isSelected && gameState === "success"
                      ? "none"
                      : "4px 4px 0px 0px var(--slate-dark)",
                    zIndex: isSelected ? 50 : 10
                  }}
                  animate={getCardAnimation(idx)}
                  whileHover={gameState === "playing" ? { scale: 1.05 } : {}}
                  whileTap={gameState === "playing" ? { scale: 0.95, y: 4 } : {}}
                  onClick={() => handleCardTap(idx)}
                  className={`card-organic ${wavyClass} bg-gradient-to-br ${cardGradients[idx % cardGradients.length]} aspect-[4/5] p-2 sm:p-3 flex flex-col items-center justify-between border-2 border-slate-dark transition-shadow relative overflow-hidden ${
                    gameState !== "playing" && !isSelected ? "opacity-45 pointer-events-none" : "cursor-pointer"
                  }`}
                >
                  {/* Subtle letter indicator badge */}
                  <div className="absolute top-1 sm:top-2 left-1 sm:left-2 w-5.5 h-5.5 sm:w-7 sm:h-7 rounded-full bg-white/90 border border-slate-dark flex items-center justify-center text-[10px] sm:text-xs font-black shadow-sm">
                    {choice.letter}
                  </div>

                  {/* SVG Illustration */}
                  <div className="flex-grow flex items-center justify-center w-full h-full max-h-[70%] mt-2">
                    <Icon className="w-10 h-10 sm:w-16 sm:h-16 md:w-[75px] md:h-[75px] transition-transform duration-300" />
                  </div>
                  
                  {/* Subtitle name of item */}
                  <span className={`text-[10px] sm:text-xs md:text-sm font-black uppercase tracking-wider ${textColors[idx % textColors.length]} text-center border-t border-slate-dark/10 w-full pt-1.5 mt-1`}>
                    {choice.name}
                  </span>
                </motion.button>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Bottom Navigation / Celebration */}
      </div>
    </div>
  );
}
