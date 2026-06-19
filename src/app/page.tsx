"use client";

import { alphabetData } from "@/lib/alphabetData";

import React, { useState, useEffect, useRef } from "react";
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

import { motion, AnimatePresence } from "framer-motion";
import { Lock, Play, Trophy, Settings } from "@/components/Icons";
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

export default function Home() {
  const [view, setView] = useState<"lesson" | "dashboard" | "trophies">("lesson");
  const [activeGame, setActiveGame] = useState<"menu" | "tracing" | "reveal" | "bubbles" | "monster" | "scavenger" | "rhyme" | "match" | "drummer" | "sorting" | "bunny" | "story" | "mark">("menu");
  const [childId, setChildId] = useState<string | null>(null);
  const [childProgress, setChildProgress] = useState<Child | null>(null);

  // Dynamic state for curriculum engine
  const [currentLetterIndex, setCurrentLetterIndex] = useState(0);
  const currentLetter = alphabetData[currentLetterIndex].letter;
  const currentPath = alphabetData[currentLetterIndex].pathString;

  // Parent Gate state
  const [pendingTab, setPendingTab] = useState<"trophies" | "dashboard" | null>(null);
  const [showGate, setShowGate] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startGateTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setHoldProgress(0);
    const startTime = Date.now();
    const duration = 3000; // 3 seconds hold as specified in Stitch DESIGN.md
    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min((elapsed / duration) * 100, 100);
      setHoldProgress(progress);
      if (progress >= 100) {
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = null;
        if (pendingTab) setView(pendingTab);
        setShowGate(false);
        setPendingTab(null);
      }
    }, 50);
  };

  const stopGateTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setHoldProgress(0);
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
    if (!childId) return;
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
      isGameActive ? "h-[100dvh] max-h-[100dvh]" : "min-h-[100dvh]"
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
          ? "h-[calc(100dvh-1rem)] max-h-[calc(100dvh-1rem)] sm:h-[calc(100dvh-2rem)] sm:max-h-[calc(100dvh-2rem)] p-2 sm:p-4 pb-2 sm:pb-4 overflow-hidden mt-1 sm:mt-2" 
          : `p-4 pb-28 sm:pb-32 md:pb-8 ${view === "lesson" ? "pt-6 sm:pt-8" : "pt-24 sm:pt-28"}`
      }`}>
        {!childId ? (
          <div className="flex justify-center items-center h-64">
            <motion.p 
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="text-2xl font-bold text-primary"
            >
              Loading adventure...
            </motion.p>
          </div>
        ) : (
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
        )}
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

      {/* Parent Gate Modal with Lavender Theme & 3-Second Unlock */}
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
              <p className="text-sm text-center font-black text-on-secondary-container">Press and hold the lock for 3 seconds to unlock.</p>
              
              <div className="relative w-36 h-36 flex items-center justify-center select-none">
                {/* Hold progress circle outline */}
                <svg className="absolute inset-0 w-full h-full -rotate-90">
                  <circle 
                    cx="72" 
                    cy="72" 
                    r="64" 
                    stroke="rgba(0,0,0,0.04)" 
                    strokeWidth="8" 
                    fill="none" 
                  />
                  <circle 
                    cx="72" 
                    cy="72" 
                    r="64" 
                    stroke="var(--primary)" 
                    strokeWidth="8" 
                    fill="none" 
                    strokeDasharray={2 * Math.PI * 64}
                    strokeDashoffset={2 * Math.PI * 64 * (1 - holdProgress / 100)}
                    strokeLinecap="round"
                    className="transition-all duration-75"
                  />
                </svg>
                
                <button
                  onPointerDown={startGateTimer}
                  onPointerUp={stopGateTimer}
                  onPointerLeave={stopGateTimer}
                  className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-200 border border-white/20 relative active:scale-95 shadow-[6px_6px_12px_rgba(0,0,0,0.05),_inset_-4px_-4px_8px_rgba(0,0,0,0.05),_inset_4px_4px_8px_rgba(255,255,255,0.95)] hover:-translate-y-1.5 hover:shadow-[8px_14px_22px_rgba(0,0,0,0.08),_inset_-4px_-4px_8px_rgba(0,0,0,0.04),_inset_4px_4px_8px_rgba(255,255,255,0.95)] active:translate-y-1.5 active:shadow-[inset_-2px_-2px_4px_rgba(255,255,255,0.8),_inset_4px_4px_8px_rgba(0,0,0,0.15)] ${holdProgress >= 100 ? "bg-primary-container text-foreground animate-pulse" : "bg-tertiary-container text-foreground"}`}
                  style={{
                    boxShadow: holdProgress > 0 ? `0 0 20px var(--primary)` : undefined,
                    touchAction: "none"
                  }}
                >
                  <Lock size={40} strokeWidth={3} />
                </button>
              </div>

              <ClayButton 
                onClick={() => { setShowGate(false); setPendingTab(null); }}
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
