"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { ArrowLeft, Volume2, CheckCircle2 } from "@/components/Icons";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { vocabularyList, VocabularyItem } from "@/lib/svgDictionary";
import MascotSVG from "./MascotSVG";
import ClayButton from "@/components/ui/ClayButton";
import { playSynthesizedSound } from "@/lib/audio";

interface SoundScavengerEngineProps {
  childId: string;
  onBack: () => void;
}

interface ItemChoice {
  letter: string;
  name: string;
  icon: React.FC<{ size?: string | number } & React.SVGProps<SVGSVGElement>>;
}

interface RoundData {
  targetName: string;
  choices: ItemChoice[];
}

// Pure helper function outside the component scope to calculate time
const getCurrentTime = (): number => Date.now();

function generateRoundData(): RoundData {
  const targetItem = vocabularyList[Math.floor(Math.random() * vocabularyList.length)];
  
  // Gather 8 distinct wrong choices
  const wrongList: VocabularyItem[] = [];
  while (wrongList.length < 8) {
    const item = vocabularyList[Math.floor(Math.random() * vocabularyList.length)];
    if (item.name !== targetItem.name && !wrongList.some(w => w.name === item.name)) {
      wrongList.push(item);
    }
  }

  const choicesList: ItemChoice[] = [
    { letter: targetItem.letter, name: targetItem.name, icon: targetItem.icon },
    ...wrongList.map(item => ({
      letter: item.letter,
      name: item.name,
      icon: item.icon
    }))
  ];

  return {
    targetName: targetItem.name,
    choices: choicesList.sort(() => Math.random() - 0.5)
  };
}

export default function SoundScavengerEngine({ childId, onBack }: SoundScavengerEngineProps) {
  const [roundData, setRoundData] = useState<RoundData>(() => generateRoundData());
  const [gameState, setGameState] = useState<"playing" | "success">("playing");
  const [roundStartTime, setRoundStartTime] = useState<number>(() => getCurrentTime());
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [wrongSelections, setWrongSelections] = useState<number[]>([]);
  
  const activeUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const speakText = useCallback((text: string, pitch: number = 1.0) => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      if (activeUtteranceRef.current) {
        activeUtteranceRef.current.onend = null;
        activeUtteranceRef.current.onerror = null;
        activeUtteranceRef.current = null;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.85;
      utterance.pitch = pitch;

      activeUtteranceRef.current = utterance;

      utterance.onend = () => {
        if (activeUtteranceRef.current === utterance) {
          activeUtteranceRef.current = null;
        }
      };
      utterance.onerror = () => {
        if (activeUtteranceRef.current === utterance) {
          activeUtteranceRef.current = null;
        }
      };

      window.speechSynthesis.speak(utterance);
    }
  }, []);

  const speakCommand = useCallback(() => {
    speakText(`Find ${roundData.targetName}`, 1.1);
  }, [roundData.targetName, speakText]);

  useEffect(() => {
    const t = setTimeout(() => {
      speakCommand();
    }, 400);
    return () => clearTimeout(t);
  }, [roundData.targetName, speakCommand]);

  const startNewRound = () => {
    setRoundData(generateRoundData());
    setSelectedIdx(null);
    setWrongSelections([]);
    setGameState("playing");
    setRoundStartTime(getCurrentTime());
  };

  const saveProgress = async (timeSpent: number, targetName: string) => {
    if (childId) {
      try {
        await fetch(`/api/progress/${childId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            targetLetter: targetName,
            tracingScore: 100,
            phonemicScore: 100,
            timeSpentMs: timeSpent
          })
        });

        await fetch(`/api/badges/${childId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            badgeName: `Scavenger Finder ${targetName}`
          })
        });
      } catch (e) {
        console.error("Telemetry error:", e);
      }
    }
  };

  const handleChoiceClick = (idx: number) => {
    if (gameState !== "playing" || selectedIdx !== null || wrongSelections.includes(idx)) return;

    const choice = roundData.choices[idx];
    if (choice.name === roundData.targetName) {
      // Correct match!
      setSelectedIdx(idx);
      playSynthesizedSound("correct");
      
      speakText(`Excellent! ${choice.name}`, 1.15);

      const timeSpent = getCurrentTime() - roundStartTime;
      
      setTimeout(() => {
        setGameState("success");
        confetti({
          particleCount: 50,
          spread: 50,
          origin: { y: 0.6 },
          colors: ["#59a26a", "#eaddfc", "#ffafa6", "#a2ea63"]
        });
        
        saveProgress(timeSpent, roundData.targetName);
        
        // Advance to next round
        setTimeout(() => {
          startNewRound();
        }, 2200);
      }, 800);
    } else {
      // Incorrect match
      playSynthesizedSound("wrong");
      setWrongSelections(prev => [...prev, idx]);
    }
  };



  return (
    <div className="w-full max-w-3xl mx-auto p-3 sm:p-6 clay-card border border-white/20 flex flex-col items-center justify-between h-full min-h-0 relative overflow-hidden scavenger-container">
      {/* Top Bar */}
      <div className="w-full flex justify-between items-center mb-3 sm:mb-4 z-10">
        <ClayButton
          variant="surface"
          size="icon"
          className="min-w-[64px] min-h-[64px]"
          onClick={onBack}
        >
          <ArrowLeft size={28} strokeWidth={3.5} />
        </ClayButton>
        <span className="text-[10px] font-black uppercase tracking-wider text-[#0b4a45]/80 bg-[#bfdbfe]/50 px-4 py-2 rounded-full border border-white/20">
          Sound Scavenger
        </span>
      </div>

      {/* Mascot Command (Hovering Mascot + Speech Bubble next to it, no surrounding card box) */}
      <div 
        onClick={speakCommand}
        className="w-full max-w-xl flex items-center gap-4 mb-4 sm:mb-6 z-10 cursor-pointer select-none active:scale-[0.99] transition-all scavenger-mascot-command"
      >
        {/* Hovering Mascot SVG */}
        <div className="w-16 h-16 sm:w-24 sm:h-24 shrink-0 drop-shadow-md scavenger-mascot">
          <MascotSVG className="w-full h-full" />
        </div>
        
        {/* Speech Bubble */}
        <div className="flex-1 relative bg-white border border-[#4a5358]/10 p-3.5 sm:p-4 rounded-[2rem] shadow-[4px_4px_12px_rgba(0,0,0,0.03),_inset_2px_2px_4px_rgba(255,255,255,0.9)] text-left scavenger-speech-bubble">
          {/* Bubble Tail */}
          <div className="absolute top-1/2 -left-3 -translate-y-1/2 w-0 h-0 border-t-[8px] border-t-transparent border-r-[12px] border-r-white border-b-[8px] border-b-transparent filter drop-shadow-[-1px_0_0_rgba(74,83,88,0.06)] scavenger-bubble-tail"></div>
          
          <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-0.5">
            Guide says:
          </p>
          <h2 className="text-sm sm:text-base font-black text-[#4A5358] tracking-tight uppercase flex items-center gap-1.5 flex-wrap">
            <span>Find the</span>
            <span className="inline-flex items-center justify-center px-3 py-0.5 bg-[#d2f4e6] border border-white/20 rounded-xl text-[#0b4a45] font-black shadow-sm">
              {roundData.targetName}
              <Volume2 className="w-3.5 h-3.5 ml-1" />
            </span>
          </h2>
        </div>
      </div>

      {/* Grid of Choices */}
      <div className="w-full flex-grow grid grid-cols-3 gap-2.5 sm:gap-4 max-w-2xl mx-auto py-2 min-h-0 justify-items-center items-center scavenger-grid">
        {roundData.choices.map((choice, idx) => {
          const isWrong = wrongSelections.includes(idx);
          const isSelected = selectedIdx === idx;
          
          const cardColors = [
            "bg-[#ffcad4] border-[#ffb3c1]/40", // Pink
            "bg-[#c3f2ec] border-[#b2ebe2]/40", // Mint
            "bg-[#f5e4a3] border-[#ebd787]/40", // Yellow
            "bg-[#ddcbf5] border-[#ceb5f2]/40", // Purple
            "bg-[#b5cce6] border-[#9cbcdb]/40", // Blue
          ];
          const cardColor = isWrong 
            ? "bg-[#E8E4D9]/20 border-white/20 opacity-30" 
            : isSelected 
              ? "bg-[#d2f4e6] border-[#4ecdc4]/40" 
              : cardColors[idx % cardColors.length];

          return (
            <motion.button
              key={choice.letter + "-" + idx}
              whileHover={gameState === "playing" && !isWrong ? { scale: 1.04, rotate: 1 } : {}}
              whileTap={gameState === "playing" && !isWrong ? { scale: 0.95, y: 4 } : {}}
              onClick={() => handleChoiceClick(idx)}
              disabled={gameState !== "playing" || isWrong}
              className={`w-full aspect-square max-w-[110px] sm:max-w-[160px] rounded-[1.5rem] sm:rounded-[2rem] border-[3px] sm:border-[4px] p-2.5 sm:p-4 flex flex-col items-center justify-center transition-all duration-300 relative shadow-clay-card scavenger-button ${cardColor}`}
              animate={isWrong ? { rotate: [0, -6, 6, -6, 6, 0] } : {}}
              transition={{ type: "tween", duration: 0.4 }}
            >
              {/* SVG Icon */}
              <div className={`w-[60%] h-[60%] flex items-center justify-center transition-transform duration-500 ${isSelected ? "scale-110" : ""}`}>
                {React.createElement(choice.icon, { size: "100%" })}
              </div>

              {/* Subtitle name (appears on correct tap or after round) */}
              <span className={`text-[9px] sm:text-xs font-black uppercase tracking-wider mt-1.5 transition-opacity duration-300 ${
                isSelected || gameState === "success" ? "opacity-100 text-[#4A5358]" : "opacity-0"
              }`}>
                {choice.name}
              </span>

              {/* Success Overlay Indicator */}
              {isSelected && (
                <div className="absolute top-1 right-1 sm:top-3 sm:right-3 bg-white border border-slate-100 rounded-full p-0.5 sm:p-1 shadow-md text-[#4ecdc4] animate-clay-bounce">
                  <CheckCircle2 className="w-4 h-4 sm:w-6 sm:h-6 fill-[#d2f4e6] stroke-[#0b4a45]" strokeWidth={3.5} />
                </div>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Ambient Zen Wave Decor */}
      <div className="absolute -bottom-16 -right-16 w-48 h-48 rounded-full border border-white/5 bg-gradient-to-tr from-[#ffcad4]/10 to-[#FAF5EC]/10 pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-64 h-64 rounded-full border border-white/5 bg-gradient-to-tr from-[#ffafa6]/5 to-[#FAF5EC]/10 pointer-events-none" />

      <style>{`
        @media (max-height: 740px) {
          .scavenger-container {
            padding: 0.5rem !important;
          }
          .scavenger-mascot-command {
            margin-bottom: 0.5rem !important;
            gap: 0.5rem !important;
          }
          .scavenger-mascot {
            width: 3.5rem !important;
            height: 3.5rem !important;
          }
          .scavenger-speech-bubble {
            padding: 0.5rem 1rem !important;
            border-radius: 1.25rem !important;
          }
          .scavenger-grid {
            gap: 0.5rem !important;
            padding-top: 0.25rem !important;
            padding-bottom: 0.25rem !important;
          }
          .scavenger-button {
            max-width: 90px !important;
            border-radius: 1.25rem !important;
            border-width: 2px !important;
            padding: 0.5rem !important;
          }
          .scavenger-button span {
            font-size: 8px !important;
            margin-top: 0.25rem !important;
          }
        }
        @media (max-height: 560px) {
          .scavenger-mascot {
            display: none !important;
          }
          .scavenger-bubble-tail {
            display: none !important;
          }
          .scavenger-container {
            padding: 0.25rem !important;
          }
          .scavenger-grid {
            gap: 0.25rem !important;
          }
          .scavenger-button {
            max-width: 75px !important;
          }
        }
      `}</style>
    </div>
  );
}
