"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { ArrowLeft, Sparkles, Smile, Volume2 } from "@/components/Icons";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import ClayButton from "@/components/ui/ClayButton";
import { vocabularyList } from "@/lib/svgDictionary";

// 3D Paint Tube component for clay squeeze tubes
function PaintTube({ color, isSqueezing, onClick }: { color: "red" | "yellow" | "blue"; isSqueezing: boolean; onClick: () => void }) {
  const currentGradient = {
    red: { from: "#ff758f", via: "#ff4d6d", to: "#c9183b" },
    yellow: { from: "#ffe194", via: "#ffd166", to: "#e5a91b" },
    blue: { from: "#4ea8de", via: "#118ab2", to: "#006494" }
  }[color];

  const labelMap = { red: "RED", yellow: "YELLOW", blue: "BLUE" };

  return (
    <div className="flex flex-col items-center gap-0.5 select-none shrink-0">
      <motion.button
        animate={isSqueezing ? { scaleY: 0.75, scaleX: 1.15, y: 5 } : { scaleY: 1, scaleX: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 350, damping: 10 }}
        onClick={onClick}
        className="w-20 h-36 xs:w-24 xs:h-44 sm:w-28 sm:h-48 md:w-32 md:h-56 relative flex flex-col justify-between items-center outline-none cursor-pointer"
        style={{ touchAction: "none" }}
      >
        <svg viewBox="0 0 80 140" className="w-full h-full filter drop-shadow-[0_8px_10px_rgba(0,0,0,0.12)]">
          <defs>
            <linearGradient id={`tubeGrad-${color}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={currentGradient.from} />
              <stop offset="35%" stopColor={currentGradient.via} />
              <stop offset="100%" stopColor={currentGradient.to} />
            </linearGradient>
            <linearGradient id={`silverGrad-${color}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#cbd5e1" />
              <stop offset="50%" stopColor="#f1f5f9" />
              <stop offset="100%" stopColor="#94a3b8" />
            </linearGradient>
            <linearGradient id={`darkMetal-${color}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#475569" />
              <stop offset="50%" stopColor="#94a3b8" />
              <stop offset="100%" stopColor="#334155" />
            </linearGradient>
          </defs>

          {/* Tube body */}
          <path
            d="M 12 25 
               C 12 25, 12 110, 12 110 
               C 12 118, 25 120, 40 120 
               C 55 120, 68 118, 68 110 
               C 68 110, 68 25, 68 25 
               Z"
            fill={`url(#tubeGrad-${color})`}
          />

          {/* Glossy vertical reflection strip on tube */}
          <path
            d="M 22 25 
               C 22 25, 22 108, 22 108 
               C 22 112, 28 114, 30 114 
               C 28 114, 25 112, 25 108 
               C 25 108, 25 25, 25 25 
               Z"
            fill="#ffffff"
            opacity="0.3"
          />

          {/* Metal crimp at top */}
          <rect x="10" y="10" width="60" height="15" rx="3" fill={`url(#silverGrad-${color})`} />
          {/* Crimp ridges */}
          <line x1="14" y1="15" x2="66" y2="15" stroke="#94a3b8" strokeWidth="1.5" />
          <line x1="14" y1="20" x2="66" y2="20" stroke="#94a3b8" strokeWidth="1.5" />

          {/* White label on tube */}
          <rect x="20" y="42" width="40" height="42" rx="4" fill="#ffffff" opacity="0.92" stroke="#e2e8f0" strokeWidth="1" />
          {/* Text inside label */}
          <text
            x="40"
            y="68"
            fontFamily="system-ui, sans-serif"
            fontWeight="900"
            fontSize="9"
            letterSpacing="0.5"
            fill={currentGradient.to}
            textAnchor="middle"
          >
            {labelMap[color]}
          </text>

          {/* Nozzle collar at bottom */}
          <path d="M 30 120 L 50 120 L 46 128 L 34 128 Z" fill={`url(#darkMetal-${color})`} />

          {/* Cap at bottom */}
          <rect x="32" y="128" width="16" height="10" rx="2" fill={`url(#silverGrad-${color})`} stroke="#64748b" strokeWidth="0.5" />
          <line x1="36" y1="128" x2="36" y2="138" stroke="#94a3b8" strokeWidth="1" />
          <line x1="40" y1="128" x2="40" y2="138" stroke="#94a3b8" strokeWidth="1" />
          <line x1="44" y1="128" x2="44" y2="138" stroke="#94a3b8" strokeWidth="1" />
        </svg>
      </motion.button>
    </div>
  );
}

interface PigmentBlobState {
  id: number;
  color: string;
  type: "red" | "yellow" | "blue";
  x: number; // relative horizontal position inside jar
  y: number; // initial drop height
  isDropped: boolean;
  angle: number; // orbital angle inside jar
  radius: number; // orbital radius inside jar
}

interface AlchemyLevel {
  targetName: "Orange" | "Green" | "Purple" | "Brown";
  targetColor: string; // Hex color
  vocabName: string;
  mascotSpeech: string;
  check: (r: number, y: number, b: number) => boolean;
}

const levels: AlchemyLevel[] = [
  {
    targetName: "Orange",
    targetColor: "#ff7b00",
    vocabName: "Fox",
    mascotSpeech: "Help the Fox mix Orange clay! We need Red and Yellow!",
    check: (r, y, b) => r > 0 && y > 0 && b === 0
  },
  {
    targetName: "Green",
    targetColor: "#00c853",
    vocabName: "Frog",
    mascotSpeech: "Help the Frog mix Green clay! Try Yellow and Blue!",
    check: (r, y, b) => y > 0 && b > 0 && r === 0
  },
  {
    targetName: "Purple",
    targetColor: "#9e7bf5",
    vocabName: "Koala",
    mascotSpeech: "Help the Koala mix Purple clay! Try Red and Blue!",
    check: (r, y, b) => r > 0 && b > 0 && y === 0
  },
  {
    targetName: "Brown",
    targetColor: "#8d6e63",
    vocabName: "Bear",
    mascotSpeech: "Help the Bear mix Brown clay! Mix Red, Yellow, and Blue together!",
    check: (r, y, b) => r > 0 && y > 0 && b > 0
  }
];

export default function ClayAlchemyEngine({ childId, onBack }: { childId: string; onBack: () => void }) {
  const [levelIdx, setLevelIdx] = useState(0);
  const [redAmt, setRedAmt] = useState(0);
  const [yellowAmt, setYellowAmt] = useState(0);
  const [blueAmt, setBlueAmt] = useState(0);
  const [mixProgress, setMixProgress] = useState(0); // 0 to 100
  const [pourState, setPourState] = useState<"idle" | "pouring" | "fed">("idle");
  const [blobs, setBlobs] = useState<PigmentBlobState[]>([]);
  const [squeezingTube, setSqueezingTube] = useState<"red" | "yellow" | "blue" | null>(null);
  const [crankVisualAngle, setCrankVisualAngle] = useState(0);
  const [startTime] = useState<number>(() => Date.now());
  const [isShaking, setIsShaking] = useState(false);

  const isDraggingCrank = useRef(false);
  const crankAngleRef = useRef(0);
  const nextBlobId = useRef(0);

  const activeLevel = levels[levelIdx];
  const vocabItem = vocabularyList.find(v => v.name === activeLevel.vocabName);
  const MascotIcon = vocabItem?.icon;

  const speakText = useCallback((text: string) => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1.15;
      utterance.volume = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  }, []);

  const playSynthesizedSound = (type: "correct" | "click" | "squeeze" | "blend") => {
    if (typeof window === "undefined") return;
    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      const now = ctx.currentTime;
      if (type === "correct") {
        [261.63, 329.63, 392.00, 523.25].forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(freq, now + idx * 0.08);
          gain.gain.setValueAtTime(0.2, now + idx * 0.08);
          gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.08 + 0.2);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + idx * 0.08);
          osc.stop(now + idx * 0.08 + 0.22);
        });
      } else if (type === "click") {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.setValueAtTime(600, now);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(now + 0.05);
      } else if (type === "squeeze") {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(160, now);
        osc.frequency.exponentialRampToValueAtTime(70, now + 0.35);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(now + 0.35);
      } else if (type === "blend") {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(200, now);
        osc.frequency.exponentialRampToValueAtTime(240, now + 0.12);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(now + 0.12);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    setRedAmt(0);
    setYellowAmt(0);
    setBlueAmt(0);
    setMixProgress(0);
    setPourState("idle");
    setBlobs([]);
    setCrankVisualAngle(0);
    crankAngleRef.current = 0;
    setIsShaking(false);
    speakText(activeLevel.mascotSpeech);
  }, [levelIdx, activeLevel, speakText]);

  const handleSqueeze = (type: "red" | "yellow" | "blue") => {
    if (pourState !== "idle" || isShaking) return;
    setSqueezingTube(type);
    playSynthesizedSound("squeeze");

    const colorMap = {
      red: "#ff4d6d",
      yellow: "#ffd166",
      blue: "#118ab2"
    };

    const newBlob: PigmentBlobState = {
      id: nextBlobId.current++,
      color: colorMap[type],
      type,
      x: 40 + Math.random() * 80,
      y: -60,
      isDropped: false,
      angle: Math.random() * Math.PI * 2,
      radius: 20 + Math.random() * 25 // Set within target blending orbit inside jar
    };

    setBlobs(prev => [...prev, newBlob]);

    setTimeout(() => {
      setSqueezingTube(null);
    }, 450);
  };

  const handleBlobLand = (blobId: number, type: "red" | "yellow" | "blue") => {
    setBlobs(prev => prev.map(b => b.id === blobId ? { ...b, isDropped: true } : b));
    if (type === "red") setRedAmt(prev => prev + 1);
    else if (type === "yellow") setYellowAmt(prev => prev + 1);
    else if (type === "blue") setBlueAmt(prev => prev + 1);
    setMixProgress(0); // Reset progress as new unmixed pigment is added
  };

  const handleCrankPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const total = redAmt + yellowAmt + blueAmt;
    if (total === 0 || pourState !== "idle" || isShaking) return;
    isDraggingCrank.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);

    const rect = e.currentTarget.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    crankAngleRef.current = Math.atan2(e.clientY - cy, e.clientX - cx);
  };

  const handleCrankPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingCrank.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;

    const angle = Math.atan2(e.clientY - cy, e.clientX - cx);
    let delta = angle - crankAngleRef.current;
    delta = Math.atan2(Math.sin(delta), Math.cos(delta));
    const absDelta = Math.abs(delta);

    if (absDelta > 0.05) {
      crankAngleRef.current = angle;
      setCrankVisualAngle(angle);

      setMixProgress(prev => {
        const increment = absDelta * 5.5; // Smooth incremental progress multiplier
        const next = Math.min(100, prev + increment);
        if (Math.floor(next) > Math.floor(prev) && Math.floor(next) % 15 === 0) {
          playSynthesizedSound("blend");
        }
        return next;
      });

      // Slowly spiral unblended blobs inward and rotate them
      setBlobs(prev =>
        prev.map(blob => {
          if (!blob.isDropped) return blob;
          const newAngle = blob.angle + delta * 0.8;
          return {
            ...blob,
            angle: newAngle,
            radius: Math.max(5, blob.radius * (1 - absDelta * 0.015))
          };
        })
      );
    }
  };

  const handleCrankPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    isDraggingCrank.current = false;
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  const getMixedColor = (r: number, y: number, b: number) => {
    const total = r + y + b;
    if (total === 0) return "rgba(255, 255, 255, 0.15)";
    const r_pct = r / total;
    const y_pct = y / total;
    const b_pct = b / total;

    const redColor = { r: 255, g: 77, b: 109 };
    const yellowColor = { r: 255, g: 209, b: 102 };
    const blueColor = { r: 17, g: 138, b: 178 };

    const target_r = r_pct * redColor.r + y_pct * yellowColor.r + b_pct * blueColor.r;
    const target_g = r_pct * redColor.g + y_pct * yellowColor.g + b_pct * blueColor.g;
    const target_b = r_pct * redColor.b + y_pct * yellowColor.b + b_pct * blueColor.b;

    return `rgb(${Math.round(target_r)}, ${Math.round(target_g)}, ${Math.round(target_b)})`;
  };

  const handleClear = () => {
    playSynthesizedSound("click");
    setRedAmt(0);
    setYellowAmt(0);
    setBlueAmt(0);
    setMixProgress(0);
    setPourState("idle");
    setBlobs([]);
    setIsShaking(false);
  };

  const totalAdded = redAmt + yellowAmt + blueAmt;
  const displayColor = getMixedColor(redAmt, yellowAmt, blueAmt);

  // Auto-Success Evaluator effect
  useEffect(() => {
    if (mixProgress >= 100 && pourState === "idle" && totalAdded > 0) {
      const match = activeLevel.check(redAmt, yellowAmt, blueAmt);
      if (match) {
        setPourState("fed");
        playSynthesizedSound("correct");
        confetti({
          particleCount: 65,
          spread: 60,
          origin: { y: 0.65 }
        });

        if (childId) {
          const elapsed = Date.now() - startTime;
          fetch(`/api/progress/${childId}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              targetLetter: "ALCH",
              tracingScore: 100,
              phonemicScore: 100,
              timeSpentMs: elapsed
            })
          }).catch(err => console.error("Telemetry failed:", err));
        }

        setTimeout(() => {
          setLevelIdx(prev => (prev + 1) % levels.length);
        }, 2500);
      } else {
        playSynthesizedSound("click");
        speakText("Oops! That mixed a different color. Let's tap Clear and try again!");
        setIsShaking(true);
        setMixProgress(0); // Reset mix progress immediately to break feedback trigger loops
        setTimeout(() => {
          setIsShaking(false);
        }, 600);
      }
    }
  }, [mixProgress, pourState, totalAdded, redAmt, yellowAmt, blueAmt, activeLevel, childId, startTime, speakText]);

  // Equation rendering helper
  const renderFormula = () => {
    const renderPill = (colorName: string, emoji: string, bgClass: string, textClass: string, borderClass: string) => (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 sm:px-3 sm:py-1 rounded-full border-2 ${bgClass} ${textClass} ${borderClass} font-black text-[10px] sm:text-xs shadow-sm select-none shrink-0`}>
        <span className="text-sm sm:text-base leading-none">{emoji}</span>
        <span className="uppercase tracking-wider">{colorName}</span>
      </span>
    );

    const plusSign = (
      <span className="text-slate-400 font-black text-xs sm:text-sm px-0.5 select-none shrink-0">+</span>
    );

    const equalSign = (
      <span className="text-slate-400 font-black text-xs sm:text-sm px-0.5 select-none shrink-0">=</span>
    );

    switch (activeLevel.targetName) {
      case "Orange":
        return (
          <div className="flex items-center gap-1 sm:gap-1.5 flex-nowrap select-none shrink-0">
            {renderPill("Red", "🔴", "bg-rose-50/90", "text-rose-500", "border-rose-200")}
            {plusSign}
            {renderPill("Yellow", "🟡", "bg-amber-50/90", "text-amber-500", "border-amber-200")}
            {equalSign}
            {renderPill("Orange", "🟠", "bg-orange-50/90", "text-orange-500", "border-orange-200")}
          </div>
        );
      case "Green":
        return (
          <div className="flex items-center gap-1 sm:gap-1.5 flex-nowrap select-none shrink-0">
            {renderPill("Yellow", "🟡", "bg-amber-50/90", "text-amber-500", "border-amber-200")}
            {plusSign}
            {renderPill("Blue", "🔵", "bg-sky-50/90", "text-sky-500", "border-sky-200")}
            {equalSign}
            {renderPill("Green", "🟢", "bg-emerald-50/90", "text-emerald-500", "border-emerald-200")}
          </div>
        );
      case "Purple":
        return (
          <div className="flex items-center gap-1 sm:gap-1.5 flex-nowrap select-none shrink-0">
            {renderPill("Red", "🔴", "bg-rose-50/90", "text-rose-500", "border-rose-200")}
            {plusSign}
            {renderPill("Blue", "🔵", "bg-sky-50/90", "text-sky-500", "border-sky-200")}
            {equalSign}
            {renderPill("Purple", "🟣", "bg-purple-50/90", "text-purple-500", "border-purple-200")}
          </div>
        );
      case "Brown":
        return (
          <div className="flex items-center gap-0.5 sm:gap-1 flex-nowrap select-none shrink-0">
            {renderPill("Red", "🔴", "bg-rose-50/90", "text-rose-500", "border-rose-200")}
            {plusSign}
            {renderPill("Yellow", "🟡", "bg-amber-50/90", "text-amber-500", "border-amber-200")}
            {plusSign}
            {renderPill("Blue", "🔵", "bg-sky-50/90", "text-sky-500", "border-sky-200")}
            {equalSign}
            {renderPill("Brown", "🟤", "bg-stone-100/90", "text-stone-700", "border-stone-300")}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col w-full max-w-4xl mx-auto h-full min-h-0 bg-gradient-to-b from-[#fbf8f3] to-[#f4ebe1] p-3 sm:p-5 rounded-[2.5rem] border-[3px] border-white/50 shadow-clay-card relative overflow-hidden select-none">
      
      {/* Grid Table Pattern decor background */}
      <div 
        className="absolute inset-0 opacity-[0.06] pointer-events-none" 
        style={{
          backgroundImage: "linear-gradient(rgba(0, 0, 0, 0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 0, 0, 0.15) 1px, transparent 1px)",
          backgroundSize: "28px 28px"
        }}
      />

      {/* Global SVG Gradients for Blades */}
      <svg className="hidden">
        <defs>
          <linearGradient id="silverGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#cbd5e1" />
            <stop offset="50%" stopColor="#f1f5f9" />
            <stop offset="100%" stopColor="#94a3b8" />
          </linearGradient>
          <linearGradient id="darkMetal" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#475569" />
            <stop offset="50%" stopColor="#94a3b8" />
            <stop offset="100%" stopColor="#334155" />
          </linearGradient>
        </defs>
      </svg>

      {/* Background ambient glow shapes */}
      <div className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full bg-[#ffd166]/10 blur-3xl pointer-events-none" />
      <div className="absolute -top-20 -left-20 w-80 h-80 rounded-full bg-[#118ab2]/5 blur-3xl pointer-events-none" />

      {/* Top Header Row */}
      <div className="flex items-center justify-between mb-3 sm:mb-4 shrink-0 z-20">
        <ClayButton
          variant="surface"
          size="icon"
          className="min-w-[64px] min-h-[64px] border-2 border-white/50 active:scale-95 shadow-md"
          onClick={onBack}
        >
          <ArrowLeft size={28} strokeWidth={3.5} className="text-[#5c6b73]" />
        </ClayButton>

        <h1 className="text-xl sm:text-2xl font-black uppercase text-[#2f3e46] tracking-wider flex items-center gap-2">
          🧪 Clay Alchemy
        </h1>

        <div className="bg-[#ffd166] text-[#6d4c00] border-2 border-white shadow-inner px-4 py-2 rounded-full font-black text-sm tracking-wide">
          LEVEL {levelIdx + 1}/{levels.length}
        </div>
      </div>

      {/* Mascot Speech Bubble Instruction */}
      <div 
        onClick={() => speakText(activeLevel.mascotSpeech)}
        className="w-full max-w-xl flex items-center gap-4 mb-4 sm:mb-6 z-10 cursor-pointer select-none active:scale-[0.99] transition-all self-center"
      >
        {/* Mascot Face Icon */}
        {MascotIcon && (
          <div className="w-16 h-16 sm:w-20 sm:h-20 shrink-0 flex items-center justify-center overflow-visible relative">
            <MascotIcon size="100%" animClass="anim-sway" />
          </div>
        )}
        
        {/* Speech Bubble */}
        <div className="flex-1 relative bg-white border border-[#4a5358]/10 p-2 sm:p-4 rounded-[2rem] shadow-[4px_4px_12px_rgba(0,0,0,0.03),_inset_2px_2px_4px_rgba(255,255,255,0.9)] text-left flex flex-col justify-center min-h-[64px] sm:min-h-[72px] min-w-0">
          {/* Arrow */}
          <div className="absolute top-1/2 -left-3 -translate-y-1/2 w-0 h-0 border-t-[8px] border-t-transparent border-r-[12px] border-r-white border-b-[8px] border-b-transparent filter drop-shadow-[-1px_0_0_rgba(74,83,88,0.06)]"></div>
          
          <div className="flex items-center gap-2 w-full min-w-0 justify-between">
            <div className="min-w-0 overflow-x-visible">
              {renderFormula()}
            </div>
            <Volume2 className="w-5 h-5 text-slate-400 shrink-0 animate-pulse ml-2" />
          </div>
        </div>
      </div>

      {/* Play Workspace */}
      <div className="flex-grow flex flex-col md:flex-row gap-6 sm:gap-10 min-h-0 relative z-10 items-center justify-center">
        
        {/* Left Column: Squeeze Clay Tubes (Rendered directly, no background card wrapper) */}
        <div className="flex md:flex-col justify-center items-center gap-6 sm:gap-8 md:w-36 shrink-0 z-20">
          {(["red", "yellow", "blue"] as const).map(color => (
            <PaintTube
              key={color}
              color={color}
              isSqueezing={squeezingTube === color}
              onClick={() => handleSqueeze(color)}
            />
          ))}
        </div>

        {/* Center/Right: Bird's Eye View Blender Jar (Rendered directly on main background, scaled up significantly!) */}
        <motion.div
            animate={isShaking ? { x: [0, -12, 12, -12, 12, 0] } : {}}
            transition={{ type: "tween", duration: 0.5 }}
            className="relative w-60 h-60 xs:w-68 xs:h-68 sm:w-84 sm:h-84 md:w-[28rem] md:h-[28rem] rounded-full bg-[#f8f6f2] shadow-[0_12px_28px_rgba(0,0,0,0.06),_inset_0_3px_10px_rgba(0,0,0,0.05),_0_0_0_6px_white] flex items-center justify-center overflow-visible touch-none border border-slate-200/20"
            onPointerDown={handleCrankPointerDown}
            onPointerMove={handleCrankPointerMove}
            onPointerUp={handleCrankPointerUp}
            style={{ cursor: isDraggingCrank.current ? "grabbing" : "grab" }}
          >
            {/* Rotating Jar Assembly */}
            <motion.div
              animate={{ rotate: (crankVisualAngle * 180) / Math.PI }}
              transition={{ type: "tween", ease: "linear", duration: 0.05 }}
              className="absolute inset-0 w-full h-full rounded-full flex items-center justify-center overflow-visible pointer-events-none"
            >
              {/* Left Jar Handle (Soft clay ear) */}
              <div className="absolute -left-5 sm:-left-6 top-1/2 -translate-y-1/2 w-5 sm:w-6 h-12 sm:h-18 bg-[#94a3b8] rounded-l-[1.25rem] border-2 border-white shadow-[0_3px_6px_rgba(0,0,0,0.06),_inset_1.5px_1.5px_3px_rgba(255,255,255,0.4)] pointer-events-none" />
              
              {/* Right Jar Handle (Soft clay ear) */}
              <div className="absolute -right-5 sm:-right-6 top-1/2 -translate-y-1/2 w-5 sm:w-6 h-12 sm:h-18 bg-[#94a3b8] rounded-r-[1.25rem] border-2 border-white shadow-[0_3px_6px_rgba(0,0,0,0.06),_inset_-1.5px_1.5px_3px_rgba(255,255,255,0.4)] pointer-events-none" />

              {/* Glass Inner Rim reflection highlights */}
              <div className="absolute inset-0.5 rounded-full border-[6px] sm:border-[8px] border-slate-300/30 pointer-events-none" />
              <div className="absolute inset-2 rounded-full border-t-2 sm:border-t-4 border-l border-white/35 pointer-events-none" />

              {/* Jar measurements lines */}
              <div className="absolute left-5 sm:left-7 top-1/2 -translate-y-1/2 flex flex-col gap-1.5 sm:gap-2 opacity-35 select-none pointer-events-none">
                <div className="w-2.5 sm:w-3.5 h-0.5 bg-slate-400" />
                <div className="w-1.5 sm:w-2.5 h-0.5 bg-slate-400" />
                <div className="w-3.5 sm:w-4.5 h-0.5 bg-slate-400" />
                <div className="w-1.5 sm:w-2.5 h-0.5 bg-slate-400" />
                <div className="w-2.5 sm:w-3.5 h-0.5 bg-slate-400" />
              </div>

              {/* Blended Liquid Fill */}
              {totalAdded > 0 && (
                <div
                  className="absolute inset-0 rounded-full transition-all duration-300 pointer-events-none"
                  style={{
                    backgroundColor: displayColor,
                    opacity: Math.max(0.12, mixProgress / 100),
                    boxShadow: "inset 0 4px 16px rgba(0,0,0,0.18), inset 0 -4px 16px rgba(255,255,255,0.2)"
                  }}
                />
              )}

              {/* Dropped Blobs (rendered inside the rotating wrapper) */}
              <div className="absolute inset-0 rounded-full overflow-hidden pointer-events-none z-20">
                {blobs.filter(b => b.isDropped).map(blob => {
                  const targetX = 50 + Math.cos(blob.angle) * blob.radius;
                  const targetY = 50 + Math.sin(blob.angle) * blob.radius;
                  const scale = Math.max(0, 1 - mixProgress / 100);
                  if (scale <= 0.05) return null;

                  return (
                    <motion.div
                      key={blob.id}
                      animate={{
                        left: `${targetX}%`,
                        top: `${targetY}%`,
                        scale: scale,
                        opacity: scale
                      }}
                      transition={{ ease: "linear", duration: 0.05 }}
                      className="absolute w-8 h-8 sm:w-12 sm:h-12 rounded-full z-20 -translate-x-1/2 -translate-y-1/2 filter blur-[0.5px]"
                      style={{
                        backgroundColor: blob.color,
                        boxShadow: "inset 2px 2px 4px rgba(255,255,255,0.45), inset -2px -2px 4px rgba(0,0,0,0.25)"
                      }}
                    />
                  );
                })}
              </div>

              {/* Center Clay Blade (Scaled up!) */}
              <div className="absolute pointer-events-none z-30 flex items-center justify-center">
                <svg viewBox="0 0 100 100" className="w-20 h-20 sm:w-28 sm:h-28 filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.12)]">
                  <path d="M 50 50 C 65 35, 80 45, 85 50 C 80 55, 65 65, 50 50 Z" fill="#64748b" stroke="white" strokeWidth="1" />
                  <path d="M 50 50 C 35 65, 20 55, 15 50 C 20 45, 35 35, 50 50 Z" fill="#64748b" stroke="white" strokeWidth="1" />
                  <path d="M 50 50 C 65 65, 55 80, 50 85 C 45 80, 35 65, 50 50 Z" fill="#64748b" stroke="white" strokeWidth="1" />
                  <path d="M 50 50 C 35 35, 45 20, 50 15 C 55 20, 65 35, 50 50 Z" fill="#64748b" stroke="white" strokeWidth="1" />
                  <circle cx="50" cy="50" r="7" fill="#475569" stroke="white" strokeWidth="1" />
                  <circle cx="50" cy="50" r="2" fill="white" opacity="0.9" />
                </svg>
              </div>
            </motion.div>

            {/* Flying Blobs (rendered in static jar coordinate space) */}
            <div className="absolute inset-0 rounded-full overflow-hidden pointer-events-none z-25">
              <AnimatePresence>
                {blobs.filter(b => !b.isDropped).map(blob => {
                  const targetX = 50 + Math.cos(blob.angle) * blob.radius;
                  const targetY = 50 + Math.sin(blob.angle) * blob.radius;

                  return (
                    <motion.div
                      key={blob.id}
                      initial={{ left: "-20%", top: "40%", scale: 0.4, opacity: 0.8 }}
                      animate={{ left: `${targetX}%`, top: `${targetY}%`, scale: 1.1, opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ type: "spring", stiffness: 220, damping: 14 }}
                      onAnimationComplete={() => handleBlobLand(blob.id, blob.type)}
                      className="absolute w-8 h-8 sm:w-12 sm:h-12 rounded-full z-30 -translate-x-1/2 -translate-y-1/2"
                      style={{
                        backgroundColor: blob.color,
                        boxShadow: "inset 2px 2px 4px rgba(255,255,255,0.45), inset -2px -2px 4px rgba(0,0,0,0.25)"
                      }}
                    />
                  );
                })}
              </AnimatePresence>
            </div>

            {/* Spin Helper Arrows Overlay */}
            {totalAdded > 0 && mixProgress < 100 && (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
                className="absolute inset-4 sm:inset-6 border border-dashed border-white/25 rounded-full pointer-events-none flex items-center justify-center z-15"
              >
                <span className="absolute top-1 text-[9px] sm:text-[11px] text-white/45">➔</span>
                <span className="absolute bottom-1 text-[9px] sm:text-[11px] text-white/45 rotate-180">➔</span>
                <span className="absolute right-1 text-[9px] sm:text-[11px] text-white/45 rotate-90">➔</span>
                <span className="absolute left-1 text-[9px] sm:text-[11px] text-white/45 -rotate-90">➔</span>
              </motion.div>
            )}

            {/* Success Checkmark overlay (bg-transparent keeps resulted color visible!) */}
            {pourState === "fed" && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="absolute inset-0 bg-transparent z-40 flex items-center justify-center rounded-full pointer-events-none"
              >
                <div className="bg-emerald-500 w-16 h-16 sm:w-24 sm:h-24 rounded-full flex items-center justify-center shadow-[0_6px_15px_rgba(16,185,129,0.35),_inset_0_3px_6px_rgba(255,255,255,0.4)] border-4 sm:border-[6px] border-white animate-bounce">
                  <span className="text-white text-xl sm:text-4xl font-black">✓</span>
                </div>
              </motion.div>
            )}
          </motion.div>

      </div>

      {/* Controls Bar (Positioned at the very bottom of the screen!) */}
      <div className="flex justify-between items-center gap-4 sm:gap-6 mt-4 w-full max-w-md z-30 select-none self-center shrink-0 mb-2">
        <ClayButton
          variant="surface"
          size="sm"
          onClick={handleClear}
          className="bg-white border-2 border-slate-200 shadow-md active:scale-95 flex items-center gap-1.5 font-bold px-3 py-1.5 text-xs sm:text-sm sm:px-4 sm:py-2 rounded-2xl shrink-0"
        >
          Clear 🔄
        </ClayButton>

        {/* Instruction Status Info */}
        <div className="flex-grow flex items-center justify-center bg-white/95 px-3 py-2 sm:px-4 sm:py-2.5 rounded-full border-2 border-white/60 shadow-clay-card max-w-[180px] sm:max-w-[200px]">
          <span className="text-[9px] sm:text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">
            {totalAdded === 0
              ? "Squeeze tubes! 🔴 🟡 🔵"
              : mixProgress < 100
              ? "Spin container! 🌀"
              : "Success! 🎉"}
          </span>
        </div>
        
        <div className="w-16 sm:w-20 shrink-0" /> {/* Spacer */}
      </div>

    </div>
  );
}
