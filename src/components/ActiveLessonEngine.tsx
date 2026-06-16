"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { ArrowLeft, Check, Grid } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { alphabetData } from "@/lib/alphabetData";

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
  currentLetterIndex?: number;
  onSelectLetterIndex?: (index: number) => void;
}

export default function ActiveLessonEngine({ 
  childId, 
  letter, 
  pathString, 
  audioUrl, 
  onBack, 
  onNext,
  currentLetterIndex,
  onSelectLetterIndex
}: ActiveLessonEngineProps) {
  const [showAlphabetGrid, setShowAlphabetGrid] = useState(false);
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
    <div className="flex flex-col items-center w-full max-w-md sm:max-w-lg md:max-w-xl mx-auto relative px-4 py-2 justify-between min-h-[72vh] md:min-h-[78vh]">
      {/* Standardized Header */}
      <div className="flex justify-between items-center w-full mb-3 sm:mb-4 z-10 px-1">
        {onBack ? (
          <button 
            onClick={onBack} 
            className="bg-white squishy-press rounded-full w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center toddler-target border-2 border-slate-dark"
          >
            <ArrowLeft className="w-6 h-6 sm:w-7 sm:h-7" strokeWidth={3} />
          </button>
        ) : (
          <div className="w-12 h-12 sm:w-14 sm:h-14" />
        )}
        
        {/* Centered Target Letter Sticker */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 bg-white border-2 border-slate-dark rounded-xl px-3 py-1.5 sm:px-5 sm:py-2.5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rotate-[-1.5deg]">
          <span className="text-xs sm:text-base font-black text-slate-dark uppercase tracking-wide">Trace:</span>
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-[var(--lime-green)] border-2 border-slate-dark flex items-center justify-center font-black text-lg sm:text-xl text-slate-dark shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            {letter}
          </div>
        </div>

        <button 
          onClick={() => setShowAlphabetGrid(true)} 
          className="bg-white squishy-press rounded-full w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center toddler-target border-2 border-slate-dark"
        >
          <Grid className="w-6 h-6 sm:w-7 sm:h-7 text-primary" strokeWidth={3} />
        </button>
      </div>
      
      <div className="w-full max-w-[280px] sm:max-w-[360px] aspect-square card-3d overflow-hidden relative border-2 border-[var(--slate-dark)] shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] mx-auto">
        {/* Hidden SVG for path length calculations */}
        <svg width="0" height="0" className="absolute pointer-events-none">
          <path ref={svgPathRef} d={pathString} />
        </svg>

        <div 
          className="relative w-full h-full flex justify-center items-center bg-[var(--surface-container-lowest)]"
          style={{
            backgroundImage: "radial-gradient(rgba(113, 122, 104, 0.15) 1.5px, transparent 1.5px)",
            backgroundSize: "20px 20px"
          }}
        >
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
        className={`mt-3 sm:mt-6 w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center transition-all toddler-target border-2 border-slate-dark ${
          allCheckpointsHit 
            ? "bg-[var(--primary-container)] squishy-press animate-pulse-bounce text-slate-dark" 
            : "bg-gray-100 text-gray-400 cursor-not-allowed opacity-50"
        }`}
        disabled={!allCheckpointsHit}
      >
        <Check className="w-8 h-8 sm:w-10 sm:h-10" strokeWidth={4} />
      </button>

      <AnimatePresence>
        {showAlphabetGrid && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowAlphabetGrid(false)}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white border-2 border-slate-dark p-6 rounded-[2rem] max-w-sm w-full shadow-purple flex flex-col gap-4"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-black text-slate-dark text-center uppercase tracking-wide">Select Letter</h2>
              <div className="grid grid-cols-5 gap-2 max-h-[60vh] overflow-y-auto p-1">
                {alphabetData.map((data, index) => {
                  const isSelected = currentLetterIndex === index;
                  return (
                    <button
                      key={data.letter}
                      onClick={() => {
                        if (onSelectLetterIndex) onSelectLetterIndex(index);
                        setShowAlphabetGrid(false);
                      }}
                      className={`w-11 h-11 rounded-xl flex items-center justify-center text-lg font-black transition-all border-2 border-slate-dark ${
                        isSelected 
                          ? "bg-primary-container text-slate-dark shadow-[2px_2px_0px_0px_var(--slate-dark)] scale-105" 
                          : "bg-white text-slate-dark shadow-[1px_1px_0px_0px_var(--slate-dark)] hover:scale-105"
                      }`}
                    >
                      {data.letter}
                    </button>
                  );
                })}
              </div>
              <button 
                onClick={() => setShowAlphabetGrid(false)}
                className="w-full py-2.5 font-extrabold bg-gray-100 hover:bg-gray-200 rounded-full border-2 border-slate-dark text-xs uppercase"
              >
                Cancel
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
