"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import confetti from "canvas-confetti";
import { Speaker224Regular } from "@fluentui/react-icons";
import { playSynthesizedSound } from "@/lib/audio";
import { speakWithPreferredVoice } from "@/lib/speech";
import ClayButton from "@/components/ui/ClayButton";

interface LittleBuilderProps {
  childId: string;
  onBack: () => void;
}

type ShapeType = "circle" | "triangle" | "square" | "rectangle" | "oval" | "star" | "heart";

interface ShapeSlot {
  id: string;
  shape: ShapeType;
  label: string;
  color: string;
  // Positioning percentage on blueprint
  top: string;
  left: string;
  width: string;
  height: string;
  clipPath?: string;
  borderRadius?: string;
  isPlaced: boolean;
}

interface BuildObject {
  id: string;
  name: string;
  description: string;
  slots: ShapeSlot[];
}

const BUILD_OBJECTS: BuildObject[] = [
  {
    id: "b1",
    name: "House",
    description: "Build a cozy little house!",
    slots: [
      { id: "s1", shape: "triangle", label: "Roof", color: "bg-rose-400", top: "8%", left: "20%", width: "60%", height: "36%", clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)", isPlaced: false },
      { id: "s2", shape: "square", label: "Walls", color: "bg-blue-400", top: "44%", left: "25%", width: "50%", height: "48%", borderRadius: "1.5rem", isPlaced: false },
      { id: "s3", shape: "rectangle", label: "Door", color: "bg-amber-400", top: "57%", left: "42%", width: "16%", height: "35%", borderRadius: "0.5rem 0.5rem 0 0", isPlaced: false }
    ]
  },
  {
    id: "b2",
    name: "Sailboat",
    description: "Let's build a sailboat for the ocean!",
    slots: [
      { id: "s1", shape: "rectangle", label: "Deck", color: "bg-amber-400", top: "65%", left: "15%", width: "70%", height: "18%", borderRadius: "0 0 1.5rem 1.5rem", isPlaced: false },
      { id: "s2", shape: "triangle", label: "Big Sail", color: "bg-sky-400", top: "17%", left: "18%", width: "27%", height: "48%", clipPath: "polygon(100% 0%, 0% 100%, 100% 100%)", isPlaced: false },
      { id: "s3", shape: "triangle", label: "Small Sail", color: "bg-rose-400", top: "27%", left: "45%", width: "27%", height: "38%", clipPath: "polygon(0% 0%, 0% 100%, 100% 100%)", isPlaced: false }
    ]
  },
  {
    id: "b3",
    name: "Rocket",
    description: "Blast off into space!",
    slots: [
      { id: "s1", shape: "rectangle", label: "Body", color: "bg-slate-400", top: "32%", left: "36%", width: "28%", height: "48%", borderRadius: "1rem", isPlaced: false },
      { id: "s2", shape: "triangle", label: "Nose Cone", color: "bg-rose-400", top: "8%", left: "36%", width: "28%", height: "24%", clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)", isPlaced: false },
      { id: "s3", shape: "oval", label: "Window", color: "bg-sky-400", top: "42%", left: "44%", width: "12%", height: "12%", borderRadius: "50%", isPlaced: false },
      { id: "s4", shape: "triangle", label: "Fin Left", color: "bg-amber-400", top: "60%", left: "24%", width: "12%", height: "20%", clipPath: "polygon(100% 0%, 0% 100%, 100% 100%)", isPlaced: false },
      { id: "s5", shape: "triangle", label: "Fin Right", color: "bg-amber-400", top: "60%", left: "64%", width: "12%", height: "20%", clipPath: "polygon(0% 0%, 0% 100%, 100% 100%)", isPlaced: false }
    ]
  },
  {
    id: "b4",
    name: "Flower",
    description: "Grow a pretty shape flower!",
    slots: [
      { id: "s1", shape: "rectangle", label: "Stem", color: "bg-emerald-400", top: "54%", left: "47%", width: "6%", height: "38%", borderRadius: "0.25rem", isPlaced: false },
      { id: "s2", shape: "circle", label: "Center", color: "bg-amber-400", top: "30%", left: "37%", width: "26%", height: "26%", borderRadius: "50%", isPlaced: false },
      { id: "s3", shape: "oval", label: "Petal Top", color: "bg-rose-400", top: "6%", left: "42%", width: "16%", height: "26%", borderRadius: "50%", isPlaced: false },
      { id: "s4", shape: "oval", label: "Petal Bottom", color: "bg-rose-400", top: "54%", left: "42%", width: "16%", height: "26%", borderRadius: "50%", isPlaced: false },
      { id: "s5", shape: "oval", label: "Petal Left", color: "bg-rose-400", top: "30%", left: "13%", width: "26%", height: "26%", borderRadius: "50%", isPlaced: false },
      { id: "s6", shape: "oval", label: "Petal Right", color: "bg-rose-400", top: "30%", left: "61%", width: "26%", height: "26%", borderRadius: "50%", isPlaced: false }
    ]
  },
  {
    id: "b5",
    name: "Robot",
    description: "Beep boop! Build a robot friend!",
    slots: [
      { id: "s1", shape: "square", label: "Head", color: "bg-rose-400", top: "8%", left: "38%", width: "24%", height: "24%", borderRadius: "1rem", isPlaced: false },
      { id: "s2", shape: "rectangle", label: "Body", color: "bg-sky-400", top: "32%", left: "31%", width: "38%", height: "38%", borderRadius: "1.5rem", isPlaced: false },
      { id: "s3", shape: "rectangle", label: "Left Arm", color: "bg-amber-400", top: "36%", left: "17%", width: "12%", height: "22%", borderRadius: "0.5rem", isPlaced: false },
      { id: "s4", shape: "rectangle", label: "Right Arm", color: "bg-amber-400", top: "36%", left: "71%", width: "12%", height: "22%", borderRadius: "0.5rem", isPlaced: false },
      { id: "s5", shape: "rectangle", label: "Left Leg", color: "bg-slate-400", top: "70%", left: "37%", width: "10%", height: "22%", borderRadius: "0.5rem", isPlaced: false },
      { id: "s6", shape: "rectangle", label: "Right Leg", color: "bg-slate-400", top: "70%", left: "53%", width: "10%", height: "22%", borderRadius: "0.5rem", isPlaced: false }
    ]
  }
];

const shuffleDeterministically = <T,>(array: T[], seed: string): T[] => {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  const result = [...array];
  return result.sort((a, b) => {
    const valA = String(a).charCodeAt(0) * Math.abs(hash);
    const valB = String(b).charCodeAt(0) * Math.abs(hash);
    return (valA % 13) - (valB % 13);
  });
};

const getSvgPoints = (clipPath?: string): string => {
  if (!clipPath) return "50,5 95,95 5,95";
  const match = clipPath.match(/polygon\(([^)]+)\)/);
  if (!match) return "50,5 95,95 5,95";
  return match[1]
    .split(",")
    .map(pair => {
      const parts = pair.trim().split(/\s+/);
      const x = parseFloat(parts[0].replace(/%/g, ""));
      const y = parseFloat(parts[1].replace(/%/g, ""));
      // Scale coordinates slightly inset to avoid clipping boundary borders
      const insetX = 5 + (x * 0.90);
      const insetY = 5 + (y * 0.90);
      return `${insetX.toFixed(1)},${insetY.toFixed(1)}`;
    })
    .join(" ");
};

const getGradientUrl = (colorClass: string): string => {
  if (colorClass.includes("rose")) return "url(#grad-rose)";
  if (colorClass.includes("blue")) return "url(#grad-blue)";
  if (colorClass.includes("amber")) return "url(#grad-amber)";
  if (colorClass.includes("sky")) return "url(#grad-sky)";
  if (colorClass.includes("slate")) return "url(#grad-slate)";
  if (colorClass.includes("emerald")) return "url(#grad-emerald)";
  return "url(#grad-blue)"; // Default fallback
};

const ShapeSvg = ({
  shape,
  color,
  strokeDashed,
  clipPath,
  className
}: {
  shape: ShapeType;
  color?: string;
  strokeDashed?: boolean;
  clipPath?: string;
  className?: string;
}) => {
  const fillValue = strokeDashed ? "none" : getGradientUrl(color || "bg-blue-400");
  const strokeClass = strokeDashed
    ? "stroke-sky-400/50 stroke-[3]"
    : "stroke-white/90 stroke-[2.5]";

  if (clipPath && clipPath.startsWith("polygon")) {
    const points = getSvgPoints(clipPath);
    return (
      <svg viewBox="0 0 100 100" className={className} preserveAspectRatio="none">
        <polygon points={points} fill={fillValue} className={strokeClass} strokeDasharray={strokeDashed ? "6,6" : undefined} filter={strokeDashed ? undefined : "url(#clay-shadow)"} />
      </svg>
    );
  }

  switch (shape) {
    case "circle":
      return (
        <svg viewBox="0 0 100 100" className={className} preserveAspectRatio="none">
          <circle cx="50" cy="50" r="45" fill={fillValue} className={strokeClass} strokeDasharray={strokeDashed ? "6,6" : undefined} filter={strokeDashed ? undefined : "url(#clay-shadow)"} />
        </svg>
      );
    case "square":
    case "rectangle":
      return (
        <svg viewBox="0 0 100 100" className={className} preserveAspectRatio="none">
          <rect x="5" y="5" width="90" height="90" rx="12" fill={fillValue} className={strokeClass} strokeDasharray={strokeDashed ? "6,6" : undefined} filter={strokeDashed ? undefined : "url(#clay-shadow)"} />
        </svg>
      );
    case "triangle":
      return (
        <svg viewBox="0 0 100 100" className={className} preserveAspectRatio="none">
          <polygon points="50,5 95,95 5,95" fill={fillValue} className={strokeClass} strokeDasharray={strokeDashed ? "6,6" : undefined} filter={strokeDashed ? undefined : "url(#clay-shadow)"} />
        </svg>
      );
    case "oval":
      return (
        <svg viewBox="0 0 100 100" className={className} preserveAspectRatio="none">
          <circle cx="50" cy="50" r="45" fill={fillValue} className={strokeClass} strokeDasharray={strokeDashed ? "6,6" : undefined} filter={strokeDashed ? undefined : "url(#clay-shadow)"} />
        </svg>
      );
    case "star":
      return (
        <svg viewBox="0 0 100 100" className={className} preserveAspectRatio="none">
          <polygon points="50,5 64,36 98,36 70,57 81,91 50,70 19,91 30,57 2,36 36,36" fill={fillValue} className={strokeClass} strokeDasharray={strokeDashed ? "6,6" : undefined} filter={strokeDashed ? undefined : "url(#clay-shadow)"} />
        </svg>
      );
    case "heart":
      return (
        <svg viewBox="0 0 100 100" className={className} preserveAspectRatio="none">
          <path d="M12,40 C12,20 32,15 50,36 C68,15 88,20 88,40 C88,68 50,92 50,92 C50,92 12,68 12,40 Z" fill={fillValue} className={strokeClass} strokeDasharray={strokeDashed ? "6,6" : undefined} filter={strokeDashed ? undefined : "url(#clay-shadow)"} />
        </svg>
      );
    default:
      return null;
  }
};

export default function LittleBuilderShapesEngine({ childId: _childId, onBack }: LittleBuilderProps) {
  const [activeObjIdx, setActiveObjIdx] = useState(0);
  const [blueprintSlots, setBlueprintSlots] = useState<ShapeSlot[]>(() =>
    BUILD_OBJECTS[0].slots.map(s => ({ ...s, isPlaced: false }))
  );
  const [traySlots, setTraySlots] = useState<ShapeSlot[]>(() =>
    shuffleDeterministically(BUILD_OBJECTS[0].slots, BUILD_OBJECTS[0].id)
  );
  const [successMode, setSuccessMode] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);

  const activeObject = BUILD_OBJECTS[activeObjIdx];
  const slotRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Speak when active object changes
  useEffect(() => {
    if (!activeObject) return;
    const voiceText = `Let's build a ${activeObject.name}! Drag the shapes to complete the picture.`;
    speakWithPreferredVoice(voiceText, null);
  }, [activeObjIdx, activeObject]);

  const speakPrompt = useCallback(() => {
    if (!activeObject) return;
    speakWithPreferredVoice(`Look at the outline. Drag the matching shapes from the drawer to complete the ${activeObject.name}!`, null);
  }, [activeObject]);

  const handleDragEnd = (slotId: string, _event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (successMode) return;

    const dragX = info.point.x;
    const dragY = info.point.y;
    let matchedSlotId: string | null = null;
    
    const slotElement = slotRefs.current[slotId];

    if (slotElement) {
      const slotRect = slotElement.getBoundingClientRect();
      const slotCenterX = slotRect.left + slotRect.width / 2;
      const slotCenterY = slotRect.top + slotRect.height / 2;

      const dx = dragX - slotCenterX;
      const dy = dragY - slotCenterY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      // Distance snap buffer is 75px for easy toddler manipulation
      if (distance < 75) {
        matchedSlotId = slotId;
      }
    }

    if (matchedSlotId) {
      // Shape matches and is dropped correctly! Snap it in.
      playSynthesizedSound("pop");

      setBlueprintSlots(prev => {
        const next = prev.map(s => (s.id === matchedSlotId ? { ...s, isPlaced: true } : s));
        const allDone = next.every(s => s.isPlaced);

        if (allDone) {
          setSuccessMode(true);
          playSynthesizedSound("win");
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
          });

          setTimeout(() => {
            if (activeObjIdx < BUILD_OBJECTS.length - 1) {
              const nextIdx = activeObjIdx + 1;
              const nextObj = BUILD_OBJECTS[nextIdx];
              setActiveObjIdx(nextIdx);
              setBlueprintSlots(nextObj.slots.map(s => ({ ...s, isPlaced: false })));
              setTraySlots(shuffleDeterministically(nextObj.slots, nextObj.id));
              setSuccessMode(false);
            } else {
              setIsGameOver(true);
              playSynthesizedSound("levelUp");
            }
          }, 2500);
        }

        return next;
      });

      // Remove this exact slot from the tray drawer
      setTraySlots(prev => prev.filter(s => s.id !== matchedSlotId));
    } else {
      // Invalid drop, play wrong sound
      playSynthesizedSound("wrong");
    }
  };

  const handlePlayAgain = () => {
    setActiveObjIdx(0);
    const initialSlots = BUILD_OBJECTS[0].slots.map(s => ({ ...s, isPlaced: false }));
    setBlueprintSlots(initialSlots);
    setTraySlots(shuffleDeterministically(BUILD_OBJECTS[0].slots, BUILD_OBJECTS[0].id));
    setIsGameOver(false);
    setSuccessMode(false);
  };

  if (!activeObject) {
    return (
      <div className="flex h-full w-full items-center justify-center p-6 text-center">
        <p className="text-lg font-black text-slate-700">Drawing blueprint layout...</p>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full flex-col bg-gradient-to-b from-[#e0f2fe]/60 to-[#f5f5f7]/40 p-4 relative overflow-hidden select-none">
      
      {/* Global SVG Definitions for gradients and shadows */}
      <svg width="0" height="0" className="absolute pointer-events-none">
        <defs>
          <filter id="clay-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="5" stdDeviation="3" floodColor="#0f172a" floodOpacity="0.25" />
          </filter>
          
          <linearGradient id="grad-rose" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fca5a5" />
            <stop offset="100%" stopColor="#f43f5e" />
          </linearGradient>
          <linearGradient id="grad-blue" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#93c5fd" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>
          <linearGradient id="grad-amber" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fde047" />
            <stop offset="100%" stopColor="#d97706" />
          </linearGradient>
          <linearGradient id="grad-sky" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#7dd3fc" />
            <stop offset="100%" stopColor="#0284c7" />
          </linearGradient>
          <linearGradient id="grad-slate" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#cbd5e1" />
            <stop offset="100%" stopColor="#64748b" />
          </linearGradient>
          <linearGradient id="grad-emerald" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6ee7b7" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>
        </defs>
      </svg>

      {/* Header and Instruction */}
      <div className="flex items-center justify-between gap-4 mb-2 shrink-0">
        <div className="flex items-center gap-3">
          <div className="text-3xl">📐</div>
          <div className="bg-white/90 rounded-2xl px-4 py-2 border border-slate-200/50 shadow-sm">
            <span className="text-[10px] font-black uppercase text-blue-600 tracking-wider">Little Builder:</span>
            <p className="text-sm font-bold text-slate-800">
              Drag the shapes to build the picture.
            </p>
          </div>
        </div>

        <ClayButton
          variant="secondary"
          size="sm"
          onClick={speakPrompt}
          className="flex items-center gap-1.5"
        >
          <Speaker224Regular className="w-4 h-4" />
          <span className="text-xs font-black uppercase tracking-wider">Listen</span>
        </ClayButton>
      </div>

      {/* Main Construction Sandbox */}
      <div className="flex-grow flex flex-col md:flex-row items-center justify-center gap-6 min-h-0 py-2">
        
        {/* Construction Blueprint Area - Expanded to 68% width and larger max-height */}
        <div className="w-full md:w-[68%] aspect-video md:h-full bg-slate-900 border-4 border-slate-800 rounded-[2.5rem] relative overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.3)] bg-[linear-gradient(rgba(56,189,248,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(56,189,248,0.06)_1px,transparent_1px)] bg-[length:16px_16px] max-h-[440px] flex items-center justify-center">
          
          {/* Centered Square Canvas (Fills 95% height) */}
          <div className="h-[95%] aspect-square relative">
            {blueprintSlots.map((slot) => {
              const shapeStyle: React.CSSProperties = {
                position: "absolute",
                top: slot.top,
                left: slot.left,
                width: slot.width,
                height: slot.height,
                clipPath: slot.clipPath,
                borderRadius: slot.borderRadius
              };

              return (
                <motion.div
                  key={slot.id}
                  ref={el => {
                    slotRefs.current[slot.id] = el;
                  }}
                  style={shapeStyle}
                  animate={slot.isPlaced ? { scale: [1, 1.18, 0.95, 1], rotate: [0, 4, -2, 0] } : {}}
                  transition={{ duration: 0.45, ease: "easeOut" }}
                  className={`transition-all duration-300 overflow-hidden flex items-center justify-center ${
                    slot.isPlaced 
                      ? "shadow-lg bg-transparent" 
                      : "bg-slate-950/25 border border-dashed border-sky-500/20"
                  }`}
                >
                  <ShapeSvg
                    shape={slot.shape}
                    color={slot.color}
                    strokeDashed={!slot.isPlaced}
                    clipPath={slot.clipPath}
                    className="w-full h-full"
                  />
                </motion.div>
              );
            })}
          </div>

          {/* Technical blueprint annotations in corners */}
          <div className="absolute top-4 left-6 text-[9px] font-mono text-cyan-400/40 select-none tracking-wider uppercase pointer-events-none hidden sm:block">
            Scale: 1:1
          </div>
          <div className="absolute top-4 right-6 text-[9px] font-mono text-cyan-400/40 select-none tracking-wider uppercase pointer-events-none hidden sm:block">
            Blueprint: #{activeObjIdx + 1} / 5
          </div>
          <div className="absolute bottom-4 left-6 text-[9px] font-mono text-cyan-400/40 select-none tracking-wider uppercase pointer-events-none hidden sm:block">
            System: ARCH-D (16px)
          </div>
          <div className="absolute bottom-4 right-6 text-[9px] font-mono text-cyan-400/40 select-none tracking-wider uppercase pointer-events-none hidden sm:block">
            Midday Builder Co.
          </div>

          {/* Celebratory object bounce text when puzzle is complete */}
          {successMode && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute inset-x-0 bottom-6 mx-auto bg-emerald-500 border border-white text-white font-black text-center uppercase tracking-widest px-6 py-2 rounded-full w-fit shadow-md z-10 animate-bounce"
            >
              ✨ {activeObject.name} Completed! ✨
            </motion.div>
          )}
        </div>

        {/* Blueprint Shapes Drawer - Reduced to 32% width */}
        <div className="w-full md:w-[32%] flex flex-col justify-center items-center gap-4 bg-[#fffdf9] border-2 border-[#e6dfd3] p-5 rounded-[2rem] shadow-inner">
          <span className="text-xs font-black uppercase text-[#8c8270] tracking-wider">Builder Shapes Drawer</span>
          <div className="flex gap-4 flex-wrap justify-center max-w-xs min-h-[96px] items-center">
            <AnimatePresence>
              {traySlots.map((slot) => {
                const w = parseFloat(slot.width);
                const h = parseFloat(slot.height);
                const aspectRatio = w / h;
                const colorClass = slot.color;

                let widthPercent = "100%";
                let heightPercent = "100%";

                if (aspectRatio > 1) {
                  heightPercent = `${(100 / aspectRatio).toFixed(1)}%`;
                } else {
                  widthPercent = `${(100 * aspectRatio).toFixed(1)}%`;
                }

                return (
                  <motion.div
                    key={slot.id}
                    drag
                    dragSnapToOrigin
                    dragElastic={0.2}
                    onDragEnd={(e, info) => handleDragEnd(slot.id, e, info)}
                    whileHover={{ scale: 1.1 }}
                    whileDrag={{ scale: 1.15, zIndex: 50, cursor: "grabbing" }}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="w-20 h-20 bg-white border-2 border-slate-100 shadow-[0_6px_0_rgba(0,0,0,0.05)] rounded-[1.25rem] flex flex-col items-center justify-center cursor-pointer hover:border-blue-200 touch-none"
                  >
                    <div className="w-12 h-12 flex items-center justify-center min-h-0 min-w-0 p-1">
                      <div style={{ width: widthPercent, height: heightPercent }} className="flex items-center justify-center">
                        <ShapeSvg
                          shape={slot.shape}
                          color={colorClass}
                          strokeDashed={false}
                          clipPath={slot.clipPath}
                          className="w-full h-full"
                        />
                      </div>
                    </div>
                    <span className="text-[9px] font-black uppercase text-slate-500 tracking-tighter mt-1">{slot.shape}</span>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>

      </div>

      {/* Progress tracking - 3D Progress Slider */}
      <div className="shrink-0 mt-2 bg-white/80 border border-slate-200/50 rounded-2xl p-4 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black uppercase text-slate-500 tracking-wider">Blueprints Assembled</span>
          <span className="text-xs font-bold text-slate-600">Model {activeObjIdx + 1} of 5</span>
        </div>
        <div className="w-full h-3 bg-slate-100 rounded-full relative overflow-hidden border border-slate-200">
          <motion.div 
            className="h-full bg-gradient-to-r from-blue-400 to-sky-400 rounded-full"
            initial={{ width: "0%" }}
            animate={{ width: `${((activeObjIdx) / 5) * 100 + 20}%` }}
            transition={{ duration: 0.5 }}
          />
          <div className="absolute inset-0 flex justify-between px-1 items-center pointer-events-none">
            {[0, 1, 2, 3, 4].map(idx => (
              <div 
                key={idx} 
                className={`w-1.5 h-1.5 rounded-full ${idx <= activeObjIdx ? "bg-white/80" : "bg-slate-300"}`} 
              />
            ))}
          </div>
        </div>
      </div>

      {/* Finished Game Over Screen */}
      <AnimatePresence>
        {isGameOver && (
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              className="bg-white rounded-[2.5rem] border border-slate-200 p-8 max-w-md w-full text-center shadow-2xl relative"
            >
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-[1.45rem] border-2 border-white bg-blue-500 text-4xl text-white shadow-md">
                📐
              </div>

              <h2 className="font-display text-3xl font-extrabold text-slate-800 leading-none">Master Builder!</h2>
              <p className="mt-3 text-slate-600 font-bold max-w-xs mx-auto">
                Amazing! You have correctly constructed all 5 blueprints and matched all shape silhouettes!
              </p>

              <div className="flex gap-4 items-center justify-center mt-6">
                <ClayButton variant="primary" onClick={handlePlayAgain} className="w-full py-3.5">
                  Play Again
                </ClayButton>
                <ClayButton variant="secondary" onClick={onBack} className="w-full py-3.5">
                  Back to Menu
                </ClayButton>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
