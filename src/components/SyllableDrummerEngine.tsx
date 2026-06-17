"use client";

import React, { useState, useRef } from "react";
import { ArrowLeft, Music, Trophy } from "@/components/Icons";
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
  { word: "ALLIGATOR", syllables: ["AL", "LI", "GA", "TOR"], targetLetter: "A" },
  { word: "LION", syllables: ["LI", "ON"], targetLetter: "L" },
  { word: "RABBIT", syllables: ["RAB", "BIT"], targetLetter: "R" },
  { word: "ZEBRA", syllables: ["ZE", "BRA"], targetLetter: "Z" }
];

export default function SyllableDrummerEngine({ childId, onBack }: SyllableDrummerEngineProps) {
  const [wordIdx, setWordIdx] = useState(() => Math.floor(Math.random() * DRUMMER_WORDS.length));
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

    // Speak the current syllable sound!
    const syllable = currentWord.syllables[currentTapIdx];
    if (syllable && typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(syllable.toLowerCase());
      utterance.rate = 0.8;
      utterance.pitch = 1.2;
      window.speechSynthesis.speak(utterance);
    }

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
          colors: ["#faf5eb", "#59a26a", "#ffafa6"]
        });

        // Speak full word as a final completion reward
        if (typeof window !== "undefined" && window.speechSynthesis) {
          setTimeout(() => {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(currentWord.word.toLowerCase());
            utterance.rate = 0.85;
            utterance.pitch = 1.15;
            window.speechSynthesis.speak(utterance);
          }, 350);
        }

        saveProgress();

        // Advance to next word
        setTimeout(() => {
          setWordIdx(prev => {
            if (DRUMMER_WORDS.length <= 1) return 0;
            let nextIdx = prev;
            while (nextIdx === prev) {
              nextIdx = Math.floor(Math.random() * DRUMMER_WORDS.length);
            }
            return nextIdx;
          });
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
    <div className="w-full max-w-3xl mx-auto p-3 sm:p-6 clay-card border border-white/20 flex flex-col items-center justify-between h-full min-h-0 relative overflow-hidden">
      {/* Top Bar */}
      <div className="w-full flex justify-between items-center mb-3 sm:mb-4 z-10">
        <button
          onClick={onBack}
          className="flex items-center gap-2 font-black text-xs uppercase px-4 py-2 bg-white border border-white/20 rounded-full clay-btn hover:scale-102 active:scale-96 transition-all cursor-pointer shadow-[3px_3px_6px_rgba(0,0,0,0.04)] text-[#4A5358]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>
        <span className="text-[10px] font-black uppercase tracking-wider text-[#3c1e70]/80 bg-[#e9d5ff]/60 px-3 py-1.5 rounded-full border border-white/20">
          Syllable Drummer
        </span>
      </div>

      {/* Prompter Banner */}
      <div className="w-full max-w-lg bg-white border border-white/20 rounded-3xl p-3 sm:p-4 mb-4 sm:mb-6 text-center shadow-[4px_4px_12px_rgba(0,0,0,0.04),_inset_2px_2px_4px_rgba(255,255,255,0.85)] relative z-10">
        <p className="text-[10px] font-black text-secondary uppercase tracking-widest mb-1">
          Rhythm & Claps
        </p>
        <h2 className="text-xl sm:text-2xl font-black text-[#4A5358] tracking-tight uppercase">
          Tap the drum for each part!
        </h2>
      </div>

      {/* Main interactive area */}
      <div className="w-full max-w-md flex flex-col items-center z-10 gap-4 sm:gap-6">
        
        {/* Animated Object Image card */}
        <motion.div
          animate={isDrumActive ? { scale: [1, 1.15, 1], rotate: [0, -2, 2, 0] } : {}}
          transition={{ duration: 0.15 }}
          className="w-28 h-28 sm:w-40 sm:h-40 bg-white border border-white/20 rounded-full flex items-center justify-center shadow-[6px_6px_12px_rgba(0,0,0,0.05),_inset_-4px_-4px_8px_rgba(0,0,0,0.05),_inset_4px_4px_8px_rgba(255,255,255,0.95)] p-4 relative"
        >
          {React.createElement(obj.icon, { size: "90%" })}
          {gameState === "success" && (
            <motion.div 
              initial={{ scale: 0 }} 
              animate={{ scale: 1 }} 
              className="absolute -top-2 -right-2 bg-secondary-container border border-white/20 rounded-full p-2.5 text-secondary shadow-[2px_2px_4px_rgba(0,0,0,0.05)]"
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
                className={`px-5 py-2.5 rounded-2xl border border-white/20 font-black text-xl sm:text-2xl transition-colors duration-300 ${
                  isPassed 
                    ? "bg-[#d2f4e6] text-[#0b4a45] shadow-inner" 
                    : isActive 
                      ? "bg-[#ffcad4] text-[#590d22] shadow-[0_4px_8px_rgba(255,133,161,0.2),_inset_2px_2px_4px_rgba(255,255,255,0.85)] animate-pulse" 
                      : "bg-white/40 text-[#4a5358]/20 border-dashed border-[#9eb1bd]/40"
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
          className={`w-36 h-36 sm:w-48 sm:h-48 rounded-full border-4 border-white/40 bg-gradient-to-b from-[#fef5d1] to-[#ffd166] flex items-center justify-center relative shadow-[0_12px_24px_rgba(255,209,102,0.3),_inset_-6px_-6px_12px_rgba(0,0,0,0.06),_inset_6px_6px_12px_rgba(255,255,255,0.95)] active:shadow-[0_4px_8px_rgba(255,209,102,0.25),_inset_-3px_-3px_6px_rgba(255,255,255,0.9),_inset_4px_4px_8px_rgba(0,0,0,0.12)] active:translate-y-2 transition-all cursor-pointer ${
            isDrumActive ? "brightness-95 scale-95" : ""
          }`}
          style={{ touchAction: "none" }}
        >
          {/* Inner ring */}
          <div className="w-26 h-26 sm:w-36 sm:h-36 rounded-full border border-dashed border-white/40 flex items-center justify-center">
            <span className="font-black text-white/70 uppercase tracking-widest text-xs">
              TAP DRUM
            </span>
          </div>
          
          {/* Drum sticks visual decor */}
          <div className="absolute top-2 left-6 w-1 h-12 sm:h-16 bg-white/15 rounded-full transform -rotate-45 pointer-events-none" />
          <div className="absolute top-2 right-6 w-1 h-12 sm:h-16 bg-white/15 rounded-full transform rotate-45 pointer-events-none" />
        </button>

      </div>

      {gameState === "success" && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 bg-[#f3f8fc]/90 backdrop-blur-sm z-20 flex flex-col items-center justify-center p-6"
        >
          <motion.div 
            initial={{ y: 30, scale: 0.8 }}
            animate={{ y: 0, scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="clay-card border border-white/20 p-8 bg-white max-w-sm w-full text-center flex flex-col items-center gap-4"
          >
            <div className="w-20 h-20 rounded-full bg-secondary-container flex items-center justify-center text-secondary shadow-[inset_2px_2px_4px_rgba(255,255,255,0.8),_inset_-2px_-2px_4px_rgba(0,0,0,0.05)] border border-white/10 animate-bounce">
              <Trophy size={40} className="fill-current text-[#4ecdc4]" />
            </div>
            <h3 className="text-2xl font-black text-[#4A5358] uppercase">Great Rhythm!</h3>
            <p className="text-sm font-bold text-[#4A5358]/70">You drummed all the syllables! Get ready for the next word...</p>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
