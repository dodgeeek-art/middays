"use client";

import React, { useState, useRef } from "react";
import { ArrowLeft, Music } from "@/components/Icons";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import { objectDictionary } from "@/lib/svgDictionary";
import ClayButton from "@/components/ui/ClayButton";
import { InGameSuccessState } from "@/components/ui/InGameShell";

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

  // Water drop frequency sweep tone
  const playWaterDropSound = () => {
    if (!audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = "sine";
    osc.frequency.setValueAtTime(300, now);
    osc.frequency.exponentialRampToValueAtTime(1200, now + 0.15);
    
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start();
    osc.stop(now + 0.16);
  };

  // Low bass thud kick tone
  const playBassThudSound = () => {
    if (!audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = "sine";
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.2);
    
    gain.gain.setValueAtTime(0.5, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start();
    osc.stop(now + 0.21);
  };

  // Metallic cowbell detuned tone
  const playCowbellSound = () => {
    if (!audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    const now = ctx.currentTime;
    
    [540, 800].forEach((freq) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, now);
      
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start();
      osc.stop(now + 0.26);
    });
  };

  const playDrumSound = (idx: number) => {
    initAudio();
    if (idx === 0) {
      playWoodBlockSound(400, 0.18);
    } else if (idx === 1) {
      playWaterDropSound();
    } else if (idx === 2) {
      playBassThudSound();
    } else {
      playCowbellSound();
    }
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

    playNote(440.00, 0); // A4
    playNote(554.37, 0.1); // C#5
    playNote(659.25, 0.2); // E5
    playNote(880.00, 0.3); // A5
  };

  const handleDrumTap = (idx: number) => {
    if (gameState !== "playing") return;
    if (idx !== currentTapIdx) return;
    initAudio();

    setIsDrumActive(true);
    setTimeout(() => setIsDrumActive(false), 120);

    playDrumSound(idx);

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
        <ClayButton
          variant="surface"
          size="icon"
          className="min-w-[64px] min-h-[64px]"
          onClick={onBack}
        >
          <ArrowLeft size={28} strokeWidth={3.5} />
        </ClayButton>
        <span className="text-[10px] font-black uppercase tracking-wider text-[#3c1e70]/80 bg-[#e9d5ff]/60 px-4 py-2 rounded-full border border-white/20">
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
          transition={{ type: "tween", duration: 0.15, ease: "easeInOut" }}
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
                transition={{ type: "tween", repeat: Infinity, duration: 1.2, ease: "easeInOut" }}
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

        {/* Colorful Clay Pot Drums */}
        <div className="flex gap-4 justify-center items-end mt-4 w-full px-2">
          {currentWord.syllables.map((syl, index) => {
            const isPassed = index < currentTapIdx;
            const isActive = index === currentTapIdx && gameState === "playing";
            const isDisabled = index > currentTapIdx || gameState !== "playing";
            
            const drumColors = [
              { bg: "bg-[#e07383] border-[#f2c1c6]", text: "text-white", labelBg: "bg-[#f2c1c6]" }, // primary
              { bg: "bg-[#3fa394] border-[#c3e6dc]", text: "text-white", labelBg: "bg-[#c3e6dc]" }, // secondary
              { bg: "bg-[#d4a919] border-[#f5e4a3]", text: "text-white", labelBg: "bg-[#f5e4a3]" }, // tertiary
              { bg: "bg-[#9e7bf5] border-[#e9d5ff]", text: "text-white", labelBg: "bg-[#e9d5ff]" }, // purple
            ];
            
            const color = drumColors[index % drumColors.length];
            
            return (
              <motion.button
                key={index}
                onClick={() => handleDrumTap(index)}
                disabled={isDisabled}
                animate={isActive ? { scale: [1, 1.05, 1], y: [0, -6, 0] } : {}}
                transition={isActive ? { type: "tween", repeat: Infinity, duration: 1.5, ease: "easeInOut" } : {}}
                whileTap={isDisabled ? {} : { scale: 0.92, y: 4 }}
                className={`w-20 sm:w-28 flex flex-col items-center relative transition-all duration-300 ${
                  isDisabled && !isPassed ? "opacity-45" : "opacity-100"
                }`}
                style={{ touchAction: "none" }}
              >
                {/* Drum skin top (oval) */}
                <div className="w-full h-6 sm:h-8 bg-[#fdfaf7] rounded-full border-[3px] border-slate-300 shadow-inner z-10 flex items-center justify-center relative overflow-hidden">
                  {/* Visual beat ripple */}
                  {isDrumActive && isActive && (
                    <motion.div
                      initial={{ scale: 0.5, opacity: 0.8 }}
                      animate={{ scale: 1.2, opacity: 0 }}
                      className="absolute inset-0 rounded-full bg-white/40 border border-white"
                    />
                  )}
                </div>
                
                {/* Drum clay pot body */}
                <div className={`w-[95%] -mt-3 h-20 sm:h-28 rounded-b-[1.75rem] rounded-t-[1rem] border-4 border-t-0 flex flex-col items-center justify-center shadow-clay-card ${color.bg} ${color.text} relative overflow-hidden`}>
                  <span className="font-extrabold text-sm sm:text-lg tracking-wider opacity-90 uppercase">
                    {syl}
                  </span>
                  
                  {/* Decorative clay pattern */}
                  <div className="w-full h-1 bg-white/20 mt-2 border-y border-white/5 opacity-50" />
                </div>
                
                {/* Visual completion checkmark */}
                {isPassed && (
                  <div className="absolute top-8 bg-emerald-400 text-white rounded-full p-1 border-2 border-white shadow-md z-20">
                    ✔️
                  </div>
                )}
              </motion.button>
            );
          })}
        </div>

      </div>

      {gameState === "success" && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 bg-[#fff8e7]/88 backdrop-blur-sm z-20 flex flex-col items-center justify-center p-6"
        >
          <motion.div 
            initial={{ y: 30, scale: 0.8 }}
            animate={{ y: 0, scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
          >
            <InGameSuccessState
              title="Great Rhythm!"
              message="You drummed all the syllables. Get ready for the next word."
            />
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
