"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { ArrowLeft, Volume2, BookOpen } from "@/components/Icons";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import ClayButton from "@/components/ui/ClayButton";
import ClayCard from "@/components/ui/ClayCard";

interface PuzzlePiece {
  id: "beginning" | "middle" | "end";
  title: string;
  desc: string;
  order: 0 | 1 | 2;
  renderSVG: () => React.ReactNode;
}

const playSynthesizedSound = (type: "correct" | "wrong" | "levelUp" | "click" | "pop") => {
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
    } else if (type === "wrong") {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.exponentialRampToValueAtTime(80, now + 0.3);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(now + 0.3);
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
    } else if (type === "pop") {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(450, now);
      osc.frequency.exponentialRampToValueAtTime(250, now + 0.08);
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

const storyPieces: PuzzlePiece[] = [
  {
    id: "beginning",
    title: "1. Beginning",
    desc: "First, we plant a tiny seed in the soil.",
    order: 0,
    renderSVG: () => (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {/* Soil Base */}
        <path d="M 10 75 Q 50 65 90 75 L 90 90 L 10 90 Z" fill="#7c5c43" />
        {/* Seed */}
        <ellipse cx="50" cy="70" rx="4" ry="7" fill="#ebd6b5" transform="rotate(30 50 70)" />
        {/* Spade */}
        <path d="M 68 35 L 75 42 M 52 50 L 68 35 M 48 53 L 56 60 L 44 72 L 36 64 Z" fill="#9eb1bd" stroke="#4a5358" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <line x1="68" y1="35" x2="52" y2="50" stroke="#ebd6b5" strokeWidth="3" strokeLinecap="round" />
      </svg>
    )
  },
  {
    id: "middle",
    title: "2. Middle",
    desc: "Next, the rain falls and a little green sprout grows.",
    order: 1,
    renderSVG: () => (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {/* Soil */}
        <path d="M 10 75 Q 50 65 90 75 L 90 90 L 10 90 Z" fill="#7c5c43" />
        {/* Sprout stem */}
        <path d="M 50 72 Q 48 55 58 45" fill="none" stroke="#68b75c" strokeWidth="4.5" strokeLinecap="round" />
        {/* Little Leaves */}
        <path d="M 50 63 Q 40 60 48 53 Q 50 61 50 63" fill="#68b75c" />
        <path d="M 54 52 Q 65 52 62 43 Q 54 48 54 52" fill="#68b75c" />
        {/* Rain clouds/drops */}
        <path d="M 30 20 Q 30 24 35 24 Q 40 24 40 20 Q 40 16 35 16 Q 30 16 30 20 Z" fill="#b5cce6" />
        <path d="M 65 18 Q 65 22 70 22 Q 75 22 75 18 Q 75 14 70 14 Q 65 14 65 18 Z" fill="#b5cce6" />
        <path d="M 35 32 L 32 37" stroke="#3fa394" strokeWidth="2" strokeLinecap="round" />
        <path d="M 70 30 L 67 35" stroke="#3fa394" strokeWidth="2" strokeLinecap="round" />
        <path d="M 52 28 L 49 33" stroke="#3fa394" strokeWidth="2" strokeLinecap="round" />
      </svg>
    )
  },
  {
    id: "end",
    title: "3. End",
    desc: "Finally, a beautiful colorful flower blooms in the sun!",
    order: 2,
    renderSVG: () => (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {/* Soil */}
        <path d="M 10 75 Q 50 65 90 75 L 90 90 L 10 90 Z" fill="#7c5c43" />
        {/* Stem */}
        <path d="M 50 72 L 50 48" fill="none" stroke="#68b75c" strokeWidth="5.5" strokeLinecap="round" />
        <path d="M 50 58 Q 60 55 58 50 Q 50 53 50 58" fill="#68b75c" />
        {/* Flower petals (simple clay geometric shapes) */}
        <circle cx="50" cy="38" r="14" fill="#ffd166" />
        <circle cx="36" cy="38" r="9" fill="#ff85a1" />
        <circle cx="64" cy="38" r="9" fill="#ff85a1" />
        <circle cx="50" cy="24" r="9" fill="#ff85a1" />
        <circle cx="50" cy="52" r="9" fill="#ff85a1" />
        {/* Center core */}
        <circle cx="50" cy="38" r="6" fill="#ffd166" />
        {/* Happy smile */}
        <path d="M 47 38 Q 50 41 53 38" fill="none" stroke="#732010" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="46" cy="36" r="1" fill="#732010" />
        <circle cx="54" cy="36" r="1" fill="#732010" />
      </svg>
    )
  }
];

export default function StorySequenceEngine({ childId, onBack }: { childId: string; onBack: () => void }) {
  const [phase, setPhase] = useState<"deconstruction" | "reconstruction" | "celebration" | "finished">("deconstruction");
  
  // Placement state of the pieces
  // Deconstruction: starts in frames, needs to be dragged to basket.
  // Reconstruction: starts in basket, needs to be dragged to correct frames.
  const [placedInFrames, setPlacedInFrames] = useState<Record<string, boolean>>({
    beginning: true,
    middle: true,
    end: true
  });

  const [basketPieces, setBasketPieces] = useState<("beginning" | "middle" | "end")[]>([]);
  const [errorsThisRound, setErrorsThisRound] = useState(0);
  const [startTime] = useState<number>(() => Date.now());

  const getCurrentPrompt = (p: typeof phase) => {
    if (p === "deconstruction") {
      return "Let's clean up! Drag all three picture cards down into the basket.";
    } else if (p === "reconstruction") {
      return "Now let's make the story! Drag the cards back into order. What happened first?";
    } else if (p === "celebration") {
      return "Listen to the story! 🌻";
    }
    return "";
  };

  const currentPrompt = getCurrentPrompt(phase);

  // Refs for collision checks
  const basketRef = useRef<HTMLDivElement>(null);
  const frameRefs = [
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null)
  ];

  // Specific reset key to force components glide-back
  const [resetKey, setResetKey] = useState(0);

  const speakText = useCallback((text: string) => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.85;
      utterance.pitch = 1.2;
      window.speechSynthesis.speak(utterance);
    }
  }, []);

  const handleGameComplete = useCallback(async () => {
    playSynthesizedSound("levelUp");
    setPhase("finished");

    const elapsed = Date.now() - startTime;
    if (childId) {
      try {
        await fetch(`/api/progress/${childId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            targetLetter: "STORY",
            tracingScore: Math.max(0, 100 - errorsThisRound * 20),
            phonemicScore: 100,
            timeSpentMs: elapsed
          })
        });

        await fetch(`/api/badges/${childId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            badgeName: "Storyteller Badge"
          })
        });
      } catch (err) {
        console.error("Telemetry failed:", err);
      }
    }
  }, [childId, errorsThisRound, startTime]);

  const playSequentialStoryVoiceover = useCallback(async () => {
    const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));
    speakText("First, we plant a tiny seed in the soil.");
    await sleep(2800);
    speakText("Second, rain falls and a little green sprout grows.");
    await sleep(3400);
    speakText("Finally, a beautiful colorful flower blooms in the sun!");
    await sleep(3400);
    
    // Complete game
    await handleGameComplete();
  }, [speakText, handleGameComplete]);

  useEffect(() => {
    if (phase === "deconstruction") {
      speakText("Let's clean up! Drag all three picture cards down into the basket.");
    } else if (phase === "reconstruction") {
      speakText("Now let's make the story! Drag the cards back into order. What happened first?");
    }
  }, [phase, speakText]);

  const handleDragEndDeconstruct = (pieceId: "beginning" | "middle" | "end", _event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const dragX = info.point.x;
    const dragY = info.point.y;

    const basketRect = basketRef.current?.getBoundingClientRect();

    if (basketRect && dragX >= basketRect.left && dragX <= basketRect.right && dragY >= basketRect.top && dragY <= basketRect.bottom) {
      // Correctly dropped in basket!
      playSynthesizedSound("pop");
      setPlacedInFrames(prev => ({ ...prev, [pieceId]: false }));
      setBasketPieces(prev => [...prev, pieceId]);

      // Check if all deconstructed
      const remaining = Object.values(placedInFrames).filter(v => v).length - 1;
      if (remaining === 0) {
        setTimeout(() => {
          setPhase("reconstruction");
        }, 800);
      }
    } else {
      // Glide back
      setResetKey(prev => prev + 1);
    }
  };

  const handleDragEndReconstruct = (pieceId: "beginning" | "middle" | "end", _event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const dragX = info.point.x;
    const dragY = info.point.y;

    let matchedFrameIdx: number | null = null;
    const targetPiece = storyPieces.find(p => p.id === pieceId)!;

    // Check collision with the three frames
    frameRefs.forEach((ref, idx) => {
      const rect = ref.current?.getBoundingClientRect();
      if (rect && dragX >= rect.left && dragX <= rect.right && dragY >= rect.top && dragY <= rect.bottom) {
        matchedFrameIdx = idx;
      }
    });

    if (matchedFrameIdx === null) {
      setResetKey(prev => prev + 1);
      return;
    }

    // Magnetic snapping checking target piece order matching frame index
    if (matchedFrameIdx === targetPiece.order) {
      playSynthesizedSound("correct");
      setPlacedInFrames(prev => ({ ...prev, [pieceId]: true }));
      setBasketPieces(prev => prev.filter(p => p !== pieceId));

      // Speak current piece description
      speakText(targetPiece.desc);

      // Check if all reconstructed
      const allReplaced = Object.keys(placedInFrames).every(k => k === pieceId ? true : placedInFrames[k]);
      if (allReplaced) {
        setTimeout(() => {
          setPhase("celebration");
          playSequentialStoryVoiceover();
        }, 1500);
      }
    } else {
      // Incorrect frame drop, glide back to basket
      playSynthesizedSound("wrong");
      setErrorsThisRound(prev => prev + 1);
      setResetKey(prev => prev + 1);
    }
  };

  // handleGameComplete was refactored and moved above

  return (
    <div className="flex flex-col w-full max-w-4xl mx-auto h-full min-h-0 bg-[#fbfbfb] p-4 rounded-[2.5rem] border-[3px] border-white/50 shadow-clay-card relative overflow-hidden select-none">
      
      {/* Background decoration */}
      <div className="absolute -z-10 bg-[#ddcbf5]/30 w-72 h-72 rounded-full blur-[90px] opacity-40 -top-10 -left-10"></div>
      
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
          <BookOpen size={24} className="text-[#7c52c7]" strokeWidth={3.5} />
          Story Sequencer
        </h1>

        <div className="bg-white/80 border-2 border-white/40 shadow-inner px-4 py-2 rounded-full font-black text-[#7c52c7] text-sm tracking-wide">
          {phase === "deconstruction" ? "TIDY UP 🧹" : phase === "reconstruction" ? "MATCH STORY 🧩" : "CELEBRATE 🎉"}
        </div>
      </div>

      {/* Parental Co-Play Banner */}
      <div className="bg-[#ddcbf5]/80 border-2 border-white/50 text-[#3c1e70] p-3 rounded-2xl mb-4 text-center font-bold text-xs sm:text-sm shadow-[inset_-2px_-2px_4px_rgba(0,0,0,0.02),_inset_2px_2px_4px_rgba(255,255,255,0.8)] leading-snug shrink-0">
        <span className="text-[10px] font-black uppercase tracking-wider text-[#7c52c7] block mb-0.5">🧑‍🍼 Parent & Child Co-Play Option</span>
        {"Ask your child: \"What happened first? What did the little sprout need to grow into a beautiful flower?\""}
      </div>

      {/* Victory Dialog overlay */}
      <AnimatePresence>
        {phase === "finished" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-40 bg-black/40 backdrop-blur-md flex items-center justify-center p-6"
          >
            <ClayCard
              variant="purple"
              className="max-w-md w-full p-8 text-center flex flex-col items-center gap-6 border-white/40"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
            >
              <div className="w-20 h-20 rounded-full bg-[#ddcbf5] text-[#3c1e70] text-4xl flex items-center justify-center shadow-clay-purple mb-2">
                🌻
              </div>
              <h2 className="text-3xl font-black text-[#3c1e70] tracking-wide uppercase">Story Complete!</h2>
              <p className="text-sm font-bold text-[#3c1e70]/80 leading-relaxed">
                Beautiful sequencing! You completed the flower growth timeline. You earned the Storyteller Badge!
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

      {/* Game board */}
      <div className="flex-grow flex flex-col justify-between min-h-0 relative z-10">
        
        {/* Instruction audio bar */}
        <div className="w-full bg-white p-3 rounded-2xl border-2 border-white/60 shadow-clay-card flex items-center justify-center gap-3 z-30 mb-4 shrink-0">
          <ClayButton
            variant="surface"
            size="sm"
            onClick={() => speakText(currentPrompt)}
            className="p-2 bg-[#fbfbfb] rounded-full"
          >
            <Volume2 size={20} className="text-[#7c52c7]" strokeWidth={3.5} />
          </ClayButton>
          <span className="text-xs sm:text-sm font-black text-[#4A5358] tracking-wide text-center">
            {currentPrompt}
          </span>
        </div>

        {/* 3 Story Panels (Top row) */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4 shrink-0">
          {storyPieces.map((piece, idx) => {
            const isFilled = placedInFrames[piece.id];
            
            return (
              <div
                key={piece.id}
                ref={frameRefs[idx]}
                className="aspect-square bg-white rounded-3xl border-3 border-dashed border-[#ddcbf5] relative flex flex-col items-center justify-center overflow-visible shadow-[inset_2px_2px_6px_rgba(0,0,0,0.02)]"
              >
                {/* Silhouette index text */}
                {!isFilled && (
                  <span className="text-4xl sm:text-5xl font-black text-[#ddcbf5]/40 select-none">
                    {idx + 1}
                  </span>
                )}

                {/* Snapped Piece inside Frame */}
                {isFilled && (
                  <motion.div
                    key={`${piece.id}-${resetKey}`}
                    drag={phase === "deconstruction"}
                    dragSnapToOrigin={phase === "deconstruction"}
                    dragElastic={0.5}
                    onDragEnd={(e, info) => handleDragEndDeconstruct(piece.id, e, info)}
                    whileDrag={{ scale: 1.15, rotate: -2 }}
                    className="absolute inset-2 bg-white rounded-2xl border-3 border-white shadow-clay-card flex flex-col items-center justify-center p-2 cursor-grab active:cursor-grabbing toddler-target overflow-hidden select-none"
                    style={{ touchAction: "none" }}
                  >
                    {piece.renderSVG()}
                    <span className="text-[9px] font-black text-[#7c52c7] uppercase mt-1 select-none pointer-events-none">
                      {piece.title}
                    </span>
                  </motion.div>
                )}
              </div>
            );
          })}
        </div>

        {/* Puzzle Basket Tray (Bottom drawer) */}
        <div
          ref={basketRef}
          className="flex-grow min-h-[140px] mt-6 bg-[#ddcbf5]/20 border-3 border-dashed border-[#7c52c7]/40 rounded-[2.5rem] flex items-center justify-around p-4 relative shadow-[inset_4px_4px_10px_rgba(0,0,0,0.02)]"
        >
          {/* Basket Label */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-white px-3 py-1 rounded-full border border-white/50 text-[10px] font-black uppercase text-[#7c52c7] tracking-wider pointer-events-none select-none">
            📥 Picture Basket
          </div>

          {/* Draggable pieces floating in the basket */}
          {basketPieces.map(pieceId => {
            const piece = storyPieces.find(p => p.id === pieceId)!;
            
            return (
              <motion.div
                key={`${pieceId}-${resetKey}`}
                drag={phase === "reconstruction"}
                dragSnapToOrigin={true}
                dragElastic={0.65}
                onDragEnd={(e, info) => handleDragEndReconstruct(pieceId, e, info)}
                whileDrag={{ scale: 1.25, rotate: 3 }}
                className="w-24 h-24 bg-white rounded-2xl border-[3px] border-white/60 shadow-clay-card flex flex-col items-center justify-center p-2 cursor-grab active:cursor-grabbing toddler-target overflow-hidden relative z-20 select-none"
                style={{ touchAction: "none" }}
              >
                {piece.renderSVG()}
                <span className="text-[9px] font-black text-[#7c52c7] uppercase mt-1 select-none pointer-events-none">
                  Growth Card
                </span>
              </motion.div>
            );
          })}

          {basketPieces.length === 0 && (
            <span className="text-xs font-black text-[#7c52c7]/40 uppercase tracking-widest select-none pointer-events-none">
              Basket is empty
            </span>
          )}
        </div>

      </div>

    </div>
  );
}
