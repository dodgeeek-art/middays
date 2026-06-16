"use client";

import React, { useState, useRef } from "react";
import { ArrowLeft, Volume2, Check } from "lucide-react";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import { objectDictionary } from "@/lib/svgDictionary";

interface RhymeRiverEngineProps {
  childId: string;
  onBack: () => void;
}

interface RhymeRound {
  promptWord: string;
  targetLetter: string; // The letter in objectDictionary that rhymes
  choices: string[]; // List of letters representing the choices
}

const RHYME_ROUNDS: RhymeRound[] = [
  { promptWord: "BEE", targetLetter: "K", choices: ["K", "C", "D"] },    // Key rhymes with Bee
  { promptWord: "LOG", targetLetter: "D", choices: ["D", "P", "S"] },    // Dog rhymes with Log
  { promptWord: "HAT", targetLetter: "C", choices: ["C", "T", "W"] },    // Cat rhymes with Hat
  { promptWord: "WIG", targetLetter: "P", choices: ["P", "K", "D"] },    // Pig rhymes with Wig
  { promptWord: "RAIN", targetLetter: "T", choices: ["T", "S", "C"] },   // Train rhymes with Rain
  { promptWord: "SNAIL", targetLetter: "W", choices: ["W", "P", "D"] },  // Whale rhymes with Snail
  { promptWord: "RUN", targetLetter: "S", choices: ["S", "K", "T"] }     // Sun rhymes with Run
];

export default function RhymeRiverEngine({ childId, onBack }: RhymeRiverEngineProps) {
  const [roundIdx, setRoundIdx] = useState(0);
  const [gameState, setGameState] = useState<"playing" | "hopping" | "success">("playing");
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const [wrongSelections, setWrongSelections] = useState<string[]>([]);
  const [frogPosition, setFrogPosition] = useState<"start" | "stone0" | "stone1" | "stone2" | "finish">("start");
  
  const currentRound = RHYME_ROUNDS[roundIdx];
  const audioCtxRef = useRef<AudioContext | null>(null);

  const initAudio = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext)();
    }
    if (audioCtxRef.current.state === "suspended") {
      audioCtxRef.current.resume();
    }
  };

  const playWaterSplash = () => {
    if (!audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    
    // Synthesize a cute, soft water plop/splash
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = "sine";
    osc.frequency.setValueAtTime(250, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.2);
    
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.22);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.22);
  };

  const playHopSound = () => {
    if (!audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = "triangle";
    osc.frequency.setValueAtTime(150, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(320, ctx.currentTime + 0.18);
    
    gain.gain.setValueAtTime(0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.005, ctx.currentTime + 0.2);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.2);
  };

  const playSuccessChime = () => {
    if (!audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    
    const playNote = (freq: number, delay: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, ctx.currentTime + delay);
      gain.gain.setValueAtTime(0.15, ctx.currentTime + delay);
      gain.gain.exponentialRampToValueAtTime(0.002, ctx.currentTime + delay + 0.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + delay);
      osc.stop(ctx.currentTime + delay + 0.45);
    };

    playNote(392.00, 0); // G4
    playNote(523.25, 0.1); // C5
    playNote(659.25, 0.2); // E5
    playNote(783.99, 0.3); // G5
  };

  const saveProgress = async () => {
    if (childId) {
      try {
        await fetch(`/api/progress/${childId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            targetLetter: currentRound.targetLetter,
            tracingScore: 100,
            phonemicScore: 100,
            timeSpentMs: 12000 // generic time spent
          })
        });

        await fetch(`/api/badges/${childId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            badgeName: `Rhyme Master ${currentRound.promptWord}`
          })
        });
      } catch (e) {
        console.error("Telemetry error:", e);
      }
    }
  };

  const handleStoneClick = (letter: string, index: number) => {
    if (gameState !== "playing" || selectedLetter !== null || wrongSelections.includes(letter)) return;
    initAudio();

    if (letter === currentRound.targetLetter) {
      // Correct!
      setSelectedLetter(letter);
      setGameState("hopping");
      playHopSound();
      
      // Determine hopping position
      const stonePos = `stone${index}` as "stone0" | "stone1" | "stone2";
      setFrogPosition(stonePos);

      setTimeout(() => {
        playWaterSplash();
        setGameState("success");
        playSuccessChime();
        
        confetti({
          particleCount: 40,
          spread: 40,
          origin: { y: 0.75 },
          colors: ["#8E9F85", "#C8D3C4", "#FAF5EB"]
        });

        saveProgress();

        // Advance to next round after 2 seconds
        setTimeout(() => {
          setFrogPosition("finish");
          setTimeout(() => {
            setRoundIdx(prev => (prev + 1) % RHYME_ROUNDS.length);
            setFrogPosition("start");
            setSelectedLetter(null);
            setWrongSelections([]);
            setGameState("playing");
          }, 800);
        }, 1500);

      }, 500);

    } else {
      // Wrong card
      playWaterSplash();
      setWrongSelections(prev => [...prev, letter]);
    }
  };

  // Coordinates for the frog's positions
  // Left shore, 3 stones, right shore
  const getFrogCoords = () => {
    switch (frogPosition) {
      case "stone0":
        return { left: "20%", bottom: "25%" };
      case "stone1":
        return { left: "50%", bottom: "25%" };
      case "stone2":
        return { left: "80%", bottom: "25%" };
      case "finish":
        return { left: "100%", bottom: "52%" };
      case "start":
      default:
        return { left: "-10%", bottom: "52%" };
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto bg-[#FAF9F5] border-2 border-[#3A413A] rounded-[2.5rem] p-5 sm:p-8 shadow-[4px_4px_0px_0px_rgba(58,65,58,1)] flex flex-col items-center justify-between min-h-[72vh] md:min-h-[78vh] relative overflow-hidden">
      {/* Top Bar */}
      <div className="w-full flex justify-between items-center mb-3 sm:mb-4 z-10">
        <button
          onClick={onBack}
          className="flex items-center gap-2 font-black text-xs uppercase px-4 py-2 bg-white border-2 border-[#3A413A] rounded-full shadow-[2px_2px_0px_0px_rgba(58,65,58,1)] active:translate-y-0.5 active:shadow-[1px_1px_0px_0px_rgba(58,65,58,1)] transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>
        <span className="text-[10px] font-black uppercase tracking-wider text-[#3A413A]/50 bg-[#E8E4D9]/40 px-3 py-1.5 rounded-full border border-[#3A413A]/10">
          Rhyme River
        </span>
      </div>

      {/* Prompter Banner */}
      <div className="w-full max-w-lg bg-white border-2 border-[#3A413A] rounded-3xl p-3.5 sm:p-5 mb-4 sm:mb-6 text-center shadow-[3px_3px_0px_0px_rgba(58,65,58,1)] relative z-10">
        <p className="text-[10px] font-black text-[#E5B6A8] uppercase tracking-widest mb-1">
          Nursery Rhymes
        </p>
        <h2 className="text-xl sm:text-2xl font-black text-[#3A413A] tracking-tight uppercase flex justify-center items-center gap-2 flex-wrap">
          <span>Find the stone that rhymes with:</span>
          <span className="inline-flex items-center justify-center px-4 py-1 bg-[#E5B6A8] border-2 border-[#3A413A] rounded-xl text-[#3A413A] text-2xl font-black relative group cursor-pointer active:scale-95 transition-all" onClick={() => playHopSound()}>
            {currentRound.promptWord}
            <Volume2 className="w-4.5 h-4.5 ml-1.5 opacity-60 group-hover:opacity-100 transition-opacity" />
          </span>
        </h2>
      </div>

      {/* The River Crossing Scene */}
      <div className="w-full h-56 sm:h-72 bg-[#C8D3C4]/20 border-2 border-[#3A413A] rounded-[2rem] relative mb-4 sm:mb-6 shadow-inner overflow-hidden flex flex-col justify-between">
        
        {/* River Water Texture Background */}
        <div className="absolute inset-0 bg-[#9BB2B1]/10 flex flex-col justify-around py-4 opacity-40">
          <div className="h-0.5 w-[200%] bg-white/30 animate-[slide-horizontal_16s_linear_infinite]" style={{ animationName: "river-flow" }}></div>
          <div className="h-0.5 w-[200%] bg-white/30 animate-[slide-horizontal_20s_linear_infinite]" style={{ animationName: "river-flow-reverse" }}></div>
        </div>

        {/* River Banks */}
        <div className="absolute left-0 top-0 bottom-0 w-[8%] bg-[#E8E4D9] border-r border-[#3A413A] z-0"></div>
        <div className="absolute right-0 top-0 bottom-0 w-[8%] bg-[#E8E4D9] border-l border-[#3A413A] z-0"></div>

        {/* Stepping Stones and Choices Grid */}
        <div className="w-full h-full flex justify-around items-center px-6 relative z-10">
          {currentRound.choices.map((letter, index) => {
            const obj = objectDictionary[letter];
            const isSelected = selectedLetter === letter;
            const isWrong = wrongSelections.includes(letter);
            
            return (
              <div key={letter + "-" + index} className="flex flex-col items-center gap-2 w-1/4">
                
                {/* Visual Card */}
                <motion.button
                  whileHover={gameState === "playing" && !isWrong ? { scale: 1.05 } : {}}
                  whileTap={gameState === "playing" && !isWrong ? { scale: 0.95 } : {}}
                  onClick={() => handleStoneClick(letter, index)}
                  disabled={gameState !== "playing" || isWrong}
                  className={`w-20 h-20 sm:w-32 sm:h-32 rounded-2xl sm:rounded-3xl border-2 border-[#3A413A] p-2 sm:p-3 flex flex-col items-center justify-center transition-all duration-300 relative ${
                    isWrong 
                      ? "bg-white/10 opacity-30 cursor-default scale-95" 
                      : isSelected 
                        ? "bg-[#C8D3C4] shadow-[0_4px_12px_rgba(142,159,133,0.3)]"
                        : "bg-white shadow-[3px_3px_0px_0px_rgba(58,65,58,1)]"
                  }`}
                  animate={isWrong ? { rotate: [0, -8, 8, -8, 8, 0] } : {}}
                  transition={{ duration: 0.4 }}
                >
                  <div className="w-full h-full flex items-center justify-center">
                    {React.createElement(obj.icon, { size: "90%" })}
                  </div>

                  {isSelected && (
                    <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-white border-2 border-[#3A413A] flex items-center justify-center text-[#8E9F85]">
                      <Check className="w-4 h-4" strokeWidth={3} />
                    </div>
                  )}
                </motion.button>

                {/* The Stepping Stone base */}
                <div className="w-14 h-4 sm:w-20 sm:h-5 bg-[#FAF5EB] border-2 border-[#3A413A] rounded-full shadow-[0_3px_0px_0px_rgba(58,65,58,0.7)] z-0"></div>
              </div>
            );
          })}
        </div>

        {/* Animated Dui Frog mascot */}
        <motion.div
          className="absolute w-10 h-10 sm:w-12 sm:h-12 z-20 pointer-events-none"
          initial={getFrogCoords()}
          animate={getFrogCoords()}
          transition={{ type: "spring", stiffness: 120, damping: 12 }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            alt="Dui Mascot" 
            className="w-full h-full object-contain" 
            src="/dui.png" 
          />
        </motion.div>
      </div>

      <style>{`
        @keyframes river-flow {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0%); }
        }
        @keyframes river-flow-reverse {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
