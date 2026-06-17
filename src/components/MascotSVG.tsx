"use client";

import React from "react";
import { motion } from "framer-motion";

interface MascotSVGProps {
  className?: string;
}

export default function MascotSVG({ className = "w-24 h-24" }: MascotSVGProps) {
  return (
    <motion.svg
      viewBox="0 -2 32 36"
      className={className}
      animate={{ y: [0, -4, 0] }}
      transition={{
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    >
      <defs>
        {/* Shading gradients for 3D guide character */}
        <linearGradient id="gradHair" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#F8B63B" />
          <stop offset="100%" stopColor="#D98A0F" />
        </linearGradient>
        <linearGradient id="gradFace" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFDC75" />
          <stop offset="100%" stopColor="#F5B224" />
        </linearGradient>
        <linearGradient id="gradCheeks" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FDBB11" />
          <stop offset="100%" stopColor="#E49E08" />
        </linearGradient>
        <linearGradient id="gradMouth" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#990839" />
          <stop offset="100%" stopColor="#6C0123" />
        </linearGradient>
        <linearGradient id="gradTongue" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFB33B" />
          <stop offset="100%" stopColor="#D87802" />
        </linearGradient>
        <linearGradient id="gradEyebrows" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#D37034" />
          <stop offset="100%" stopColor="#9C4412" />
        </linearGradient>
      </defs>

      {/* Smooth shadow under the mascot that scales as it floats */}
      <motion.ellipse 
        cx="16" 
        cy="31.2" 
        rx="8" 
        ry="1.2" 
        fill="rgba(58, 65, 58, 0.08)" 
        animate={{ rx: [8, 6, 8], opacity: [0.8, 0.4, 0.8] }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <g fill="none">
        {/* Child Guide SVG path data from Microsoft Fluent UI */}
        <path fill="url(#gradHair)" d="m25.63 6.195l-.35-.19h.86a.93.93 0 0 0 .88-1.222A4 4 0 0 0 23.21 2H12.38c-1.22 0-2.21.921-2.35 2.113l-.035.005q-.019.004-.035.005h-.44C5.92 4.123 3 7.046 3 10.65v2.903c0 .846.405 1.546 1.25 1.546h.58l-.93 2.919h1.276L5 19.515v4.245c0 2.35 1.91 4.26 4.26 4.26h1.04V18.019h11.42V28.02h1.04c2.35 0 4.26-1.91 4.26-4.26v-5.741h1.08l-.92-3.003h.53c.71 0 1.29-.58 1.29-1.291v-1.873a6.36 6.36 0 0 0-3.37-5.657"/>
        <path fill="url(#gradCheeks)" d="M4.618 15.1a3.25 3.25 0 1 0 1.196-.527l.036 1.334v.06L5.92 18c-.55 0-1-.43-1.02-.981L4.83 15.1zm21.574-.526a3.25 3.25 0 1 0 1.066.442h-.078l-.02.52l-.06 1.483c-.02.55-.47.981-1.02.981z"/>
        <path fill="url(#gradFace)" d="m5.815 13.773l.21 6.453c.24 5.852 4.634 9.784 9.975 9.784s9.735-3.932 9.974-9.784l.206-6.284a2.23 2.23 0 0 0-2.21-1.93H18.8a6.8 6.8 0 0 1-5.76-3.193a4.1 4.1 0 0 1-3.99 3.193H7.81a2.01 2.01 0 0 0-1.995 1.76"/>
        <path fill="url(#gradMouth)" d="M16.002 23.174a6.5 6.5 0 0 1-3.016-.733a.328.328 0 0 0-.429.472a4.1 4.1 0 0 0 3.445 1.887a4.1 4.1 0 0 0 3.445-1.887c.18-.281-.13-.622-.43-.472a6.35 6.35 0 0 1-3.015.733"/>
        <path fill="url(#gradTongue)" d="M15.993 22c.68 0 1.27-.345 1.63-.873c.32-.477-.02-1.127-.59-1.127h-2.07c-.57 0-.91.65-.59 1.127c.35.528.95.873 1.62.873"/>
        <path fill="#fff" d="M8.19 17.87a3.11 3.11 0 0 1 3.01-2.34c1.51 0 2.76 1.07 3.04 2.49c.06.31-.19.6-.51.6H8.79c-.4 0-.7-.37-.6-.75m15.64 0a3.11 3.11 0 0 0-3.01-2.34c-1.51 0-2.76 1.07-3.04 2.49c-.06.31.19.6.51.6h4.94c.4 0 .7-.37.6-.75"/>
        <path fill="#7D4533" d="M9.68 18.1c0-1.09.89-1.98 1.98-1.98a1.985 1.985 0 0 1 1.91 2.51H9.75c-.04-.17-.07-.35-.07-.53m12.66 0c0-1.09-.89-1.98-1.98-1.98a1.985 1.985 0 0 0-1.91 2.51h3.82c.04-.17.07-.35.07-.53"/>
        <path fill="#000" d="M11.66 16.97a1.13 1.13 0 0 1 1 1.66h-2a1.13 1.13 0 0 1 1-1.66m8.7 0a1.13 1.13 0 0 0-1 1.66h2a1.13 1.13 0 0 0-1-1.66"/>
        <path fill="#fff" d="M11.33 17.32a.35.35 0 1 1-.7 0a.35.35 0 0 1 .7 0m8.77 0a.35.35 0 1 1-.7 0a.35.35 0 0 1 .7 0"/>
        <path fill="url(#gradEyebrows)" d="M9.888 14.561c.521-.185 1.268-.326 2.255-.233a.5.5 0 1 0 .094-.996c-1.133-.107-2.026.052-2.685.287a.5.5 0 1 0 .336.942m12.58-.942c-.659-.235-1.552-.394-2.685-.287a.5.5 0 1 0 .094.996c.987-.093 1.734.048 2.255.233a.5.5 0 0 0 .336-.942"/>
      </g>
    </motion.svg>
  );
}
