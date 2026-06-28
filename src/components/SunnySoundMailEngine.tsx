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

interface SunnySoundMailProps {
  childId: string;
  onBack: () => void;
}

interface MailQuestion {
  id: string;
  targetLetter: string;
  correctItem: string;
  choices: string[]; // Names of vocabulary items
}

const MAIL_QUESTIONS: MailQuestion[] = [
  { id: "m1", targetLetter: "A", correctItem: "Alligator", choices: ["Alligator", "Bear", "Cat"] },
  { id: "m2", targetLetter: "B", correctItem: "Banana", choices: ["Banana", "Fox", "Dog"] },
  { id: "m3", targetLetter: "C", correctItem: "Cherry", choices: ["Cherry", "Grapes", "Fox"] },
  { id: "m4", targetLetter: "D", correctItem: "Dog", choices: ["Dog", "Monkey", "Pig"] },
  { id: "m5", targetLetter: "E", correctItem: "Egg", choices: ["Egg", "Koala", "Lion"] },
  { id: "m6", targetLetter: "F", correctItem: "Fox", choices: ["Fox", "Giraffe", "Hippo"] },
  { id: "m7", targetLetter: "G", correctItem: "Grapes", choices: ["Grapes", "Alligator", "Cat"] },
  { id: "m8", targetLetter: "H", correctItem: "House", choices: ["House", "Sun", "Moon"] },
  { id: "m9", targetLetter: "P", correctItem: "Pizza", choices: ["Pizza", "Cake", "Cookie"] },
  { id: "m10", targetLetter: "S", correctItem: "Star", choices: ["Star", "Carrot", "Flower"] },
  { id: "m11", targetLetter: "T", correctItem: "Truck", choices: ["Truck", "Bus", "Car"] },
  { id: "m12", targetLetter: "W", correctItem: "Watermelon", choices: ["Watermelon", "Apple", "Banana"] }
];

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

export default function SunnySoundMailEngine({ childId: _childId, onBack }: SunnySoundMailProps) {
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [feedbackState, setFeedbackState] = useState<"idle" | "correct" | "wrong">("idle");
  const [wrongAttempts, setWrongAttempts] = useState<string[]>([]);
  const [collectedStamps, setCollectedStamps] = useState<string[]>([]);
  const [isGameOver, setIsGameOver] = useState(false);
  const [currentQuestions, setCurrentQuestions] = useState<MailQuestion[]>(() =>
    [...MAIL_QUESTIONS].sort(() => Math.random() - 0.5).slice(0, 10)
  );
  
  const activeQuestion = currentQuestions[round - 1];

  // Derive active choices and shuffle
  const shuffledChoices = useMemo(() => {
    if (!activeQuestion) return [];
    let itemsToUse = [...activeQuestion.choices];
    if (round <= 3) {
      itemsToUse = [activeQuestion.correctItem, activeQuestion.choices.find(c => c !== activeQuestion.correctItem) || ""];
    }
    return shuffleDeterministically(itemsToUse.filter(Boolean), activeQuestion.id);
  }, [activeQuestion, round]);

  // Play sound prompt when round changes
  useEffect(() => {
    if (!activeQuestion) return;
    const letterSpoken = activeQuestion.targetLetter;
    const promptText = `Find the card that starts with the sound of the letter ${letterSpoken}!`;
    speakWithPreferredVoice(promptText, null);
  }, [round, activeQuestion]);

  const speakPrompt = useCallback(() => {
    if (!activeQuestion) return;
    speakWithPreferredVoice(`Find the card that starts with the sound of the letter ${activeQuestion.targetLetter}!`, null);
  }, [activeQuestion]);

  const handleCardClick = (name: string) => {
    if (feedbackState === "correct" || wrongAttempts.includes(name)) return;

    setSelectedId(name);
    const isCorrect = name === activeQuestion.correctItem;

    if (isCorrect) {
      setFeedbackState("correct");
      playSynthesizedSound("correct");
      setScore(prev => prev + 10);
      setStreak(prev => {
        const next = prev + 1;
        if (next > maxStreak) setMaxStreak(next);
        return next;
      });

      // Add to collected stamps list
      setCollectedStamps(prev => [...prev, activeQuestion.targetLetter]);

      // Trigger Confetti
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.7 },
        colors: ["#ffd06f", "#8d6bff", "#ffb895", "#9df4df"]
      });

      setTimeout(() => {
        if (round < 10) {
          setRound(prev => prev + 1);
          setFeedbackState("idle");
          setSelectedId(null);
          setWrongAttempts([]);
        } else {
          setIsGameOver(true);
          playSynthesizedSound("levelUp");
        }
      }, 1600);

    } else {
      setFeedbackState("wrong");
      playSynthesizedSound("wrong");
      setStreak(0);
      setWrongAttempts(prev => [...prev, name]);
      
      const wrongPrompt = `That is ${name}, which starts with ${name[0]}. Can you find the object starting with ${activeQuestion.targetLetter}?`;
      speakWithPreferredVoice(wrongPrompt, null);
      
      setTimeout(() => {
        setFeedbackState("idle");
        setSelectedId(null);
      }, 1500);
    }
  };

  const handlePlayAgain = () => {
    const shuffled = [...MAIL_QUESTIONS].sort(() => Math.random() - 0.5).slice(0, 10);
    setCurrentQuestions(shuffled);
    setRound(1);
    setScore(0);
    setStreak(0);
    setMaxStreak(0);
    setCollectedStamps([]);
    setIsGameOver(false);
    setFeedbackState("idle");
    setSelectedId(null);
    setWrongAttempts([]);
  };

  if (!activeQuestion) {
    return (
      <div className="flex h-full w-full items-center justify-center p-6 text-center">
        <p className="text-lg font-black text-slate-700">Loading mailbox delivery...</p>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full flex-col bg-gradient-to-b from-[#e0f2fe]/60 to-[#fffbeb]/40 p-4 relative overflow-hidden select-none">
      
      {/* Sun Header and Instruction */}
      <div className="flex items-center justify-between gap-4 mb-2 shrink-0">
        <div className="flex items-center gap-3">
          {/* Animated Sun character */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 bg-amber-400 rounded-full flex items-center justify-center text-2xl shadow-[0_0_15px_rgba(251,191,36,0.6)] cursor-pointer"
            onClick={speakPrompt}
          >
            ☀️
          </motion.div>
          <div className="bg-white/90 rounded-2xl px-4 py-2 border border-slate-200/50 shadow-sm">
            <span className="text-[10px] font-black uppercase text-amber-600 tracking-wider">Sunny Sun Says:</span>
            <p className="text-sm font-bold text-slate-800">
              Deliver the postcard for <span className="text-xl font-black text-blue-600 underline decoration-wavy decoration-amber-400">{activeQuestion.targetLetter}</span>! {streak > 0 && <span className="ml-2 text-xs font-black text-orange-500">🔥 {streak}</span>}
            </p>
          </div>
        </div>

        {/* Volume controls */}
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

      {/* Main Mail Delivery Area */}
      <div className="flex-grow flex flex-col md:flex-row items-center justify-center gap-6 min-h-0 py-2">
        
        {/* Postcards Tray */}
        <div className="w-full md:w-3/5 grid grid-cols-2 md:grid-cols-3 gap-4 justify-items-center">
          <AnimatePresence mode="wait">
            {shuffledChoices.map((choice) => {
              const isSelected = selectedId === choice;
              const isWrong = wrongAttempts.includes(choice);
              const ChoiceIcon = getIcon(choice);

              let bgOverride = "bg-white";
              let borderOverride = "border-slate-200";

              if (isWrong) {
                bgOverride = "bg-slate-100 opacity-40";
                borderOverride = "border-slate-300 border-dashed";
              } else if (isSelected) {
                if (feedbackState === "correct") {
                  bgOverride = "bg-emerald-100";
                  borderOverride = "border-emerald-500 shadow-[0_8px_0_#059669]";
                } else if (feedbackState === "wrong") {
                  bgOverride = "bg-rose-100";
                  borderOverride = "border-rose-400 shadow-[0_8px_0_#dc2626]";
                }
              }

              return (
                <motion.div
                  key={choice}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  whileHover={!isWrong && feedbackState !== "correct" ? { scale: 1.03 } : {}}
                  whileTap={!isWrong && feedbackState !== "correct" ? { scale: 0.98 } : {}}
                  onClick={() => handleCardClick(choice)}
                  className={`w-full max-w-[150px] aspect-[4/3] rounded-3xl border-2 p-3 flex flex-col items-center justify-between cursor-pointer transition-all shadow-[0_6px_0_rgba(34,49,63,0.1)] ${bgOverride} ${borderOverride}`}
                >
                  <div className="flex-grow flex items-center justify-center w-full min-h-0">
                    <ChoiceIcon className="w-12 h-12 text-slate-700" />
                  </div>
                  <span className="text-xs font-black uppercase text-slate-800 tracking-tight">{choice}</span>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Mailbox Target */}
        <div className="w-full md:w-2/5 flex flex-col items-center">
          <div className="relative w-44 h-48 bg-gradient-to-b from-blue-500 to-blue-700 rounded-t-[3rem] rounded-b-2xl border-4 border-slate-800 shadow-[0_12px_24px_rgba(0,0,0,0.15)] flex flex-col items-center justify-end p-4">
            
            {/* Slot indicator */}
            <div className="absolute top-8 w-28 h-5 bg-slate-900 rounded-full border-t border-slate-500 flex items-center justify-center">
              <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Mail Slot</span>
            </div>

            {/* Target Letter Label */}
            <div className="mb-4 bg-white/10 backdrop-blur-md rounded-full px-6 py-2 border border-white/20">
              <span className="text-4xl font-black text-white tracking-wider">{activeQuestion.targetLetter}</span>
            </div>

            <span className="text-xs font-black text-white uppercase tracking-widest opacity-80">Mailbox</span>

            {/* Animation overlay for postcard delivery */}
            <AnimatePresence>
              {feedbackState === "correct" && selectedId && (
                <motion.div
                  initial={{ opacity: 1, scale: 0.8, y: 150 }}
                  animate={{ opacity: 0.6, scale: 0.2, y: -40, rotate: 15 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.8, ease: "easeInOut" }}
                  className="absolute inset-0 m-auto w-24 h-16 bg-white border border-slate-400 rounded-lg shadow-md flex items-center justify-center text-slate-700"
                >
                  ✉️
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

      </div>

      {/* Stamps Mailbook Overlay / Display Panel at Bottom */}
      <div className="shrink-0 mt-2 bg-white/70 backdrop-blur-md border border-slate-200/50 rounded-2xl p-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-black uppercase text-slate-500 tracking-wider">Sunny Mailbook Stamps (Score: {score})</span>
          <span className="text-xs font-bold text-slate-600">Round {round} of 10</span>
        </div>
        <div className="flex gap-2 flex-wrap items-center justify-start min-h-[36px]">
          {Array.from({ length: 10 }).map((_, idx) => {
            const stampLetter = collectedStamps[idx];
            return (
              <div
                key={idx}
                className={`w-8 h-8 rounded-lg flex items-center justify-center border-2 text-sm font-black transition-all ${
                  stampLetter
                    ? "bg-amber-100 border-amber-400 text-amber-700 shadow-sm rotate-3 scale-105"
                    : "bg-slate-100/50 border-slate-200 text-slate-300 border-dashed"
                }`}
              >
                {stampLetter || "?"}
              </div>
            );
          })}
        </div>
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
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-[1.45rem] border-2 border-white bg-amber-400 text-4xl text-amber-900 shadow-md">
                ☀️
              </div>

              <h2 className="font-display text-3xl font-extrabold text-slate-800 leading-none">Mail Delivered!</h2>
              <p className="mt-3 text-slate-600 font-bold max-w-xs mx-auto">
                Amazing! You helped the sun deliver all 10 letters and collected 10 shiny stamps!
              </p>

              <div className="my-6 bg-slate-50 rounded-2xl p-4 border border-slate-200/60 grid grid-cols-5 gap-2">
                {collectedStamps.map((stamp, i) => (
                  <div key={i} className="aspect-square bg-amber-100 border border-amber-300 text-amber-700 text-xs font-black rounded-lg flex items-center justify-center rotate-3">
                    {stamp}
                  </div>
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
