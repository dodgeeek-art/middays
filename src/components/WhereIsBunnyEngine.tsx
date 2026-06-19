"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { ArrowLeft, Volume2, HelpCircle } from "@/components/Icons";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import confetti from "canvas-confetti";
import ClayButton from "@/components/ui/ClayButton";
import ClayCard from "@/components/ui/ClayCard";



interface RoundConfig {
  mode: "hide" | "seek";
  preposition: "behind" | "in front of" | "inside";
  targetLandmark: "tree" | "log" | "barn";
  promptText: string;
}

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

const rounds: RoundConfig[] = [
  {
    mode: "hide",
    preposition: "behind",
    targetLandmark: "tree",
    promptText: "Can you hide the bunny behind the tree?"
  },
  {
    mode: "hide",
    preposition: "inside",
    targetLandmark: "log",
    promptText: "Can you hide the bunny inside the wooden log?"
  },
  {
    mode: "hide",
    preposition: "in front of",
    targetLandmark: "barn",
    promptText: "Can you put the bunny in front of the red barn?"
  },
  {
    mode: "seek",
    preposition: "behind",
    targetLandmark: "tree",
    promptText: "Where is the bunny hiding? Tap the tree!"
  },
  {
    mode: "seek",
    preposition: "inside",
    targetLandmark: "log",
    promptText: "Where is the bunny hiding? Tap the log!"
  }
];

export default function WhereIsBunnyEngine({ childId, onBack }: { childId: string; onBack: () => void }) {
  const [currentRoundIdx, setCurrentRoundIdx] = useState(0);
  const [gameState, setGameState] = useState<"playing" | "correct" | "incorrect" | "success">("playing");
  const [dragOffsetKey, setDragOffsetKey] = useState(0);
  const [startTime] = useState<number>(() => Date.now());
  const [errorsThisGame, setErrorsThisGame] = useState(0);

  // Refs for drop collision
  const treeRef = useRef<HTMLDivElement>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const barnRef = useRef<HTMLDivElement>(null);

  const round = rounds[currentRoundIdx];

  const speakText = useCallback((text: string) => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.85;
      utterance.pitch = 1.25;
      window.speechSynthesis.speak(utterance);
    }
  }, []);

  useEffect(() => {
    if (round) {
      speakText(round.promptText);
    }
  }, [round, speakText]);

  const handleDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (round.mode !== "hide" || gameState !== "playing") return;

    const dragX = info.point.x;
    const dragY = info.point.y;

    const rectTree = treeRef.current?.getBoundingClientRect();
    const rectLog = logRef.current?.getBoundingClientRect();
    const rectBarn = barnRef.current?.getBoundingClientRect();

    let droppedLandmark: "tree" | "log" | "barn" | null = null;

    if (rectTree && dragX >= rectTree.left && dragX <= rectTree.right && dragY >= rectTree.top && dragY <= rectTree.bottom) {
      droppedLandmark = "tree";
    } else if (rectLog && dragX >= rectLog.left && dragX <= rectLog.right && dragY >= rectLog.top && dragY <= rectLog.bottom) {
      droppedLandmark = "log";
    } else if (rectBarn && dragX >= rectBarn.left && dragX <= rectBarn.right && dragY >= rectBarn.top && dragY <= rectBarn.bottom) {
      droppedLandmark = "barn";
    }

    if (!droppedLandmark) {
      setDragOffsetKey(prev => prev + 1);
      return;
    }

    if (droppedLandmark === round.targetLandmark) {
      handleSuccess();
    } else {
      handleFailure();
    }
  };

  const handleLandmarkTap = (landmarkId: "tree" | "log" | "barn") => {
    if (round.mode !== "seek" || gameState !== "playing") return;

    if (landmarkId === round.targetLandmark) {
      handleSuccess();
    } else {
      handleFailure();
    }
  };

  const handleSuccess = () => {
    setGameState("correct");
    playSynthesizedSound("correct");
    speakText("You found it! Good job!");

    confetti({
      particleCount: 60,
      spread: 50,
      origin: { y: 0.7 },
      colors: ["#bee8d4", "#ffc4c0", "#ddcbf5", "#ffffff"]
    });

    setTimeout(() => {
      if (currentRoundIdx < rounds.length - 1) {
        setGameState("playing");
        setCurrentRoundIdx(prev => prev + 1);
      } else {
        handleGameComplete();
      }
    }, 2000);
  };

  const handleFailure = () => {
    setGameState("incorrect");
    playSynthesizedSound("wrong");
    setErrorsThisGame(prev => prev + 1);
    speakText("Try again!");

    setTimeout(() => {
      setGameState("playing");
      setDragOffsetKey(prev => prev + 1);
    }, 1200);
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
            targetLetter: "BUNNY",
            tracingScore: Math.max(0, 100 - errorsThisGame * 15),
            phonemicScore: 100,
            timeSpentMs: elapsed
          })
        });

        await fetch(`/api/badges/${childId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            badgeName: "Spatial Master"
          })
        });
      } catch (err) {
        console.error("Telemetry failed:", err);
      }
    }
  };

  // Render composite styling for prepositions
  const getBunnyOverlayStyle = (landmark: "tree" | "log" | "barn") => {
    if (round.mode === "seek" && gameState !== "correct") {
      // Hide bunny completely for seek mode until correct
      return "hidden";
    }

    const prep = round.preposition;

    if (landmark !== round.targetLandmark) return "hidden";

    if (prep === "behind") {
      // Ears peeking over the top, lower z-index
      return "absolute bottom-12 left-1/2 -translate-x-1/2 z-0 scale-75 opacity-80 translateY-[-20px]";
    } else if (prep === "inside") {
      // Body cut off, ears peek out
      return "absolute bottom-4 left-1/2 -translate-x-1/2 z-10 scale-90 clip-bunny";
    } else {
      // In front, high z-index
      return "absolute -bottom-6 left-1/2 -translate-x-1/2 z-30 scale-100";
    }
  };

  // Co-play prompt text for parent banner
  const getParentPrompt = () => {
    if (currentRoundIdx === 0) {
      return 'Help your child locate the tree. Ask: "Is the bunny behind or in front of the leaves?"';
    } else if (currentRoundIdx === 1) {
      return 'Talk about "inside": "The bunny crawled inside the log. What else can go inside a log?"';
    } else if (currentRoundIdx === 2) {
      return 'Talk about "in front of": "Can you stand in front of me?"';
    }
    return 'Play along! Ask: "Can you hide a toy under a cup or behind your back?"';
  };

  return (
    <div className="flex flex-col w-full max-w-4xl mx-auto h-full min-h-0 bg-[#eef1f6] p-4 rounded-[2.5rem] border-[3px] border-white/50 shadow-clay-card relative overflow-hidden select-none">
      
      {/* Background blobs */}
      <div className="absolute -z-10 bg-[#c3e6dc] w-72 h-72 rounded-full blur-[90px] opacity-40 -bottom-10 -left-10"></div>
      
      {/* Header */}
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
          <HelpCircle size={24} className="text-[#3fa394]" strokeWidth={3.5} />
          Where is Bunny?
        </h1>

        <div className="bg-white/80 border-2 border-white/40 shadow-inner px-4 py-2 rounded-full font-black text-[#3fa394] text-sm tracking-wide">
          ROUND {currentRoundIdx + 1}/{rounds.length}
        </div>
      </div>

      {/* Parental Co-Play Banner */}
      <div className="bg-[#bee8d4]/80 border-2 border-white/50 text-[#16533f] p-3 rounded-2xl mb-4 text-center font-bold text-xs sm:text-sm shadow-[inset_-2px_-2px_4px_rgba(0,0,0,0.02),_inset_2px_2px_4px_rgba(255,255,255,0.8)] leading-snug shrink-0">
        <span className="text-[10px] font-black uppercase tracking-wider text-[#3fa394] block mb-0.5">🧑‍🍼 Parent & Child Co-Play Option</span>
        {getParentPrompt()}
      </div>

      {/* Success Modal */}
      <AnimatePresence>
        {gameState === "success" && (
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
              <div className="w-20 h-20 rounded-full bg-[#3fa394] text-white text-4xl flex items-center justify-center shadow-clay-mint mb-2">
                🐰
              </div>
              <h2 className="text-3xl font-black text-[#0d4036] tracking-wide uppercase">All Found!</h2>
              <p className="text-sm font-bold text-[#0d4036]/80 leading-relaxed">
                Super spatial skills! You understand prepositions perfectly now. You earned the Spatial Master badge!
              </p>

              <ClayButton
                variant="primary"
                onClick={onBack}
                className="w-full py-4 text-lg font-black rounded-full mt-2 toddler-target"
              >
                Back to Map 🏆
              </ClayButton>
            </ClayCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Game Board Landscape */}
      <div className="flex-grow flex flex-col justify-between min-h-0 relative z-10">
        
        {/* Playable landmarks landscape */}
        <div className="flex-grow grid grid-cols-3 gap-4 items-end justify-items-center pb-20 relative">
          
          {/* Landmark 1: Oak Tree */}
          <div
            ref={treeRef}
            onClick={() => handleLandmarkTap("tree")}
            className={`w-28 sm:w-36 aspect-[0.7] rounded-[2rem] border-2 border-white/30 bg-white/40 shadow-inner flex flex-col items-center justify-end p-2 relative cursor-pointer ${
              gameState === "incorrect" && round.targetLandmark !== "tree" ? "opacity-40" : ""
            } ${round.mode === "seek" ? "hover:scale-105 active:scale-95 transition-transform" : ""}`}
          >
            {/* Bunny peeking overlay */}
            <div className={getBunnyOverlayStyle("tree")}>
              <span className="text-4xl filter drop-shadow-md select-none">🐰</span>
            </div>

            {/* Tree SVG/Emoji representation */}
            <span className="text-7xl sm:text-8xl select-none filter drop-shadow-md z-10">🌳</span>
            <span className="text-[10px] font-black uppercase text-slate-dark tracking-wider mt-1 z-10 select-none">Tree</span>
          </div>

          {/* Landmark 2: Log */}
          <div
            ref={logRef}
            onClick={() => handleLandmarkTap("log")}
            className={`w-28 sm:w-36 aspect-[0.7] rounded-[2rem] border-2 border-white/30 bg-white/40 shadow-inner flex flex-col items-center justify-end p-2 relative cursor-pointer ${
              gameState === "incorrect" && round.targetLandmark !== "log" ? "opacity-40" : ""
            } ${round.mode === "seek" ? "hover:scale-105 active:scale-95 transition-transform" : ""}`}
          >
            {/* Bunny inside/under log overlay */}
            <div className={getBunnyOverlayStyle("log")}>
              <span className="text-4xl filter drop-shadow-md select-none">🐰</span>
            </div>

            <span className="text-7xl sm:text-8xl select-none filter drop-shadow-md z-10">🪵</span>
            <span className="text-[10px] font-black uppercase text-slate-dark tracking-wider mt-1 z-10 select-none">Log</span>
          </div>

          {/* Landmark 3: Barn */}
          <div
            ref={barnRef}
            onClick={() => handleLandmarkTap("barn")}
            className={`w-28 sm:w-36 aspect-[0.7] rounded-[2rem] border-2 border-white/30 bg-white/40 shadow-inner flex flex-col items-center justify-end p-2 relative cursor-pointer ${
              gameState === "incorrect" && round.targetLandmark !== "barn" ? "opacity-40" : ""
            } ${round.mode === "seek" ? "hover:scale-105 active:scale-95 transition-transform" : ""}`}
          >
            {/* Bunny overlay */}
            <div className={getBunnyOverlayStyle("barn")}>
              <span className="text-4xl filter drop-shadow-md select-none">🐰</span>
            </div>

            <span className="text-7xl sm:text-8xl select-none filter drop-shadow-md z-10">🏡</span>
            <span className="text-[10px] font-black uppercase text-slate-dark tracking-wider mt-1 z-10 select-none">Barn</span>
          </div>

        </div>

        {/* Audio prompt banner */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-[90%] max-w-md bg-white p-3 rounded-2xl border-2 border-white/60 shadow-clay-card flex items-center justify-center gap-3 z-30">
          <ClayButton
            variant="surface"
            size="sm"
            onClick={() => speakText(round.promptText)}
            className="p-2 bg-[#eef1f6] rounded-full"
          >
            <Volume2 size={20} className="text-[#3fa394]" strokeWidth={3.5} />
          </ClayButton>
          <span className="text-sm font-black text-[#4A5358] tracking-wide text-center">
            {round.promptText}
          </span>
        </div>

        {/* Draggable Bunny Drawer (Only shown in HIDE mode) */}
        {round.mode === "hide" && (gameState === "playing" || gameState === "incorrect") && (
          <div className="h-28 flex items-center justify-center shrink-0 pb-4 relative z-30">
            <AnimatePresence mode="wait">
              <motion.div
                key={`bunny-${dragOffsetKey}`}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                className="relative cursor-grab active:cursor-grabbing toddler-target"
                style={{ touchAction: "none" }}
              >
                {/* Visual drag glow ring */}
                <div className="absolute inset-0 rounded-full bg-[#ddcbf5] filter blur-lg opacity-40 scale-125 -z-10" />

                <motion.div
                  drag
                  dragSnapToOrigin={true}
                  dragElastic={0.65}
                  onDragEnd={handleDragEnd}
                  whileDrag={{ scale: 1.2, rotate: -3 }}
                  className={`w-20 h-20 bg-white rounded-full border-[3px] border-white/60 shadow-clay-card flex items-center justify-center text-4xl select-none ${
                    gameState === "incorrect" ? "animate-shake border-red-400 bg-red-50" : ""
                  }`}
                >
                  🐰
                </motion.div>
              </motion.div>
            </AnimatePresence>
          </div>
        )}

      </div>

      <style jsx global>{`
        /* Bunny clipping trick for log: cuts off bottom 40% of bunny's body to look hollow */
        .clip-bunny {
          clip-path: inset(0 0 35% 0);
          bottom: 32px !important;
        }
      `}</style>
    </div>
  );
}
