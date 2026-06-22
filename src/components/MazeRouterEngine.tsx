"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { ArrowLeft, Volume2, Sparkles, Smile, RefreshCw } from "@/components/Icons";
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

interface MazeLevel {
  id: number;
  targetName: "Pig" | "Alligator" | "Bear";
  targetCol: 0 | 1 | 2;
  marbleColor: string;
  mascotSpeech: string;
  grid: CellState[][];
}

const levels: MazeLevel[] = [
  {
    id: 1,
    targetName: "Pig",
    targetCol: 0,
    marbleColor: "#ff758f", // Pink marble
    mascotSpeech: "Help the Pig get the pink marble! Connect the pipes to the Pink Basket on the left!",
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
    targetName: "Bear",
    targetCol: 2,
    marbleColor: "#a06040", // Brown marble
    mascotSpeech: "Help the Bear get the brown marble! Connect the pipes to the Brown Basket on the right!",
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
    targetName: "Alligator",
    targetCol: 1,
    marbleColor: "#00D26A", // Green marble
    mascotSpeech: "Help the Alligator get the green marble! Connect the pipes to the Green Basket in the middle!",
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
  }
];

export default function MazeRouterEngine({ childId, onBack }: { childId: string; onBack: () => void }) {
  const [levelIdx, setLevelIdx] = useState(0);
  const [grid, setGrid] = useState<CellState[][]>([]);
  const [isRolling, setIsRolling] = useState(false);
  const [rollResult, setRollResult] = useState<{ success: boolean; path: Point[] } | null>(null);
  const [marblePos, setMarblePos] = useState<Point>({ x: 150, y: -40 });
  const [highlightedCell, setHighlightedCell] = useState<{ r: number; c: number } | null>(null);
  const [startTime] = useState<number>(() => Date.now());

  const activeLevel = levels[levelIdx];

  // Helper to load vocabulary animal icon
  const pigVocab = vocabularyList.find(v => v.name === "Pig");
  const bearVocab = vocabularyList.find(v => v.name === "Bear");
  const alligatorVocab = vocabularyList.find(v => v.name === "Alligator");

  const PigIcon = pigVocab?.icon || Smile;
  const BearIcon = bearVocab?.icon || Smile;
  const AlligatorIcon = alligatorVocab?.icon || Smile;

  const speakText = useCallback((text: string) => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.85;
      utterance.pitch = 1.25;
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
    // Deep copy to prevent mutations
    const gridCopy = activeLevel.grid.map(row => row.map(cell => ({ ...cell })));
    setGrid(gridCopy);
    setRollResult(null);
    setIsRolling(false);
    setMarblePos({ x: 150, y: -40 });
    setHighlightedCell(null);
    speakText(activeLevel.mascotSpeech);
  }, [levelIdx, activeLevel, speakText]);

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
    setRollResult({ success, path });

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
            setRollResult(null);
            setMarblePos({ x: 150, y: -40 });
          }, 1500);
        }
      }
    };

    moveNext();
  };

  return (
    <div className="relative flex flex-col items-center justify-start w-full h-full min-h-0 bg-[#f4f7f6] overflow-hidden p-3 sm:p-5 select-none">
      {/* Top Header */}
      <div className="flex items-center justify-between w-full max-w-3xl mb-3 sm:mb-5 shrink-0 z-20">
        <ClayButton
          onClick={onBack}
          variant="surface"
          className="min-w-[64px] min-h-[64px] rounded-full flex items-center justify-center border-2 border-white/50 active:scale-95 shadow-md"
        >
          <ArrowLeft className="w-6 h-6 text-[#5c6b73]" strokeWidth={3.5} />
        </ClayButton>
        <div className="flex flex-col items-center">
          <h2 className="text-xl sm:text-2xl font-black text-[#2f3e46] uppercase tracking-wide">
            Maze Router
          </h2>
          <span className="text-xs font-bold text-[#5c6b73]/80">
            Puzzle {levelIdx + 1} of {levels.length}
          </span>
        </div>
        <div className="w-16 h-16 rounded-full bg-[#ddcbf5] border-2 border-white flex items-center justify-center shadow-md">
          <span className="text-lg font-black text-[#5c3e7f]">🧩</span>
        </div>
      </div>

      {/* Main Layout Grid */}
      <div className="flex flex-col md:flex-row items-center justify-center gap-6 w-full max-w-4xl min-h-0 flex-1 relative overflow-visible px-2">
        {/* Left Side: Mascot Speech Bubble */}
        <div className="flex flex-col items-center w-full md:w-56 shrink-0 z-10">
          <div className="relative bg-white/95 border-[3px] border-white/40 p-4 rounded-3xl shadow-lg text-center max-w-xs md:max-w-none">
            {/* Speech bubble arrow */}
            <div className="absolute hidden md:block right-[-8px] top-1/2 -translate-y-1/2 w-4 h-4 rotate-45 bg-white border-r-[3px] border-t-[3px] border-white/40" />
            <div className="absolute md:hidden bottom-[-8px] left-1/2 -translate-x-1/2 w-4 h-4 rotate-45 bg-white border-b-[3px] border-r-[3px] border-white/40" />
            <p className="text-sm font-bold text-[#4A5358] leading-snug">
              {activeLevel.mascotSpeech}
            </p>
          </div>
          <div className="w-20 h-20 sm:w-24 sm:h-24 mt-4 relative">
            {activeLevel.targetCol === 0 && <PigIcon className="w-full h-full filter drop-shadow-md animate-float" />}
            {activeLevel.targetCol === 1 && <AlligatorIcon className="w-full h-full filter drop-shadow-md animate-float" />}
            {activeLevel.targetCol === 2 && <BearIcon className="w-full h-full filter drop-shadow-md animate-float" />}
          </div>
        </div>

        {/* Center: Puzzle Arena */}
        <div className="relative flex flex-col items-center min-h-0 w-full max-w-[320px] sm:max-w-[360px] overflow-visible">
          {/* Top Entrance Dispenser */}
          <div className="w-full flex justify-center mb-1 overflow-visible h-10 relative">
            <div className="absolute top-0 w-16 h-10 bg-[#e07383] border-[3px] border-white rounded-b-2xl shadow-md flex items-center justify-center z-10">
              <div className="w-6 h-6 rounded-full bg-black/10 border-2 border-dashed border-white/40" />
            </div>
          </div>

          {/* 3x3 Pipe Grid Clay Tray Container */}
          <div className="relative bg-[#ebe6dd] border-[5px] border-white rounded-[2.8rem] shadow-[inset_0_8px_16px_rgba(0,0,0,0.06),_0_12px_24px_rgba(0,0,0,0.1)] w-[320px] h-[320px] sm:w-[350px] sm:h-[350px] p-2.5 select-none overflow-visible">
            {/* Base grid layout */}
            <div className="grid grid-cols-3 grid-rows-3 gap-2 w-full h-full select-none">
              {grid.map((row, r) =>
                row.map((cell, c) => {
                  const isWrong = highlightedCell && highlightedCell.r === r && highlightedCell.c === c;
                  return (
                    <motion.div
                      key={`${r}-${c}`}
                      onClick={() => handleCellTap(r, c)}
                      className={`relative bg-white border-[3px] border-white rounded-[1.25rem] cursor-pointer select-none shadow-[0_6px_12px_rgba(0,0,0,0.05),_inset_0_-4px_0_rgba(0,0,0,0.08),_inset_0_4px_0_rgba(255,255,255,0.7)] flex items-center justify-center p-1 ${
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
                              <rect x={0} y={33} width={100} height={34} rx={17} fill="#cfd2cd" />
                              <rect x={0} y={37} width={100} height={26} rx={13} fill="#5a7df5" />
                              {/* Inner highlight */}
                              <rect x={0} y={40} width={100} height={6} fill="#ffffff" opacity={0.45} />
                            </g>
                          )}
                          {cell.type === "curved" && (
                            <g>
                              {/* Outer pipe shadow */}
                              <path d="M 50 100 A 50 50 0 0 1 100 50" fill="none" stroke="#cfd2cd" strokeWidth={34} strokeLinecap="round" />
                              <path d="M 50 100 A 50 50 0 0 1 100 50" fill="none" stroke="#5a7df5" strokeWidth={26} strokeLinecap="round" />
                              {/* Inner highlight */}
                              <path d="M 50 100 A 50 50 0 0 1 100 50" fill="none" stroke="#ffffff" strokeWidth={6} strokeLinecap="round" opacity={0.45} />
                            </g>
                          )}
                          {cell.type === "cross" && (
                            <g>
                              {/* Outer pipe shadow */}
                              <rect x={0} y={33} width={100} height={34} rx={17} fill="#cfd2cd" />
                              <rect x={33} y={0} width={34} height={100} rx={17} fill="#cfd2cd" />
                              <rect x={0} y={37} width={100} height={26} rx={13} fill="#5a7df5" />
                              <rect x={37} y={0} width={26} height={100} rx={13} fill="#5a7df5" />
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
                  <stop offset="40%" stopColor={activeLevel.marbleColor} />
                  <stop offset="100%" stopColor="#1a0a00" />
                </radialGradient>
              </defs>
            </svg>
          </div>

          {/* Bottom Saturated Color Baskets */}
          <div className="w-full flex justify-between px-3 mt-4 shrink-0 overflow-visible z-10">
            {/* Basket Col 0 */}
            <div className="flex flex-col items-center w-20 relative">
              <div className="w-20 h-14 rounded-b-2xl rounded-t-lg bg-[#ff1a4a] border-[3px] border-white shadow-clay-card flex items-center justify-center relative overflow-visible">
                <span className="absolute -top-4 text-2xl animate-float" style={{ animationDelay: "0s" }}>🐷</span>
                <div className="absolute bottom-1 w-12 h-3.5 rounded-full bg-black/15 shadow-inner" />
              </div>
              <span className="text-[11px] font-black uppercase text-[#ff1a4a] mt-1.5">Pink</span>
            </div>

            {/* Basket Col 1 */}
            <div className="flex flex-col items-center w-20 relative">
              <div className="w-20 h-14 rounded-b-2xl rounded-t-lg bg-[#00c853] border-[3px] border-white shadow-clay-card flex items-center justify-center relative overflow-visible">
                <span className="absolute -top-4 text-2xl animate-float" style={{ animationDelay: "0.5s" }}>🐊</span>
                <div className="absolute bottom-1 w-12 h-3.5 rounded-full bg-black/15 shadow-inner" />
              </div>
              <span className="text-[11px] font-black uppercase text-[#00c853] mt-1.5">Green</span>
            </div>

            {/* Basket Col 2 */}
            <div className="flex flex-col items-center w-20 relative">
              <div className="w-20 h-14 rounded-b-2xl rounded-t-lg bg-[#8d6e63] border-[3px] border-white shadow-clay-card flex items-center justify-center relative overflow-visible">
                <span className="absolute -top-4 text-2xl animate-float" style={{ animationDelay: "1s" }}>🐻</span>
                <div className="absolute bottom-1 w-12 h-3.5 rounded-full bg-black/15 shadow-inner" />
              </div>
              <span className="text-[11px] font-black uppercase text-[#8d6e63] mt-1.5">Brown</span>
            </div>
          </div>
        </div>

        {/* Right Panel: Roll controls */}
        <div className="flex flex-col gap-3 justify-center items-center w-full md:w-36 shrink-0 z-10">
          <ClayButton
            onClick={handleRoll}
            isDisabled={isRolling}
            variant="primary"
            className="w-full py-5 rounded-[2rem] text-xl font-black uppercase tracking-wider flex flex-col items-center gap-1 active:scale-95 shadow-lg select-none disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <span>Roll!</span>
            <span className="text-xs font-normal lowercase select-none">tap to drop</span>
          </ClayButton>

          {/* Reset button if got stuck */}
          <ClayButton
            onClick={() => {
              playSynthesizedSound("click");
              setIsRolling(false);
              setRollResult(null);
              setMarblePos({ x: 150, y: -40 });
            }}
            variant="surface"
            className="w-full py-3 text-xs font-bold rounded-2xl"
          >
            Reset Marble
          </ClayButton>
        </div>
      </div>
    </div>
  );
}
