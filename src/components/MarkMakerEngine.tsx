"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { ArrowLeft, Volume2, Lightbulb } from "@/components/Icons";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import ClayButton from "@/components/ui/ClayButton";
import ClayCard from "@/components/ui/ClayCard";

interface Point {
  x: number;
  y: number;
}

const playSynthesizedSound = (type: "correct" | "wrong" | "levelUp" | "click" | "tick") => {
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
    } else if (type === "tick") {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(400, now);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(now + 0.08);
    }
  } catch (e) {
    console.error("Audio Synthesis error:", e);
  }
};

const guideTemplates = [
  {
    id: "circle",
    name: "Golden Sun Circle",
    d: "M 150,50 A 100,100 0 1,1 149.9,50 Z",
    length: 628,
    color: "#ffd166"
  },
  {
    id: "wave",
    name: "Ocean Wave Path",
    d: "M 30,150 Q 80,80 150,150 T 270,150",
    length: 300,
    color: "#3fa394"
  },
  {
    id: "zigzag",
    name: "Flamingo Zigzag",
    d: "M 30,80 L 100,220 L 170,80 L 270,220",
    length: 420,
    color: "#ff85a1"
  }
];

export default function MarkMakerEngine({ childId, onBack }: { childId: string; onBack: () => void }) {
  const [phase, setPhase] = useState<"instructions" | "timer" | "drawing" | "success">("instructions");
  const [countdown, setCountdown] = useState(5);
  const [activeTemplateIdx, setActiveTemplateIdx] = useState(0);
  const [points, setPoints] = useState<Point[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startTime] = useState<number>(() => Date.now());

  const svgRef = useRef<SVGSVGElement>(null);
  const template = guideTemplates[activeTemplateIdx];

  const speakText = useCallback((text: string) => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.85;
      utterance.pitch = 1.25;
      window.speechSynthesis.speak(utterance);
    }
  }, []);

  const runCountdown = useCallback(() => {
    setCountdown(5);
    playSynthesizedSound("tick");
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setPhase("drawing");
          return 0;
        }
        playSynthesizedSound("tick");
        return prev - 1;
      });
    }, 1000);
  }, []);

  useEffect(() => {
    if (phase === "instructions") {
      speakText("Can you stand on one foot like a flamingo? Let's count to five!");
    } else if (phase === "drawing") {
      speakText("Great balance! Now draw the flamingo's path on the screen.");
    }
  }, [phase, speakText]);

  // Convert client coordinate points into relative SVG coordinates
  const getSVGCoordinates = (e: React.PointerEvent<SVGSVGElement>): Point | null => {
    if (!svgRef.current) return null;
    const rect = svgRef.current.getBoundingClientRect();
    
    // Scale coords to the 300x300 viewBox
    const x = ((e.clientX - rect.left) / rect.width) * 300;
    const y = ((e.clientY - rect.top) / rect.height) * 300;
    return { x, y };
  };

  const handlePointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    if (phase !== "drawing") return;
    const coords = getSVGCoordinates(e);
    if (!coords) return;

    setIsDrawing(true);
    setPoints([coords]);
  };

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!isDrawing || phase !== "drawing") return;
    const coords = getSVGCoordinates(e);
    if (!coords) return;

    // Append new point
    setPoints(prev => {
      const newPoints = [...prev, coords];
      // Real-time stroke smoothing: moving average of the last 3 points
      if (newPoints.length >= 3) {
        const lastIdx = newPoints.length - 2;
        newPoints[lastIdx] = {
          x: (newPoints[lastIdx - 1].x + newPoints[lastIdx].x + newPoints[lastIdx + 1].x) / 3,
          y: (newPoints[lastIdx - 1].y + newPoints[lastIdx].y + newPoints[lastIdx + 1].y) / 3
        };
      }
      return newPoints;
    });
  };

  const handlePointerUp = () => {
    setIsDrawing(false);
    if (points.length < 5) return;

    // Check completion threshold:
    // If they have drawn more than 15 points, we arithmetically assume they traced the line
    // To keep it errorless and highly rewarding for a 3.5 year old, we reward completion automatically!
    handleTraceComplete();
  };

  const handleTraceComplete = () => {
    playSynthesizedSound("correct");
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 },
      colors: ["#ff85a1", "#ffd166", "#3fa394", "#ffffff"]
    });

    setTimeout(() => {
      if (activeTemplateIdx < guideTemplates.length - 1) {
        setActiveTemplateIdx(prev => prev + 1);
        setPoints([]);
      } else {
        handleGameComplete();
      }
    }, 1500);
  };

  const handleGameComplete = async () => {
    playSynthesizedSound("levelUp");
    setPhase("success");

    const elapsed = Date.now() - startTime;
    if (childId) {
      try {
        await fetch(`/api/progress/${childId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            targetLetter: "MARK",
            tracingScore: 100,
            phonemicScore: 100,
            timeSpentMs: elapsed
          })
        });

        await fetch(`/api/badges/${childId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            badgeName: "Mark Maker Badge"
          })
        });
      } catch (err) {
        console.error("Telemetry failed:", err);
      }
    }
  };

  // Convert point array to SVG path
  const getRenderPath = () => {
    if (points.length === 0) return "";
    let d = `M ${points[0].x},${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      d += ` L ${points[i].x},${points[i].y}`;
    }
    return d;
  };

  return (
    <div className="flex flex-col w-full max-w-4xl mx-auto h-full min-h-0 bg-[#fef5f6] p-4 rounded-[2.5rem] border-[3px] border-white/50 shadow-clay-card relative overflow-hidden select-none">
      
      {/* Background blobs */}
      <div className="absolute -z-10 bg-[#f7c2b3]/30 w-72 h-72 rounded-full blur-[90px] opacity-40 -top-10 -right-10"></div>
      
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
          <Lightbulb size={24} className="text-[#e07383]" strokeWidth={3.5} />
          Mark Maker
        </h1>

        <div className="bg-white/80 border-2 border-white/40 shadow-inner px-4 py-2 rounded-full font-black text-[#e07383] text-sm tracking-wide">
          {phase === "instructions" || phase === "timer" ? "BALANCE 🦩" : `TRACE ${activeTemplateIdx + 1}/3 ✏️`}
        </div>
      </div>

      {/* Parental Co-Play Banner */}
      <div className="bg-[#f7c2b3]/70 border-2 border-white/50 text-[#732010] p-3 rounded-2xl mb-4 text-center font-bold text-xs sm:text-sm shadow-[inset_-2px_-2px_4px_rgba(0,0,0,0.02),_inset_2px_2px_4px_rgba(255,255,255,0.8)] leading-snug shrink-0">
        <span className="text-[10px] font-black uppercase tracking-wider text-[#e07383] block mb-0.5">🧑‍🍼 Parent & Child Co-Play Option</span>
        {phase === "instructions" || phase === "timer" 
          ? 'Encourage your child: "Let\'s stand on one foot together like a bird!"' 
          : 'Praise trace progress: "Look at your beautiful glowing lines!"'
        }
      </div>

      {/* Success Modal */}
      <AnimatePresence>
        {phase === "success" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-40 bg-black/40 backdrop-blur-md flex items-center justify-center p-6"
          >
            <ClayCard
              variant="peach"
              className="max-w-md w-full p-8 text-center flex flex-col items-center gap-6 border-white/40"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
            >
              <div className="w-20 h-20 rounded-full bg-[#f7c2b3] text-[#732010] text-4xl flex items-center justify-center shadow-clay-pink mb-2">
                🎨
              </div>
              <h2 className="text-3xl font-black text-[#732010] tracking-wide uppercase">Drawing Complete!</h2>
              <p className="text-sm font-bold text-[#732010]/80 leading-relaxed">
                {"Super drawing and balancing! You've earned the Mark Maker Badge!"}
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

      {/* Active Phase Display */}
      <div className="flex-grow flex flex-col justify-between min-h-0 relative z-10">

        {/* Phase 1: Instruction & Flamingo Animation */}
        {(phase === "instructions" || phase === "timer") && (
          <div className="flex-grow flex flex-col items-center justify-center gap-6">
            <motion.div
              animate={{
                y: [0, -10, 0],
                rotate: [0, 2, -2, 0]
              }}
              transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
              className="text-8xl select-none filter drop-shadow-lg"
            >
              🦩
            </motion.div>

            {phase === "instructions" ? (
              <ClayButton
                variant="primary"
                onClick={() => {
                  setPhase("timer");
                  runCountdown();
                }}
                className="px-8 py-5 text-xl font-black rounded-full shadow-clay-pink toddler-target"
              >
                {"Let's Start! ⏰"}
              </ClayButton>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <span className="text-2xl font-black text-[#732010] uppercase">Stand on one foot!</span>
                <motion.div
                  key={countdown}
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1.5, opacity: 1 }}
                  className="text-7xl font-black text-[#e07383] mt-2"
                >
                  {countdown}
                </motion.div>
              </div>
            )}
          </div>
        )}

        {/* Phase 2: Drawing Canvas */}
        {phase === "drawing" && (
          <div className="flex-grow flex flex-col items-center justify-between min-h-0">
            {/* Guide Name */}
            <div className="text-center mb-2 shrink-0">
              <span className="text-sm font-black text-[#732010] uppercase tracking-wide">
                Trace the: {template.name}
              </span>
            </div>

            {/* Glowing Canvas board */}
            <div className="flex-grow w-full max-w-lg aspect-square bg-[#22252a] rounded-[2.5rem] border-[4px] border-white/80 shadow-clay-card relative overflow-hidden select-none">
              
              {/* Brushed texture overlay inside canvas */}
              <div className="absolute inset-0 bg-noise opacity-15 pointer-events-none" />

              <svg
                ref={svgRef}
                viewBox="0 0 300 300"
                className="w-full h-full relative z-10 touch-none"
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
              >
                {/* Guide Dotted Path */}
                <path
                  d={template.d}
                  fill="none"
                  stroke="#565d68"
                  strokeWidth="16"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d={template.d}
                  fill="none"
                  stroke={template.color}
                  strokeWidth="8"
                  strokeDasharray="10 12"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="opacity-75"
                />

                {/* User Drawn Path (Thick Neon Glowing brush) */}
                <path
                  d={getRenderPath()}
                  fill="none"
                  stroke="#ff85a1"
                  strokeWidth="14"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="opacity-95 blur-[2px]"
                  style={{ filter: "drop-shadow(0px 0px 8px #ff85a1)" }}
                />
                <path
                  d={getRenderPath()}
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>

              {/* Drawing reset button */}
              <div className="absolute bottom-4 right-4 z-20">
                <ClayButton
                  variant="surface"
                  size="sm"
                  onClick={() => {
                    playSynthesizedSound("click");
                    setPoints([]);
                  }}
                  className="p-3 shadow-md bg-white/90"
                >
                  Clear 🔄
                </ClayButton>
              </div>

            </div>

            {/* Instruction play bar */}
            <div className="w-full bg-white p-2.5 rounded-2xl border-2 border-white/60 shadow-clay-card flex items-center justify-center gap-3 z-30 mt-4 shrink-0">
              <ClayButton
                variant="surface"
                size="sm"
                onClick={() => speakText("Draw along the path!")}
                className="p-1.5 bg-[#fef5f6] rounded-full"
              >
                <Volume2 size={18} className="text-[#e07383]" strokeWidth={3.5} />
              </ClayButton>
              <span className="text-xs font-black text-[#4A5358] tracking-wide">
                Draw a line along the glowing template shape!
              </span>
            </div>

          </div>
        )}

      </div>

    </div>
  );
}
