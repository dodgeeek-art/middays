"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { ArrowLeft, Sparkles, HelpCircle } from "@/components/Icons";
import { motion, AnimatePresence } from "framer-motion";
import ClayButton from "@/components/ui/ClayButton";
import ClayCard from "@/components/ui/ClayCard";
import MascotTransition from "@/components/ui/MascotTransition";
import { objectDictionary } from "@/lib/svgDictionary";

// Audio Synth Helper
const playSynthesizedSound = (type: "correct" | "wrong" | "levelUp" | "click" | "pop") => {
  if (typeof window === "undefined") return;
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const now = ctx.currentTime;
    
    if (type === "correct") {
      [523.25, 659.25].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);
        gain.gain.setValueAtTime(0.25, now + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.08 + 0.15);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.16);
      });
    } else if (type === "wrong") {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.exponentialRampToValueAtTime(80, now + 0.3);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(now + 0.3);
    } else if (type === "levelUp") {
      [261.63, 329.63, 392.00, 523.25].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now + idx * 0.1);
        gain.gain.setValueAtTime(0.2, now + idx * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.1 + 0.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.1);
        osc.stop(now + idx * 0.1 + 0.22);
      });
    } else if (type === "click") {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(600, now);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(now + 0.05);
    } else if (type === "pop") {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(450, now);
      osc.frequency.exponentialRampToValueAtTime(250, now + 0.08);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(now + 0.08);
    }
  } catch (e) {
    console.error("Audio synthesis error:", e);
  }
};

interface PatternExplorerEngineProps {
  childId: string;
  onBack: () => void;
}

interface PatternLevel {
  id: number;
  patternType: "ABAB" | "AABB" | "ABC";
  sequenceKeys: string[];
  correctKey: string;
  choices: string[];
  instruction: string;
}

const levels: PatternLevel[] = [
  {
    id: 1,
    patternType: "ABAB",
    sequenceKeys: ["A", "B", "A", "B"], // Alligator, Bear, Alligator, Bear
    correctKey: "A",
    choices: ["C", "A", "E"], // Cat, Alligator, Elephant
    instruction: "What comes next in the pattern?"
  },
  {
    id: 2,
    patternType: "AABB",
    sequenceKeys: ["C", "C", "D", "D"], // Cat, Cat, Dog, Dog
    correctKey: "C",
    choices: ["D", "E", "C"], // Dog, Elephant, Cat
    instruction: "Look closely... who's next in line?"
  },
  {
    id: 3,
    patternType: "ABC",
    sequenceKeys: ["E", "F", "G", "E"], // Elephant, Fox, Giraffe, Elephant
    correctKey: "F",
    choices: ["F", "H", "I"], // Fox, Hippo, Iguana
    instruction: "Help complete the pattern!"
  },
  {
    id: 4,
    patternType: "ABAB",
    sequenceKeys: ["H", "J", "H", "J"], // Hippo, Jellyfish, Hippo, Jellyfish
    correctKey: "H",
    choices: ["K", "L", "H"], // Koala, Lion, Hippo
    instruction: "You're doing great! Fill in the blank."
  },
  {
    id: 5,
    patternType: "AABB",
    sequenceKeys: ["M", "M", "P", "P"], // Monkey, Monkey, Pig, Pig
    correctKey: "M",
    choices: ["O", "M", "Q"], // Owl, Monkey, Queen
    instruction: "Finish the final sequence!"
  }
];

export default function PatternExplorerEngine({ childId, onBack }: PatternExplorerEngineProps) {
  const [currentLevelIdx, setCurrentLevelIdx] = useState(0);
  const [phase, setPhase] = useState<"playing" | "success" | "finished">("playing");
  const [errorsThisRound, setErrorsThisRound] = useState(0);
  const [showMascotTransition, setShowMascotTransition] = useState(false);
  const [wrongChoiceKey, setWrongChoiceKey] = useState<string | null>(null);
  const [correctFilled, setCorrectFilled] = useState(false);
  
  const startTimeRef = useRef<number>(Date.now());
  const activeLevel = levels[currentLevelIdx];

  useEffect(() => {
    startTimeRef.current = Date.now();
    setErrorsThisRound(0);
    setPhase("playing");
    setCorrectFilled(false);
    setWrongChoiceKey(null);
  }, [currentLevelIdx]);

  const handleChoiceSelect = async (key: string) => {
    if (phase !== "playing") return;

    if (key === activeLevel.correctKey) {
      playSynthesizedSound("correct");
      setCorrectFilled(true);
      setPhase("success");

      // Brief delay before the overlay mascot shows up to celebrate
      setTimeout(() => {
        setShowMascotTransition(true);
      }, 700);
    } else {
      playSynthesizedSound("wrong");
      setWrongChoiceKey(key);
      setErrorsThisRound(prev => prev + 1);
      setTimeout(() => {
        setWrongChoiceKey(null);
      }, 500);
    }
  };

  const handleMascotTransitionComplete = async () => {
    setShowMascotTransition(false);
    if (currentLevelIdx < levels.length - 1) {
      setCurrentLevelIdx(prev => prev + 1);
    } else {
      // Game fully completed
      playSynthesizedSound("levelUp");
      setPhase("finished");

      const timeSpent = Date.now() - startTimeRef.current;
      const score = Math.max(0, 100 - errorsThisRound * 15);

      if (childId) {
        try {
          await fetch(`/api/progress/${childId}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              targetLetter: "PATTERN",
              tracingScore: score,
              phonemicScore: 100,
              timeSpentMs: timeSpent
            })
          });

          await fetch(`/api/badges/${childId}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              badgeName: "Logic Explorer Badge"
            })
          });
        } catch (e) {
          console.error("Failed to save sequence progress/badge:", e);
        }
      }
    }
  };

  const handleRestart = () => {
    playSynthesizedSound("click");
    setCurrentLevelIdx(0);
    setErrorsThisRound(0);
    setPhase("playing");
    setCorrectFilled(false);
    setWrongChoiceKey(null);
    startTimeRef.current = Date.now();
  };

  return (
    <div className="flex flex-col w-full max-w-4xl mx-auto h-full min-h-0 bg-[#fbfbfd] p-4 rounded-[2.5rem] border-[3px] border-white/50 shadow-clay-card relative overflow-hidden select-none">
      {/* Background decoration */}
      <div className="absolute -z-10 bg-[#ddcbf5]/30 w-72 h-72 rounded-full blur-[90px] opacity-40 -top-10 -right-10"></div>
      <div className="absolute -z-10 bg-[#c3f2ec]/20 w-80 h-80 rounded-full blur-[100px] opacity-30 -bottom-10 -left-10"></div>

      {/* Header */}
      <div className="flex items-center justify-between mb-4 shrink-0">
        <ClayButton
          variant="surface"
          size="icon"
          className="min-w-[64px] min-h-[64px]"
          onClick={() => {
            playSynthesizedSound("click");
            onBack();
          }}
        >
          <ArrowLeft size={28} strokeWidth={3.5} />
        </ClayButton>

        <h1 className="text-xl sm:text-2xl font-black uppercase text-[#4A5358] tracking-wider flex items-center gap-2">
          <Sparkles size={24} className="text-[#7c52c7]" strokeWidth={3.5} />
          Pattern Explorer
        </h1>

        <div className="bg-white/80 border-2 border-white/40 shadow-inner px-4 py-2 rounded-full font-black text-[#7c52c7] text-sm tracking-wide">
          LEVEL {activeLevel.id}/{levels.length} 🧩
        </div>
      </div>

      {/* Game Content */}
      <div className="flex-grow flex flex-col items-center justify-center gap-6 min-h-0">
        {phase === "finished" ? (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex flex-col items-center justify-center text-center p-8 bg-white/70 backdrop-blur-sm rounded-[2rem] border-2 border-white/40 shadow-clay-card max-w-md w-full"
          >
            <div className="text-6xl mb-4">🏆</div>
            <h2 className="text-3xl font-black text-[#4a5358] mb-2 uppercase">Amazing Job!</h2>
            <p className="text-sm font-bold text-slate-500 mb-6">
              You are a Pattern Master! You completed all the logic patterns perfectly.
            </p>
            <div className="flex gap-4 w-full">
              <ClayButton variant="primary" className="flex-1 py-4 text-lg" onClick={handleRestart}>
                Play Again
              </ClayButton>
              <ClayButton variant="surface" className="flex-1 py-4 text-lg" onClick={onBack}>
                Menu
              </ClayButton>
            </div>
          </motion.div>
        ) : (
          <div className="flex flex-col items-center w-full gap-8 min-h-0">
            {/* Title / Instruction */}
            <div className="text-center">
              <p className="text-lg sm:text-xl font-black text-[#4A5358] flex items-center justify-center gap-2">
                <HelpCircle size={22} className="text-[#7c52c7]" strokeWidth={3} />
                {activeLevel.instruction}
              </p>
            </div>

            {/* Pattern sequence track */}
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-5 w-full px-2">
              {activeLevel.sequenceKeys.map((key, index) => {
                const item = objectDictionary[key];
                const IconComponent = item?.icon;
                return (
                  <ClayCard
                    key={index}
                    hoverEffect={false}
                    className="w-20 h-20 sm:w-28 sm:h-28 bg-white rounded-3xl flex items-center justify-center shadow-clay-card border-[3px] border-white/50 p-2.5 select-none"
                  >
                    {IconComponent && (
                      <>
                        <div className="sm:hidden">
                          <IconComponent size={56} />
                        </div>
                        <div className="hidden sm:block">
                          <IconComponent size={80} />
                        </div>
                      </>
                    )}
                  </ClayCard>
                );
              })}

              {/* Target / Blank Slot */}
              <div className="relative">
                <motion.div
                  className={`w-20 h-20 sm:w-28 sm:h-28 rounded-3xl border-dashed border-[4px] flex items-center justify-center select-none ${
                    phase === "success"
                      ? "border-emerald-400 bg-emerald-50/50 shadow-[0_0_15px_rgba(52,211,153,0.3)]"
                      : "border-slate-300 bg-slate-50/80 shadow-inner"
                  }`}
                  animate={phase === "success" ? { scale: [1, 1.1, 1] } : {}}
                  transition={{ duration: 0.4 }}
                >
                  <AnimatePresence mode="wait">
                    {correctFilled ? (
                      <motion.div
                        key="filled"
                        className="w-full h-full p-2.5 flex items-center justify-center"
                        initial={{ scale: 0.3, rotate: -20, opacity: 0 }}
                        animate={{ scale: 1, rotate: 0, opacity: 1 }}
                        transition={{ type: "spring", stiffness: 350, damping: 15 }}
                      >
                        {(() => {
                          const IconComponent = objectDictionary[activeLevel.correctKey]?.icon;
                          return IconComponent ? (
                            <>
                              <div className="sm:hidden">
                                <IconComponent size={56} />
                              </div>
                              <div className="hidden sm:block">
                                <IconComponent size={80} />
                              </div>
                            </>
                          ) : null;
                        })()}
                      </motion.div>
                    ) : (
                      <motion.span
                        key="question"
                        className="text-4xl sm:text-5xl font-black text-slate-400 font-sans"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        ?
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.div>
              </div>
            </div>

            {/* Choices */}
            <div className="w-full max-w-lg mt-6">
              <div className="text-sm font-black uppercase tracking-wider text-slate-400/80 text-center mb-4">
                Tap the matching animal
              </div>
              <div className="flex justify-center gap-5">
                {activeLevel.choices.map((key) => {
                  const item = objectDictionary[key];
                  const IconComponent = item?.icon;
                  const isWrong = wrongChoiceKey === key;

                  return (
                    <motion.div
                      key={key}
                      onClick={() => handleChoiceSelect(key)}
                      className="cursor-pointer"
                      animate={isWrong ? { x: [-8, 8, -6, 6, -3, 3, 0] } : {}}
                      transition={{ duration: 0.4 }}
                    >
                      <ClayCard
                        className={`w-24 h-24 sm:w-32 sm:h-32 rounded-[2rem] flex items-center justify-center p-3 select-none transition-all border-[4px] ${
                          isWrong
                            ? "bg-red-50 border-red-300 shadow-[inset_-3px_-3px_6px_rgba(0,0,0,0.05),_inset_3px_3px_6px_rgba(239,68,68,0.15)]"
                            : "bg-white border-white/50 shadow-clay-card hover:translate-y-[-4px]"
                        }`}
                      >
                        {IconComponent && (
                          <>
                            <div className="sm:hidden">
                              <IconComponent size={68} />
                            </div>
                            <div className="hidden sm:block">
                              <IconComponent size={96} />
                            </div>
                          </>
                        )}
                      </ClayCard>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Transition Praise Overlay */}
      <MascotTransition
        active={showMascotTransition}
        onComplete={handleMascotTransitionComplete}
      />
    </div>
  );
}
