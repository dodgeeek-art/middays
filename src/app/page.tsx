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
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Play, Trophy, Settings, ArrowLeft } from "lucide-react";

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
  const [activeGame, setActiveGame] = useState<"menu" | "tracing" | "reveal" | "bubbles" | "monster">("menu");
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
  const timerRef = useRef<any>(null);

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
        clearInterval(timerRef.current);
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

  return (
    <div className="min-h-[100dvh] flex flex-col font-sans relative overflow-hidden bg-background text-foreground">
      {/* Animated Ambient Background Blobs from Stitch */}
      <div 
        className="fixed -z-10 bg-[#abf773] w-96 h-96 rounded-full blur-[80px] opacity-40 -top-20 -left-20"
        style={{ animation: "float 20s infinite alternate ease-in-out" }}
      ></div>
      <div 
        className="fixed -z-10 bg-[#ffdad8] w-[500px] h-[500px] rounded-full blur-[100px] opacity-45 -bottom-32 -right-32"
        style={{ animation: "float 20s infinite alternate ease-in-out", animationDelay: "-5s" }}
      ></div>
      <div 
        className="fixed -z-10 bg-[#e9ddfd] w-80 h-80 rounded-full blur-[70px] opacity-35 top-1/2 left-1/4"
        style={{ animation: "float 20s infinite alternate ease-in-out", animationDelay: "-10s" }}
      ></div>

      {/* Dynamic TopAppBar Shell matching Stitch designs */}
      {!(view === "lesson" && activeGame !== "menu") && (
        <header className="sticky top-0 z-50 flex justify-between items-center w-full px-6 py-4 bg-background/85 backdrop-blur-md border-none">
          {view === "dashboard" ? (
            /* Parent Dashboard Header */
            <>
              <button 
                onClick={() => setView("lesson")}
                className="flex items-center gap-2 text-foreground font-bold neo-brutal-press bg-white border-2 border-slate-dark rounded-full px-5 py-2.5 transition-all text-sm"
              >
                <ArrowLeft size={18} strokeWidth={3} />
                <span>Back to Play</span>
              </button>
              <div className="absolute left-1/2 -translate-x-1/2">
                <h1 className="font-sans text-3xl font-black text-primary tracking-tight">Midday's</h1>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-primary-container px-4 py-2 rounded-full border-2 border-slate-dark flex items-center gap-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  <span className="text-xl text-primary">⭐</span>
                  <span className="text-sm font-black text-on-primary-container">{starsCount}</span>
                </div>
                <div className="w-10 h-10 rounded-full border-2 border-slate-dark overflow-hidden bg-white">
                  <img 
                    alt="Profile" 
                    className="w-full h-full object-cover" 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCESvb79c9z_F-uxTvWJQj7b2OAsWvHLSRmS7Wk61CBgmb-avgjotarn7houGDxSUIoDyHoAPQe47i4qKI63TgAZpkX8RprWENpDz15eE7XBYBIO-kN548XDieebmWSlZhKz92Lr6-OppHauAcxYo88JWn4Duaj6cxDklFfftQNxp0UNUtlMt6XLZSAnEQ18Yf2_jMJwR3vqugORlqJ4wusdqKe7JnB44TEd2FekQeTJJecxxJNQgXXsr1GLyiQHgntTIhkfku8Ax7W" 
                  />
                </div>
              </div>
            </>
          ) : (
            /* General / Kid's Trophy Room Header */
            <>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full border-2 border-primary overflow-hidden bg-primary-container">
                  <img 
                    alt="Kid profile" 
                    className="w-full h-full object-cover" 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuD9ZjWW3-2zDccH9zvN_35X9UN1RvAZsBLlu3Zi99WnvUeUcK8BP4CvOQVk7bAO8ZjLUfm5JzTdlorn-CTgBZGOvHySrSrYsTHit1Og35pzZnBKerC-GheS2QZcznY42uNvxQtUI4o3r-VJhF1WpPb6QrPKjYVL2HNGdhpW1kEVNqExauXAd_pX9sbvL_VrwLHEDSPJouDwY1wZ4QD7sp2E2CwnvMcpVjz18jQPOjn-kaUIxapuS-FXg9thhRskCGUCXm_uQIKVchqy" 
                  />
                </div>
                <span className="font-sans text-3xl font-black text-primary tracking-tight">Midday's</span>
              </div>
              <div className="flex items-center bg-secondary-container px-4 py-2 rounded-full border-2 border-slate-dark shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-y-0.5 hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all">
                <span className="text-xl mr-2 text-tertiary">⭐</span>
                <span className="text-sm font-black text-on-secondary-container">{starsCount} stars</span>
              </div>
            </>
          )}
        </header>
      )}

      {/* Main View Shell */}
      <main className="flex-grow max-w-6xl mx-auto w-full p-4 pb-32 md:pb-8 mt-2 md:mt-8 flex flex-col justify-center relative z-0">
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
              <motion.div key="lesson" initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 20, opacity: 0 }} transition={{ type: "spring", stiffness: 250, damping: 25 }}>
                <AnimatePresence mode="wait">
                  {activeGame === "menu" && (
                    <motion.div key="menu" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.2 }} className="flex flex-col gap-6 w-full max-w-4xl mx-auto">
                      <ActivitiesMenu onSelectActivity={setActiveGame} />
                    </motion.div>
                  )}
                  {activeGame === "tracing" && (
                    <motion.div key="tracing" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="flex flex-col gap-6 w-full max-w-4xl mx-auto">
                      {/* Alphabet Carousel */}
                      <div 
                        className="glass-panel p-4 overflow-x-auto whitespace-nowrap rounded-[2rem] flex gap-3 snap-x scroll-smooth max-w-md mx-auto w-full"
                        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                      >
                        {alphabetData.map((data, index) => (
                          <button
                            key={data.letter}
                            onClick={() => setCurrentLetterIndex(index)}
                            className={`snap-center shrink-0 w-16 h-16 rounded-2xl flex items-center justify-center text-3xl font-black transition-all border-2 border-slate-dark ${currentLetterIndex === index ? "bg-primary-container text-slate-dark shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] scale-110" : "bg-white text-slate-dark shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:scale-105"}`}
                          >
                            {data.letter}
                          </button>
                        ))}
                      </div>

                      <ActiveLessonEngine childId={childId} letter={currentLetter} pathString={currentPath} onBack={() => setActiveGame("menu")} onNext={handleNextLetter} />
                    </motion.div>
                  )}
                  {activeGame === "reveal" && (
                    <motion.div key="reveal" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                      <MagicRevealEngine childId={childId} onBack={() => setActiveGame("menu")} />
                    </motion.div>
                  )}
                  {activeGame === "bubbles" && (
                    <motion.div key="bubbles" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                      <BubblePopEngine childId={childId} onBack={() => setActiveGame("menu")} />
                    </motion.div>
                  )}
                  {activeGame === "monster" && (
                    <motion.div key="monster" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                      <FeedMonsterEngine childId={childId} onBack={() => setActiveGame("menu")} />
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
        <nav className="fixed bottom-0 left-0 w-full p-5 md:pb-8 z-50 rounded-t-[2.5rem] bg-white border-t-2 border-slate-dark shadow-lg">
          <div className="max-w-md mx-auto flex justify-around items-center">
            {(["lesson", "trophies", "dashboard"] as const).map((tab) => {
              const isActive = view === tab;
              let Icon = Play;
              let label = "Play";
              
              if (tab === "trophies") { Icon = Trophy; label = "Trophies"; }
              if (tab === "dashboard") { Icon = Settings; label = "Parents"; }
              
              return (
                <motion.button 
                  key={tab}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleTabClick(tab)}
                  className={`transition-all duration-150 toddler-target flex items-center justify-center gap-2 border-2 border-slate-dark ${
                    isActive 
                      ? "bg-primary-container px-6 py-2.5 rounded-full flex-grow max-w-[160px] h-14" 
                      : "bg-white w-14 h-14 rounded-full"
                  }`}
                  style={{
                    boxShadow: isActive ? "0 6px 0 0 var(--slate-dark)" : "0 3px 0 0 var(--slate-dark)",
                    transform: isActive ? "translateY(-3px)" : "none"
                  }}
                >
                  <Icon size={24} strokeWidth={3} className="text-foreground" />
                  {isActive && (
                    <span className="text-sm font-black tracking-wide uppercase text-foreground">{label}</span>
                  )}
                </motion.button>
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
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="p-8 max-w-sm w-full border-2 border-slate-dark shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col items-center gap-6 rounded-[32px] bg-[#e9ddfd]"
            >
              <h2 className="text-3xl font-black text-center text-foreground uppercase tracking-wide">Adults Only!</h2>
              <p className="text-base text-center font-bold text-on-secondary-container">Press and hold the lock for 3 seconds to unlock.</p>
              
              <div className="relative w-36 h-36 flex items-center justify-center">
                {/* Hold progress circle outline */}
                <svg className="absolute inset-0 w-full h-full -rotate-90">
                  <circle 
                    cx="72" 
                    cy="72" 
                    r="64" 
                    stroke="rgba(0,0,0,0.08)" 
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
                  className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-150 border-2 border-slate-dark relative active:scale-95 ${holdProgress >= 100 ? "bg-primary-container text-foreground animate-pulse" : "bg-tertiary-container text-foreground"}`}
                  style={{
                    boxShadow: holdProgress > 0 ? `0 0 20px var(--primary)` : 'none',
                    touchAction: "none"
                  }}
                >
                  <Lock size={40} strokeWidth={3} />
                </button>
              </div>

              <button 
                onClick={() => { setShowGate(false); setPendingTab(null); }}
                className="mt-2 w-full py-4 text-xl font-extrabold bg-white hover:bg-gray-100 rounded-full border-2 border-slate-dark shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all"
              >
                Go Back
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
