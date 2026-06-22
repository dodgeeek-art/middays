"use client";

import React, { useState, useRef } from "react";
import { ArrowLeft, Grid } from "@/components/Icons";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import confetti from "canvas-confetti";
import { vocabularyList } from "@/lib/svgDictionary";
import ClayButton from "@/components/ui/ClayButton";
import ClayCard from "@/components/ui/ClayCard";

interface SortingItem {
  id: string;
  name: string;
  category: "red" | "blue" | "green" | "yellow" | "orange" | "purple" | "white" | "pink" | "brown" | "food" | "animal" | "farm" | "ocean";
  naturalColor?: string;
  icon: React.ComponentType<{ size?: string | number; className?: string }>;
}

interface BasketConfig {
  id: "red" | "blue" | "green" | "yellow" | "orange" | "purple" | "white" | "pink" | "brown" | "food" | "animal" | "farm" | "ocean";
  label: string;
  bg: string;
  border: string;
  text: string;
  glow: string;
}

interface SortingBasketEngineProps {
  childId: string;
  onBack: () => void;
}

const cardVariants = {
  idle: { x: 0, y: 0, scale: 1, rotate: 0, opacity: 1 },
  correct: {
    scale: [1, 1.15, 0.9, 1],
    rotate: [0, -5, 5, 0],
    opacity: 1,
    transition: { type: "tween" as const, duration: 0.6, ease: "easeInOut" as const }
  },
  incorrect: {
    x: [0, -8, 8, -6, 6, -4, 4, 0],
    opacity: 1,
    transition: { type: "tween" as const, duration: 0.5, ease: "easeInOut" as const }
  }
};

// Sound synth helper using Web Audio API
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

// Define color metadata to avoid duplicate styling configurations
const COLOR_METADATA: Record<
  "red" | "blue" | "green" | "yellow" | "orange" | "purple" | "white" | "pink" | "brown",
  { label: string; bg: string; border: string; text: string; glow: string }
> = {
  red: { label: "Red", bg: "bg-[#ffe5ec]", border: "border-[#ff4d6d]", text: "text-[#800f2f]", glow: "bg-[#ff4d6d]" },
  blue: { label: "Blue", bg: "bg-[#e0f2fe]", border: "border-[#0ea5e9]", text: "text-[#0369a1]", glow: "bg-[#0ea5e9]" },
  green: { label: "Green", bg: "bg-[#dcfce7]", border: "border-[#22c55e]", text: "text-[#15803d]", glow: "bg-[#22c55e]" },
  yellow: { label: "Yellow", bg: "bg-[#fef9c3]", border: "border-[#eab308]", text: "text-[#854d0e]", glow: "bg-[#eab308]" },
  orange: { label: "Orange", bg: "bg-[#ffedd5]", border: "border-[#f97316]", text: "text-[#c2410c]", glow: "bg-[#f97316]" },
  purple: { label: "Purple", bg: "bg-[#f3e8ff]", border: "border-[#a855f7]", text: "text-[#7e22ce]", glow: "bg-[#a855f7]" },
  white: { label: "White", bg: "bg-[#f8fafc]", border: "border-[#94a3b8]", text: "text-[#475569]", glow: "bg-[#cbd5e1]" },
  pink: { label: "Pink", bg: "bg-[#fce7f3]", border: "border-[#ec4899]", text: "text-[#be185d]", glow: "bg-[#ec4899]" },
  brown: { label: "Brown", bg: "bg-[#f5ebe0]", border: "border-[#a3704c]", text: "text-[#6f4e37]", glow: "bg-[#a3704c]" }
};

// Map vocabulary names to exact visual color categories
const colorMap: Record<string, "red" | "blue" | "green" | "yellow" | "orange" | "purple" | "white" | "pink" | "brown"> = {
  // Red
  Apple: "red",
  Strawberry: "red",
  Cherry: "red",
  Tomato: "red",
  Heart: "red",
  Crab: "red",
  Rose: "red",
  Tulip: "red",
  Cup: "red",
  Car: "red",
  Rocket: "red",
  Mushroom: "red",
  Balloon: "red",
  Drum: "red",
  Octopus: "red", // Mapped to Red (SVG is coral/red)

  // Blue
  Whale: "blue",
  Dolphin: "blue",
  Rain: "blue",
  Plane: "blue",
  Truck: "blue",
  Helicopter: "blue",
  "X-ray Fish": "blue",
  Ball: "blue",
  Hat: "blue",
  Fish: "blue", // Mapped to Blue (SVG is blue)
  Jellyfish: "blue", // Mapped to Blue (SVG is blue)

  // Green
  Frog: "green",
  Leaf: "green",
  Tree: "green",
  Pear: "green",
  Alligator: "green",
  Iguana: "green",
  Snake: "green",
  Turtle: "green",
  Watermelon: "green",

  // Yellow
  Sun: "yellow",
  Star: "yellow",
  Banana: "yellow",
  Sunflower: "yellow",
  Key: "yellow",
  Bell: "yellow",
  Bee: "yellow",
  Duck: "yellow",
  Crown: "yellow",
  Lemon: "yellow",
  Cheese: "yellow",
  Giraffe: "yellow",
  Lion: "yellow",
  Moon: "yellow",
  Bus: "yellow",
  Pizza: "yellow",

  // Orange
  Carrot: "orange",
  Cat: "orange",
  Fox: "orange",

  // Purple
  Grapes: "purple",
  Butterfly: "purple",
  Queen: "purple",
  Unicorn: "purple",
  Ninja: "purple", // Mapped to Purple (SVG is dark purple)

  // White (includes Grey/Black & White)
  Snowman: "white",
  Shell: "white",
  Egg: "white",
  Panda: "white",
  Cloud: "white",
  Chicken: "white",
  Elephant: "white",
  Koala: "white",
  Zebra: "white",
  Penguin: "white",
  Rabbit: "white",
  Hippo: "white", // Mapped to White (SVG is grey)

  // Pink
  Pig: "pink",
  Cake: "pink",
  Donut: "pink",
  "Ice Cream": "pink",

  // Brown
  Bear: "brown",
  Dog: "brown",
  Monkey: "brown",
  Owl: "brown",
  Yak: "brown",
  Cookie: "brown",
  House: "brown",
  Guitar: "brown",
  Hamburger: "brown"
};

// General Level configuration generator
const getItemsForLevel = (level: number): { items: SortingItem[]; baskets: BasketConfig[] } => {
  if (level === 1) {
    const baskets: BasketConfig[] = [
      { id: "red", ...COLOR_METADATA.red },
      { id: "blue", ...COLOR_METADATA.blue },
      { id: "green", ...COLOR_METADATA.green },
      { id: "yellow", ...COLOR_METADATA.yellow },
      { id: "orange", ...COLOR_METADATA.orange },
      { id: "purple", ...COLOR_METADATA.purple },
      { id: "white", ...COLOR_METADATA.white },
      { id: "pink", ...COLOR_METADATA.pink },
      { id: "brown", ...COLOR_METADATA.brown }
    ];

    const items: SortingItem[] = [];
    vocabularyList.forEach(v => {
      const colorCategory = colorMap[v.name];
      if (colorCategory) {
        items.push({
          id: `color-${v.name}-${Math.random()}`,
          name: v.name,
          category: colorCategory,
          naturalColor: colorCategory,
          icon: v.icon
        });
      }
    });

    // Take 10 random items for this round
    const shuffled = items.sort(() => Math.random() - 0.5).slice(0, 10);

    return {
      items: shuffled,
      baskets
    };
  } else if (level === 2) {
    const baskets: BasketConfig[] = [
      { id: "food", label: "Yummy Food", bg: "bg-[#fef9c3]", border: "border-[#ca8a04]", text: "text-[#854d0e]", glow: "bg-[#eab308]" },
      { id: "animal", label: "Cute Animals", bg: "bg-[#dcfce7]", border: "border-[#16a34a]", text: "text-[#14532d]", glow: "bg-[#22c55e]" }
    ];

    const foodItems: SortingItem[] = [];
    const animalItems: SortingItem[] = [];
    
    const foodNames = ["Apple", "Banana", "Grapes", "Watermelon", "Strawberry", "Cherry", "Carrot", "Cake", "Cookie", "Donut", "Pizza", "Ice Cream", "Cheese", "Hamburger", "Tomato", "Lemon", "Pear"];
    const animalNames = ["Alligator", "Bear", "Cat", "Dog", "Elephant", "Fox", "Giraffe", "Hippo", "Iguana", "Jellyfish", "Koala", "Lion", "Monkey", "Pig", "Rabbit", "Snake", "Turtle", "Unicorn", "Whale", "Zebra", "Panda", "Penguin", "Dolphin", "Octopus", "Crab", "Fish", "Duck", "Chicken", "Frog", "Bee", "Butterfly"];
    
    vocabularyList.forEach(v => {
      if (foodNames.includes(v.name)) {
        foodItems.push({ id: `food-${v.name}-${Math.random()}`, name: v.name, category: "food", icon: v.icon });
      } else if (animalNames.includes(v.name)) {
        animalItems.push({ id: `animal-${v.name}-${Math.random()}`, name: v.name, category: "animal", icon: v.icon });
      }
    });

    const combined = [
      ...foodItems.sort(() => Math.random() - 0.5).slice(0, 5),
      ...animalItems.sort(() => Math.random() - 0.5).slice(0, 5)
    ];

    return {
      items: combined.sort(() => Math.random() - 0.5),
      baskets
    };
  } else {
    const baskets: BasketConfig[] = [
      { id: "farm", label: "Farm Animals", bg: "bg-[#fef2f2]", border: "border-[#ef4444]", text: "text-[#991b1b]", glow: "bg-[#ef4444]" },
      { id: "ocean", label: "Ocean Animals", bg: "bg-[#f0f9ff]", border: "border-[#06b6d4]", text: "text-[#155e75]", glow: "bg-[#06b6d4]" }
    ];

    const farmNames = ["Cat", "Dog", "Pig", "Rabbit", "Duck", "Chicken", "Cow", "Sheep", "Horse"];
    const oceanNames = ["Whale", "Dolphin", "Octopus", "Crab", "Fish", "Turtle", "Shell", "Shark", "Seahorse"];
    
    const farmItems: SortingItem[] = [];
    const oceanItems: SortingItem[] = [];
    
    vocabularyList.forEach(v => {
      if (farmNames.includes(v.name)) {
        farmItems.push({ id: `farm-${v.name}-${Math.random()}`, name: v.name, category: "farm", icon: v.icon });
      } else if (oceanNames.includes(v.name)) {
        oceanItems.push({ id: `ocean-${v.name}-${Math.random()}`, name: v.name, category: "ocean", icon: v.icon });
      }
    });

    const combined = [
      ...farmItems.sort(() => Math.random() - 0.5).slice(0, 5),
      ...oceanItems.sort(() => Math.random() - 0.5).slice(0, 5)
    ];

    return {
      items: combined.sort(() => Math.random() - 0.5),
      baskets
    };
  }
};

const getParentPromptForLevel = (level: number, currentItem: string): string => {
  if (level === 1) {
    return `Ask your child: "What color is the ${currentItem}? Can you find other things in this room that are the same color?"`;
  } else if (level === 2) {
    return `Ask your child: "Is the ${currentItem} something we eat or a friendly animal?"`;
  } else {
    return `Ask your child: "Does the ${currentItem} live on a farm or swim in the deep blue ocean?"`;
  }
};

export default function SortingBasketEngine({ childId, onBack }: SortingBasketEngineProps) {
  const [level, setLevel] = useState(1);
  const [items, setItems] = useState<SortingItem[]>(() => getItemsForLevel(1).items);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [baskets, setBaskets] = useState<BasketConfig[]>(() => getItemsForLevel(1).baskets);
  
  // Scoring & Stats
  const [errorsThisRound, setErrorsThisRound] = useState(0);
  const [startTime] = useState<number>(() => Date.now());
  const [feedbackState, setFeedbackState] = useState<"idle" | "correct" | "incorrect">("idle");
  const [successScreen, setSuccessScreen] = useState(false);

  // Drag reset helper
  const [dragOffsetKey, setDragOffsetKey] = useState(0);

  // Dynamic references array for baskets
  const basketRefs = useRef<(HTMLDivElement | null)[]>([]);

  const currentItem = items[currentIndex];

  const speakItem = (name: string) => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(name);
      utterance.rate = 0.85;
      utterance.pitch = 1.2;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (!currentItem || feedbackState !== "idle") return;

    const dragX = info.point.x;
    const dragY = info.point.y;

    let matchedBasketIdx: number | null = null;

    // Scan all active baskets to check if dropped inside
    for (let i = 0; i < baskets.length; i++) {
      const rect = basketRefs.current[i]?.getBoundingClientRect();
      if (rect && dragX >= rect.left && dragX <= rect.right && dragY >= rect.top && dragY <= rect.bottom) {
        matchedBasketIdx = i;
        break;
      }
    }

    if (matchedBasketIdx === null) {
      setDragOffsetKey(prev => prev + 1);
      return;
    }

    const selectedBasket = baskets[matchedBasketIdx];
    const isCorrect = currentItem.category === selectedBasket.id;

    if (isCorrect) {
      handleCorrectMatch();
    } else {
      handleIncorrectMatch();
    }
  };

  const handleCorrectMatch = () => {
    setFeedbackState("correct");
    playSynthesizedSound("correct");
    speakItem(currentItem.name);

    confetti({
      particleCount: 50,
      spread: 45,
      origin: { y: 0.75 },
      colors: ["#ffc4c0", "#a2ea63", "#ddcbf5", "#ffffff"]
    });

    setTimeout(() => {
      if (currentIndex < items.length - 1) {
        setCurrentIndex(prev => prev + 1);
        setFeedbackState("idle");
      } else {
        handleLevelComplete();
      }
    }, 1400);
  };

  const handleIncorrectMatch = () => {
    setFeedbackState("incorrect");
    playSynthesizedSound("wrong");
    setErrorsThisRound(prev => prev + 1);

    setTimeout(() => {
      setFeedbackState("idle");
      setDragOffsetKey(prev => prev + 1);
    }, 800);
  };

  const handleLevelComplete = async () => {
    playSynthesizedSound("levelUp");
    
    // Save telemetry to backend API
    const elapsed = Date.now() - startTime;
    if (childId) {
      try {
        await fetch(`/api/progress/${childId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            targetLetter: `LVL${level}`,
            tracingScore: Math.max(0, 100 - errorsThisRound * 20),
            phonemicScore: 100,
            timeSpentMs: elapsed
          })
        });

        await fetch(`/api/badges/${childId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            badgeName: `Sorting Master Level ${level}`
          })
        });
      } catch (err) {
        console.error("Telemetry failed:", err);
      }
    }

    setSuccessScreen(true);
  };

  const advanceLevel = () => {
    playSynthesizedSound("click");
    if (level < 3) {
      const nextLevel = level + 1;
      setLevel(nextLevel);
      const config = getItemsForLevel(nextLevel);
      setItems(config.items);
      setBaskets(config.baskets);
      setCurrentIndex(0);
      setFeedbackState("idle");
      setSuccessScreen(false);
    } else {
      onBack();
    }
  };

  const activeParentPrompt = currentItem ? getParentPromptForLevel(level, currentItem.name) : "";
  const activeGlow = baskets.find(b => b.id === currentItem?.category)?.glow || "bg-[#ffd166]";

  return (
    <div className="flex flex-col w-full max-w-4xl mx-auto h-full min-h-0 bg-[#e2efe9] p-4 rounded-[2.5rem] border-[3px] border-white/50 shadow-clay-card relative overflow-hidden select-none">
      
      {/* Background blobs specific to Sorting game */}
      <div className="absolute -z-10 bg-[#bee8d4] w-64 h-64 rounded-full blur-[80px] opacity-40 -top-10 -right-10"></div>
      
      {/* Header bar */}
      <div className="flex items-center justify-between gap-2 mb-3 shrink-0">
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

        {/* Integrated Progress Dots Container - Acts as the centered layout element */}
        <div className="bg-white/85 border-2 border-white/40 shadow-[inset_-2px_-2px_4px_rgba(0,0,0,0.02),_inset_2px_2px_4px_rgba(255,255,255,0.85)] px-4 py-2 rounded-[1.5rem] flex gap-1.5 items-center justify-center min-h-[46px] shadow-sm">
          {items.map((_, idx) => (
            <div
              key={idx}
              className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full border border-white/85 transition-all duration-300 ${
                idx === currentIndex
                  ? "bg-[#3fa394] scale-125 shadow-[0_0_8px_#3fa394]"
                  : idx < currentIndex
                  ? "bg-[#bee8d4]"
                  : "bg-[#e2efe9]"
              }`}
            />
          ))}
        </div>

        <div className="bg-white/85 border-2 border-white/40 shadow-[inset_-2px_-2px_4px_rgba(0,0,0,0.02),_inset_2px_2px_4px_rgba(255,255,255,0.85)] px-4 py-2.5 rounded-[1.5rem] font-black text-[#3fa394] text-xs sm:text-sm tracking-wide shadow-sm shrink-0">
          LEVEL {level}/3
        </div>
      </div>

      {/* Parental Co-Play Banner */}
      <div className="bg-[#ddcbf5]/85 border-2 border-white/45 text-[#42236b] px-3.5 py-2.5 rounded-[1.8rem] mb-3 text-center font-bold text-xs sm:text-sm shadow-[inset_-2px_-2px_4px_rgba(0,0,0,0.02),_inset_2px_2px_4px_rgba(255,255,255,0.85)] leading-snug shrink-0">
        <span className="text-[9px] font-black uppercase tracking-wider text-[#7c52c7] block mb-0.5">🧑‍🍼 Parent & Child Co-Play Option</span>
        {activeParentPrompt}
      </div>

      {/* Success Completion Overlay */}
      <AnimatePresence>
        {successScreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-40 bg-black/40 backdrop-blur-md flex items-center justify-center p-6"
          >
            <ClayCard
              variant="secondary"
              className="max-w-md w-full p-8 text-center flex flex-col items-center gap-6 border-white/40"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
            >
              <div className="w-20 h-20 rounded-full bg-[#a2ea63] text-white text-4xl flex items-center justify-center shadow-clay-mint mb-2">
                🎉
              </div>
              <h2 className="text-3xl font-black text-[#0d4036] tracking-wide uppercase">Level {level} Complete!</h2>
              <p className="text-sm font-bold text-[#0d4036]/80 leading-relaxed">
                Super sorting! You sorted all items perfectly. Keep exploring and learning together!
              </p>

              <ClayButton
                variant="primary"
                onClick={advanceLevel}
                className="w-full py-4 text-lg font-black rounded-full mt-2 toddler-target"
              >
                {level < 3 ? "Next Level ➡️" : "Finish Game 🏆"}
              </ClayButton>
            </ClayCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main play space */}
      <div className="flex-grow flex flex-col justify-between min-h-0 relative z-10">
        


        {/* Drag Staging Center */}
        <div className="flex-grow flex items-center justify-center relative min-h-0">
          <AnimatePresence mode="wait">
            {currentItem && !successScreen && (
              <motion.div
                key={`${currentItem.id}-${dragOffsetKey}`}
                initial={{ scale: 0.3, opacity: 0, y: -20 }}
                animate={feedbackState === "correct" ? "correct" : feedbackState === "incorrect" ? "incorrect" : "idle"}
                exit={{ scale: 0, opacity: 0, y: 50 }}
                variants={cardVariants}
                transition={{ type: "spring", stiffness: 300, damping: 18 }}
                className="relative z-20 select-none"
              >
                {/* Visual Glow rings matching target color */}
                <div className={`absolute inset-0 rounded-[2rem] filter blur-xl opacity-35 scale-110 -z-10 ${activeGlow}`} />

                <motion.div
                  drag
                  dragSnapToOrigin={true}
                  dragElastic={0.65}
                  onDragEnd={handleDragEnd}
                  whileDrag={{ scale: 1.15, rotate: 2 }}
                  className={`w-36 h-36 flex flex-col items-center justify-center p-4 bg-white rounded-[2.5rem] border-[4px] shadow-clay-card select-none cursor-grab active:cursor-grabbing toddler-target transition-colors duration-200 ${
                    feedbackState === "correct" ? "border-emerald-400 bg-emerald-50/80 pointer-events-none" : 
                    feedbackState === "incorrect" ? "border-rose-400 bg-rose-50/80 pointer-events-none" : "border-white/60"
                  }`}
                  style={{ touchAction: "none" }}
                >
                  <currentItem.icon size={80} className="select-none pointer-events-none filter drop-shadow-[2px_3px_4px_rgba(0,0,0,0.06)]" />
                  <span className="text-[11px] font-black tracking-wide uppercase text-slate-dark mt-2 select-none pointer-events-none">
                    {currentItem.name}
                  </span>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Drop Baskets (Drop zones) */}
        <div className={`grid gap-2 sm:gap-3 mt-4 shrink-0 pb-2 ${
          level === 1 
            ? "grid-cols-3 sm:grid-cols-5 md:grid-cols-9" 
            : "grid-cols-2"
        }`}>
          {baskets.map((basket, idx) => (
            <div
              key={basket.id}
              ref={el => { basketRefs.current[idx] = el; }}
              className={`p-2.5 sm:p-4 rounded-[1.75rem] border-[3px] transition-all duration-300 flex flex-col items-center justify-center min-h-[62px] sm:min-h-[76px] relative select-none shadow-clay-card hover:scale-[1.03] active:scale-[0.98] ${
                basket.bg
              } ${basket.border} ${basket.text}`}
            >
              <div className="absolute inset-1 rounded-[1.4rem] border-2 border-white/40 pointer-events-none" />
              
              <h3 className="font-black text-[10px] sm:text-xs md:text-sm uppercase tracking-wider text-center leading-tight select-none pointer-events-none">
                {basket.label}
              </h3>
            </div>
          ))}
        </div>

      </div>

    </div>
  );
}
