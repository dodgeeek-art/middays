"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { Speaker224Regular } from "@fluentui/react-icons";
import { playSynthesizedSound } from "@/lib/audio";
import { speakWithPreferredVoice } from "@/lib/speech";
import { vocabularyList } from "@/lib/svgDictionary";
import { Smile } from "@/components/Icons";
import ClayButton from "@/components/ui/ClayButton";

interface PatternPicnicProps {
  childId: string;
  onBack: () => void;
}

interface PicnicPattern {
  id: string;
  patternType: "AB" | "AABB" | "ABC" | "MIDDLE";
  sequence: string[]; // Vocabulary item names
  missingIndex: number;
  choices: string[]; // Names of vocabulary items
  correctItem: string;
}

const PICNIC_PATTERNS: PicnicPattern[] = [
  {
    id: "p1",
    patternType: "AB",
    sequence: ["Apple", "Banana", "Apple", "Banana", "Apple", "Banana"],
    missingIndex: 5,
    choices: ["Banana", "Cherry", "Grapes"],
    correctItem: "Banana"
  },
  {
    id: "p2",
    patternType: "AB",
    sequence: ["Cookie", "Donut", "Cookie", "Donut", "Cookie", "Donut"],
    missingIndex: 5,
    choices: ["Donut", "Cookie", "Pizza"],
    correctItem: "Donut"
  },
  {
    id: "p3",
    patternType: "AB",
    sequence: ["Watermelon", "Lemon", "Watermelon", "Lemon", "Watermelon", "Lemon"],
    missingIndex: 5,
    choices: ["Lemon", "Apple", "Strawberry"],
    correctItem: "Lemon"
  },
  {
    id: "p4",
    patternType: "AABB",
    sequence: ["Cookie", "Cookie", "Donut", "Donut", "Cookie", "Cookie"],
    missingIndex: 5,
    choices: ["Cookie", "Donut", "Cheese"],
    correctItem: "Cookie"
  },
  {
    id: "p5",
    patternType: "AABB",
    sequence: ["Strawberry", "Strawberry", "Cherry", "Cherry", "Strawberry", "Strawberry"],
    missingIndex: 5,
    choices: ["Strawberry", "Cherry", "Banana"],
    correctItem: "Strawberry"
  },
  {
    id: "p6",
    patternType: "ABC",
    sequence: ["Grapes", "Watermelon", "Cherry", "Grapes", "Watermelon", "Cherry"],
    missingIndex: 5,
    choices: ["Cherry", "Grapes", "Watermelon"],
    correctItem: "Cherry"
  },
  {
    id: "p7",
    patternType: "ABC",
    sequence: ["Cake", "Cookie", "Donut", "Cake", "Cookie", "Donut"],
    missingIndex: 5,
    choices: ["Donut", "Cake", "Cheese"],
    correctItem: "Donut"
  },
  {
    id: "p8",
    patternType: "MIDDLE",
    sequence: ["Apple", "Banana", "Apple", "Banana", "Apple", "Banana"],
    missingIndex: 2,
    choices: ["Apple", "Banana", "Cherry"],
    correctItem: "Apple"
  },
  {
    id: "p9",
    patternType: "MIDDLE",
    sequence: ["Lemon", "Tomato", "Lemon", "Tomato", "Lemon", "Tomato"],
    missingIndex: 3,
    choices: ["Tomato", "Lemon", "Pear"],
    correctItem: "Tomato"
  },
  {
    id: "p10",
    patternType: "MIDDLE",
    sequence: ["Star", "Cloud", "Star", "Cloud", "Star", "Cloud"],
    missingIndex: 2,
    choices: ["Star", "Cloud", "Moon"],
    correctItem: "Star"
  }
];

const DECORATION_EMOJIS = ["🌸", "🦋", "🌼", "🥤", "🧺", "🌷", "🐞", "🌻", "🥤", "🦋"];

const shuffleDeterministically = <T,>(array: T[], seed: string): T[] => {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  const result = [...array];
  return result.sort((a, b) => {
    const valA = String(a).charCodeAt(0) * Math.abs(hash);
    const valB = String(b).charCodeAt(0) * Math.abs(hash);
    return (valA % 13) - (valB % 13);
  });
};

const getIcon = (name: string): React.ComponentType<{ className?: string }> => {
  const found = vocabularyList.find(v => v.name.toLowerCase() === name.toLowerCase());
  return (found ? found.icon : Smile) as React.ComponentType<{ className?: string }>;
};

export default function PatternPicnicEngine({ childId: _childId, onBack }: PatternPicnicProps) {
  const [round, setRound] = useState(1);
  const [_score, setScore] = useState(0);
  const [feedbackState, setFeedbackState] = useState<"idle" | "correct" | "wrong">("idle");
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [decorations, setDecorations] = useState<string[]>([]);
  const [isGameOver, setIsGameOver] = useState(false);
  const [currentPatterns, setCurrentPatterns] = useState<PicnicPattern[]>(() =>
    [...PICNIC_PATTERNS].sort(() => Math.random() - 0.5).slice(0, 10)
  );
  const [wrongChoices, setWrongChoices] = useState<string[]>([]);

  const activePattern = currentPatterns[round - 1];

  const shuffledChoices = useMemo(() => {
    if (!activePattern) return [];
    return shuffleDeterministically(activePattern.choices, activePattern.id);
  }, [activePattern]);

  useEffect(() => {
    if (!activePattern) return;
    const instruction = "Look at the repeating pattern and help me choose what is missing!";
    speakWithPreferredVoice(instruction, null);
  }, [round, activePattern]);

  const speakPrompt = useCallback(() => {
    speakWithPreferredVoice("Look at the repeating pattern on the picnic blanket. Which yummy food goes in the empty spot?", null);
  }, []);

  const handleChoiceSelect = (choiceName: string) => {
    if (feedbackState === "correct" || wrongChoices.includes(choiceName)) return;

    setSelectedChoice(choiceName);
    const isCorrect = choiceName === activePattern.correctItem;

    if (isCorrect) {
      setFeedbackState("correct");
      playSynthesizedSound("correct");
      setScore(prev => prev + 10);

      // Add a decorative element to the picnic scene
      const newDec = DECORATION_EMOJIS[(round - 1) % DECORATION_EMOJIS.length];
      setDecorations(prev => [...prev, newDec]);

      // Confetti celebration
      confetti({
        particleCount: 50,
        spread: 45,
        origin: { y: 0.75 },
        colors: ["#a2ea63", "#ffc4c0", "#ddcbf5", "#bae6fd"]
      });

      setTimeout(() => {
        if (round < 10) {
          setRound(prev => prev + 1);
          setFeedbackState("idle");
          setSelectedChoice(null);
          setWrongChoices([]);
        } else {
          setIsGameOver(true);
          playSynthesizedSound("levelUp");
        }
      }, 1600);

    } else {
      setFeedbackState("wrong");
      playSynthesizedSound("wrong");
      setWrongChoices(prev => [...prev, choiceName]);

      const explanation = `That's a ${choiceName}. Look at the pattern again. Can you see what repeats?`;
      speakWithPreferredVoice(explanation, null);

      setTimeout(() => {
        setFeedbackState("idle");
        setSelectedChoice(null);
      }, 1500);
    }
  };

  const handlePlayAgain = () => {
    const shuffled = [...PICNIC_PATTERNS].sort(() => Math.random() - 0.5).slice(0, 10);
    setCurrentPatterns(shuffled);
    setRound(1);
    setScore(0);
    setDecorations([]);
    setIsGameOver(false);
    setFeedbackState("idle");
    setSelectedChoice(null);
    setWrongChoices([]);
  };

  if (!activePattern) {
    return (
      <div className="flex h-full w-full items-center justify-center p-6 text-center">
        <p className="text-lg font-black text-slate-700">Setting up the picnic...</p>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full flex-col bg-gradient-to-b from-green-50/50 to-amber-50/40 p-4 relative overflow-hidden select-none">
      
      {/* Header instructions */}
      <div className="flex items-center justify-between gap-4 mb-2 shrink-0">
        <div className="flex items-center gap-3">
          <div className="text-3xl">🧺</div>
          <div className="bg-white/90 rounded-2xl px-4 py-2 border border-slate-200/50 shadow-sm">
            <span className="text-[10px] font-black uppercase text-green-600 tracking-wider">Picnic Patterns:</span>
            <p className="text-sm font-bold text-slate-800">
              Look closely! What goes in the empty spot?
            </p>
          </div>
        </div>

        <ClayButton
          variant="secondary"
          size="sm"
          onClick={speakPrompt}
          className="flex items-center gap-1.5"
        >
          <Speaker224Regular className="w-4 h-4" />
          <span className="text-xs font-black uppercase tracking-wider">Listen</span>
        </ClayButton>
      </div>

      {/* Main Picnic Area */}
      <div className="flex-grow flex flex-col justify-center items-center gap-6 min-h-0 py-2 relative">
        
        {/* Decorative Meadow Flowers & Butterflies around Picnic Blanket */}
        <div className="absolute top-2 left-2 flex gap-1.5 text-2xl select-none opacity-80">
          {decorations.filter((_, i) => i % 2 === 0).map((dec, i) => (
            <motion.span key={i} initial={{ scale: 0 }} animate={{ scale: 1 }} className="inline-block">{dec}</motion.span>
          ))}
        </div>
        <div className="absolute top-2 right-2 flex gap-1.5 text-2xl select-none opacity-80">
          {decorations.filter((_, i) => i % 2 !== 0).map((dec, i) => (
            <motion.span key={i} initial={{ scale: 0 }} animate={{ scale: 1 }} className="inline-block">{dec}</motion.span>
          ))}
        </div>

        {/* Checkered Picnic Blanket */}
        <div className="w-full max-w-2xl bg-red-100 rounded-[2.5rem] border-8 border-[#f87171] shadow-2xl p-4 sm:p-6 grid grid-cols-6 gap-2 sm:gap-3 items-center justify-items-center relative overflow-hidden bg-[radial-gradient(#fee2e2_20%,transparent_20%),radial-gradient(#fee2e2_20%,transparent_20%)] bg-[length:24px_24px] bg-[position:0_0,12px_12px]">
          
          {activePattern.sequence.map((item, idx) => {
            const isMissing = idx === activePattern.missingIndex;
            const ItemIcon = getIcon(item);

            if (isMissing) {
              return (
                <div
                  key={idx}
                  className={`w-full aspect-square max-w-[80px] rounded-2xl border-4 border-dashed bg-white/80 flex items-center justify-center relative shadow-inner ${
                    feedbackState === "correct"
                      ? "border-emerald-400 bg-emerald-50"
                      : "border-slate-400 animate-pulse"
                  }`}
                >
                  {feedbackState === "correct" ? (
                    <motion.div
                      initial={{ scale: 0, rotate: -45 }}
                      animate={{ scale: 1, rotate: 0 }}
                      className="w-full h-full p-1.5 flex items-center justify-center"
                    >
                      <ItemIcon className="w-full h-full text-slate-800" />
                    </motion.div>
                  ) : (
                    <span className="text-2xl font-black text-slate-500">?</span>
                  )}
                </div>
              );
            }

            return (
              <div
                key={idx}
                className="w-full aspect-square max-w-[80px] rounded-2xl bg-white border border-slate-200 p-1.5 flex items-center justify-center shadow-sm"
              >
                <ItemIcon className="w-full h-full text-slate-800" />
              </div>
            );
          })}
        </div>

        {/* Choices Tray */}
        <div className="w-full max-w-md flex justify-center gap-4">
          <AnimatePresence mode="wait">
            {shuffledChoices.map((choice) => {
              const isSelected = selectedChoice === choice;
              const isWrong = wrongChoices.includes(choice);
              const ChoiceIcon = getIcon(choice);

              let bgOverride = "bg-white";
              let borderOverride = "border-slate-200";

              if (isWrong) {
                bgOverride = "bg-slate-100 opacity-40";
                borderOverride = "border-slate-300 border-dashed";
              } else if (isSelected) {
                if (feedbackState === "correct") {
                  bgOverride = "bg-emerald-100";
                  borderOverride = "border-emerald-500 shadow-[0_6px_0_#059669]";
                } else if (feedbackState === "wrong") {
                  bgOverride = "bg-rose-100";
                  borderOverride = "border-rose-400 shadow-[0_6px_0_#dc2626]";
                }
              }

              return (
                <motion.div
                  key={choice}
                  whileHover={!isWrong && feedbackState !== "correct" ? { scale: 1.05 } : {}}
                  whileTap={!isWrong && feedbackState !== "correct" ? { scale: 0.95 } : {}}
                  onClick={() => handleChoiceSelect(choice)}
                  className={`w-24 h-24 sm:w-28 sm:h-28 rounded-3xl border-2 p-3 flex flex-col items-center justify-between cursor-pointer transition-all shadow-[0_6px_0_rgba(34,49,63,0.1)] ${bgOverride} ${borderOverride}`}
                >
                  <div className="flex-grow flex items-center justify-center w-full min-h-0">
                    <ChoiceIcon className="w-12 h-12 text-slate-800" />
                  </div>
                  <span className="text-[10px] font-black uppercase text-slate-700 tracking-tight">{choice}</span>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

      </div>

      {/* Progress Footer */}
      <div className="shrink-0 mt-2 bg-white/70 border border-slate-200/50 rounded-2xl p-3 flex items-center justify-between">
        <span className="text-xs font-black uppercase text-slate-500 tracking-wider">Picnic Completion</span>
        <span className="text-xs font-bold text-slate-600">Round {round} of 10</span>
      </div>

      {/* Game Over Modal */}
      <AnimatePresence>
        {isGameOver && (
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              className="bg-white rounded-[2.5rem] border border-slate-200 p-8 max-w-md w-full text-center shadow-2xl relative"
            >
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-[1.45rem] border-2 border-white bg-green-400 text-4xl shadow-md">
                🧺
              </div>

              <h2 className="font-display text-3xl font-extrabold text-slate-800 leading-none">Picnic Completed!</h2>
              <p className="mt-3 text-slate-600 font-bold max-w-xs mx-auto">
                Wow! You completed all the patterns and made the picnic meadow look beautiful!
              </p>

              <div className="my-6 bg-slate-50 rounded-2xl p-4 border border-slate-200/60 flex flex-wrap gap-2 items-center justify-center text-3xl min-h-[48px]">
                {decorations.map((dec, i) => (
                  <span key={i} className="animate-bounce inline-block" style={{ animationDelay: `${i * 100}ms` }}>
                    {dec}
                  </span>
                ))}
              </div>

              <div className="flex gap-4 items-center justify-center">
                <ClayButton variant="primary" onClick={handlePlayAgain} className="w-full py-3.5">
                  Play Again
                </ClayButton>
                <ClayButton variant="secondary" onClick={onBack} className="w-full py-3.5">
                  Back to Menu
                </ClayButton>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
