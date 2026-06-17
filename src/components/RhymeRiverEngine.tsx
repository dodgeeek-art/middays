"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { ArrowLeft, Volume2, Check } from "@/components/Icons";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import { objectDictionary } from "@/lib/svgDictionary";
import MascotSVG from "./MascotSVG";
import RiverBackgroundSVG from "./RiverBackgroundSVG";

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
  { promptWord: "BOX", targetLetter: "F", choices: ["F", "B", "D"] },    // Fox rhymes with Box
  { promptWord: "LOG", targetLetter: "D", choices: ["D", "P", "S"] },    // Dog rhymes with Log
  { promptWord: "HAT", targetLetter: "C", choices: ["C", "F", "Y"] },    // Cat rhymes with Hat
  { promptWord: "WIG", targetLetter: "P", choices: ["P", "B", "W"] },    // Pig rhymes with Wig
  { promptWord: "PEAR", targetLetter: "B", choices: ["B", "D", "M"] },   // Bear rhymes with Pear
  { promptWord: "SNAIL", targetLetter: "W", choices: ["W", "P", "L"] },  // Whale rhymes with Snail
  { promptWord: "CAKE", targetLetter: "S", choices: ["S", "Y", "D"] },   // Snake rhymes with Cake
  { promptWord: "SACK", targetLetter: "Y", choices: ["Y", "C", "F"] }    // Yak rhymes with Sack
];

export default function RhymeRiverEngine({ childId, onBack }: RhymeRiverEngineProps) {
  const [roundIdx, setRoundIdx] = useState(0);
  const [gameState, setGameState] = useState<"playing" | "success">("playing");
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const [wrongSelections, setWrongSelections] = useState<string[]>([]);
  
  const currentRound = RHYME_ROUNDS[roundIdx];
  const audioCtxRef = useRef<AudioContext | null>(null);

  const speakCommand = useCallback(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(`Find the stone that rhymes with ${currentRound.promptWord}`);
      utterance.rate = 0.85;
      utterance.pitch = 1.1;
      window.speechSynthesis.speak(utterance);
    }
  }, [currentRound.promptWord]);

  useEffect(() => {
    const t = setTimeout(() => {
      speakCommand();
    }, 450);
    return () => clearTimeout(t);
  }, [roundIdx, speakCommand]);

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

  const handleStoneClick = (letter: string) => {
    if (gameState !== "playing" || selectedLetter !== null || wrongSelections.includes(letter)) return;
    initAudio();

    if (letter === currentRound.targetLetter) {
      // Correct!
      setSelectedLetter(letter);
      setGameState("success");
      playSuccessChime();
      
      // Speak rhyming success matching
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
        const targetObj = objectDictionary[letter];
        const targetName = targetObj ? targetObj.name : "";
        const utterance = new SpeechSynthesisUtterance(`Yes! ${currentRound.promptWord} rhymes with ${targetName}!`);
        utterance.rate = 0.85;
        utterance.pitch = 1.15;
        window.speechSynthesis.speak(utterance);
      }

      confetti({
        particleCount: 40,
        spread: 40,
        origin: { y: 0.75 },
        colors: ["#59a26a", "#eaddfc", "#ffafa6"]
      });

      saveProgress();

      // Advance to next round after 2.2 seconds
      setTimeout(() => {
        setRoundIdx(prev => (prev + 1) % RHYME_ROUNDS.length);
        setSelectedLetter(null);
        setWrongSelections([]);
        setGameState("playing");
      }, 2200);

    } else {
      // Wrong card
      playWaterSplash();
      setWrongSelections(prev => [...prev, letter]);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col justify-between min-h-[75vh] md:min-h-[82vh] rounded-[2.5rem] border border-white/25 relative overflow-hidden bg-transparent p-5 sm:p-8 shadow-[inset_0_4px_16px_rgba(0,0,0,0.06)]">
      
      {/* Animated SVG River Background */}
      <RiverBackgroundSVG />

      {/* Top Bar */}
      <div className="w-full flex justify-between items-center z-10">
        <button
          onClick={onBack}
          className="flex items-center gap-2 font-black text-xs uppercase px-4 py-2 bg-white border border-white/20 rounded-full clay-btn hover:scale-102 active:scale-96 transition-all cursor-pointer shadow-[3px_3px_6px_rgba(0,0,0,0.04)] text-[#4A5358]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>
        <span className="text-[10px] font-black uppercase tracking-wider text-[#590d22]/80 bg-[#ffcad4]/50 px-3 py-1.5 rounded-full border border-white/20">
          Rhyme River
        </span>
      </div>

      {/* Mascot Command (Hovering Mascot + Speech Bubble next to it, no surrounding card box) */}
      <div 
        onClick={speakCommand}
        className="w-full max-w-xl mx-auto flex items-center gap-4 mt-2 mb-4 z-10 cursor-pointer select-none active:scale-[0.99] transition-all"
      >
        {/* Hovering Mascot SVG */}
        <div className="w-16 h-16 sm:w-24 sm:h-24 shrink-0 drop-shadow-md">
          <MascotSVG className="w-full h-full" />
        </div>
        
        {/* Speech Bubble */}
        <div className="flex-1 relative bg-white border border-[#4a5358]/10 p-3.5 sm:p-4 rounded-[2rem] shadow-[4px_4px_12px_rgba(0,0,0,0.03),_inset_2px_2px_4px_rgba(255,255,255,0.9)] text-left">
          {/* Bubble Tail */}
          <div className="absolute top-1/2 -left-3 -translate-y-1/2 w-0 h-0 border-t-[8px] border-t-transparent border-r-[12px] border-r-white border-b-[8px] border-b-transparent filter drop-shadow-[-1px_0_0_rgba(74,83,88,0.06)]"></div>
          
          <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-0.5">
            Guide says:
          </p>
          <h2 className="text-sm sm:text-base font-black text-[#4A5358] tracking-tight uppercase flex items-center gap-1.5 flex-wrap">
            <span>Find the stone that rhymes with</span>
            <span className="inline-flex items-center justify-center px-3 py-0.5 bg-[#ffcad4] border border-white/20 rounded-xl text-[#590d22] font-black shadow-sm">
              {currentRound.promptWord}
              <Volume2 className="w-3.5 h-3.5 ml-1" />
            </span>
          </h2>
        </div>
      </div>

      {/* Lily Pads Stepping Stones Choices Area */}
      <div className="flex-1 w-full flex justify-around items-center px-8 relative z-10 my-4">
        {currentRound.choices.map((letter, index) => {
          const obj = objectDictionary[letter];
          const isSelected = selectedLetter === letter;
          const isWrong = wrongSelections.includes(letter);
          
          return (
            <div key={letter + "-" + index} className="flex flex-col items-center relative w-20 sm:w-28">
              {/* Floating Water Ripple Ring */}
              {!isWrong && !isSelected && (
                <div 
                  className="absolute -inset-2 rounded-full border border-white/10 bg-white/5 animate-ping opacity-20 pointer-events-none" 
                  style={{ animationDuration: "3s", animationDelay: `${index * 0.8}s` }} 
                />
              )}

              {/* 3D Lily Pad Button - Enlarged for better touch target */}
              <motion.button
                whileHover={gameState === "playing" && !isWrong ? { scale: 1.06, y: -4 } : {}}
                whileTap={gameState === "playing" && !isWrong ? { scale: 0.94 } : {}}
                onClick={() => handleStoneClick(letter)}
                disabled={gameState !== "playing" || isWrong}
                animate={isWrong ? { rotate: [0, -8, 8, -8, 8, 0], scale: 0.95 } : { y: [0, -3, 0] }}
                transition={isWrong ? { duration: 0.4 } : {
                  y: {
                    duration: 2.2,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: index * 0.4
                  }
                }}
                className={`w-20 h-20 sm:w-28 sm:h-28 rounded-full border-2 p-3 sm:p-4.5 flex items-center justify-center transition-all duration-300 relative ${
                  isWrong 
                    ? "bg-stone-200/40 border-stone-300/40 opacity-30 cursor-default" 
                    : isSelected 
                      ? "bg-[#d2f4e6] border-[#4ecdc4] shadow-[0_8px_16px_rgba(78,205,196,0.3),_inset_3px_3px_6px_rgba(255,255,255,0.9)]"
                      : "bg-[#e8f5e9] border-[#a1d99b] shadow-[0_6px_0_#81c784,0_10px_16px_rgba(0,0,0,0.1),_inset_3px_3px_6px_rgba(255,255,255,0.9)]"
                }`}
              >
                {/* Lily Pad Leaf Notch Detail */}
                {!isWrong && (
                  <div 
                    className="absolute top-0.5 left-2 w-3.5 h-3.5 border-r-2 border-b-2 border-[#a1d99b] rounded-full transform -rotate-45" 
                    style={{ backgroundColor: isSelected ? "#d2f4e6" : "#e8f5e9" }}
                  />
                )}

                <div className="w-[85%] h-[85%] flex items-center justify-center relative z-10">
                  {React.createElement(obj.icon, { size: "100%" })}
                </div>

                {isSelected && (
                  <div className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-white border-2 border-[#4ecdc4] flex items-center justify-center text-[#4ecdc4] shadow-sm z-20">
                    <Check className="w-3.5 h-3.5 text-[#4ecdc4]" strokeWidth={4} />
                  </div>
                )}
              </motion.button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
