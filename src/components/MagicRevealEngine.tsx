import React, { useRef, useState, useEffect } from "react";
import confetti from "canvas-confetti";
import { ArrowLeft, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { objectDictionary } from "../lib/svgDictionary";

interface Point {
  x: number;
  y: number;
}

interface MagicRevealEngineProps {
  childId?: string;
  onBack?: () => void;
}

export default function MagicRevealEngine({ childId, onBack }: MagicRevealEngineProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<"erasing" | "choosing" | "success">("erasing");
  const [targetLetter, setTargetLetter] = useState("A");
  const [choices, setChoices] = useState<any[]>([]);
  const [startTime, setStartTime] = useState<number>(0);
  
  const isErasing = useRef(false);
  const lastPoint = useRef<Point | null>(null);
  const eraseCount = useRef(0);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscRef = useRef<OscillatorNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);

  const initAudio = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioCtxRef.current.state === "suspended") {
      audioCtxRef.current.resume();
    }
  };

  const startErasingSound = () => {
    if (!audioCtxRef.current) return;
    if (oscRef.current) return; // already playing
    
    oscRef.current = audioCtxRef.current.createOscillator();
    gainRef.current = audioCtxRef.current.createGain();
    
    oscRef.current.type = "sawtooth";
    oscRef.current.frequency.setValueAtTime(80, audioCtxRef.current.currentTime);
    
    gainRef.current.gain.setValueAtTime(0.02, audioCtxRef.current.currentTime);
    
    oscRef.current.connect(gainRef.current);
    gainRef.current.connect(audioCtxRef.current.destination);
    
    oscRef.current.start();
  };

  const stopErasingSound = () => {
    if (oscRef.current && gainRef.current && audioCtxRef.current) {
      gainRef.current.gain.exponentialRampToValueAtTime(0.001, audioCtxRef.current.currentTime + 0.1);
      oscRef.current.stop(audioCtxRef.current.currentTime + 0.1);
      oscRef.current = null;
      gainRef.current = null;
    }
  };

  const drawFrostLayer = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.globalCompositeOperation = "source-over"; // Default
    
    // Beautiful diagonal pastel gradient
    const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    grad.addColorStop(0, "#c9f0df"); // Pastel frost mint
    grad.addColorStop(0.5, "#e5ddf8"); // Pastel frost lavender
    grad.addColorStop(1, "#ffd8d6"); // Pastel frost peach
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add sparkling highlight bubbles
    ctx.fillStyle = "rgba(255,255,255,0.45)";
    for (let i = 0; i < 15; i++) {
       ctx.beginPath();
       ctx.arc(Math.random() * canvas.width, Math.random() * canvas.height, Math.random() * 40 + 20, 0, Math.PI * 2);
       ctx.fill();
    }
    
    // Draw cute sparkle cross shapes
    ctx.strokeStyle = "rgba(255,255,255,0.7)";
    ctx.lineWidth = 4;
    for (let i = 0; i < 12; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      const size = Math.random() * 12 + 8;
      ctx.beginPath();
      ctx.moveTo(x - size, y);
      ctx.lineTo(x + size, y);
      ctx.moveTo(x, y - size);
      ctx.lineTo(x, y + size);
      ctx.stroke();
    }
  };

  const startNewRound = () => {
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const newLetter = letters[Math.floor(Math.random() * letters.length)];
    setTargetLetter(newLetter);
    setGameState("erasing");
    eraseCount.current = 0;
    setStartTime(Date.now());
  };

  useEffect(() => {
    startNewRound();
  }, []);

  useEffect(() => {
    if (gameState === "erasing") {
      drawFrostLayer();
    }
  }, [gameState]);

  const getCanvasCoordinates = (e: React.PointerEvent<HTMLCanvasElement>): Point | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (gameState !== "erasing") return;
    e.currentTarget.setPointerCapture(e.pointerId);
    initAudio();
    const pt = getCanvasCoordinates(e);
    if (!pt) return;

    isErasing.current = true;
    lastPoint.current = pt;
    startErasingSound();
    eraseAt(pt);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isErasing.current || gameState !== "erasing") return;
    const pt = getCanvasCoordinates(e);
    if (!pt || !lastPoint.current) return;

    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;

    ctx.globalCompositeOperation = "destination-out"; // Erase mode!
    ctx.lineWidth = 70; // Massive eraser size for toddler motor skills
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    
    ctx.beginPath();
    ctx.moveTo(lastPoint.current.x, lastPoint.current.y);
    ctx.lineTo(pt.x, pt.y);
    ctx.stroke();

    lastPoint.current = pt;
    eraseCount.current++;

    // Complete reveal after enough wiping
    if (eraseCount.current > 120 && gameState === "erasing") {
      completeGame();
    }
  };

  const eraseAt = (pt: Point) => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.arc(pt.x, pt.y, 35, 0, Math.PI * 2);
    ctx.fill();
    eraseCount.current++;
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (isErasing.current) {
      isErasing.current = false;
      stopErasingSound();
      e.currentTarget.releasePointerCapture(e.pointerId);
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

  const completeGame = () => {
    setGameState("choosing");
    isErasing.current = false;
    stopErasingSound();
    
    // Clear the remaining frost to fully show the hidden letter
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.globalCompositeOperation = "destination-out";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    }

    if (audioCtxRef.current) {
      const osc = audioCtxRef.current.createOscillator();
      const gain = audioCtxRef.current.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(659.25, audioCtxRef.current.currentTime);
      gain.gain.setValueAtTime(0.2, audioCtxRef.current.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtxRef.current.currentTime + 0.8);
      osc.connect(gain);
      gain.connect(audioCtxRef.current.destination);
      osc.start();
      osc.stop(audioCtxRef.current.currentTime + 0.8);
    }

    const correctChoice = objectDictionary[targetLetter];
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".replace(targetLetter, "");
    const wrongLetter = letters[Math.floor(Math.random() * letters.length)];
    const wrongChoice = objectDictionary[wrongLetter];

    const shuffledChoices = Math.random() > 0.5 ? [
      { ...correctChoice, letter: targetLetter },
      { ...wrongChoice, letter: wrongLetter }
    ] : [
      { ...wrongChoice, letter: wrongLetter },
      { ...correctChoice, letter: targetLetter }
    ];
    setChoices(shuffledChoices);
  };

  const handleChoice = async (selectedLetter: string) => {
    if (selectedLetter === targetLetter) {
      setGameState("success");
      
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
        colors: ["#A8E6CF", "#FF6B6B", "#FFD93D"]
      });

      if (audioCtxRef.current) {
        const osc = audioCtxRef.current.createOscillator();
        const gain = audioCtxRef.current.createGain();
        osc.type = "square";
        osc.frequency.setValueAtTime(440, audioCtxRef.current.currentTime);
        osc.frequency.setValueAtTime(554.37, audioCtxRef.current.currentTime + 0.2);
        osc.frequency.setValueAtTime(659.25, audioCtxRef.current.currentTime + 0.4);
        gain.gain.setValueAtTime(0.4, audioCtxRef.current.currentTime);
        gain.gain.linearRampToValueAtTime(0, audioCtxRef.current.currentTime + 0.8);
        osc.connect(gain);
        gain.connect(audioCtxRef.current.destination);
        osc.start();
        osc.stop(audioCtxRef.current.currentTime + 0.8);
      }

      const elapsed = Date.now() - startTime;
      if (childId) {
        try {
          await fetch(`/api/progress/${childId}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              targetLetter,
              tracingScore: 100,
              phonemicScore: 100,
              timeSpentMs: elapsed,
            }),
          });
          
          await fetch(`/api/badges/${childId}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ badgeName: `Reveal Master ${targetLetter}` }),
          });
        } catch (err) {
          console.error("Telemetry failed to save in MagicRevealEngine:", err);
        }
      }

      setTimeout(() => {
        startNewRound();
      }, 3500);
    } else {
      playBoingSound();
    }
  };

  return (
    <div className="flex flex-col items-center w-full max-w-md sm:max-w-lg md:max-w-xl mx-auto px-4 py-2 justify-between min-h-[72vh] md:min-h-[78vh]">
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
        <div className="flex items-center gap-1.5 sm:gap-2.5 bg-white border-2 border-slate-dark rounded-full px-3 py-1.5 sm:px-6 sm:py-2.5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <span className="text-xs sm:text-base font-black text-slate-dark uppercase tracking-wide">Reveal:</span>
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[var(--light-purple)] border-2 border-slate-dark flex items-center justify-center font-black text-lg sm:text-xl text-slate-dark shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            {targetLetter}
          </div>
        </div>

        <button 
          onClick={startNewRound} 
          className="bg-[var(--tertiary-container)] text-[var(--on-tertiary-container)] squishy-press rounded-full w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center toddler-target border-2 border-slate-dark"
        >
          <RefreshCw className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={3} />
        </button>
      </div>
      
      <div className="flex flex-col items-center w-full gap-4 sm:gap-6">
        <div className="relative w-full max-w-[280px] sm:max-w-[360px] aspect-square card-3d overflow-hidden border-2 border-[var(--slate-dark)] shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] mx-auto">
          {/* Hidden Letter Background */}
          <div className="absolute inset-0 flex items-center justify-center bg-[var(--surface-container-lowest)] select-none">
            <span className="text-[130px] sm:text-[180px] font-black leading-none select-none drop-shadow-[4px_4px_0px_var(--slate-dark)]" style={{ color: "var(--lime-green)" }}>
              {targetLetter}
            </span>
          </div>

          {/* The Frost Canvas */}
          <canvas
            ref={canvasRef}
            width={500}
            height={500}
            className={`absolute inset-0 w-full h-full cursor-crosshair touch-none ${gameState === "choosing" || gameState === "success" ? "pointer-events-none" : ""}`}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            style={{ touchAction: "none" }}
          />
        </div>

        <AnimatePresence>
          {(gameState === "choosing" || gameState === "success") && (
            <motion.div 
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="grid grid-cols-2 gap-4 w-full"
            >
              {choices.map((choice, i) => {
                const Icon = choice.icon;
                const isCorrect = gameState === "success" && choice.letter === targetLetter;
                const wavyClass = i % 2 === 0 ? "card-wavy-1" : "card-wavy-2";
                
                return (
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97, y: 4 }}
                    key={i}
                    onClick={() => handleChoice(choice.letter)}
                    className={`card-organic ${wavyClass} relative p-2.5 sm:p-5 flex flex-col items-center justify-center border-2 border-[var(--slate-dark)] h-24 sm:h-36 w-full`}
                    style={{
                      backgroundColor: isCorrect ? "var(--lime-green)" : "white",
                      boxShadow: "4px 4px 0px 0px var(--slate-dark)"
                    }}
                  >
                    {/* Playful letter association badge */}
                    <div className="absolute top-2 left-2 sm:top-3 sm:left-3 w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-[var(--light-purple)] border border-[var(--slate-dark)] flex items-center justify-center shadow-sm">
                      <span className="text-xs sm:text-lg font-black text-[var(--slate-dark)]">{choice.letter}</span>
                    </div>

                    <div className="flex items-center justify-center w-full h-full max-h-[70%] mt-2">
                      <Icon className="w-12 h-12 sm:w-20 sm:h-20" />
                    </div>
                  </motion.button>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
