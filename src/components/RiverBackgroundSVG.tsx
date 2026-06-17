"use client";

import React from "react";

export default function RiverBackgroundSVG() {
  return (
    <svg
      viewBox="0 0 400 600"
      className="absolute inset-0 w-full h-full pointer-events-none select-none z-0"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="none"
    >
      <defs>
        {/* Deep water gradient */}
        <linearGradient id="water-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#dbeafe" stopOpacity="0.9" />
          <stop offset="50%" stopColor="#bae6fd" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#dbeafe" stopOpacity="0.9" />
        </linearGradient>

        {/* Grassy shore gradients */}
        <linearGradient id="shore-gradient-left" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#87a97e" />
          <stop offset="70%" stopColor="#a7c4a0" />
          <stop offset="100%" stopColor="#7a9b71" />
        </linearGradient>

        <linearGradient id="shore-gradient-right" x1="100%" y1="0%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#87a97e" />
          <stop offset="70%" stopColor="#a7c4a0" />
          <stop offset="100%" stopColor="#7a9b71" />
        </linearGradient>

        {/* Floating leaf gradient */}
        <radialGradient id="leaf-gradient" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#81c784" />
          <stop offset="85%" stopColor="#4caf50" />
          <stop offset="100%" stopColor="#388e3c" />
        </radialGradient>

        {/* Mushroom cap gradient */}
        <linearGradient id="mushroom-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ff8a80" />
          <stop offset="100%" stopColor="#e53935" />
        </linearGradient>
      </defs>

      <style>{`
        /* Pulsating water sparkles */
        .sparkle {
          animation: pulse-sparkle 4s ease-in-out infinite;
          transform-origin: center;
        }
        @keyframes pulse-sparkle {
          0%, 100% { opacity: 0.2; transform: scale(0.8); }
          50% { opacity: 0.9; transform: scale(1.2); }
        }

        /* Drifting and bobbing leaves */
        .drifting-leaf-1 {
          animation: drift-1 25s linear infinite;
          transform-origin: center;
        }
        .drifting-leaf-2 {
          animation: drift-2 34s linear infinite;
          transform-origin: center;
        }

        @keyframes drift-1 {
          0% { transform: translate(80px, -40px) rotate(0deg); }
          25% { transform: translate(130px, 140px) rotate(90deg); }
          50% { transform: translate(90px, 310px) rotate(180deg); }
          75% { transform: translate(140px, 480px) rotate(270deg); }
          100% { transform: translate(80px, 640px) rotate(360deg); }
        }

        @keyframes drift-2 {
          0% { transform: translate(300px, -40px) rotate(45deg); }
          25% { transform: translate(250px, 160px) rotate(0deg); }
          50% { transform: translate(290px, 320px) rotate(-45deg); }
          75% { transform: translate(240px, 490px) rotate(-90deg); }
          100% { transform: translate(280px, 640px) rotate(-135deg); }
        }

        /* Wind sway for shore flowers and mushrooms */
        .sway-slow {
          animation: wind-sway-slow 5s ease-in-out infinite;
        }
        .sway-fast {
          animation: wind-sway-fast 3.5s ease-in-out infinite;
        }

        @keyframes wind-sway-slow {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(4deg); }
        }
        @keyframes wind-sway-fast {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(-5deg); }
        }
      `}</style>

      {/* Base Blue Water Canvas */}
      <rect width="400" height="600" fill="url(#water-gradient)" />

      {/* Wave Layer 1 (Back wave current) */}
      <path
        d="M -200 150 Q -150 135 -100 150 T 0 150 T 100 150 T 200 150 T 300 150 T 400 150 T 500 150 T 600 150 L 600 600 L -200 600 Z"
        fill="rgba(186, 230, 253, 0.4)"
      >
        <animateTransform
          attributeName="transform"
          type="translate"
          from="0,0"
          to="-200,0"
          dur="20s"
          repeatCount="indefinite"
        />
      </path>

      {/* Wave Layer 2 (Middle wave current) */}
      <path
        d="M -200 320 Q -150 305 -100 320 T 0 320 T 100 320 T 200 320 T 300 320 T 400 320 T 500 320 T 600 320 L 600 600 L -200 600 Z"
        fill="rgba(125, 211, 252, 0.25)"
      >
        <animateTransform
          attributeName="transform"
          type="translate"
          from="-200,0"
          to="0,0"
          dur="28s"
          repeatCount="indefinite"
        />
      </path>

      {/* Wave Layer 3 (Foreground wave current) */}
      <path
        d="M -200 460 Q -150 445 -100 460 T 0 460 T 100 460 T 200 460 T 300 460 T 400 460 T 500 460 T 600 460 L 600 600 L -200 600 Z"
        fill="rgba(224, 242, 254, 0.55)"
      >
        <animateTransform
          attributeName="transform"
          type="translate"
          from="0,0"
          to="-200,0"
          dur="15s"
          repeatCount="indefinite"
        />
      </path>

      {/* Drifting water lily leaves */}
      <g className="drifting-leaf-1">
        {/* A circle with a small pie slice cut out to look like a lily pad */}
        <path d="M 0 -12 A 12 12 0 1 1 -3 -11.6 L 0 0 Z" fill="url(#leaf-gradient)" opacity="0.65" />
        <line x1="0" y1="0" x2="-6" y2="-6" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
        <line x1="0" y1="0" x2="6" y2="6" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
        <line x1="0" y1="0" x2="-8" y2="4" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
      </g>

      <g className="drifting-leaf-2">
        <path d="M 0 -9 A 9 9 0 1 1 -2 -8.7 L 0 0 Z" fill="url(#leaf-gradient)" opacity="0.55" />
        <line x1="0" y1="0" x2="-4" y2="-4" stroke="rgba(255,255,255,0.2)" strokeWidth="0.8" />
        <line x1="0" y1="0" x2="4" y2="4" stroke="rgba(255,255,255,0.2)" strokeWidth="0.8" />
      </g>

      {/* Water Sparkle cross reflections */}
      <g className="sparkle" style={{ animationDelay: "0s" }}>
        <path d="M 150 120 L 150 130 M 145 125 L 155 125" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
        <path d="M 280 420 L 280 430 M 275 425 L 285 425" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
      </g>
      <g className="sparkle" style={{ animationDelay: "2s" }}>
        <path d="M 220 230 L 220 240 M 215 235 L 225 235" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
        <path d="M 90 480 L 90 490 M 85 485 L 95 485" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
      </g>

      {/* Organic Grassy Left Shore */}
      <path
        d="M 0 0 C 45 100, 52 200, 45 300 S 55 500, 48 600 L 0 600 Z"
        fill="url(#shore-gradient-left)"
        stroke="#4a5d43"
        strokeWidth="2"
      />

      {/* Organic Grassy Right Shore */}
      <path
        d="M 400 0 C 355 100, 348 200, 355 300 S 345 500, 352 600 L 400 600 Z"
        fill="url(#shore-gradient-right)"
        stroke="#4a5d43"
        strokeWidth="2"
      />

      {/* Swaying Flowers on Left Shore */}
      <g className="sway-slow" style={{ transformOrigin: "20px 140px" }}>
        {/* stem */}
        <line x1="20" y1="140" x2="20" y2="128" stroke="#4a5d43" strokeWidth="1.5" />
        {/* leaves */}
        <path d="M 20 135 Q 16 133 18 131" fill="none" stroke="#4a5d43" strokeWidth="1.2" />
        {/* flower head */}
        <circle cx="20" cy="125" r="3.5" fill="#fbcfe8" />
        <circle cx="20" cy="125" r="1.5" fill="#f87171" />
      </g>

      <g className="sway-fast" style={{ transformOrigin: "18px 450px" }}>
        <line x1="18" y1="450" x2="18" y2="436" stroke="#4a5d43" strokeWidth="1.5" />
        <circle cx="18" cy="433" r="4" fill="#fef08a" />
        <circle cx="18" cy="433" r="1.5" fill="#ca8a04" />
      </g>

      {/* Swaying Mushroom on Left Shore */}
      <g className="sway-slow" style={{ transformOrigin: "22px 290px" }}>
        {/* Stem */}
        <path d="M 20 290 Q 22 282 22 284" stroke="#e7ebd4" strokeWidth="3" fill="none" strokeLinecap="round" />
        {/* Cap */}
        <path d="M 16 284 C 16 278, 28 278, 28 284 Z" fill="url(#mushroom-gradient)" />
        {/* Dots */}
        <circle cx="20" cy="281" r="0.6" fill="#ffffff" />
        <circle cx="24" cy="283" r="0.6" fill="#ffffff" />
      </g>

      {/* Swaying Flowers on Right Shore */}
      <g className="sway-fast" style={{ transformOrigin: "380px 190px" }}>
        <line x1="380" y1="190" x2="380" y2="178" stroke="#4a5d43" strokeWidth="1.5" />
        <circle cx="380" cy="175" r="3.5" fill="#fbcfe8" />
        <circle cx="380" cy="175" r="1.5" fill="#f87171" />
      </g>

      <g className="sway-slow" style={{ transformOrigin: "382px 510px" }}>
        <line x1="382" y1="510" x2="382" y2="498" stroke="#4a5d43" strokeWidth="1.5" />
        <circle cx="382" cy="495" r="4" fill="#fef08a" />
        <circle cx="382" cy="495" r="1.5" fill="#ca8a04" />
      </g>

      {/* Swaying Mushroom on Right Shore */}
      <g className="sway-fast" style={{ transformOrigin: "378px 350px" }}>
        <path d="M 378 350 Q 376 342 376 344" stroke="#e7ebd4" strokeWidth="3" fill="none" strokeLinecap="round" />
        <path d="M 372 344 C 372 378, 384 378, 384 344 Z" fill="url(#mushroom-gradient)" />
        {/* Cap */}
        <path d="M 372 344 C 372 338, 384 338, 384 344 Z" fill="url(#mushroom-gradient)" />
        <circle cx="376" cy="341" r="0.6" fill="#ffffff" />
        <circle cx="380" cy="342" r="0.6" fill="#ffffff" />
      </g>

      {/* Grass Tufts on Shores */}
      <path d="M 25 80 Q 20 75 16 80 M 25 80 Q 23 70 25 68 M 25 80 Q 27 75 30 80" stroke="#4a5d43" strokeWidth="1.2" fill="none" strokeLinecap="round" />
      <path d="M 28 380 Q 23 375 20 380 M 28 380 Q 26 370 28 368 M 28 380 Q 30 375 33 380" stroke="#4a5d43" strokeWidth="1.2" fill="none" strokeLinecap="round" />
      <path d="M 375 120 Q 370 115 366 120 M 375 120 Q 373 110 375 108 M 375 120 Q 377 115 380 120" stroke="#4a5d43" strokeWidth="1.2" fill="none" strokeLinecap="round" />
      <path d="M 372 430 Q 367 425 363 430 M 372 430 Q 370 420 372 418 M 372 430 Q 374 425 377 430" stroke="#4a5d43" strokeWidth="1.2" fill="none" strokeLinecap="round" />
    </svg>
  );
}
