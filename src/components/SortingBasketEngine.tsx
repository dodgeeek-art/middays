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
  category: "food" | "animal" | "vehicle" | "red" | "blue" | "farm" | "ocean";
  naturalColor?: "red" | "blue";
  icon: React.ComponentType<{ size?: string | number; className?: string }>;
}

interface SortingBasketEngineProps {
  childId: string;
  onBack: () => void;
}

// Sound synth helper using Web Audio API
const playSynthesizedSound = (type: "correct" | "wrong" | "levelUp" | "click") => {
  if (typeof window === "undefined") return;
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    
    if (type === "correct") {
      // Gentle double chime (marimba style)
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
      // Soft boing sound
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
      // Happy ascending arpeggio
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

// Vocabulary mappings for levels
const getItemsForLevel = (level: number): { items: SortingItem[]; containerA: string; containerB: string } => {
  if (level === 1) {
    // Red vs Blue
    const redVocabs = ["Apple", "Strawberry", "Cherry", "Tomato", "Heart", "Crab"];
    const blueVocabs = ["Whale", "Dolphin", "Rain", "Cloud", "Shell", "Snowman"];
    
    const items: SortingItem[] = [];
    vocabularyList.forEach(v => {
      if (redVocabs.includes(v.name)) {
        items.push({ id: `red-${v.name}-${Math.random()}`, name: v.name, category: "red", naturalColor: "red", icon: v.icon });
      } else if (blueVocabs.includes(v.name)) {
        items.push({ id: `blue-${v.name}-${Math.random()}`, name: v.name, category: "blue", naturalColor: "blue", icon: v.icon });
      }
    });

    return {
      items: items.sort(() => Math.random() - 0.5),
      containerA: "Red Basket",
      containerB: "Blue Basket"
    };
  } else if (level === 2) {
    // Food vs Animals
    const foodItems: SortingItem[] = [];
    const animalItems: SortingItem[] = [];
    
    // Categorize existing vocabularyList
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
      containerA: "Yummy Food",
      containerB: "Cute Animals"
    };
  } else {
    // Farm vs Ocean animals
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
      containerA: "Farm Animals",
      containerB: "Ocean Animals"
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
  const [containerA, setContainerA] = useState(() => getItemsForLevel(1).containerA);
  const [containerB, setContainerB] = useState(() => getItemsForLevel(1).containerB);
  
  // Scoring & Stats
  const [errorsThisRound, setErrorsThisRound] = useState(0);
  const [startTime] = useState<number>(() => Date.now());
  const [feedbackState, setFeedbackState] = useState<"idle" | "correct" | "incorrect">("idle");
  const [successScreen, setSuccessScreen] = useState(false);

  // Drag reset helper
  const [dragOffsetKey, setDragOffsetKey] = useState(0);

  // Dropzone refs for bounding rect validation
  const containerARef = useRef<HTMLDivElement>(null);
  const containerBRef = useRef<HTMLDivElement>(null);

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

    const rectA = containerARef.current?.getBoundingClientRect();
    const rectB = containerBRef.current?.getBoundingClientRect();

    let matchedContainer: "A" | "B" | null = null;

    if (rectA && dragX >= rectA.left && dragX <= rectA.right && dragY >= rectA.top && dragY <= rectA.bottom) {
      matchedContainer = "A";
    } else if (rectB && dragX >= rectB.left && dragX <= rectB.right && dragY >= rectB.top && dragY <= rectB.bottom) {
      matchedContainer = "B";
    }

    if (!matchedContainer) {
      // Snaps back automatically since coordinates aren't updated
      setDragOffsetKey(prev => prev + 1);
      return;
    }

    // Determine correct container matching
    let isCorrect = false;
    const cat = currentItem.category;

    if (level === 1) {
      // A = red, B = blue
      isCorrect = (matchedContainer === "A" && cat === "red") || (matchedContainer === "B" && cat === "blue");
    } else if (level === 2) {
      // A = food, B = animal
      isCorrect = (matchedContainer === "A" && cat === "food") || (matchedContainer === "B" && cat === "animal");
    } else {
      // A = farm, B = ocean
      isCorrect = (matchedContainer === "A" && cat === "farm") || (matchedContainer === "B" && cat === "ocean");
    }

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
        // level completed!
        handleLevelComplete();
      }
    }, 1500);
  };

  const handleIncorrectMatch = () => {
    setFeedbackState("incorrect");
    playSynthesizedSound("wrong");
    setErrorsThisRound(prev => prev + 1);

    // Errorless learning: glide back after brief wiggle
    setTimeout(() => {
      setFeedbackState("idle");
      setDragOffsetKey(prev => prev + 1); // trigger component key re-mount to smoothly reset offset
    }, 1000);
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
      setContainerA(config.containerA);
      setContainerB(config.containerB);
      setCurrentIndex(0);
      setFeedbackState("idle");
      setSuccessScreen(false);
    } else {
      // Game completely finished, return to menu
      onBack();
    }
  };

  const activeParentPrompt = currentItem ? getParentPromptForLevel(level, currentItem.name) : "";

  return (
    <div className="flex flex-col w-full max-w-4xl mx-auto h-full min-h-0 bg-[#e2efe9] p-4 rounded-[2.5rem] border-[3px] border-white/50 shadow-clay-card relative overflow-hidden select-none">
      
      {/* Background blobs specific to Sorting game */}
      <div className="absolute -z-10 bg-[#bee8d4] w-64 h-64 rounded-full blur-[80px] opacity-40 -top-10 -right-10"></div>
      
      {/* Header bar */}
      <div className="flex items-center justify-between mb-4 shrink-0">
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
          <Grid size={24} className="text-[#3fa394]" strokeWidth={3.5} />
          Sorting Basket
        </h1>

        <div className="bg-white/80 border-2 border-white/40 shadow-inner px-4 py-2 rounded-full font-black text-[#3fa394] text-sm tracking-wide">
          LEVEL {level}/3
        </div>
      </div>

      {/* Parental Co-Play Banner (Technoference mitigation) */}
      <div className="bg-[#ddcbf5]/80 border-2 border-white/50 text-[#42236b] p-3 rounded-2xl mb-4 text-center font-bold text-xs sm:text-sm shadow-[inset_-2px_-2px_4px_rgba(0,0,0,0.02),_inset_2px_2px_4px_rgba(255,255,255,0.8)] leading-snug shrink-0">
        <span className="text-[10px] font-black uppercase tracking-wider text-[#7c52c7] block mb-0.5">🧑‍🍼 Parent & Child Co-Play Option</span>
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
        
        {/* Progress Dots */}
        <div className="flex justify-center gap-2 mb-4 shrink-0">
          {items.map((_, idx) => (
            <div
              key={idx}
              className={`w-3.5 h-3.5 rounded-full border-[1.5px] border-white transition-all duration-300 ${
                idx === currentIndex
                  ? "bg-[#3fa394] scale-125 shadow-[0_0_8px_#3fa394]"
                  : idx < currentIndex
                  ? "bg-[#bee8d4]"
                  : "bg-white/40"
              }`}
            />
          ))}
        </div>

        {/* Drag Staging Center */}
        <div className="flex-grow flex items-center justify-center relative min-h-0">
          <AnimatePresence mode="wait">
            {currentItem && !successScreen && (
              <motion.div
                key={`${currentItem.id}-${dragOffsetKey}`}
                initial={{ scale: 0.3, opacity: 0, y: -20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.3, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 18 }}
                className="relative z-20 cursor-grab active:cursor-grabbing toddler-target select-none"
                style={{ touchAction: "none" }}
              >
                {/* Visual Glow rings under draggable card */}
                <div className={`absolute inset-0 rounded-[2rem] filter blur-xl opacity-35 scale-110 -z-10 ${
                  currentItem.naturalColor === "red" || level === 1 && currentItem.category === "red"
                    ? "bg-[#e07383]"
                    : currentItem.naturalColor === "blue" || level === 1 && currentItem.category === "blue"
                    ? "bg-[#b5cce6]"
                    : "bg-[#ffd166]"
                }`} />

                <motion.div
                  drag
                  dragSnapToOrigin={feedbackState !== "correct"}
                  dragElastic={0.65}
                  onDragEnd={handleDragEnd}
                  whileDrag={{ scale: 1.15, rotate: 2 }}
                  className={`w-36 h-36 flex flex-col items-center justify-center p-4 bg-white rounded-[2.5rem] border-[4px] border-white/60 shadow-clay-card select-none ${
                    feedbackState === "correct" ? "border-green-400 bg-green-50 animate-pulse-bounce pointer-events-none" : 
                    feedbackState === "incorrect" ? "border-red-400 bg-red-50 animate-shake pointer-events-none" : ""
                  }`}
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
        <div className="grid grid-cols-2 gap-4 sm:gap-6 mt-4 shrink-0 pb-2">
          
          {/* Basket A */}
          <div
            ref={containerARef}
            className={`p-5 rounded-[2.5rem] border-[3px] border-dashed transition-all duration-300 flex flex-col items-center justify-center gap-2 min-h-[120px] relative select-none ${
              level === 1
                ? "bg-[#ffc4c0]/40 border-[#e07383]/40 text-[#590d22]"
                : level === 2
                ? "bg-[#f5e4a3]/40 border-[#d4a919]/40 text-[#544001]"
                : "bg-[#bee8d4]/40 border-[#3fa394]/40 text-[#0d4036]"
            } shadow-[inset_4px_4px_10px_rgba(0,0,0,0.02)]`}
          >
            {/* Visual drop indicator overlay */}
            <div className="absolute inset-2 rounded-[2rem] border-2 border-white/30 pointer-events-none" />
            
            <span className="text-3xl filter drop-shadow-[1px_2px_2px_rgba(0,0,0,0.05)] select-none pointer-events-none">
              {level === 1 ? "🔴" : level === 2 ? "🍎" : "🚜"}
            </span>
            <h3 className="font-black text-sm uppercase tracking-wide text-center leading-none mt-1 select-none pointer-events-none">
              {containerA}
            </h3>
          </div>

          {/* Basket B */}
          <div
            ref={containerBRef}
            className={`p-5 rounded-[2.5rem] border-[3px] border-dashed transition-all duration-300 flex flex-col items-center justify-center gap-2 min-h-[120px] relative select-none ${
              level === 1
                ? "bg-[#b5cce6]/40 border-[#6372af]/40 text-[#1f3d68]"
                : level === 2
                ? "bg-[#bee8d4]/40 border-[#3fa394]/40 text-[#0d4036]"
                : "bg-[#b5cce6]/40 border-[#6372af]/40 text-[#1f3d68]"
            } shadow-[inset_4px_4px_10px_rgba(0,0,0,0.02)]`}
          >
            <div className="absolute inset-2 rounded-[2rem] border-2 border-white/30 pointer-events-none" />

            <span className="text-3xl filter drop-shadow-[1px_2px_2px_rgba(0,0,0,0.05)] select-none pointer-events-none">
              {level === 1 ? "🔵" : level === 2 ? "🦁" : "🐳"}
            </span>
            <h3 className="font-black text-sm uppercase tracking-wide text-center leading-none mt-1 select-none pointer-events-none">
              {containerB}
            </h3>
          </div>

        </div>

      </div>

    </div>
  );
}
