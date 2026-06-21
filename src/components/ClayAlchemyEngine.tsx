"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { ArrowLeft, Volume2, Sparkles, Smile } from "@/components/Icons";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import ClayButton from "@/components/ui/ClayButton";
import { vocabularyList } from "@/lib/svgDictionary";

interface PigmentBlob {
  id: number;
  color: string;
  type: "red" | "yellow" | "blue";
  x: number;
  y: number;
  vy: number;
}

interface AlchemyLevel {
  targetName: "Orange" | "Green" | "Purple" | "Brown";
  targetRgb: { r: number; g: number; b: number };
  vocabName: string;
  mascotSpeech: string;
  check: (r: number, y: number, b: number) => boolean;
}

const levels: AlchemyLevel[] = [
  {
    targetName: "Orange",
    targetRgb: { r: 247, g: 130, b: 45 },
    vocabName: "Fox",
    mascotSpeech: "Help me mix Orange clay for the Fox! Try Red and Yellow!",
    check: (r, y, b) => r > 0 && y > 0 && b === 0
  },
  {
    targetName: "Green",
    targetRgb: { r: 0, g: 210, b: 106 },
    vocabName: "Frog",
    mascotSpeech: "Help me mix Green clay for the Frog! Try Yellow and Blue!",
    check: (r, y, b) => y > 0 && b > 0 && r === 0
  },
  {
    targetName: "Purple",
    targetRgb: { r: 158, g: 123, b: 245 },
    vocabName: "Koala",
    mascotSpeech: "Help me mix Purple clay for the Koala! Try Red and Blue!",
    check: (r, y, b) => r > 0 && b > 0 && y === 0
  },
  {
    targetName: "Brown",
    targetRgb: { r: 140, g: 85, b: 67 },
    vocabName: "Bear",
    mascotSpeech: "Help me mix Brown clay for the Bear! Try Red, Yellow, and Blue!",
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
  const [startTime] = useState<number>(() => Date.now());

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const blobsRef = useRef<PigmentBlob[]>([]);
  const nextBlobId = useRef(0);
  const crankAngleRef = useRef(0);
  const isDraggingCrank = useRef(false);

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
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.exponentialRampToValueAtTime(80, now + 0.3);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(now + 0.3);
      } else if (type === "blend") {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.setValueAtTime(240, now + 0.05);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(now + 0.1);
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
    blobsRef.current = [];

    speakText(activeLevel.mascotSpeech);
  }, [levelIdx, activeLevel, speakText]);

  // Main animation canvas loop
  useEffect(() => {
    let animId: number;
    const canvas = canvasRef.current;
    const tick = () => {
      if (canvas) {
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          // Update falling blobs
          blobsRef.current = blobsRef.current.filter(blob => {
            blob.y += blob.vy;
            blob.vy += 0.4; // Gravity

            // Splash boundary at bottom of jar
            if (blob.y >= 300) {
              if (blob.type === "red") setRedAmt(prev => prev + 1);
              else if (blob.type === "yellow") setYellowAmt(prev => prev + 1);
              else if (blob.type === "blue") setBlueAmt(prev => prev + 1);
              setMixProgress(0); // Reset blend completion when new pigments enter
              return false;
            }

            // Draw blob
            ctx.save();
            ctx.fillStyle = blob.color;
            ctx.beginPath();
            ctx.arc(blob.x, blob.y, 22, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
            return true;
          });

          // Draw blender liquid color
          const total = redAmt + yellowAmt + blueAmt;
          if (total > 0) {
            const r_pct = redAmt / total;
            const y_pct = yellowAmt / total;
            const b_pct = blueAmt / total;

            // Pigment base values
            // Red: RGB(255, 77, 109)
            // Yellow: RGB(255, 209, 102)
            // Blue: RGB(17, 138, 178)
            const target_r = r_pct * 255 + y_pct * 255 + b_pct * 17;
            const target_g = r_pct * 77 + y_pct * 209 + b_pct * 138;
            const target_b = r_pct * 109 + y_pct * 102 + b_pct * 178;

            // Blend progress dictates interpolation between separate layers and fully mixed color
            const blendFactor = mixProgress / 100;
            const display_r = Math.round(target_r * blendFactor + 255 * (1 - blendFactor));
            const display_g = Math.round(target_g * blendFactor + 255 * (1 - blendFactor));
            const display_b = Math.round(target_b * blendFactor + 255 * (1 - blendFactor));

            ctx.save();
            ctx.fillStyle = `rgb(${display_r}, ${display_g}, ${display_b})`;
            ctx.beginPath();
            ctx.ellipse(150, 320, 90, 50, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          }

          // Draw the physical blender outline jar
          ctx.save();
          ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
          ctx.lineWidth = 6;
          ctx.beginPath();
          ctx.moveTo(60, 150);
          ctx.lineTo(80, 340);
          ctx.ellipse(150, 340, 70, 20, 0, 0, Math.PI);
          ctx.lineTo(240, 150);
          ctx.stroke();
          ctx.restore();

          // Draw the crank wheel
          ctx.save();
          ctx.translate(280, 260);
          ctx.rotate(crankAngleRef.current);
          ctx.fillStyle = "#ffc4d6";
          ctx.strokeStyle = "#ffffff";
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.arc(0, 0, 42, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          // Crank knob handle
          ctx.fillStyle = "#ff85a1";
          ctx.beginPath();
          ctx.arc(28, 0, 14, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          ctx.restore();
        }
      }
      animId = requestAnimationFrame(tick);
    };
    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [redAmt, yellowAmt, blueAmt, mixProgress]);

  const handleSqueeze = (type: "red" | "yellow" | "blue") => {
    if (pourState !== "idle") return;
    playSynthesizedSound("squeeze");

    const colorMap = {
      red: "#ff4d6d",
      yellow: "#ffd166",
      blue: "#118ab2"
    };

    blobsRef.current.push({
      id: nextBlobId.current++,
      color: colorMap[type],
      type,
      x: 120 + Math.random() * 60,
      y: 110,
      vy: 1.0
    });
  };

  const handleCrankPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (redAmt + yellowAmt + blueAmt === 0 || pourState !== "idle") return;
    isDraggingCrank.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handleCrankPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingCrank.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;

    const angle = Math.atan2(e.clientY - cy, e.clientX - cx);
    const diff = Math.abs(angle - crankAngleRef.current);
    if (diff > 0.05 && diff < 1.0) {
      crankAngleRef.current = angle;
      setMixProgress(prev => {
        const next = Math.min(100, prev + 1.2);
        if (Math.floor(next) > Math.floor(prev) && Math.floor(next) % 15 === 0) {
          playSynthesizedSound("blend");
        }
        return next;
      });
    }
  };

  const handleCrankPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    isDraggingCrank.current = false;
    e.currentTarget.releasePointerCapture(e.pointerId);
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

        // Save progress
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
    blobsRef.current = [];
  };

  return (
    <div className="flex flex-col w-full max-w-4xl mx-auto h-full min-h-0 bg-[#fff5f6] p-4 rounded-[2.5rem] border-[3px] border-white/50 shadow-clay-card relative overflow-hidden select-none">
      
      {/* Background decor */}
      <div className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full bg-[#ff4d6d]/5 blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between mb-4 shrink-0">
        <ClayButton
          variant="surface"
          size="icon"
          className="min-w-[64px] min-h-[64px]"
          onClick={() => {
            playSynthesizedSound("click");
            onBack();
          }}
        >
          <ArrowLeft size={28} strokeWidth={3.5} />
        </ClayButton>

        <h1 className="text-xl sm:text-2xl font-black uppercase text-[#4A5358] tracking-wider flex items-center gap-2">
          <Smile size={24} className="text-[#ff4d6d]" strokeWidth={3.5} />
          Clay Alchemy
        </h1>

        <div className="bg-white/80 border-2 border-white/40 shadow-inner px-4 py-2 rounded-full font-black text-[#ff4d6d] text-sm tracking-wide">
          LEVEL {levelIdx + 1}/{levels.length} 🧪
        </div>
      </div>

      {/* Mascot Speech Banner */}
      <div className="bg-white p-3 rounded-2xl border-2 border-white/60 shadow-clay-card flex items-center gap-3 mb-4 shrink-0">
        {MascotIcon && (
          <div className="w-12 h-12 rounded-xl bg-[#fff5f6] border-2 border-white flex items-center justify-center shrink-0">
            <MascotIcon size={32} animClass="anim-sway" />
          </div>
        )}
        <span className="text-xs sm:text-sm font-black text-[#732010] leading-snug">
          {activeLevel.mascotSpeech}
        </span>
      </div>

      <div className="flex-grow flex flex-col sm:flex-row gap-6 min-h-0 relative z-10">
        
        {/* Left Panel: Squeeze Tubes */}
        <div className="flex sm:flex-col justify-around items-center gap-4 bg-white/70 p-4 rounded-3xl border-2 border-white/50 shadow-clay-card sm:w-28 shrink-0">
          {(["red", "yellow", "blue"] as const).map(color => {
            const hexMap = { red: "#ff4d6d", yellow: "#ffd166", blue: "#118ab2" };
            return (
              <button
                key={color}
                onClick={() => handleSqueeze(color)}
                className="w-14 h-24 rounded-2xl border-2 border-white shadow-md active:scale-95 hover:scale-105 transition-all duration-150 relative overflow-hidden flex flex-col justify-between items-center p-2"
                style={{ backgroundColor: `${hexMap[color]}20` }}
              >
                <div className="w-full h-8 rounded-lg" style={{ backgroundColor: hexMap[color] }} />
                <span className="text-[10px] font-black text-slate-600 uppercase">{color}</span>
              </button>
            );
          })}
        </div>

        {/* Center: Blender and Crank Wheel */}
        <div className="flex-grow flex flex-col justify-between bg-[#22252a] rounded-[2.5rem] border-[4px] border-white/80 shadow-clay-card relative overflow-hidden p-4 min-h-[300px]">
          <div className="absolute inset-0 bg-noise opacity-10 pointer-events-none" />

          {/* Interactive Canvas container */}
          <div className="flex-grow w-full relative flex justify-center items-center">
            <canvas
              ref={canvasRef}
              width={380}
              height={400}
              className="max-h-full aspect-[38/40]"
            />

            {/* Invisible drag wrapper directly over the crank location */}
            <div
              className="absolute w-24 h-24 rounded-full cursor-grab z-30 select-none touch-none"
              style={{ left: "calc(50% + 50px)", top: "calc(50% + 40px)" }}
              onPointerDown={handleCrankPointerDown}
              onPointerMove={handleCrankPointerMove}
              onPointerUp={handleCrankPointerUp}
            />
          </div>

          {/* Clear jar & Pour options */}
          <div className="flex justify-between items-center gap-4 mt-2 z-30 shrink-0">
            <ClayButton
              variant="surface"
              size="sm"
              onClick={handleClear}
              className="bg-white/90"
            >
              Clear 🔄
            </ClayButton>

            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black text-white uppercase tracking-wider">
                {mixProgress < 100 ? "Spin Crank to Mix!" : "Fully Mixed!"}
              </span>
              <div className="w-20 bg-slate-700 h-2 rounded-full overflow-hidden">
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
            >
              {pourState === "fed" ? "Yum! 😋" : "Pour 🫗"}
            </ClayButton>
          </div>
        </div>

      </div>

    </div>
  );
}
