"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { ArrowLeft, Volume2, CheckCircle2 } from "@/components/Icons";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { vocabularyList, VocabularyItem } from "@/lib/svgDictionary";
import MascotSVG from "./MascotSVG";

interface SoundScavengerEngineProps {
  childId: string;
  onBack: () => void;
}

interface ItemChoice {
  letter: string;
  name: string;
  icon: React.FC<{ size?: string | number } & React.SVGProps<SVGSVGElement>>;
}

interface RoundData {
  targetName: string;
  choices: ItemChoice[];
}

// Pure helper function outside the component scope to calculate time
const getCurrentTime = (): number => Date.now();

function generateRoundData(): RoundData {
  const targetItem = vocabularyList[Math.floor(Math.random() * vocabularyList.length)];
  
  // Gather 8 distinct wrong choices
  const wrongList: VocabularyItem[] = [];
  while (wrongList.length < 8) {
    const item = vocabularyList[Math.floor(Math.random() * vocabularyList.length)];
    if (item.name !== targetItem.name && !wrongList.some(w => w.name === item.name)) {
      wrongList.push(item);
    }
  }

  const choicesList: ItemChoice[] = [
    { letter: targetItem.letter, name: targetItem.name, icon: targetItem.icon },
    ...wrongList.map(item => ({
      letter: item.letter,
      name: item.name,
      icon: item.icon
    }))
  ];

  return {
    targetName: targetItem.name,
    choices: choicesList.sort(() => Math.random() - 0.5)
  };
}

export default function SoundScavengerEngine({ childId, onBack }: SoundScavengerEngineProps) {
  const [roundData, setRoundData] = useState<RoundData>(() => generateRoundData());
  const [gameState, setGameState] = useState<"playing" | "success">("playing");
  const [roundStartTime, setRoundStartTime] = useState<number>(() => getCurrentTime());
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [wrongSelections, setWrongSelections] = useState<number[]>([]);
  
  const audioCtxRef = useRef<AudioContext | null>(null);

  const speakCommand = useCallback(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const targetName = roundData.targetName;
      const utterance = new SpeechSynthesisUtterance(`Find ${targetName}`);
      utterance.rate = 0.85;
      utterance.pitch = 1.1;
      window.speechSynthesis.speak(utterance);
    }
  }, [roundData.targetName]);

  useEffect(() => {
    const t = setTimeout(() => {
      speakCommand();
    }, 400);
    return () => clearTimeout(t);
  }, [roundData.targetName, speakCommand]);

  const initAudio = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext)();
    }
    if (audioCtxRef.current.state === "suspended") {
      audioCtxRef.current.resume();
    }
  };

  // Calming woodwind/wooden-block tone for taps
  const playWoodBlockSound = (pitch: number = 400, duration: number = 0.12) => {
    if (!audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    // Triangle wave gives a softer, rounder tone
    osc.type = "triangle";
    osc.frequency.setValueAtTime(pitch, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(pitch * 0.7, ctx.currentTime + duration);
    
    gain.gain.setValueAtTime(0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.005, ctx.currentTime + duration);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + duration);
  };

  const playSuccessChime = () => {
    if (!audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    
    const playNote = (freq: number, delay: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, ctx.currentTime + delay);
      
      gain.gain.setValueAtTime(0.18, ctx.currentTime + delay);
      gain.gain.exponentialRampToValueAtTime(0.002, ctx.currentTime + delay + 0.35);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + delay);
      osc.stop(ctx.currentTime + delay + 0.4);
    };

    // Calming pentatonic arpeggio (C5 - E5 - A5)
    playNote(523.25, 0);
    playNote(659.25, 0.1);
    playNote(880.00, 0.2);
  };

  const startNewRound = () => {
    initAudio();
    setRoundData(generateRoundData());
    setSelectedIdx(null);
    setWrongSelections([]);
    setGameState("playing");
    setRoundStartTime(getCurrentTime());
  };

  const saveProgress = async (timeSpent: number, targetName: string) => {
    if (childId) {
      try {
        await fetch(`/api/progress/${childId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            targetLetter: targetName,
            tracingScore: 100,
            phonemicScore: 100,
            timeSpentMs: timeSpent
          })
        });

        await fetch(`/api/badges/${childId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            badgeName: `Scavenger Finder ${targetName}`
          })
        });
      } catch (e) {
        console.error("Telemetry error:", e);
      }
    }
  };

  const handleChoiceClick = (idx: number) => {
    if (gameState !== "playing" || selectedIdx !== null || wrongSelections.includes(idx)) return;
    initAudio();

    const choice = roundData.choices[idx];
    if (choice.name === roundData.targetName) {
      // Correct match!
      setSelectedIdx(idx);
      playSuccessChime();
      
      // Speak phonic / word success reward
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(`Excellent! ${choice.name}`);
        utterance.rate = 0.85;
        utterance.pitch = 1.15;
        window.speechSynthesis.speak(utterance);
      }

      const timeSpent = getCurrentTime() - roundStartTime;
      
      setTimeout(() => {
        setGameState("success");
        confetti({
          particleCount: 50,
          spread: 50,
          origin: { y: 0.6 },
          colors: ["#59a26a", "#eaddfc", "#ffafa6", "#a2ea63"]
        });
        
        saveProgress(timeSpent, roundData.targetName);
        
        // Advance to next round
        setTimeout(() => {
          startNewRound();
        }, 2200);
      }, 800);
    } else {
      // Incorrect match
      playWoodBlockSound(180, 0.25); // Lower, hollow block sound
      setWrongSelections(prev => [...prev, idx]);
    }
  };



  return (
    <div className="w-full max-w-3xl mx-auto p-3 sm:p-6 clay-card border border-white/20 flex flex-col items-center justify-between h-full min-h-0 relative overflow-hidden">
      {/* Top Bar */}
      <div className="w-full flex justify-between items-center mb-3 sm:mb-4 z-10">
        <button
          onClick={onBack}
          className="flex items-center gap-2 font-black text-xs uppercase px-4 py-2 bg-white border border-white/20 rounded-full clay-btn hover:scale-102 active:scale-96 transition-all cursor-pointer shadow-[3px_3px_6px_rgba(0,0,0,0.04)]"
        >
          <ArrowLeft className="w-4 h-4 text-[#4A5358]" />
          <span>Back</span>
        </button>
        <span className="text-[10px] font-black uppercase tracking-wider text-[#0b4a45]/80 bg-[#bfdbfe]/50 px-3 py-1.5 rounded-full border border-white/20">
          Sound Scavenger
        </span>
      </div>

      {/* Mascot Command (Hovering Mascot + Speech Bubble next to it, no surrounding card box) */}
      <div 
        onClick={speakCommand}
        className="w-full max-w-xl flex items-center gap-4 mb-4 sm:mb-6 z-10 cursor-pointer select-none active:scale-[0.99] transition-all"
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
            <span>Find the</span>
            <span className="inline-flex items-center justify-center px-3 py-0.5 bg-[#d2f4e6] border border-white/20 rounded-xl text-[#0b4a45] font-black shadow-sm">
              {roundData.targetName}
              <Volume2 className="w-3.5 h-3.5 ml-1" />
            </span>
          </h2>
        </div>
      </div>

      {/* Grid of Choices */}
      <div className="w-full grid grid-cols-3 gap-3 sm:gap-6 z-10">
        <AnimatePresence>
          {roundData.choices.map((choice, idx) => {
            const isWrong = wrongSelections.includes(idx);
            const isSelected = selectedIdx === idx;
            
            return (
              <motion.button
                key={choice.letter + "-" + idx}
                whileHover={gameState === "playing" && !isWrong ? { scale: 1.03 } : {}}
                whileTap={gameState === "playing" && !isWrong ? { scale: 0.97 } : {}}
                onClick={() => handleChoiceClick(idx)}
                disabled={gameState !== "playing" || isWrong}
                className={`relative aspect-square rounded-[2rem] border border-white/20 p-2.5 sm:p-4 flex flex-col items-center justify-center transition-all duration-300 ${
                  isWrong 
                    ? "bg-[#E8E4D9]/20 border-white/20 opacity-30 cursor-default" 
                    : isSelected 
                      ? "bg-[#d2f4e6] shadow-[4px_4px_12px_rgba(78,205,196,0.25),_inset_3px_3px_6px_rgba(255,255,255,0.9),_inset_-3px_-3px_6px_rgba(0,0,0,0.03)]" 
                      : "bg-white shadow-[4px_4px_10px_rgba(0,0,0,0.04),_inset_3px_3px_6px_rgba(255,255,255,0.9),_inset_-3px_-3px_6px_rgba(0,0,0,0.04)]"
                }`}
                animate={isWrong ? { rotate: [0, -6, 6, -6, 6, 0] } : {}}
                transition={{ duration: 0.4 }}
              >
                {/* SVG Icon */}
                <div className={`w-14 h-14 sm:w-28 sm:h-28 transition-transform duration-500 ${isSelected ? "scale-110" : ""}`}>
                  {React.createElement(choice.icon, { size: "100%" })}
                </div>

                {/* Subtitle name (appears on correct tap or after round) */}
                <span className={`text-[10px] sm:text-xs font-black uppercase tracking-wider mt-1 sm:mt-2 transition-opacity duration-300 ${
                  isSelected || gameState === "success" ? "opacity-100 text-[#4A5358]" : "opacity-0"
                }`}>
                  {choice.name}
                </span>

                {/* Success Overlay Indicator */}
                {isSelected && (
                  <div className="absolute top-3 right-3 text-[#4ecdc4]">
                    <CheckCircle2 className="w-6 h-6 fill-white stroke-[#4A5358]" strokeWidth={2.5} />
                  </div>
                )}
              </motion.button>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Ambient Zen Wave Decor */}
      <div className="absolute -bottom-16 -right-16 w-48 h-48 rounded-full border border-white/5 bg-gradient-to-tr from-[#ffcad4]/10 to-[#FAF5EC]/10 pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-64 h-64 rounded-full border border-white/5 bg-gradient-to-tr from-[#ffafa6]/5 to-[#FAF5EC]/10 pointer-events-none" />
    </div>
  );
}
