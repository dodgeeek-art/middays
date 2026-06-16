"use client";

import React, { useState, useRef } from "react";
import { ArrowLeft, Volume2, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { objectDictionary } from "@/lib/svgDictionary";

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
  targetLetter: string;
  choices: ItemChoice[];
}

// Pure helper function outside the component scope to calculate time
const getCurrentTime = (): number => Date.now();

function generateRoundData(): RoundData {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const target = letters[Math.floor(Math.random() * letters.length)];
  
  // Gather 5 distinct wrong letters
  const wrongList: string[] = [];
  while (wrongList.length < 5) {
    const char = letters[Math.floor(Math.random() * letters.length)];
    if (char !== target && !wrongList.includes(char)) {
      wrongList.push(char);
    }
  }

  const correctObj = objectDictionary[target];
  const choicesList: ItemChoice[] = [
    { letter: target, name: correctObj.name, icon: correctObj.icon },
    ...wrongList.map(l => {
      const obj = objectDictionary[l];
      return { letter: l, name: obj.name, icon: obj.icon };
    })
  ];

  return {
    targetLetter: target,
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

  const saveProgress = async (timeSpent: number, target: string) => {
    if (childId) {
      try {
        await fetch(`/api/progress/${childId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            targetLetter: target,
            tracingScore: 100,
            phonemicScore: 100,
            timeSpentMs: timeSpent
          })
        });

        await fetch(`/api/badges/${childId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            badgeName: `Scavenger Finder ${target}`
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
    if (choice.letter === roundData.targetLetter) {
      // Correct match!
      setSelectedIdx(idx);
      playSuccessChime();
      const timeSpent = getCurrentTime() - roundStartTime;
      
      setTimeout(() => {
        setGameState("success");
        confetti({
          particleCount: 50,
          spread: 50,
          origin: { y: 0.6 },
          colors: ["#8E9F85", "#C8D3C4", "#FAF5EB", "#E5B6A8"]
        });
        
        saveProgress(timeSpent, roundData.targetLetter);
        
        // Advance to next round
        setTimeout(() => {
          startNewRound();
        }, 2500);
      }, 800);
    } else {
      // Incorrect match
      playWoodBlockSound(180, 0.25); // Lower, hollow block sound
      setWrongSelections(prev => [...prev, idx]);
    }
  };

  // Convert letter to phonic helper sound label
  const getPhonicSound = (char: string) => {
    const dict: Record<string, string> = {
      A: "ah", B: "buh", C: "cuh", D: "duh", E: "eh", F: "fuh", G: "guh",
      H: "huh", I: "ih", J: "juh", K: "kuh", L: "luh", M: "muh", N: "nuh",
      O: "ah", P: "puh", Q: "quh", R: "ruh", S: "ss", T: "tuh", U: "uh",
      V: "vuh", W: "wuh", X: "ks", Y: "yuh", Z: "zuh"
    };
    return dict[char] || char.toLowerCase();
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
          Sound Scavenger
        </span>
      </div>

      {/* Prompter Banner */}
      <div className="w-full max-w-lg bg-white border-2 border-[#3A413A] rounded-3xl p-3 sm:p-5 mb-4 sm:mb-6 text-center shadow-[3px_3px_0px_0px_rgba(58,65,58,1)] relative z-10">
        <p className="text-[10px] font-black text-[#8E9F85] uppercase tracking-widest mb-1">
          Auditory Challenge
        </p>
        <h2 className="text-xl sm:text-2xl font-black text-[#3A413A] tracking-tight uppercase flex justify-center items-center gap-2">
          <span>Find the target sound:</span>
          <span className="inline-flex items-center justify-center px-4 py-1 bg-[#C8D3C4] border-2 border-[#3A413A] rounded-2xl text-[#3A413A] text-2xl font-black relative group cursor-pointer active:scale-95 transition-all" onClick={() => playWoodBlockSound(300 + (roundData.targetLetter.charCodeAt(0) - 65) * 8, 0.2)}>
            /{getPhonicSound(roundData.targetLetter)}/
            <Volume2 className="w-4 h-4 ml-1.5 opacity-60 group-hover:opacity-100 transition-opacity" />
          </span>
        </h2>
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
                className={`relative aspect-square rounded-[2rem] border-2 border-[#3A413A] p-2.5 sm:p-4 flex flex-col items-center justify-center transition-all duration-300 ${
                  isWrong 
                    ? "bg-[#E8E4D9]/20 border-[#3A413A]/30 opacity-40 cursor-default" 
                    : isSelected 
                      ? "bg-[#C8D3C4] shadow-[0_0_20px_rgba(142,159,133,0.3)]" 
                      : "bg-white shadow-[3px_3px_0px_0px_rgba(58,65,58,1)]"
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
                  isSelected || gameState === "success" ? "opacity-100 text-[#3A413A]" : "opacity-0"
                }`}>
                  {choice.name}
                </span>

                {/* Success Overlay Indicator */}
                {isSelected && (
                  <div className="absolute top-3 right-3 text-[#8E9F85]">
                    <CheckCircle2 className="w-6 h-6 fill-white stroke-[#3A413A]" strokeWidth={2.5} />
                  </div>
                )}
              </motion.button>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Ambient Zen Wave Decor */}
      <div className="absolute -bottom-16 -right-16 w-48 h-48 rounded-full border border-[#3A413A]/5 bg-gradient-to-tr from-[#C8D3C4]/10 to-[#FAF5EB]/10 pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-64 h-64 rounded-full border border-[#3A413A]/5 bg-gradient-to-tr from-[#E5B6A8]/5 to-[#FAF5EB]/10 pointer-events-none" />
    </div>
  );
}
