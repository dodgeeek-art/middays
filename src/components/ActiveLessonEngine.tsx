"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { ArrowLeft, Check, Grid } from "@/components/Icons";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import ClayButton from "@/components/ui/ClayButton";
import ClayCard from "@/components/ui/ClayCard";
import { alphabetData } from "@/lib/alphabetData";
import { objectDictionary } from "@/lib/svgDictionary";

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
  onBack, 
  onNext,
  currentLetterIndex,
  onSelectLetterIndex
}: ActiveLessonEngineProps) {
  const [showAlphabetGrid, setShowAlphabetGrid] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [allCheckpointsHit, setAllCheckpointsHit] = useState(false);
  const [prevLetter, setPrevLetter] = useState(letter);

  if (letter !== prevLetter) {
    setPrevLetter(letter);
    setIsCompleted(false);
    setAllCheckpointsHit(false);
  }

  // Audio Context
  const audioCtxRef = useRef<AudioContext | null>(null);

  const path2D = useRef(new Path2D(pathString));
  const svgPathRef = useRef<SVGPathElement>(null);
  const checkpointsRef = useRef<{x: number, y: number, hit: boolean}[]>([]);
  const particles = useRef<{x: number, y: number, color: string, alpha: number, vx: number, vy: number}[]>([]);

  // useEffect blocks relocated below drawBaseCanvas to satisfy hook declaration order rules

  const isDrawing = useRef(false);
  const lastValidPoint = useRef<Point | null>(null);

  // Store an array of strokes, where each stroke is an array of Points
  const drawnPoints = useRef<Point[][]>([]);

  // Initialize Web Audio API
  const initAudio = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext)();
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
    const colors = ["#a2ea63", "#ffc4c0", "#eaddfc", "#5fa3d9", "#faf9f5"];
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
    ctx.strokeStyle = "rgba(95, 163, 217, 0.15)"; // Soft themed blue guide overlay
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke(path2D.current);

    // Draw a thinner dotted line inside
    ctx.lineWidth = 10;
    ctx.setLineDash([20, 20]);
    ctx.strokeStyle = "rgba(78, 205, 196, 0.4)"; // Soft translucent secondary mint green
    ctx.stroke(path2D.current);
    ctx.setLineDash([]); // Reset dash for drawing

    // Redraw user's valid path as separate strokes
    if (drawnPoints.current.length > 0) {
      ctx.lineWidth = 40; // Vibrant thick stroke
      ctx.strokeStyle = "#ff85a1"; // Bubblegum pink drawing stroke
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

  useEffect(() => {
    path2D.current = new Path2D(pathString);
    drawnPoints.current = [];
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
  }, [letter, pathString, drawBaseCanvas]);

  // Animation frame loop for continuous particles and rendering
  useEffect(() => {
    let animFrameId: number;
    const tick = () => {
      drawBaseCanvas();
      animFrameId = requestAnimationFrame(tick);
    };
    animFrameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animFrameId);
  }, [drawBaseCanvas]);

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

  const validatePoint = (): boolean => {
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

    if (validatePoint()) {
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

    if (validatePoint()) {
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

    // Speak letter association reward (e.g. "A is for Alligator")
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const obj = objectDictionary[letter];
      const word = obj ? obj.name : "";
      const utterance = new SpeechSynthesisUtterance(`${letter} is for ${word}`);
      utterance.rate = 0.85;
      utterance.pitch = 1.15;
      window.speechSynthesis.speak(utterance);
    }

    confetti({
      particleCount: 200,
      spread: 100,
      origin: { y: 0.5 },
      colors: ["#a2ea63", "#ffc4c0", "#eaddfc", "#faf9f5"]
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
    <div className="flex flex-col items-center w-full max-w-md sm:max-w-lg md:max-w-xl mx-auto relative px-4 py-2 justify-between h-full min-h-0">
      {/* Standardized Header */}
      <div className="flex justify-between items-center w-full mb-3 sm:mb-4 z-10 px-1">
        {onBack ? (
          <ClayButton 
            onClick={onBack} 
            variant="surface"
            size="icon"
            className="w-12 h-12 sm:w-14 sm:h-14 shrink-0"
          >
            <ArrowLeft className="w-6 h-6 sm:w-7 sm:h-7 text-[#4A5358]" strokeWidth={3} />
          </ClayButton>
        ) : (
          <div className="w-12 h-12 sm:w-14 sm:h-14" />
        )}
        
        {/* Centered Target Letter Sticker */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 bg-white border border-white/20 rounded-2xl px-3 py-1.5 sm:px-5 sm:py-2.5 shadow-[4px_4px_10px_rgba(0,0,0,0.04),_inset_2px_2px_4px_rgba(255,255,255,0.8),_inset_-2px_-2px_4px_rgba(0,0,0,0.05)] rotate-[-1.5deg]">
          <span className="text-xs sm:text-base font-black text-[#4A5358] uppercase tracking-wide">Trace:</span>
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-primary-container border border-white/20 flex items-center justify-center font-black text-lg sm:text-xl text-[#590d22] shadow-[2px_2px_5px_rgba(0,0,0,0.04),_inset_2px_2px_4px_rgba(255,255,255,0.8)]">
            {letter}
          </div>
        </div>

        <ClayButton 
          onClick={() => setShowAlphabetGrid(true)} 
          variant="surface"
          size="icon"
          className="w-12 h-12 sm:w-14 sm:h-14 shrink-0"
        >
          <Grid className="w-6 h-6 sm:w-7 sm:h-7 text-primary" strokeWidth={3} />
        </ClayButton>
      </div>
      
      <ClayCard hoverEffect={false} className="w-full max-w-[280px] sm:max-w-[360px] aspect-square overflow-hidden relative mx-auto border-white/20 p-0">
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
      </ClayCard>

      <ClayButton 
        onClick={handleCheck}
        variant={allCheckpointsHit ? "primary" : "surface"}
        size="icon"
        isDisabled={!allCheckpointsHit}
        className={`mt-3 sm:mt-6 w-16 h-16 sm:w-20 sm:h-20 shrink-0 ${
          allCheckpointsHit ? "animate-pulse-bounce" : ""
        }`}
      >
        <Check className="w-8 h-8 sm:w-10 sm:h-10 text-white" strokeWidth={4} />
      </ClayButton>

      <AnimatePresence>
        {isCompleted && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#f3f8fc]/90 backdrop-blur-sm z-[60] flex flex-col items-center justify-center p-6"
          >
            <ClayCard 
              initial={{ y: 30, scale: 0.8 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: 20, scale: 0.8 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              variant="default"
              className="p-8 max-w-sm w-full text-center flex flex-col items-center gap-6 border-white/20"
            >
              {objectDictionary[letter] && (
                <>
                  <div className="w-32 h-32 sm:w-40 sm:h-40 bg-white border border-white/25 rounded-[2rem] flex items-center justify-center shadow-[6px_6px_12px_rgba(0,0,0,0.04),_inset_2px_2px_4px_rgba(255,255,255,0.85)] p-4">
                    {React.createElement(objectDictionary[letter].icon, { size: "100%" })}
                  </div>
                  <div className="flex flex-col gap-2">
                    <h3 className="text-3xl font-black text-[#ff85a1] uppercase">Awesome Tracing!</h3>
                    <span className="text-xl sm:text-2xl font-black text-[#4A5358] uppercase tracking-wider">
                      {letter} is for {objectDictionary[letter].name}
                    </span>
                  </div>
                </>
              )}
            </ClayCard>
          </motion.div>
        )}
        {showAlphabetGrid && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowAlphabetGrid(false)}
          >
            <ClayCard 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              variant="default"
              className="p-6 rounded-[2.5rem] border-white/20 max-w-sm w-full flex flex-col gap-4"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-black text-[#4A5358] text-center uppercase tracking-wide">Select Letter</h2>
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
                      className={`w-11 h-11 rounded-2xl flex items-center justify-center text-lg font-black transition-all border border-white/20 ${
                        isSelected 
                          ? "bg-primary-container text-[#590d22] shadow-[4px_4px_8px_rgba(0,0,0,0.04),_inset_2px_2px_4px_rgba(255,255,255,0.8),_inset_-2px_-2px_4px_rgba(0,0,0,0.05)] scale-105" 
                          : "bg-white text-[#4A5358] shadow-[2px_2px_5px_rgba(0,0,0,0.03),_inset_2px_2px_4px_rgba(255,255,255,0.95)] hover:scale-105"
                      }`}
                    >
                      {data.letter}
                    </button>
                  );
                })}
              </div>
              <ClayButton 
                onClick={() => setShowAlphabetGrid(false)}
                variant="surface"
                className="w-full text-xs uppercase"
              >
                Cancel
              </ClayButton>
            </ClayCard>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
