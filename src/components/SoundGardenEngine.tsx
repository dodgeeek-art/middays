"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { ArrowLeft, Volume2, Trophy } from "@/components/Icons";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { vocabularyList } from "@/lib/svgDictionary";
import MascotSVG from "./MascotSVG";
import ClayButton from "@/components/ui/ClayButton";

interface SoundGardenEngineProps {
  childId: string;
  onBack: () => void;
}

interface SoundItem {
  soundId: string;
  phonemeText: string;
  speakSound: string;
  objects: string[];
}

const SOUNDS_DATA: SoundItem[] = [
  { soundId: "m", phonemeText: "/m/", speakSound: "mmm", objects: ["Moon", "Monkey", "Mushroom"] },
  { soundId: "s", phonemeText: "/s/", speakSound: "sss", objects: ["Sun", "Star", "Snake"] },
  { soundId: "t", phonemeText: "/t/", speakSound: "t t t", objects: ["Turtle", "Tree", "Tomato"] },
  { soundId: "p", phonemeText: "/p/", speakSound: "p p p", objects: ["Pig", "Panda", "Penguin"] },
  { soundId: "b", phonemeText: "/b/", speakSound: "b b b", objects: ["Ball", "Bear", "Banana"] },
  { soundId: "d", phonemeText: "/d/", speakSound: "d d d", objects: ["Dog", "Duck", "Drum"] },
  { soundId: "k", phonemeText: "/k/", speakSound: "k k k", objects: ["Cat", "Cake", "Kite"] },
  { soundId: "f", phonemeText: "/f/", speakSound: "fff", objects: ["Fish", "Frog", "Fox"] },
  { soundId: "a", phonemeText: "/æ/", speakSound: "a a", objects: ["Apple", "Alligator"] },
  { soundId: "o", phonemeText: "/ɒ/", speakSound: "o o", objects: ["Octopus", "Owl"] },
];

const BLOOM_FLOWERS = ["Sunflower", "Rose", "Tulip", "Strawberry", "Cherry", "Banana"];

interface ChoiceItem {
  name: string;
  letter: string;
  icon: React.FC<React.SVGProps<SVGSVGElement> & { size?: string | number; animClass?: string }>;
}

interface RoundData {
  targetSound: SoundItem;
  correctChoice: ChoiceItem;
  choices: ChoiceItem[];
  bloomFlower: string;
}

const getCurrentTime = (): number => Date.now();

// Pure helper function defined outside component scope to comply with React purity rules
function createRound(recentSounds: string[]): RoundData & { nextRecent: string[] } {
  // 1. Select a sound item, excluding recent choices if possible
  let availableSounds = SOUNDS_DATA.filter(s => !recentSounds.includes(s.soundId));
  if (availableSounds.length === 0) {
    availableSounds = SOUNDS_DATA;
  }
  const chosenSound = availableSounds[Math.floor(Math.random() * availableSounds.length)];
  
  // Update recent sounds history
  const nextRecent = [...recentSounds, chosenSound.soundId];
  if (nextRecent.length > 3) nextRecent.shift();

  // 2. Select 1 correct object
  const correctObjectName = chosenSound.objects[Math.floor(Math.random() * chosenSound.objects.length)];
  const correctVocab = vocabularyList.find(v => v.name === correctObjectName)!;
  const correctChoice: ChoiceItem = {
    name: correctVocab.name,
    letter: correctVocab.letter,
    icon: correctVocab.icon
  };

  // 3. Select 2 distractors from different sounds
  const wrongChoices: ChoiceItem[] = [];
  const otherSounds = SOUNDS_DATA.filter(s => s.soundId !== chosenSound.soundId);
  
  // Pick 2 unique other sounds
  const distractorSounds: SoundItem[] = [];
  while (distractorSounds.length < 2) {
    const s = otherSounds[Math.floor(Math.random() * otherSounds.length)];
    if (!distractorSounds.some(ds => ds.soundId === s.soundId)) {
      distractorSounds.push(s);
    }
  }

  // Pick 1 object from each distractor sound
  distractorSounds.forEach(ds => {
    const name = ds.objects[Math.floor(Math.random() * ds.objects.length)];
    const v = vocabularyList.find(vl => vl.name === name)!;
    wrongChoices.push({
      name: v.name,
      letter: v.letter,
      icon: v.icon
    });
  });

  // Shuffle choices
  const choices = [correctChoice, ...wrongChoices].sort(() => Math.random() - 0.5);
  const bloomFlower = BLOOM_FLOWERS[Math.floor(Math.random() * BLOOM_FLOWERS.length)];

  return {
    targetSound: chosenSound,
    correctChoice,
    choices,
    bloomFlower,
    nextRecent
  };
}

export default function SoundGardenEngine({ childId, onBack }: SoundGardenEngineProps) {
  // Lazy state initializers to avoid triggering setState on mount
  const [roundData, setRoundData] = useState<RoundData>(() => createRound([]));
  const [recentSounds, setRecentSounds] = useState<string[]>(() => [roundData.targetSound.soundId]);
  const [roundIndex, setRoundIndex] = useState(0);

  const [gameState, setGameState] = useState<"playing" | "correct-animation" | "celebration">("playing");
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [wrongSelections, setWrongSelections] = useState<number[]>([]);
  const [gardenFlowers, setGardenFlowers] = useState<string[]>([]);
  
  const audioCtxRef = useRef<AudioContext | null>(null);
  const activeUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const roundStartTimeRef = useRef<number>(getCurrentTime());

  // Initialize Web Audio Context
  const initAudio = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext)();
    }
    if (audioCtxRef.current.state === "suspended") {
      audioCtxRef.current.resume();
    }
  };

  // Synthesize positive chime for correct selection
  const playCorrectChime = () => {
    if (!audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    const playNote = (freq: number, start: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, ctx.currentTime + start);
      gain.gain.setValueAtTime(0.18, ctx.currentTime + start);
      gain.gain.exponentialRampToValueAtTime(0.002, ctx.currentTime + start + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + start);
      osc.stop(ctx.currentTime + start + 0.4);
    };
    playNote(523.25, 0);     // C5
    playNote(659.25, 0.08);  // E5
    playNote(783.99, 0.16);  // G5
  };

  // Synthesize soft woodblock plop for wrong selection (neutral feedback)
  const playWrongTap = () => {
    if (!audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(180, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.12);
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.005, ctx.currentTime + 0.12);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.12);
  };

  // Synthesize final celebration chime sequence
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
    playNote(523.25, 0);     // C5
    playNote(587.33, 0.1);   // D5
    playNote(659.25, 0.2);   // E5
    playNote(783.99, 0.3);   // G5
    playNote(880.00, 0.4);   // A5
    playNote(1046.50, 0.5);  // C6
  };

  // Speak text using Web Speech API with slow/warm settings suitable for toddler
  const speakText = useCallback((text: string, pitch: number = 1.15) => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      if (activeUtteranceRef.current) {
        activeUtteranceRef.current.onend = null;
        activeUtteranceRef.current.onerror = null;
        activeUtteranceRef.current = null;
      }
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.78; // Slow rate for 3.5 year olds
      utterance.pitch = pitch;
      activeUtteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    }
  }, []);

  const speakPrompt = useCallback((sound: SoundItem) => {
    // Write phonics representation with spacing for better speech-engine phoneme audio
    speakText(`Find... ${sound.speakSound}... ${sound.speakSound}... ${sound.speakSound}.`);
  }, [speakText]);

  // Play introduction audio prompt when roundIndex or roundData changes
  useEffect(() => {
    if (roundData) {
      const t = setTimeout(() => {
        speakPrompt(roundData.targetSound);
      }, 550);
      return () => clearTimeout(t);
    }
  }, [roundIndex, roundData, speakPrompt]);

  const handleReplayPrompt = () => {
    if (roundData && gameState === "playing") {
      initAudio();
      speakPrompt(roundData.targetSound);
    }
  };

  const saveProgressToDb = async (finalTimeSpentMs: number) => {
    if (!childId) return;
    try {
      // Save record of phonics work
      await fetch(`/api/progress/${childId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetLetter: "M", // Standard letter equivalent to represent Phonics/SoundGarden
          tracingScore: 100,
          phonemicScore: 100,
          timeSpentMs: finalTimeSpentMs
        })
      });

      // Grant Badge
      await fetch(`/api/badges/${childId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          badgeName: "Sound Garden Listener"
        })
      });
    } catch (e) {
      console.error("Telemetry error saving progress:", e);
    }
  };

  const handleCardTap = (index: number) => {
    if (gameState !== "playing" || selectedIdx !== null || wrongSelections.includes(index) || !roundData) return;
    initAudio();
    setSelectedIdx(index);

    const tappedChoice = roundData.choices[index];
    const isCorrect = tappedChoice.name === roundData.correctChoice.name;

    if (isCorrect) {
      // CORRECT
      setGameState("correct-animation");
      playCorrectChime();

      // Auditory Feedback: "Yes! mmm, mmm, Moon!"
      speakText(`Yes!... ${roundData.targetSound.speakSound}... ${roundData.targetSound.speakSound}... ${tappedChoice.name}!`);

      // Grow seedling into flower list
      setGardenFlowers(prev => [...prev, tappedChoice.name]);

      // Move to next step or complete game
      setTimeout(() => {
        if (roundIndex < 4) {
          const nextIndex = roundIndex + 1;
          const nextRound = createRound(recentSounds);
          setRecentSounds(nextRound.nextRecent);
          setRoundData(nextRound);
          setSelectedIdx(null);
          setWrongSelections([]);
          setGameState("playing");
          setRoundIndex(nextIndex);
        } else {
          // CELEBRATION!
          setGameState("celebration");
          playSuccessChime();
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: ["#86efac", "#fcd5ce", "#fef08a", "#bae6fd", "#c084fc"]
          });

          // Telemetry
          const totalTime = getCurrentTime() - roundStartTimeRef.current;
          saveProgressToDb(totalTime);
        }
      }, 3500);

    } else {
      // WRONG
      playWrongTap();
      setWrongSelections(prev => [...prev, index]);
      setSelectedIdx(null);

      // Auditory Feedback: "Good try. Listen again: mmm"
      speakText(`Good try!... Listen again... ${roundData.targetSound.speakSound}.`);

      // Auto replay prompt after delay
      setTimeout(() => {
        // Re-read current round data to check state
        speakPrompt(roundData.targetSound);
      }, 2500);
    }
  };



  return (
    <div className="w-full max-w-3xl mx-auto p-4 sm:p-6 clay-card border border-white/20 flex flex-col items-center justify-between h-full min-h-0 relative overflow-hidden bg-gradient-to-b from-[#e0f2fe] via-[#f0fdf4] to-[#fef08a] rounded-[2.5rem] shadow-clay-card">
      
      {/* Top Navigation / Back */}
      <div className="w-full flex justify-between items-center mb-3 z-10">
        <button
          onClick={onBack}
          className="flex items-center gap-2 font-black text-xs uppercase px-4 py-2.5 bg-white border border-white/40 rounded-full clay-btn hover:scale-102 active:scale-96 transition-all cursor-pointer shadow-sm text-[#4A5358]"
        >
          <ArrowLeft className="w-4 h-4 text-[#4A5358]" />
          <span>Back</span>
        </button>

        <span className="text-[10px] font-black uppercase tracking-wider text-[#16533f] bg-[#bee8d4]/80 px-4 py-2 rounded-full border border-white/40 shadow-sm">
          🌻 Sound Garden
        </span>
      </div>

      {/* Speech Bubble Instruction Section */}
      <div className="w-full max-w-lg flex items-center gap-3 sm:gap-4 mb-4 relative z-10">
        {/* Mascot Avatar on Left */}
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white/90 border-[3px] border-white/70 p-1 flex items-center justify-center shadow-sm shrink-0 select-none">
          <MascotSVG className="w-full h-full filter drop-shadow-sm" />
        </div>

        {/* Speech Bubble pointing to the Mascot Head */}
        <div className="flex-grow bg-white/95 border-[3px] border-white/70 rounded-3xl p-3 sm:p-4 shadow-[4px_6px_16px_rgba(0,0,0,0.04)] relative before:content-[''] before:absolute before:left-[-8px] before:top-1/2 before:-translate-y-1/2 before:w-4 before:h-4 before:bg-white/95 before:border-l-[3px] before:border-b-[3px] before:border-white/70 before:rotate-45">
          <p className="text-[9px] font-black text-[#ff85a1] uppercase tracking-[0.2em] mb-0.5 text-left">
            Buddy says:
          </p>
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg sm:text-xl font-black text-[#2f3e46] tracking-tight uppercase flex items-center gap-2">
              Find {roundData?.targetSound.phonemeText}
            </h2>
            <button
              onClick={handleReplayPrompt}
              disabled={gameState !== "playing"}
              className="w-9 h-9 rounded-full bg-[#ffb5a7] border-white/40 border-[2px] flex items-center justify-center text-white clay-btn shadow-sm active:scale-90 hover:scale-105 transition-all cursor-pointer"
              aria-label="Replay sound instruction"
            >
              <Volume2 className="w-4 h-4 fill-current text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* Central Object Choices Container */}
      <div className="w-full flex-grow flex items-center justify-center z-10 max-h-[380px] mb-4">
        {roundData && (
          <div className="w-full max-w-xl grid grid-cols-3 gap-3.5 sm:gap-6">
            {roundData.choices.map((choice, idx) => {
              const isSelected = selectedIdx === idx;
              const isWrong = wrongSelections.includes(idx);
              const isCorrect = choice.name === roundData.correctChoice.name;

              // Animated wiggle state: Wiggle correct card gently when the child makes a wrong choice
              const mustWiggle = isCorrect && wrongSelections.length > 0 && gameState === "playing";

              return (
                <div key={`${roundIndex}-${idx}-${choice.name}`} className="flex flex-col items-center gap-3 w-full">
                  {/* Choice Card Button */}
                  <motion.button
                    onClick={() => handleCardTap(idx)}
                    disabled={isWrong || gameState !== "playing"}
                    className={`w-full aspect-[3/4] max-h-[190px] focus:outline-none cursor-pointer rounded-[2rem] relative border-[3px] shadow-[4px_6px_12px_rgba(0,0,0,0.03),_inset_-4px_-4px_8px_rgba(0,0,0,0.04),_inset_4px_4px_8px_rgba(255,255,255,0.9)] transition-all duration-300 ${
                      isWrong
                        ? "bg-white/30 border-dashed border-gray-300 opacity-40 grayscale pointer-events-none scale-95"
                        : isSelected && gameState === "correct-animation"
                        ? "bg-[#d2f4e6] border-[#4ecdc4] scale-105 z-20"
                        : "bg-white border-white/60 hover:scale-102 active:scale-95"
                    }`}
                    animate={
                      mustWiggle
                        ? { x: [0, -6, 6, -6, 6, 0] }
                        : isSelected && gameState === "correct-animation"
                        ? { scale: 1.05, rotate: 4 }
                        : {}
                    }
                    transition={
                      mustWiggle
                        ? { type: "keyframes", duration: 0.5, repeat: 1 }
                        : isSelected && gameState === "correct-animation"
                        ? { type: "spring", stiffness: 200, damping: 12 }
                        : { type: "spring", stiffness: 400, damping: 18 }
                    }
                  >
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-3">
                      <AnimatePresence mode="wait">
                        {isSelected && gameState === "correct-animation" ? (
                        <motion.div
                          key="bloom"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                          transition={{ type: "spring", stiffness: 260, damping: 14 }}
                          className="w-full h-full flex flex-col items-center justify-center relative"
                        >


                          {/* Green plant stem growing from bottom */}
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: "30px" }}
                            className="absolute bottom-1 w-2 bg-[#86efac] rounded-full z-0"
                          />

                          {/* The original object icon scaled up in the foreground */}
                          <div className="w-[70%] h-[70%] z-10 flex items-center justify-center select-none pointer-events-none">
                            {React.createElement(choice.icon, { size: "100%" })}
                          </div>

                          <span className="text-[10px] font-black uppercase text-[#16533f] mt-1 text-center bg-white/80 px-2.5 py-0.5 rounded-full border border-[#86efac] z-10">
                            {choice.name}!
                          </span>
                        </motion.div>
                        ) : (
                          <motion.div
                            key="object"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="w-full h-full flex flex-col items-center justify-center"
                          >
                            <div className="w-[85%] h-[85%] flex items-center justify-center select-none pointer-events-none">
                              {React.createElement(choice.icon, { size: "100%" })}
                            </div>
                            {/* Label visible only under correct selection to help Thai child connect shape/sound */}
                            {isSelected && (
                              <span className="text-[10px] font-black uppercase text-[#2f3e46] mt-0.5">
                                {choice.name}
                              </span>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.button>

                  {/* Pronunciation button under card */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // Avoid selecting the card
                      initAudio();
                      speakText(choice.name);
                    }}
                    disabled={isWrong || gameState !== "playing"}
                    className={`w-11 h-11 rounded-full border-[3px] border-white/50 flex items-center justify-center shadow-[2px_3px_6px_rgba(0,0,0,0.05),_inset_2px_2px_4px_rgba(255,255,255,0.9)] transition-all duration-150 active:scale-90 hover:scale-105 cursor-pointer select-none ${
                      isWrong
                        ? "bg-gray-100/40 text-gray-300 pointer-events-none opacity-45"
                        : "bg-white/95 text-[#2f3e46] hover:bg-white"
                    }`}
                    aria-label={`Listen to ${choice.name}`}
                  >
                    <Volume2 className="w-4 h-4 fill-current" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Decorative Bottom Row: Planting & growing garden pots */}
      <div className="w-full max-w-md bg-white/75 backdrop-blur-sm border border-white/50 rounded-3xl p-3 flex flex-col items-center gap-1.5 shadow-sm relative z-10">
        <p className="text-[9px] font-black text-[#5c6b73]/80 uppercase tracking-widest leading-none">
          Your Phonics Garden
        </p>
        
        <div className="grid grid-cols-5 gap-3 w-full justify-items-center">
          {[0, 1, 2, 3, 4].map(idx => {
            const isPlanted = idx < gardenFlowers.length;
            const isCurrent = idx === roundIndex;
            const matchedObjectName = gardenFlowers[idx];

            return (
              <div
                key={`pot-${idx}`}
                className="flex flex-col items-center justify-end w-12 h-[72px] relative"
              >
                {/* Plant or Seed growing inside/above pot */}
                <div className="h-10 w-10 flex items-end justify-center select-none pointer-events-none mb-1">
                  <AnimatePresence mode="wait">
                    {isPlanted ? (
                      <motion.div
                        key="mini-bloom"
                        initial={{ scale: 0, y: 10 }}
                        animate={{ scale: 1.1, y: 0 }}
                        className="w-full h-full flex items-center justify-center relative"
                      >
                        {/* Mini Object Icon */}
                        <div className="w-full h-full z-10 flex items-center justify-center">
                          {(() => {
                            const vocab = vocabularyList.find(v => v.name === matchedObjectName);
                            return vocab ? React.createElement(vocab.icon, { size: "100%" }) : <span>🌱</span>;
                          })()}
                        </div>
                      </motion.div>
                    ) : isCurrent && gameState === "playing" ? (
                      <motion.div
                        key="seedling"
                        animate={{ scale: [0.9, 1.1, 0.9], y: [0, -2, 0] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        className="text-lg flex items-center justify-center mb-1"
                      >
                        🌱
                      </motion.div>
                    ) : (
                      <span key="empty" className="text-xs opacity-25 mb-1">🪹</span>
                    )}
                  </AnimatePresence>
                </div>

                {/* Pot Graphic Base */}
                <div
                  className={`w-10 h-6 rounded-t-md rounded-b-xl border transition-all duration-300 flex items-center justify-center shadow-inner ${
                    isCurrent && gameState === "playing"
                      ? "bg-[#fef08a] border-[#f2c94c] scale-105"
                      : isPlanted
                      ? "bg-[#d7ccc8] border-[#a1887f]"
                      : "bg-gray-100 border-dashed border-gray-300"
                  }`}
                >
                  <span className="text-[10px] select-none opacity-80">🍯</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Success Modal overlay */}
      {gameState === "celebration" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 bg-[#f0fdf4]/90 backdrop-blur-sm z-30 flex flex-col items-center justify-center p-6"
        >
          <motion.div
            initial={{ y: 50, scale: 0.8 }}
            animate={{ y: 0, scale: 1 }}
            transition={{ type: "spring", stiffness: 220, damping: 14 }}
            className="bg-white border-white/60 border-[4px] rounded-[2.5rem] p-8 max-w-sm w-full text-center flex flex-col items-center gap-5 shadow-clay-card"
          >
            <div className="w-20 h-20 rounded-full bg-[#fef08a] flex items-center justify-center shadow-clay-btn animate-bounce border-[3px] border-white/40">
              <Trophy size={40} className="text-[#d4a919] fill-current" />
            </div>

            <div>
              <h3 className="text-2xl font-black text-[#16533f] uppercase tracking-wide">
                Great Listening!
              </h3>
              <p className="text-sm font-bold text-[#4A5358]/80 mt-2 leading-relaxed">
                You grew a beautiful Sound Garden! 🌸🌻🌷
              </p>
            </div>

            <div className="flex flex-col gap-2 w-full mt-2">
              <ClayButton variant="primary" onClick={onBack}>
                Done playing
              </ClayButton>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
