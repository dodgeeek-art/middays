"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { ArrowLeft, Check } from "lucide-react";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";

interface Point {
  x: number;
  y: number;
}

interface ActiveLessonEngineProps {
  childId?: string;
  letter: string;
  pathString: string;
  audioUrl?: string;
  onBack?: () => void;
  onNext?: () => void;
}

export default function ActiveLessonEngine({ childId, letter, pathString, audioUrl, onBack, onNext }: ActiveLessonEngineProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [allCheckpointsHit, setAllCheckpointsHit] = useState(false);

  // Audio Context
  const audioCtxRef = useRef<AudioContext | null>(null);

  const path2D = useRef(new Path2D(pathString));
  const svgPathRef = useRef<SVGPathElement>(null);
  const checkpointsRef = useRef<{x: number, y: number, hit: boolean}[]>([]);
  const particles = useRef<{x: number, y: number, color: string, alpha: number, vx: number, vy: number}[]>([]);

  useEffect(() => {
    path2D.current = new Path2D(pathString);
    drawnPoints.current = [];
    setIsCompleted(false);
    setAllCheckpointsHit(false);
    particles.current = [];
    initAudio();
    
    // Give canvas a tiny bit of time to mount
    setTimeout(() => {
      drawBaseCanvas();
      
      // Generate checkpoints for foolproof completion
      if (svgPathRef.current) {
        const length = svgPathRef.current.getTotalLength();
        const pts = [];
        // Generate 20 checkpoints along the path
        for(let i = 0; i <= 20; i++) {
          const p = svgPathRef.current.getPointAtLength((i / 20) * length);
          pts.push({ x: p.x, y: p.y, hit: false });
        }
        checkpointsRef.current = pts;
      }
    }, 100);
  }, [letter, pathString]);

  // Animation frame loop for continuous particles and rendering
  useEffect(() => {
    let animFrameId: number;
    const tick = () => {
      drawBaseCanvas();
      animFrameId = requestAnimationFrame(tick);
    };
    animFrameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animFrameId);
  }, []);

  const isDrawing = useRef(false);
  const lastValidPoint = useRef<Point | null>(null);

  // Store an array of strokes, where each stroke is an array of Points
  const drawnPoints = useRef<Point[][]>([]);

  // Initialize Web Audio API
  const initAudio = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  };

  const playBoingSound = () => {
    if (!audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(200, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.3);
    
    gain.gain.setValueAtTime(0.6, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.3);
  };

  const playChimeSound = () => {
    if (!audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(500 + Math.random() * 200, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1000, ctx.currentTime + 0.15);
    
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.15);
  };

  const playSuccessSound = () => {
    if (!audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "square";
    osc.frequency.setValueAtTime(440, ctx.currentTime);
    osc.frequency.setValueAtTime(554.37, ctx.currentTime + 0.2); // C#
    osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.4); // E
    
    gain.gain.setValueAtTime(0.4, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.8);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.8);
  };

  const addParticles = (x: number, y: number, count = 3) => {
    const colors = ["#FF6B6B", "#4ECDC4", "#FFD93D", "#FFFFFF", "#118AB2"];
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

  const drawBaseCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw the dotted path as a guide
    ctx.lineWidth = 60; // Massive hit region visually represented
    ctx.strokeStyle = "rgba(78, 205, 196, 0.15)"; // Soft Teal with opacity
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke(path2D.current);

    // Draw a thinner dotted line inside
    ctx.lineWidth = 10;
    ctx.setLineDash([20, 20]);
    ctx.strokeStyle = "#4ECDC4";
    ctx.stroke(path2D.current);
    ctx.setLineDash([]); // Reset dash for drawing

    // Redraw user's valid path as separate strokes
    if (drawnPoints.current.length > 0) {
      ctx.lineWidth = 40; // Vibrant thick stroke
      ctx.strokeStyle = "#FF6B6B"; // Vibrant Coral/Red
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      drawnPoints.current.forEach(stroke => {
        if (stroke.length > 0) {
          ctx.beginPath();
          ctx.moveTo(stroke[0].x, stroke[0].y);
          for (let i = 1; i < stroke.length; i++) {
            ctx.lineTo(stroke[i].x, stroke[i].y);
          }
          ctx.stroke();
        }
      });
    }

    // Update and draw sparkles
    particles.current = particles.current.filter(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.alpha -= 0.03;
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

  const validatePoint = (ctx: CanvasRenderingContext2D, point: Point): boolean => {
    // Highly forgiving: allow free drawing anywhere on canvas
    return true;
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (isCompleted) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx) return;

    const pt = getCanvasCoordinates(e);

    if (validatePoint(ctx, pt)) {
      isDrawing.current = true;
      lastValidPoint.current = pt;
      drawnPoints.current.push([pt]);
      addParticles(pt.x, pt.y, 6);
      playChimeSound();
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing.current || isCompleted) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx) return;

    const pt = getCanvasCoordinates(e);

    if (validatePoint(ctx, pt)) {
      const currentStrokeIndex = drawnPoints.current.length - 1;
      if (currentStrokeIndex >= 0) {
        drawnPoints.current[currentStrokeIndex].push(pt);
      }
      lastValidPoint.current = pt;
      
      // Add particle trail
      addParticles(pt.x, pt.y, 2);

      // Hit detection for checkpoints
      let hitCount = 0;
      checkpointsRef.current.forEach(cp => {
        if (!cp.hit) {
          const dist = Math.hypot(pt.x - cp.x, pt.y - cp.y);
          if (dist < 85) { // Highly forgiving hitbox
            cp.hit = true;
          }
        }
        if (cp.hit) hitCount++;
      });

      if (hitCount === checkpointsRef.current.length) {
        setAllCheckpointsHit(true);
      }

      // Throttle chime sound slightly
      if (Math.random() > 0.82) playChimeSound();
    } else {
      isDrawing.current = false;
      playBoingSound();
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    isDrawing.current = false;
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  const handleCheck = () => {
    if (isCompleted) return;

    const allHit = checkpointsRef.current.every(cp => cp.hit);
    const hasDrawn = drawnPoints.current.length > 0 && drawnPoints.current[0].length > 0;

    if (allHit && hasDrawn) {
      completeLesson();
    } else {
      playBoingSound();
    }
  };

  const completeLesson = async () => {
    setIsCompleted(true);
    isDrawing.current = false;
    playSuccessSound();

    confetti({
      particleCount: 200,
      spread: 100,
      origin: { y: 0.5 },
      colors: ["#FF6B6B", "#4ECDC4", "#FFD93D", "#FFFFFF"]
    });

    if (childId) {
      try {
        await fetch(`/api/progress/${childId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            targetLetter: letter,
            tracingScore: 100,
            phonemicScore: 100,
            timeSpentMs: 5000,
          }),
        });
        
        await fetch(`/api/badges/${childId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ badgeName: `Letter ${letter}` }),
        });
      } catch (err) {
        console.error("Failed to save progress", err);
      }
    }
    
    setTimeout(() => {
      drawnPoints.current = [];
      setIsCompleted(false);
      setAllCheckpointsHit(false);
      if (onNext) onNext();
    }, 2500);
  };

  return (
    <div className="flex flex-col items-center w-full max-w-md sm:max-w-lg md:max-w-xl mx-auto relative px-4">
      {/* Standardized Header */}
      <div className="flex justify-between items-center w-full mb-8 z-10 px-1">
        {onBack ? (
          <button 
            onClick={onBack} 
            className="btn-white btn-squishy rounded-full w-14 h-14 flex items-center justify-center toddler-target border-2 border-slate-dark shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
          >
            <ArrowLeft size={28} strokeWidth={3} />
          </button>
        ) : (
          <div className="w-14 h-14" />
        )}
        
        {/* Centered Target Letter Sticker */}
        <div className="flex items-center gap-2.5 bg-white border-2 border-slate-dark rounded-full px-6 py-2.5 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
          <span className="text-base font-black text-slate-dark uppercase tracking-wide">Trace:</span>
          <div className="w-10 h-10 rounded-full bg-[var(--lime-green)] border-2 border-slate-dark flex items-center justify-center font-black text-xl text-slate-dark shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
            {letter}
          </div>
        </div>

        <div className="w-14 h-14 opacity-0 pointer-events-none" />
      </div>
      
      <div className="w-full aspect-square card-3d overflow-hidden relative border-2 border-[var(--slate-dark)] shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
        {/* Hidden SVG for path length calculations */}
        <svg width="0" height="0" className="absolute pointer-events-none">
          <path ref={svgPathRef} d={pathString} />
        </svg>

        <div className="relative w-full h-full flex justify-center items-center">
          <canvas
            ref={canvasRef}
            width={500}
            height={500}
            className="w-full h-full cursor-crosshair touch-none"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            style={{ touchAction: "none" }}
          />
        </div>
      </div>

      <button 
        onClick={handleCheck}
        className={`mt-8 w-24 h-24 rounded-full flex items-center justify-center btn-squishy shadow-md transition-all toddler-target ${allCheckpointsHit ? "btn-green animate-pulse-bounce" : "bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed opacity-50"}`}
        style={{
          boxShadow: allCheckpointsHit ? "0 6px 0 0 var(--slate-dark)" : "none",
          transform: allCheckpointsHit ? "translateY(-3px)" : "none"
        }}
        disabled={!allCheckpointsHit}
      >
        <Check size={48} strokeWidth={4} />
      </button>
    </div>
  );
}
