"use client";

import React, { useState, useEffect, useCallback } from "react";
import { ArrowLeft, Volume2, HelpCircle } from "@/components/Icons";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import ClayButton from "@/components/ui/ClayButton";
import ClayCard from "@/components/ui/ClayCard";
import MascotSVG from "@/components/MascotSVG";

interface ShelterItem {
  emoji: string;
  name: string;
  label: string;
}

interface ShelterQuestion {
  animal: string;
  animalEmoji: string;
  questionText: string;
  correctShelter: ShelterItem;
  wrongShelters: ShelterItem[];
}

const playSynthesizedSound = (type: "correct" | "wrong" | "levelUp" | "click") => {
  if (typeof window === "undefined") return;
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    
    if (type === "correct") {
      const now = ctx.currentTime;
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
      const now = ctx.currentTime;
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
      const now = ctx.currentTime;
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
      const now = ctx.currentTime;
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
    }
  } catch (e) {
    console.error("Audio Synthesis error:", e);
  }
};

const shelterPool: ShelterQuestion[] = [
  {
    animal: "fish",
    animalEmoji: "🐟",
    questionText: "Where does the fish live?",
    correctShelter: { emoji: "🌊", name: "Ocean", label: "Ocean" },
    wrongShelters: [
      { emoji: "🌳", name: "Tree", label: "Tree" },
      { emoji: "🏡", name: "Barn", label: "Barn" }
    ]
  },
  {
    animal: "squirrel",
    animalEmoji: "🐿️",
    questionText: "Where does the squirrel live?",
    correctShelter: { emoji: "🌳", name: "Tree", label: "Tree" },
    wrongShelters: [
      { emoji: "🌊", name: "Ocean", label: "Ocean" },
      { emoji: "🕸️", name: "Web", label: "Web" }
    ]
  },
  {
    animal: "bee",
    animalEmoji: "🐝",
    questionText: "Where does the bee live?",
    correctShelter: { emoji: "🍯", name: "Beehive", label: "Beehive" },
    wrongShelters: [
      { emoji: "🌊", name: "Ocean", label: "Ocean" },
      { emoji: "🏠", name: "Doghouse", label: "Doghouse" }
    ]
  },
  {
    animal: "bird",
    animalEmoji: "🐦",
    questionText: "Where does the bird live?",
    correctShelter: { emoji: "🪺", name: "Nest", label: "Nest" },
    wrongShelters: [
      { emoji: "🏡", name: "Barn", label: "Barn" },
      { emoji: "🌊", name: "Ocean", label: "Ocean" }
    ]
  },
  {
    animal: "bear",
    animalEmoji: "🐻",
    questionText: "Where does the bear live?",
    correctShelter: { emoji: "🪨", name: "Cave", label: "Cave" },
    wrongShelters: [
      { emoji: "🍯", name: "Beehive", label: "Beehive" },
      { emoji: "🪺", name: "Nest", label: "Nest" }
    ]
  },
  {
    animal: "dog",
    animalEmoji: "🐶",
    questionText: "Where does the dog live?",
    correctShelter: { emoji: "🏠", name: "Doghouse", label: "Doghouse" },
    wrongShelters: [
      { emoji: "🌊", name: "Ocean", label: "Ocean" },
      { emoji: "🕸️", name: "Web", label: "Web" }
    ]
  },
  {
    animal: "pig",
    animalEmoji: "🐷",
    questionText: "Where does the pig live?",
    correctShelter: { emoji: "🏡", name: "Barn", label: "Barn" },
    wrongShelters: [
      { emoji: "🌳", name: "Tree", label: "Tree" },
      { emoji: "🪺", name: "Nest", label: "Nest" }
    ]
  },
  {
    animal: "frog",
    animalEmoji: "🐸",
    questionText: "Where does the frog live?",
    correctShelter: { emoji: "🪷", name: "Pond", label: "Pond" },
    wrongShelters: [
      { emoji: "🪵", name: "Dry Log", label: "Dry Log" },
      { emoji: "🏠", name: "Doghouse", label: "Doghouse" }
    ]
  },
  {
    animal: "spider",
    animalEmoji: "🕷️",
    questionText: "Where does the spider live?",
    correctShelter: { emoji: "🕸️", name: "Web", label: "Web" },
    wrongShelters: [
      { emoji: "🏡", name: "Barn", label: "Barn" },
      { emoji: "🌊", name: "Ocean", label: "Ocean" }
    ]
  },
  {
    animal: "lion",
    animalEmoji: "🦁",
    questionText: "Where does the lion live?",
    correctShelter: { emoji: "🌾", name: "Savanna", label: "Savanna" },
    wrongShelters: [
      { emoji: "🏠", name: "Doghouse", label: "Doghouse" },
      { emoji: "🍯", name: "Beehive", label: "Beehive" }
    ]
  }
];

const shuffleArray = <T,>(array: T[]): T[] => {
  return [...array].sort(() => Math.random() - 0.5);
};

export default function WhereIsBunnyEngine({ childId, onBack }: { childId: string; onBack: () => void }) {
  const [roundsList, setRoundsList] = useState<ShelterQuestion[]>([]);
  const [currentRoundIdx, setCurrentRoundIdx] = useState(0);
  const [choices, setChoices] = useState<ShelterItem[]>([]);
  const [gameState, setGameState] = useState<"playing" | "correct" | "incorrect" | "success">("playing");
  const [wrongSelections, setWrongSelections] = useState<string[]>([]);
  const [startTime] = useState<number>(() => Date.now());
  const [errorsThisGame, setErrorsThisGame] = useState(0);

  const speakText = useCallback((text: string) => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.82;
      utterance.pitch = 1.2;
      window.speechSynthesis.speak(utterance);
    }
  }, []);

  // Initialize rounds
  useEffect(() => {
    const selected = shuffleArray(shelterPool).slice(0, 5);
    setRoundsList(selected);
    setCurrentRoundIdx(0);
  }, []);

  const currentQuestion = roundsList[currentRoundIdx];

  // Set up choices for the current round
  useEffect(() => {
    if (currentQuestion) {
      const allChoices = shuffleArray([
        currentQuestion.correctShelter,
        ...currentQuestion.wrongShelters
      ]);
      setChoices(allChoices);
      setWrongSelections([]);
      setGameState("playing");
      speakText(currentQuestion.questionText);
    }
  }, [currentQuestion, speakText]);

  const handleChoiceTap = (choice: ShelterItem) => {
    if (gameState !== "playing") return;

    if (choice.name === currentQuestion.correctShelter.name) {
      setGameState("correct");
      playSynthesizedSound("correct");
      speakText("Yes! The " + currentQuestion.animal + " lives in the " + choice.name + "!");
      
      confetti({
        particleCount: 60,
        spread: 50,
        origin: { y: 0.8 },
        colors: ["#bee8d4", "#ffc4c0", "#ddcbf5", "#ffffff"]
      });

      setTimeout(() => {
        if (currentRoundIdx < roundsList.length - 1) {
          setCurrentRoundIdx(prev => prev + 1);
        } else {
          handleGameComplete();
        }
      }, 2000);
    } else {
      playSynthesizedSound("wrong");
      setErrorsThisGame(prev => prev + 1);
      if (!wrongSelections.includes(choice.name)) {
        setWrongSelections(prev => [...prev, choice.name]);
      }
      speakText("Not there! Try again!");
    }
  };

  const handleGameComplete = async () => {
    playSynthesizedSound("levelUp");
    setGameState("success");

    const elapsed = Date.now() - startTime;
    if (childId) {
      try {
        await fetch(`/api/progress/${childId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            targetLetter: "SHELTER",
            tracingScore: Math.max(0, 100 - errorsThisGame * 15),
            phonemicScore: 100,
            timeSpentMs: elapsed
          })
        });

        await fetch(`/api/badges/${childId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            badgeName: "Shelter Master"
          })
        });
      } catch (err) {
        console.error("Telemetry failed:", err);
      }
    }
  };

  const getCardShakeAnimation = (name: string) => {
    if (wrongSelections.includes(name)) {
      return {
        x: [0, -10, 10, -8, 8, 0],
        transition: { duration: 0.5 }
      };
    }
    return {};
  };

  return (
    <div className="flex flex-col w-full max-w-4xl mx-auto h-full min-h-0 bg-transparent p-4 rounded-[2.5rem] relative overflow-visible select-none justify-start gap-4">
      
      {/* Header Row */}
      <div className="flex items-center justify-between shrink-0">
        <ClayButton
          variant="surface"
          size="sm"
          onClick={() => {
            playSynthesizedSound("click");
            onBack();
          }}
        >
          <ArrowLeft size={24} strokeWidth={3.5} />
        </ClayButton>

        <h1 className="text-xl sm:text-2xl font-black uppercase text-[#4A5358] tracking-wider flex items-center gap-2">
          <HelpCircle size={24} className="text-[#3fa394]" strokeWidth={3.5} />
          Shelter Game
        </h1>

        <div className="bg-white/80 border-2 border-white/40 shadow-inner px-4 py-2 rounded-full font-black text-[#3fa394] text-sm tracking-wide">
          ROUND {currentRoundIdx + 1}/{roundsList.length || 5}
        </div>
      </div>

      {/* Mascot Speech Bubble Header */}
      <div className="w-full flex items-center gap-4 sm:gap-6 bg-white/45 backdrop-blur-md rounded-[2.2rem] border-white/60 border-[3px] p-4 sm:p-5 shadow-[0_12px_25px_rgba(0,0,0,0.02)] shrink-0">
        {/* Floating Boy Mascot on the left */}
        <div className="relative shrink-0 select-none w-16 h-16 sm:w-20 sm:h-20">
          <div className="absolute top-0 -left-1.5 text-[#ffd166] text-xs animate-sparkle-1 pointer-events-none">✨</div>
          <div className="absolute -bottom-1 -right-1 text-[#e07383] text-xs animate-sparkle-2 pointer-events-none">✨</div>
          <MascotSVG className="w-full h-full filter drop-shadow-[2px_4px_8px_rgba(0,0,0,0.06)] animate-float" />
        </div>

        {/* Speech Bubble on the right */}
        <div className="flex-1 relative bg-white/95 px-5 py-3 rounded-2xl border-white/60 border-2 shadow-inner text-left">
          {/* Rotated square tail pointing to the left towards Buddy */}
          <div className="absolute left-[-6px] top-1/2 -translate-y-1/2 w-3 h-3 rotate-45 bg-white/95 border-b border-l border-white/60" />
          
          <div className="text-left relative z-10 pl-1 flex items-center justify-between gap-3">
            <div>
              <p className="text-[9px] font-black text-[#d4a919] uppercase tracking-wider leading-none mb-1">Buddy says:</p>
              <p className="text-xs sm:text-sm font-bold text-[#4A5358]/85 leading-normal">
                {currentQuestion?.questionText}
              </p>
            </div>
            
            <ClayButton
              variant="surface"
              size="sm"
              onClick={() => currentQuestion && speakText(currentQuestion.questionText)}
              className="p-2 bg-[#eef1f6] rounded-full shrink-0 toddler-target"
            >
              <Volume2 size={16} className="text-[#3fa394]" strokeWidth={3.5} />
            </ClayButton>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      <AnimatePresence>
        {gameState === "success" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-40 bg-black/40 backdrop-blur-md flex items-center justify-center p-6 rounded-[2.5rem]"
          >
            <ClayCard
              variant="secondary"
              className="max-w-md w-full p-8 text-center flex flex-col items-center gap-6 border-white/40"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
            >
              <div className="w-20 h-20 rounded-full bg-[#3fa394] text-white text-4xl flex items-center justify-center shadow-clay-mint mb-2">
                🏆
              </div>
              <h2 className="text-3xl font-black text-[#0d4036] tracking-wide uppercase">Shelter Master!</h2>
              <p className="text-sm font-bold text-[#0d4036]/80 leading-relaxed">
                Super science skills! You know exactly where all the animals live. You earned the Shelter Master badge!
              </p>

              <ClayButton
                variant="primary"
                onClick={onBack}
                className="w-full py-4 text-lg font-black rounded-full mt-2 toddler-target"
              >
                Back to Map 🏆
              </ClayButton>
            </ClayCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Center Showcase Card: Animal Display */}
      <div className="w-full flex-grow relative flex justify-center items-center overflow-visible min-h-0">
        <div className="absolute bg-gradient-to-tr from-[#ffe5d9] to-[#c3e6dc] w-56 h-56 sm:w-68 sm:h-68 rounded-full blur-[45px] opacity-40 -z-10 animate-pulse pointer-events-none" />
        
        <ClayCard
          variant="glass"
          className="p-5 sm:p-7 flex flex-col items-center justify-center gap-3 max-w-[260px] sm:max-w-xs w-full border-white/50 border-2 shadow-[0_12px_24px_rgba(0,0,0,0.02)] rounded-[2.2rem]"
        >
          <span className="text-[10px] sm:text-xs font-black text-[#8eb0a4] uppercase tracking-widest leading-none">
            Animal Partner
          </span>
          
          <motion.div
            key={currentQuestion?.animal}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1.1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 12 }}
            className="text-7xl sm:text-8xl filter drop-shadow-[4px_8px_12px_rgba(0,0,0,0.08)] select-none cursor-pointer"
            onClick={() => currentQuestion && speakText(currentQuestion.animal)}
          >
            {currentQuestion?.animalEmoji}
          </motion.div>
          
          <h2 className="text-lg sm:text-xl font-black text-slate-dark tracking-wide uppercase mt-1">
            {currentQuestion?.animal}
          </h2>
        </ClayCard>
      </div>

      {/* Choices Tray */}
      <div className="w-full grid grid-cols-3 gap-3 sm:gap-6 pb-2 shrink-0">
        {choices.map((choice) => {
          const isWrong = wrongSelections.includes(choice.name);
          return (
            <motion.button
              key={choice.name}
              animate={getCardShakeAnimation(choice.name)}
              whileHover={gameState === "playing" && !isWrong ? { scale: 1.05 } : {}}
              whileTap={gameState === "playing" && !isWrong ? { scale: 0.95, y: 4 } : {}}
              onClick={() => handleChoiceTap(choice)}
              className={`clay-card aspect-[4/5] p-3 flex flex-col items-center justify-between border-2 border-white/30 transition-all text-center relative overflow-hidden ${
                gameState !== "playing" && choice.name !== currentQuestion?.correctShelter.name
                  ? "opacity-45 pointer-events-none"
                  : isWrong
                  ? "opacity-40 cursor-not-allowed pointer-events-none"
                  : "cursor-pointer"
              }`}
            >
              {/* Shelter Icon Display */}
              <div className="flex-grow flex items-center justify-center w-full h-full max-h-[70%] text-6xl sm:text-7xl filter drop-shadow-[2px_4px_8px_rgba(0,0,0,0.05)] mt-2">
                {choice.emoji}
              </div>

              {/* Shelter Label */}
              <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-slate-dark text-center border-t border-white/10 w-full pt-1.5 mt-1">
                {choice.label}
              </span>
            </motion.button>
          );
        })}
      </div>

    </div>
  );
}
