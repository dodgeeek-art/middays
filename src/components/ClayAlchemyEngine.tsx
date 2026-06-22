"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { ArrowLeft, Check, RefreshCw, Sparkles, Volume2 } from "@/components/Icons";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import ClayButton from "@/components/ui/ClayButton";
import { vocabularyList } from "@/lib/svgDictionary";

type PrimaryColor = "red" | "yellow" | "blue";
type TargetColorName = "Orange" | "Green" | "Purple" | "Brown";

const PRIMARY_COLORS: Record<PrimaryColor, {
  label: string;
  shortLabel: string;
  hex: string;
  ink: string;
  soft: string;
  ring: string;
  shape: string;
  aria: string;
}> = {
  red: {
    label: "Red",
    shortLabel: "R",
    hex: "#ff4d6d",
    ink: "#8f1230",
    soft: "#ffe3e9",
    ring: "#ff9aae",
    shape: "circle",
    aria: "Add red paint to the blender",
  },
  yellow: {
    label: "Yellow",
    shortLabel: "Y",
    hex: "#ffd166",
    ink: "#745100",
    soft: "#fff4ca",
    ring: "#ffd166",
    shape: "square",
    aria: "Add yellow paint to the blender",
  },
  blue: {
    label: "Blue",
    shortLabel: "B",
    hex: "#118ab2",
    ink: "#06445c",
    soft: "#dff5ff",
    ring: "#69c8ed",
    shape: "triangle",
    aria: "Add blue paint to the blender",
  },
};

const TARGET_META: Record<TargetColorName, {
  tone: string;
  plainLesson: string;
  successLine: string;
  resultEmoji: string;
}> = {
  Orange: {
    tone: "#ff7b00",
    plainLesson: "Red and Yellow make Orange.",
    successLine: "You mixed orange from red and yellow.",
    resultEmoji: "orange circle",
  },
  Green: {
    tone: "#00a862",
    plainLesson: "Yellow and Blue make Green.",
    successLine: "You mixed green from yellow and blue.",
    resultEmoji: "green circle",
  },
  Purple: {
    tone: "#8d63e6",
    plainLesson: "Red and Blue make Purple.",
    successLine: "You mixed purple from red and blue.",
    resultEmoji: "purple circle",
  },
  Brown: {
    tone: "#8d6e63",
    plainLesson: "Red, Yellow, and Blue make Brown.",
    successLine: "You mixed brown from all three primary colors.",
    resultEmoji: "brown circle",
  },
};

interface PigmentBlobState {
  id: number;
  color: string;
  type: PrimaryColor;
  x: number;
  y: number;
  isDropped: boolean;
  angle: number;
  radius: number;
}

interface AlchemyLevel {
  targetName: TargetColorName;
  targetColor: string;
  vocabName: string;
  mascotSpeech: string;
  ingredients: PrimaryColor[];
  check: (r: number, y: number, b: number) => boolean;
}

const levels: AlchemyLevel[] = [
  {
    targetName: "Orange",
    targetColor: "#ff7b00",
    vocabName: "Fox",
    mascotSpeech: "Help the Fox mix Orange paint. Add Red and Yellow, then spin the blender.",
    ingredients: ["red", "yellow"],
    check: (r, y, b) => r > 0 && y > 0 && b === 0,
  },
  {
    targetName: "Green",
    targetColor: "#00c853",
    vocabName: "Frog",
    mascotSpeech: "Help the Frog mix Green paint. Add Yellow and Blue, then spin the blender.",
    ingredients: ["yellow", "blue"],
    check: (r, y, b) => y > 0 && b > 0 && r === 0,
  },
  {
    targetName: "Purple",
    targetColor: "#9e7bf5",
    vocabName: "Koala",
    mascotSpeech: "Help the Koala mix Purple paint. Add Red and Blue, then spin the blender.",
    ingredients: ["red", "blue"],
    check: (r, y, b) => r > 0 && b > 0 && y === 0,
  },
  {
    targetName: "Brown",
    targetColor: "#8d6e63",
    vocabName: "Bear",
    mascotSpeech: "Help the Bear mix Brown paint. Add Red, Yellow, and Blue, then spin the blender.",
    ingredients: ["red", "yellow", "blue"],
    check: (r, y, b) => r > 0 && y > 0 && b > 0,
  },
];

const seededUnit = (seed: number) => {
  const value = Math.sin(seed * 12.9898) * 43758.5453;
  return value - Math.floor(value);
};

function PaintPod({
  color,
  amount,
  isSqueezing,
  isRecommended,
  isDisabled,
  onClick,
}: {
  color: PrimaryColor;
  amount: number;
  isSqueezing: boolean;
  isRecommended: boolean;
  isDisabled: boolean;
  onClick: () => void;
}) {
  const meta = PRIMARY_COLORS[color];

  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={isDisabled}
      aria-label={`${meta.aria}. Added ${amount} time${amount === 1 ? "" : "s"}. ${isRecommended ? "Needed for this recipe." : "Not needed for this recipe."}`}
      aria-pressed={amount > 0}
      animate={isSqueezing ? { scale: 0.92, y: 8 } : { scale: 1, y: 0 }}
      whileHover={isDisabled ? {} : { y: -3, scale: 1.02 }}
      whileTap={isDisabled ? {} : { y: 4, scale: 0.96 }}
      transition={{ type: "spring", stiffness: 380, damping: 20 }}
      className={`group relative flex min-h-[92px] w-full min-w-[78px] flex-col items-center justify-end rounded-[1.35rem] border-[3px] px-2 pb-1.5 pt-3 text-center shadow-clay-card outline-none transition-all focus-visible:ring-4 focus-visible:ring-[#118ab2]/35 sm:min-h-[132px] sm:min-w-[98px] sm:rounded-[1.65rem] sm:pb-2 sm:pt-4 md:min-h-[150px] ${
        isRecommended
          ? "border-white bg-white"
          : "border-slate-200/70 bg-white/70 opacity-80"
      } ${isDisabled ? "cursor-not-allowed opacity-45" : "cursor-pointer"}`}
    >
      <div
        className="absolute inset-2 rounded-[1.25rem] opacity-75"
        style={{
          background: `linear-gradient(180deg, ${meta.soft}, rgba(255,255,255,0.94))`,
        }}
      />
      <div className="relative z-10 flex w-full flex-col items-center">
        <div className="relative h-14 w-10 sm:h-24 sm:w-14 md:h-28 md:w-16">
          <div className="absolute left-1/2 top-0 h-3 w-9 -translate-x-1/2 rounded-md border border-slate-300 bg-gradient-to-r from-slate-300 via-white to-slate-400 shadow-inner sm:h-4 sm:w-12" />
          <div
            className="absolute bottom-2 left-1/2 h-[78%] w-full -translate-x-1/2 rounded-[1rem_1rem_1.45rem_1.45rem] border-[3px] border-white shadow-[inset_5px_0_10px_rgba(255,255,255,0.38),_inset_-5px_0_10px_rgba(0,0,0,0.14),_0_10px_18px_rgba(0,0,0,0.12)]"
            style={{ background: `linear-gradient(90deg, ${meta.ring}, ${meta.hex} 52%, ${meta.ink})` }}
          />
          <div className="absolute bottom-6 left-1/2 grid h-7 w-8 -translate-x-1/2 place-items-center rounded-lg bg-white/92 text-xs font-black shadow-inner sm:bottom-8 sm:h-9 sm:w-11 sm:text-sm" style={{ color: meta.ink }}>
            {meta.shortLabel}
          </div>
          <div className="absolute bottom-0 left-1/2 h-3 w-4 -translate-x-1/2 rounded-b-md border border-slate-400 bg-gradient-to-r from-slate-400 via-white to-slate-500 sm:h-4 sm:w-5" />
        </div>

        <span className="mt-0.5 block text-[10px] font-black uppercase tracking-wider sm:mt-1 sm:text-sm" style={{ color: meta.ink }}>
          {meta.label}
        </span>

        <div className="mt-0.5 flex items-center justify-center gap-1 sm:mt-1">
          {[0, 1, 2].map((dot) => (
            <span
              key={dot}
              aria-hidden="true"
              className="h-1.5 w-1.5 rounded-full border border-white shadow-sm sm:h-2 sm:w-2"
              style={{ backgroundColor: dot < Math.min(amount, 3) ? meta.hex : "rgba(148,163,184,0.25)" }}
            />
          ))}
        </div>
      </div>
      {isRecommended && (
        <span className="absolute -right-1 -top-2 rounded-full bg-[#2f3e46] px-2 py-0.5 text-[8px] font-black uppercase tracking-wider text-white shadow-md sm:-right-1.5 sm:py-1">
          Needed
        </span>
      )}
    </motion.button>
  );
}

function IngredientRail({ activeLevel, counts }: { activeLevel: AlchemyLevel; counts: Record<PrimaryColor, number> }) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-1.5" aria-label={`Recipe: ${TARGET_META[activeLevel.targetName].plainLesson}`}>
      {activeLevel.ingredients.map((ingredient, index) => {
        const meta = PRIMARY_COLORS[ingredient];
        return (
          <React.Fragment key={ingredient}>
            <span
              className={`inline-flex items-center gap-1 rounded-full border-2 bg-white px-2.5 py-1 text-[10px] font-black uppercase tracking-wider shadow-sm sm:text-xs ${
                counts[ingredient] > 0 ? "border-white" : "border-slate-200"
              }`}
              style={{ color: meta.ink, boxShadow: counts[ingredient] > 0 ? `0 0 0 3px ${meta.ring}35` : undefined }}
            >
              <span className="h-3 w-3 rounded-full border border-white" style={{ backgroundColor: meta.hex }} />
              {meta.label}
              {counts[ingredient] > 0 && <Check size={14} aria-hidden="true" />}
            </span>
            {index < activeLevel.ingredients.length - 1 && (
              <span className="text-xs font-black text-slate-400" aria-hidden="true">
                +
              </span>
            )}
          </React.Fragment>
        );
      })}
      <span className="text-xs font-black text-slate-400" aria-hidden="true">
        =
      </span>
      <span
        className="inline-flex items-center gap-1 rounded-full border-2 border-white bg-white px-2.5 py-1 text-[10px] font-black uppercase tracking-wider shadow-sm sm:text-xs"
        style={{ color: TARGET_META[activeLevel.targetName].tone }}
      >
        <span className="h-3 w-3 rounded-full border border-white" style={{ backgroundColor: activeLevel.targetColor }} />
        {activeLevel.targetName}
      </span>
    </div>
  );
}

function StepBadge({ index, label, active, complete }: { index: number; label: string; active: boolean; complete: boolean }) {
  return (
    <div className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wider transition-all sm:text-xs ${
      active || complete ? "bg-white text-[#2f3e46] shadow-sm" : "bg-white/45 text-slate-500"
    }`}>
      <span className={`grid h-5 w-5 place-items-center rounded-full text-[10px] ${
        complete ? "bg-emerald-500 text-white" : active ? "bg-[#ffd166] text-[#604500]" : "bg-slate-200 text-slate-500"
      }`}>
        {complete ? <Check size={13} aria-hidden="true" /> : index}
      </span>
      {label}
    </div>
  );
}

export default function ClayAlchemyEngine({ childId, onBack }: { childId: string; onBack: () => void }) {
  const [levelIdx, setLevelIdx] = useState(0);
  const [redAmt, setRedAmt] = useState(0);
  const [yellowAmt, setYellowAmt] = useState(0);
  const [blueAmt, setBlueAmt] = useState(0);
  const [mixProgress, setMixProgress] = useState(0);
  const [pourState, setPourState] = useState<"idle" | "fed">("idle");
  const [blobs, setBlobs] = useState<PigmentBlobState[]>([]);
  const [squeezingPod, setSqueezingPod] = useState<PrimaryColor | null>(null);
  const [crankVisualAngle, setCrankVisualAngle] = useState(0);
  const [startTime] = useState<number>(() => Date.now());
  const [isShaking, setIsShaking] = useState(false);
  const [feedback, setFeedback] = useState<"intro" | "added" | "mixing" | "success" | "tryAgain">("intro");

  const isDraggingCrank = useRef(false);
  const crankAngleRef = useRef(0);
  const nextBlobId = useRef(0);
  const resultHandledRef = useRef(false);

  const activeLevel = levels[levelIdx];
  const vocabItem = vocabularyList.find((v) => v.name === activeLevel.vocabName);
  const MascotIcon = vocabItem?.icon;
  const counts = useMemo<Record<PrimaryColor, number>>(() => ({
    red: redAmt,
    yellow: yellowAmt,
    blue: blueAmt,
  }), [redAmt, yellowAmt, blueAmt]);

  const speakText = useCallback((text: string) => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1.12;
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
        [261.63, 329.63, 392, 523.25].forEach((freq, idx) => {
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
        gain.gain.setValueAtTime(0.22, now);
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
    speakText(activeLevel.mascotSpeech);
  }, [levelIdx, activeLevel, speakText]);

  const resetMixState = useCallback(() => {
    setRedAmt(0);
    setYellowAmt(0);
    setBlueAmt(0);
    setMixProgress(0);
    setPourState("idle");
    setBlobs([]);
    setCrankVisualAngle(0);
    setFeedback("intro");
    crankAngleRef.current = 0;
    resultHandledRef.current = false;
    setIsShaking(false);
  }, []);

  const handleSqueeze = (type: PrimaryColor) => {
    if (pourState !== "idle" || isShaking) return;
    setSqueezingPod(type);
    setFeedback("added");
    playSynthesizedSound("squeeze");

    const blobId = nextBlobId.current++;
    const newBlob: PigmentBlobState = {
      id: blobId,
      color: PRIMARY_COLORS[type].hex,
      type,
      x: 40 + seededUnit(blobId + 1) * 80,
      y: -60,
      isDropped: false,
      angle: seededUnit(blobId + 2) * Math.PI * 2,
      radius: 20 + seededUnit(blobId + 3) * 25,
    };

    setBlobs((prev) => [...prev, newBlob]);
    setTimeout(() => setSqueezingPod(null), 360);
  };

  const handleBlobLand = (blobId: number, type: PrimaryColor) => {
    setBlobs((prev) => prev.map((b) => (b.id === blobId ? { ...b, isDropped: true } : b)));
    if (type === "red") setRedAmt((prev) => prev + 1);
    else if (type === "yellow") setYellowAmt((prev) => prev + 1);
    else if (type === "blue") setBlueAmt((prev) => prev + 1);
    setMixProgress(0);
    resultHandledRef.current = false;
  };

  const handleCrankPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const total = redAmt + yellowAmt + blueAmt;
    if (total === 0 || pourState !== "idle" || isShaking) return;
    isDraggingCrank.current = true;
    setFeedback("mixing");
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

      setMixProgress((prev) => {
        const increment = absDelta * 5.5;
        const next = Math.min(100, prev + increment);
        if (Math.floor(next) > Math.floor(prev) && Math.floor(next) % 15 === 0) {
          playSynthesizedSound("blend");
        }
        return next;
      });

      setBlobs((prev) =>
        prev.map((blob) => {
          if (!blob.isDropped) return blob;
          const newAngle = blob.angle + delta * 0.8;
          return {
            ...blob,
            angle: newAngle,
            radius: Math.max(5, blob.radius * (1 - absDelta * 0.015)),
          };
        }),
      );
    }
  };

  const handleCrankPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    isDraggingCrank.current = false;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  };

  const getMixedColor = (r: number, y: number, b: number) => {
    const total = r + y + b;
    if (total === 0) return "rgba(255, 255, 255, 0.24)";
    const rPct = r / total;
    const yPct = y / total;
    const bPct = b / total;

    const redColor = { r: 255, g: 77, b: 109 };
    const yellowColor = { r: 255, g: 209, b: 102 };
    const blueColor = { r: 17, g: 138, b: 178 };

    const targetR = rPct * redColor.r + yPct * yellowColor.r + bPct * blueColor.r;
    const targetG = rPct * redColor.g + yPct * yellowColor.g + bPct * blueColor.g;
    const targetB = rPct * redColor.b + yPct * yellowColor.b + bPct * blueColor.b;

    return `rgb(${Math.round(targetR)}, ${Math.round(targetG)}, ${Math.round(targetB)})`;
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
    setFeedback("intro");
    resultHandledRef.current = false;
  };

  const totalAdded = redAmt + yellowAmt + blueAmt;
  const displayColor = getMixedColor(redAmt, yellowAmt, blueAmt);
  const recipeReady = activeLevel.ingredients.every((ingredient) => counts[ingredient] > 0);
  const extraColorsAdded = (Object.keys(counts) as PrimaryColor[]).some(
    (color) => !activeLevel.ingredients.includes(color) && counts[color] > 0,
  );
  const progressLabel = totalAdded === 0 ? "0 percent mixed" : `${Math.round(mixProgress)} percent mixed`;

  const statusCopy = (() => {
    if (pourState === "fed") return TARGET_META[activeLevel.targetName].successLine;
    if (feedback === "tryAgain") return "That made a different color. Clear the blender and try the recipe again.";
    if (totalAdded === 0) return `Add ${activeLevel.ingredients.map((c) => PRIMARY_COLORS[c].label).join(" + ")}.`;
    if (!recipeReady || extraColorsAdded) return "Check the recipe lights, then spin when the colors are ready.";
    if (mixProgress < 100) return "Great. Spin the blender until the color fills the bowl.";
    return "Reading your mix...";
  })();

  useEffect(() => {
    if (mixProgress >= 100 && pourState === "idle" && totalAdded > 0 && !resultHandledRef.current) {
      resultHandledRef.current = true;
      const match = activeLevel.check(redAmt, yellowAmt, blueAmt);
      if (match) {
        playSynthesizedSound("correct");
        speakText(TARGET_META[activeLevel.targetName].successLine);
        confetti({
          particleCount: 85,
          spread: 70,
          origin: { y: 0.62 },
          colors: [activeLevel.targetColor, "#ffd166", "#ffffff", "#118ab2"],
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
              timeSpentMs: elapsed,
            }),
          }).catch((err) => console.error("Telemetry failed:", err));
        }

        setTimeout(() => {
          setPourState("fed");
          setFeedback("success");
        }, 0);

        setTimeout(() => {
          resetMixState();
          setLevelIdx((prev) => (prev + 1) % levels.length);
        }, 2800);
      } else {
        playSynthesizedSound("click");
        speakText("That made a different color. Tap Clear and try the recipe again.");
        setTimeout(() => {
          setFeedback("tryAgain");
          setIsShaking(true);
          setMixProgress(0);
          resultHandledRef.current = false;
        }, 0);
        setTimeout(() => setIsShaking(false), 600);
      }
    }
  }, [mixProgress, pourState, totalAdded, redAmt, yellowAmt, blueAmt, activeLevel, childId, startTime, speakText, resetMixState]);

  return (
    <section
      className="relative mx-auto flex h-full min-h-0 w-full max-w-4xl select-none flex-col overflow-hidden rounded-[1.5rem] border-[3px] border-white/60 bg-[#fbf8f3] p-2 text-[#2f3e46] shadow-clay-card sm:rounded-[2.35rem] sm:p-4"
      aria-label="Clay Alchemy color mixing game"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(47, 62, 70, 0.22) 1px, transparent 1px), linear-gradient(90deg, rgba(47, 62, 70, 0.22) 1px, transparent 1px)",
          backgroundSize: "30px 30px",
        }}
      />
      <div className="pointer-events-none absolute -right-24 -top-28 h-72 w-72 rounded-full bg-[#ffd166]/25 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-[#118ab2]/15 blur-3xl" />

      <header className="relative z-20 flex shrink-0 items-center justify-between gap-2">
        <ClayButton
          variant="surface"
          size="icon"
          className="min-h-[46px] min-w-[46px] border-2 border-white/60 shadow-md sm:min-h-[60px] sm:min-w-[60px]"
          onClick={onBack}
          aria-label="Back to activities"
        >
          <ArrowLeft size={26} strokeWidth={3.5} className="text-[#5c6b73]" />
        </ClayButton>

        <div className="min-w-0 text-center">
          <p className="text-[9px] font-black uppercase tracking-[0.26em] text-slate-500 sm:text-[10px]">Color Mixing Lab</p>
          <h1 className="truncate text-base font-black uppercase tracking-wide text-[#2f3e46] sm:text-2xl">
            Clay Alchemy
          </h1>
        </div>

        <div className="rounded-full border-2 border-white bg-[#ffd166] px-2.5 py-1.5 text-center text-[9px] font-black uppercase tracking-wider text-[#604500] shadow-inner sm:px-4 sm:py-2 sm:text-xs">
          Mix {levelIdx + 1}/{levels.length}
        </div>
      </header>

      <div className="relative z-10 mt-1.5 grid shrink-0 gap-1.5 sm:mt-3 sm:gap-2 lg:grid-cols-[1fr_auto] lg:items-center">
        <button
          type="button"
          onClick={() => speakText(activeLevel.mascotSpeech)}
          className="flex min-w-0 items-center gap-2.5 rounded-[1.25rem] border-2 border-white/70 bg-white/88 p-2 text-left shadow-sm outline-none transition-transform active:scale-[0.99] focus-visible:ring-4 focus-visible:ring-[#118ab2]/25 sm:gap-3 sm:rounded-[1.5rem] sm:p-3"
          aria-label={`Hear instructions: ${activeLevel.mascotSpeech}`}
        >
          {MascotIcon && (
            <span className="grid h-11 w-11 shrink-0 place-items-center overflow-visible sm:h-16 sm:w-16" aria-hidden="true">
              <MascotIcon size="100%" animClass="anim-sway" />
            </span>
          )}
          <span className="min-w-0">
            <span className="block text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">Goal</span>
            <span className="block text-[13px] font-black leading-tight text-[#2f3e46] sm:text-base">
              Mix {activeLevel.targetName} for the {activeLevel.vocabName}
            </span>
          </span>
          <Volume2 className="ml-auto h-5 w-5 shrink-0 text-slate-400" aria-hidden="true" />
        </button>

        <div className="rounded-[1.25rem] border-2 border-white/70 bg-white/70 px-2 py-1.5 shadow-sm sm:rounded-[1.5rem] sm:px-3 sm:py-2">
          <IngredientRail activeLevel={activeLevel} counts={counts} />
        </div>

        <div className="hidden items-center justify-center gap-1.5 rounded-[1.5rem] border-2 border-white/70 bg-white/70 px-2 py-2 shadow-sm sm:flex">
          <StepBadge index={1} label="Add" active={totalAdded === 0 || !recipeReady} complete={recipeReady && !extraColorsAdded} />
          <StepBadge index={2} label="Spin" active={totalAdded > 0 && mixProgress < 100} complete={mixProgress >= 100 || pourState === "fed"} />
          <StepBadge index={3} label="Learn" active={pourState === "fed" || feedback === "tryAgain"} complete={pourState === "fed"} />
        </div>
      </div>

      <div className="relative z-10 grid min-h-0 flex-1 grid-rows-[auto_1fr] gap-2 pt-2 md:grid-cols-[minmax(92px,120px)_1fr] md:grid-rows-1 md:items-center md:gap-4 md:pt-3">
        <div className="grid grid-cols-3 gap-1.5 md:grid-cols-1 md:gap-2">
          {(["red", "yellow", "blue"] as const).map((color) => (
            <PaintPod
              key={color}
              color={color}
              amount={counts[color]}
              isSqueezing={squeezingPod === color}
              isRecommended={activeLevel.ingredients.includes(color)}
              isDisabled={pourState !== "idle" || isShaking}
              onClick={() => handleSqueeze(color)}
            />
          ))}
        </div>

        <div className="flex min-h-0 flex-col items-center justify-center gap-2 sm:gap-3">
          <motion.div
            animate={isShaking ? { x: [0, -12, 12, -10, 10, 0] } : {}}
            transition={{ type: "tween", duration: 0.5 }}
            className={`relative aspect-square w-[min(70vw,31dvh,19rem)] rounded-full border border-slate-200/30 bg-[#f8f6f2] shadow-[0_14px_32px_rgba(47,62,70,0.12),_inset_0_3px_12px_rgba(0,0,0,0.07),_0_0_0_7px_white] touch-none sm:w-[min(62vw,42vh,25rem)] ${
              totalAdded > 0 && pourState === "idle" ? "cursor-grab" : "cursor-default"
            }`}
            onPointerDown={handleCrankPointerDown}
            onPointerMove={handleCrankPointerMove}
            onPointerUp={handleCrankPointerUp}
            onPointerCancel={handleCrankPointerUp}
            role="slider"
            tabIndex={totalAdded > 0 && pourState === "idle" ? 0 : -1}
            aria-label="Spin the blender"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(mixProgress)}
            aria-valuetext={progressLabel}
          >
            <motion.div
              animate={{ rotate: (crankVisualAngle * 180) / Math.PI }}
              transition={{ type: "tween", ease: "linear", duration: 0.05 }}
              className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-visible rounded-full"
            >
              <div className="absolute -left-3 top-1/2 h-12 w-4 -translate-y-1/2 rounded-l-[1.25rem] border-2 border-white bg-[#94a3b8] shadow-[0_3px_6px_rgba(0,0,0,0.08),_inset_1.5px_1.5px_3px_rgba(255,255,255,0.4)] sm:-left-6 sm:h-20 sm:w-7" />
              <div className="absolute -right-3 top-1/2 h-12 w-4 -translate-y-1/2 rounded-r-[1.25rem] border-2 border-white bg-[#94a3b8] shadow-[0_3px_6px_rgba(0,0,0,0.08),_inset_-1.5px_1.5px_3px_rgba(255,255,255,0.4)] sm:-right-6 sm:h-20 sm:w-7" />

              <div className="absolute inset-1 rounded-full border-[7px] border-slate-300/28" />
              <div className="absolute inset-4 rounded-full border-t-4 border-l border-white/40" />

              {totalAdded > 0 && (
                <motion.div
                  className="absolute inset-0 rounded-full"
                  animate={{
                    opacity: Math.max(0.18, mixProgress / 100),
                    scale: mixProgress >= 100 ? 1 : 0.96 + mixProgress / 2500,
                  }}
                  transition={{ duration: 0.25 }}
                  style={{
                    backgroundColor: displayColor,
                    boxShadow: "inset 0 8px 22px rgba(0,0,0,0.18), inset 0 -6px 16px rgba(255,255,255,0.22)",
                  }}
                />
              )}

              <div className="pointer-events-none absolute inset-0 z-20 overflow-hidden rounded-full">
                {blobs.filter((b) => b.isDropped).map((blob) => {
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
                        scale,
                        opacity: scale,
                      }}
                      transition={{ ease: "linear", duration: 0.05 }}
                      className="absolute z-20 h-9 w-9 -translate-x-1/2 -translate-y-1/2 rounded-full blur-[0.3px] sm:h-12 sm:w-12"
                      style={{
                        backgroundColor: blob.color,
                        boxShadow: "inset 2px 2px 4px rgba(255,255,255,0.45), inset -2px -2px 4px rgba(0,0,0,0.25)",
                      }}
                    />
                  );
                })}
              </div>

              <div className="pointer-events-none absolute z-30 flex h-16 w-16 items-center justify-center rounded-full bg-slate-500/10 sm:h-28 sm:w-28">
                <motion.div
                  animate={totalAdded > 0 && mixProgress < 100 ? { rotate: 360 } : { rotate: 0 }}
                  transition={{ repeat: totalAdded > 0 && mixProgress < 100 ? Infinity : 0, duration: 1.2, ease: "linear" }}
                  className="relative h-full w-full"
                >
                  {[0, 90, 180, 270].map((rotation) => (
                    <span
                      key={rotation}
                      className="absolute left-1/2 top-1/2 h-3.5 w-9 origin-left -translate-y-1/2 rounded-full border border-white/75 bg-[#64748b] shadow-sm sm:h-4 sm:w-11"
                      style={{ transform: `rotate(${rotation}deg)` }}
                    />
                  ))}
                  <span className="absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-[#475569] sm:h-5 sm:w-5" />
                </motion.div>
              </div>
            </motion.div>

            <div className="pointer-events-none absolute inset-0 z-30 overflow-hidden rounded-full">
              <AnimatePresence>
                {blobs.filter((b) => !b.isDropped).map((blob) => {
                  const targetX = 50 + Math.cos(blob.angle) * blob.radius;
                  const targetY = 50 + Math.sin(blob.angle) * blob.radius;

                  return (
                    <motion.div
                      key={blob.id}
                      initial={{ left: "8%", top: "24%", scale: 0.45, opacity: 0.8 }}
                      animate={{ left: `${targetX}%`, top: `${targetY}%`, scale: 1.1, opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ type: "spring", stiffness: 220, damping: 14 }}
                      onAnimationComplete={() => handleBlobLand(blob.id, blob.type)}
                      className="absolute z-30 h-9 w-9 -translate-x-1/2 -translate-y-1/2 rounded-full sm:h-12 sm:w-12"
                      style={{
                        backgroundColor: blob.color,
                        boxShadow: "inset 2px 2px 4px rgba(255,255,255,0.45), inset -2px -2px 4px rgba(0,0,0,0.25)",
                      }}
                    />
                  );
                })}
              </AnimatePresence>
            </div>

            {totalAdded > 0 && mixProgress < 100 && (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
                className="pointer-events-none absolute inset-5 z-20 flex items-center justify-center rounded-full border border-dashed border-white/35"
              >
                <span className="absolute top-1 text-xs font-black text-white/65">Spin</span>
                <span className="absolute bottom-1 rotate-180 text-sm text-white/50">➔</span>
                <span className="absolute right-1 rotate-90 text-sm text-white/50">➔</span>
                <span className="absolute left-1 -rotate-90 text-sm text-white/50">➔</span>
              </motion.div>
            )}

            <AnimatePresence>
              {pourState === "fed" && (
                <motion.div
                  initial={{ scale: 0.85, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  className="pointer-events-none absolute inset-0 z-40 grid place-items-center rounded-full bg-white/10"
                >
                  <div className="flex flex-col items-center gap-2 rounded-[2rem] border-[5px] border-white bg-white/92 px-5 py-4 text-center shadow-clay-card">
                    <Sparkles className="h-7 w-7 text-[#ffd166]" aria-hidden="true" />
                    <span className="text-base font-black uppercase tracking-wide" style={{ color: TARGET_META[activeLevel.targetName].tone }}>
                      {activeLevel.targetName}
                    </span>
                    <span className="text-[11px] font-black uppercase tracking-wider text-slate-500">New color made</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          <div className="w-full max-w-md rounded-full border-2 border-white/80 bg-white/85 p-1.5 shadow-sm" aria-hidden="true">
            <div className="h-3 overflow-hidden rounded-full bg-slate-200/70">
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: activeLevel.targetColor }}
                animate={{ width: `${Math.max(0, mixProgress)}%` }}
                transition={{ duration: 0.2 }}
              />
            </div>
          </div>

          <div
            className="flex w-full max-w-md items-center justify-between gap-2 rounded-[1.35rem] border-2 border-white/80 bg-white/90 px-3 py-2 shadow-sm"
            role="status"
            aria-live="polite"
          >
            <p className="min-w-0 truncate text-xs font-black uppercase tracking-wider text-[#2f3e46] sm:text-sm">
              {statusCopy}
            </p>
            <ClayButton
              variant="surface"
              size="sm"
              onClick={handleClear}
              className="min-h-[42px] shrink-0 gap-1.5 border-2 border-slate-200 bg-white px-3 text-[10px] shadow-md sm:text-xs"
              aria-label="Clear blender and start this mix again"
            >
              <RefreshCw size={15} aria-hidden="true" />
              Clear
            </ClayButton>
          </div>
        </div>
      </div>
    </section>
  );
}
