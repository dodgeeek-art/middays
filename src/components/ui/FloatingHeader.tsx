"use client";

import React from "react";
import { ArrowLeft } from "@/components/Icons";
import ClayButton from "./ClayButton";

interface FloatingHeaderProps {
  view: "lesson" | "dashboard" | "trophies";
  onBackToPlay: () => void;
  starsCount: number;
}

export default function FloatingHeader({
  view,
  onBackToPlay,
  starsCount,
}: FloatingHeaderProps) {
  const isParentView = view === "dashboard";

  return (
    <header className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 rounded-full bg-white/90 backdrop-blur-md border-[3px] border-white/50 shadow-[8px_8px_24px_rgba(0,0,0,0.06),_inset_-4px_-4px_8px_rgba(0,0,0,0.04),_inset_4px_4px_8px_rgba(255,255,255,0.95)] flex items-center justify-between transition-all duration-300 ${
      isParentView ? "w-[92%] max-w-5xl px-6 py-3.5" : "w-fit px-8 py-3.5"
    }`}>
      {isParentView ? (
        /* Parent Dashboard view of the Header */
        <>
          <div className="flex-1 flex justify-start">
            <ClayButton
              onClick={onBackToPlay}
              variant="surface"
              size="sm"
              className="gap-2 text-[10px] sm:text-xs py-2 px-4 shrink-0"
            >
              <ArrowLeft className="w-4 h-4 text-foreground" strokeWidth={3} />
              <span>Back to Play</span>
            </ClayButton>
          </div>

          <div className="flex items-center gap-2 select-none justify-center">
            <img
              alt="Midday Logo"
              className="w-8 h-8 object-contain"
              src="/logo.png"
            />
            <h1 className="font-sans text-xl sm:text-2xl text-primary tracking-tight font-black uppercase leading-none">
              Midday
            </h1>
          </div>

          <div className="flex-1 flex items-center justify-end gap-3">
            <div className="bg-primary-container/90 px-4 py-1.5 rounded-full flex items-center gap-1.5 border-2 border-white/30 shadow-[inset_2px_2px_4px_rgba(255,255,255,0.9),_inset_-2px_-2px_4px_rgba(0,0,0,0.04)] select-none">
              <span className="text-primary text-sm">⭐</span>
              <span className="font-sans font-black text-on-primary-container text-xs sm:text-sm">
                {starsCount}
              </span>
            </div>
            <div className="w-9 h-9 rounded-full overflow-hidden bg-white border-2 border-white/40 shadow-[4px_4px_8px_rgba(0,0,0,0.05)]">
              <img
                alt="Profile"
                className="w-full h-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCESvb79c9z_F-uxTvWJQj7b2OAsWvHLSRmS7Wk61CBgmb-avgjotarn7houGDxSUIoDyHoAPQe47i4qKI63TgAZpkX8RprWENpDz15eE7XBYBIO-kN548XDieebmWSlZhKz92Lr6-OppHauAcxYo88JWn4Duaj6cxDklFfftQNxp0UNUtlMt6XLZSAnEQ18Yf2_jMJwR3vqugORlqJ4wusdqKe7JnB44TEd2FekQeTJJecxxJNQgXXsr1GLyiQHgntTIhkfku8Ax7W"
              />
            </div>
          </div>
        </>
      ) : (
        /* Kids Play or Trophies view of the Header (Simplified: logo & branding only) */
        <div className="flex items-center gap-3 select-none">
          <div className="w-10 h-10 rounded-2xl overflow-hidden bg-white border-2 border-white/40 p-0.5 shadow-[4px_4px_8px_rgba(0,0,0,0.04)]">
            <img
              alt="Midday Logo"
              className="w-full h-full object-contain"
              src="/logo.png"
            />
          </div>
          <div className="flex flex-col items-start leading-none">
            <span className="font-sans text-xl sm:text-2xl text-primary tracking-tight font-black uppercase">
              Midday
            </span>
            <span className="text-[8px] font-black uppercase tracking-wider text-slate-dark/40">
              Playbook
            </span>
          </div>
        </div>
      )}
    </header>
  );
}
