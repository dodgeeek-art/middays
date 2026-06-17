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
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Play, Trophy, Settings, ArrowLeft } from "@/components/Icons";

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
  const [activeGame, setActiveGame] = useState<"menu" | "tracing" | "reveal" | "bubbles" | "monster" | "scavenger" | "rhyme" | "match" | "drummer">("menu");
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

  return (
    <div className="min-h-[100dvh] flex flex-col font-sans relative overflow-hidden bg-background text-foreground">
      {/* Animated Ambient Background Blobs from Stitch */}
      <div 
        className="fixed -z-10 bg-[#a2ea63] w-96 h-96 rounded-full blur-[80px] opacity-45 -top-20 -left-20"
        style={{ animation: "float 20s infinite alternate ease-in-out" }}
      ></div>
      <div 
        className="fixed -z-10 bg-[#ffc4c0] w-[500px] h-[500px] rounded-full blur-[100px] opacity-50 -bottom-32 -right-32"
        style={{ animation: "float 20s infinite alternate ease-in-out", animationDelay: "-5s" }}
      ></div>
      <div 
        className="fixed -z-10 bg-[#eaddfc] w-80 h-80 rounded-full blur-[70px] opacity-40 top-1/2 left-1/4"
        style={{ animation: "float 20s infinite alternate ease-in-out", animationDelay: "-10s" }}
      ></div>

      {/* Dynamic TopAppBar Shell matching Stitch designs */}
      {!(view === "lesson" && activeGame !== "menu") && (
        <header className="sticky top-0 z-50 flex justify-between items-center w-full px-5 py-4 bg-background/80 backdrop-blur-md border-none">
          {view === "dashboard" ? (
            /* Parent Dashboard Header */
            <>
              <button 
                onClick={() => setView("lesson")}
                className="flex items-center gap-2 text-on-surface-variant font-label-lg clay-btn bg-white px-4 py-2 transition-all text-xs"
              >
                <ArrowLeft className="w-4 h-4" strokeWidth={2.5} />
                <span>Back to Play</span>
              </button>
              <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2 select-none">
                <img 
                  alt="Midday Logo" 
                  className="w-8 h-8 object-contain" 
                  src="/logo.png" 
                />
                <h1 className="font-display-lg-mobile text-display-lg-mobile md:font-display-lg md:text-display-lg text-primary tracking-tight font-black uppercase leading-none">Midday</h1>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-primary-container/80 px-4 py-1.5 rounded-full flex items-center gap-2 border border-white/30 shadow-[4px_4px_8px_rgba(0,0,0,0.04),_inset_2px_2px_4px_rgba(255,255,255,0.8),_inset_-2px_-2px_4px_rgba(0,0,0,0.05)]">
                  <span className="text-primary font-black">⭐</span>
                  <span className="font-label-lg text-on-primary-container text-xs sm:text-sm">{starsCount}</span>
                </div>
                <div className="w-10 h-10 rounded-full overflow-hidden bg-white clay-card">
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
              <div className="flex items-center gap-3 select-none">
                <div className="w-11 h-11 rounded-2xl overflow-hidden bg-white p-0.5 clay-card">
                  <img 
                    alt="Midday Logo" 
                    className="w-full h-full object-contain" 
                    src="/logo.png" 
                  />
                </div>
                <div className="flex flex-col items-start leading-none">
                  <span className="font-display-lg text-display-lg-mobile text-primary tracking-tight font-black uppercase">Midday</span>
                  <span className="text-[9px] font-black uppercase tracking-wider text-slate-dark/30">Playbook</span>
                </div>
              </div>
              <div className="flex items-center bg-secondary-container/80 px-4 py-2 rounded-full border border-white/30 shadow-[4px_4px_8px_rgba(0,0,0,0.04),_inset_2px_2px_4px_rgba(255,255,255,0.8),_inset_-2px_-2px_4px_rgba(0,0,0,0.05)] active:scale-95 duration-200 cursor-pointer">
                <span className="text-tertiary mr-2">⭐</span>
                <span className="font-label-lg text-label-lg-mobile text-on-secondary-container">{starsCount} stars</span>
              </div>
            </>
          )}
        </header>
      )}

      {/* Main View Shell */}
      <main className="flex-grow max-w-6xl mx-auto w-full p-4 pb-28 sm:pb-32 md:pb-8 mt-1 sm:mt-4 flex flex-col justify-center relative z-0">
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
                  {activeGame === "scavenger" && (
                    <motion.div key="scavenger" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                      <SoundScavengerEngine childId={childId} onBack={() => setActiveGame("menu")} />
                    </motion.div>
                  )}
                  {activeGame === "rhyme" && (
                    <motion.div key="rhyme" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                      <RhymeRiverEngine childId={childId} onBack={() => setActiveGame("menu")} />
                    </motion.div>
                  )}
                  {activeGame === "match" && (
                    <motion.div key="match" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                      <PhonicsMatchEngine childId={childId} onBack={() => setActiveGame("menu")} />
                    </motion.div>
                  )}
                  {activeGame === "drummer" && (
                    <motion.div key="drummer" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                      <SyllableDrummerEngine childId={childId} onBack={() => setActiveGame("menu")} />
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
        <nav className="fixed bottom-5 left-1/2 -translate-x-1/2 w-[90%] max-w-md pt-3 pb-3 z-50 rounded-full bg-white/80 backdrop-blur-md border border-white/40 shadow-[8px_8px_24px_rgba(0,0,0,0.06),_inset_-4px_-4px_8px_rgba(0,0,0,0.04),_inset_4px_4px_8px_rgba(255,255,255,0.95)]">
          <div className="flex justify-around items-center px-4">
            {(["lesson", "trophies", "dashboard"] as const).map((tab) => {
              const isActive = view === tab;
              let Icon = Play;
              let label = "Play";
              
              if (tab === "trophies") { Icon = Trophy; label = "Trophies"; }
              if (tab === "dashboard") { Icon = Settings; label = "Parents"; }
              
              return (
                <div 
                  key={tab} 
                  onClick={() => handleTabClick(tab)}
                  className="flex flex-col items-center gap-1 flex-1 cursor-pointer py-0.5 group"
                >
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`w-12 h-12 rounded-full border border-white/20 flex items-center justify-center pointer-events-none transition-all duration-200 ${
                      isActive 
                        ? "bg-primary-container -translate-y-1 shadow-[4px_6px_12px_rgba(255,133,161,0.2),_inset_3px_3px_6px_rgba(255,255,255,0.95),_inset_-3px_-3px_6px_rgba(0,0,0,0.05)]" 
                        : "bg-white/95 shadow-[2px_2px_5px_rgba(0,0,0,0.03),_inset_2px_2px_4px_rgba(255,255,255,0.95),_inset_-2px_-2px_4px_rgba(0,0,0,0.04)] group-hover:-translate-y-1 group-hover:shadow-[4px_6px_10px_rgba(0,0,0,0.05),_inset_2px_2px_4px_rgba(255,255,255,0.95)]"
                    }`}
                  >
                    <Icon className="w-5 h-5 text-foreground" strokeWidth={3} />
                  </motion.button>
                  <span className={`text-[9px] font-black uppercase tracking-wider transition-colors duration-150 ${
                    isActive ? "text-primary" : "text-slate-dark/30"
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
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="p-8 max-w-sm w-full flex flex-col items-center gap-6 rounded-[2.5rem] bg-[#e9d5ff] border border-white/30 shadow-[12px_18px_32px_rgba(0,0,0,0.06),_inset_-6px_-6px_12px_rgba(0,0,0,0.05),_inset_6px_6px_12px_rgba(255,255,255,0.95)]"
            >
              <h2 className="text-3xl font-black text-center text-[#4A5358] uppercase tracking-wide">Adults Only!</h2>
              <p className="text-sm text-center font-black text-on-secondary-container">Press and hold the lock for 3 seconds to unlock.</p>
              
              <div className="relative w-36 h-36 flex items-center justify-center">
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

              <button 
                onClick={() => { setShowGate(false); setPendingTab(null); }}
                className="mt-2 w-full py-4 text-xl font-black bg-white text-[#4A5358] rounded-full clay-btn border border-white/20 transition-all"
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
