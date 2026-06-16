"use client";

import React, { useState, useRef } from "react";
import { ArrowLeft, HelpCircle } from "lucide-react";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import { objectDictionary } from "@/lib/svgDictionary";

interface PhonicsMatchEngineProps {
  childId: string;
  onBack: () => void;
}

interface CardItem {
  id: number;
  type: "letter" | "object";
  letter: string;
  isFlipped: boolean;
  isMatched: boolean;
}

// Pure helper function outside the component scope to calculate time
const getCurrentTime = (): number => Date.now();

function generateBoardCards(): CardItem[] {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  
  // Pick 3 random letters for a simple 6-card game
  const selectedLetters: string[] = [];
  while (selectedLetters.length < 3) {
    const char = letters[Math.floor(Math.random() * letters.length)];
    if (!selectedLetters.includes(char)) {
      selectedLetters.push(char);
    }
  }

  // Create cards
  let cardId = 0;
  const newCards: CardItem[] = [];
  selectedLetters.forEach(l => {
    newCards.push({ id: cardId++, type: "letter", letter: l, isFlipped: false, isMatched: false });
    newCards.push({ id: cardId++, type: "object", letter: l, isFlipped: false, isMatched: false });
  });

  return newCards.sort(() => Math.random() - 0.5);
}

export default function PhonicsMatchEngine({ childId, onBack }: PhonicsMatchEngineProps) {
  const [cards, setCards] = useState<CardItem[]>(() => generateBoardCards());
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [roundStartTime, setRoundStartTime] = useState<number>(() => getCurrentTime());
  const [gameState, setGameState] = useState<"playing" | "success">("playing");
  
  const audioCtxRef = useRef<AudioContext | null>(null);

  const initAudio = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext)();
    }
    if (audioCtxRef.current.state === "suspended") {
      audioCtxRef.current.resume();
    }
  };

  const playFlipSound = () => {
    if (!audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    
    // Soft wooden slide/tock sound
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = "triangle";
    osc.frequency.setValueAtTime(280, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.08);
    
    gain.gain.setValueAtTime(0.18, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.005, ctx.currentTime + 0.08);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.08);
  };

  const playMatchSound = () => {
    if (!audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    
    // Warm chime
    const playNote = (freq: number, start: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, ctx.currentTime + start);
      gain.gain.setValueAtTime(0.15, ctx.currentTime + start);
      gain.gain.exponentialRampToValueAtTime(0.002, ctx.currentTime + start + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + start);
      osc.stop(ctx.currentTime + start + 0.35);
    };

    playNote(523.25, 0); // C5
    playNote(659.25, 0.08); // E5
  };

  const playSuccessChime = () => {
    if (!audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    
    const playNote = (freq: number, delay: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, ctx.currentTime + delay);
      gain.gain.setValueAtTime(0.15, ctx.currentTime + delay);
      gain.gain.exponentialRampToValueAtTime(0.002, ctx.currentTime + delay + 0.45);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + delay);
      osc.stop(ctx.currentTime + delay + 0.5);
    };

    // Pentatonic scale
    playNote(523.25, 0);     // C5
    playNote(587.33, 0.1);   // D5
    playNote(659.25, 0.2);   // E5
    playNote(783.99, 0.3);   // G5
    playNote(880.00, 0.4);   // A5
  };

  const startNewBoard = () => {
    initAudio();
    setCards(generateBoardCards());
    setSelectedIds([]);
    setGameState("playing");
    setRoundStartTime(getCurrentTime());
  };

  const saveProgress = async (letters: string[], timeSpent: number) => {
    if (childId) {
      try {
        const uniqueLetters = Array.from(new Set(letters));
        for (const l of uniqueLetters) {
          await fetch(`/api/progress/${childId}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              targetLetter: l,
              tracingScore: 100,
              phonemicScore: 100,
              timeSpentMs: Math.floor(timeSpent / uniqueLetters.length)
            })
          });
        }

        await fetch(`/api/badges/${childId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            badgeName: `Match Maker ${uniqueLetters.join("-")}`
          })
        });
      } catch (e) {
        console.error("Telemetry error:", e);
      }
    }
  };

  const handleCardClick = (id: number) => {
    if (gameState !== "playing" || selectedIds.length >= 2) return;
    initAudio();

    const clickedCardIdx = cards.findIndex(c => c.id === id);
    const clickedCard = cards[clickedCardIdx];
    
    if (clickedCard.isFlipped || clickedCard.isMatched) return;

    playFlipSound();

    // Flip card
    setCards(prev => prev.map(c => c.id === id ? { ...c, isFlipped: true } : c));
    const newSelected = [...selectedIds, id];
    setSelectedIds(newSelected);

    if (newSelected.length === 2) {
      const cardA = cards.find(c => c.id === newSelected[0])!;
      const cardB = clickedCard;

      if (cardA.letter === cardB.letter) {
        // MATCH!
        setTimeout(() => {
          playMatchSound();
          setCards(prev => prev.map(c => c.letter === cardA.letter ? { ...c, isMatched: true } : c));
          setSelectedIds([]);
          
          // Check if all matched
          setCards(prev => {
            const allMatched = prev.every(c => c.isMatched || c.letter === cardA.letter);
            if (allMatched) {
              setGameState("success");
              playSuccessChime();
              confetti({
                particleCount: 60,
                spread: 50,
                origin: { y: 0.6 },
                colors: ["#8E9F85", "#C8D3C4", "#FAF5EB", "#E5B6A8"]
              });
              
              const timeSpent = getCurrentTime() - roundStartTime;
              saveProgress(prev.map(c => c.letter), timeSpent);
              
              // Automatically reset after 3 seconds
              setTimeout(() => {
                startNewBoard();
              }, 3000);
            }
            return prev;
          });
        }, 600);
      } else {
        // MISMATCH
        setTimeout(() => {
          setCards(prev => prev.map(c => newSelected.includes(c.id) ? { ...c, isFlipped: false } : c));
          setSelectedIds([]);
        }, 1500);
      }
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto bg-[#FAF9F5] border-2 border-[#3A413A] rounded-[2.5rem] p-5 sm:p-8 shadow-[4px_4px_0px_0px_rgba(58,65,58,1)] flex flex-col items-center justify-between min-h-[72vh] md:min-h-[78vh] relative overflow-hidden">
      {/* Top Bar */}
      <div className="w-full flex justify-between items-center mb-3 sm:mb-4 z-10">
        <button
          onClick={onBack}
          className="flex items-center gap-2 font-black text-xs uppercase px-4 py-2 bg-white border-2 border-[#3A413A] rounded-full shadow-[2px_2px_0px_0px_rgba(58,65,58,1)] active:translate-y-0.5 active:shadow-[1px_1px_0px_0px_rgba(58,65,58,1)] transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>
        <span className="text-[10px] font-black uppercase tracking-wider text-[#3A413A]/50 bg-[#E8E4D9]/40 px-3 py-1.5 rounded-full border border-[#3A413A]/10">
          Phonics Match
        </span>
      </div>

      {/* Prompter Banner */}
      <div className="w-full max-w-lg bg-white border-2 border-[#3A413A] rounded-3xl p-3 sm:p-4 mb-4 sm:mb-6 text-center shadow-[3px_3px_0px_0px_rgba(58,65,58,1)] relative z-10">
        <p className="text-[10px] font-black text-[#8E9F85] uppercase tracking-widest mb-1">
          Working Memory
        </p>
        <h2 className="text-xl sm:text-2xl font-black text-[#3A413A] tracking-tight uppercase">
          Match the letters to their sounds!
        </h2>
      </div>

      {/* 2x3 Grid layout */}
      <div className="w-full max-w-xl grid grid-cols-3 gap-4 sm:gap-6 z-10 mb-4">
        {cards.map(card => {
          const isFlipped = card.isFlipped || card.isMatched;
          const isMatched = card.isMatched;
          const obj = objectDictionary[card.letter];

          return (
            <button
              key={card.id}
              onClick={() => handleCardClick(card.id)}
              disabled={isMatched}
              className="relative aspect-[4/5] rounded-[2rem] focus:outline-none perspective-1000 cursor-pointer"
            >
              {/* Inner container to hold card faces */}
              <motion.div
                className="w-full h-full duration-500 preserve-3d relative"
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ type: "spring", stiffness: 150, damping: 15 }}
              >
                {/* CARD BACK */}
                <div className="absolute inset-0 backface-hidden bg-white border-2 border-[#3A413A] rounded-[2rem] flex flex-col items-center justify-center shadow-[3px_3px_0px_0px_rgba(58,65,58,1)]">
                  <div className="w-10 h-10 rounded-2xl bg-[#C8D3C4]/30 border border-[#3A413A]/20 flex items-center justify-center text-[#3A413A]/50">
                    <HelpCircle className="w-6 h-6" />
                  </div>
                </div>

                {/* CARD FRONT */}
                <div 
                  className={`absolute inset-0 backface-hidden rotateY-180 border-2 border-[#3A413A] rounded-[2rem] flex flex-col items-center justify-center shadow-[3px_3px_0px_0px_rgba(58,65,58,1)] transition-colors duration-300 ${
                    isMatched ? "bg-[#C8D3C4]" : "bg-white"
                  }`}
                >
                  {card.type === "letter" ? (
                    <span className="text-5xl font-black text-[#3A413A] select-none">
                      {card.letter}
                    </span>
                  ) : (
                    <div className="w-[85%] h-[85%] flex flex-col items-center justify-center p-2">
                      <div className="w-full h-full flex items-center justify-center">
                        {React.createElement(obj.icon, { size: "100%" })}
                      </div>
                      {isMatched && (
                        <span className="text-[10px] font-black uppercase text-[#3A413A] mt-1 select-none">
                          {obj.name}
                        </span>
                      )}
                    </div>
                  )}
                </div>

              </motion.div>
            </button>
          );
        })}
      </div>

      {/* Custom styles for Backface Hidden and 3D Rotation */}
      <style>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        .preserve-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
        }
        .rotateY-180 {
          transform: rotateY(180deg);
        }
      `}</style>
    </div>
  );
}
