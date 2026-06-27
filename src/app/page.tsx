"use client";

import { alphabetData } from "@/lib/alphabetData";
import { playSynthesizedSound } from "@/lib/audio";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import ParentDashboard from "@/components/ParentDashboard";
import ProgressVisualizer from "@/components/ProgressVisualizer";
import ActivitiesMenu from "@/components/ActivitiesMenu";

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

const GameLoading = () => (
  <div className="flex h-full min-h-0 w-full items-center justify-center">
    <div className="flex w-[min(88vw,22rem)] flex-col items-center gap-4 rounded-3xl border-2 border-[#22313f]/10 bg-[#fffdf6]/95 px-6 py-8 text-center shadow-clay-card">
      <div className="relative h-16 w-16">
        <span className="absolute inset-0 rounded-2xl bg-[#ffb51f]/35 animate-ping" />
        <span className="relative grid h-16 w-16 place-items-center rounded-2xl bg-[#ffb51f] text-3xl shadow-clay-btn">
          ☀️
        </span>
      </div>
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#00a9a5]">Loading Game</p>
        <p className="mt-1 font-display text-xl font-extrabold text-[#22313f]">Setting up play</p>
      </div>
    </div>
  </div>
);

const ActiveLessonEngine = dynamic(() => import("@/components/ActiveLessonEngine"), { loading: GameLoading });
const MagicRevealEngine = dynamic(() => import("@/components/MagicRevealEngine"), { loading: GameLoading });
const BubblePopEngine = dynamic(() => import("@/components/BubblePopEngine"), { loading: GameLoading });
const FeedMonsterEngine = dynamic(() => import("@/components/FeedMonsterEngine"), { loading: GameLoading });
const SoundScavengerEngine = dynamic(() => import("@/components/SoundScavengerEngine"), { loading: GameLoading });
const RhymeRiverEngine = dynamic(() => import("@/components/RhymeRiverEngine"), { loading: GameLoading });
const PhonicsMatchEngine = dynamic(() => import("@/components/PhonicsMatchEngine"), { loading: GameLoading });
const SyllableDrummerEngine = dynamic(() => import("@/components/SyllableDrummerEngine"), { loading: GameLoading });
const SortingBasketEngine = dynamic(() => import("@/components/SortingBasketEngine"), { loading: GameLoading });
const WhereIsBunnyEngine = dynamic(() => import("@/components/WhereIsBunnyEngine"), { loading: GameLoading });
const StorySequenceEngine = dynamic(() => import("@/components/StorySequenceEngine"), { loading: GameLoading });
const MarkMakerEngine = dynamic(() => import("@/components/MarkMakerEngine"), { loading: GameLoading });
const PatternExplorerEngine = dynamic(() => import("@/components/PatternExplorerEngine"), { loading: GameLoading });
const ClayAlchemyEngine = dynamic(() => import("@/components/ClayAlchemyEngine"), { loading: GameLoading });
const MazeRouterEngine = dynamic(() => import("@/components/MazeRouterEngine"), { loading: GameLoading });
const SymmetryPainterEngine = dynamic(() => import("@/components/SymmetryPainterEngine"), { loading: GameLoading });
const SoundGardenEngine = dynamic(() => import("@/components/SoundGardenEngine"), { loading: GameLoading });
const MagicSoundBubblesEngine = dynamic(() => import("@/components/MagicSoundBubblesEngine"), { loading: GameLoading });

export default function Home() {
  const [view, setView] = useState<"lesson" | "dashboard" | "trophies">("lesson");
  const [activeGame, setActiveGame] = useState<"menu" | "tracing" | "reveal" | "bubbles" | "monster" | "scavenger" | "rhyme" | "match" | "drummer" | "sorting" | "bunny" | "story" | "mark" | "pattern" | "alchemy" | "maze" | "symmetry" | "garden" | "magicsoundbubbles">("menu");
  const [childId, setChildId] = useState<string>(DEMO_CHILD_ID);
  const [childProgress, setChildProgress] = useState<Child | null>(null);

  // Dynamic state for curriculum engine
  const [currentLetterIndex, setCurrentLetterIndex] = useState(0);
  const currentLetter = alphabetData[currentLetterIndex].letter;
  const currentPath = alphabetData[currentLetterIndex].pathString;
  const isGameActive = view === "lesson" && activeGame !== "menu";

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


  // Fetch progress records outside of active gameplay so games are not interrupted by app-level polling rerenders.
  useEffect(() => {
    if (isGameActive) return;

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

    const interval = setInterval(fetchProgress, 30000);
    return () => clearInterval(interval);
  }, [childId, view, isGameActive]);

  // Dynamic stars count based on the progress record length + base 12000 from Stitch design
  const starsCount = childProgress 
    ? 12000 + childProgress.progressRecord.length * 1000 
    : 12000;

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
      {/* Dynamic TopAppBar Shell matching Stitch designs */}
      {view !== "lesson" && (
        <FloatingHeader 
          view={view} 
          onBackToPlay={() => setView("lesson")} 
          starsCount={starsCount} 
        />
      )}



      {/* Main View Shell */}
      <main className={`flex-grow max-w-6xl mx-auto w-full flex flex-col relative z-0 ${
        isGameActive 
          ? "h-[100svh] max-h-[100svh] justify-center overflow-hidden p-1.5 pb-[calc(0.5rem+env(safe-area-inset-bottom))] sm:h-[calc(100dvh-2rem)] sm:max-h-[calc(100dvh-2rem)] sm:p-4 sm:pb-4 sm:mt-2" 
          : `justify-start p-4 pb-32 sm:pb-36 md:pb-28 ${view === "lesson" ? "pt-6 sm:pt-8" : "pt-24 sm:pt-28"}`
      }`}>
        <AnimatePresence mode="wait">
            {view === "lesson" && (
              <motion.div 
                key="lesson" 
                initial={false} 
                animate={{ x: 0, opacity: 1 }} 
                exit={{ x: 20, opacity: 0 }} 
                transition={{ type: "spring", stiffness: 250, damping: 25 }}
                className={isGameActive ? "h-full min-h-0 flex flex-col justify-center" : ""}
              >
                <AnimatePresence mode="wait">
                  {activeGame === "menu" && (
                    <motion.div key="menu" initial={false} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.16 }} className="flex flex-col gap-6 w-full max-w-4xl mx-auto">
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
                  {activeGame === "garden" && (
                    <motion.div key="garden" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="h-full min-h-0 flex flex-col justify-center">
                      <SoundGardenEngine childId={childId} onBack={() => setActiveGame("menu")} />
                    </motion.div>
                  )}
                  {activeGame === "magicsoundbubbles" && (
                    <motion.div key="magicsoundbubbles" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="h-full min-h-0 flex flex-col justify-center">
                      <MagicSoundBubblesEngine childId={childId} onBack={() => setActiveGame("menu")} />
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

      {/* Floating app navigation dock */}
      {activeGame === "menu" && (
        <nav
          className="z-[80] w-[min(92vw,25rem)] rounded-[1.5rem] border border-[#22313f]/10 bg-[#fffdf7]/92 px-3 py-2.5 shadow-[0_18px_52px_rgba(34,49,63,0.18)] backdrop-blur-xl sm:rounded-[1.75rem]"
          style={{
            position: "fixed",
            left: "50%",
            bottom: "max(1rem, env(safe-area-inset-bottom))",
            transform: "translateX(-50%)",
          }}
        >
          <div className="grid grid-cols-3 gap-2">
            {(["lesson", "trophies", "dashboard"] as const).map((tab) => {
              const isActive = view === tab;
              let Icon = Play;
              let label = "Play";
              let activeBg = "bg-primary";
              let activeShadow = "shadow-[0_6px_0_#d28700,0_14px_22px_rgba(255,181,31,0.24)]";
              let activeText = "text-[#22313f]";
              let activeIcon = "text-[#593900]";
              
              if (tab === "trophies") {
                Icon = Trophy;
                label = "Trophies";
                activeBg = "bg-primary";
                activeShadow = "shadow-[0_6px_0_#d28700,0_14px_22px_rgba(255,181,31,0.24)]";
                activeText = "text-[#22313f]";
                activeIcon = "text-[#593900]";
              }
              if (tab === "dashboard") {
                Icon = Settings;
                label = "Parents";
                activeBg = "bg-secondary";
                activeShadow = "shadow-[0_6px_0_#00817e,0_14px_22px_rgba(0,169,165,0.2)]";
                activeText = "text-[#22313f]";
                activeIcon = "text-white";
              }

              const buttonClass = isActive
                ? `${activeBg} ${activeShadow} border-[#22313f]/10`
                : "bg-white/88 border-[#22313f]/10 shadow-[0_8px_20px_rgba(34,49,63,0.08)] hover:border-[#22313f]/20 hover:bg-white";

              const motionProps = isActive 
                ? {
                    animate: { y: -2, scale: 1.03 },
                    transition: { type: "spring" as const, stiffness: 450, damping: 20 },
                  }
                : {
                    whileHover: { y: -4, scale: 1.08 },
                    whileTap: { y: 2, scale: 0.94 },
                    transition: { type: "spring" as const, stiffness: 350, damping: 15 },
                  };
              
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => handleTabClick(tab)}
                  className="group flex min-h-[4.35rem] flex-col items-center justify-center gap-1 rounded-[1.25rem] px-1 py-1 transition hover:bg-[#fff8e7]/80"
                  aria-current={isActive ? "page" : undefined}
                >
                  <motion.span
                    {...motionProps}
                    className={`flex h-10 w-10 items-center justify-center rounded-2xl border transition-all duration-200 sm:h-11 sm:w-11 ${buttonClass}`}
                  >
                    <Icon className={`h-4.5 w-4.5 transition-colors duration-150 sm:h-5 sm:w-5 ${isActive ? activeIcon : "text-slate-dark/60"}`} strokeWidth={3.5} />
                  </motion.span>
                  <span className={`text-[8px] font-black uppercase tracking-wider transition-colors duration-150 sm:text-[9px] ${
                    isActive ? activeText : "text-slate-dark/55 group-hover:text-slate-dark/75"
                  }`}>
                    {label}
                  </span>
                </button>
              );
            })}
          </div>
        </nav>
      )}

      {/* Parent Gate Modal */}
      <AnimatePresence>
        {showGate && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--brand-ink)]/55 p-6 backdrop-blur-md"
          >
            <ClayCard
              variant="default"
              hoverEffect={false}
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="brand-panel max-w-sm w-full flex flex-col items-center gap-6 p-7"
            >
              <div className="brand-icon-tile h-16 w-16 bg-[var(--primary-container)] text-[var(--brand-sun-deep)]">
                <Settings size={34} />
              </div>
              <div className="text-center">
                <span className="brand-chip mx-auto mb-3">Parent Gate</span>
                <h2 className="brand-title text-3xl">Grown-up check</h2>
                <p className="brand-copy mt-2 text-sm">Swipe the star to the circle to open parent tools.</p>
              </div>
              
              <div className="relative flex h-20 w-full select-none items-center overflow-hidden rounded-full border-2 border-[var(--brand-line)] bg-[var(--surface-container-low)] px-2 shadow-[inset_0_2px_6px_rgba(34,49,63,0.08)]">
                {/* Track guides */}
                <div className="pointer-events-none absolute inset-0 flex items-center justify-between px-6 opacity-30">
                  <span className="text-xl">⭐</span>
                  <div className="mx-4 flex-1 border-t-4 border-dashed border-[var(--brand-ink)]/35" />
                  <span className="text-xl">⭕</span>
                </div>
                
                {/* Target Circle */}
                <div className="pointer-events-none absolute right-3 flex h-14 w-14 select-none items-center justify-center rounded-full border-4 border-dashed border-[var(--brand-sun)] bg-[var(--brand-paper)] text-2xl shadow-inner">
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
                  className="z-10 flex h-14 w-14 cursor-grab items-center justify-center rounded-full border-2 border-[var(--brand-line)] bg-[var(--brand-paper)] text-3xl shadow-clay-btn hover:shadow-clay-btn-hover active:cursor-grabbing active:shadow-clay-btn-pressed"
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
