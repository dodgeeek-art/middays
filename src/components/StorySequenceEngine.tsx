"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Volume2 } from "@/components/Icons";
import { motion, PanInfo } from "framer-motion";
import ClayButton from "@/components/ui/ClayButton";
import { playSynthesizedSound } from "@/lib/audio";
import { 
  Cake as CakeRaw, 
  Snowman as SnowmanRaw, 
  Carrot as CarrotRaw, 
  Egg as EggRaw, 
  Hat as HatRaw, 
  Hoe as HoeRaw, 
  Seeds as SeedsRaw, 
  WateringCan as WateringCanRaw, 
  Whisk as WhiskRaw, 
  BakingPan as BakingPanRaw, 
  Snowballs as SnowballsRaw 
} from "@/lib/svgDictionary";
import confetti from "canvas-confetti";

type CartoonIconComponent = React.FC<{ size?: string | number } & React.SVGProps<SVGSVGElement>>;

const Cake = CakeRaw as CartoonIconComponent;
const Snowman = SnowmanRaw as CartoonIconComponent;
const Carrot = CarrotRaw as CartoonIconComponent;
const Egg = EggRaw as CartoonIconComponent;
const Hat = HatRaw as CartoonIconComponent;
const Hoe = HoeRaw as CartoonIconComponent;
const Seeds = SeedsRaw as CartoonIconComponent;
const WateringCan = WateringCanRaw as CartoonIconComponent;
const Whisk = WhiskRaw as CartoonIconComponent;
const BakingPan = BakingPanRaw as CartoonIconComponent;
const Snowballs = SnowballsRaw as CartoonIconComponent;

interface Tool {
  id: string;
  name: string;
  renderIcon: () => React.ReactNode;
}

interface Step {
  stepIndex: number;
  instruction: string;
  voicePrompt: string;
  correctToolId: string;
}

interface Concept {
  id: string;
  title: string;
  bgGradient: string;
  parentPrompt: string;
  steps: Step[];
  tools: Tool[];
  renderScene: (sceneStep: number, activeActionTool: string | null) => React.ReactNode;
}

const concepts: Concept[] = [
  {
    id: "planting",
    title: "Planting a Flower",
    bgGradient: "from-[#bae6fd] to-[#f0f9ff]",
    parentPrompt: 'Ask your child: "What does a tiny seed need to grow into a beautiful flower?"',
    tools: [
      {
        id: "hoe",
        name: "Hoe",
        renderIcon: () => (
          <Hoe size="100%" />
        )
      },
      {
        id: "seed",
        name: "Seed Packet",
        renderIcon: () => (
          <Seeds size="100%" />
        )
      },
      {
        id: "water",
        name: "Watering Can",
        renderIcon: () => (
          <WateringCan size="100%" />
        )
      }
    ],
    steps: [
      {
        stepIndex: 0,
        instruction: "Drag Hoe to soil.",
        voicePrompt: "Drag the hoe to dig a hole in the soil!",
        correctToolId: "hoe"
      },
      {
        stepIndex: 1,
        instruction: "Drag Seeds to soil.",
        voicePrompt: "Excellent! Now drag the seed packet to plant the seeds!",
        correctToolId: "seed"
      },
      {
        stepIndex: 2,
        instruction: "Drag Water to soil.",
        voicePrompt: "Almost there! Drag the watering can to water the seeds and help them grow!",
        correctToolId: "water"
      }
    ],
    renderScene: (sceneStep: number, activeActionTool: string | null) => (
      <svg viewBox="0 0 300 200" preserveAspectRatio="xMidYMid slice" className="w-full h-full rounded-[1.8rem] overflow-hidden">
        {/* Sky */}
        <rect x="0" y="0" width="300" height="130" fill="#bae6fd" />
        {/* Sun */}
        <circle cx="260" cy="40" r="20" fill="#fbbf24" />
        {/* Cloud */}
        <path d="M50 50 Q60 35 75 45 Q90 35 95 50 Q110 55 95 65 L50 65 Z" fill="#ffffff" opacity="0.9" />
        {/* Ground/Soil */}
        <path d="M 0 130 Q 150 120 300 130 L 300 200 L 0 200 Z" fill="#78350f" />
        
        {/* Step 1: Dug hole */}
        {sceneStep >= 1 && (
          <motion.ellipse
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            cx="150" cy="145" rx="24" ry="10" fill="#451a03"
          />
        )}
        
        {/* Step 2: Seeds in hole */}
        {sceneStep >= 2 && sceneStep < 3 && (
          <motion.g
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.0, ease: "easeOut" }}
          >
            <circle cx="140" cy="145" r="3" fill="#fef08a" />
            <circle cx="150" cy="147" r="3" fill="#fef08a" />
            <circle cx="160" cy="144" r="3" fill="#fef08a" />
          </motion.g>
        )}

        {/* Step 3: Beautiful Sprouted Tree */}
        {sceneStep === 3 && (
          <motion.g
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            style={{ originX: "150px", originY: "145px" }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          >
            {/* Trunk */}
            <path d="M145 145 C145 130 148 110 148 90 L152 90 C152 110 155 130 155 145 Z" fill="#78350f" />
            
            {/* Left Branch */}
            <path d="M148 115 C138 110 130 95 133 90" stroke="#78350f" strokeWidth="3.5" strokeLinecap="round" fill="none" />
            {/* Right Branch */}
            <path d="M152 110 C162 105 170 90 167 85" stroke="#78350f" strokeWidth="3.5" strokeLinecap="round" fill="none" />
            
            {/* Leaf clusters (detailed cartoon shapes with multiple greens) */}
            {/* Top Center Leaves */}
            <path d="M150 90 C140 80 135 65 150 55 C165 65 160 80 150 90 Z" fill="#22c55e" />
            <path d="M150 90 C155 80 165 75 150 65 C135 75 145 80 150 90 Z" fill="#16a34a" />
            <circle cx="150" cy="65" r="2.5" fill="#fbbf24" /> {/* yellow flower bud */}
            
            {/* Left Leaf Cluster */}
            <path d="M133 90 C123 85 118 75 130 68 C142 75 138 85 133 90 Z" fill="#4ade80" />
            <path d="M133 90 C128 80 138 75 128 70 C118 75 123 80 133 90 Z" fill="#22c55e" />
            <circle cx="128" cy="73" r="2.5" fill="#fbbf24" />
            
            {/* Right Leaf Cluster */}
            <path d="M167 85 C177 80 182 70 170 63 C158 70 162 80 167 85 Z" fill="#15803d" />
            <path d="M167 85 C172 75 162 70 172 65 C182 70 177 75 167 85 Z" fill="#22c55e" />
            <circle cx="172" cy="68" r="2.5" fill="#fbbf24" />
          </motion.g>
        )}

        {/* Tool Action Animations */}
        {activeActionTool === "hoe" && (
          <g transform="translate(125, 70)">
            <motion.g
              style={{ originX: "25px", originY: "25px" }}
              initial={{ y: -15, rotate: -20, opacity: 0 }}
              animate={{
                opacity: [0, 1, 1, 1, 0],
                y: [-15, 10, -5, 10, 0],
                rotate: [-20, -50, -20, -50, -20]
              }}
              transition={{ duration: 1.2 }}
            >
              <Hoe size={50} />
            </motion.g>
          </g>
        )}

        {activeActionTool === "seed" && (
          <g>
            <g transform="translate(127.5, 65)">
              <motion.g
                style={{ originX: "22.5px", originY: "22.5px" }}
                initial={{ rotate: 0, opacity: 0 }}
                animate={{
                  opacity: [0, 1, 1, 1, 0],
                  rotate: [0, -25, 25, -25, 0]
                }}
                transition={{ duration: 1.2 }}
              >
                <Seeds size={45} />
              </motion.g>
            </g>
            <motion.circle cx="145" cy="120" r="2.5" fill="#fef08a" initial={{ opacity: 0, y: -15 }} animate={{ opacity: [0, 1, 0], y: 15 }} transition={{ delay: 0.2, duration: 0.5 }} />
            <motion.circle cx="150" cy="122" r="2.5" fill="#fef08a" initial={{ opacity: 0, y: -15 }} animate={{ opacity: [0, 1, 0], y: 15 }} transition={{ delay: 0.4, duration: 0.5 }} />
            <motion.circle cx="155" cy="120" r="2.5" fill="#fef08a" initial={{ opacity: 0, y: -15 }} animate={{ opacity: [0, 1, 0], y: 15 }} transition={{ delay: 0.6, duration: 0.5 }} />
          </g>
        )}

        {activeActionTool === "water" && (
          <g>
            <g transform="translate(145, 60)">
              <motion.g
                style={{ originX: "25px", originY: "25px" }}
                initial={{ rotate: 0, opacity: 0 }}
                animate={{
                  opacity: [0, 1, 1, 1, 0],
                  rotate: [0, -35, -35, 0]
                }}
                transition={{ duration: 1.2 }}
              >
                <WateringCan size={50} />
              </motion.g>
            </g>
            <motion.path d="M140 110 L140 125" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" initial={{ opacity: 0, pathLength: 0 }} animate={{ opacity: [0, 1, 0], pathLength: [0, 1] }} transition={{ delay: 0.2, duration: 0.5 }} />
            <motion.path d="M148 113 L148 128" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" initial={{ opacity: 0, pathLength: 0 }} animate={{ opacity: [0, 1, 0], pathLength: [0, 1] }} transition={{ delay: 0.4, duration: 0.5 }} />
            <motion.path d="M156 110 L156 125" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" initial={{ opacity: 0, pathLength: 0 }} animate={{ opacity: [0, 1, 0], pathLength: [0, 1] }} transition={{ delay: 0.6, duration: 0.5 }} />
          </g>
        )}
      </svg>
    )
  },
  {
    id: "baking",
    title: "Baking a Cake",
    bgGradient: "from-[#fef3c7] to-[#fffbeb]",
    parentPrompt: 'Ask your child: "What ingredients and tools do we need to bake a yummy birthday cake?"',
    tools: [
      {
        id: "egg",
        name: "Eggs",
        renderIcon: () => (
          <div className="w-[70%] h-[70%] flex items-center justify-center">
            <Egg size="100%" />
          </div>
        )
      },
      {
        id: "whisk",
        name: "Whisk",
        renderIcon: () => (
          <Whisk size="100%" />
        )
      },
      {
        id: "pan",
        name: "Cake Pan",
        renderIcon: () => (
          <BakingPan size="100%" />
        )
      }
    ],
    steps: [
      {
        stepIndex: 0,
        instruction: "Drag Eggs to bowl.",
        voicePrompt: "Let's start baking! Drag the eggs to crack them into the mixing bowl!",
        correctToolId: "egg"
      },
      {
        stepIndex: 1,
        instruction: "Drag Whisk to bowl.",
        voicePrompt: "Now drag the whisk to stir the cake batter together!",
        correctToolId: "whisk"
      },
      {
        stepIndex: 2,
        instruction: "Drag Pan to bake.",
        voicePrompt: "Perfect! Drag the cake pan to pour the batter and bake it in the oven!",
        correctToolId: "pan"
      }
    ],
    renderScene: (sceneStep: number, activeActionTool: string | null) => (
      <svg viewBox="0 0 300 200" preserveAspectRatio="xMidYMid slice" className="w-full h-full rounded-[1.8rem] overflow-hidden">
        {/* Wall */}
        <rect x="0" y="0" width="300" height="135" fill="#fef3c7" />
        <line x1="0" y1="45" x2="300" y2="45" stroke="#fde68a" strokeWidth="2.5" strokeDasharray="6,6" />
        <line x1="0" y1="90" x2="300" y2="90" stroke="#fde68a" strokeWidth="2.5" strokeDasharray="6,6" />
        {/* Countertop */}
        <rect x="0" y="135" width="300" height="65" fill="#f59e0b" />

        {/* Step 0, 1 & 2: Mixing Bowl */}
        {sceneStep <= 2 && (
          <g transform="translate(100, 95)">
            {/* Bowl */}
            <path d="M10 25 L90 25 C90 55 10 55 10 25 Z" fill="#0284c7" />
            <ellipse cx="50" cy="25" rx="40" ry="8" fill="#38bdf8" />
            
            {/* Cracked Eggs */}
            {sceneStep === 1 && (
              <motion.g
                initial={{ opacity: 0, y: -15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.2 }}
              >
                <ellipse cx="40" cy="27" rx="12" ry="4" fill="#ffffff" />
                <circle cx="40" cy="27" r="4.5" fill="#fbbf24" />
                <ellipse cx="60" cy="28" rx="10" ry="3.5" fill="#ffffff" />
                <circle cx="60" cy="28" r="4" fill="#fbbf24" />
              </motion.g>
            )}

            {/* Stirred Batter */}
            {sceneStep === 2 && (
              <g>
                <ellipse cx="50" cy="26" rx="38" ry="7" fill="#fef08a" />
                {/* Animating Whisk */}
                <motion.g
                  animate={{ x: [-5, 5, -5], rotate: [-6, 6, -6] }}
                  transition={{ repeat: Infinity, duration: 0.8, ease: "easeInOut" }}
                  transform="translate(25, -20)"
                >
                  <rect x="23" y="25" width="4" height="15" rx="2" fill="#78716c" />
                  <path d="M15 10 Q15 0 25 0 Q35 0 35 10 Q35 25 25 25 Q15 25 15 10 Z" fill="none" stroke="#a8a29e" strokeWidth="2" />
                </motion.g>
              </g>
            )}
          </g>
        )}

        {/* Step 3: Beautiful Cake baked (Cake) */}
        {sceneStep === 3 && (
          <motion.g
            initial={{ scale: 0, y: 30, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            transition={{ duration: 1.8, type: "spring", stiffness: 40 }}
            transform="translate(110, 60)"
          >
            {/* Stand */}
            <path d="M25 80 L55 80 L48 95 L32 95 Z" fill="#94a3b8" />
            <ellipse cx="40" cy="80" rx="30" ry="6" fill="#cbd5e1" />
            {/* Cake emoji */}
            <Cake size={80} />
          </motion.g>
        )}

        {/* Tool Action Animations */}
        {activeActionTool === "egg" && (
          <g transform="translate(127.5, 70)">
            <motion.g
              style={{ originX: "22.5px", originY: "22.5px" }}
              initial={{ y: -15, opacity: 0 }}
              animate={{
                opacity: [0, 1, 1, 0],
                y: [-15, 10, 10, 15]
              }}
              transition={{ duration: 1.2 }}
            >
              <Egg size={45} />
            </motion.g>
          </g>
        )}

        {activeActionTool === "whisk" && (
          <g transform="translate(127.5, 70)">
            <motion.g
              style={{ originX: "22.5px", originY: "22.5px" }}
              initial={{ rotate: 0, opacity: 0 }}
              animate={{
                opacity: [0, 1, 1, 1, 0],
                x: [0, -15, 15, -15, 15, 0],
                y: [-15, 10, 10, 15, 15, 10],
                rotate: [0, 15, -15, 15, -15, 0]
              }}
              transition={{ duration: 1.2 }}
            >
              <Whisk size={45} />
            </motion.g>
          </g>
        )}

        {activeActionTool === "pan" && (
          <g>
            <g transform="translate(125, 60)">
              <motion.g
                style={{ originX: "25px", originY: "25px" }}
                initial={{ rotate: 0, opacity: 0 }}
                animate={{
                  opacity: [0, 1, 1, 1, 0],
                  rotate: [0, 45, 45, 0],
                  y: [-15, 10, 10, -15]
                }}
                transition={{ duration: 1.2 }}
              >
                <BakingPan size={50} />
              </motion.g>
            </g>
            <motion.path d="M148 100 L148 120" stroke="#fef08a" strokeWidth="4.5" strokeLinecap="round" initial={{ opacity: 0, scaleY: 0 }} animate={{ opacity: [0, 1, 0], scaleY: [0, 1, 0] }} transition={{ delay: 0.3, duration: 0.6 }} />
          </g>
        )}
      </svg>
    )
  },
  {
    id: "snowman",
    title: "Making a Snowman",
    bgGradient: "from-[#0f172a] to-[#1e293b]",
    parentPrompt: 'Ask your child: "What makes the snowman stay warm? Let\'s dress him up!"',
    tools: [
      {
        id: "snowballs",
        name: "Snowballs",
        renderIcon: () => (
          <Snowballs size="100%" />
        )
      },
      {
        id: "carrot",
        name: "Carrot",
        renderIcon: () => (
          <div className="w-[70%] h-[70%] flex items-center justify-center">
            <Carrot size="100%" />
          </div>
        )
      },
      {
        id: "hat",
        name: "Top Hat",
        renderIcon: () => (
          <div className="w-[70%] h-[70%] flex items-center justify-center">
            <Hat size="100%" />
          </div>
        )
      }
    ],
    steps: [
      {
        stepIndex: 0,
        instruction: "Drag Snowballs to snow.",
        voicePrompt: "It's snowing! Drag the snowballs to stack the snowman's body!",
        correctToolId: "snowballs"
      },
      {
        stepIndex: 1,
        instruction: "Drag Carrot to face.",
        voicePrompt: "Great stack! Now drag the carrot to add the face and stick arms!",
        correctToolId: "carrot"
      },
      {
        stepIndex: 2,
        instruction: "Drag Hat to head.",
        voicePrompt: "Awesome! Finally, drag the top hat to dress up the snowman!",
        correctToolId: "hat"
      }
    ],
    renderScene: (sceneStep: number, activeActionTool: string | null) => (
      <svg viewBox="0 0 300 200" preserveAspectRatio="xMidYMid slice" className="w-full h-full rounded-[1.8rem] overflow-hidden">
        {/* Winter Night Sky */}
        <rect x="0" y="0" width="300" height="130" fill="#0f172a" />
        {/* Stars */}
        <circle cx="40" cy="30" r="1.5" fill="#ffffff" />
        <circle cx="120" cy="20" r="1.5" fill="#ffffff" />
        <circle cx="230" cy="40" r="2" fill="#ffffff" />
        <circle cx="270" cy="25" r="1" fill="#ffffff" />
        {/* Snowy Ground */}
        <path d="M 0 130 Q 150 120 300 130 L 300 200 L 0 200 Z" fill="#f8fafc" />

        {/* Step 1 & 2: Snowball Stack */}
        {sceneStep >= 1 && sceneStep < 3 && (
          <g>
            {/* Bottom Snowball */}
            <motion.circle
              initial={{ scale: 0, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ duration: 1.2, type: "spring", stiffness: 50 }}
              cx="150" cy="140" r="28" fill="#ffffff" stroke="#e2e8f0" strokeWidth="2"
            />
            {/* Head Snowball */}
            {sceneStep >= 2 && (
              <motion.circle
                initial={{ scale: 0, opacity: 0, y: -20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 1.0, type: "spring" }}
                cx="150" cy="100" r="20" fill="#ffffff" stroke="#e2e8f0" strokeWidth="2"
              />
            )}
          </g>
        )}

        {/* Step 2: Stick Arms & Carrot Face */}
        {sceneStep === 2 && (
          <g>
            {/* Stick Arms */}
            <motion.line
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.8 }}
              x1="130" y1="100" x2="105" y2="90" stroke="#78350f" strokeWidth="3" strokeLinecap="round"
            />
            <motion.line
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.8 }}
              x1="170" y1="100" x2="195" y2="90" stroke="#78350f" strokeWidth="3" strokeLinecap="round"
            />
            {/* Face details */}
            <motion.g
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 1.0, duration: 0.8 }}
            >
              <circle cx="143" cy="96" r="2.5" fill="#1e293b" />
              <circle cx="157" cy="96" r="2.5" fill="#1e293b" />
              <polygon points="150,100 165,102 150,105" fill="#f97316" />
              <path d="M144 108 Q150 112 156 108" fill="none" stroke="#1e293b" strokeWidth="2" strokeLinecap="round" />
            </motion.g>
          </g>
        )}

        {/* Step 3: Complete Snowman (Snowman emoji) */}
        {sceneStep === 3 && (
          <motion.g
            initial={{ scale: 0, y: 40, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            transition={{ duration: 1.8, type: "spring", stiffness: 40 }}
            transform="translate(107.5, 48)"
          >
            <Snowman size={85} />
          </motion.g>
        )}

        {/* Tool Action Animations */}
        {activeActionTool === "snowballs" && (
          <g transform="translate(125, 75)">
            <motion.g
              style={{ originX: "25px", originY: "25px" }}
              initial={{ y: -30, opacity: 0, scale: 0.6 }}
              animate={{
                opacity: [0, 1, 1, 0],
                y: [-30, 20, 20, 25],
                scale: [0.6, 1, 1, 0.9]
              }}
              transition={{ duration: 1.2 }}
            >
              <Snowballs size={50} />
            </motion.g>
          </g>
        )}

        {activeActionTool === "carrot" && (
          <g transform="translate(127.5, 75)">
            <motion.g
              style={{ originX: "22.5px", originY: "22.5px" }}
              initial={{ scale: 0.5, y: -20, opacity: 0 }}
              animate={{
                opacity: [0, 1, 1, 0],
                scale: [0.5, 1, 1, 0.9],
                y: [-20, 10, 10, 15]
              }}
              transition={{ duration: 1.2 }}
            >
              <Carrot size={45} />
            </motion.g>
          </g>
        )}

        {activeActionTool === "hat" && (
          <g transform="translate(127.5, 45)">
            <motion.g
              style={{ originX: "22.5px", originY: "22.5px" }}
              initial={{ y: -60, opacity: 0 }}
              animate={{
                opacity: [0, 1, 1, 0],
                y: [-60, 10, 10, 12]
              }}
              transition={{ duration: 1.2 }}
            >
              <Hat size={45} />
            </motion.g>
          </g>
        )}
      </svg>
    )
  }
];

export default function StorySequenceEngine({ childId, onBack }: { childId: string; onBack: () => void }) {
  const [activeConceptIdx, setActiveConceptIdx] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [sceneStep, setSceneStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [activeActionTool, setActiveActionTool] = useState<string | null>(null);
  const [gameState, setGameState] = useState<"playing" | "concept-complete" | "finished">("playing");
  const [errorsThisRound, setErrorsThisRound] = useState(0);
  const [startTime] = useState<number>(() => Date.now());
  const [resetKey, setResetKey] = useState(0);

  const sceneRef = useRef<HTMLDivElement>(null);
  const concept = concepts[activeConceptIdx];
  const step = concept.steps[Math.min(currentStep, concept.steps.length - 1)];

  const speakText = useCallback((text: string) => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.85;
      utterance.pitch = 1.25;
      window.speechSynthesis.speak(utterance);
    }
  }, []);

  // Trigger instruction speech on load or step changes (only when not animating)
  useEffect(() => {
    if (gameState === "playing" && !isAnimating) {
      speakText(step.voicePrompt);
    }
  }, [activeConceptIdx, currentStep, gameState, step, isAnimating, speakText]);

  const handleGameComplete = useCallback(async () => {
    playSynthesizedSound("levelUp");
    setGameState("finished");

    const elapsed = Date.now() - startTime;
    if (childId) {
      try {
        await fetch(`/api/progress/${childId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            targetLetter: "STORY",
            tracingScore: Math.max(0, 100 - errorsThisRound * 10),
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

  const handleDragEnd = (toolId: string, _event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (isAnimating || gameState !== "playing") return;

    const sceneRect = sceneRef.current?.getBoundingClientRect();
    const dragX = info.point.x;
    const dragY = info.point.y;

    if (
      sceneRect &&
      dragX >= sceneRect.left &&
      dragX <= sceneRect.right &&
      dragY >= sceneRect.top &&
      dragY <= sceneRect.bottom
    ) {
      // Dropped inside scene
      if (toolId === step.correctToolId) {
        playSynthesizedSound("correct");
        setIsAnimating(true);
        setActiveActionTool(toolId);
        
        const nextStep = currentStep + 1;
        
        // Phase 1: Tool performs action in the center of the scene (1.2s)
        setTimeout(() => {
          setSceneStep(nextStep);
          setActiveActionTool(null);

          // Phase 2: Settle scene transition animations (1.8s)
          setTimeout(() => {
            setIsAnimating(false);
            if (nextStep >= concept.steps.length) {
              setGameState("concept-complete");
              playSynthesizedSound("win");
              confetti({
                particleCount: 50,
                spread: 50,
                origin: { y: 0.65 }
              });
              speakText(`Wonderful! You completed the story of ${concept.title}!`);
            } else {
              setCurrentStep(nextStep);
            }
          }, 1800);

        }, 1200);
      } else {
        // Wrong tool dragged
        playSynthesizedSound("wrong");
        setErrorsThisRound(prev => prev + 1);
        setResetKey(prev => prev + 1); // trigger snap back
      }
    } else {
      // Dropped outside, just snap back
      setResetKey(prev => prev + 1);
    }
  };

  const handleNextConcept = () => {
    playSynthesizedSound("click");
    const nextConceptIdx = activeConceptIdx + 1;
    if (nextConceptIdx >= concepts.length) {
      handleGameComplete();
    } else {
      setActiveConceptIdx(nextConceptIdx);
      setCurrentStep(0);
      setSceneStep(0);
      setGameState("playing");
      setIsAnimating(false);
      setActiveActionTool(null);
    }
  };

  return (
    <div className="relative mx-auto flex h-full min-h-0 w-full max-w-4xl select-none flex-col overflow-hidden rounded-[1.35rem] border border-[var(--brand-line)] bg-[#fffdf7] p-2.5 shadow-[0_14px_34px_rgba(34,49,63,0.08)] sm:p-4">
      <div className="mb-2 flex shrink-0 items-center justify-between gap-2 rounded-2xl border border-[#ffb51f]/20 bg-[#fff8e7]/75 px-3 py-2">
        <div className="min-w-0">
          <p className="truncate text-xs font-extrabold leading-tight text-[var(--brand-ink)] sm:text-sm">
            {concept.title}
          </p>
        </div>
        <span className="shrink-0 rounded-full border border-[var(--brand-line)] bg-white px-3 py-1 text-[10px] font-black uppercase tracking-[0.1em] text-[var(--brand-muted)] shadow-sm">
          {currentStep + 1}/{concept.steps.length}
        </span>
      </div>

      <div className="min-h-0 flex-1 rounded-[1.2rem] border border-[var(--brand-line)] bg-white/72 p-2 shadow-inner sm:p-3">
        <div className="flex h-full min-h-0 flex-col">
          <div className="mb-2 flex shrink-0 items-center justify-center gap-2 rounded-2xl border border-[var(--brand-line)] bg-white px-2 py-1.5 shadow-[0_5px_14px_rgba(34,49,63,0.06)]">
          <button
            type="button"
            onClick={() => speakText(step.instruction)}
            aria-label="Replay story instruction"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-[var(--brand-line)] bg-[#fff8e7] text-[#ff7a59] shadow-[0_4px_10px_rgba(34,49,63,0.08)] transition active:scale-95"
          >
            <Volume2 size={16} strokeWidth={3.5} />
          </button>
          <span className="min-w-0 text-center text-xs font-black leading-snug tracking-normal text-[var(--brand-ink)] sm:text-sm">
            {isAnimating ? "Watch the story change." : step.instruction}
          </span>
        </div>

        <div 
          ref={sceneRef}
            className="relative mx-auto min-h-0 w-full max-w-lg flex-1 overflow-hidden rounded-[1.25rem] border-[3px] border-white bg-white shadow-[0_10px_26px_rgba(34,49,63,0.1)] [&>svg]:h-full [&>svg]:w-full [&>svg]:rounded-none"
        >
          {concept.renderScene(sceneStep, activeActionTool)}

          {sceneStep === concept.steps.length && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.4, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="absolute inset-0 bg-white/20 pointer-events-none"
            />
          )}
        </div>

          <div className="my-2 flex shrink-0 justify-center gap-2">
          {concept.steps.map((_, idx) => (
            <div
              key={idx}
                className={`h-3 w-3 rounded-full border border-white transition-all duration-300 ${
                idx < sceneStep 
                    ? "bg-[#ffb51f] scale-110 shadow-sm" 
                  : idx === sceneStep 
                      ? "bg-[#ff7a59] scale-125 animate-pulse" 
                    : "bg-slate-200"
              }`}
            />
          ))}
        </div>

          <div className="relative mt-auto flex min-h-[112px] shrink-0 items-center justify-around gap-2 rounded-[1.5rem] border border-dashed border-[#ffb51f]/36 bg-[#fff8e7]/70 px-2.5 pb-2 pt-5 shadow-[inset_0_2px_10px_rgba(34,49,63,0.04)] sm:min-h-[124px] sm:gap-4 sm:px-4">
          {gameState === "finished" ? (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
                className="flex w-full flex-col items-center justify-between gap-3 px-3 py-1 text-center sm:flex-row sm:text-left"
            >
              <div>
                  <span className="text-[9px] font-black uppercase tracking-[0.14em] text-[#ff7a59]">Game Complete</span>
                  <h4 className="text-sm font-black leading-tight text-[var(--brand-ink)] sm:text-lg">
                  You completed all the builder stories.
                </h4>
              </div>
              <ClayButton
                variant="primary"
                onClick={onBack}
                  className="w-full rounded-full px-6 py-3 text-sm font-black uppercase sm:w-auto"
              >
                Back to Library
              </ClayButton>
            </motion.div>
          ) : gameState === "concept-complete" ? (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
                className="flex w-full flex-col items-center justify-between gap-3 px-3 py-1 text-center sm:flex-row sm:text-left"
            >
              <div>
                  <span className="text-[9px] font-black uppercase tracking-[0.14em] text-[#ff7a59]">Story Complete</span>
                  <h4 className="text-sm font-black leading-tight text-[var(--brand-ink)] sm:text-lg">
                  You built <span className="font-extrabold text-[#ff7a59]">{concept.title}</span>.
                </h4>
              </div>
              <ClayButton
                variant="primary"
                onClick={handleNextConcept}
                  className="w-full rounded-full px-6 py-3 text-sm font-black uppercase sm:w-auto"
              >
                {activeConceptIdx + 1 >= concepts.length ? "Finish Storybook" : "Next Story"}
              </ClayButton>
            </motion.div>
          ) : (
            <>
                <div className="pointer-events-none absolute left-1/2 top-1.5 -translate-x-1/2 select-none rounded-full border border-[var(--brand-line)] bg-white px-3 py-0.5 text-[8px] font-black uppercase tracking-[0.14em] text-[var(--brand-muted)] shadow-sm sm:text-[9px]">
                {isAnimating ? "Watching Story" : "Tool Tray"}
              </div>

              {concept.tools.map((tool) => (
                <motion.div
                  key={`${tool.id}-${resetKey}`}
                  drag={gameState === "playing" && !isAnimating}
                  dragSnapToOrigin
                  dragElastic={0.4}
                  onDragEnd={(e, info) => handleDragEnd(tool.id, e, info)}
                  whileDrag={{ scale: 1.15, rotate: -2, zIndex: 50 }}
                  whileHover={!isAnimating ? { scale: 1.05 } : {}}
                    className={`relative flex h-[82px] w-[82px] select-none flex-col items-center justify-center rounded-[1.2rem] border border-[var(--brand-line)] bg-white p-2 shadow-[0_7px_16px_rgba(34,49,63,0.08)] sm:h-[96px] sm:w-[96px] ${
                    isAnimating ? "cursor-not-allowed opacity-50" : "cursor-grab active:cursor-grabbing"
                  }`}
                  style={{ touchAction: "none" }}
                >
                  {tool.renderIcon()}
                    <span className="pointer-events-none mt-1 max-w-full truncate text-[8px] font-black uppercase tracking-normal text-[var(--brand-muted)] sm:text-[9.5px]">
                    {tool.name}
                  </span>
                </motion.div>
              ))}
            </>
          )}
          </div>
        </div>
      </div>
    </div>
  );
}
