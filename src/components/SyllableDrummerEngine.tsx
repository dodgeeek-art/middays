"use client";

import React, { useState, useRef } from "react";
import { ArrowLeft, Music } from "lucide-react";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import { objectDictionary } from "@/lib/svgDictionary";

interface SyllableDrummerEngineProps {
  childId: string;
  onBack: () => void;
}

interface SyllableWord {
  word: string;
  syllables: string[];
  targetLetter: string;
}

const DRUMMER_WORDS: SyllableWord[] = [
  { word: "MONKEY", syllables: ["MON", "KEY"], targetLetter: "M" },
  { word: "ELEPHANT", syllables: ["EL", "E", "PHANT"], targetLetter: "E" },
  { word: "APPLE", syllables: ["AP", "PLE"], targetLetter: "A" },
  { word: "LION", syllables: ["LI", "ON"], targetLetter: "L" },
  { word: "RABBIT", syllables: ["RAB", "BIT"], targetLetter: "R" },
  { word: "ZEBRA", syllables: ["ZE", "BRA"], targetLetter: "Z" }
];

export default function SyllableDrummerEngine({ childId, onBack }: SyllableDrummerEngineProps) {
  const [wordIdx, setWordIdx] = useState(0);
  const [gameState, setGameState] = useState<"playing" | "success">("playing");
  const [currentTapIdx, setCurrentTapIdx] = useState(0);
  const [roundStartTime, setRoundStartTime] = useState<number>(() => Date.now());
  const [isDrumActive, setIsDrumActive] = useState(false);
  
  const currentWord = DRUMMER_WORDS[wordIdx];
  const audioCtxRef = useRef<AudioContext | null>(null);

  const initAudio = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext)();
    }
    if (audioCtxRef.current.state === "suspended") {
      audioCtxRef.current.resume();
    }
  };

  // Sophisticated wood block synth tone
  const playWoodBlockSound = (pitch: number = 320, duration: number = 0.15) => {
    if (!audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    // Triangle wave + quick exponential decay makes it sound like a hollow wooden block
    osc.type = "triangle";
    osc.frequency.setValueAtTime(pitch, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(pitch * 0.5, ctx.currentTime + duration);
    
    gain.gain.setValueAtTime(0.35, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + duration);
  };

  const playSuccessChime = () => {
    if (!audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    
    const playNote = (freq: number, start: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, ctx.currentTime + start);
      
      gain.gain.setValueAtTime(0.18, ctx.currentTime + start);
      gain.gain.exponentialRampToValueAtTime(0.002, ctx.currentTime + start + 0.35);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + start);
      osc.stop(ctx.currentTime + start + 0.45);
    };

    // Pentatonic rise
    playNote(440.00, 0); // A4
    playNote(554.37, 0.1); // C#5
    playNote(659.25, 0.2); // E5
    playNote(880.00, 0.3); // A5
  };

  const handleDrumTap = () => {
    if (gameState !== "playing") return;
    initAudio();

    setIsDrumActive(true);
    setTimeout(() => setIsDrumActive(false), 120);

    // Play pitch depending on which syllable we are on
    const pitch = 300 + currentTapIdx * 60;
    playWoodBlockSound(pitch, 0.18);

    const nextTap = currentTapIdx + 1;
    setCurrentTapIdx(nextTap);

    if (nextTap >= currentWord.syllables.length) {
      // Completed!
      setGameState("success");
      setTimeout(() => {
        playSuccessChime();
        confetti({
          particleCount: 50,
          spread: 45,
          origin: { y: 0.6 },
          colors: ["#FAF5EB", "#8E9F85", "#E5B6A8"]
        });

        saveProgress();

        // Advance to next word
        setTimeout(() => {
          setWordIdx(prev => (prev + 1) % DRUMMER_WORDS.length);
          setCurrentTapIdx(0);
          setGameState("playing");
          setRoundStartTime(Date.now());
        }, 2500);

      }, 300);
    }
  };

  const saveProgress = async () => {
    const timeSpent = Date.now() - roundStartTime;
    if (childId) {
      try {
        await fetch(`/api/progress/${childId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            targetLetter: currentWord.targetLetter,
            tracingScore: 100,
            phonemicScore: 100,
            timeSpentMs: timeSpent
          })
        });

        await fetch(`/api/badges/${childId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            badgeName: `Syllable Drummer ${currentWord.word}`
          })
        });
      } catch (e) {
        console.error("Telemetry error:", e);
      }
    }
  };



  const obj = objectDictionary[currentWord.targetLetter];

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
          Syllable Drummer
        </span>
      </div>

      {/* Prompter Banner */}
      <div className="w-full max-w-lg bg-white border-2 border-[#3A413A] rounded-3xl p-3 sm:p-4 mb-4 sm:mb-6 text-center shadow-[3px_3px_0px_0px_rgba(58,65,58,1)] relative z-10">
        <p className="text-[10px] font-black text-[#8E9F85] uppercase tracking-widest mb-1">
          Rhythm & Claps
        </p>
        <h2 className="text-xl sm:text-2xl font-black text-[#3A413A] tracking-tight uppercase">
          Tap the drum for each part!
        </h2>
      </div>

      {/* Main interactive area */}
      <div className="w-full max-w-md flex flex-col items-center z-10 gap-4 sm:gap-6">
        
        {/* Animated Object Image card */}
        <motion.div
          animate={isDrumActive ? { scale: [1, 1.15, 1], rotate: [0, -2, 2, 0] } : {}}
          transition={{ duration: 0.15 }}
          className="w-28 h-28 sm:w-40 sm:h-40 bg-white border-2 border-[#3A413A] rounded-full flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(58,65,58,1)] p-4 relative"
        >
          {React.createElement(obj.icon, { size: "90%" })}
          {gameState === "success" && (
            <motion.div 
              initial={{ scale: 0 }} 
              animate={{ scale: 1 }} 
              className="absolute -top-2 -right-2 bg-[#C8D3C4] border-2 border-[#3A413A] rounded-full p-2 text-[#3A413A]"
            >
              <Music className="w-5 h-5" />
            </motion.div>
          )}
        </motion.div>

        {/* Syllable Blocks Display */}
        <div className="flex justify-center gap-3">
          {currentWord.syllables.map((syl, index) => {
            const isPassed = index < currentTapIdx;
            const isActive = index === currentTapIdx && gameState === "playing";
            
            return (
              <motion.div
                key={syl + "-" + index}
                animate={isActive ? { scale: [1, 1.05, 1] } : {}}
                transition={{ repeat: Infinity, duration: 1.2 }}
                className={`px-5 py-2.5 rounded-2xl border-2 border-[#3A413A] font-black text-xl sm:text-2xl transition-colors duration-300 ${
                  isPassed 
                    ? "bg-[#C8D3C4] text-[#3A413A]" 
                    : isActive 
                      ? "bg-[#E5B6A8] text-[#3A413A] shadow-[2px_2px_0px_0px_rgba(58,65,58,1)]" 
                      : "bg-white text-[#3A413A]/30 border-dashed"
                }`}
              >
                {syl}
              </motion.div>
            );
          })}
        </div>

        {/* Large Wood Drum Pad */}
        <button
          onClick={handleDrumTap}
          disabled={gameState !== "playing"}
          className={`w-36 h-36 sm:w-48 sm:h-48 rounded-full border-4 border-[#3A413A] bg-gradient-to-b from-[#FAF5EB] to-[#E8E4D9] flex items-center justify-center relative shadow-[0_8px_0px_0px_rgba(58,65,58,1)] sm:shadow-[0_12px_0px_0px_rgba(58,65,58,1)] active:shadow-[0_4px_0px_0px_rgba(58,65,58,1)] active:translate-y-2 transition-all cursor-pointer ${
            isDrumActive ? "brightness-95 scale-95" : ""
          }`}
          style={{ touchAction: "none" }}
        >
          {/* Inner ring */}
          <div className="w-26 h-26 sm:w-36 sm:h-36 rounded-full border-2 border-dashed border-[#3A413A]/20 flex items-center justify-center">
            <span className="font-black text-[#3A413A]/40 uppercase tracking-widest text-xs">
              TAP DRUM
            </span>
          </div>
          
          {/* Drum sticks visual decor */}
          <div className="absolute top-2 left-6 w-1 h-12 sm:h-16 bg-[#3A413A]/10 rounded-full transform -rotate-45 pointer-events-none" />
          <div className="absolute top-2 right-6 w-1 h-12 sm:h-16 bg-[#3A413A]/10 rounded-full transform rotate-45 pointer-events-none" />
        </button>

      </div>
    </div>
  );
}
