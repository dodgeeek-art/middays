"use client";

import React, { useState, useEffect, useCallback } from "react";
import { ArrowLeft, Volume2, Smile } from "@/components/Icons";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import ClayButton from "@/components/ui/ClayButton";
import { vocabularyList } from "@/lib/svgDictionary";

interface Point {
  x: number;
  y: number;
}

interface CellState {
  type: "straight" | "curved" | "cross";
  rotation: number; // 0, 90, 180, 270
}

type AnimalName =
  | "Pig"
  | "Alligator"
  | "Bear"
  | "Rabbit"
  | "Whale"
  | "Fox"
  | "Frog"
  | "Turtle"
  | "Penguin";

interface GoalOption {
  label: string;
  color: string;
  animal: AnimalName;
}

interface MazeLevel {
  id: number;
  goals: [GoalOption, GoalOption, GoalOption];
  targetCol: 0 | 1 | 2;
  grid: CellState[][];
}

function FluentAnimalIcon({
  name,
  size = "100%",
  animClass,
  style,
}: {
  name: AnimalName;
  size?: string | number;
  animClass?: string;
  style?: React.CSSProperties;
}) {
  const icon = vocabularyList.find(v => v.name === name)?.icon || Smile;
  return React.createElement(icon, { size, animClass, style });
}

const levels: MazeLevel[] = [
  {
    id: 1,
    goals: [
      { label: "Pink", color: "#ff2a5f", animal: "Pig" },
      { label: "Green", color: "#00d26a", animal: "Alligator" },
      { label: "Brown", color: "#b25329", animal: "Bear" },
    ],
    targetCol: 0,
    grid: [
      [
        { type: "curved", rotation: 90 },    // Needs rotation 0
        { type: "curved", rotation: 270 },   // Needs rotation 180
        { type: "straight", rotation: 0 }
      ],
      [
        { type: "straight", rotation: 0 },    // Needs rotation 90 (vertical)
        { type: "curved", rotation: 0 },
        { type: "straight", rotation: 90 }
      ],
      [
        { type: "straight", rotation: 0 },    // Needs rotation 90 (vertical)
        { type: "curved", rotation: 180 },
        { type: "cross", rotation: 0 }
      ]
    ]
  },
  {
    id: 2,
    goals: [
      { label: "Orange", color: "#ff7a1a", animal: "Fox" },
      { label: "Blue", color: "#1f9bd7", animal: "Whale" },
      { label: "Brown", color: "#b25329", animal: "Bear" },
    ],
    targetCol: 2,
    grid: [
      [
        { type: "straight", rotation: 90 },
        { type: "curved", rotation: 90 },    // Needs rotation 270
        { type: "curved", rotation: 270 }    // Needs rotation 90
      ],
      [
        { type: "curved", rotation: 180 },
        { type: "curved", rotation: 0 },
        { type: "straight", rotation: 0 }     // Needs rotation 90 (vertical)
      ],
      [
        { type: "cross", rotation: 90 },
        { type: "straight", rotation: 90 },
        { type: "straight", rotation: 0 }     // Needs rotation 90 (vertical)
      ]
    ]
  },
  {
    id: 3,
    goals: [
      { label: "Yellow", color: "#f7c948", animal: "Rabbit" },
      { label: "Green", color: "#00d26a", animal: "Alligator" },
      { label: "Purple", color: "#9b6ce3", animal: "Penguin" },
    ],
    targetCol: 1,
    grid: [
      [
        { type: "curved", rotation: 0 },
        { type: "straight", rotation: 0 },    // Needs rotation 90 (vertical)
        { type: "curved", rotation: 90 }
      ],
      [
        { type: "curved", rotation: 90 },     // Needs rotation 0
        { type: "curved", rotation: 90 },     // Needs rotation 180
        { type: "straight", rotation: 90 }
      ],
      [
        { type: "curved", rotation: 180 },    // Needs rotation 270
        { type: "curved", rotation: 0 },      // Needs rotation 90
        { type: "cross", rotation: 180 }
      ]
    ]
  },
  {
    id: 4,
    goals: [
      { label: "Teal", color: "#18b8a6", animal: "Turtle" },
      { label: "Pink", color: "#ff2a5f", animal: "Pig" },
      { label: "Blue", color: "#1f9bd7", animal: "Whale" },
    ],
    targetCol: 0,
    grid: [
      [
        { type: "curved", rotation: 180 },
        { type: "straight", rotation: 0 },
        { type: "curved", rotation: 90 }
      ],
      [
        { type: "straight", rotation: 0 },
        { type: "cross", rotation: 90 },
        { type: "curved", rotation: 180 }
      ],
      [
        { type: "straight", rotation: 90 },
        { type: "curved", rotation: 0 },
        { type: "straight", rotation: 0 }
      ]
    ]
  },
  {
    id: 5,
    goals: [
      { label: "Red", color: "#f43f5e", animal: "Fox" },
      { label: "Lime", color: "#84cc16", animal: "Frog" },
      { label: "Purple", color: "#9b6ce3", animal: "Penguin" },
    ],
    targetCol: 2,
    grid: [
      [
        { type: "straight", rotation: 0 },
        { type: "curved", rotation: 0 },
        { type: "straight", rotation: 90 }
      ],
      [
        { type: "curved", rotation: 90 },
        { type: "curved", rotation: 180 },
        { type: "straight", rotation: 0 }
      ],
      [
        { type: "straight", rotation: 90 },
        { type: "cross", rotation: 0 },
        { type: "curved", rotation: 270 }
      ]
    ]
  },
  {
    id: 6,
    goals: [
      { label: "Orange", color: "#ff7a1a", animal: "Fox" },
      { label: "Aqua", color: "#06b6d4", animal: "Whale" },
      { label: "Green", color: "#00d26a", animal: "Turtle" },
    ],
    targetCol: 1,
    grid: [
      [
        { type: "curved", rotation: 90 },
        { type: "straight", rotation: 0 },
        { type: "curved", rotation: 270 }
      ],
      [
        { type: "straight", rotation: 90 },
        { type: "curved", rotation: 90 },
        { type: "straight", rotation: 0 }
      ],
      [
        { type: "curved", rotation: 180 },
        { type: "straight", rotation: 90 },
        { type: "cross", rotation: 0 }
      ]
    ]
  },
];

export default function MazeRouterEngine({ childId, onBack }: { childId: string; onBack: () => void }) {
  const [levelIdx, setLevelIdx] = useState(0);
  const [grid, setGrid] = useState<CellState[][]>(() => levels[0].grid.map(row => row.map(cell => ({ ...cell }))));
  const [isRolling, setIsRolling] = useState(false);
  const [marblePos, setMarblePos] = useState<Point>({ x: 150, y: -40 });
  const [highlightedCell, setHighlightedCell] = useState<{ r: number; c: number } | null>(null);
  const [startTime] = useState<number>(() => Date.now());

  const activeLevel = levels[levelIdx];
  const goalItems = activeLevel.goals;
  const targetGoal = goalItems[activeLevel.targetCol];
  const instructionText = `Connect the pipes to the ${targetGoal.label} goal for the ${targetGoal.animal}.`;

  const speakText = useCallback((text: string) => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.85;
      utterance.pitch = 1.25;
      utterance.volume = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  }, []);

  const playSynthesizedSound = (type: "correct" | "click" | "roll" | "fail" | "win") => {
    if (typeof window === "undefined") return;
    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      const now = ctx.currentTime;

      if (type === "win") {
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
        osc.frequency.setValueAtTime(580, now);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(now + 0.05);
      } else if (type === "roll") {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(180, now);
        osc.frequency.linearRampToValueAtTime(260, now + 0.6);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.6);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(now + 0.6);
      } else if (type === "fail") {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.linearRampToValueAtTime(90, now + 0.4);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(now + 0.4);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Initialize level grid state
  useEffect(() => {
    speakText(instructionText);
  }, [levelIdx, instructionText, speakText]);

  const resetLevelState = useCallback((level: MazeLevel) => {
    const gridCopy = level.grid.map(row => row.map(cell => ({ ...cell })));
    setGrid(gridCopy);
    setIsRolling(false);
    setMarblePos({ x: 150, y: -40 });
    setHighlightedCell(null);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => resetLevelState(activeLevel), 0);
    return () => window.clearTimeout(timer);
  }, [activeLevel, resetLevelState]);

  // Handle cell rotation tap
  const handleCellTap = (r: number, c: number) => {
    if (isRolling) return;
    playSynthesizedSound("click");
    setGrid(prevGrid => {
      const newGrid = prevGrid.map(row => row.map(cell => ({ ...cell })));
      newGrid[r][c].rotation = newGrid[r][c].rotation + 90;
      return newGrid;
    });
  };

  const getSidePoint = (side: "top" | "bottom" | "left" | "right"): Point => {
    switch (side) {
      case "top": return { x: 50, y: 0 };
      case "bottom": return { x: 50, y: 100 };
      case "left": return { x: 0, y: 50 };
      case "right": return { x: 100, y: 50 };
    }
  };

  const getBezierPoints = (p0: Point, p1: Point, p2: Point) => {
    const pts: Point[] = [];
    for (let i = 0; i <= 8; i++) {
      const t = i / 8;
      const mt = 1 - t;
      const x = mt * mt * p0.x + 2 * mt * t * p1.x + t * t * p2.x;
      const y = mt * mt * p0.y + 2 * mt * t * p1.y + t * t * p2.y;
      pts.push({ x, y });
    }
    return pts;
  };

  const getConnectedSides = (type: "straight" | "curved" | "cross", rotation: number): ("top" | "bottom" | "left" | "right")[] => {
    const normRot = (rotation % 360 + 360) % 360;
    if (type === "cross") {
      return ["top", "bottom", "left", "right"];
    }
    if (type === "straight") {
      if (normRot === 0 || normRot === 180) {
        return ["left", "right"];
      } else {
        return ["top", "bottom"];
      }
    }
    // Curved (bottom-to-right default orientation rotation 0)
    if (normRot === 0) return ["bottom", "right"];
    if (normRot === 90) return ["left", "bottom"];
    if (normRot === 180) return ["top", "left"];
    return ["right", "top"];
  };

  const tracePath = (currentGrid: CellState[][]) => {
    const pathPoints: Point[] = [];
    const startCol = 1; // Middle dispenser entrance
    const cellSize = 100;
    const startX = startCol * cellSize + cellSize / 2;

    pathPoints.push({ x: startX, y: -40 });
    pathPoints.push({ x: startX, y: 0 });

    let r = 0;
    let c = startCol;
    let entrySide: "top" | "bottom" | "left" | "right" = "top";
    let success = false;
    let finalCell = { r: 0, c: startCol };

    while (r >= 0 && r < 3 && c >= 0 && c < 3) {
      finalCell = { r, c };
      const cell = currentGrid[r][c];
      const connections = getConnectedSides(cell.type, cell.rotation);

      if (!connections.includes(entrySide)) {
        // Dead end: path finishes in the center of the blocked card
        const centerX = c * cellSize + cellSize / 2;
        const centerY = r * cellSize + cellSize / 2;
        pathPoints.push({ x: centerX, y: centerY });
        break;
      }

      let exitSide: "top" | "bottom" | "left" | "right";
      if (cell.type === "cross") {
        if (entrySide === "top") exitSide = "bottom";
        else if (entrySide === "bottom") exitSide = "top";
        else if (entrySide === "left") exitSide = "right";
        else exitSide = "left";
      } else {
        exitSide = connections.find(s => s !== entrySide)!;
      }

      const entryPt = getSidePoint(entrySide);
      const exitPt = getSidePoint(exitSide);
      let localPts: Point[] = [];

      if (
        (entrySide === "top" && exitSide === "bottom") ||
        (entrySide === "bottom" && exitSide === "top") ||
        (entrySide === "left" && exitSide === "right") ||
        (entrySide === "right" && exitSide === "left")
      ) {
        localPts = [entryPt, { x: 50, y: 50 }, exitPt];
      } else {
        localPts = getBezierPoints(entryPt, { x: 50, y: 50 }, exitPt);
      }

      localPts.forEach(pt => {
        pathPoints.push({
          x: c * cellSize + pt.x,
          y: r * cellSize + pt.y
        });
      });

      if (exitSide === "top") {
        r = r - 1;
        entrySide = "bottom";
      } else if (exitSide === "bottom") {
        r = r + 1;
        entrySide = "top";
      } else if (exitSide === "left") {
        c = c - 1;
        entrySide = "right";
      } else {
        c = c + 1;
        entrySide = "left";
      }
    }

    if (r === 3 && entrySide === "top" && c === activeLevel.targetCol) {
      // Exited through target bottom basket successfully
      const exitX = c * cellSize + cellSize / 2;
      pathPoints.push({ x: exitX, y: 3 * cellSize + 20 });
      pathPoints.push({ x: exitX, y: 3 * cellSize + 60 });
      success = true;
    } else if (r === 3 && entrySide === "top") {
      // Exited through bottom but wrong column/basket
      const exitX = c * cellSize + cellSize / 2;
      pathPoints.push({ x: exitX, y: 3 * cellSize + 20 });
      pathPoints.push({ x: exitX, y: 3 * cellSize + 40 });
      success = false;
    }

    return { success, path: pathPoints, finalCell };
  };

  const handleRoll = () => {
    if (isRolling) return;
    playSynthesizedSound("roll");
    setIsRolling(true);

    const { success, path, finalCell } = tracePath(grid);

    // Animate marble point by point
    let stepIdx = 0;
    const intervalTime = 60; // ms per step

    const moveNext = () => {
      if (stepIdx < path.length) {
        setMarblePos(path[stepIdx]);
        stepIdx++;
        setTimeout(moveNext, intervalTime);
      } else {
        // Roll finished
        if (success) {
          playSynthesizedSound("win");
          confetti({
            particleCount: 80,
            spread: 60,
            origin: { y: 0.8 }
          });

          // Send analytics telemetry
          const timeSpent = Date.now() - startTime;
          fetch(`/api/progress/${childId}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              targetLetter: "Maze",
              tracingScore: 100,
              phonemicScore: 100,
              timeSpentMs: timeSpent
            })
          }).catch(err => console.error("Telemetry error:", err));

          setTimeout(() => {
            if (levelIdx < levels.length - 1) {
              setLevelIdx(prev => prev + 1);
            } else {
              speakText("Wonderful job! You completed all the maze puzzles!");
              onBack();
            }
          }, 2500);
        } else {
          playSynthesizedSound("fail");
          setHighlightedCell(finalCell);
          // Shake effect triggers reset
          setTimeout(() => {
            setHighlightedCell(null);
            setIsRolling(false);
            setMarblePos({ x: 150, y: -40 });
          }, 1500);
        }
      }
    };

    moveNext();
  };

  return (
    <div className="relative flex flex-col items-center justify-start w-full h-full min-h-0 bg-gradient-to-b from-[#f3f8f6] to-[#e6edea] overflow-y-auto overflow-x-hidden p-2 sm:overflow-hidden sm:p-4 select-none">
      
      {/* Grid Table Pattern decor background */}
      <div 
        className="absolute inset-0 opacity-[0.06] pointer-events-none" 
        style={{
          backgroundImage: "linear-gradient(rgba(0, 0, 0, 0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 0, 0, 0.15) 1px, transparent 1px)",
          backgroundSize: "28px 28px"
        }}
      />

      {/* Global SVG Gradients for Pipes */}
      <svg className="hidden">
        <defs>
          <linearGradient id="pipeGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#64b5f6" />
            <stop offset="45%" stopColor="#2196f3" />
            <stop offset="100%" stopColor="#1565c0" />
          </linearGradient>
          <linearGradient id="pipeShadowGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#cfd8dc" />
            <stop offset="100%" stopColor="#90a4ae" />
          </linearGradient>
        </defs>
      </svg>

      {/* Background ambient glow shapes */}
      <div className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
      <div className="absolute -top-20 -left-20 w-80 h-80 rounded-full bg-sky-500/5 blur-3xl pointer-events-none" />

      {/* Top Header */}
      <div className="flex items-center justify-between w-full max-w-3xl mb-1.5 sm:mb-3 shrink-0 z-20">
        <ClayButton
          onClick={onBack}
          variant="surface"
          className="min-w-[48px] min-h-[48px] sm:min-w-[64px] sm:min-h-[64px] rounded-full flex items-center justify-center border-2 border-white/50 active:scale-95 shadow-md"
        >
          <ArrowLeft className="w-6 h-6 text-[#5c6b73]" strokeWidth={3.5} />
        </ClayButton>
        <div className="flex flex-col items-center">
          <h2 className="text-base sm:text-2xl font-black text-[#2f3e46] uppercase tracking-wide">
            Maze Router
          </h2>
          <span className="text-xs font-bold text-[#5c6b73]/80">
            Puzzle {levelIdx + 1} of {levels.length}
          </span>
        </div>
        <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-[#ddcbf5] border-2 border-white flex items-center justify-center shadow-md">
          <span className="text-lg font-black text-[#5c3e7f]">🧩</span>
        </div>
      </div>

      {/* Instruction Card */}
      <button
        type="button"
        onClick={() => speakText(instructionText)}
        className="z-10 mb-2 flex w-full max-w-xl cursor-pointer items-center gap-2.5 self-center rounded-[1.35rem] border-2 border-white/70 bg-white/90 p-2.5 text-left shadow-sm outline-none transition-all active:scale-[0.99] focus-visible:ring-4 focus-visible:ring-[#118ab2]/25 sm:mb-4 sm:gap-3 sm:rounded-[1.7rem] sm:p-4"
        aria-label={`Hear instructions: ${instructionText}`}
      >
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#fff4ca] text-base shadow-inner sm:h-10 sm:w-10 sm:text-lg" aria-hidden="true">
          →
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">Instruction</span>
          <span className="block text-[13px] font-bold leading-snug text-[#4A5358] sm:text-base">
            {instructionText}
          </span>
        </span>
        <Volume2 className="h-5 w-5 shrink-0 text-slate-400" aria-hidden="true" />
      </button>

      {/* Main Layout Grid */}
      <div className="flex flex-col md:flex-row items-center justify-center gap-2.5 sm:gap-4 w-full max-w-4xl min-h-0 flex-1 relative overflow-visible px-1">
        
        {/* Center: Puzzle Arena */}
        <div className="relative flex flex-col items-center min-h-0 w-full max-w-[300px] sm:max-w-[340px] overflow-visible">
          {/* Top Entrance Dispenser */}
          <div className="w-full flex justify-center mb-0.5 overflow-visible h-8 sm:h-10 relative">
            <div className="absolute top-0 z-10 flex h-10 w-16 items-center justify-center rounded-b-[1.25rem] border-[3px] border-white bg-[#e07383] shadow-md sm:h-12 sm:w-20 sm:rounded-b-[1.5rem]">
              <span className="absolute -top-7 grid h-10 w-10 place-items-center sm:-top-8 sm:h-12 sm:w-12" aria-hidden="true">
                <FluentAnimalIcon name={targetGoal.animal} size="100%" animClass="anim-sway" />
              </span>
              <div className="mt-2 h-4 w-4 rounded-full border-2 border-dashed border-white/55 bg-black/10 sm:h-5 sm:w-5" />
            </div>
          </div>

          {/* 3x3 Pipe Grid Clay Tray Container */}
          <div className="relative aspect-square bg-[#ebe6dd] border-[5px] border-white rounded-[2rem] sm:rounded-[2.6rem] shadow-[inset_0_8px_16px_rgba(0,0,0,0.06),_0_12px_24px_rgba(0,0,0,0.1)] w-[min(76vw,34dvh,290px)] sm:w-[340px] p-2 select-none overflow-visible">
            {/* Base grid layout */}
            <div className="grid grid-cols-3 grid-rows-3 gap-2 w-full h-full select-none">
              {grid.map((row, r) =>
                row.map((cell, c) => {
                  const isWrong = highlightedCell && highlightedCell.r === r && highlightedCell.c === c;
                  return (
                    <motion.div
                      key={`${r}-${c}`}
                      onClick={() => handleCellTap(r, c)}
                      className={`relative bg-[#fdfdfb] border-[3px] border-white rounded-[1.1rem] sm:rounded-[1.25rem] cursor-pointer select-none shadow-[0_6px_12px_rgba(0,0,0,0.05),_inset_0_-4px_0_rgba(0,0,0,0.08),_inset_0_4px_0_rgba(255,255,255,0.7)] flex items-center justify-center p-1 ${
                        isRolling ? "pointer-events-none" : "hover:scale-[1.03] hover:border-emerald-300 active:scale-95"
                      }`}
                      animate={
                        isWrong
                          ? { x: [-4, 4, -4, 4, 0], border: "3px solid #ff3366" }
                          : { border: "3px solid rgba(255, 255, 255, 0.8)" }
                      }
                      transition={{ duration: isWrong ? 0.4 : 0.2 }}
                    >
                      {/* Pipe Render */}
                      <motion.div
                        className="w-full h-full select-none"
                        animate={{ rotate: cell.rotation }}
                        transition={{ type: "spring", stiffness: 220, damping: 14 }}
                      >
                        <svg viewBox="0 0 100 100" className="w-full h-full select-none pointer-events-none">
                          {cell.type === "straight" && (
                            <g>
                              {/* Outer pipe shadow */}
                              <rect x={0} y={33} width={100} height={34} rx={17} fill="#b8c8d2" />
                              <rect x={0} y={37} width={100} height={26} rx={13} fill="#2f9ee5" />
                              {/* Inner highlight */}
                              <rect x={0} y={40} width={100} height={6} fill="#ffffff" opacity={0.45} />
                            </g>
                          )}
                          {cell.type === "curved" && (
                            <g>
                              {/* Outer pipe shadow */}
                              <path d="M 50 100 A 50 50 0 0 1 100 50" fill="none" stroke="#b8c8d2" strokeWidth={34} strokeLinecap="round" />
                              <path d="M 50 100 A 50 50 0 0 1 100 50" fill="none" stroke="#2f9ee5" strokeWidth={26} strokeLinecap="round" />
                              {/* Inner highlight */}
                              <path d="M 50 100 A 50 50 0 0 1 100 50" fill="none" stroke="#ffffff" strokeWidth={6} strokeLinecap="round" opacity={0.45} />
                            </g>
                          )}
                          {cell.type === "cross" && (
                            <g>
                              {/* Outer pipe shadow */}
                              <rect x={0} y={33} width={100} height={34} rx={17} fill="#b8c8d2" />
                              <rect x={33} y={0} width={34} height={100} rx={17} fill="#b8c8d2" />
                              <rect x={0} y={37} width={100} height={26} rx={13} fill="#2f9ee5" />
                              <rect x={37} y={0} width={26} height={100} rx={13} fill="#2f9ee5" />
                              {/* Inner highlights */}
                              <rect x={0} y={40} width={100} height={6} fill="#ffffff" opacity={0.45} />
                              <rect x={40} y={0} width={6} height={100} fill="#ffffff" opacity={0.45} />
                            </g>
                          )}
                        </svg>
                      </motion.div>
                    </motion.div>
                  );
                })
              )}
            </div>

            {/* Overlaid SVG Canvas for Marble Path Animation */}
            <svg
              className="absolute inset-3.5 w-[calc(100%-1.75rem)] h-[calc(100%-1.75rem)] pointer-events-none select-none overflow-visible"
              viewBox="0 0 300 300"
            >
              {/* Marble Rendering */}
              <AnimatePresence>
                {isRolling && (
                  <motion.g
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    style={{ x: marblePos.x, y: marblePos.y }}
                  >
                    {/* Marble body */}
                    <circle cx={0} cy={0} r={14} fill={`url(#marbleGrad)`} className="filter drop-shadow-[2px_3px_5px_rgba(0,0,0,0.18)]" />
                    {/* 3D highlight gloss */}
                    <circle cx={-4} cy={-4} r={4} fill="#ffffff" opacity={0.65} />
                  </motion.g>
                )}
              </AnimatePresence>

              {/* Define gradients for marble */}
              <defs>
                <radialGradient id="marbleGrad" cx="35%" cy="35%" r="65%">
                  <stop offset="0%" stopColor="#ffffff" stopOpacity={0.6} />
                  <stop offset="40%" stopColor={targetGoal.color} />
                  <stop offset="100%" stopColor="#1a0a00" />
                </radialGradient>
              </defs>
            </svg>
          </div>

          {/* Bottom Color Goals */}
          <p className="mt-2 rounded-full bg-white/80 px-4 py-1.5 text-center text-[10px] font-black uppercase tracking-wider text-[#5c6b73] shadow-sm sm:mt-3 sm:text-[11px]">
            Tap pipes to rotate, then roll.
          </p>

          <div className="mt-2 grid w-full grid-cols-3 gap-1.5 overflow-visible z-10 sm:mt-3 sm:gap-2">
            {goalItems.map((goal) => {
              const isTarget = goal.animal === targetGoal.animal && goal.label === targetGoal.label;
              return (
                <div
                  key={`${goal.label}-${goal.animal}`}
                  className={`relative flex min-h-[58px] flex-col items-center justify-center rounded-[1rem] border-[3px] bg-white px-1.5 py-1.5 shadow-sm sm:min-h-[72px] sm:rounded-[1.25rem] sm:px-2 sm:py-2 ${
                    isTarget ? "border-white ring-4 ring-[#ffd166]/55" : "border-white/70 opacity-80"
                  }`}
                >
                  {isTarget && (
                    <span className="absolute -top-3 rounded-full bg-[#2f3e46] px-2 py-0.5 text-[8px] font-black uppercase tracking-wider text-white shadow-md">
                      Goal
                    </span>
                  )}
                  <span
                    className="mb-0.5 grid h-6 w-10 place-items-center rounded-full border-2 border-white shadow-inner sm:mb-1 sm:h-8 sm:w-12"
                    style={{ backgroundColor: goal.color }}
                    aria-hidden="true"
                  >
                    <span className="h-2.5 w-7 rounded-full bg-black/16 sm:h-3 sm:w-8" />
                  </span>
                  <span className="text-[9px] font-black uppercase tracking-wider sm:text-[10px]" style={{ color: goal.color }}>
                    {goal.label}
                  </span>
                  <span className="mt-0.5 h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true">
                    <FluentAnimalIcon name={goal.animal} size="100%" />
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Panel: Roll controls */}
        <div className="flex flex-col gap-2 justify-center items-center w-full max-w-[300px] md:w-36 shrink-0 z-10">
          <ClayButton
            onClick={handleRoll}
            isDisabled={isRolling}
            variant="primary"
            className="w-full py-3 md:py-5 rounded-[1.5rem] md:rounded-[2rem] text-base md:text-xl font-black uppercase tracking-wider flex flex-col items-center gap-0.5 active:scale-95 shadow-lg select-none disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <span>Roll!</span>
            <span className="text-xs font-normal lowercase select-none">tap to drop</span>
          </ClayButton>

          {/* Reset button if got stuck */}
          <ClayButton
            onClick={() => {
              playSynthesizedSound("click");
              setIsRolling(false);
              setMarblePos({ x: 150, y: -40 });
            }}
            variant="surface"
            className="w-full py-2.5 text-xs font-bold rounded-2xl"
          >
            Reset Marble
          </ClayButton>
        </div>
      </div>
    </div>
  );
}
