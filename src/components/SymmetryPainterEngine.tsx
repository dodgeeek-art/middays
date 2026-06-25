"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { ArrowLeft, Volume2, Sparkles, Lightbulb } from "@/components/Icons";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import ClayButton from "@/components/ui/ClayButton";
import { vocabularyList } from "@/lib/svgDictionary";
import { playSynthesizedSound } from "@/lib/audio";

interface Point {
  x: number;
  y: number;
}

interface Stroke {
  points: Point[];
  color: string;
}

interface SymmetryTemplate {
  id: string;
  name: string;
  vocabName: string;
  d: string;
  color: string;
}

const symmetryTemplates: SymmetryTemplate[] = [
  {
    id: "butterfly",
    name: "Beautiful Butterfly",
    vocabName: "Butterfly",
    d: "M27.5 2c-.62 0-1.19.23-1.63.6L16 11L6.13 2.6C5.69 2.23 5.12 2 4.5 2A2.5 2.5 0 0 0 2 4.5v9.75C2 16.32 3.68 18 5.75 18H8c-3.31 0-6 2.69-6 6s2.69 6 6 6a6 6 0 0 0 5.67-4.04L16 20.39l2.33 5.57A6 6 0 0 0 24 30c3.31 0 6-2.69 6-6s-2.69-6-6-6h2.25c2.07 0 3.75-1.68 3.75-3.75V4.5A2.5 2.5 0 0 0 27.5 2",
    color: "#FF6723"
  },
  {
    id: "crab",
    name: "Happy Crab",
    vocabName: "Crab",
    d: "M8.316 11.5H6C6 7.912 8.902 5 12.5 5v2.326A4.18 4.18 0 0 1 8.316 11.5m15.368 0H26C26 7.912 23.098 5 19.5 5v2.326a4.18 4.18 0 0 0 4.184 4.174M16 27c4.97 0 9-3.901 9-8.713C25 13.465 20.97 13 16 13s-9 .475-9 5.287S11.03 27 16 27",
    color: "#f92f60"
  },
  {
    id: "frog",
    name: "Happy Frog",
    vocabName: "Frog",
    d: "M28 8.441c.01.86-.18 1.67-.52 2.4c-.15.33-.1.71.13.99c1.49 1.82 2.39 4.14 2.39 6.67q-.002 1.055-.2 2.05c.01-.053-.416.055-.406 0l-1.824 1.256l-11.748 3.992L4.4 21.807l-1.982-1.233c.007.04-.233-.102-.226-.062A10.6 10.6 0 0 1 2 18.502c0-2.53.9-4.85 2.39-6.67c.23-.28.28-.67.13-1c-.34-.72-.53-1.54-.52-2.4c.04-2.95 2.43-5.36 5.38-5.43a5.49 5.49 0 0 1 5.56 4.73c.02.15.15.27.31.27h1.49c.16 0 .29-.12.31-.27a5.5 5.5 0 0 1 5.57-4.73c2.95.07 5.34 2.48 5.38 5.44",
    color: "#00D26A"
  }
];

const colorsPalette = ["#ff4d6d", "#ffd166", "#06d6a0", "#118ab2", "#9e7bf5"];

export default function SymmetryPainterEngine({ childId, onBack }: { childId: string; onBack: () => void }) {
  const [activeTemplateIdx, setActiveTemplateIdx] = useState(0);
  const [selectedColor, setSelectedColor] = useState(colorsPalette[0]);
  const [unfolded, setUnfolded] = useState(false);
  const [startTime] = useState<number>(() => Date.now());

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const svgPathRef = useRef<SVGPathElement>(null);
  const checkpointsRef = useRef<{ x: number; y: number; hit: boolean }[]>([]);
  const isDrawingRef = useRef(false);
  const drawnStrokes = useRef<Stroke[]>([]);
  const particles = useRef<{ x: number; y: number; color: string; alpha: number; vx: number; vy: number }[]>([]);
  const animFrameRef = useRef<number | null>(null);
  const loopRunningRef = useRef(false);

  const template = symmetryTemplates[activeTemplateIdx];
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



  useEffect(() => {
    drawnStrokes.current = [];
    particles.current = [];
    setUnfolded(false);

    speakText(`Let's paint a symmetrical ${template.name}!`);

    const timer = setTimeout(() => {
      if (svgPathRef.current) {
        const length = svgPathRef.current.getTotalLength();
        const pts = [];
        for (let i = 0; i <= 30; i++) {
          const p = svgPathRef.current.getPointAtLength((i / 30) * length);
          const x_svg = 22 + 8 * (2 + 0.875 * p.x);
          const y_svg = 22 + 8 * (2 + 0.875 * p.y);
          const x_canvas = x_svg * 5 / 3;
          const y_canvas = y_svg * 5 / 3;

          // Only keep checkpoints on the right half (x >= 250) for tracing
          if (x_canvas >= 250) {
            pts.push({
              x: x_canvas,
              y: y_canvas,
              hit: false
            });
          }
        }
        checkpointsRef.current = pts;
      }
      drawCanvas();
    }, 100);

    return () => clearTimeout(timer);
  }, [activeTemplateIdx, template, speakText]);

  useEffect(() => {
    return () => {
      if (animFrameRef.current !== null) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, []);

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw centerline if not completed
    if (!unfolded) {
      ctx.save();
      ctx.strokeStyle = "rgba(255, 213, 120, 0.4)";
      ctx.lineWidth = 3;
      ctx.setLineDash([6, 8]);
      ctx.beginPath();
      ctx.moveTo(250, 0);
      ctx.lineTo(250, 500);
      ctx.stroke();
      ctx.restore();
    }

    // Draw user strokes and mirrored ones
    drawnStrokes.current.forEach(stroke => {
      if (stroke.points.length === 0) return;

      // Glow underlay
      ctx.save();
      ctx.lineWidth = 20;
      ctx.strokeStyle = `${stroke.color}40`;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      // Right side glow
      ctx.beginPath();
      ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
      for (let i = 1; i < stroke.points.length; i++) {
        ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
      }
      ctx.stroke();

      // Left side mirrored glow
      ctx.beginPath();
      ctx.moveTo(500 - stroke.points[0].x, stroke.points[0].y);
      for (let i = 1; i < stroke.points.length; i++) {
        ctx.lineTo(500 - stroke.points[i].x, stroke.points[i].y);
      }
      ctx.stroke();
      ctx.restore();

      // Solid color core
      ctx.save();
      ctx.lineWidth = 8;
      ctx.strokeStyle = stroke.color;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      // Right side
      ctx.beginPath();
      ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
      for (let i = 1; i < stroke.points.length; i++) {
        ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
      }
      ctx.stroke();

      // Left side
      ctx.beginPath();
      ctx.moveTo(500 - stroke.points[0].x, stroke.points[0].y);
      for (let i = 1; i < stroke.points.length; i++) {
        ctx.lineTo(500 - stroke.points[i].x, stroke.points[i].y);
      }
      ctx.stroke();
      ctx.restore();
    });

    // Draw sparkles
    particles.current = particles.current.filter(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.alpha -= 0.035;
      if (p.alpha <= 0) return false;

      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.alpha * 10 + 2, 0, Math.PI * 2);
      ctx.fill();

      // Mirror sparkles
      ctx.beginPath();
      ctx.arc(500 - p.x, p.y, p.alpha * 10 + 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      return true;
    });
  };

  const startLoop = useCallback(() => {
    if (loopRunningRef.current) return;
    loopRunningRef.current = true;

    const tick = () => {
      drawCanvas();
      if (isDrawingRef.current || particles.current.length > 0) {
        animFrameRef.current = requestAnimationFrame(tick);
      } else {
        loopRunningRef.current = false;
        animFrameRef.current = null;
      }
    };

    animFrameRef.current = requestAnimationFrame(tick);
  }, []);

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
    for (let i = 0; i < count; i++) {
      particles.current.push({
        x,
        y,
        color: selectedColor,
        alpha: 1.0,
        vx: (Math.random() - 0.5) * 5,
        vy: (Math.random() - 0.5) * 5
      });
    }
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (unfolded) return;
    e.currentTarget.setPointerCapture(e.pointerId);

    const pt = getCanvasCoordinates(e);
    // Tracing can only start or draw on the right half
    if (pt.x < 235) return; // Forgiving boundary

    isDrawingRef.current = true;
    drawnStrokes.current.push({
      points: [pt],
      color: selectedColor
    });
    addParticles(pt.x, pt.y, 5);
    playSynthesizedSound("click");
    startLoop();
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current || unfolded) return;
    const pt = getCanvasCoordinates(e);

    const currentStroke = drawnStrokes.current[drawnStrokes.current.length - 1];
    if (currentStroke) {
      currentStroke.points.push(pt);
    }
    addParticles(pt.x, pt.y, 2);

    // Hit detection along the right-half template checkpoints
    checkpointsRef.current.forEach(cp => {
      if (!cp.hit) {
        const dist = Math.hypot(pt.x - cp.x, pt.y - cp.y);
        if (dist < 64) {
          cp.hit = true;
        }
      }
    });

    const allHit = checkpointsRef.current.every(cp => cp.hit);
    if (allHit) {
      isDrawingRef.current = false;
      handleSymmetryComplete();
    }
    startLoop();
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    isDrawingRef.current = false;
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  const handleSymmetryComplete = () => {
    setUnfolded(true);
    drawCanvas();
    playSynthesizedSound("correct");
    confetti({
      particleCount: 70,
      spread: 70,
      origin: { y: 0.75 }
    });

    // Save telemetry progress
    if (childId) {
      const elapsed = Date.now() - startTime;
      fetch(`/api/progress/${childId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetLetter: "SYMM",
          tracingScore: 100,
          phonemicScore: 100,
          timeSpentMs: elapsed
        })
      }).catch(err => console.error("Telemetry failed:", err));
    }

    setTimeout(() => {
      setActiveTemplateIdx(prev => (prev + 1) % symmetryTemplates.length);
    }, 2500);
  };

  const handleClear = () => {
    playSynthesizedSound("click");
    drawnStrokes.current = [];
    checkpointsRef.current.forEach(cp => cp.hit = false);
    drawCanvas();
  };

  return (
    <div className="flex flex-col w-full max-w-4xl mx-auto h-full min-h-0 bg-[#fbfefb] p-4 rounded-[2.5rem] border-[3px] border-white/50 shadow-clay-card relative overflow-hidden select-none">
      
      {/* Background decoration */}
      <div className="absolute -top-20 -left-20 w-80 h-80 rounded-full bg-[#118ab2]/5 blur-3xl pointer-events-none" />

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
          <Lightbulb size={24} className="text-[#118ab2]" strokeWidth={3.5} />
          Symmetry Painter
        </h1>

        <div className="bg-white/80 border-2 border-white/40 shadow-inner px-4 py-2 rounded-full font-black text-[#118ab2] text-sm tracking-wide">
          PAINT {activeTemplateIdx + 1}/{symmetryTemplates.length} 🎨
        </div>
      </div>

      <div className="flex-grow flex flex-col justify-between min-h-0 relative z-10">
        
        {/* Draw Prompt */}
        <div className="text-center mb-3 shrink-0">
          <span className="text-sm sm:text-base font-black text-[#118ab2] uppercase tracking-wider">
            Trace the right side to paint the left side!
          </span>
        </div>

        {/* The Split Screen Canvas Board */}
        <div className="flex-grow w-full max-w-lg mx-auto aspect-square bg-[#22252a] rounded-[2.5rem] border-[4px] border-white/80 shadow-clay-card relative overflow-hidden">
          <div className="absolute inset-0 bg-noise opacity-10 pointer-events-none" />

          {/* Underlay Template showing left visual side and right outline side */}
          <svg
            viewBox="0 0 300 300"
            className="absolute inset-0 w-full h-full pointer-events-none z-10"
          >
            {/* Define the left-half and right-half clip paths in local coordinates */}
            <defs>
              <clipPath id="left-half-clip">
                <rect x="-10" y="-10" width="26" height="52" />
              </clipPath>
              <clipPath id="right-half-clip">
                <rect x="16" y="-10" width="26" height="52" />
              </clipPath>
            </defs>

            {/* Symmetrical Mascot guides */}
            <g transform="translate(22, 22) scale(8)">
              {/* Left Half: Full opacity visual card watermark */}
              <g clipPath="url(#left-half-clip)">
                {TemplateIcon && (
                  <g className={unfolded ? "opacity-100" : "opacity-40"}>
                    <TemplateIcon size="32" animClass="" />
                  </g>
                )}
              </g>

              {/* Right Half: Outline trace target */}
              {!unfolded && (
                <g clipPath="url(#right-half-clip)" transform="translate(2, 2) scale(0.875)">
                  <path
                    d={template.d}
                    fill="none"
                    stroke="#484d54"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                  <path
                    d={template.d}
                    fill="none"
                    stroke={template.color}
                    strokeWidth="1.2"
                    strokeDasharray="1.5 2"
                    strokeLinecap="round"
                    className="opacity-90"
                  />
                </g>
              )}

              {/* If completed/unfolded, show the full card bright on both sides */}
              {unfolded && TemplateIcon && (
                <g className="opacity-100">
                  <TemplateIcon size="32" animClass="anim-breathe" />
                </g>
              )}
            </g>
          </svg>

          {/* Draw hidden path to help with checkpoint generation */}
          <svg width="0" height="0" className="absolute pointer-events-none">
            <path ref={svgPathRef} d={template.d} />
          </svg>

          {/* Active painting canvas */}
          <canvas
            ref={canvasRef}
            width={500}
            height={500}
            className="w-full h-full absolute inset-0 cursor-crosshair touch-none z-20"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
          />

          {/* Reset button */}
          {!unfolded && (
            <div className="absolute bottom-4 right-4 z-30">
              <ClayButton
                variant="surface"
                size="sm"
                onClick={handleClear}
                className="p-3 shadow-md bg-white/90"
              >
                Reset 🔄
              </ClayButton>
            </div>
          )}
        </div>

        {/* Palette Selector */}
        <div className="w-full max-w-md mx-auto mt-4 mb-2 shrink-0">
          <div className="flex items-center justify-between bg-white p-2.5 rounded-3xl border-2 border-white/60 shadow-clay-card">
            <span className="text-xs font-black text-[#4A5358] uppercase tracking-wide px-2">Paint:</span>
            <div className="flex gap-2">
              {colorsPalette.map(color => (
                <button
                  key={color}
                  onClick={() => {
                    playSynthesizedSound("click");
                    setSelectedColor(color);
                  }}
                  className="w-9 h-9 rounded-full border-2 border-white shadow-md active:scale-95 transition-all duration-150 relative"
                  style={{ backgroundColor: color }}
                >
                  {selectedColor === color && (
                    <span className="absolute inset-0 flex items-center justify-center text-xs">✨</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
