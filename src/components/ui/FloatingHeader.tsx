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
    <header className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 rounded-[1.75rem] bg-[#fffdf6]/95 backdrop-blur-md border-2 border-[#22313f]/10 shadow-[0_18px_42px_rgba(34,49,63,0.14),0_3px_0_rgba(34,49,63,0.12)] flex items-center justify-between transition-all duration-300 ${
      isParentView ? "w-[92%] max-w-5xl px-4 sm:px-6 py-3" : "w-fit px-5 sm:px-7 py-3"
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
            <div className="relative grid h-10 w-10 place-items-center rounded-2xl bg-primary shadow-[0_5px_0_#d28700,0_12px_18px_rgba(255,181,31,0.24)]">
              <img
                alt="Midday Logo"
                className="h-8 w-8 rounded-xl object-cover"
                src="/midday-sun-logo.png"
              />
            </div>
            <h1 className="font-display text-2xl sm:text-3xl text-[#22313f] tracking-normal font-extrabold leading-none">
              Midday
            </h1>
          </div>

          <div className="flex-1 flex items-center justify-end gap-3">
            <div className="bg-tertiary px-4 py-1.5 rounded-2xl flex items-center gap-1.5 border-2 border-[#22313f]/10 shadow-[0_4px_0_#d28700] select-none">
              <span className="text-[#593900] text-sm">⭐</span>
              <span className="font-sans font-black text-[#593900] text-xs sm:text-sm">
                {starsCount}
              </span>
            </div>
            <div className="w-9 h-9 rounded-2xl overflow-hidden bg-white border-2 border-[#22313f]/10 shadow-[0_5px_0_rgba(34,49,63,0.12)]">
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
          <div className="relative grid h-11 w-11 place-items-center rounded-2xl bg-primary shadow-[0_5px_0_#d28700,0_12px_18px_rgba(255,181,31,0.24)]">
            <img
              alt="Midday Logo"
              className="h-9 w-9 rounded-xl object-cover"
              src="/midday-sun-logo.png"
            />
          </div>
          <div className="flex flex-col items-start leading-none gap-0.5">
            <span className="font-display text-2xl sm:text-3xl text-[#22313f] tracking-normal font-extrabold">
              Midday
            </span>
            <span className="text-[8px] font-black uppercase tracking-[0.18em] text-[#f08a00]">
              Sunshine Lab
            </span>
          </div>
        </div>
      )}
    </header>
  );
}
