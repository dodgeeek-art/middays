"use client";

import { alphabetData } from "@/lib/alphabetData";

import React, { useState, useEffect } from "react";
import ActiveLessonEngine from "@/components/ActiveLessonEngine";
import ParentDashboard from "@/components/ParentDashboard";
import ProgressVisualizer from "@/components/ProgressVisualizer";
import ActivitiesMenu from "@/components/ActivitiesMenu";
import MagicRevealEngine from "@/components/MagicRevealEngine";
import BubblePopEngine from "@/components/BubblePopEngine";
import FeedMonsterEngine from "@/components/FeedMonsterEngine";
import SoundScavengerEngine from "@/components/SoundScavengerEngine";
import RhymeRiverEngine from "@/components/RhymeRiverEngine";
import PhonicsMatchEngine from "@/components/PhonicsMatchEngine";
import SyllableDrummerEngine from "@/components/SyllableDrummerEngine";

// Import new developmental games
import SortingBasketEngine from "@/components/SortingBasketEngine";
import WhereIsBunnyEngine from "@/components/WhereIsBunnyEngine";
import StorySequenceEngine from "@/components/StorySequenceEngine";
import MarkMakerEngine from "@/components/MarkMakerEngine";
import PatternExplorerEngine from "@/components/PatternExplorerEngine";
import ClayAlchemyEngine from "@/components/ClayAlchemyEngine";
import MazeRouterEngine from "@/components/MazeRouterEngine";
import SymmetryPainterEngine from "@/components/SymmetryPainterEngine";

import { motion, AnimatePresence } from "framer-motion";
import { Play, Trophy, Settings } from "@/components/Icons";
import FloatingHeader from "@/components/ui/FloatingHeader";
import ClayButton from "@/components/ui/ClayButton";
import ClayCard from "@/components/ui/ClayCard";

interface ProgressRecord {
  id: string;
  targetLetter: string;
  tracingScore: number;
  timeSpentMs: number;
  createdAt: string;
}

interface Child {
  id: string;
  name: string;
  progressRecord: ProgressRecord[];
}

const DEMO_CHILD_ID = "demo-child";

const playSynthesizedSound = (type: "correct" | "click") => {
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
    }
  } catch (e) {
    console.error(e);
  }
};

export default function Home() {
  const [view, setView] = useState<"lesson" | "dashboard" | "trophies">("lesson");
  const [activeGame, setActiveGame] = useState<"menu" | "tracing" | "reveal" | "bubbles" | "monster" | "scavenger" | "rhyme" | "match" | "drummer" | "sorting" | "bunny" | "story" | "mark" | "pattern" | "alchemy" | "maze" | "symmetry">("menu");
  const [childId, setChildId] = useState<string>(DEMO_CHILD_ID);
  const [childProgress, setChildProgress] = useState<Child | null>(null);

  // Dynamic state for curriculum engine
  const [currentLetterIndex, setCurrentLetterIndex] = useState(0);
  const currentLetter = alphabetData[currentLetterIndex].letter;
  const currentPath = alphabetData[currentLetterIndex].pathString;

  // Parent Gate state
  const [pendingTab, setPendingTab] = useState<"trophies" | "dashboard" | null>(null);
  const [showGate, setShowGate] = useState(false);

  const handleGateUnlock = () => {
    playSynthesizedSound("correct");
    if (pendingTab) setView(pendingTab);
    setShowGate(false);
    setPendingTab(null);
  };

  const handleTabClick = (tab: "lesson" | "trophies" | "dashboard") => {
    if (tab === "lesson") {
      setView("lesson");
    } else {
      setPendingTab(tab);
      setShowGate(true);
    }
  };

  const handleNextLetter = () => {
    setCurrentLetterIndex((prev) => (prev + 1) % alphabetData.length);
  };

  // Seed a dummy child on load
  useEffect(() => {
    fetch("/api/seed", { method: "POST" })
      .then((res) => res.json())
      .then((data) => {
        if (data.child) {
          setChildId(data.child.id);
        } else {
          console.error("No child data returned from /api/seed");
        }
      })
      .catch((err) => {
        console.error("Failed to seed child:", err);
      });
  }, []);


  // Fetch progress records whenever childId is set or view changes
  useEffect(() => {
    const fetchProgress = () => {
      fetch(`/api/progress/${childId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.child) {
            setChildProgress(data.child);
          }
        });
    };
    fetchProgress();
    
    // Periodically fetch in case updates happen during play
    const interval = setInterval(fetchProgress, 5000);
    return () => clearInterval(interval);
  }, [childId, view, activeGame]);

  // Dynamic stars count based on the progress record length + base 12000 from Stitch design
  const starsCount = childProgress 
    ? 12000 + childProgress.progressRecord.length * 1000 
    : 12000;

  const isGameActive = view === "lesson" && activeGame !== "menu";

  useEffect(() => {
    if (isGameActive) {
      document.body.classList.add("game-active");
    } else {
      document.body.classList.remove("game-active");
    }
    return () => {
      document.body.classList.remove("game-active");
    };
  }, [isGameActive]);

  return (
    <div className={`flex flex-col font-sans relative overflow-hidden bg-transparent text-foreground ${
      isGameActive ? "h-[100svh] max-h-[100svh] sm:h-[100dvh] sm:max-h-[100dvh]" : "min-h-[100dvh]"
    }`}>
      {/* Animated Ambient Background Blobs */}
      <div 
        className="fixed -z-10 bg-[#bde8ca] w-96 h-96 rounded-full blur-[100px] opacity-35 -top-20 -left-20"
        style={{ animation: "float 20s infinite alternate ease-in-out" }}
      ></div>
      <div 
        className="fixed -z-10 bg-[#fef3c7] w-[500px] h-[500px] rounded-full blur-[120px] opacity-30 -bottom-32 -right-32"
        style={{ animation: "float 20s infinite alternate ease-in-out", animationDelay: "-5s" }}
      ></div>
      <div 
        className="fixed -z-10 bg-[#fed7aa] w-80 h-80 rounded-full blur-[95px] opacity-25 top-1/2 left-1/4"
        style={{ animation: "float 20s infinite alternate ease-in-out", animationDelay: "-10s" }}
      ></div>

      {/* Dynamic TopAppBar Shell matching Stitch designs */}
      {view !== "lesson" && (
        <FloatingHeader 
          view={view} 
          onBackToPlay={() => setView("lesson")} 
          starsCount={starsCount} 
        />
      )}



      {/* Main View Shell */}
      <main className={`flex-grow max-w-6xl mx-auto w-full flex flex-col justify-center relative z-0 ${
        isGameActive 
          ? "h-[100svh] max-h-[100svh] overflow-y-auto overflow-x-hidden p-1.5 pb-[calc(0.5rem+env(safe-area-inset-bottom))] sm:h-[calc(100dvh-2rem)] sm:max-h-[calc(100dvh-2rem)] sm:p-4 sm:pb-4 sm:overflow-hidden sm:mt-2" 
          : `p-4 pb-28 sm:pb-32 md:pb-8 ${view === "lesson" ? "pt-6 sm:pt-8" : "pt-24 sm:pt-28"}`
      }`}>
        <AnimatePresence mode="wait">
            {view === "lesson" && (
              <motion.div 
                key="lesson" 
                initial={{ x: -20, opacity: 0 }} 
                animate={{ x: 0, opacity: 1 }} 
                exit={{ x: 20, opacity: 0 }} 
                transition={{ type: "spring", stiffness: 250, damping: 25 }}
                className={isGameActive ? "h-full min-h-0 flex flex-col justify-center" : ""}
              >
                <AnimatePresence mode="wait">
                  {activeGame === "menu" && (
                    <motion.div key="menu" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.2 }} className="flex flex-col gap-6 w-full max-w-4xl mx-auto">
                      <ActivitiesMenu onSelectActivity={setActiveGame} />
                    </motion.div>
                  )}
                  {activeGame === "tracing" && (
                    <motion.div key="tracing" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="flex flex-col gap-6 w-full max-w-4xl mx-auto h-full min-h-0">
                      <ActiveLessonEngine 
                        childId={childId} 
                        letter={currentLetter} 
                        pathString={currentPath} 
                        currentLetterIndex={currentLetterIndex}
                        onSelectLetterIndex={setCurrentLetterIndex}
                        onBack={() => setActiveGame("menu")} 
                        onNext={handleNextLetter} 
                      />
                    </motion.div>
                  )}
                  {activeGame === "reveal" && (
                    <motion.div key="reveal" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="h-full min-h-0 flex flex-col justify-center">
                      <MagicRevealEngine childId={childId} onBack={() => setActiveGame("menu")} />
                    </motion.div>
                  )}
                  {activeGame === "bubbles" && (
                    <motion.div key="bubbles" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="h-full min-h-0 flex flex-col justify-center">
                      <BubblePopEngine childId={childId} onBack={() => setActiveGame("menu")} />
                    </motion.div>
                  )}
                  {activeGame === "monster" && (
                    <motion.div key="monster" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="h-full min-h-0 flex flex-col justify-center">
                      <FeedMonsterEngine childId={childId} onBack={() => setActiveGame("menu")} />
                    </motion.div>
                  )}
                  {activeGame === "scavenger" && (
                    <motion.div key="scavenger" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="h-full min-h-0 flex flex-col justify-center">
                      <SoundScavengerEngine childId={childId} onBack={() => setActiveGame("menu")} />
                    </motion.div>
                  )}
                  {activeGame === "rhyme" && (
                    <motion.div key="rhyme" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="h-full min-h-0 flex flex-col justify-center">
                      <RhymeRiverEngine childId={childId} onBack={() => setActiveGame("menu")} />
                    </motion.div>
                  )}
                  {activeGame === "match" && (
                    <motion.div key="match" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="h-full min-h-0 flex flex-col justify-center">
                      <PhonicsMatchEngine childId={childId} onBack={() => setActiveGame("menu")} />
                    </motion.div>
                  )}
                  {activeGame === "drummer" && (
                    <motion.div key="drummer" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="h-full min-h-0 flex flex-col justify-center">
                      <SyllableDrummerEngine childId={childId} onBack={() => setActiveGame("menu")} />
                    </motion.div>
                  )}
                  {activeGame === "sorting" && (
                    <motion.div key="sorting" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="h-full min-h-0 flex flex-col justify-center">
                      <SortingBasketEngine childId={childId} onBack={() => setActiveGame("menu")} />
                    </motion.div>
                  )}
                  {activeGame === "bunny" && (
                    <motion.div key="bunny" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="h-full min-h-0 flex flex-col justify-center">
                      <WhereIsBunnyEngine childId={childId} onBack={() => setActiveGame("menu")} />
                    </motion.div>
                  )}
                  {activeGame === "story" && (
                    <motion.div key="story" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="h-full min-h-0 flex flex-col justify-center">
                      <StorySequenceEngine childId={childId} onBack={() => setActiveGame("menu")} />
                    </motion.div>
                  )}
                  {activeGame === "mark" && (
                    <motion.div key="mark" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="h-full min-h-0 flex flex-col justify-center">
                      <MarkMakerEngine childId={childId} onBack={() => setActiveGame("menu")} />
                    </motion.div>
                  )}
                  {activeGame === "pattern" && (
                    <motion.div key="pattern" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="h-full min-h-0 flex flex-col justify-center">
                      <PatternExplorerEngine childId={childId} onBack={() => setActiveGame("menu")} />
                    </motion.div>
                  )}
                  {activeGame === "alchemy" && (
                    <motion.div key="alchemy" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="h-full min-h-0 flex flex-col justify-center">
                      <ClayAlchemyEngine childId={childId} onBack={() => setActiveGame("menu")} />
                    </motion.div>
                  )}
                  {activeGame === "maze" && (
                    <motion.div key="maze" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="h-full min-h-0 flex flex-col justify-center">
                      <MazeRouterEngine childId={childId} onBack={() => setActiveGame("menu")} />
                    </motion.div>
                  )}
                  {activeGame === "symmetry" && (
                    <motion.div key="symmetry" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="h-full min-h-0 flex flex-col justify-center">
                      <SymmetryPainterEngine childId={childId} onBack={() => setActiveGame("menu")} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
            {view === "dashboard" && (
              <motion.div key="dashboard" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }} transition={{ type: "spring", stiffness: 250, damping: 25 }}>
                <ParentDashboard childId={childId} />
              </motion.div>
            )}
            {view === "trophies" && (
              <motion.div key="trophies" initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 1.05, opacity: 0 }} transition={{ type: "spring", stiffness: 250, damping: 25 }}>
                <ProgressVisualizer childId={childId} />
              </motion.div>
            )}
          </AnimatePresence>
      </main>

      {/* BottomNavBar Shell matching Stitch layout */}
      {activeGame === "menu" && (
        <nav className="fixed bottom-5 left-1/2 -translate-x-1/2 w-[90%] max-w-md pt-3.5 pb-3.5 z-50 rounded-full bg-white/90 backdrop-blur-md border-[3px] border-white/50 shadow-[8px_8px_24px_rgba(0,0,0,0.06),_inset_-4px_-4px_8px_rgba(0,0,0,0.04),_inset_4px_4px_8px_rgba(255,255,255,0.95)]">
          <div className="flex justify-around items-center px-4">
            {(["lesson", "trophies", "dashboard"] as const).map((tab) => {
              const isActive = view === tab;
              let Icon = Play;
              let label = "Play";
              let activeBg = "bg-primary-container";
              let activeShadow = "shadow-[inset_-2px_-2px_4px_rgba(255,255,255,0.85),_inset_4px_4px_8px_rgba(0,0,0,0.18)]";
              let activeText = "text-primary";
              let activeIcon = "text-[#590d22]";
              
              if (tab === "trophies") {
                Icon = Trophy;
                label = "Trophies";
                activeBg = "bg-[#fef5d1]"; // tertiary-container
                activeShadow = "shadow-[inset_-2px_-2px_4px_rgba(255,255,255,0.85),_inset_4px_4px_8px_rgba(0,0,0,0.18)]";
                activeText = "text-tertiary";
                activeIcon = "text-[#5c4d00]";
              }
              if (tab === "dashboard") {
                Icon = Settings;
                label = "Parents";
                activeBg = "bg-[#d2f4e6]"; // secondary-container
                activeShadow = "shadow-[inset_-2px_-2px_4px_rgba(255,255,255,0.85),_inset_4px_4px_8px_rgba(0,0,0,0.18)]";
                activeText = "text-secondary";
                activeIcon = "text-[#0b4a45]";
              }

              const buttonClass = isActive 
                ? `${activeBg} ${activeShadow} border-black/5` 
                : "bg-white/95 border-white/40 shadow-[4px_4px_8px_rgba(0,0,0,0.04),_inset_-2px_-2px_4px_rgba(0,0,0,0.03),_inset_2px_2px_4px_rgba(255,255,255,0.95)] hover:border-white/50";

              const motionProps = isActive 
                ? {
                    animate: { y: 2, scaleX: 1.05, scaleY: 0.88 },
                    transition: { type: "spring" as const, stiffness: 450, damping: 20 },
                  }
                : {
                    whileHover: { y: -4, scale: 1.08 },
                    whileTap: { y: 2, scale: 0.94 },
                    transition: { type: "spring" as const, stiffness: 350, damping: 15 },
                  };
              
              return (
                <div 
                  key={tab} 
                  onClick={() => handleTabClick(tab)}
                  className="flex flex-col items-center gap-1.5 flex-1 cursor-pointer py-0.5 group"
                >
                  <motion.button 
                    {...motionProps}
                    className={`w-12 h-12 rounded-full border-2 flex items-center justify-center pointer-events-none transition-all duration-200 ${buttonClass}`}
                  >
                    <Icon className={`w-5 h-5 transition-colors duration-150 ${isActive ? activeIcon : "text-slate-dark/60"}`} strokeWidth={3.5} />
                  </motion.button>
                  <span className={`text-[9px] font-black uppercase tracking-wider transition-colors duration-150 ${
                    isActive ? activeText : "text-slate-dark/40 group-hover:text-slate-dark/65"
                  }`}>
                    {label}
                  </span>
                </div>
              );
            })}
          </div>
        </nav>
      )}

      {/* Parent Gate Modal with Lavender Theme & Swipe Lock */}
      <AnimatePresence>
        {showGate && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-md p-6"
          >
            <ClayCard
              variant="purple"
              hoverEffect={false}
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="p-8 max-w-sm w-full flex flex-col items-center gap-6 rounded-[2.5rem] border-white/30"
            >
              <h2 className="text-3xl font-black text-center text-[#4A5358] uppercase tracking-wide">Adults Only!</h2>
              <p className="text-sm text-center font-black text-on-secondary-container">Swipe the Star ⭐ to the Circle ⭕ to unlock!</p>
              
              <div className="w-full bg-slate-100/80 border-[3px] border-slate-200/50 rounded-full h-20 relative shadow-[inset_3px_3px_6px_rgba(0,0,0,0.05),_inset_-3px_-3px_6px_rgba(255,255,255,0.9)] flex items-center px-2 select-none overflow-hidden">
                {/* Track guides */}
                <div className="absolute inset-0 flex items-center justify-between px-6 pointer-events-none opacity-20">
                  <span className="text-xl">⭐</span>
                  <div className="flex-1 border-t-4 border-dashed border-slate-400 mx-4" />
                  <span className="text-xl">⭕</span>
                </div>
                
                {/* Target Circle */}
                <div className="absolute right-3 w-14 h-14 rounded-full border-4 border-dashed border-[#e07383] bg-white flex items-center justify-center text-2xl shadow-inner select-none pointer-events-none">
                  ⭕
                </div>

                {/* Draggable Star */}
                <motion.div
                  drag="x"
                  dragConstraints={{ left: 0, right: 200 }}
                  dragElastic={0.1}
                  dragMomentum={false}
                  onDragEnd={(event, info) => {
                    if (info.offset.x >= 150) {
                      handleGateUnlock();
                    }
                  }}
                  className="w-14 h-14 rounded-full bg-white border-2 border-white/50 shadow-clay-btn hover:shadow-clay-btn-hover active:shadow-clay-btn-pressed flex items-center justify-center text-3xl cursor-grab active:cursor-grabbing z-10"
                >
                  ⭐
                </motion.div>
              </div>

              <ClayButton 
                onClick={() => { playSynthesizedSound("click"); setShowGate(false); setPendingTab(null); }}
                variant="surface"
                className="mt-2 w-full py-4 text-xl font-black rounded-full"
              >
                Go Back
              </ClayButton>
            </ClayCard>
          </motion.div>
        )}
      </AnimatePresence>


    </div>
  );
}
