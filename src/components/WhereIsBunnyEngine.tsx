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
const OceanIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 100 100" {...props}>
    <path d="M10 60 Q25 45 40 60 T70 60 T100 60 L100 90 L10 90 Z" fill="#4ecdc4" />
    <path d="M0 70 Q15 60 30 70 T60 70 T90 70 L90 90 L0 90 Z" fill="#3fa394" opacity="0.8" />
    <circle cx="25" cy="40" r="3" fill="#e2f5ee" />
    <circle cx="55" cy="45" r="2.5" fill="#e2f5ee" />
    <circle cx="85" cy="40" r="3" fill="#e2f5ee" />
  </svg>
);

const BeehiveIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 100 100" {...props}>
    <path d="M10 20 L90 20" stroke="#b08968" strokeWidth="6" strokeLinecap="round" />
    <path d="M30 20 C30 65 70 65 70 20 Z" fill="#ffd166" stroke="#ebd787" strokeWidth="3" />
    <circle cx="50" cy="30" r="8" fill="#ffd166" stroke="#ebd787" strokeWidth="2" />
    <circle cx="50" cy="42" r="10" fill="#ffd166" stroke="#ebd787" strokeWidth="2" />
    <circle cx="50" cy="42" r="4" fill="#3c0066" />
    <circle cx="75" cy="50" r="5" fill="#ffd166" />
    <path d="M72 48 L78 48" stroke="#000" strokeWidth="1.5" />
  </svg>
);

const NestIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 100 100" {...props}>
    <ellipse cx="50" cy="65" rx="35" ry="18" fill="#b08968" stroke="#8b5a2b" strokeWidth="3" />
    <ellipse cx="50" cy="58" rx="28" ry="12" fill="#4e3526" />
    <path d="M20 60 Q35 70 50 62 T80 60" stroke="#8b5a2b" strokeWidth="2.5" fill="none" />
    <path d="M15 65 L85 65" stroke="#4e3526" strokeWidth="2" fill="none" />
    <ellipse cx="40" cy="52" rx="7" ry="10" fill="#c3e6dc" transform="rotate(-15 40 52)" />
    <ellipse cx="50" cy="50" rx="7" ry="10" fill="#fff9e6" />
    <ellipse cx="60" cy="52" rx="7" ry="10" fill="#fcd5ce" transform="rotate(15 60 52)" />
  </svg>
);

const CaveIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 100 100" {...props}>
    <path d="M15 85 C10 40 30 15 50 15 C70 15 90 40 85 85 Z" fill="#b0b0b0" stroke="#8a8a8a" strokeWidth="3" />
    <path d="M30 85 C25 55 40 35 50 35 C60 35 75 55 70 85 Z" fill="#4a4a4a" />
    <circle cx="20" cy="30" r="10" fill="#d5d5d5" />
    <circle cx="80" cy="35" r="12" fill="#d5d5d5" />
  </svg>
);

const BarnIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 100 100" {...props}>
    <rect x="20" y="45" width="60" height="40" fill="#e07383" stroke="#b94b58" strokeWidth="3" rx="4" />
    <path d="M15 45 L50 15 L85 45 Z" fill="#b94b58" stroke="#8e2e38" strokeWidth="3" strokeLinejoin="round" />
    <rect x="40" y="60" width="20" height="25" fill="#fff" stroke="#b94b58" strokeWidth="2" />
    <path d="M40 60 L60 85" stroke="#b94b58" strokeWidth="2" />
    <path d="M60 60 L40 85" stroke="#b94b58" strokeWidth="2" />
  </svg>
);

const PondIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 100 100" {...props}>
    <ellipse cx="50" cy="65" rx="40" ry="20" fill="#bee8d4" stroke="#3fa394" strokeWidth="3" />
    <path d="M28 62 C23 60 20 65 25 70 C30 75 40 70 38 65 Z" fill="#38b000" />
    <ellipse cx="55" cy="60" rx="10" ry="3" fill="#fff" opacity="0.5" />
  </svg>
);

const WebIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 100 100" {...props}>
    <g stroke="#b0b0b0" strokeWidth="2.5" fill="none">
      <line x1="10" y1="10" x2="90" y2="90" />
      <line x1="90" y1="10" x2="10" y2="90" />
      <line x1="50" y1="10" x2="50" y2="90" />
      <line x1="10" y1="50" x2="90" y2="50" />
      <circle cx="50" cy="50" r="15" />
      <circle cx="50" cy="50" r="30" />
      <circle cx="50" cy="50" r="42" />
    </g>
  </svg>
);

const SavannaIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 100 100" {...props}>
    <circle cx="50" cy="40" r="20" fill="#ffd166" opacity="0.8" />
    <path d="M10 90 L20 70 L30 90 L40 65 L50 90 L60 70 L70 90 L80 65 L90 90 Z" fill="#e0c11b" stroke="#b08968" strokeWidth="2" />
  </svg>
);

const DryLog = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 100 100" {...props}>
    <rect x="20" y="35" width="60" height="30" rx="8" fill="#8b5a2b" stroke="#4e3526" strokeWidth="4" />
    <ellipse cx="20" cy="50" rx="6" ry="15" fill="#cd853f" stroke="#4e3526" strokeWidth="3" />
    <ellipse cx="20" cy="50" rx="2" ry="5" fill="#8b5a2b" />
    <ellipse cx="80" cy="50" rx="6" ry="15" fill="#cd853f" stroke="#4e3526" strokeWidth="3" />
    <ellipse cx="80" cy="50" rx="2" ry="5" fill="#8b5a2b" />
    <path d="M35 45 L65 45" stroke="#4e3526" strokeWidth="3" strokeLinecap="round" />
    <path d="M40 55 L60 55" stroke="#4e3526" strokeWidth="3" strokeLinecap="round" />
    <path d="M50 35 Q40 20 48 10 Q54 20 50 35" fill="#38b000" />
    <path d="M50 35 Q60 25 56 18 Q52 26 50 35" fill="#38b000" opacity="0.8" />
  </svg>
);

const Bird = (props: React.SVGProps<SVGSVGElement>) => (
  <CartoonSVG animClass="anim-float" {...props}>
    <g fill="none">
      <circle cx="16" cy="18" r="9" fill="#FFD166" />
      <circle cx="12" cy="19" r="2.5" fill="#FFB02E" opacity="0.6" />
      <circle cx="20" cy="15" r="1.2" fill="#1C1C1C" />
      <path d="M24 14 L28 16 L24 18 Z" fill="#FF822D" />
      <ellipse cx="12" cy="19" rx="5" ry="3.5" fill="#FFB02E" transform="rotate(-15 12 19)" />
      <path d="M7 18 L3 16 L4 21 Z" fill="#FFB02E" />
    </g>
  </CartoonSVG>
);

const Spider = (props: React.SVGProps<SVGSVGElement>) => (
  <CartoonSVG animClass="anim-sway" {...props}>
    <g fill="none">
      <path d="M10 14 Q6 10 8 6" stroke="#4A5358" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M9 17 Q4 15 6 11" stroke="#4A5358" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M9 20 Q4 21 6 25" stroke="#4A5358" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M10 23 Q6 27 8 30" stroke="#4A5358" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M22 14 Q26 10 24 6" stroke="#4A5358" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M23 17 Q28 15 26 11" stroke="#4A5358" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M23 20 Q28 21 26 25" stroke="#4A5358" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M22 23 Q26 27 24 30" stroke="#4A5358" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="16" cy="18" r="8" fill="#321B41" />
      <circle cx="13" cy="16" r="2.5" fill="#FFFFFF" />
      <circle cx="13" cy="16" r="1.2" fill="#1C1C1C" />
      <circle cx="19" cy="16" r="2.5" fill="#FFFFFF" />
      <circle cx="19" cy="16" r="1.2" fill="#1C1C1C" />
      <path d="M14 21 Q16 23 18 21" stroke="#FFFFFF" strokeWidth="1" strokeLinecap="round" />
    </g>
  </CartoonSVG>
);

const Squirrel = (props: React.SVGProps<SVGSVGElement>) => (
  <CartoonSVG animClass="anim-breathe" {...props}>
    <g fill="none">
      <path d="M11 23 C6 23 5 13 9 9 C13 5 19 6 20 10 C21 13 18 17 14 19 Z" fill="#D3883E" />
      <path d="M11 21 C8 21 7 14 10 11 C13 8 17 8 18 11 C19 13 17 16 13 17 Z" fill="#FFDEA7" opacity="0.4" />
      <ellipse cx="13" cy="20" rx="6" ry="7" fill="#A56953" />
      <circle cx="16" cy="13" r="5" fill="#A56953" />
      <path d="M13 9 L15 5 L16 9 Z" fill="#8C5543" />
      <path d="M17 9 L19 5 L20 9 Z" fill="#8C5543" />
      <circle cx="18" cy="12" r="1" fill="#1C1C1C" />
      <circle cx="16" cy="14.5" r="1.5" fill="#FFDEA7" />
      <circle cx="14" cy="18.5" r="2" fill="#D3883E" />
      <circle cx="12" cy="20" r="1.2" fill="#8C5543" />
      <circle cx="15" cy="20" r="1.2" fill="#8C5543" />
    </g>
  </CartoonSVG>
);

// Helpers to lookup Fluent icons
const getAnimalIcon = (name: string): React.FC<any> | null => {
  const lowerName = name.toLowerCase();
  if (lowerName === "squirrel") return Squirrel;
  if (lowerName === "spider") return Spider;
  if (lowerName === "bird") return Bird;

  const item = vocabularyList.find(v => v.name.toLowerCase() === lowerName);
  return item ? item.icon : null;
};

const renderShelterIcon = (choice: ShelterItem, className?: string) => {
  const name = choice.name.toLowerCase();
  const props = { className: className || "w-full h-full" };

  if (name === "tree") {
    const TreeComp = getAnimalIcon("Tree");
    return TreeComp ? React.createElement(TreeComp, props) : null;
  }
  if (name === "doghouse" || name === "house") {
    const HouseComp = getAnimalIcon("House");
    return HouseComp ? React.createElement(HouseComp, props) : null;
  }
  if (name === "ocean") return <OceanIcon {...props} />;
  if (name === "beehive") return <BeehiveIcon {...props} />;
  if (name === "nest") return <NestIcon {...props} />;
  if (name === "cave") return <CaveIcon {...props} />;
  if (name === "barn") return <BarnIcon {...props} />;
  if (name === "pond") return <PondIcon {...props} />;
  if (name === "web") return <WebIcon {...props} />;
  if (name === "savanna") return <SavannaIcon {...props} />;
  if (name === "dry log" || name === "log") return <DryLog {...props} />;

  return <span className="text-5xl sm:text-6xl">{choice.emoji}</span>;
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

        {/* Pulsing Sun (Top right to avoid clashing with mascot) */}
        <svg x="72%" y="4%" width="120" height="120" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
          <circle cx="50" cy="50" r="30" fill="url(#sunGrad)" opacity="0.9" className="sun-glow" />
          <circle cx="50" cy="50" r="45" fill="#ffd166" opacity="0.15" className="sun-glow" />
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

        {/* Rocky Cave silhouette (Middle Left Zone) */}
        <svg x="0" y="28%" width="90" height="200" viewBox="0 0 90 200" preserveAspectRatio="xMinYMid meet">
          <path d="M 0 0 Q 60 30 70 100 T 0 200 Z" fill="url(#caveGrad)" opacity="0.45" />
          <path d="M 0 30 Q 40 60 48 115 T 0 170 Z" fill="#958c7f" opacity="0.3" />
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

      {/* Main Content Container pushed down for mobile reachability */}
      <div className="flex-grow w-full flex flex-col items-center justify-end gap-3 sm:gap-6 pb-2 sm:pb-4 min-h-0 relative z-10">

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
        <div className="w-full h-32 sm:h-40 flex items-center justify-center relative pb-2 shrink-0">
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
                {/* Drag instruction ring/highlight */}
                <div className="absolute w-24 h-24 rounded-full bg-white/40 border border-white/60 filter blur-sm scale-110 -z-10 shadow-sm" />
                
                {/* Fluent Animal Icon */}
                <div className="w-20 h-20 sm:w-24 sm:h-24 filter drop-shadow-[4px_8px_12px_rgba(0,0,0,0.1)] select-none flex items-center justify-center">
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
                <div className="w-20 h-20 sm:w-24 sm:h-24 filter drop-shadow-md select-none flex items-center justify-center">
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
