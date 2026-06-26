"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { ArrowLeft, Volume2, Trophy } from "@/components/Icons";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { 
  CartoonSVG, 
  vocabularyList
} from "@/lib/svgDictionary";
import MascotSVG from "./MascotSVG";
import ClayButton from "@/components/ui/ClayButton";
import { playSynthesizedSound } from "@/lib/audio";

interface MagicSoundBubblesEngineProps {
  childId: string;
  onBack: () => void;
}

interface SoundItem {
  soundId: string;
  phonemeText: string;
  speakSound: string;
  targetLetter: string;
  objects: string[];
}

const SOUNDS_DATA: SoundItem[] = [
  { soundId: "m", phonemeText: "/m/", speakSound: "mmm", targetLetter: "M", objects: ["Moon", "Monkey", "Milk"] },
  { soundId: "s", phonemeText: "/s/", speakSound: "sss", targetLetter: "S", objects: ["Sun", "Star", "Snake"] },
  { soundId: "t", phonemeText: "/t/", speakSound: "t, t, t", targetLetter: "T", objects: ["Turtle", "Tiger", "Tree"] },
  { soundId: "p", phonemeText: "/p/", speakSound: "p, p, p", targetLetter: "P", objects: ["Pig", "Panda", "Pizza"] },
  { soundId: "b", phonemeText: "/b/", speakSound: "b, b, b", targetLetter: "B", objects: ["Ball", "Bear", "Banana"] },
  { soundId: "d", phonemeText: "/d/", speakSound: "d, d, d", targetLetter: "D", objects: ["Dog", "Duck", "Drum"] },
  { soundId: "k", phonemeText: "/k/", speakSound: "k, k, k", targetLetter: "K", objects: ["Cat", "Cake", "Kite"] },
  { soundId: "f", phonemeText: "/f/", speakSound: "fff", targetLetter: "F", objects: ["Fish", "Frog", "Flower"] },
  { soundId: "a", phonemeText: "/æ/", speakSound: "short a sound, ah", targetLetter: "A", objects: ["Apple", "Ant", "Alligator"] },
  { soundId: "o", phonemeText: "/ɒ/", speakSound: "short o sound, owh", targetLetter: "O", objects: ["Octopus", "Orange", "Owl"] }
];

// --- Custom Local SVG Placeholders ---

const Milk = (props: React.SVGProps<SVGSVGElement> & { size?: number | string }) => (
  <CartoonSVG animClass="anim-float" {...props}>
    <g fill="none" strokeWidth="1.5">
      <rect x="7" y="10" width="18" height="17" rx="3" fill="#cbd5e1" stroke="#94a3b8" />
      <path d="M7 10 L16 3 L25 10 Z" fill="#cbd5e1" stroke="#94a3b8" strokeLinejoin="round" />
      <ellipse cx="16" cy="18" rx="5" ry="4" fill="#ffffff" />
      <path d="M18 3 L22 -2" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" />
    </g>
  </CartoonSVG>
);

const Tiger = (props: React.SVGProps<SVGSVGElement> & { size?: number | string }) => (
  <CartoonSVG animClass="anim-breathe" {...props}>
    <g fill="none">
      <circle cx="16" cy="16" r="11" fill="#f97316" />
      <circle cx="7" cy="8" r="4.5" fill="#f97316" />
      <circle cx="7" cy="8" r="2.5" fill="#ffedd5" />
      <circle cx="25" cy="8" r="4.5" fill="#f97316" />
      <circle cx="25" cy="8" r="2.5" fill="#ffedd5" />
      <ellipse cx="11" cy="20" rx="3" ry="2.5" fill="#ffedd5" />
      <ellipse cx="21" cy="20" rx="3" ry="2.5" fill="#ffedd5" />
      <circle cx="11" cy="14" r="2" fill="#1e293b" />
      <circle cx="21" cy="14" r="2" fill="#1e293b" />
      <path d="M6 14 L10 15" stroke="#1e293b" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M26 14 L22 15" stroke="#1e293b" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M13 6 L14 10" stroke="#1e293b" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M19 6 L18 10" stroke="#1e293b" strokeWidth="1.5" strokeLinecap="round" />
      <polygon points="15,18 17,18 16,19.5" fill="#f43f5e" />
      <path d="M14.5 21 C15.5 22 16.5 22 17.5 21" stroke="#1e293b" strokeWidth="1.5" strokeLinecap="round" />
    </g>
  </CartoonSVG>
);

const Flower = (props: React.SVGProps<SVGSVGElement> & { size?: number | string }) => (
  <CartoonSVG animClass="anim-sway" {...props}>
    <g fill="none">
      <path d="M16 22 L16 30" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M16 26 Q12 25 11 22" stroke="#22c55e" strokeWidth="2.0" strokeLinecap="round" fill="none" />
      <path d="M16 28 Q20 27 21 24" stroke="#22c55e" strokeWidth="2.0" strokeLinecap="round" fill="none" />
      <circle cx="16" cy="8" r="4.5" fill="#ec4899" />
      <circle cx="16" cy="24" r="4.5" fill="#ec4899" />
      <circle cx="8" cy="16" r="4.5" fill="#ec4899" />
      <circle cx="24" cy="16" r="4.5" fill="#ec4899" />
      <circle cx="10" cy="10" r="4.5" fill="#db2777" />
      <circle cx="22" cy="10" r="4.5" fill="#db2777" />
      <circle cx="10" cy="22" r="4.5" fill="#db2777" />
      <circle cx="22" cy="22" r="4.5" fill="#db2777" />
      <circle cx="16" cy="16" r="6.5" fill="#fbbf24" stroke="#d97706" strokeWidth="1" />
      <circle cx="14" cy="15" r="1" fill="#78350f" />
      <circle cx="18" cy="15" r="1" fill="#78350f" />
      <path d="M14 18 Q16 19.5 18 18" stroke="#78350f" strokeWidth="1.2" strokeLinecap="round" />
    </g>
  </CartoonSVG>
);

const Ant = (props: React.SVGProps<SVGSVGElement> & { size?: number | string }) => (
  <CartoonSVG animClass="anim-float" {...props}>
    <g fill="none">
      <path d="M10 20 L4 23" stroke="#334155" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M16 20 L16 25" stroke="#334155" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M22 20 L28 23" stroke="#334155" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M10 20 L4 17" stroke="#334155" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M16 20 L16 15" stroke="#334155" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M22 20 L28 17" stroke="#334155" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="8" cy="19" r="4.5" fill="#1e293b" />
      <ellipse cx="16" cy="19" rx="3.5" ry="3" fill="#334155" />
      <ellipse cx="23" cy="19" rx="5.5" ry="4.5" fill="#1e293b" />
      <path d="M6 16 Q3 12 1 14" stroke="#1e293b" strokeWidth="1.2" strokeLinecap="round" fill="none" />
      <path d="M8 16 Q9 11 11 12" stroke="#1e293b" strokeWidth="1.2" strokeLinecap="round" fill="none" />
      <circle cx="5" cy="17.5" r="1.2" fill="#ffffff" />
      <circle cx="8" cy="17.5" r="0.8" fill="#ffffff" />
    </g>
  </CartoonSVG>
);

const Orange = (props: React.SVGProps<SVGSVGElement> & { size?: number | string }) => (
  <CartoonSVG animClass="anim-breathe" {...props}>
    <g fill="none">
      <circle cx="16" cy="17" r="11" fill="#f97316" />
      <path d="M16 6 Q18 2 17 1" stroke="#78350f" strokeWidth="2.0" strokeLinecap="round" fill="none" />
      <path d="M17 4 C21 2 24 5 21 8 C18 9 17 6 17 4 Z" fill="#22c55e" />
      <circle cx="10" cy="13" r="0.8" fill="#ea580c" />
      <circle cx="22" cy="14" r="0.8" fill="#ea580c" />
      <circle cx="13" cy="22" r="0.8" fill="#ea580c" />
      <circle cx="19" cy="22" r="0.8" fill="#ea580c" />
      <circle cx="13" cy="16" r="1.5" fill="#1e293b" />
      <circle cx="19" cy="16" r="1.5" fill="#1e293b" />
      <path d="M14.5 19 C15.5 20.2 16.5 20.2 17.5 19" stroke="#1e293b" strokeWidth="1.2" strokeLinecap="round" />
    </g>
  </CartoonSVG>
);

function getObjectIcon(name: string): React.FC<React.SVGProps<SVGSVGElement> & { size?: number | string }> {
  if (name === "Milk") return Milk;
  if (name === "Tiger") return Tiger;
  if (name === "Flower") return Flower;
  if (name === "Ant") return Ant;
  if (name === "Orange") return Orange;

  const found = vocabularyList.find(v => v.name.toLowerCase() === name.toLowerCase());
  if (found) {
    return found.icon as React.FC<React.SVGProps<SVGSVGElement> & { size?: number | string }>;
  }
  return () => null;
}

interface ChoiceItem {
  name: string;
  icon: React.FC<React.SVGProps<SVGSVGElement> & { size?: number | string }>;
  isCorrect: boolean;
}

interface RoundData {
  targetSound: SoundItem;
  correctObject: string;
  choices: ChoiceItem[];
}

function selectPreferredVoice(): SpeechSynthesisVoice | null {
  if (typeof window === "undefined" || !window.speechSynthesis) return null;
  const voices = window.speechSynthesis.getVoices();
  if (voices.length === 0) return null;

  const enVoices = voices.filter(v => v.lang.toLowerCase().startsWith("en"));
  const noveltyVoices = [
    "albert", "bad news", "bahh", "bells", "boing", "bubbles", "cellos",
    "deranged", "good news", "hysterical", "pipe organ", "trinoids",
    "whisper", "wobble", "zarvox"
  ];
  const clearVoices = enVoices.filter(v => {
    const name = v.name.toLowerCase();
    return !noveltyVoices.some(nv => name.includes(nv));
  });

  const priorityNames = ["google us english", "google uk english female", "samantha", "alex", "daniel", "karen"];
  for (const pName of priorityNames) {
    const found = clearVoices.find(v => v.name.toLowerCase().includes(pName));
    if (found) return found;
  }

  return clearVoices[0] || enVoices[0] || voices[0] || null;
}

function generateRound(recentSoundIds: string[]): RoundData {
  let availableSounds = SOUNDS_DATA;
  if (recentSoundIds.length >= 2 && recentSoundIds[0] === recentSoundIds[1]) {
    availableSounds = SOUNDS_DATA.filter(s => s.soundId !== recentSoundIds[0]);
  }
  const targetSound = availableSounds[Math.floor(Math.random() * availableSounds.length)];

  const correctObject = targetSound.objects[Math.floor(Math.random() * targetSound.objects.length)];

  const distractors: ChoiceItem[] = [];
  const otherSounds = SOUNDS_DATA.filter(s => s.soundId !== targetSound.soundId);
  const shuffledOtherSounds = [...otherSounds].sort(() => Math.random() - 0.5);

  for (let i = 0; i < 2; i++) {
    const distractorSound = shuffledOtherSounds[i];
    const distractorObject = distractorSound.objects[Math.floor(Math.random() * distractorSound.objects.length)];
    distractors.push({
      name: distractorObject,
      icon: getObjectIcon(distractorObject),
      isCorrect: false
    });
  }

  const correctChoice: ChoiceItem = {
    name: correctObject,
    icon: getObjectIcon(correctObject),
    isCorrect: true
  };

  const choices = [correctChoice, ...distractors].sort(() => Math.random() - 0.5);

  return {
    targetSound,
    correctObject,
    choices
  };
}

export default function MagicSoundBubblesEngine({ childId, onBack }: MagicSoundBubblesEngineProps) {
  const [gameState, setGameState] = useState<"welcome" | "playing" | "celebration">("welcome");
  const [correctCount, setCorrectCount] = useState(0);
  const [roundData, setRoundData] = useState<RoundData | null>(null);
  const [recentSounds, setRecentSounds] = useState<string[]>([]);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [wrongIdxs, setWrongIdxs] = useState<number[]>([]);
  const [poppedIdxs, setPoppedIdxs] = useState<number[]>([]);
  
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState<number>(0);

  const preferredVoiceRef = useRef<SpeechSynthesisVoice | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    const loadVoices = () => {
      preferredVoiceRef.current = selectPreferredVoice();
    };
    loadVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  const speakText = useCallback((text: string, onEndCallback?: () => void) => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      if (onEndCallback) onEndCallback();
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    
    if (preferredVoiceRef.current) {
      utterance.voice = preferredVoiceRef.current;
    }
    
    utterance.rate = 0.78;
    utterance.pitch = 1.15;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => {
      setIsSpeaking(false);
      if (onEndCallback) onEndCallback();
    };
    utterance.onerror = (e) => {
      if (e.error !== "interrupted" && e.error !== "canceled") {
        console.error("Speech error:", e);
      }
      setIsSpeaking(false);
      if (onEndCallback) onEndCallback();
    };

    window.speechSynthesis.speak(utterance);
  }, []);

  const startNewRound = useCallback((currentRecent: string[]) => {
    const nextRound = generateRound(currentRecent);
    setRoundData(nextRound);
    setSelectedIdx(null);
    setWrongIdxs([]);
    setPoppedIdxs([]);
    
    const phoneme = nextRound.targetSound.speakSound;
    const text = `Pop ${phoneme}. ${phoneme}, ${phoneme}.`;
    
    setTimeout(() => {
      speakText(text);
    }, 400);
  }, [speakText]);

  const handleStartGame = () => {
    playSynthesizedSound("click");
    setGameState("playing");
    setCorrectCount(0);
    setSessionStartTime(Date.now());
    const initialRecent: string[] = [];
    setRecentSounds(initialRecent);
    startNewRound(initialRecent);
  };

  const handleReplayInstruction = () => {
    if (!roundData || isSpeaking) return;
    playSynthesizedSound("tick");
    const phoneme = roundData.targetSound.speakSound;
    speakText(`Listen: ${phoneme}, ${phoneme}.`);
  };

  const handleChoiceClick = async (choice: ChoiceItem, idx: number) => {
    if (isSpeaking || selectedIdx !== null || wrongIdxs.includes(idx)) return;

    setSelectedIdx(idx);

    if (choice.isCorrect) {
      setPoppedIdxs(prev => [...prev, idx]);
      playSynthesizedSound("pop");
      playSynthesizedSound("correct");
      
      confetti({
        particleCount: 30,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#38bdf8", "#bae6fd", "#fef08a", "#ffffff"]
      });

      const nextCount = correctCount + 1;
      setCorrectCount(nextCount);

      const phoneme = roundData!.targetSound.speakSound;
      const text = `Great job! ${phoneme}, ${phoneme}, ${choice.name.toLowerCase()}.`;

      speakText(text, async () => {
        if (nextCount >= 5) {
          setGameState("celebration");
          playSynthesizedSound("win");
          
          confetti({
            particleCount: 100,
            spread: 100,
            origin: { y: 0.55 }
          });

          if (childId) {
            const timeSpentMs = Date.now() - sessionStartTime;
            try {
              await fetch(`/api/progress/${childId}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  targetLetter: roundData!.targetSound.targetLetter,
                  tracingScore: 100,
                  phonemicScore: 100,
                  timeSpentMs
                })
              });

              await fetch(`/api/badges/${childId}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  badgeName: "Bubble Sound Popper"
                })
              });
            } catch (err) {
              console.error("Failed to save progress/badge:", err);
            }
          }
        } else {
          const updatedRecent = [roundData!.targetSound.soundId, ...recentSounds].slice(0, 3);
          setRecentSounds(updatedRecent);
          startNewRound(updatedRecent);
        }
      });

    } else {
      playSynthesizedSound("wrong");
      setWrongIdxs(prev => [...prev, idx]);

      const phoneme = roundData!.targetSound.speakSound;
      const text = `Good try. Listen again: ${phoneme}.`;
      speakText(text, () => {
        setSelectedIdx(null);
      });
    }
  };

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  return (
    <div className="flex flex-col h-[100dvh] max-h-[100dvh] bg-gradient-to-b from-[#e0f2fe] to-[#bae6fd] font-sans relative overflow-hidden select-none">
      <div className="absolute inset-0 z-0 pointer-events-none opacity-40">
        <svg className="absolute bottom-0 w-full h-32 text-sky-400/30" viewBox="0 0 1440 320" preserveAspectRatio="none">
          <path fill="currentColor" d="M0,192L48,202.7C96,213,192,235,288,229.3C384,224,480,192,576,192C672,192,768,224,864,213.3C960,203,1056,149,1152,144C1248,139,1344,181,1392,202.7L1440,224L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z" />
        </svg>
        <div className="absolute top-10 left-10 w-8 h-8 rounded-full border border-white/40 animate-pulse" />
        <div className="absolute top-40 right-20 w-12 h-12 rounded-full border border-white/30 animate-pulse" />
        <div className="absolute bottom-24 left-1/4 w-6 h-6 rounded-full border border-white/50 animate-pulse" />
      </div>

      <header className="z-10 flex items-center justify-between p-4 shrink-0 bg-white/70 backdrop-blur-md border-b-[3px] border-white/60">
        <button
          onClick={onBack}
          aria-label="Go back to menu"
          className="flex items-center justify-center w-12 h-12 bg-white rounded-2xl border-[3px] border-[#cbd5e1] shadow-[0_4px_0_#cbd5e1] active:translate-y-1 active:shadow-none transition-all text-[#475569]"
        >
          <ArrowLeft size={24} />
        </button>

        <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-sky-800">
          Magic Sound Bubbles
        </h1>

        {gameState === "playing" ? (
          <button
            onClick={handleReplayInstruction}
            disabled={isSpeaking}
            aria-label="Replay instruction voice"
            className={`flex items-center justify-center w-12 h-12 bg-white rounded-2xl border-[3px] border-[#0ea5e9] shadow-[0_4px_0_#0ea5e9] active:translate-y-1 active:shadow-none transition-all text-[#0ea5e9] ${
              isSpeaking ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            <Volume2 size={24} />
          </button>
        ) : (
          <div className="w-12 h-12" />
        )}
      </header>

      <main className="flex-grow z-10 flex flex-col items-center justify-center px-4 py-2 sm:py-6 overflow-hidden">
        {gameState === "welcome" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md bg-white/95 rounded-[2rem] border-[4px] border-white/80 p-6 sm:p-8 shadow-[0_12px_40px_rgba(0,0,0,0.06)] text-center relative overflow-visible"
          >
            <div className="flex justify-center mb-6">
              <div className="relative w-24 h-24 animate-float">
                <MascotSVG className="w-full h-full" />
                <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100">
                  <rect x="25" y="38" width="50" height="15" rx="7" fill="none" stroke="#0284c7" strokeWidth="4" />
                  <line x1="50" y1="45" x2="50" y2="45" stroke="#0284c7" strokeWidth="4" />
                  <ellipse cx="37" cy="45" rx="8" ry="6" fill="rgba(14, 165, 233, 0.4)" stroke="#ffffff" strokeWidth="1.5" />
                  <ellipse cx="63" cy="45" rx="8" ry="6" fill="rgba(14, 165, 233, 0.4)" stroke="#ffffff" strokeWidth="1.5" />
                </svg>
              </div>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black uppercase text-[#0369a1] tracking-tight mb-2">
              Let&apos;s Play Bubbles!
            </h2>
            <p className="text-sm sm:text-base font-bold text-[#57534e] mb-6">
              Listen to the magic sound and pop the matching picture!
            </p>

            <ClayButton
              onClick={handleStartGame}
              className="w-full py-4 text-xl font-black uppercase tracking-wider text-white bg-gradient-to-r from-sky-400 to-blue-500 hover:from-sky-500 hover:to-blue-600 rounded-2xl shadow-[0_6px_0_#0284c7]"
            >
              Start Game 🚀
            </ClayButton>
          </motion.div>
        )}

        {gameState === "playing" && roundData && (
          <div className="w-full max-w-lg flex flex-col items-center h-full justify-between">
            
            <div className="w-full text-center py-2 shrink-0">
              <div className="flex justify-center mb-1">
                <div className="relative w-16 h-16 animate-float">
                  <MascotSVG className="w-full h-full" />
                  <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100">
                    <rect x="25" y="38" width="50" height="15" rx="7" fill="none" stroke="#0284c7" strokeWidth="3" />
                    <line x1="50" y1="45" x2="50" y2="45" stroke="#0284c7" strokeWidth="3" />
                    <ellipse cx="37" cy="45" rx="8" ry="6" fill="rgba(14, 165, 233, 0.4)" stroke="#ffffff" strokeWidth="1" />
                    <ellipse cx="63" cy="45" rx="8" ry="6" fill="rgba(14, 165, 233, 0.4)" stroke="#ffffff" strokeWidth="1" />
                  </svg>
                </div>
              </div>

              <div className="bg-white/80 border-[3px] border-white/90 rounded-2xl py-2 px-6 shadow-sm inline-block">
                <p className="text-xl sm:text-2xl font-black text-sky-900 tracking-wide leading-none">
                  Pop {roundData.targetSound.phonemeText}
                </p>
                <p className="text-[11px] font-bold text-sky-600/80 uppercase mt-0.5 tracking-wider">
                  Listen: &quot;{roundData.targetSound.speakSound}&quot;
                </p>
              </div>
            </div>

            <div className="w-full flex-grow flex items-center justify-around gap-2 px-1 relative my-4">
              <AnimatePresence mode="popLayout">
                {roundData.choices.map((choice, idx) => {
                  const isWrong = wrongIdxs.includes(idx);
                  const isPopped = poppedIdxs.includes(idx);
                  const IconComp = choice.icon;

                  return (
                    <motion.div
                      key={`${choice.name}-${idx}`}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={isPopped ? { scale: 0, opacity: 0 } : { scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{ duration: 0.4 }}
                      className="relative"
                    >
                      <motion.div
                        animate={{
                          y: [-8, 8, -8],
                          x: [-4, 4, -4]
                        }}
                        transition={{
                          repeat: Infinity,
                          duration: 3.5 + (idx * 0.5),
                          ease: "easeInOut"
                        }}
                        style={{ originX: "50%", originY: "50%" }}
                      >
                        <motion.button
                          onClick={() => handleChoiceClick(choice, idx)}
                          disabled={isSpeaking || selectedIdx !== null}
                          animate={isWrong ? { x: [-6, 6, -6, 6, 0] } : {}}
                          transition={{ duration: 0.4 }}
                          aria-label={`Pop bubble containing ${choice.name}`}
                          className={`relative w-28 h-28 sm:w-36 sm:h-36 rounded-full flex items-center justify-center border-[4px] shadow-lg transition-transform focus:outline-none ${
                            isWrong
                              ? "bg-rose-50/70 border-rose-400"
                              : "bg-white/30 hover:bg-white/40 border-white/60"
                          } active:scale-95`}
                          style={{
                            minWidth: "64px",
                            minHeight: "64px",
                            background: "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0.1) 60%, rgba(56,189,248,0.2) 100%)",
                            boxShadow: "inset -8px -8px 20px rgba(56,189,248,0.2), 0 10px 20px rgba(0,0,0,0.05)"
                          }}
                        >
                          <div className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center drop-shadow-[0_4px_8px_rgba(0,0,0,0.06)]">
                            <IconComp size="100%" />
                          </div>

                          <div className="absolute top-3 left-4 w-4 h-2 sm:w-6 sm:h-3 bg-white/70 rounded-full rotate-[-25deg]" />
                          <div className="absolute bottom-4 right-5 w-2 h-2 bg-white/40 rounded-full" />
                        </motion.button>
                      </motion.div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            <div className="w-full shrink-0 py-4 flex flex-col items-center bg-white/45 backdrop-blur-sm border-t-[3px] border-white/50 rounded-t-[2.5rem]">
              <div className="flex items-center gap-2 mb-1.5">
                {[...Array(5)].map((_, index) => {
                  const isActive = index < correctCount;
                  return (
                    <motion.div
                      key={index}
                      initial={{ scale: 0.8 }}
                      animate={isActive ? { scale: [1, 1.3, 1], rotate: [0, 15, -15, 0] } : { scale: 1 }}
                      transition={{ duration: 0.5 }}
                      className={`relative w-8 h-8 ${isActive ? "text-[#f97316]" : "text-[#94a3b8]/40"}`}
                      aria-label={isActive ? "Collected starfish progress" : "Empty progress slot"}
                    >
                      <svg viewBox="0 0 24 24" className="w-full h-full drop-shadow-md" fill="currentColor">
                        <path d="M12 .587l3.668 7.431 8.2 1.192-5.934 5.784 1.4 8.168L12 18.896l-7.334 3.856 1.4-8.168L.132 9.21l8.2-1.192z" />
                      </svg>
                    </motion.div>
                  );
                })}
              </div>
              <p className="text-[10px] sm:text-xs font-black uppercase text-[#0369a1] tracking-widest leading-none">
                Starfish Progress Tracker
              </p>
            </div>

          </div>
        )}

        {gameState === "celebration" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md bg-white/95 rounded-[2.2rem] border-[4px] border-white/80 p-6 sm:p-8 shadow-[0_12px_40px_rgba(0,0,0,0.06)] text-center"
          >
            <div className="flex justify-center mb-6 relative">
              <motion.div 
                initial={{ rotate: -5, scale: 0.8 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ repeat: Infinity, repeatType: "reverse", duration: 1.5 }}
                className="w-32 h-32 relative text-[#fbbf24] flex items-center justify-center drop-shadow-2xl"
              >
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  <rect x="15" y="45" width="70" height="40" rx="6" fill="#78350f" stroke="#451a03" strokeWidth="4" />
                  <rect x="25" y="55" width="50" height="20" rx="3" fill="#b45309" />
                  
                  <ellipse cx="50" cy="45" rx="30" ry="12" fill="#fbbf24" stroke="#d97706" strokeWidth="2" />
                  <circle cx="40" cy="42" r="5" fill="#f59e0b" />
                  <circle cx="60" cy="41" r="5" fill="#f59e0b" />
                  
                  <path d="M15 45 C15 15 85 15 85 45 Z" fill="#78350f" stroke="#451a03" strokeWidth="4" />
                  <path d="M25 45 C25 25 75 25 75 45 Z" fill="#b45309" />
                  <rect x="44" y="38" width="12" height="15" rx="2" fill="#d97706" />
                </svg>

                <div className="absolute top-2 left-6 w-3.5 h-3.5 bg-yellow-300 rounded-full animate-ping" />
                <div className="absolute top-8 right-6 w-3 h-3 bg-yellow-300 rounded-full animate-ping" />
              </motion.div>
            </div>

            <h2 className="text-3xl font-black uppercase text-[#0369a1] tracking-tight mb-1">
              Yay! Finished!
            </h2>
            <p className="text-sm font-bold text-[#451a03] mb-1">
              Badge Earned:
            </p>
            
            <div className="inline-flex flex-col items-center bg-sky-50 border-[3px] border-sky-200 rounded-3xl p-4 mb-6 shadow-sm">
              <div className="w-16 h-16 bg-[#fbbf24] text-white rounded-full flex items-center justify-center border-[3px] border-white shadow-md mb-2">
                <Trophy size={36} />
              </div>
              <p className="text-lg font-black uppercase tracking-tight text-[#0369a1] leading-none">
                Bubble Sound Popper
              </p>
              <p className="text-[10px] font-black text-sky-600/80 uppercase mt-1 tracking-widest leading-none">
                Listening Champ 🏆
              </p>
            </div>

            <div className="flex gap-4">
              <ClayButton
                onClick={handleStartGame}
                className="flex-1 py-3 text-base font-black uppercase text-[#0369a1] bg-sky-100 hover:bg-sky-200 rounded-2xl shadow-[0_4px_0_#bae6fd]"
              >
                Play Again 🔄
              </ClayButton>
              
              <ClayButton
                onClick={onBack}
                className="flex-1 py-3 text-base font-black uppercase text-white bg-gradient-to-r from-sky-400 to-blue-500 hover:from-sky-500 hover:to-blue-600 rounded-2xl shadow-[0_4px_0_#0284c7]"
              >
                Go Menu 🏠
              </ClayButton>
            </div>

          </motion.div>
        )}
      </main>
    </div>
  );
}
