"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { ArrowLeft, Volume2, HelpCircle, Trophy } from "@/components/Icons";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import confetti from "canvas-confetti";
import ClayButton from "@/components/ui/ClayButton";
import ClayCard from "@/components/ui/ClayCard";
import MascotSVG from "@/components/MascotSVG";
import { vocabularyList, CartoonSVG } from "@/lib/svgDictionary";

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

const playSynthesizedSound = (type: "correct" | "wrong" | "levelUp" | "click" | "hey") => {
  if (typeof window === "undefined") return;
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    
    if (type === "correct" || type === "hey") {
      const now = ctx.currentTime;
      // High-pitched bright "Hey!" sound synthesized using oscillators
      [587.33, 739.99, 880.00, 1174.66].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now + idx * 0.02);
        osc.frequency.exponentialRampToValueAtTime(freq * 1.15, now + idx * 0.02 + 0.15);
        
        gain.gain.setValueAtTime(0.18, now + idx * 0.02);
        gain.gain.exponentialRampToValueAtTime(0.002, now + idx * 0.02 + 0.22);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.02);
        osc.stop(now + idx * 0.02 + 0.24);
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

// Custom Fluent-style Shelter SVGs


// Helpers to lookup Fluent icons
const getAnimalIcon = (name: string): React.FC<any> | null => {
  const lowerName = name.toLowerCase();
  const item = vocabularyList.find(v => v.name.toLowerCase() === lowerName);
  return item ? item.icon : null;
};

const ForestScene = (props: any) => {
  const TreeComp = getAnimalIcon("Tree");
  if (!TreeComp) return null;
  return (
    <div className="relative w-full h-full flex items-center justify-center min-h-[90px] sm:min-h-[120px]">
      {/* Left Tree */}
      <div className="absolute -translate-x-5 translate-y-1.5 z-10 scale-90 opacity-90 w-12 h-12 sm:w-16 sm:h-16">
        {React.createElement(TreeComp, props)}
      </div>
      {/* Right Tree */}
      <div className="absolute translate-x-5 translate-y-1.5 z-10 scale-90 opacity-90 w-12 h-12 sm:w-16 sm:h-16">
        {React.createElement(TreeComp, props)}
      </div>
      {/* Middle Tree (front) */}
      <div className="absolute z-20 w-16 h-16 sm:w-20 sm:h-20 drop-shadow-md">
        {React.createElement(TreeComp, props)}
      </div>
    </div>
  );
};

const renderShelterIcon = (choice: ShelterItem, className?: string) => {
  const name = choice.name.toLowerCase();
  const props = { className: className || "w-full h-full" };

  if (name === "forest" || name === "tree") {
    return <ForestScene {...props} />;
  }
  if (name === "doghouse" || name === "house") {
    const HouseComp = getAnimalIcon("House");
    return HouseComp ? React.createElement(HouseComp, props) : null;
  }
  if (name === "flower") {
    const SunflowerComp = getAnimalIcon("Sunflower");
    return SunflowerComp ? React.createElement(SunflowerComp, props) : null;
  }

  // Composed emoji/SVG scenes for clarity and straightforward visual representation
  if (name === "ocean") {
    return (
      <div className="flex items-center justify-center gap-1">
        <span className="text-5xl sm:text-6xl select-none">🌊</span>
        <span className="text-3xl sm:text-4xl select-none">🐚</span>
      </div>
    );
  }
  if (name === "farm") {
    return (
      <div className="flex items-center justify-center gap-2">
        <span className="text-5xl sm:text-6xl select-none">🚜</span>
        <span className="text-4xl sm:text-5xl select-none">🏡</span>
      </div>
    );
  }
  if (name === "pond") {
    return (
      <div className="flex items-center justify-center gap-1.5">
        <span className="text-5xl sm:text-6xl select-none">🪷</span>
        <span className="text-4xl sm:text-5xl select-none">🌊</span>
      </div>
    );
  }
  if (name === "ice") {
    return (
      <div className="flex items-center justify-center gap-2">
        <span className="text-5xl sm:text-6xl select-none">🧊</span>
        <span className="text-4xl sm:text-5xl select-none">❄️</span>
      </div>
    );
  }
  if (name === "cave") {
    return (
      <div className="flex items-center justify-center gap-2">
        <span className="text-5xl sm:text-6xl select-none">⛰️</span>
        <span className="text-4xl sm:text-5xl select-none">🪨</span>
      </div>
    );
  }
  if (name === "nest") {
    return (
      <div className="flex items-center justify-center gap-2">
        <span className="text-5xl sm:text-6xl select-none">🪺</span>
        <span className="text-3xl sm:text-4xl select-none">🌿</span>
      </div>
    );
  }
  if (name === "beehive") {
    return (
      <div className="flex items-center justify-center gap-2">
        <span className="text-5xl sm:text-6xl select-none">🛖</span>
        <span className="text-3xl sm:text-4xl select-none">🐝</span>
      </div>
    );
  }

  return <span className="text-5xl sm:text-6xl select-none">{choice.emoji}</span>;
};

const shelterPool: ShelterQuestion[] = [
  {
    animal: "fish",
    animalEmoji: "🐟",
    questionText: "Where does the fish live?",
    correctShelter: { emoji: "🌊", name: "Ocean", label: "Ocean" },
    wrongShelters: [
      { emoji: "🌳", name: "Forest", label: "Forest" },
      { emoji: "🚜", name: "Farm", label: "Farm" }
    ]
  },
  {
    animal: "monkey",
    animalEmoji: "🐒",
    questionText: "Where does the monkey live?",
    correctShelter: { emoji: "🌳", name: "Forest", label: "Forest" },
    wrongShelters: [
      { emoji: "🌊", name: "Ocean", label: "Ocean" },
      { emoji: "🚜", name: "Farm", label: "Farm" }
    ]
  },
  {
    animal: "bee",
    animalEmoji: "🐝",
    questionText: "Where does the bee live?",
    correctShelter: { emoji: "🛖", name: "Beehive", label: "Beehive" },
    wrongShelters: [
      { emoji: "🌊", name: "Ocean", label: "Ocean" },
      { emoji: "🏠", name: "Doghouse", label: "Doghouse" }
    ]
  },
  {
    animal: "owl",
    animalEmoji: "🦉",
    questionText: "Where does the owl live?",
    correctShelter: { emoji: "🪺", name: "Nest", label: "Nest" },
    wrongShelters: [
      { emoji: "🚜", name: "Farm", label: "Farm" },
      { emoji: "🌊", name: "Ocean", label: "Ocean" }
    ]
  },
  {
    animal: "bear",
    animalEmoji: "🐻",
    questionText: "Where does the bear live?",
    correctShelter: { emoji: "🪨", name: "Cave", label: "Cave" },
    wrongShelters: [
      { emoji: "🛖", name: "Beehive", label: "Beehive" },
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
      { emoji: "🚜", name: "Farm", label: "Farm" }
    ]
  },
  {
    animal: "pig",
    animalEmoji: "🐷",
    questionText: "Where does the pig live?",
    correctShelter: { emoji: "🚜", name: "Farm", label: "Farm" },
    wrongShelters: [
      { emoji: "🌳", name: "Forest", label: "Forest" },
      { emoji: "🪺", name: "Nest", label: "Nest" }
    ]
  },
  {
    animal: "frog",
    animalEmoji: "🐸",
    questionText: "Where does the frog live?",
    correctShelter: { emoji: "🪷", name: "Pond", label: "Pond" },
    wrongShelters: [
      { emoji: "🌳", name: "Forest", label: "Forest" },
      { emoji: "🏠", name: "Doghouse", label: "Doghouse" }
    ]
  },
  {
    animal: "octopus",
    animalEmoji: "🐙",
    questionText: "Where does the octopus live?",
    correctShelter: { emoji: "🌊", name: "Ocean", label: "Ocean" },
    wrongShelters: [
      { emoji: "🚜", name: "Farm", label: "Farm" },
      { emoji: "🏠", name: "Doghouse", label: "Doghouse" }
    ]
  },
  {
    animal: "penguin",
    animalEmoji: "🐧",
    questionText: "Where does the penguin live?",
    correctShelter: { emoji: "🧊", name: "Ice", label: "Ice" },
    wrongShelters: [
      { emoji: "🏠", name: "Doghouse", label: "Doghouse" },
      { emoji: "🌻", name: "Flower", label: "Flower" }
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
  const [dragOffsetKey, setDragOffsetKey] = useState(0);
  const [startTime] = useState<number>(() => Date.now());
  const [errorsThisGame, setErrorsThisGame] = useState(0);

  // Refs for drop collision
  const zone0Ref = useRef<HTMLDivElement>(null);
  const zone1Ref = useRef<HTMLDivElement>(null);
  const zone2Ref = useRef<HTMLDivElement>(null);

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

  const handleDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (gameState !== "playing" || !currentQuestion) return;

    const dragX = info.point.x;
    const dragY = info.point.y;

    const rects = [
      zone0Ref.current?.getBoundingClientRect(),
      zone1Ref.current?.getBoundingClientRect(),
      zone2Ref.current?.getBoundingClientRect()
    ];

    let droppedIdx: number | null = null;

    for (let i = 0; i < rects.length; i++) {
      const rect = rects[i];
      if (rect && dragX >= rect.left && dragX <= rect.right && dragY >= rect.top && dragY <= rect.bottom) {
        droppedIdx = i;
        break;
      }
    }

    if (droppedIdx === null) {
      setDragOffsetKey(prev => prev + 1);
      return;
    }

    const selectedChoice = choices[droppedIdx];
    if (selectedChoice && selectedChoice.name === currentQuestion.correctShelter.name) {
      handleSuccess();
    } else {
      handleFailure(selectedChoice?.name);
    }
  };

  const handleSuccess = () => {
    setGameState("correct");
    playSynthesizedSound("hey");
    speakText("Hey! The " + currentQuestion.animal + " lives in the " + currentQuestion.correctShelter.name + "!");

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
    }, 2200);
  };

  const handleFailure = (choiceName: string) => {
    playSynthesizedSound("wrong");
    setErrorsThisGame(prev => prev + 1);
    if (choiceName && !wrongSelections.includes(choiceName)) {
      setWrongSelections(prev => [...prev, choiceName]);
    }
    speakText("Not there! Try again!");
    
    // Snap back animal
    setTimeout(() => {
      setDragOffsetKey(prev => prev + 1);
    }, 500);
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

  return (
    <div className="w-full max-w-3xl mx-auto p-3 sm:p-6 flex flex-col items-center justify-start h-full min-h-0 relative overflow-hidden rounded-[2.5rem] select-none">
      
      {/* Ecosystem SVG Background - fully animated, sky to ocean */}
      <svg 
        className="absolute inset-0 w-full h-full -z-10 rounded-[2.5rem] overflow-hidden pointer-events-none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="bgGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#eef8ff" /> {/* Soft sky blue */}
            <stop offset="40%" stopColor="#e2f5ee" /> {/* Soft forest/meadow green */}
            <stop offset="75%" stopColor="#f7ebd3" /> {/* Soft savanna/cave cream */}
            <stop offset="100%" stopColor="#a2e3d4" /> {/* Soft ocean/pond water */}
          </linearGradient>
          <linearGradient id="sunGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fff9e6" />
            <stop offset="100%" stopColor="#ffd166" />
          </linearGradient>
          <linearGradient id="caveGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#c5bcae" />
            <stop offset="100%" stopColor="#a89e90" />
          </linearGradient>
          <style>{`
            @keyframes bubbleUp {
              0% { transform: translateY(160px) scale(0.6); opacity: 0; }
              50% { opacity: 0.5; }
              100% { transform: translateY(-50px) scale(1.1); opacity: 0; }
            }
            @keyframes leafSway {
              0%, 100% { transform: rotate(0deg); }
              50% { transform: rotate(2.5deg); }
            }
            @keyframes cloudDrift1 {
              0% { transform: translateX(-50px); }
              100% { transform: translateX(80px); }
            }
            @keyframes cloudDrift2 {
              0% { transform: translateX(60px); }
              100% { transform: translateX(-60px); }
            }
            @keyframes sunPulse {
              0%, 100% { transform: scale(1); opacity: 0.9; }
              50% { transform: scale(1.05); opacity: 1; }
            }
            @keyframes grassSway {
              0%, 100% { transform: rotate(0deg); }
              50% { transform: rotate(3deg); }
            }
            .bubble-1 { animation: bubbleUp 6s infinite ease-in; }
            .bubble-2 { animation: bubbleUp 8s infinite ease-in 2s; }
            .bubble-3 { animation: bubbleUp 10s infinite ease-in 4s; }
            .leaf-branch { animation: leafSway 6s infinite ease-in-out; }
            .cloud-1 { animation: cloudDrift1 24s infinite linear alternate; }
            .cloud-2 { animation: cloudDrift2 30s infinite linear alternate; }
            .sun-glow { animation: sunPulse 5s infinite ease-in-out; transform-origin: 50px 50px; }
            .grass-blade { animation: grassSway 4s infinite ease-in-out; transform-origin: bottom center; }
          `}</style>
        </defs>

        <rect width="100%" height="100%" fill="url(#bgGrad)" />

        {/* Subtle Sun (Top right to avoid clashing with mascot) */}
        <svg x="72%" y="4%" width="120" height="120" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
          <circle cx="50" cy="50" r="28" fill="url(#sunGrad)" opacity="0.32" />
          <circle cx="50" cy="50" r="38" fill="#ffd166" opacity="0.06" />
        </svg>

        {/* Soft clouds (Sky Zone) */}
        <svg x="0" y="5%" width="100%" height="80" viewBox="0 0 800 80" preserveAspectRatio="none">
          <g fill="white" opacity="0.35" className="cloud-1">
            <circle cx="160" cy="40" r="24" />
            <circle cx="195" cy="40" r="32" />
            <circle cx="230" cy="40" r="24" />
          </g>
          <g fill="white" opacity="0.25" className="cloud-2">
            <circle cx="560" cy="50" r="18" />
            <circle cx="590" cy="50" r="26" />
            <circle cx="620" cy="50" r="18" />
          </g>
        </svg>



        {/* Swaying Tree Branch (Top Right Forest Zone) */}
        <svg x="65%" y="0" width="35%" height="180" viewBox="0 0 280 180" preserveAspectRatio="xMaxYMin meet">
          <g fill="#93c3b0" opacity="0.45" className="leaf-branch" transform="translate(280, 0)">
            <path d="M 0 0 C -60 20, -120 60, -150 135 C -120 135, -60 110, 0 80 Z" />
            <path d="M -45 25 C -105 50, -150 85, -180 160 C -150 160, -105 135, -45 100 Z" fill="#b0dfca" opacity="0.5" />
          </g>
        </svg>

        {/* Meadow/Hills, Reeds and Bubbles (Bottom Water/Savanna Zone) */}
        <svg x="0" y="72%" width="100%" height="28%" viewBox="0 0 800 160" preserveAspectRatio="none">
          {/* Savanna Grasslands/Meadow soft hills */}
          <path d="M 0 40 Q 200 10 400 55 T 800 25 L 800 160 L 0 160 Z" fill="#d8ecc5" opacity="0.45" />
          <path d="M 0 70 Q 300 95 500 55 T 800 80 L 800 160 L 0 160 Z" fill="#c3e4ad" opacity="0.55" />

          {/* Animated Grass Blades on Meadow */}
          <g fill="#aedb94" opacity="0.7">
            <path d="M 120 50 L 125 20 Q 128 17 131 20 L 129 50 Z" className="grass-blade" />
            <path d="M 340 65 L 346 30 Q 349 27 352 30 L 349 65 Z" className="grass-blade" style={{ animationDelay: '0.5s' }} />
            <path d="M 620 80 L 625 42 Q 628 39 631 42 L 629 80 Z" className="grass-blade" style={{ animationDelay: '1.2s' }} />
          </g>

          {/* Rising bubbles (Bottom Pond/Ocean Zone) */}
          <g fill="none" stroke="white" strokeWidth="1.5" opacity="0.45">
            <circle cx="120" cy="0" r="7" className="bubble-1" />
            <circle cx="260" cy="0" r="11" className="bubble-2" />
            <circle cx="200" cy="0" r="9" className="bubble-3" />
            <circle cx="620" cy="0" r="7" className="bubble-1" style={{ animationDelay: '1.5s' }} />
            <circle cx="680" cy="0" r="10" className="bubble-2" style={{ animationDelay: '0.8s' }} />
          </g>

          {/* Swaying Pond Reeds (Bottom Water Zone) */}
          <g fill="#379d8e" opacity="0.3">
            <path d="M 64 160 Q 88 80 64 -10 Q 40 80 64 160" className="leaf-branch" style={{ animationDelay: '0.8s', transformOrigin: '64px 160px' }} />
            <path d="M 128 160 Q 152 50 128 -30 Q 104 50 128 160" className="leaf-branch" style={{ animationDelay: '1.8s', transformOrigin: '128px 160px' }} />
            <path d="M 656 160 Q 632 70 656 -20 Q 680 70 656 160" className="leaf-branch" style={{ animationDelay: '0.4s', transformOrigin: '656px 160px' }} />
            <path d="M 720 160 Q 744 40 720 -60 Q 696 40 720 160" className="leaf-branch" style={{ animationDelay: '1.4s', transformOrigin: '720px 160px' }} />
          </g>
        </svg>
      </svg>

      {/* Header Row */}
      <div className="flex items-center justify-between w-full shrink-0 px-1 z-10">
        <ClayButton
          variant="surface"
          size="sm"
          onClick={() => {
            onBack();
          }}
        >
          <ArrowLeft size={24} strokeWidth={3.5} />
        </ClayButton>

        <span className="text-[10px] font-black uppercase tracking-wider text-[#0b4a45]/80 bg-white/70 px-4 py-1.5 rounded-full border border-white/40 shadow-sm shadow-black/02">
          ROUND {currentRoundIdx + 1}/{roundsList.length || 5}
        </span>
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
              <div className="w-20 h-20 rounded-full bg-[#3fa394] text-white flex items-center justify-center shadow-clay-mint mb-2">
                <Trophy size={44} className="text-white" />
              </div>
              <h2 className="text-3xl font-black text-[#0d4036] tracking-wide uppercase">Shelter Master!</h2>
              <p className="text-sm font-bold text-[#0d4036]/85 leading-relaxed">
                Super science skills! You know exactly where all the animals live. You earned the Shelter Master badge!
              </p>

              <ClayButton
                variant="primary"
                onClick={onBack}
                className="w-full py-4 text-lg font-black rounded-full mt-2 toddler-target flex items-center justify-center gap-2"
              >
                <span>Back to Map</span>
                <Trophy size={20} className="text-white" />
              </ClayButton>
            </ClayCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mascot Command at the top (under header) to make room for lower play area */}
      <div 
        onClick={() => currentQuestion && speakText(currentQuestion.questionText)}
        className="w-full max-w-xl flex items-center gap-3 mt-2 mb-2 cursor-pointer select-none active:scale-[0.99] transition-all shrink-0 z-10"
      >
        {/* Hovering Mascot SVG */}
        <div className="w-14 h-14 sm:w-18 sm:h-18 shrink-0 drop-shadow-md">
          <MascotSVG className="w-full h-full" />
        </div>
        
        {/* Speech Bubble */}
        <div className="flex-1 relative bg-white border border-[#4a5358]/10 p-2.5 sm:p-3 rounded-[1.8rem] shadow-[4px_4px_12px_rgba(0,0,0,0.03),_inset_2px_2px_4px_rgba(255,255,255,0.9)] text-left">
          {/* Bubble Tail */}
          <div className="absolute top-1/2 -left-3 -translate-y-1/2 w-0 h-0 border-t-[7px] border-t-transparent border-r-[11px] border-r-white border-b-[7px] border-b-transparent filter drop-shadow-[-1px_0_0_rgba(74,83,88,0.06)]"></div>
          
          <p className="text-[9px] font-black text-primary uppercase tracking-widest mb-0.5">
            Buddy says:
          </p>
          <h2 className="text-xs sm:text-sm font-black text-[#4A5358] tracking-tight uppercase flex items-center gap-1.5 flex-wrap">
            <span>Where does the</span>
            <span className="inline-flex items-center justify-center px-2 py-0.5 bg-[#d2f4e6] border border-white/20 rounded-xl text-[#0b4a45] font-black shadow-sm gap-1">
              {currentQuestion?.animal}
              <Volume2 className="w-3 h-3 ml-0.5 text-[#3fa394]" strokeWidth={3.5} />
            </span>
            <span>live?</span>
          </h2>
        </div>
      </div>

      {/* Main Content Container spaced evenly for perfect layout balance */}
      <div className="flex-grow w-full flex flex-col items-center justify-around py-4 sm:py-8 min-h-0 relative z-10">

        {/* 3 Shelters Above (Drop targets - no solid cards, just dashed drop zones) */}
        <div className="w-full grid grid-cols-3 gap-3 sm:gap-6 mt-1 shrink-0 relative">
          {choices.map((choice, idx) => {
            const isWrong = wrongSelections.includes(choice.name);
            const isCorrectState = gameState === "correct" && choice.name === currentQuestion?.correctShelter.name;
            
            return (
              <div
                key={choice.name}
                ref={idx === 0 ? zone0Ref : idx === 1 ? zone1Ref : zone2Ref}
                className={`flex flex-col items-center justify-center p-3 sm:p-5 rounded-[2.2rem] border-2 border-dashed border-[#4A5358]/25 bg-transparent transition-all min-h-[130px] sm:min-h-[170px] ${
                  isWrong ? "opacity-25 border-red-400 bg-red-500/5" : isCorrectState ? "border-emerald-400 bg-emerald-500/10 scale-105 shadow-[0_0_15px_rgba(52,211,153,0.15)]" : ""
                }`}
              >
                {/* Shelter Fluent Icon */}
                <div className="w-16 h-16 sm:w-24 sm:h-24 filter drop-shadow-[2px_3px_5px_rgba(0,0,0,0.06)] select-none flex items-center justify-center">
                  {renderShelterIcon(choice)}
                </div>
                {/* Shelter Label */}
                <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-slate-dark mt-2 select-none">
                  {choice.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Draggable Animal Drawer at the bottom */}
        <div className="w-full h-40 sm:h-48 flex items-center justify-center relative pb-2 shrink-0">
          <AnimatePresence mode="wait">
            {gameState === "playing" && (
              <motion.div
                key={`${currentQuestion?.animal}-${dragOffsetKey}`}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1.1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                className="relative cursor-grab active:cursor-grabbing toddler-target flex flex-col items-center justify-center"
                style={{ touchAction: "none" }}
                drag
                dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                dragElastic={0.9}
                dragMomentum={false}
                onDragEnd={handleDragEnd}
              >
                {/* Fluent Animal Icon */}
                <div className="w-28 h-28 sm:w-36 sm:h-36 filter drop-shadow-[4px_8px_12px_rgba(0,0,0,0.1)] select-none flex items-center justify-center">
                  {(() => {
                    const AnimalIcon = getAnimalIcon(currentQuestion?.animal || "");
                    return AnimalIcon ? <AnimalIcon size="100%" /> : <span className="text-7xl sm:text-8xl">{currentQuestion?.animalEmoji}</span>;
                  })()}
                </div>
                
                <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-[#4A5358]/80 mt-1 select-none">
                  {currentQuestion?.animal}
                </span>
              </motion.div>
            )}

            {/* Correct celebration display */}
            {gameState === "correct" && (
              <motion.div
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1.1, opacity: 1 }}
                exit={{ scale: 0.6 }}
                className="flex flex-col items-center justify-center animate-bounce"
              >
                {/* Fluent Animal Icon Celebrating */}
                <div className="w-28 h-28 sm:w-36 sm:h-36 filter drop-shadow-md select-none flex items-center justify-center">
                  {(() => {
                    const AnimalIcon = getAnimalIcon(currentQuestion?.animal || "");
                    return AnimalIcon ? <AnimalIcon size="100%" /> : <span className="text-7xl sm:text-8xl">{currentQuestion?.animalEmoji}</span>;
                  })()}
                </div>
                <span className="text-xs font-black uppercase text-[#3fa394] mt-1.5 select-none">Great Job!</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>

    </div>
  );
}
