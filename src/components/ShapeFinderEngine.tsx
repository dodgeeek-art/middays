"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import {
  Speaker224Regular,
  CheckmarkCircle24Filled,
  DismissCircle24Filled
} from "@fluentui/react-icons";

import { playSynthesizedSound } from "@/lib/audio";
import { selectPreferredVoice, speakWithPreferredVoice } from "@/lib/speech";
import { vocabularyList } from "@/lib/svgDictionary";
import { Smile } from "@/components/Icons";
import ClayButton from "@/components/ui/ClayButton";
import ClayCard from "@/components/ui/ClayCard";
import MascotSVG from "./MascotSVG";

export type ShapeType =
  | "circle"
  | "triangle"
  | "rectangle"
  | "square"
  | "oval"
  | "star"
  | "heart";

export type ShapeChoice = {
  id: string;
  label: string;
  shape: ShapeType;
  Icon: React.ComponentType<{ className?: string }>;
};

export type ShapeQuestion = {
  id: string;
  targetShape: ShapeType;
  instruction: string;
  correctChoiceId: string;
  choices: ShapeChoice[];
};

interface ShapeFinderEngineProps {
  childId: string;
  onBack: () => void;
}

const getIcon = (name: string): React.ComponentType<{ className?: string }> => {
  const found = vocabularyList.find(v => v.name.toLowerCase() === name.toLowerCase());
  return (found ? found.icon : Smile) as React.ComponentType<{ className?: string }>;
};

const SHAPE_QUESTIONS: ShapeQuestion[] = [
  {
    id: "q1",
    targetShape: "circle",
    instruction: "Find the circle",
    correctChoiceId: "choice_ball",
    choices: [
      { id: "choice_ball", label: "Basketball", shape: "circle", Icon: getIcon("Ball") },
      { id: "choice_truck", label: "Truck", shape: "rectangle", Icon: getIcon("Truck") },
      { id: "choice_gift", label: "Gift Box", shape: "square", Icon: getIcon("Gift") },
      { id: "choice_volcano", label: "Volcano", shape: "triangle", Icon: getIcon("Volcano") }
    ]
  },
  {
    id: "q2",
    targetShape: "triangle",
    instruction: "Find the triangle",
    correctChoiceId: "choice_pizza",
    choices: [
      { id: "choice_pizza", label: "Pizza Slice", shape: "triangle", Icon: getIcon("Pizza") },
      { id: "choice_cookie", label: "Cookie", shape: "circle", Icon: getIcon("Cookie") },
      { id: "choice_bus", label: "Bus", shape: "rectangle", Icon: getIcon("Bus") },
      { id: "choice_gift", label: "Gift Box", shape: "square", Icon: getIcon("Gift") }
    ]
  },
  {
    id: "q3",
    targetShape: "rectangle",
    instruction: "Find the rectangle",
    correctChoiceId: "choice_truck",
    choices: [
      { id: "choice_truck", label: "Truck", shape: "rectangle", Icon: getIcon("Truck") },
      { id: "choice_ball", label: "Basketball", shape: "circle", Icon: getIcon("Ball") },
      { id: "choice_star", label: "Star", shape: "star", Icon: getIcon("Star") },
      { id: "choice_egg", label: "Egg", shape: "oval", Icon: getIcon("Egg") }
    ]
  },
  {
    id: "q4",
    targetShape: "square",
    instruction: "Find the square",
    correctChoiceId: "choice_gift",
    choices: [
      { id: "choice_gift", label: "Gift Box", shape: "square", Icon: getIcon("Gift") },
      { id: "choice_pizza", label: "Pizza Slice", shape: "triangle", Icon: getIcon("Pizza") },
      { id: "choice_donut", label: "Donut", shape: "circle", Icon: getIcon("Donut") },
      { id: "choice_leaf", label: "Leaf", shape: "oval", Icon: getIcon("Leaf") }
    ]
  },
  {
    id: "q5",
    targetShape: "oval",
    instruction: "Find the oval",
    correctChoiceId: "choice_egg",
    choices: [
      { id: "choice_egg", label: "Egg", shape: "oval", Icon: getIcon("Egg") },
      { id: "choice_bus", label: "Bus", shape: "rectangle", Icon: getIcon("Bus") },
      { id: "choice_star", label: "Star", shape: "star", Icon: getIcon("Star") },
      { id: "choice_house", label: "House", shape: "square", Icon: getIcon("House") }
    ]
  },
  {
    id: "q6",
    targetShape: "star",
    instruction: "Find the star",
    correctChoiceId: "choice_star",
    choices: [
      { id: "choice_star", label: "Star", shape: "star", Icon: getIcon("Star") },
      { id: "choice_heart", label: "Heart", shape: "heart", Icon: getIcon("Heart") },
      { id: "choice_ball", label: "Basketball", shape: "circle", Icon: getIcon("Ball") },
      { id: "choice_bus", label: "Bus", shape: "rectangle", Icon: getIcon("Bus") }
    ]
  },
  {
    id: "q7",
    targetShape: "heart",
    instruction: "Find the heart",
    correctChoiceId: "choice_heart",
    choices: [
      { id: "choice_heart", label: "Heart", shape: "heart", Icon: getIcon("Heart") },
      { id: "choice_volcano", label: "Volcano", shape: "triangle", Icon: getIcon("Volcano") },
      { id: "choice_lemon", label: "Lemon", shape: "circle", Icon: getIcon("Lemon") },
      { id: "choice_gift", label: "Gift Box", shape: "square", Icon: getIcon("Gift") }
    ]
  },
  {
    id: "q8",
    targetShape: "rectangle",
    instruction: "Find the rectangle",
    correctChoiceId: "choice_bus",
    choices: [
      { id: "choice_bus", label: "Bus", shape: "rectangle", Icon: getIcon("Bus") },
      { id: "choice_ball", label: "Basketball", shape: "circle", Icon: getIcon("Ball") },
      { id: "choice_gift", label: "Gift Box", shape: "square", Icon: getIcon("Gift") },
      { id: "choice_balloon", label: "Balloon", shape: "oval", Icon: getIcon("Balloon") }
    ]
  },
  {
    id: "q9",
    targetShape: "square",
    instruction: "Find the square",
    correctChoiceId: "choice_house",
    choices: [
      { id: "choice_house", label: "House", shape: "square", Icon: getIcon("House") },
      { id: "choice_volcano", label: "Volcano", shape: "triangle", Icon: getIcon("Volcano") },
      { id: "choice_truck", label: "Truck", shape: "rectangle", Icon: getIcon("Truck") },
      { id: "choice_balloon", label: "Balloon", shape: "oval", Icon: getIcon("Balloon") }
    ]
  },
  {
    id: "q10",
    targetShape: "oval",
    instruction: "Find the oval",
    correctChoiceId: "choice_balloon",
    choices: [
      { id: "choice_balloon", label: "Balloon", shape: "oval", Icon: getIcon("Balloon") },
      { id: "choice_ball", label: "Basketball", shape: "circle", Icon: getIcon("Ball") },
      { id: "choice_gift", label: "Gift Box", shape: "square", Icon: getIcon("Gift") },
      { id: "choice_volcano", label: "Volcano", shape: "triangle", Icon: getIcon("Volcano") }
    ]
  },
  {
    id: "q11",
    targetShape: "star",
    instruction: "Find the star",
    correctChoiceId: "choice_star",
    choices: [
      { id: "choice_star", label: "Star", shape: "star", Icon: getIcon("Star") },
      { id: "choice_ball", label: "Basketball", shape: "circle", Icon: getIcon("Ball") },
      { id: "choice_bus", label: "Bus", shape: "rectangle", Icon: getIcon("Bus") },
      { id: "choice_heart", label: "Heart", shape: "heart", Icon: getIcon("Heart") }
    ]
  },
  {
    id: "q12",
    targetShape: "circle",
    instruction: "Find the circle",
    correctChoiceId: "choice_cookie",
    choices: [
      { id: "choice_cookie", label: "Cookie", shape: "circle", Icon: getIcon("Cookie") },
      { id: "choice_pizza", label: "Pizza Slice", shape: "triangle", Icon: getIcon("Pizza") },
      { id: "choice_bus", label: "Bus", shape: "rectangle", Icon: getIcon("Bus") },
      { id: "choice_star", label: "Star", shape: "star", Icon: getIcon("Star") }
    ]
  }
];

const CARD_COLORS: ("primary" | "secondary" | "tertiary" | "purple" | "blue" | "lime" | "peach")[] = [
  "peach",
  "lime",
  "blue",
  "purple"
];

export default function ShapeFinderEngine({ childId, onBack }: ShapeFinderEngineProps) {
  // Game progression states
  const [currentRound, setCurrentRound] = useState(1);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [selectedAnswerId, setSelectedAnswerId] = useState<string | null>(null);
  
  // Feedback states: "idle" | "correct" | "wrong"
  const [feedbackState, setFeedbackState] = useState<"idle" | "correct" | "wrong">("idle");
  const [ariaFeedback, setAriaFeedback] = useState("");
  const [isGameOver, setIsGameOver] = useState(false);
  const [roundStartTime, setRoundStartTime] = useState<number>(() => Date.now());

  // Questions and Choices tracking
  const [questionPool, setQuestionPool] = useState<ShapeQuestion[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<ShapeQuestion | null>(null);
  const [randomizedChoices, setRandomizedChoices] = useState<ShapeChoice[]>([]);
  const [wrongAttempts, setWrongAttempts] = useState<string[]>([]);

  // Speech synthesis states
  const [voicesLoaded, setVoicesLoaded] = useState(false);
  const preferredVoiceRef = useRef<SpeechSynthesisVoice | null>(null);

  // Initialize voice configurations
  useEffect(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;

    let timeoutId: NodeJS.Timeout;

    const handleVoicesChanged = () => {
      const voice = selectPreferredVoice();
      if (voice) {
        preferredVoiceRef.current = voice;
        setVoicesLoaded(true);
        if (timeoutId) clearTimeout(timeoutId);
      }
    };

    handleVoicesChanged();

    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = handleVoicesChanged;
    }

    timeoutId = setTimeout(() => {
      setVoicesLoaded(true);
    }, 1500);

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  // Initialize and shuffle question pool on mount or restart
  const initGame = useCallback(() => {
    const shuffledPool = [...SHAPE_QUESTIONS].sort(() => Math.random() - 0.5);
    setQuestionPool(shuffledPool);
    const firstQ = shuffledPool[0];
    setCurrentQuestion(firstQ);
    setRandomizedChoices([...firstQ.choices].sort(() => Math.random() - 0.5));
    setCurrentRound(1);
    setScore(0);
    setStreak(0);
    setMaxStreak(0);
    setSelectedAnswerId(null);
    setFeedbackState("idle");
    setWrongAttempts([]);
    setIsGameOver(false);
    setRoundStartTime(Date.now());
  }, []);

  useEffect(() => {
    initGame();
  }, [initGame]);

  // Voice speaker callback
  const speakText = useCallback((text: string, pitch: number = 1.15) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    speakWithPreferredVoice(text, preferredVoiceRef.current, { pitch });
  }, []);

  const speakPrompt = useCallback(() => {
    if (currentQuestion) {
      speakText(currentQuestion.instruction);
    }
  }, [currentQuestion, speakText]);

  // Play spoken prompt on round change
  useEffect(() => {
    if (currentQuestion && voicesLoaded) {
      const t = setTimeout(() => {
        speakPrompt();
      }, 550);
      return () => clearTimeout(t);
    }
  }, [currentQuestion, speakPrompt, voicesLoaded, currentRound]);

  const saveTelemetry = async (timeSpent: number, success: boolean) => {
    if (childId) {
      try {
        await fetch(`/api/progress/${childId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            targetLetter: currentQuestion?.targetShape || "shape",
            tracingScore: success ? 100 : 0,
            phonemicScore: success ? 100 : 0,
            timeSpentMs: timeSpent
          })
        });

        if (success) {
          await fetch(`/api/badges/${childId}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              badgeName: `Shape Finder ${currentQuestion?.targetShape || "shape"}`
            })
          });
        }
      } catch (e) {
        console.warn("Telemetry logging failed:", e);
      }
    }
  };

  const handleChoiceClick = async (choice: ShapeChoice) => {
    if (feedbackState === "correct" || selectedAnswerId !== null || wrongAttempts.includes(choice.id)) return;

    setSelectedAnswerId(choice.id);
    const isCorrect = choice.id === currentQuestion?.correctChoiceId;

    if (isCorrect) {
      setFeedbackState("correct");
      setScore(prev => prev + 1);
      setStreak(prev => {
        const nextStreak = prev + 1;
        if (nextStreak > maxStreak) setMaxStreak(nextStreak);
        return nextStreak;
      });
      setAriaFeedback(`Correct! That is a ${choice.label}, which is a ${choice.shape}.`);
      playSynthesizedSound("correct");
      speakText("Great job!");

      confetti({
        particleCount: 45,
        spread: 40,
        origin: { y: 0.75 },
        colors: ["#ffc4c0", "#a2ea63", "#ddcbf5", "#ffffff"]
      });

      const timeSpent = Date.now() - roundStartTime;
      await saveTelemetry(timeSpent, true);

      setTimeout(() => {
        if (currentRound < 10 && currentRound < questionPool.length) {
          // Advance to next round
          const nextIndex = currentRound;
          const nextQ = questionPool[nextIndex];
          setCurrentQuestion(nextQ);
          setRandomizedChoices([...nextQ.choices].sort(() => Math.random() - 0.5));
          setCurrentRound(prev => prev + 1);
          setSelectedAnswerId(null);
          setFeedbackState("idle");
          setWrongAttempts([]);
          setRoundStartTime(Date.now());
        } else {
          // Finish the game
          setIsGameOver(true);
        }
      }, 2000);
    } else {
      setFeedbackState("wrong");
      setStreak(0);
      setWrongAttempts(prev => [...prev, choice.id]);
      setAriaFeedback(`Try again! That is a ${choice.label}, which is a ${choice.shape}.`);
      playSynthesizedSound("wrong");
      speakText("Try again");

      const timeSpent = Date.now() - roundStartTime;
      await saveTelemetry(timeSpent, false);

      setTimeout(() => {
        setSelectedAnswerId(null);
        setFeedbackState("idle");
      }, 1200);
    }
  };

  const handlePlayAgain = () => {
    initGame();
  };

  if (!currentQuestion) return null;

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-between p-3 sm:p-6 min-h-0 select-none overflow-y-auto">
      
      {/* Hidden screen reader feedback */}
      <div className="sr-only" aria-live="assertive">
        {ariaFeedback}
      </div>

      {/* Progress header & Streak indicator */}
      <div className="w-full flex justify-between items-center mb-4 shrink-0 px-2">
        <div className="flex items-center gap-2">
          <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-[var(--brand-muted)] bg-[#22313f]/5 px-3 py-1.5 rounded-full border border-[var(--brand-line)]">
            Round {currentRound} / 10
          </span>
        </div>
        {streak > 1 && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex items-center gap-1 bg-amber-100 border border-amber-300 text-amber-800 px-3.5 py-1 rounded-full font-black text-xs sm:text-sm shadow-sm"
          >
            🔥 {streak} Streak!
          </motion.div>
        )}
      </div>

      {/* Mascot Speech Bubble instructions */}
      <div
        onClick={speakPrompt}
        className="w-full max-w-xl flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6 cursor-pointer select-none active:scale-[0.99] transition-all shrink-0"
        title="Click to replay instruction"
      >
        <div className="w-14 h-14 sm:w-20 sm:h-20 shrink-0 drop-shadow-sm">
          <MascotSVG className="w-full h-full" />
        </div>
        
        <div className="flex-1 relative bg-white border border-[#4a5358]/10 p-3 sm:p-4 rounded-[1.75rem] shadow-[4px_4px_12px_rgba(0,0,0,0.03),_inset_2px_2px_4px_rgba(255,255,255,0.9)] text-left">
          {/* Speech bubble tail */}
          <div className="absolute top-1/2 -left-3 -translate-y-1/2 w-0 h-0 border-t-[6px] border-t-transparent border-r-[10px] border-r-white border-b-[6px] border-b-transparent filter drop-shadow-[-1px_0_0_rgba(74,83,88,0.06)]" />
          
          <p className="text-[9px] font-black text-[#ffb51f] uppercase tracking-widest mb-0.5">
            Guide says:
          </p>
          <h2 className="text-base sm:text-lg font-black text-[#4A5358] tracking-tight uppercase flex items-center gap-1.5 flex-wrap">
            <span>Find the</span>
            <span className="inline-flex items-center justify-center px-4 py-1 bg-[#fff1b8] border-2 border-[#ffb51f]/40 rounded-2xl text-[#854d0e] font-black shadow-inner tracking-normal text-lg sm:text-xl">
              {currentQuestion.targetShape}
              <Speaker224Regular className="w-4 h-4 ml-1.5 shrink-0 text-[#a87400]" />
            </span>
          </h2>
        </div>
      </div>

      {/* Grid of Choices */}
      <div className="w-full flex-1 max-w-2xl mx-auto grid grid-cols-2 gap-3 sm:gap-5 py-2 items-center justify-items-center min-h-[250px]">
        {randomizedChoices.map((choice, idx) => {
          const isSelected = selectedAnswerId === choice.id;
          const isWrong = wrongAttempts.includes(choice.id);
          
          // Determine card style based on state
          let cardVariant = CARD_COLORS[idx % CARD_COLORS.length];
          let borderOverride = "";
          let bgOverride = "";

          if (isWrong) {
            bgOverride = "bg-gray-100 opacity-40 border-dashed border-gray-300";
          } else if (isSelected) {
            if (feedbackState === "correct") {
              bgOverride = "bg-emerald-100 text-emerald-950";
              borderOverride = "border-emerald-500 shadow-clay-mint";
            } else if (feedbackState === "wrong") {
              bgOverride = "bg-rose-100 text-rose-950";
              borderOverride = "border-rose-400 shadow-clay-pink";
            }
          }

          const ChoiceIcon = choice.Icon;

          return (
            <ClayCard
              key={choice.id}
              variant={cardVariant}
              hoverEffect={!isWrong && feedbackState !== "correct"}
              organicShape={idx % 2 === 0 ? "wavy-1" : "wavy-2"}
              onClick={() => handleChoiceClick(choice)}
              className={`w-full aspect-square sm:aspect-auto sm:h-44 flex flex-col items-center justify-center p-3 sm:p-5 relative transition-all duration-300 ${bgOverride} ${borderOverride}`}
              role="button"
              tabIndex={isWrong ? -1 : 0}
              aria-label={`${choice.label}, ${choice.shape} shape`}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleChoiceClick(choice);
                }
              }}
            >
              {/* Feedback badges */}
              {isSelected && feedbackState === "correct" && (
                <div className="absolute top-2.5 right-2.5 sm:top-3.5 sm:right-3.5 text-emerald-500 bg-white rounded-full p-0.5 shadow-md z-10 animate-bounce">
                  <CheckmarkCircle24Filled className="w-6 h-6" />
                </div>
              )}
              {isWrong && (
                <div className="absolute top-2.5 right-2.5 sm:top-3.5 sm:right-3.5 text-gray-400 bg-white rounded-full p-0.5 shadow-sm z-10">
                  <DismissCircle24Filled className="w-5 h-5" />
                </div>
              )}

              {/* Large Icon choice */}
              <div className="flex-1 flex items-center justify-center w-full min-h-0 py-2">
                <ChoiceIcon className="w-16 h-16 sm:w-24 sm:h-24 drop-shadow-[2px_3px_5px_rgba(0,0,0,0.1)] transition-transform duration-200" />
              </div>

              {/* Label */}
              <div className="mt-2 text-center text-xs sm:text-base font-black tracking-tight uppercase opacity-95">
                {choice.label}
              </div>
            </ClayCard>
          );
        })}
      </div>

      {/* Game Over Modal overlay */}
      <AnimatePresence>
        {isGameOver && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-[#fffdf6]/95 backdrop-blur-sm z-30 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="w-full max-w-sm rounded-[2rem] border-2 border-[#22313f]/10 bg-[#fffdf7] p-8 text-center shadow-clay-card"
            >
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-[1.55rem] border-4 border-white bg-[#ffb51f] text-4xl shadow-[0_8px_0_rgba(34,49,63,0.14),0_16px_28px_rgba(255,181,31,0.24)]">
                🏆
              </div>
              
              <h2 className="font-display text-3xl font-extrabold text-[#22313f] leading-none">
                Super Shape Finder!
              </h2>
              
              <p className="mt-4 text-sm sm:text-base font-extrabold text-[var(--brand-muted)] leading-relaxed">
                Excellent matching! You identified shapes inside real-world objects correctly!
              </p>
              
              <div className="mt-5 bg-[#22313f]/5 rounded-2xl p-4 flex justify-around border border-[var(--brand-line)]">
                <div>
                  <p className="text-[9px] font-black uppercase tracking-wider text-[var(--brand-muted)]">Rounds Played</p>
                  <p className="text-lg font-extrabold text-[#22313f]">10</p>
                </div>
                <div className="w-[1px] bg-[#22313f]/10" />
                <div>
                  <p className="text-[9px] font-black uppercase tracking-wider text-[var(--brand-muted)]">Score</p>
                  <p className="text-lg font-extrabold text-[#00a9a5]">{score} / 10</p>
                </div>
                <div className="w-[1px] bg-[#22313f]/10" />
                <div>
                  <p className="text-[9px] font-black uppercase tracking-wider text-[var(--brand-muted)]">Best Streak</p>
                  <p className="text-lg font-extrabold text-[#ff85a1]">{maxStreak}</p>
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-3">
                <ClayButton
                  variant="primary"
                  onClick={handlePlayAgain}
                  className="w-full font-black text-lg py-4 rounded-xl shadow-clay-yellow"
                >
                  Play Again 🌟
                </ClayButton>
                <ClayButton
                  variant="surface"
                  onClick={onBack}
                  className="w-full font-black text-base py-3 rounded-xl"
                >
                  Back to Menu
                </ClayButton>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
