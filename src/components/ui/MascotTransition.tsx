"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import MascotSVG from "../MascotSVG";

interface MascotTransitionProps {
  active: boolean;
  onComplete?: () => void;
}

const PRAISES = [
  "Awesome job!",
  "You're a superstar!",
  "Way to go!",
  "Amazing!",
  "Fantastic!",
  "You did it!",
  "Super cool!",
  "Wow! Perfect!"
];

export default function MascotTransition({ active, onComplete }: MascotTransitionProps) {
  const [praise, setPraise] = useState("");

  useEffect(() => {
    if (active) {
      // Pick a random praise word when it becomes active
      const randomPraise = PRAISES[Math.floor(Math.random() * PRAISES.length)];
      setPraise(randomPraise);

      const timer = setTimeout(() => {
        if (onComplete) {
          onComplete();
        }
      }, 2200); // 2.2 seconds total duration

      return () => clearTimeout(timer);
    }
  }, [active, onComplete]);

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          className="fixed bottom-0 right-4 sm:right-12 z-50 flex flex-col items-center pointer-events-none w-44 sm:w-52"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="relative flex flex-col items-center w-full px-2 pb-2">
            {/* Speech Bubble */}
            <motion.div
              className="mb-3 relative bg-white border-4 border-slate-100 px-4 py-2 rounded-2xl shadow-clay-card text-center pointer-events-auto"
              initial={{ scale: 0.3, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.3, y: 10, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.1 }}
            >
              {/* Speech bubble pointer (points down to the right toward the mascot) */}
              <div className="absolute bottom-[-12px] right-10 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[12px] border-t-white" />
              <div className="absolute bottom-[-16px] right-10 w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[14px] border-t-slate-100 -z-10" />

              <span className="text-lg font-extrabold text-primary font-sans select-none block whitespace-nowrap">
                {praise}
              </span>
            </motion.div>

            {/* Mascot */}
            <motion.div
              className="relative w-28 h-28 sm:w-36 sm:h-36 pointer-events-auto"
              initial={{ scale: 0.2, y: 120, rotate: 15 }}
              animate={{
                scale: [0.2, 1.1, 0.95, 1],
                y: [120, -10, 5, 0],
                rotate: [15, -5, 2, 0]
              }}
              exit={{ scale: 0.2, y: 120, opacity: 0 }}
              transition={{
                type: "tween",
                duration: 0.6,
                ease: "easeOut"
              }}
            >
              <MascotSVG className="w-full h-full animate-clay-bounce" />
            </motion.div>

            {/* Sparkle particles */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-3 h-3 bg-tertiary rounded-full animate-sparkle-fade"
                  style={{
                    left: `${50 + 30 * Math.cos((i * Math.PI) / 3)}%`,
                    top: `${50 + 30 * Math.sin((i * Math.PI) / 3)}%`,
                  }}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{
                    scale: [0, 1.2, 0.8, 0],
                    opacity: [0, 1, 1, 0],
                    x: [0, 45 * Math.cos((i * Math.PI) / 3)],
                    y: [0, 45 * Math.sin((i * Math.PI) / 3)],
                    rotate: [0, 180]
                  }}
                  transition={{
                    type: "tween",
                    duration: 1.2,
                    delay: 0.4,
                    ease: "easeOut",
                    repeat: Infinity,
                    repeatDelay: 0.5
                  }}
                />
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
