"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { ArrowLeft, Sparkles, Smile } from "@/components/Icons";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import ClayButton from "@/components/ui/ClayButton";
import { vocabularyList } from "@/lib/svgDictionary";

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

  const isDraggingCrank = useRef(false);
  const crankAngleRef = useRef(0);
  const nextBlobId = useRef(0);

  const activeLevel = levels[levelIdx];
  const vocabItem = vocabularyList.find(v => v.name === activeLevel.vocabName);
  const MascotIcon = vocabItem?.icon;

  const speakText = useCallback((text: string) => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.85;
      utterance.pitch = 1.25;
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
    speakText(activeLevel.mascotSpeech);
  }, [levelIdx, activeLevel, speakText]);

  const handleSqueeze = (type: "red" | "yellow" | "blue") => {
    if (pourState !== "idle") return;
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
      x: 40 + Math.random() * 80, // Offset from left lip of jar
      y: -60,
      isDropped: false,
      angle: Math.random() * Math.PI * 2,
      radius: 20 + Math.random() * 45
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
    if (total === 0 || pourState !== "idle") return;
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
    // Normalize delta to [-PI, PI] to handle boundary wrap-around
    delta = Math.atan2(Math.sin(delta), Math.cos(delta));
    const absDelta = Math.abs(delta);

    if (absDelta > 0.05) {
      crankAngleRef.current = angle;
      setCrankVisualAngle(angle);

      setMixProgress(prev => {
        const increment = absDelta * 5.0; // Proportional progress
        const next = Math.min(100, prev + increment);
        if (Math.floor(next) > Math.floor(prev) && Math.floor(next) % 15 === 0) {
          playSynthesizedSound("blend");
        }
        return next;
      });

      // Rotate/swirl the unblended clay blobs inside the jar
      setBlobs(prev =>
        prev.map(blob => {
          if (!blob.isDropped) return blob;
          const newAngle = blob.angle + delta * 0.8;
          return {
            ...blob,
            angle: newAngle,
            radius: Math.max(8, blob.radius * (1 - absDelta * 0.015)) // Slowly spiralling inward
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

    // Rich pigment base values
    const redColor = { r: 255, g: 77, b: 109 };
    const yellowColor = { r: 255, g: 209, b: 102 };
    const blueColor = { r: 17, g: 138, b: 178 };

    const target_r = r_pct * redColor.r + y_pct * yellowColor.r + b_pct * blueColor.r;
    const target_g = r_pct * redColor.g + y_pct * yellowColor.g + b_pct * blueColor.g;
    const target_b = r_pct * redColor.b + y_pct * yellowColor.b + b_pct * blueColor.b;

    return `rgb(${Math.round(target_r)}, ${Math.round(target_g)}, ${Math.round(target_b)})`;
  };

  const handlePour = () => {
    if (mixProgress < 100) return;
    setPourState("pouring");
    playSynthesizedSound("squeeze");

    setTimeout(() => {
      const match = activeLevel.check(redAmt, yellowAmt, blueAmt);
      if (match) {
        setPourState("fed");
        playSynthesizedSound("correct");
        confetti({
          particleCount: 60,
          spread: 60,
          origin: { y: 0.7 }
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
        }, 3000);
      } else {
        setPourState("idle");
        speakText("Oops! That mixed a different color. Let's clear the jar and try again!");
      }
    }, 2000);
  };

  const handleClear = () => {
    playSynthesizedSound("click");
    setRedAmt(0);
    setYellowAmt(0);
    setBlueAmt(0);
    setMixProgress(0);
    setPourState("idle");
    setBlobs([]);
  };

  const totalAdded = redAmt + yellowAmt + blueAmt;
  const displayColor = getMixedColor(redAmt, yellowAmt, blueAmt);

  return (
    <div className="flex flex-col w-full max-w-4xl mx-auto h-full min-h-0 bg-[#fffcf5] p-3 sm:p-5 rounded-[2.5rem] border-[3px] border-white/50 shadow-clay-card relative overflow-hidden select-none">
      
      {/* Background Decor */}
      <div className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full bg-[#ffd166]/10 blur-3xl pointer-events-none" />
      <div className="absolute -top-20 -left-20 w-80 h-80 rounded-full bg-[#118ab2]/5 blur-3xl pointer-events-none" />

      {/* Header Row */}
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

      {/* Recipe / Help banner */}
      <div className="bg-white/95 p-3 sm:p-4 rounded-3xl border-[3px] border-white/60 shadow-clay-card flex flex-col md:flex-row items-center justify-between gap-3 mb-4 shrink-0 z-20">
        <div className="flex items-center gap-3">
          {MascotIcon && (
            <div className="w-14 h-14 rounded-2xl bg-[#fdfaf2] border-[3px] border-white/80 flex items-center justify-center shadow-inner shrink-0 overflow-visible">
              <MascotIcon size={44} animClass="anim-sway" />
            </div>
          )}
          <div className="flex flex-col text-left">
            <span className="text-[10px] font-black text-[#f76ca0] uppercase tracking-wider">Goal Mascot</span>
            <span className="text-sm font-black text-[#5c6b73]">{activeLevel.mascotSpeech}</span>
          </div>
        </div>

        {/* Dynamic Formula Recipe Guide */}
        <div className="flex items-center gap-2 bg-[#f6f8f7] px-5 py-2.5 rounded-full border-2 border-white/60 shadow-inner shrink-0">
          <span className="text-xs font-black text-slate-500 uppercase mr-1">Blend:</span>
          {activeLevel.targetName === "Orange" && (
            <span className="text-sm font-bold flex items-center gap-1.5">🔴 Red + 🟡 Yellow = 🟠 Orange</span>
          )}
          {activeLevel.targetName === "Green" && (
            <span className="text-sm font-bold flex items-center gap-1.5">🟡 Yellow + 🔵 Blue = 🟢 Green</span>
          )}
          {activeLevel.targetName === "Purple" && (
            <span className="text-sm font-bold flex items-center gap-1.5">🔴 Red + 🔵 Blue = 🟣 Purple</span>
          )}
          {activeLevel.targetName === "Brown" && (
            <span className="text-sm font-bold flex items-center gap-1.5">🔴 Red + 🟡 Yellow + 🔵 Blue = 🟤 Brown</span>
          )}
        </div>
      </div>

      {/* Play Area */}
      <div className="flex-grow flex flex-col md:flex-row gap-6 min-h-0 relative z-10 items-stretch">
        
        {/* Left Column: 3D Squeeze Clay Tubes */}
        <div className="flex md:flex-col justify-around items-center gap-4 bg-white/85 p-4 rounded-[2rem] border-[3px] border-white/80 shadow-inner-clay md:w-32 shrink-0">
          {(["red", "yellow", "blue"] as const).map(color => {
            const hexMap = { red: "#ff4d6d", yellow: "#ffd166", blue: "#118ab2" };
            const labelMap = { red: "🔴 RED", yellow: "🟡 YEL", blue: "🔵 BLU" };
            return (
              <div key={color} className="flex flex-col items-center gap-1">
                <motion.button
                  animate={squeezingTube === color ? { scaleY: 0.7, scaleX: 1.15, y: 12 } : { scaleY: 1, scaleX: 1, y: 0 }}
                  transition={{ type: "spring", stiffness: 350, damping: 10 }}
                  onClick={() => handleSqueeze(color)}
                  className="w-16 h-28 sm:w-20 sm:h-32 rounded-t-3xl rounded-b-xl border-[3px] border-white shadow-clay-btn hover:scale-105 active:scale-95 transition-transform duration-100 flex flex-col justify-between items-center p-2 relative"
                  style={{
                    backgroundColor: hexMap[color],
                    boxShadow: `inset 0 10px 15px rgba(255,255,255,0.4), inset 0 -12px 10px rgba(0,0,0,0.15), 0 8px 16px rgba(0,0,0,0.08)`
                  }}
                >
                  {/* Squeeze Tube Details */}
                  <div className="w-full border-b border-white/20 pb-1 flex justify-center">
                    <div className="w-4 h-1.5 rounded bg-black/10" />
                  </div>
                  <div className="flex-grow flex items-center justify-center">
                    <span className="text-[10px] sm:text-xs font-black text-white tracking-widest bg-black/15 px-1.5 py-0.5 rounded-md">
                      CLAY
                    </span>
                  </div>
                  {/* Nozzle outlet bottom */}
                  <div className="w-5 h-2 bg-white/90 border border-black/10 rounded-b-md shadow-sm" />
                </motion.button>
                <span className="text-[10px] font-black text-slate-500 tracking-wider">
                  {labelMap[color]}
                </span>
              </div>
            );
          })}
        </div>

        {/* Center/Right: Transparent Glass Jar Station */}
        <div className="flex-grow flex flex-col justify-between bg-[#ecefe9] border-[4px] border-white/80 p-5 rounded-[2.5rem] shadow-inner-clay relative overflow-visible min-h-[360px]">
          
          {/* Main jar visualization container */}
          <div className="flex-grow w-full relative flex justify-center items-center overflow-visible">
            
            {/* The Jar Container */}
            <motion.div
              animate={
                pourState === "pouring"
                  ? { rotate: -60, x: -70, y: 50 }
                  : pourState === "fed"
                  ? { scale: [1, 1.05, 1], rotate: [0, -3, 3, 0] }
                  : { rotate: 0, x: 0, y: 0 }
              }
              transition={{ type: "spring", stiffness: 180, damping: 14 }}
              className="relative w-44 h-56 sm:w-52 sm:h-64 rounded-b-[4.5rem] rounded-t-[2rem] border-[6px] border-white/70 bg-white/10 shadow-[0_15px_30px_rgba(0,0,0,0.06),inset_0_4px_12px_rgba(255,255,255,0.7)] flex items-center justify-center overflow-visible z-20"
            >
              {/* Highlight Overlay for Glossy Glass Look */}
              <div className="absolute top-2 left-4 w-4 h-[80%] rounded-full bg-white/20 filter blur-[1px] pointer-events-none" />
              <div className="absolute top-2 right-4 w-1.5 h-[60%] rounded-full bg-white/10 pointer-events-none" />

              {/* Mixed Liquid Background Fill (Inside the Jar) */}
              <div
                className="absolute bottom-0 inset-x-0 rounded-b-[3.9rem] rounded-t-[1.5rem] transition-all duration-300 pointer-events-none"
                style={{
                  height: totalAdded > 0 ? `${Math.min(95, 30 + totalAdded * 12)}%` : "0%",
                  backgroundColor: displayColor,
                  opacity: totalAdded > 0 ? Math.max(0.15, mixProgress / 100) : 0,
                  boxShadow: "inset 0 4px 6px rgba(255,255,255,0.3), inset 0 -6px 12px rgba(0,0,0,0.1)"
                }}
              />

              {/* Mixing Beater Shaft & Blades */}
              <motion.div
                className="absolute inset-x-0 top-0 bottom-8 flex flex-col items-center pointer-events-none z-10"
                animate={{ rotate: (crankVisualAngle * 180) / Math.PI }}
                transition={{ ease: "linear", duration: 0.05 }}
              >
                {/* Silver Mixer Shaft */}
                <div className="w-2.5 h-[70%] bg-gradient-to-r from-slate-300 via-white to-slate-400 border border-slate-500/20" />
                {/* Propeller Blade */}
                <div className="w-24 h-4 bg-gradient-to-b from-slate-400 to-slate-600 rounded-full border border-slate-700/20 shadow-md flex justify-between px-2">
                  <div className="w-2 h-2 rounded-full bg-white/40" />
                  <div className="w-2 h-2 rounded-full bg-white/40" />
                </div>
              </motion.div>

              {/* Rendering Falling Droplets and orbital blobs */}
              <div className="absolute inset-0 rounded-b-[3.9rem] rounded-t-[1.5rem] overflow-hidden pointer-events-none">
                <AnimatePresence>
                  {blobs.map(blob => {
                    if (!blob.isDropped) {
                      // Dropping animation
                      return (
                        <motion.div
                          key={blob.id}
                          initial={{ y: -60, scale: 1.4, opacity: 1 }}
                          animate={{ y: 140, scale: 1.0 }}
                          exit={{ opacity: 0 }}
                          transition={{ type: "spring", stiffness: 160, damping: 9 }}
                          onAnimationComplete={() => handleBlobLand(blob.id, blob.type)}
                          className="absolute w-7 h-7 rounded-full shadow-inner z-30"
                          style={{
                            backgroundColor: blob.color,
                            left: `${blob.x}%`,
                            boxShadow: "inset 2px 2px 4px rgba(255,255,255,0.4), inset -2px -2px 4px rgba(0,0,0,0.2)"
                          }}
                        />
                      );
                    } else {
                      // Orbiting blend blobs inside jar
                      const targetX = 80 + Math.cos(blob.angle) * blob.radius;
                      const targetY = 130 + Math.sin(blob.angle) * blob.radius;
                      const scale = 1 - mixProgress / 100;

                      if (scale <= 0.05) return null;

                      return (
                        <motion.div
                          key={blob.id}
                          animate={{
                            x: targetX,
                            y: targetY,
                            scale: scale,
                            opacity: scale
                          }}
                          transition={{ ease: "linear", duration: 0.05 }}
                          className="absolute w-7 h-7 rounded-full shadow-inner z-20 filter blur-[1px]"
                          style={{
                            backgroundColor: blob.color,
                            left: 0,
                            top: 0,
                            boxShadow: "inset 2px 2px 4px rgba(255,255,255,0.4), inset -2px -2px 4px rgba(0,0,0,0.2)"
                          }}
                        />
                      );
                    }
                  })}
                </AnimatePresence>
              </div>
            </motion.div>

            {/* Pouring Stream animation */}
            <AnimatePresence>
              {pourState === "pouring" && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 160, opacity: 0.9 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="absolute left-[38%] top-[55%] w-5 rounded-full z-10 origin-top shadow-md"
                  style={{
                    backgroundColor: displayColor,
                    boxShadow: "inset 2px 0 4px rgba(255,255,255,0.4)"
                  }}
                />
              )}
            </AnimatePresence>

            {/* Feed Bowl / Mascot Cup next to the jar */}
            <div className="absolute left-[15%] bottom-[10px] w-20 h-10 rounded-b-3xl rounded-a-md bg-rose-200 border-[3px] border-white shadow-md flex items-center justify-center z-10">
              <div
                className="w-[85%] rounded-b-2xl transition-all duration-300"
                style={{
                  height: pourState === "pouring" || pourState === "fed" ? "80%" : "0%",
                  backgroundColor: displayColor,
                  opacity: 0.9
                }}
              />
              <span className="absolute -top-3.5 text-xs">🥛</span>
            </div>

            {/* Crank Wheel Controller Block */}
            <div className="absolute right-[5%] bottom-[30px] flex flex-col items-center gap-2">
              <div className="relative w-28 h-28 flex items-center justify-center overflow-visible select-none">
                
                {/* Visual Dotted Helper Arrow showing spinning direction */}
                {totalAdded > 0 && mixProgress < 100 && (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                    className="absolute -inset-4 border-[3px] border-dashed border-[#ff4d6d]/40 rounded-full pointer-events-none"
                  />
                )}

                {/* Crank Wheel Body */}
                <motion.div
                  onPointerDown={handleCrankPointerDown}
                  onPointerMove={handleCrankPointerMove}
                  onPointerUp={handleCrankPointerUp}
                  style={{ rotate: (crankVisualAngle * 180) / Math.PI }}
                  className="w-24 h-24 rounded-full bg-[#fdf5f2] border-[4px] border-white shadow-clay-btn hover:scale-103 cursor-grab active:cursor-grabbing flex items-center justify-center z-20 relative select-none touch-none"
                >
                  {/* Spokes */}
                  <div className="absolute w-0.5 h-full bg-slate-300" />
                  <div className="absolute h-0.5 w-full bg-slate-300" />
                  <div className="w-8 h-8 rounded-full bg-white border-2 border-slate-200 z-10 shadow-sm" />

                  {/* Red Handle Knob on outer edge */}
                  <div
                    className="absolute w-7 h-7 rounded-full bg-[#ff4d6d] border-2 border-white shadow-md z-30"
                    style={{ left: "calc(50% + 26px)", top: "calc(50% - 14px)" }}
                  />
                </motion.div>
              </div>
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest select-none">
                SPIN WHEEL 🎡
              </span>
            </div>
          </div>

          {/* Bottom Controls */}
          <div className="flex justify-between items-center gap-4 mt-3 z-30 shrink-0 select-none">
            <ClayButton
              variant="surface"
              size="sm"
              onClick={handleClear}
              className="bg-white/95 shadow-md active:scale-95 border-2 border-white/40"
            >
              Clear 🔄
            </ClayButton>

            {/* Blend Progress Pill */}
            <div className="flex items-center gap-2 bg-white/80 px-3 py-2 rounded-full border border-white shadow-inner">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">
                {totalAdded === 0
                  ? "Add colors first!"
                  : mixProgress < 100
                  ? "Spin Wheel!"
                  : "Mixed! 🎉"}
              </span>
              <div className="w-20 bg-slate-200 h-2.5 rounded-full overflow-hidden border border-black/5">
                <div
                  className="bg-emerald-400 h-full transition-all duration-150"
                  style={{ width: `${mixProgress}%` }}
                />
              </div>
            </div>

            <ClayButton
              variant={mixProgress >= 100 ? "primary" : "surface"}
              size="sm"
              isDisabled={mixProgress < 100}
              onClick={handlePour}
              className="shadow-md"
            >
              {pourState === "fed" ? "Yum! 😋" : "Pour 🫗"}
            </ClayButton>
          </div>
        </div>

      </div>

    </div>
  );
}
