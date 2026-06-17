"use client";

import React, { useState, useRef } from "react";
import { ArrowLeft, HelpCircle, Trophy } from "@/components/Icons";
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

  const speakText = (text: string) => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.85;
      utterance.pitch = 1.15;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleCardClick = (id: number) => {
    if (gameState !== "playing" || selectedIds.length >= 2) return;
    initAudio();

    const clickedCardIdx = cards.findIndex(c => c.id === id);
    const clickedCard = cards[clickedCardIdx];
    
    if (clickedCard.isFlipped || clickedCard.isMatched) return;

    playFlipSound();

    // Speak flipped card item
    if (clickedCard.type === "letter") {
      speakText(clickedCard.letter);
    } else {
      const obj = objectDictionary[clickedCard.letter];
      speakText(obj ? obj.name : "");
    }

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
          
          const obj = objectDictionary[cardA.letter];
          const objectName = obj ? obj.name : "";
          speakText(`Match! ${cardA.letter} and ${objectName}`);

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
                colors: ["#59a26a", "#eaddfc", "#ffafa6", "#a2ea63"]
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
    <div className="w-full max-w-3xl mx-auto p-3 sm:p-6 clay-card border border-white/20 flex flex-col items-center justify-between h-full min-h-0 relative overflow-hidden">
      {/* Top Bar */}
      <div className="w-full flex justify-between items-center mb-3 sm:mb-4 z-10">
        <button
          onClick={onBack}
          className="flex items-center gap-2 font-black text-xs uppercase px-4 py-2 bg-white border border-white/20 rounded-full clay-btn hover:scale-102 active:scale-96 transition-all cursor-pointer shadow-[3px_3px_6px_rgba(0,0,0,0.04)]"
        >
          <ArrowLeft className="w-4 h-4 text-[#4A5358]" />
          <span>Back</span>
        </button>
        <span className="text-[10px] font-black uppercase tracking-wider text-[#3c1e70]/80 bg-[#e9d5ff]/60 px-3 py-1.5 rounded-full border border-white/20">
          Phonics Match
        </span>
      </div>

      {/* Prompter Banner */}
      <div className="w-full max-w-lg bg-white border border-white/20 rounded-3xl p-3 sm:p-4 mb-4 sm:mb-6 text-center shadow-[4px_4px_12px_rgba(0,0,0,0.04),_inset_2px_2px_4px_rgba(255,255,255,0.85)] relative z-10">
        <p className="text-[10px] font-black text-[#4ecdc4] uppercase tracking-widest mb-1">
          Working Memory
        </p>
        <h2 className="text-xl sm:text-2xl font-black text-[#4A5358] tracking-tight uppercase">
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
                <div className="absolute inset-0 backface-hidden bg-white border border-white/20 rounded-[2rem] flex flex-col items-center justify-center shadow-[6px_6px_12px_rgba(0,0,0,0.05),_inset_-4px_-4px_8px_rgba(0,0,0,0.05),_inset_4px_4px_8px_rgba(255,255,255,0.95)]">
                  <div className="w-12 h-12 rounded-2xl bg-primary/20 border border-white/20 flex items-center justify-center text-primary/70 shadow-[inset_1px_1px_3px_rgba(255,255,255,0.9),_inset_-1px_-1px_3px_rgba(0,0,0,0.03)]">
                    <HelpCircle className="w-7 h-7" />
                  </div>
                </div>

                {/* CARD FRONT */}
                <div 
                  className={`absolute inset-0 backface-hidden rotateY-180 border border-white/20 rounded-[2rem] flex flex-col items-center justify-center shadow-[6px_6px_12px_rgba(0,0,0,0.05),_inset_-4px_-4px_8px_rgba(0,0,0,0.05),_inset_4px_4px_8px_rgba(255,255,255,0.95)] transition-colors duration-300 ${
                    isMatched ? "bg-[#d2f4e6]" : "bg-white"
                  }`}
                >
                  {card.type === "letter" ? (
                    <span className="text-5xl font-black text-[#4A5358] select-none">
                      {card.letter}
                    </span>
                  ) : (
                    <div className="w-[85%] h-[85%] flex flex-col items-center justify-center p-2">
                      <div className="w-full h-full flex items-center justify-center">
                        {React.createElement(obj.icon, { size: "100%" })}
                      </div>
                      {isMatched && (
                        <span className="text-[10px] font-black uppercase text-[#4A5358] mt-1 select-none">
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

      {gameState === "success" && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 bg-[#f3f8fc]/90 backdrop-blur-sm z-20 flex flex-col items-center justify-center p-6"
        >
          <motion.div 
            initial={{ y: 30, scale: 0.8 }}
            animate={{ y: 0, scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="clay-card border border-white/20 p-8 bg-white max-w-sm w-full text-center flex flex-col items-center gap-4"
          >
            <div className="w-20 h-20 rounded-full bg-secondary-container flex items-center justify-center text-secondary shadow-[inset_2px_2px_4px_rgba(255,255,255,0.8),_inset_-2px_-2px_4px_rgba(0,0,0,0.05)] border border-white/10 animate-bounce">
              <Trophy size={40} className="fill-current text-[#4ecdc4]" />
            </div>
            <h3 className="text-2xl font-black text-[#4A5358] uppercase">Awesome Job!</h3>
            <p className="text-sm font-bold text-[#4A5358]/70">You matched all the cards! Get ready for the next round...</p>
          </motion.div>
        </motion.div>
      )}

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
