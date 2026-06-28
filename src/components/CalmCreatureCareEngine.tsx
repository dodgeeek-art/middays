"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { Speaker224Regular } from "@fluentui/react-icons";
import { playSynthesizedSound } from "@/lib/audio";
import { speakWithPreferredVoice } from "@/lib/speech";
import { vocabularyList } from "@/lib/svgDictionary";
import { advancedVocabularyList } from "@/lib/svgDictionaryAdvanced";
import { Smile } from "@/components/Icons";
import ClayButton from "@/components/ui/ClayButton";

interface CalmCreatureCareProps {
  childId: string;
  onBack: () => void;
}

interface CareRound {
  id: string;
  animalName: string;
  animalType: string; // Friendly label
  questionText: string;
  correctItem: string;
  choices: string[];
  vocabularySource: "standard" | "advanced";
  choiceSources: ("standard" | "advanced")[];
}

const CARE_ROUNDS: CareRound[] = [
  {
    id: "cr1",
    animalName: "Rabbit",
    animalType: "Fluffy Rabbit",
    questionText: "What does the rabbit love to eat?",
    correctItem: "Carrot",
    choices: ["Carrot", "Bone", "Fish"],
    vocabularySource: "standard",
    choiceSources: ["standard", "advanced", "standard"]
  },
  {
    id: "cr2",
    animalName: "Dog",
    animalType: "Happy Puppy",
    questionText: "What tasty treat does the puppy want?",
    correctItem: "Bone",
    choices: ["Bone", "Banana", "Apple"],
    vocabularySource: "standard",
    choiceSources: ["advanced", "standard", "standard"]
  },
  {
    id: "cr3",
    animalName: "Monkey",
    animalType: "Playful Monkey",
    questionText: "What is the monkey's favorite snack?",
    correctItem: "Banana",
    choices: ["Banana", "Leaf", "Mushroom"],
    vocabularySource: "standard",
    choiceSources: ["standard", "standard", "standard"]
  },
  {
    id: "cr4",
    animalName: "Bee",
    animalType: "Busy Honeybee",
    questionText: "Where does the bee collect sweet nectar?",
    correctItem: "Sunflower",
    choices: ["Sunflower", "Carrot", "Egg"],
    vocabularySource: "standard",
    choiceSources: ["standard", "standard", "standard"]
  },
  {
    id: "cr5",
    animalName: "Panda",
    animalType: "Sleepy Panda",
    questionText: "What leaves does the giant panda munch on?",
    correctItem: "Leaf",
    choices: ["Leaf", "Cookie", "Donut"],
    vocabularySource: "standard",
    choiceSources: ["standard", "standard", "standard"]
  },
  {
    id: "cr6",
    animalName: "Frog",
    animalType: "Little Frog",
    questionText: "Where does the frog love to splash and hop?",
    correctItem: "Rain",
    choices: ["Rain", "Cake", "Hat"],
    vocabularySource: "standard",
    choiceSources: ["standard", "standard", "standard"]
  },
  {
    id: "cr7",
    animalName: "Dolphin",
    animalType: "Jumping Dolphin",
    questionText: "What does the dolphin need to swim in?",
    correctItem: "Shell", // representing water/ocean/beach
    choices: ["Shell", "Tree", "House"],
    vocabularySource: "standard",
    choiceSources: ["standard", "standard", "standard"]
  },
  {
    id: "cr8",
    animalName: "Penguin",
    animalType: "Chilly Penguin",
    questionText: "What does the penguin catch in the cold water?",
    correctItem: "Fish",
    choices: ["Fish", "Tomato", "Cheese"],
    vocabularySource: "standard",
    choiceSources: ["standard", "standard", "standard"]
  },
  {
    id: "cr9",
    animalName: "Squirrel", // represented by Chipmunk
    animalType: "Squeaky Chipmunk",
    questionText: "What did the chipmunk find on the forest floor?",
    correctItem: "Mushroom",
    choices: ["Mushroom", "Gift", "Cup"],
    vocabularySource: "advanced", // Squirrel/Chipmunk is in advanced list
    choiceSources: ["standard", "standard", "standard"]
  },
  {
    id: "cr10",
    animalName: "Bear",
    animalType: "Big Brown Bear",
    questionText: "What sweet fruit does the bear gather?",
    correctItem: "Apple",
    choices: ["Apple", "Hamburger", "Pizza"],
    vocabularySource: "standard",
    choiceSources: ["standard", "standard", "standard"]
  }
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

const getIcon = (name: string, source: "standard" | "advanced"): React.ComponentType<{ className?: string }> => {
  if (source === "advanced") {
    const found = advancedVocabularyList.find(v => v.name.toLowerCase() === name.toLowerCase());
    return (found ? found.icon : Smile) as React.ComponentType<{ className?: string }>;
  }
  const found = vocabularyList.find(v => v.name.toLowerCase() === name.toLowerCase());
  return (found ? found.icon : Smile) as React.ComponentType<{ className?: string }>;
};

export default function CalmCreatureCareEngine({ childId: _childId, onBack }: CalmCreatureCareProps) {
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [feedbackState, setFeedbackState] = useState<"idle" | "correct" | "wrong">("idle");
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [caredAnimals, setCaredAnimals] = useState<string[]>([]);
  const [isGameOver, setIsGameOver] = useState(false);
  const [currentRounds, setCurrentRounds] = useState<CareRound[]>(() =>
    [...CARE_ROUNDS].sort(() => Math.random() - 0.5).slice(0, 10)
  );
  const [wrongChoices, setWrongChoices] = useState<string[]>([]);

  const activeRound = currentRounds[round - 1];

  const shuffledChoices = useMemo(() => {
    if (!activeRound) return [];
    return shuffleDeterministically(activeRound.choices, activeRound.id);
  }, [activeRound]);

  useEffect(() => {
    if (!activeRound) return;
    speakWithPreferredVoice(`Let's help the ${activeRound.animalType}! ${activeRound.questionText}`, null);
  }, [round, activeRound]);

  const speakPrompt = useCallback(() => {
    if (!activeRound) return;
    speakWithPreferredVoice(`This is the ${activeRound.animalType}. ${activeRound.questionText}`, null);
  }, [activeRound]);

  const handleChoiceSelect = (choiceName: string) => {
    if (feedbackState === "correct" || wrongChoices.includes(choiceName)) return;

    setSelectedChoice(choiceName);
    const isCorrect = choiceName === activeRound.correctItem;

    if (isCorrect) {
      setFeedbackState("correct");
      playSynthesizedSound("correct");
      setScore(prev => prev + 10);

      // Add animal to the Meadow
      setCaredAnimals(prev => [...prev, activeRound.animalName]);

      // Sparkles/Confetti
      confetti({
        particleCount: 60,
        spread: 50,
        origin: { y: 0.7 },
        colors: ["#a855f7", "#ec4899", "#3b82f6", "#22c55e"]
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
      }, 2000);

    } else {
      setFeedbackState("wrong");
      playSynthesizedSound("wrong");
      setWrongChoices(prev => [...prev, choiceName]);

      speakWithPreferredVoice(`That's not quite right. Can you find what the ${activeRound.animalName} needs?`, null);

      setTimeout(() => {
        setFeedbackState("idle");
        setSelectedChoice(null);
      }, 1500);
    }
  };

  const handlePlayAgain = () => {
    const shuffled = [...CARE_ROUNDS].sort(() => Math.random() - 0.5).slice(0, 10);
    setCurrentRounds(shuffled);
    setRound(1);
    setScore(0);
    setCaredAnimals([]);
    setIsGameOver(false);
    setFeedbackState("idle");
    setSelectedChoice(null);
    setWrongChoices([]);
  };

  if (!activeRound) {
    return (
      <div className="flex h-full w-full items-center justify-center p-6 text-center">
        <p className="text-lg font-black text-slate-700">Feeding the animals...</p>
      </div>
    );
  }

  const animalIcon = getIcon(activeRound.animalName, activeRound.vocabularySource);

  return (
    <div className="flex h-full w-full flex-col bg-gradient-to-b from-[#f3e8ff]/60 to-[#ecfdf5]/40 p-4 relative overflow-hidden select-none">
      
      {/* Header instructions */}
      <div className="flex items-center justify-between gap-4 mb-2 shrink-0">
        <div className="flex items-center gap-3">
          <div className="text-3xl">🐾</div>
          <div className="bg-white/90 rounded-2xl px-4 py-2 border border-slate-200/50 shadow-sm">
            <span className="text-[10px] font-black uppercase text-purple-600 tracking-wider">Creature Care:</span>
            <p className="text-sm font-bold text-slate-800">
              {activeRound.questionText}
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

      {/* Main Meadow Interaction Area */}
      <div className="flex-grow flex flex-col items-center justify-center gap-6 min-h-0 py-2 relative">
        
        {/* Active Animal Sanctuary Card */}
        <div className="w-full max-w-sm bg-white rounded-[2.5rem] border-4 border-purple-200 p-6 flex flex-col items-center justify-center shadow-xl relative min-h-[160px]">
          
          <motion.div
            key={activeRound.animalName}
            initial={{ scale: 0.9, y: 10 }}
            animate={feedbackState === "correct" ? { scale: [1, 1.12, 1], y: [0, -10, 0] } : { scale: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-24 h-24 flex items-center justify-center mb-2"
          >
            {React.createElement(animalIcon, { className: "w-full h-full text-slate-800" })}
          </motion.div>

          <span className="text-sm font-black uppercase text-purple-600 tracking-wider">
            {activeRound.animalType}
          </span>

          {/* Correct Item Fly-in Animation */}
          <AnimatePresence>
            {feedbackState === "correct" && selectedChoice && (
              <motion.div
                initial={{ opacity: 1, scale: 0.5, y: 100 }}
                animate={{ opacity: 0, scale: 1.2, y: -20 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6 }}
                className="absolute text-4xl"
              >
                ❤️
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Choice list */}
        <div className="w-full max-w-md flex justify-center gap-4">
          <AnimatePresence mode="wait">
            {shuffledChoices.map((choice) => {
              const isSelected = selectedChoice === choice;
              const isWrong = wrongChoices.includes(choice);
              
              // Resolve correct source
              const choiceIdx = activeRound.choices.indexOf(choice);
              const choiceSource = activeRound.choiceSources[choiceIdx] || "standard";
              const ChoiceIcon = getIcon(choice, choiceSource);

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

      {/* Collection Meadow Panel */}
      <div className="shrink-0 mt-2 bg-gradient-to-r from-purple-50 to-emerald-50 border border-slate-200/50 rounded-3xl p-3 flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-black uppercase text-purple-600 tracking-wider">My Peaceful Meadow Sanctuary (Score: {score})</span>
          <span className="text-xs font-bold text-slate-600">Round {round} of 10</span>
        </div>
        <div className="h-14 bg-emerald-950/5 border border-dashed border-emerald-900/10 rounded-2xl flex items-center justify-start gap-4 px-4 overflow-x-auto overflow-y-hidden">
          {caredAnimals.length === 0 ? (
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mx-auto">Feed animals to invite them to the meadow!</span>
          ) : (
            <div className="flex gap-4">
              {caredAnimals.map((animal, i) => {
                const MiniIcon = getIcon(animal, "standard");
                return (
                  <motion.div
                    key={i}
                    initial={{ scale: 0, x: -10 }}
                    animate={{ scale: 1, x: 0 }}
                    className="w-10 h-10 flex items-center justify-center bg-white border border-slate-200 shadow-sm rounded-xl p-1 animate-float"
                    style={{ animationDelay: `${i * 300}ms` }}
                  >
                    <MiniIcon className="w-full h-full text-slate-700" />
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Finished Game Over Screen */}
      <AnimatePresence>
        {isGameOver && (
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              className="bg-white rounded-[2.5rem] border border-slate-200 p-8 max-w-md w-full text-center shadow-2xl relative"
            >
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-[1.45rem] border-2 border-white bg-purple-500 text-4xl text-white shadow-md">
                🐾
              </div>

              <h2 className="font-display text-3xl font-extrabold text-slate-800 leading-none">Meadow Full of Love!</h2>
              <p className="mt-3 text-slate-600 font-bold max-w-xs mx-auto">
                Amazing! You have correctly fed and sheltered all 10 animals. Your meadow sanctuary is full of happy friends!
              </p>

              <div className="flex gap-4 items-center justify-center mt-6">
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
