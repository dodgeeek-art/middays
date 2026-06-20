"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { ArrowLeft, Volume2, PenTool, Sparkles } from "@/components/Icons";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import ClayButton from "@/components/ui/ClayButton";
import ClayCard from "@/components/ui/ClayCard";
import { vocabularyList } from "@/lib/svgDictionary";

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

const tracingTemplates = [
  {
    id: "heart",
    name: "Red Heart",
    vocabName: "Heart",
    d: "M6 6c4.665-2.332 8.5.5 10 2.5c1.5-2 5.335-4.832 10-2.5c6 3 4.5 10.5 0 15c-2.196 2.196-6.063 6.063-8.891 8.214a1.764 1.764 0 0 1-2.186-.041C12.33 27.08 8.165 23.165 6 21C1.5 16.5 0 9 6 6",
    color: "#ff4d6d"
  },
  {
    id: "star",
    name: "Golden Star",
    vocabName: "Star",
    d: "m18.7 4.627l2.247 4.31a2.27 2.27 0 0 0 1.686 1.189l4.746.65c2.538.35 3.522 3.479 1.645 5.219l-3.25 2.999a2.23 2.23 0 0 0-.683 2.04l.793 4.398c.441 2.45-2.108 4.36-4.345 3.24l-4.536-2.25a2.28 2.28 0 0 0-2.006 0l-4.536 2.25c-2.238 1.11-4.786-.79-4.345-3.24l.793-4.399c.14-.75-.12-1.52-.682-2.04l-3.251-2.998c-1.877-1.73-.893-4.87 1.645-5.22l4.746-.65a2.23 2.23 0 0 0 1.686-1.189l2.248-4.309c1.144-2.17 4.264-2.17 5.398 0",
    color: "#ffd166"
  },
  {
    id: "sun",
    name: "Bright Sun",
    vocabName: "Sun",
    d: "M13.638 3.202a2.936 2.936 0 0 1 4.724 0a2.94 2.94 0 0 0 3.25 1.055a2.936 2.936 0 0 1 3.822 2.778a2.94 2.94 0 0 0 2.008 2.763a2.936 2.936 0 0 1 1.46 4.494a2.94 2.94 0 0 0 0 3.416a2.936 2.936 0 0 1-1.46 4.494a2.94 2.94 0 0 0-2.008 2.763a2.936 2.936 0 0 1-3.823 2.778a2.94 2.94 0 0 0-3.249 1.055a2.936 2.936 0 0 1-4.724 0a2.94 2.94 0 0 0-3.25-1.055a2.936 2.936 0 0 1-3.822-2.778a2.94 2.94 0 0 0-2.008-2.763a2.936 2.936 0 0 1-1.46-4.494a2.94 2.94 0 0 0 0-3.416a2.936 2.936 0 0 1 1.46-4.494a2.94 2.94 0 0 0 2.008-2.763a2.936 2.936 0 0 1 3.823-2.778a2.94 2.94 0 0 0 3.249-1.055",
    color: "#f97316"
  },
  {
    id: "cat",
    name: "Cute Cat",
    vocabName: "Cat",
    d: "M4 25.942C4 28.174 5.763 30 7.918 30h16.164C26.237 30 28 28.073 28 25.84V6.43c0-1.3-1.59-1.9-2.485-1L20.975 10h-9.812L6.5 5.43c-.9-.9-2.5-.3-2.5 1z",
    color: "#ff9f1c"
  }
];

export default function MarkMakerEngine({ childId, onBack }: { childId: string; onBack: () => void }) {
  const [phase, setPhase] = useState<"drawing" | "success">("drawing");
  const [activeTemplateIdx, setActiveTemplateIdx] = useState(0);
  const [allCheckpointsHit, setAllCheckpointsHit] = useState(false);
  const [startTime] = useState<number>(() => Date.now());

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const svgPathRef = useRef<SVGPathElement>(null);
  const checkpointsRef = useRef<{ x: number; y: number; hit: boolean }[]>([]);
  const isDrawingRef = useRef(false);
  const drawnStrokes = useRef<Point[][]>([]);
  const particles = useRef<{ x: number; y: number; color: string; alpha: number; vx: number; vy: number }[]>([]);

  const template = tracingTemplates[activeTemplateIdx];
  const vocabItem = vocabularyList.find(v => v.name === template.vocabName);
  const TemplateIcon = vocabItem?.icon;

  const speakText = useCallback((text: string) => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.85;
      utterance.pitch = 1.25;
      window.speechSynthesis.speak(utterance);
    }
  }, []);

  // Initialize and scale checkpoints when template changes
  useEffect(() => {
    drawnStrokes.current = [];
    particles.current = [];
    setAllCheckpointsHit(false);

    // Speak template name
    speakText(`Let's trace the ${template.name}!`);

    // Redraw canvas base state
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    const timer = setTimeout(() => {
      if (svgPathRef.current) {
        const length = svgPathRef.current.getTotalLength();
        const pts = [];
        for (let i = 0; i <= 20; i++) {
          const p = svgPathRef.current.getPointAtLength((i / 20) * length);
          // Scale & center coordinates: translate(2,2) scale(0.875) -> scale(8) translate(22,22) -> scale(5/3)
          const x_svg = 22 + 8 * (2 + 0.875 * p.x);
          const y_svg = 22 + 8 * (2 + 0.875 * p.y);
          pts.push({
            x: x_svg * 5 / 3,
            y: y_svg * 5 / 3,
            hit: false
          });
        }
        checkpointsRef.current = pts;
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [activeTemplateIdx, template, speakText]);

  // Smooth canvas animation loop
  useEffect(() => {
    let animFrameId: number;
    const tick = () => {
      drawCanvas();
      animFrameId = requestAnimationFrame(tick);
    };
    animFrameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animFrameId);
  }, []);

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 1. Redraw user's strokes (Glowing thick line)
    if (drawnStrokes.current.length > 0) {
      // Glow underlay
      ctx.save();
      ctx.lineWidth = 24;
      ctx.strokeStyle = "rgba(255, 133, 161, 0.35)";
      ctx.shadowColor = "#ff85a1";
      ctx.shadowBlur = 12;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      drawnStrokes.current.forEach(stroke => {
        if (stroke.length > 0) {
          ctx.beginPath();
          ctx.moveTo(stroke[0].x, stroke[0].y);
          for (let i = 1; i < stroke.length; i++) {
            ctx.lineTo(stroke[i].x, stroke[i].y);
          }
          ctx.stroke();
        }
      });
      ctx.restore();

      // Main white core line
      ctx.save();
      ctx.lineWidth = 10;
      ctx.strokeStyle = "#ffffff";
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      drawnStrokes.current.forEach(stroke => {
        if (stroke.length > 0) {
          ctx.beginPath();
          ctx.moveTo(stroke[0].x, stroke[0].y);
          for (let i = 1; i < stroke.length; i++) {
            ctx.lineTo(stroke[i].x, stroke[i].y);
          }
          ctx.stroke();
        }
      });
      ctx.restore();
    }

    // 2. Update and draw sparkles
    particles.current = particles.current.filter(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.alpha -= 0.035;
      if (p.alpha <= 0) return false;

      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.alpha * 12 + 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      return true;
    });
  };

  const getCanvasCoordinates = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const addParticles = (x: number, y: number, count = 3) => {
    const colors = [template.color, "#ffffff", "#ffc4c0", "#eaddfc", "#faf9f5"];
    for (let i = 0; i < count; i++) {
      particles.current.push({
        x,
        y,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 1.0,
        vx: (Math.random() - 0.5) * 6,
        vy: (Math.random() - 0.5) * 6
      });
    }
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (phase !== "drawing") return;
    e.currentTarget.setPointerCapture(e.pointerId);

    isDrawingRef.current = true;
    const pt = getCanvasCoordinates(e);
    drawnStrokes.current.push([pt]);
    addParticles(pt.x, pt.y, 6);
    playSynthesizedSound("click");
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current || phase !== "drawing") return;
    const pt = getCanvasCoordinates(e);

    const currentStrokeIndex = drawnStrokes.current.length - 1;
    if (currentStrokeIndex >= 0) {
      drawnStrokes.current[currentStrokeIndex].push(pt);
    }

    addParticles(pt.x, pt.y, 2);

    // Equidistant hit detection
    let hitCount = 0;
    checkpointsRef.current.forEach(cp => {
      if (!cp.hit) {
        const dist = Math.hypot(pt.x - cp.x, pt.y - cp.y);
        if (dist < 72) { // Generous hitbox for toddlers
          cp.hit = true;
        }
      }
      if (cp.hit) hitCount++;
    });

    if (hitCount === checkpointsRef.current.length) {
      setAllCheckpointsHit(true);
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    isDrawingRef.current = false;
    e.currentTarget.releasePointerCapture(e.pointerId);

    const allHit = checkpointsRef.current.every(cp => cp.hit);
    if (allHit) {
      handleTraceComplete();
    }
  };

  const handleTraceComplete = () => {
    playSynthesizedSound("correct");
    confetti({
      particleCount: 60,
      spread: 60,
      origin: { y: 0.75 },
      colors: ["#ff85a1", "#ffd166", "#3fa394", "#ffffff"]
    });

    setTimeout(() => {
      if (activeTemplateIdx < tracingTemplates.length - 1) {
        setActiveTemplateIdx(prev => prev + 1);
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

  const handleClear = () => {
    playSynthesizedSound("click");
    drawnStrokes.current = [];
    checkpointsRef.current.forEach(cp => cp.hit = false);
    setAllCheckpointsHit(false);
  };

  const activeParentPrompt = template ? `Ask your child: "Can you trace the outline of the ${template.name}? What shape does it make?"` : "";

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
          <PenTool size={24} className="text-[#e07383]" strokeWidth={3.5} />
          Trace & Color
        </h1>

        <div className="bg-white/80 border-2 border-white/40 shadow-inner px-4 py-2 rounded-full font-black text-[#e07383] text-sm tracking-wide">
          TRACE {activeTemplateIdx + 1}/{tracingTemplates.length} ✏️
        </div>
      </div>

      {/* Parental Co-Play Banner */}
      <div className="bg-[#f7c2b3]/70 border-2 border-white/50 text-[#732010] p-3 rounded-2xl mb-4 text-center font-bold text-xs sm:text-sm shadow-[inset_-2px_-2px_4px_rgba(0,0,0,0.02),_inset_2px_2px_4px_rgba(255,255,255,0.8)] leading-snug shrink-0">
        <span className="text-[10px] font-black uppercase tracking-wider text-[#e07383] block mb-0.5">🧑‍🍼 Parent & Child Co-Play Option</span>
        {activeParentPrompt}
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
                Super tracing! You earned the Trace & Color Badge!
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

        {/* Phase: Drawing Canvas */}
        {phase === "drawing" && (
          <div className="flex-grow flex flex-col items-center justify-between min-h-0">
            {/* Reference Example Card */}
            <div className="flex flex-col items-center gap-1.5 mb-3 shrink-0">
              {TemplateIcon && (
                <div className="w-14 h-14 bg-white rounded-2xl border-[3px] border-white/50 shadow-clay-card flex items-center justify-center p-2.5 hover:scale-105 transition-transform duration-200">
                  <TemplateIcon size={38} animClass="anim-breathe" />
                </div>
              )}
              <span className="text-xs sm:text-sm font-black text-[#732010] uppercase tracking-wider">
                Trace the: {template.name}
              </span>
            </div>

            {/* Glowing Canvas board */}
            <div className="flex-grow w-full max-w-lg aspect-square bg-[#22252a] rounded-[2.5rem] border-[4px] border-white/80 shadow-clay-card relative overflow-hidden select-none">
              
              {/* Brushed texture overlay inside canvas */}
              <div className="absolute inset-0 bg-noise opacity-15 pointer-events-none" />

              {/* Hidden SVG for path length calculations */}
              <svg width="0" height="0" className="absolute pointer-events-none">
                <path ref={svgPathRef} d={template.d} />
              </svg>

              {/* Template background drawing */}
              <svg
                viewBox="0 0 300 300"
                className="absolute inset-0 w-full h-full pointer-events-none z-10"
              >
                {/* Watermark and Scaled Guide Path */}
                <g transform="translate(22, 22) scale(8)">
                  {TemplateIcon && (
                    <g className="opacity-15 pointer-events-none">
                      <TemplateIcon size="32" animClass="" />
                    </g>
                  )}
                  
                  <g transform="translate(2, 2) scale(0.875)">
                    {/* Dark Guide Track Underlay */}
                    <path
                      d={template.d}
                      fill="none"
                      stroke="#484d54"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    {/* Glowing Dotted Guide Stroke */}
                    <path
                      d={template.d}
                      fill="none"
                      stroke={template.color}
                      strokeWidth="1.2"
                      strokeDasharray="1.5 2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="opacity-90"
                    />
                  </g>
                </g>
              </svg>

              {/* Interactive Canvas Overlay */}
              <canvas
                ref={canvasRef}
                width={500}
                height={500}
                className="w-full h-full absolute inset-0 cursor-crosshair touch-none z-20"
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
              />

              {/* Drawing reset button */}
              <div className="absolute bottom-4 right-4 z-30">
                <ClayButton
                  variant="surface"
                  size="sm"
                  onClick={handleClear}
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
                onClick={() => speakText(`Draw along the outline of the ${template.name}!`)}
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
